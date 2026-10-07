import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import crypto from "crypto";
import app from "../../../../app.js";
import { connectPlatformDB, closePlatformDB } from "../../../../database/platform/platformConnection.js";
import { closeAllHotelConnections } from "../../../../database/connectionManager.js";
import { getHotelConnection } from "../../../../database/connectionManager.js";
import { getModel } from "../../../../database/hotel/modelFactory.js";
import { recalculateFolioBalance } from "../../folios/folio.service.js";

const randomEmail = (prefix = "bstep3") => `${prefix}_${crypto.randomBytes(4).toString("hex")}@hotel.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe("Phase 6 Step 3: Financial Integrity, Concurrency, Refunds & Guest Charges", () => {
  let adminTokenA, adminTokenB;
  let hotelA, hotelB;
  let guestA, guestB;
  let roomTypeA, roomTypeB;
  let reservationA, reservationB;

  beforeAll(async () => {
    await connectPlatformDB();

    // 1. Setup Hotel A
    const emailA = randomEmail("adminA");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Step3 Admin A", email: emailA, phone: randomPhone(), password: "Password123!"
    });
    const loginA = await request(app).post("/api/v1/auth/login").send({ email: emailA, password: "Password123!" });
    const tempTokenA = loginA.body.data.accessToken;

    const onboardA = await request(app).post("/api/v1/provisioning/onboard").set("Authorization", `Bearer ${tempTokenA}`).send({
      property_name: "Step3 Grand Hotel", address: "100 Integrity Blvd", city: "Lahore"
    });
    hotelA = onboardA.body.data.hotelId;

    const reloginA = await request(app).post("/api/v1/auth/login").send({ email: emailA, password: "Password123!" });
    adminTokenA = reloginA.body.data.accessToken;

    const resRoomTypeA = await request(app).post("/api/v1/hotel/room-types").set("Authorization", `Bearer ${adminTokenA}`).send({
      name: "Executive Suite", code: `EX_${crypto.randomBytes(2).toString("hex").toUpperCase()}`, base_occupancy: 2, max_occupancy: 2, base_price: 300
    });
    roomTypeA = resRoomTypeA.body.data;

    await request(app).post("/api/v1/hotel/rooms").set("Authorization", `Bearer ${adminTokenA}`).send({
      room_number: `201_${crypto.randomBytes(2).toString("hex")}`, room_type_id: roomTypeA._id, floor: "2"
    });

    const resGuestA = await request(app).post("/api/v1/hotel/guests").set("Authorization", `Bearer ${adminTokenA}`).send({
      first_name: "Alice", last_name: "Smith", email: randomEmail("alice"), phone: randomPhone()
    });
    guestA = resGuestA.body.data;

    const inDateA = new Date();
    inDateA.setDate(inDateA.getDate() + 5);
    const outDateA = new Date();
    outDateA.setDate(outDateA.getDate() + 8);

    const resResA = await request(app).post("/api/v1/hotel/reservations").set("Authorization", `Bearer ${adminTokenA}`).send({
      primary_guest_id: guestA._id,
      room_type_id: roomTypeA._id,
      expected_check_in: inDateA.toISOString(),
      expected_check_out: outDateA.toISOString(),
      adults: 2
    });
    reservationA = resResA.body.data.reservation;

    // 2. Setup Hotel B (cross-tenant verification)
    const emailB = randomEmail("adminB");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Step3 Admin B", email: emailB, phone: randomPhone(), password: "Password123!"
    });
    const loginB = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "Password123!" });
    const tempTokenB = loginB.body.data.accessToken;

    const onboardB = await request(app).post("/api/v1/provisioning/onboard").set("Authorization", `Bearer ${tempTokenB}`).send({
      property_name: "Step3 Rival Hotel", address: "200 Rival Way", city: "Karachi"
    });
    hotelB = onboardB.body.data.hotelId;

    const reloginB = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "Password123!" });
    adminTokenB = reloginB.body.data.accessToken;

    const resRoomTypeB = await request(app).post("/api/v1/hotel/room-types").set("Authorization", `Bearer ${adminTokenB}`).send({
      name: "Standard Room", code: `STD_${crypto.randomBytes(2).toString("hex").toUpperCase()}`, base_occupancy: 2, max_occupancy: 2, base_price: 150
    });
    roomTypeB = resRoomTypeB.body.data;

    const resGuestB = await request(app).post("/api/v1/hotel/guests").set("Authorization", `Bearer ${adminTokenB}`).send({
      first_name: "Bob", last_name: "Rival", email: randomEmail("bob"), phone: randomPhone()
    });
    guestB = resGuestB.body.data;

    const inDateB = new Date();
    inDateB.setDate(inDateB.getDate() + 2);
    const outDateB = new Date();
    outDateB.setDate(outDateB.getDate() + 4);

    const resResB = await request(app).post("/api/v1/hotel/reservations").set("Authorization", `Bearer ${adminTokenB}`).send({
      primary_guest_id: guestB._id,
      room_type_id: roomTypeB._id,
      expected_check_in: inDateB.toISOString(),
      expected_check_out: outDateB.toISOString(),
      adults: 1
    });
    reservationB = resResB.body.data.reservation;

    // Ensure database indexes are ready on hotel connections
    const FolioA = await getModel(hotelA, "Folio");
    await FolioA.syncIndexes();
  });

  afterAll(async () => {
    await closeAllHotelConnections();
    await closePlatformDB();
  });

  describe("1. Folio Concurrency & Idempotency", () => {
    it("guarantees exactly ONE OPEN folio per reservation under concurrent requests", async () => {
      // Create a fresh reservation specifically to test concurrency
      const inDate = new Date();
      inDate.setDate(inDate.getDate() + 20);
      const outDate = new Date();
      outDate.setDate(outDate.getDate() + 22);

      const resRes = await request(app).post("/api/v1/hotel/reservations").set("Authorization", `Bearer ${adminTokenA}`).send({
        primary_guest_id: guestA._id,
        room_type_id: roomTypeA._id,
        expected_check_in: inDate.toISOString(),
        expected_check_out: outDate.toISOString(),
        adults: 1
      });
      const freshRes = resRes.body.data.reservation;

      // Fire 8 simultaneous requests to create/get a folio for this reservation
      const concurrencyCount = 8;
      const requests = Array.from({ length: concurrencyCount }, () =>
        request(app)
          .post("/api/v1/hotel/folios")
          .set("Authorization", `Bearer ${adminTokenA}`)
          .send({ reservation_id: freshRes._id })
      );

      const results = await Promise.all(requests);

      // Verify all callers got a successful 201 response
      results.forEach((res) => {
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
        expect(res.body.data._id).toBeDefined();
      });

      // Verify all callers received the exact same Folio ID
      const firstFolioId = results[0].body.data._id;
      results.forEach((res) => {
        expect(res.body.data._id).toBe(firstFolioId);
      });

      // Directly verify the database has exactly 1 folio for this reservation
      const Folio = await getModel(hotelA, "Folio");
      const dbFolios = await Folio.find({ reservation_id: freshRes._id });
      expect(dbFolios.length).toBe(1);
      expect(String(dbFolios[0]._id)).toBe(firstFolioId);
    });
  });

  describe("2. Folio Balance Integrity across Lifecycle", () => {
    let testFolioId;
    let testInvoiceId;
    let testPaymentId;

    it("verifies folio balance increases on invoice creation", async () => {
      // Resolve folio for reservationA
      const folioRes = await request(app)
        .post("/api/v1/hotel/folios")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ reservation_id: reservationA._id });

      expect(folioRes.status).toBe(201);
      testFolioId = folioRes.body.data._id;
      expect(folioRes.body.data.balance).toBe(0);

      // Create invoice for 1000 PKR
      const invRes = await request(app)
        .post("/api/v1/hotel/invoices")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          folio_id: testFolioId,
          guest_id: guestA._id,
          line_items: [
            { description: "Room Charge 3 Nights", amount: 900, tax_amount: 100 }
          ]
        });

      expect(invRes.status).toBe(201);
      testInvoiceId = invRes.body.data._id;
      expect(invRes.body.data.total_amount).toBe(1000);
      expect(invRes.body.data.amount_paid).toBe(0);
      expect(invRes.body.data.status).toBe("UNPAID");

      // Verify Folio balance increased to 1000
      const checkFolio = await request(app)
        .get(`/api/v1/hotel/folios/${testFolioId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(checkFolio.body.data.balance).toBe(1000);

      // Verify reconciliation utility matches
      const reconciled = await recalculateFolioBalance(hotelA, testFolioId);
      expect(reconciled.balance).toBe(1000);
    });

    it("verifies folio balance decreases on partial payment", async () => {
      const payRes = await request(app)
        .post("/api/v1/hotel/payments")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          invoice_id: testInvoiceId,
          amount: 400,
          payment_method: "CREDIT_CARD",
          transaction_id: "TX-PARTIAL-400"
        });

      expect(payRes.status).toBe(201);
      testPaymentId = payRes.body.data._id;
      expect(payRes.body.data.amount).toBe(400);
      expect(payRes.body.data.status).toBe("COMPLETED");

      // Invoice status becomes PARTIALLY_PAID
      const checkInv = await request(app)
        .get(`/api/v1/hotel/invoices/${testInvoiceId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(checkInv.body.data.amount_paid).toBe(400);
      expect(checkInv.body.data.status).toBe("PARTIALLY_PAID");

      // Folio balance decreases to 600
      const checkFolio = await request(app)
        .get(`/api/v1/hotel/folios/${testFolioId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(checkFolio.body.data.balance).toBe(600);

      // Reconciliation matches 600
      const reconciled = await recalculateFolioBalance(hotelA, testFolioId);
      expect(reconciled.balance).toBe(600);
    });

    it("rejects overpayment exceeding remaining invoice balance", async () => {
      const overpayRes = await request(app)
        .post("/api/v1/hotel/payments")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          invoice_id: testInvoiceId,
          amount: 700, // Remaining is 600
          payment_method: "CASH"
        });

      expect(overpayRes.status).toBe(409);
      expect(overpayRes.body.error?.message || overpayRes.body.message).toMatch(/exceeds remaining invoice balance/i);
    });

    it("verifies final payment reduces folio balance to zero and marks invoice PAID", async () => {
      const finalPay = await request(app)
        .post("/api/v1/hotel/payments")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          invoice_id: testInvoiceId,
          amount: 600,
          payment_method: "CASH"
        });

      expect(finalPay.status).toBe(201);

      // Invoice status becomes PAID
      const checkInv = await request(app)
        .get(`/api/v1/hotel/invoices/${testInvoiceId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(checkInv.body.data.amount_paid).toBe(1000);
      expect(checkInv.body.data.status).toBe("PAID");

      // Folio balance reaches 0
      const checkFolio = await request(app)
        .get(`/api/v1/hotel/folios/${testFolioId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(checkFolio.body.data.balance).toBe(0);

      // Reconciliation matches 0
      const reconciled = await recalculateFolioBalance(hotelA, testFolioId);
      expect(reconciled.balance).toBe(0);
    });

    it("rejects any additional payment against a fully paid invoice", async () => {
      const extraPay = await request(app)
        .post("/api/v1/hotel/payments")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          invoice_id: testInvoiceId,
          amount: 50,
          payment_method: "CASH"
        });

      expect(extraPay.status).toBe(409);
      expect(extraPay.body.error?.message || extraPay.body.message).toMatch(/already fully paid/i);
    });
  });

  describe("3. Refunds Backend Implementation & Accounting", () => {
    let refundPaymentId;
    let refundInvoiceId;
    let refundFolioId;

    beforeAll(async () => {
      // Create dedicated folio, invoice (500 PKR), and payment (500 PKR) for refund tests
      const resFolio = await request(app)
        .post("/api/v1/hotel/folios")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ guest_id: guestA._id });
      refundFolioId = resFolio.body.data._id;

      const resInv = await request(app)
        .post("/api/v1/hotel/invoices")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          folio_id: refundFolioId,
          guest_id: guestA._id,
          line_items: [{ description: "Spa Package", amount: 500, tax_amount: 0 }]
        });
      refundInvoiceId = resInv.body.data._id;

      const resPay = await request(app)
        .post("/api/v1/hotel/payments")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          invoice_id: refundInvoiceId,
          amount: 500,
          payment_method: "CREDIT_CARD"
        });
      refundPaymentId = resPay.body.data._id;
    });

    it("rejects refund for non-existent payment with 404", async () => {
      const fakeId = "60c72b2f9b1d8b2bad000001";
      const res = await request(app)
        .post("/api/v1/hotel/refunds")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          payment_id: fakeId,
          amount: 100,
          reason: "Customer complaint"
        });

      expect(res.status).toBe(404);
      expect(res.body.error?.message || res.body.message).toMatch(/payment not found/i);
    });

    it("rejects cross-tenant refund access (Tenant B cannot refund Tenant A payment)", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/refunds")
        .set("Authorization", `Bearer ${adminTokenB}`)
        .send({
          payment_id: refundPaymentId,
          amount: 100,
          reason: "Cross tenant attempt"
        });

      expect(res.status).toBe(404);
      expect(res.body.error?.message || res.body.message).toMatch(/payment not found/i);
    });

    it("processes a valid partial refund and maintains accounting invariant", async () => {
      // Refund 200 PKR of the 500 PKR payment
      const res = await request(app)
        .post("/api/v1/hotel/refunds")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          payment_id: refundPaymentId,
          amount: 200,
          reason: "Guest requested partial spa refund"
        });

      expect(res.status).toBe(201);
      expect(res.body.data.refund_ref).toMatch(/^REF-/);
      expect(res.body.data.amount).toBe(200);
      expect(res.body.data.status).toBe("PROCESSED");

      // Verify invoice amount_paid decreased from 500 to 300, status reopened to PARTIALLY_PAID
      const checkInv = await request(app)
        .get(`/api/v1/hotel/invoices/${refundInvoiceId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(checkInv.body.data.amount_paid).toBe(300);
      expect(checkInv.body.data.status).toBe("PARTIALLY_PAID");

      // Verify Folio balance increased by 200 (from 0 to 200)
      const checkFolio = await request(app)
        .get(`/api/v1/hotel/folios/${refundFolioId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(checkFolio.body.data.balance).toBe(200);

      // Verify reconciliation matches 200 (500 total - 300 paid = 200 outstanding)
      const reconciled = await recalculateFolioBalance(hotelA, refundFolioId);
      expect(reconciled.balance).toBe(200);
    });

    it("rejects over-refund exceeding refundable balance", async () => {
      // Already refunded 200 from 500. Remaining refundable is 300.
      // Attempting to refund 350 must fail.
      const res = await request(app)
        .post("/api/v1/hotel/refunds")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          payment_id: refundPaymentId,
          amount: 350,
          reason: "Excessive refund"
        });

      expect(res.status).toBe(409);
      expect(res.body.error?.message || res.body.message).toMatch(/exceeds refundable payment balance/i);
    });

    it("completes full refund of remaining balance and updates payment status to REFUNDED", async () => {
      // Refund remaining 300 PKR
      const res = await request(app)
        .post("/api/v1/hotel/refunds")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          payment_id: refundPaymentId,
          amount: 300,
          reason: "Remaining refund"
        });

      expect(res.status).toBe(201);
      expect(res.body.data.amount).toBe(300);

      // Payment status becomes REFUNDED
      const checkPay = await request(app)
        .get(`/api/v1/hotel/payments/${refundPaymentId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(checkPay.body.data.status).toBe("REFUNDED");

      // Invoice status becomes UNPAID and amount_paid becomes 0
      const checkInv = await request(app)
        .get(`/api/v1/hotel/invoices/${refundInvoiceId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(checkInv.body.data.amount_paid).toBe(0);
      expect(checkInv.body.data.status).toBe("UNPAID");

      // Folio balance increases to 500
      const checkFolio = await request(app)
        .get(`/api/v1/hotel/folios/${refundFolioId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(checkFolio.body.data.balance).toBe(500);

      // Reconciliation matches 500
      const reconciled = await recalculateFolioBalance(hotelA, refundFolioId);
      expect(reconciled.balance).toBe(500);
    });

    it("lists refunds with pagination and filtering", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/refunds")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.refunds.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data.pagination).toBeDefined();
    });

    it("retrieves refund by ID with populated payment info", async () => {
      const list = await request(app)
        .get("/api/v1/hotel/refunds")
        .set("Authorization", `Bearer ${adminTokenA}`);
      const refundId = list.body.data.refunds[0]._id;

      const res = await request(app)
        .get(`/api/v1/hotel/refunds/${refundId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(refundId);
      expect(res.body.data.payment_id).toBeDefined();
      expect(res.body.data.payment_id.guest_id).toBeDefined();
    });

    it("rejects cross-tenant refund read (Tenant B cannot read Tenant A refund)", async () => {
      const list = await request(app)
        .get("/api/v1/hotel/refunds")
        .set("Authorization", `Bearer ${adminTokenA}`);
      const refundId = list.body.data.refunds[0]._id;

      const res = await request(app)
        .get(`/api/v1/hotel/refunds/${refundId}`)
        .set("Authorization", `Bearer ${adminTokenB}`);

      expect(res.status).toBe(404);
    });
  });

  describe("4. Guest Charges Verification & Cross-Tenant Isolation", () => {
    let chargeFolioId;
    let testChargeId;

    beforeAll(async () => {
      const resFolio = await request(app)
        .post("/api/v1/hotel/folios")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ guest_id: guestA._id });
      chargeFolioId = resFolio.body.data._id;
    });

    it("creates a guest charge on a valid folio", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/guest-charges")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          folio_id: chargeFolioId,
          charge_type: "MINIBAR",
          description: "Premium beverage & snacks",
          amount: 75
        });

      expect(res.status).toBe(201);
      testChargeId = res.body.data._id;
      expect(res.body.data.charge_type).toBe("MINIBAR");
      expect(res.body.data.amount).toBe(75);
      expect(res.body.data.is_voided).toBe(false);
    });

    it("prevents cross-tenant creation against another tenant's folio", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/guest-charges")
        .set("Authorization", `Bearer ${adminTokenB}`)
        .send({
          folio_id: chargeFolioId,
          charge_type: "SPA",
          description: "Unauthorized charge",
          amount: 150
        });

      expect(res.status).toBe(404);
    });

    it("voids a guest charge and prevents double-voiding", async () => {
      const voidRes = await request(app)
        .patch(`/api/v1/hotel/guest-charges/${testChargeId}/void`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(voidRes.status).toBe(200);
      expect(voidRes.body.data.is_voided).toBe(true);

      // Attempt double-void -> 409 Conflict
      const secondVoid = await request(app)
        .patch(`/api/v1/hotel/guest-charges/${testChargeId}/void`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(secondVoid.status).toBe(409);
      expect(secondVoid.body.error?.message || secondVoid.body.message).toMatch(/already voided/i);
    });

    it("prevents cross-tenant voiding (Tenant B cannot void Tenant A charge)", async () => {
      const res = await request(app)
        .patch(`/api/v1/hotel/guest-charges/${testChargeId}/void`)
        .set("Authorization", `Bearer ${adminTokenB}`);

      expect(res.status).toBe(404);
    });
  });
});
