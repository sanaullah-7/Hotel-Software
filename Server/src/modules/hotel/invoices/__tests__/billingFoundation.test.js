import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import crypto from "crypto";
import app from "../../../../app.js";
import { connectPlatformDB, closePlatformDB } from "../../../../database/platform/platformConnection.js";
import { closeAllHotelConnections } from "../../../../database/connectionManager.js";

const randomEmail = (prefix = "billfound") => `${prefix}_${crypto.randomBytes(4).toString("hex")}@hotel.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe("Phase 6 Step 2: Billing Foundation & Contract", () => {
  let adminTokenA, adminTokenB;
  let hotelA, hotelB;
  let guestA, guestB;
  let roomTypeA;
  let reservationA, reservationB;

  beforeAll(async () => {
    await connectPlatformDB();

    // 1. Setup Hotel A
    const emailA = randomEmail("adminA");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Billing Admin A", email: emailA, phone: randomPhone(), password: "Password123!"
    });
    const loginA = await request(app).post("/api/v1/auth/login").send({ email: emailA, password: "Password123!" });
    const tempTokenA = loginA.body.data.accessToken;

    const onboardA = await request(app).post("/api/v1/provisioning/onboard").set("Authorization", `Bearer ${tempTokenA}`).send({
      property_name: "Billing Hotel Alpha", address: "100 Financial Blvd", city: "Lahore"
    });
    hotelA = onboardA.body.data.hotelId;

    const reloginA = await request(app).post("/api/v1/auth/login").send({ email: emailA, password: "Password123!" });
    adminTokenA = reloginA.body.data.accessToken;

    // Room Type & Room for Hotel A
    const resRoomTypeA = await request(app).post("/api/v1/hotel/room-types").set("Authorization", `Bearer ${adminTokenA}`).send({
      name: "Deluxe Suite", code: `DLX_${crypto.randomBytes(2).toString("hex").toUpperCase()}`, base_occupancy: 2, max_occupancy: 2, base_price: 250
    });
    roomTypeA = resRoomTypeA.body.data;

    await request(app).post("/api/v1/hotel/rooms").set("Authorization", `Bearer ${adminTokenA}`).send({
      room_number: `101_${crypto.randomBytes(2).toString("hex")}`, room_type_id: roomTypeA._id, floor: 1
    });

    // Guest A
    const resGuestA = await request(app).post("/api/v1/hotel/guests").set("Authorization", `Bearer ${adminTokenA}`).send({
      first_name: "James", last_name: "Bond", email: randomEmail("guestA"), phone: randomPhone()
    });
    guestA = resGuestA.body.data;

    // Reservation A
    const inDateA = new Date();
    inDateA.setDate(inDateA.getDate() + 10);
    const outDateA = new Date();
    outDateA.setDate(outDateA.getDate() + 14);

    const resResA = await request(app).post("/api/v1/hotel/reservations").set("Authorization", `Bearer ${adminTokenA}`).send({
      primary_guest_id: guestA._id,
      room_type_id: roomTypeA._id,
      expected_check_in: inDateA.toISOString(),
      expected_check_out: outDateA.toISOString(),
      adults: 2
    });
    reservationA = resResA.body.data.reservation;

    // 2. Setup Hotel B
    const emailB = randomEmail("adminB");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Billing Admin B", email: emailB, phone: randomPhone(), password: "Password123!"
    });
    const loginB = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "Password123!" });
    const tempTokenB = loginB.body.data.accessToken;

    const onboardB = await request(app).post("/api/v1/provisioning/onboard").set("Authorization", `Bearer ${tempTokenB}`).send({
      property_name: "Billing Hotel Beta", address: "200 Financial Blvd", city: "Karachi"
    });
    hotelB = onboardB.body.data.hotelId;

    const reloginB = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "Password123!" });
    adminTokenB = reloginB.body.data.accessToken;

    // Guest B & Reservation B
    const resGuestB = await request(app).post("/api/v1/hotel/guests").set("Authorization", `Bearer ${adminTokenB}`).send({
      first_name: "Ethan", last_name: "Hunt", email: randomEmail("guestB"), phone: randomPhone()
    });
    guestB = resGuestB.body.data;

    const inDateB = new Date();
    inDateB.setDate(inDateB.getDate() + 5);
    const outDateB = new Date();
    outDateB.setDate(outDateB.getDate() + 7);

    const resRoomTypeB = await request(app).post("/api/v1/hotel/room-types").set("Authorization", `Bearer ${adminTokenB}`).send({
      name: "Standard Room", code: `STD_${crypto.randomBytes(2).toString("hex").toUpperCase()}`, base_occupancy: 1, max_occupancy: 2, base_price: 150
    });

    const resResB = await request(app).post("/api/v1/hotel/reservations").set("Authorization", `Bearer ${adminTokenB}`).send({
      primary_guest_id: guestB._id,
      room_type_id: resRoomTypeB.body.data._id,
      expected_check_in: inDateB.toISOString(),
      expected_check_out: outDateB.toISOString(),
      adults: 1
    });
    reservationB = resResB.body.data.reservation;
  });

  afterAll(async () => {
    await closeAllHotelConnections();
    await closePlatformDB();
  });

  describe("1. Folio Creation & Reservation Idempotency", () => {
    let folioA;

    it("should create/resolve a folio for a valid reservation in Hotel A", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/folios")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          reservation_id: reservationA._id,
          currency: "PKR"
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.folio_ref).toMatch(/^FOL-/);
      expect(res.body.data.reservation_id._id).toBe(reservationA._id);
      expect(res.body.data.reservation_id.booking_ref).toBe(reservationA.booking_ref);
      expect(res.body.data.guest_id._id).toBe(guestA._id);
      expect(res.body.data.status).toBe("OPEN");
      // Auto-generated room accommodation charge for 4 nights @ 250 = 1000
      expect(res.body.data.balance).toBe(1000);

      folioA = res.body.data;
    });

    it("should return the existing open folio idempotently without creating a duplicate", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/folios")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          reservation_id: reservationA._id
        });

      expect(res.status).toBe(201);
      expect(res.body.data._id).toBe(folioA._id);
      expect(res.body.data.folio_ref).toBe(folioA.folio_ref);

      // Verify count in hotel folios remains 1 for this reservation
      const listRes = await request(app)
        .get(`/api/v1/hotel/folios?reservation_id=${reservationA._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.length).toBe(1);
    });

    it("should reject cross-tenant folio creation (Hotel A trying to folio Hotel B reservation)", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/folios")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          reservation_id: reservationB._id
        });

      expect(res.status).toBe(404);
      expect(res.body.error.message).toMatch(/reservation not found/i);
    });

    it("should reject unauthorized folio access", async () => {
      const res = await request(app).get("/api/v1/hotel/folios");
      expect(res.status).toBe(401);
    });
  });

  describe("2. Guest Charges Foundation", () => {
    let folioA;
    let chargeRecord;

    beforeAll(async () => {
      const res = await request(app)
        .post("/api/v1/hotel/folios")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ reservation_id: reservationA._id });
      folioA = res.body.data;
    });

    it("should create a guest charge linked to the folio", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/guest-charges")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          folio_id: folioA._id,
          charge_type: "MINIBAR",
          description: "Premium Snack Pack & Beverages",
          amount: 45.50
        });

      expect(res.status).toBe(201);
      expect(res.body.data.folio_id).toBe(folioA._id);
      expect(res.body.data.charge_type).toBe("MINIBAR");
      expect(res.body.data.amount).toBe(45.50);
      expect(res.body.data.is_voided).toBe(false);

      chargeRecord = res.body.data;
    });

    it("should list charges filtered by folio", async () => {
      const res = await request(app)
        .get(`/api/v1/hotel/guest-charges?folio_id=${folioA._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0]._id).toBe(chargeRecord._id);
    });

    it("should void a guest charge", async () => {
      const res = await request(app)
        .patch(`/api/v1/hotel/guest-charges/${chargeRecord._id}/void`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.is_voided).toBe(true);

      // Attempting to void again fails with conflict
      const secondVoid = await request(app)
        .patch(`/api/v1/hotel/guest-charges/${chargeRecord._id}/void`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(secondVoid.status).toBe(409);
    });
  });

  describe("3. Invoice → Folio → Reservation Correlation", () => {
    let folioA;
    let invoiceA;

    beforeAll(async () => {
      const res = await request(app)
        .post("/api/v1/hotel/folios")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ reservation_id: reservationA._id });
      folioA = res.body.data;
    });

    it("should create an invoice and expose the reservation correlation in response", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/invoices")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          folio_id: folioA._id,
          guest_id: guestA._id,
          line_items: [
            { description: "Accommodation (4 Nights @ $250)", amount: 1000, tax_amount: 150 },
            { description: "Room Service", amount: 80, tax_amount: 12 }
          ]
        });

      expect(res.status).toBe(201);
      expect(res.body.data.total_amount).toBe(1242);
      expect(res.body.data.status).toBe("UNPAID");

      // Verify nested correlation: invoice.folio_id.reservation_id
      expect(res.body.data.folio_id).toBeDefined();
      expect(res.body.data.folio_id._id).toBe(folioA._id);
      expect(res.body.data.folio_id.reservation_id).toBeDefined();
      expect(res.body.data.folio_id.reservation_id._id).toBe(reservationA._id);
      expect(res.body.data.folio_id.reservation_id.booking_ref).toBe(reservationA.booking_ref);

      invoiceA = res.body.data;
    });

    it("should retrieve invoice by ID and retain reservation correlation", async () => {
      const res = await request(app)
        .get(`/api/v1/hotel/invoices/${invoiceA._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.folio_id.reservation_id.booking_ref).toBe(reservationA.booking_ref);
    });

    it("should filter invoices by reservation_id", async () => {
      const res = await request(app)
        .get(`/api/v1/hotel/invoices?reservation_id=${reservationA._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0]._id).toBe(invoiceA._id);
    });

    it("should reject invoice creation with cross-tenant Folio", async () => {
      // Hotel B folio
      const resFolioB = await request(app)
        .post("/api/v1/hotel/folios")
        .set("Authorization", `Bearer ${adminTokenB}`)
        .send({ reservation_id: reservationB._id });

      const res = await request(app)
        .post("/api/v1/hotel/invoices")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          folio_id: resFolioB.body.data._id,
          guest_id: guestA._id,
          line_items: [{ description: "Hack", amount: 100 }]
        });

      expect(res.status).toBe(404);
      expect(res.body.error.message).toMatch(/folio not found/i);
    });
  });

  describe("4. Payment Financial Integrity & Folio Balance Chain", () => {
    let folioA;
    let invoiceA;

    beforeAll(async () => {
      // Create fresh folio and invoice
      const folioRes = await request(app)
        .post("/api/v1/hotel/folios")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ reservation_id: reservationA._id });
      folioA = folioRes.body.data;
      const initialBalance = folioA.balance;

      const invRes = await request(app)
        .post("/api/v1/hotel/invoices")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          folio_id: folioA._id,
          line_items: [{ description: "Suite Stay", amount: 500, tax_amount: 50 }]
        });
      invoiceA = invRes.body.data;
    });

    it("should record partial payment and maintain folio balance consistency", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/payments")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          invoice_id: invoiceA._id,
          amount: 200,
          payment_method: "CREDIT_CARD",
          transaction_id: "TXN-AUTO-01"
        });

      expect(res.status).toBe(201);
      expect(res.body.data.amount).toBe(200);
      expect(res.body.data.status).toBe("COMPLETED");

      // Verify invoice updated to PARTIALLY_PAID
      const invCheck = await request(app)
        .get(`/api/v1/hotel/invoices/${invoiceA._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(invCheck.body.data.status).toBe("PARTIALLY_PAID");
      expect(invCheck.body.data.amount_paid).toBe(200);

      // Verify folio balance updated
      const folCheck = await request(app)
        .get(`/api/v1/hotel/folios/${folioA._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      // Initial balance from room charge (1000) + prior invoice (1242) + new invoice (550) - payment (200) = 2592
      expect(folCheck.body.data.balance).toBe(1000 + 1242 + 350);
    });

    it("should enforce overpayment guard", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/payments")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          invoice_id: invoiceA._id,
          amount: 400, // Remaining is 350
          payment_method: "CASH"
        });

      expect(res.status).toBe(409);
      expect(res.body.error.message).toMatch(/exceeds remaining invoice balance/i);
    });

    it("should record final payment and transition invoice to PAID", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/payments")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          invoice_id: invoiceA._id,
          amount: 350, // Exact remaining balance
          payment_method: "BANK_TRANSFER"
        });

      expect(res.status).toBe(201);

      // Verify invoice is PAID
      const invCheck = await request(app)
        .get(`/api/v1/hotel/invoices/${invoiceA._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(invCheck.body.data.status).toBe("PAID");
      expect(invCheck.body.data.amount_paid).toBe(550);

      // Verify payment response also correlates back to reservation
      const payList = await request(app)
        .get(`/api/v1/hotel/payments?invoice_id=${invoiceA._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(payList.status).toBe(200);
      expect(payList.body.data[0].folio_id.reservation_id.booking_ref).toBe(reservationA.booking_ref);
    });

    it("should reject payments once invoice is fully settled", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/payments")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          invoice_id: invoiceA._id,
          amount: 10,
          payment_method: "CASH"
        });

      expect(res.status).toBe(409);
      expect(res.body.error.message).toMatch(/already fully paid/i);
    });

    it("should reject payment targeting Hotel B invoice using Hotel A token", async () => {
      // Create invoice in Hotel B
      const folioBRes = await request(app)
        .post("/api/v1/hotel/folios")
        .set("Authorization", `Bearer ${adminTokenB}`)
        .send({ reservation_id: reservationB._id });

      const invBRes = await request(app)
        .post("/api/v1/hotel/invoices")
        .set("Authorization", `Bearer ${adminTokenB}`)
        .send({
          folio_id: folioBRes.body.data._id,
          line_items: [{ description: "B Stay", amount: 100 }]
        });

      const res = await request(app)
        .post("/api/v1/hotel/payments")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          invoice_id: invBRes.body.data._id,
          amount: 50,
          payment_method: "CASH"
        });

      expect(res.status).toBe(404);
      expect(res.body.error.message).toMatch(/invoice not found/i);
    });
  });
});
