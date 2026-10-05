import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import crypto from "crypto";
import app from "../../../../app.js";
import { connectPlatformDB, closePlatformDB } from "../../../../database/platform/platformConnection.js";
import { closeAllHotelConnections } from "../../../../database/connectionManager.js";

const randomEmail = (prefix = "bill") => `${prefix}_${crypto.randomBytes(4).toString("hex")}@hotel.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe("Phase 8: Billing, Invoices & Payments", () => {
  let adminTokenA, adminTokenB;
  let hotelA, hotelB;
  let guestA, guestB;
  let folioA, folioB;

  beforeAll(async () => {
    await connectPlatformDB();

    // Setup Hotel A
    const emailA = randomEmail("adminA");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Billing Admin A", email: emailA, phone: randomPhone(), password: "Password123!"
    });
    const loginA = await request(app).post("/api/v1/auth/login").send({ email: emailA, password: "Password123!" });
    const tempTokenA = loginA.body.data.accessToken;

    const onboardA = await request(app).post("/api/v1/provisioning/onboard").set("Authorization", `Bearer ${tempTokenA}`).send({
      property_name: "Billing Hotel A", address: "700 Financial Plaza", city: "Lahore"
    });
    hotelA = onboardA.body.data.hotelId;

    const reloginA = await request(app).post("/api/v1/auth/login").send({ email: emailA, password: "Password123!" });
    adminTokenA = reloginA.body.data.accessToken;

    // Guest A
    const resGuestA = await request(app).post("/api/v1/hotel/guests").set("Authorization", `Bearer ${adminTokenA}`).send({
      first_name: "BillGuest", last_name: "Alpha", email: randomEmail("guestA"), phone: randomPhone()
    });
    guestA = resGuestA.body.data;

    // Folio A
    const resFolioA = await request(app).post("/api/v1/hotel/folios").set("Authorization", `Bearer ${adminTokenA}`).send({
      guest_id: guestA._id, currency: "PKR"
    });
    folioA = resFolioA.body.data;

    // Setup Hotel B
    const emailB = randomEmail("adminB");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Billing Admin B", email: emailB, phone: randomPhone(), password: "Password123!"
    });
    const loginB = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "Password123!" });
    const tempTokenB = loginB.body.data.accessToken;

    const onboardB = await request(app).post("/api/v1/provisioning/onboard").set("Authorization", `Bearer ${tempTokenB}`).send({
      property_name: "Billing Hotel B", address: "800 Finance Way", city: "Karachi"
    });
    hotelB = onboardB.body.data.hotelId;

    const reloginB = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "Password123!" });
    adminTokenB = reloginB.body.data.accessToken;

    // Guest B & Folio B
    const resGuestB = await request(app).post("/api/v1/hotel/guests").set("Authorization", `Bearer ${adminTokenB}`).send({
      first_name: "BillGuest", last_name: "Beta", email: randomEmail("guestB"), phone: randomPhone()
    });
    guestB = resGuestB.body.data;

    const resFolioB = await request(app).post("/api/v1/hotel/folios").set("Authorization", `Bearer ${adminTokenB}`).send({
      guest_id: guestB._id, currency: "PKR"
    });
    folioB = resFolioB.body.data;
  });

  afterAll(async () => {
    await closeAllHotelConnections();
    await closePlatformDB();
  });

  describe("Invoice Creation & Folio Balance", () => {
    let invoiceA;

    it("should create invoice for folio with line items and update folio balance", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/invoices")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          folio_id: folioA._id,
          guest_id: guestA._id,
          line_items: [
            { description: "Room Charge - 2 Nights", amount: 200, tax_amount: 32 },
            { description: "Room Service Breakfast", amount: 50, tax_amount: 8 },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.invoice_number).toMatch(/^INV-/);
      expect(res.body.data.total_amount).toBe(290); // (200+32) + (50+8) = 290
      expect(res.body.data.status).toBe("UNPAID");

      invoiceA = res.body.data;
    });

    it("should reject invoice creation in Hotel A using Guest from Hotel B (Cross-Tenant Guard)", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/invoices")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          folio_id: folioA._id,
          guest_id: guestB._id, // Belongs to Hotel B!
          line_items: [{ description: "Cross-Tenant Charge", amount: 100 }],
        });

      expect(res.status).toBe(404);
      expect(res.body.error.message).toMatch(/guest not found/i);
    });

    it("should list invoices for Hotel A", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/invoices")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Payments & Overpayment Protection", () => {
    let invoiceA;

    beforeAll(async () => {
      const res = await request(app)
        .post("/api/v1/hotel/invoices")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          folio_id: folioA._id,
          guest_id: guestA._id,
          line_items: [{ description: "Spa Treatment", amount: 100, tax_amount: 0 }],
        });
      invoiceA = res.body.data;
    });

    it("should process partial payment and update invoice status to PARTIALLY_PAID", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/payments")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          invoice_id: invoiceA._id,
          folio_id: folioA._id,
          guest_id: guestA._id,
          amount: 40,
          payment_method: "CREDIT_CARD",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.payment_ref).toMatch(/^PAY-/);
      expect(res.body.data.amount).toBe(40);

      // Verify invoice status updated to PARTIALLY_PAID
      const invRes = await request(app)
        .get(`/api/v1/hotel/invoices/${invoiceA._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(invRes.body.data.status).toBe("PARTIALLY_PAID");
      expect(invRes.body.data.amount_paid).toBe(40);
    });

    it("should reject payment exceeding remaining invoice balance", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/payments")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          invoice_id: invoiceA._id,
          folio_id: folioA._id,
          guest_id: guestA._id,
          amount: 100, // Remaining is 60 (100 - 40)!
          payment_method: "CASH",
        });

      expect(res.status).toBe(409);
      expect(res.body.error.message).toMatch(/exceeds remaining invoice balance/i);
    });

    it("should process final payment and update invoice status to PAID", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/payments")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          invoice_id: invoiceA._id,
          folio_id: folioA._id,
          guest_id: guestA._id,
          amount: 60, // Exact remaining balance
          payment_method: "CASH",
        });

      expect(res.status).toBe(201);

      // Verify invoice status updated to PAID
      const invRes = await request(app)
        .get(`/api/v1/hotel/invoices/${invoiceA._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(invRes.body.data.status).toBe("PAID");
      expect(invRes.body.data.amount_paid).toBe(100);
    });

    it("should reject payment on fully paid invoice", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/payments")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          invoice_id: invoiceA._id,
          folio_id: folioA._id,
          guest_id: guestA._id,
          amount: 10,
          payment_method: "CASH",
        });

      expect(res.status).toBe(409);
      expect(res.body.error.message).toMatch(/already fully paid/i);
    });

    it("should prevent concurrent overpayment race conditions on real MongoDB", async () => {
      // Create new invoice for 100
      const invRes = await request(app)
        .post("/api/v1/hotel/invoices")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          folio_id: folioA._id,
          guest_id: guestA._id,
          line_items: [{ description: "Concurrent Test", amount: 100, tax_amount: 0 }],
        });
      const concInvoice = invRes.body.data;

      // Send two simultaneous payments of 70 for total 100 invoice
      const payload = {
        invoice_id: concInvoice._id,
        folio_id: folioA._id,
        guest_id: guestA._id,
        amount: 70,
        payment_method: "CREDIT_CARD",
      };

      const [p1, p2] = await Promise.all([
        request(app).post("/api/v1/hotel/payments").set("Authorization", `Bearer ${adminTokenA}`).send(payload),
        request(app).post("/api/v1/hotel/payments").set("Authorization", `Bearer ${adminTokenA}`).send(payload),
      ]);

      const statuses = [p1.status, p2.status].sort();
      expect(statuses[0]).toBe(201);
      expect(statuses[1]).toBe(409);
    });
  });
});
