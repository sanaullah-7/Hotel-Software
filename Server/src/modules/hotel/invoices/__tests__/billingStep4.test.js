import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import crypto from "crypto";
import app from "../../../../app.js";
import { connectPlatformDB, closePlatformDB } from "../../../../database/platform/platformConnection.js";
import { closeAllHotelConnections } from "../../../../database/connectionManager.js";
import { getHotelConnection } from "../../../../database/connectionManager.js";
import { getModel } from "../../../../database/hotel/modelFactory.js";

const randomEmail = (prefix = "bstep4") => `${prefix}_${crypto.randomBytes(4).toString("hex")}@hotel.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe("Phase 6 Step 4: Downstream Consolidation & Financial Integrity Hardening", () => {
  let adminTokenA, adminTokenB;
  let hotelA, hotelB;
  let guestA, guestB;
  let roomTypeA, roomTypeB;
  let reservationA, reservationB;
  let folioA;

  beforeAll(async () => {
    await connectPlatformDB();

    // 1. Setup Hotel A
    const emailA = randomEmail("adminA");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Step4 Admin A", email: emailA, phone: randomPhone(), password: "Password123!"
    });
    const loginA = await request(app).post("/api/v1/auth/login").send({ email: emailA, password: "Password123!" });
    const tempTokenA = loginA.body.data.accessToken;

    const onboardA = await request(app).post("/api/v1/provisioning/onboard").set("Authorization", `Bearer ${tempTokenA}`).send({
      property_name: "Step4 Grand Hotel", address: "400 Integrity Way", city: "Karachi"
    });
    hotelA = onboardA.body.data.hotelId;

    const reloginA = await request(app).post("/api/v1/auth/login").send({ email: emailA, password: "Password123!" });
    adminTokenA = reloginA.body.data.accessToken;

    const resRoomTypeA = await request(app).post("/api/v1/hotel/room-types").set("Authorization", `Bearer ${adminTokenA}`).send({
      name: "Deluxe Ocean View", code: `DO_${crypto.randomBytes(2).toString("hex").toUpperCase()}`, base_occupancy: 2, max_occupancy: 2, base_price: 250
    });
    roomTypeA = resRoomTypeA.body.data;

    await request(app).post("/api/v1/hotel/rooms").set("Authorization", `Bearer ${adminTokenA}`).send({
      room_number: `401_${crypto.randomBytes(2).toString("hex")}`, room_type_id: roomTypeA._id, floor: "4"
    });

    const resGuestA = await request(app).post("/api/v1/hotel/guests").set("Authorization", `Bearer ${adminTokenA}`).send({
      first_name: "Bruce", last_name: "Wayne", email: randomEmail("bruce"), phone: randomPhone()
    });
    guestA = resGuestA.body.data;

    const inDateA = new Date();
    inDateA.setDate(inDateA.getDate() + 2);
    const outDateA = new Date();
    outDateA.setDate(outDateA.getDate() + 5);

    const resResA = await request(app).post("/api/v1/hotel/reservations").set("Authorization", `Bearer ${adminTokenA}`).send({
      primary_guest_id: guestA._id,
      expected_check_in: inDateA.toISOString(),
      expected_check_out: outDateA.toISOString(),
      room_type_id: roomTypeA._id,
      adults: 2,
    });
    reservationA = resResA.body.data.reservation;

    // Resolve Folio for Reservation A
    const resFolioA = await request(app)
      .post("/api/v1/hotel/folios")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({ reservation_id: reservationA._id });
    folioA = resFolioA.body.data;

    // Sync indexes on tenant A
    const FolioModelA = await getModel(hotelA, "Folio");
    await FolioModelA.syncIndexes();

    // 2. Setup Hotel B (Tenant Isolation)
    const emailB = randomEmail("adminB");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Step4 Admin B", email: emailB, phone: randomPhone(), password: "Password123!"
    });
    const loginB = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "Password123!" });
    const tempTokenB = loginB.body.data.accessToken;

    const onboardB = await request(app).post("/api/v1/provisioning/onboard").set("Authorization", `Bearer ${tempTokenB}`).send({
      property_name: "Step4 Competitor Hotel", address: "500 Rival Rd", city: "Islamabad"
    });
    hotelB = onboardB.body.data.hotelId;

    const reloginB = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "Password123!" });
    adminTokenB = reloginB.body.data.accessToken;

    const resRoomTypeB = await request(app).post("/api/v1/hotel/room-types").set("Authorization", `Bearer ${adminTokenB}`).send({
      name: "Rival Room", code: `RR_${crypto.randomBytes(2).toString("hex").toUpperCase()}`, base_occupancy: 2, max_occupancy: 2, base_price: 200
    });
    roomTypeB = resRoomTypeB.body.data;

    const resGuestB = await request(app).post("/api/v1/hotel/guests").set("Authorization", `Bearer ${adminTokenB}`).send({
      first_name: "Clark", last_name: "Kent", email: randomEmail("clark"), phone: randomPhone()
    });
    guestB = resGuestB.body.data;
  }, 35000);

  afterAll(async () => {
    await closeAllHotelConnections();
    await closePlatformDB();
  });

  // =========================================================================
  // PART A — REFUND FINANCIAL INTEGRITY & CONCURRENCY
  // =========================================================================
  describe("Part A: Refund Financial Integrity & Concurrency", () => {
    it("Case 1: Concurrent partial refunds: only one may consume available balance ($100 payment, two $80 refunds)", async () => {
      // 1. Create an invoice of $100 and record a $100 payment
      const invRes = await request(app)
        .post("/api/v1/hotel/invoices")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          folio_id: folioA._id,
          line_items: [{ description: "Conc Room Charge", amount: 100 }],
        });
      expect(invRes.status).toBe(201);
      const invoice = invRes.body.data;

      const payRes = await request(app)
        .post("/api/v1/hotel/payments")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          invoice_id: invoice._id,
          amount: 100,
          payment_method: "CREDIT_CARD",
        });
      expect(payRes.status).toBe(201);
      const payment = payRes.body.data;

      // 2. Fire two simultaneous $80 refund requests
      const [res1, res2] = await Promise.all([
        request(app)
          .post("/api/v1/hotel/refunds")
          .set("Authorization", `Bearer ${adminTokenA}`)
          .send({ payment_id: payment._id, amount: 80, reason: "Concurrent Refund Request 1" }),
        request(app)
          .post("/api/v1/hotel/refunds")
          .set("Authorization", `Bearer ${adminTokenA}`)
          .send({ payment_id: payment._id, amount: 80, reason: "Concurrent Refund Request 2" }),
      ]);

      const statuses = [res1.status, res2.status];
      // Exactly one must succeed (201) and one must be rejected (409 Conflict)
      expect(statuses).toContain(201);
      expect(statuses).toContain(409);

      // Verify payment refunded_amount in database
      const Payment = await getModel(hotelA, "Payment");
      const updatedPay = await Payment.findById(payment._id);
      expect(updatedPay.refunded_amount).toBe(80);
      expect(updatedPay.status).toBe("COMPLETED");

      // Verify invoice amount_paid is exactly 20 (100 - 80)
      const Invoice = await getModel(hotelA, "Invoice");
      const updatedInv = await Invoice.findById(invoice._id);
      expect(updatedInv.amount_paid).toBe(20);
      expect(updatedInv.status).toBe("PARTIALLY_PAID");
    });

    it("Case 2: Concurrent exact refunds ($100 payment, two $100 refunds): exactly one succeeds", async () => {
      // Create invoice and payment of $100
      const invRes = await request(app)
        .post("/api/v1/hotel/invoices")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          folio_id: folioA._id,
          line_items: [{ description: "Exact Test Charge", amount: 100 }],
        });
      const invoice = invRes.body.data;

      const payRes = await request(app)
        .post("/api/v1/hotel/payments")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          invoice_id: invoice._id,
          amount: 100,
          payment_method: "CASH",
        });
      const payment = payRes.body.data;

      // Fire two concurrent $100 refunds
      const [res1, res2] = await Promise.all([
        request(app)
          .post("/api/v1/hotel/refunds")
          .set("Authorization", `Bearer ${adminTokenA}`)
          .send({ payment_id: payment._id, amount: 100, reason: "Exact Refund A" }),
        request(app)
          .post("/api/v1/hotel/refunds")
          .set("Authorization", `Bearer ${adminTokenA}`)
          .send({ payment_id: payment._id, amount: 100, reason: "Exact Refund B" }),
      ]);

      const statuses = [res1.status, res2.status];
      expect(statuses).toContain(201);
      expect(statuses).toContain(409);

      const Payment = await getModel(hotelA, "Payment");
      const updatedPay = await Payment.findById(payment._id);
      expect(updatedPay.refunded_amount).toBe(100);
      expect(updatedPay.status).toBe("REFUNDED");
    });

    it("Case 3: Sequential refunds ($40 then $60): both succeed, payment becomes REFUNDED", async () => {
      const invRes = await request(app)
        .post("/api/v1/hotel/invoices")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          folio_id: folioA._id,
          line_items: [{ description: "Sequential Charge", amount: 100 }],
        });
      const invoice = invRes.body.data;

      const payRes = await request(app)
        .post("/api/v1/hotel/payments")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          invoice_id: invoice._id,
          amount: 100,
          payment_method: "BANK_TRANSFER",
        });
      const payment = payRes.body.data;

      // First refund: $40
      const ref1 = await request(app)
        .post("/api/v1/hotel/refunds")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ payment_id: payment._id, amount: 40, reason: "Sequential Part 1" });
      expect(ref1.status).toBe(201);

      // Second refund: $60
      const ref2 = await request(app)
        .post("/api/v1/hotel/refunds")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ payment_id: payment._id, amount: 60, reason: "Sequential Part 2" });
      expect(ref2.status).toBe(201);

      const PaymentModel = await getModel(hotelA, "Payment");
      const finalPay = await PaymentModel.findById(payment._id);
      expect(finalPay.refunded_amount).toBe(100);
      expect(finalPay.status).toBe("REFUNDED");

      // Third refund must fail with 409
      const ref3 = await request(app)
        .post("/api/v1/hotel/refunds")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ payment_id: payment._id, amount: 10, reason: "Should fail" });
      expect(ref3.status).toBe(409);
    });
  });

  // =========================================================================
  // PART B — GUEST CHARGES CONTRACT & COMPATIBILITY
  // =========================================================================
  describe("Part B: Guest Charges Contract & Compatibility", () => {
    it("Accepts both canonical types and extended charge types (ROOM_SERVICE, PARKING, MISCELLANEOUS)", async () => {
      const typesToTest = [
        "ROOM_RATE", "RESTAURANT", "SPA", "MINIBAR", "LAUNDRY",
        "OTHER_SERVICE", "TAX", "FEE", "ROOM_SERVICE", "PARKING", "MISCELLANEOUS"
      ];

      for (const ct of typesToTest) {
        const res = await request(app)
          .post("/api/v1/hotel/guest-charges")
          .set("Authorization", `Bearer ${adminTokenA}`)
          .send({
            folio_id: folioA._id,
            charge_type: ct,
            description: `Testing Charge Type ${ct}`,
            amount: 25.5,
          });
        expect(res.status).toBe(201);
        expect(res.body.data.charge_type).toBe(ct);
      }
    });

    it("Rejects unsupported charge types", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/guest-charges")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          folio_id: folioA._id,
          charge_type: "INVALID_CRYPTO_FEE",
          description: "Bad Type",
          amount: 50,
        });
      expect(res.status).toBe(400);
    });

    it("Filters guest charges by guest_id", async () => {
      const res = await request(app)
        .get(`/api/v1/hotel/guest-charges?guest_id=${guestA._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // PART C — DASHBOARD DUES & BACKEND FOLIO BALANCE
  // =========================================================================
  describe("Part C: Dashboard Dues & Backend Folio Balance", () => {
    it("Reservation list and detail endpoints return authoritative folio_balance and dues", async () => {
      // 1. Check reservation list
      const listRes = await request(app)
        .get("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(listRes.status).toBe(200);
      expect(Array.isArray(listRes.body.data)).toBe(true);
      const resItem = listRes.body.data.find(r => r._id === reservationA._id);
      expect(resItem).toBeDefined();
      expect(resItem.folio_balance).toBeDefined();
      expect(resItem.dues).toBeDefined();

      // 2. Check reservation detail
      const detailRes = await request(app)
        .get(`/api/v1/hotel/reservations/${reservationA._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(detailRes.status).toBe(200);
      expect(detailRes.body.data.folio_balance).toBeDefined();
      expect(detailRes.body.data.dues).toBe(detailRes.body.data.folio_balance);
    });

    it("Scenario: Invoice $500 -> Payment $200 -> Dues = $300 -> Payment $300 -> Dues = $0 -> Refund $100 -> Dues = $100", async () => {
      // Create dedicated reservation
      const inDate = new Date(); inDate.setDate(inDate.getDate() + 10);
      const outDate = new Date(); outDate.setDate(outDate.getDate() + 12);
      const resRes = await request(app).post("/api/v1/hotel/reservations").set("Authorization", `Bearer ${adminTokenA}`).send({
        primary_guest_id: guestA._id,
        expected_check_in: inDate.toISOString(),
        expected_check_out: outDate.toISOString(),
        room_type_id: roomTypeA._id,
        adults: 1,
      });
      const resObj = resRes.body.data.reservation;

      // Get/Create Folio
      const fRes = await request(app)
        .post("/api/v1/hotel/folios")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ reservation_id: resObj._id });
      const folio = fRes.body.data;

      // Create $500 invoice
      const invRes = await request(app)
        .post("/api/v1/hotel/invoices")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          folio_id: folio._id,
          line_items: [{ description: "Stay Package", amount: 500 }],
        });
      const invoice = invRes.body.data;

      // Verify dues is $500
      let check = await request(app).get(`/api/v1/hotel/reservations/${resObj._id}`).set("Authorization", `Bearer ${adminTokenA}`);
      expect(check.body.data.dues).toBe(500);

      // Record partial payment $200
      const pay1 = await request(app).post("/api/v1/hotel/payments").set("Authorization", `Bearer ${adminTokenA}`).send({
        invoice_id: invoice._id,
        amount: 200,
        payment_method: "CASH",
      });
      expect(pay1.status).toBe(201);

      // Verify dues is $300
      check = await request(app).get(`/api/v1/hotel/reservations/${resObj._id}`).set("Authorization", `Bearer ${adminTokenA}`);
      expect(check.body.data.dues).toBe(300);

      // Record final payment $300
      const pay2 = await request(app).post("/api/v1/hotel/payments").set("Authorization", `Bearer ${adminTokenA}`).send({
        invoice_id: invoice._id,
        amount: 300,
        payment_method: "CREDIT_CARD",
      });
      expect(pay2.status).toBe(201);

      // Verify dues is $0
      check = await request(app).get(`/api/v1/hotel/reservations/${resObj._id}`).set("Authorization", `Bearer ${adminTokenA}`);
      expect(check.body.data.dues).toBe(0);

      // Process refund $100 against payment 2
      const ref = await request(app).post("/api/v1/hotel/refunds").set("Authorization", `Bearer ${adminTokenA}`).send({
        payment_id: pay2.body.data._id,
        amount: 100,
        reason: "Adjustment refund",
      });
      expect(ref.status).toBe(201);

      // Verify dues reopens to $100
      check = await request(app).get(`/api/v1/hotel/reservations/${resObj._id}`).set("Authorization", `Bearer ${adminTokenA}`);
      expect(check.body.data.dues).toBe(100);
    });
  });

  // =========================================================================
  // PART D — GUEST PROFILE BILLING & TENANT ISOLATION
  // =========================================================================
  describe("Part D: Guest Profile Billing & Tenant Isolation", () => {
    it("Invoices, payments, and guest charges query correctly by guest_id", async () => {
      // Query invoices for guestA
      const invs = await request(app)
        .get(`/api/v1/hotel/invoices?guest_id=${guestA._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(invs.status).toBe(200);
      expect(Array.isArray(invs.body.data)).toBe(true);

      // Query payments for guestA
      const pays = await request(app)
        .get(`/api/v1/hotel/payments?guest_id=${guestA._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(pays.status).toBe(200);
      expect(Array.isArray(pays.body.data)).toBe(true);

      // Query guest charges for guestA
      const chgs = await request(app)
        .get(`/api/v1/hotel/guest-charges?guest_id=${guestA._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(chgs.status).toBe(200);
      expect(Array.isArray(chgs.body.data)).toBe(true);
    });

    it("Tenant B cannot access Tenant A's reservations, folios, or dues (404)", async () => {
      const res = await request(app)
        .get(`/api/v1/hotel/reservations/${reservationA._id}`)
        .set("Authorization", `Bearer ${adminTokenB}`);
      expect(res.status).toBe(404);

      const fRes = await request(app)
        .get(`/api/v1/hotel/folios/${folioA._id}`)
        .set("Authorization", `Bearer ${adminTokenB}`);
      expect(fRes.status).toBe(404);
    });
  });
});
