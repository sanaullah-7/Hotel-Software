import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../../../app.js";
import { connectPlatformDB } from "../../../../database/platform/platformConnection.js";
import { getHotelConnection } from "../../../../database/connectionManager.js";
import mongoose from "mongoose";
import Account from "../../../../database/platform/models/account.model.js";
import { ROLES } from "../../../../constants/roles.js";
import crypto from "crypto";

const randomEmail = (prefix = "events") =>
  `${prefix}_${crypto.randomBytes(4).toString("hex")}@hotel.com`;
const randomPhone = () =>
  `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe("Events & Banquets Backend Integration & Hardening Suite", () => {
  let platformConnection;
  let tokenA;
  let tokenB;
  const hotelIdA = new mongoose.Types.ObjectId().toString();
  const hotelIdB = new mongoose.Types.ObjectId().toString();

  let createdEventA;
  let createdBeoA;

  beforeAll(async () => {
    platformConnection = await connectPlatformDB();
    await getHotelConnection(hotelIdA);
    await getHotelConnection(hotelIdB);

    // Register Hotel A Admin
    const emailA = randomEmail("evt_admin_a");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Hotel A Events Director",
      email: emailA,
      phone: randomPhone(),
      password: "password123",
    });
    await Account.findOneAndUpdate(
      { email: emailA },
      { role: ROLES.HOTEL_ADMIN, hotelId: hotelIdA }
    );
    const loginResA = await request(app).post("/api/v1/auth/login").send({
      email: emailA,
      password: "password123",
    });
    tokenA = loginResA.body.data.accessToken;

    // Register Hotel B Admin (for tenant isolation tests)
    const emailB = randomEmail("evt_admin_b");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Hotel B Events Director",
      email: emailB,
      phone: randomPhone(),
      password: "password123",
    });
    await Account.findOneAndUpdate(
      { email: emailB },
      { role: ROLES.HOTEL_ADMIN, hotelId: hotelIdB }
    );
    const loginResB = await request(app).post("/api/v1/auth/login").send({
      email: emailB,
      password: "password123",
    });
    tokenB = loginResB.body.data.accessToken;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("1. Authentication & Tenant Authorization", () => {
    it("should reject unauthenticated requests with 401", async () => {
      const res = await request(app).get("/api/v1/hotel/events");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("2. Clean Empty Database Behavior (No Fake Mock Seeding)", () => {
    it("should return an empty event list with total 0 for a fresh tenant", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/events")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.events).toEqual([]);
      expect(res.body.data.total).toBe(0);
    });

    it("should return zero metrics for a fresh tenant with no records", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/events/metrics")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBe(0);
      expect(res.body.data.totalRevenue).toBe(0);
      expect(res.body.data.confirmed).toBe(0);
    });

    it("should return empty BEO list for a fresh tenant", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/events/beos")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });
  });

  describe("3. Event Lifecycle & Server-Authoritative Financials", () => {
    it("should reject event creation if advance amount exceeds total amount", async () => {
      const invalidPayload = {
        name: "Overpaid Banquet",
        client_name: "Overpayer",
        amount: 5000,
        advanceAmount: 10000,
      };

      const res = await request(app)
        .post("/api/v1/hotel/events")
        .set("Authorization", `Bearer ${tokenA}`)
        .send(invalidPayload);

      expect(res.status).toBe(400);
      const errMsg = res.body.error?.message || res.body.message;
      expect(errMsg).toContain("Advance amount cannot exceed total amount");
    });


    it("should create event and compute balance_amount authoritatively", async () => {
      const payload = {
        name: "Global Tech Gala 2026",
        client_name: "Open Source Consortium",
        contact_phone: "+1 (555) 333-2211",
        contact_email: "gala@opensource.org",
        date: "2026-11-15",
        start_time: "18:00",
        end_time: "23:00",
        venue: "Grand Ballroom",
        guests: 200,
        event_type: "Gala",
        catering: "Plated Dinner",
        status: "Confirmed",
        amount: 50000,
        advanceAmount: 15000,
        // Client attempts to pass inconsistent balance
        balance_amount: 99999,
        special_requests: "Live stream rig",
        notes: "VIP guest speakers",
      };

      const res = await request(app)
        .post("/api/v1/hotel/events")
        .set("Authorization", `Bearer ${tokenA}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      createdEventA = res.body.data;
      expect(createdEventA.name).toBe("Global Tech Gala 2026");
      expect(createdEventA.event_ref).toMatch(/^EVT/);
      expect(createdEventA.total_amount).toBe(50000);
      expect(createdEventA.advance_amount).toBe(15000);
      // Authoritatively computed by server: 50000 - 15000 = 35000
      expect(createdEventA.balance_amount).toBe(35000);
    });

    it("should update event and recalculate balance amount", async () => {
      const res = await request(app)
        .put(`/api/v1/hotel/events/${createdEventA._id}`)
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          name: "Global Tech Gala 2026 (Expanded)",
          amount: 60000,
          advanceAmount: 20000,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("Global Tech Gala 2026 (Expanded)");
      expect(res.body.data.total_amount).toBe(60000);
      expect(res.body.data.advance_amount).toBe(20000);
      expect(res.body.data.balance_amount).toBe(40000);
    });

    it("should reject update if new advance amount exceeds total amount", async () => {
      const res = await request(app)
        .put(`/api/v1/hotel/events/${createdEventA._id}`)
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          advanceAmount: 90000,
        });

      expect(res.status).toBe(400);
      const errMsg = res.body.error?.message || res.body.message;
      expect(errMsg).toContain("Advance amount cannot exceed total amount");
    });
  });

  describe("4. Banquet Manager / BEO & Event Relationship Validation", () => {
    it("should reject BEO referencing non-existent or foreign event", async () => {
      const fakeEventId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .post("/api/v1/hotel/events/beos")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          event_id: fakeEventId,
          title: "Invalid BEO",
          client: "Unknown Client",
        });

      expect(res.status).toBe(404);
      const errMsg = res.body.error?.message || res.body.message;
      expect(errMsg).toContain("does not exist in this hotel");
    });


    it("should create BEO successfully referencing valid event in same tenant", async () => {
      const beoPayload = {
        event_id: createdEventA._id,
        title: "BEO - Global Tech Gala Production",
        client: "Open Source Consortium",
        venue: "Grand Ballroom",
        status: "Confirmed & Deposit Paid",
        schedule: "Nov 15, 2026 (18:00 - 23:00)",
        attendance: "200 Guests",
        catering: "Plated Dinner Package",
        totalPrice: "$60,000",
        depositPaid: "$20,000",
      };

      const res = await request(app)
        .post("/api/v1/hotel/events/beos")
        .set("Authorization", `Bearer ${tokenA}`)
        .send(beoPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      createdBeoA = res.body.data;
      expect(createdBeoA.beo_ref).toMatch(/^BEO-/);
      expect(createdBeoA.event_id).toBe(createdEventA._id);
    });

    it("should retrieve BEO metrics reflecting created orders", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/events/beos/metrics")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalBeos).toBe(1);
    });
  });

  describe("5. Tenant Isolation Verification (Hotel A vs Hotel B)", () => {
    it("Hotel B cannot view Hotel A's events (Tenant database isolation)", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/events")
        .set("Authorization", `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(0);
      expect(res.body.data.events).toEqual([]);
    });

    it("Hotel B cannot modify Hotel A's event", async () => {
      const res = await request(app)
        .put(`/api/v1/hotel/events/${createdEventA._id}`)
        .set("Authorization", `Bearer ${tokenB}`)
        .send({ name: "Hacked by Hotel B" });

      expect(res.status).toBe(404);
    });

    it("Hotel B cannot delete Hotel A's event", async () => {
      const res = await request(app)
        .delete(`/api/v1/hotel/events/${createdEventA._id}`)
        .set("Authorization", `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
    });

    it("Hotel B cannot create a BEO referencing Hotel A's event", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/events/beos")
        .set("Authorization", `Bearer ${tokenB}`)
        .send({
          event_id: createdEventA._id,
          title: "Cross Tenant BEO Attack",
          client: "Spy Corp",
        });

      expect(res.status).toBe(404);
      const errMsg = res.body.error?.message || res.body.message;
      expect(errMsg).toContain("does not exist in this hotel");
    });
  });

  describe("6. Route Precedence & ID Safety", () => {
    it("should cleanly return 404 on malformed event ID without 500 CastError", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/events/invalid-non-existent-id-9999")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(404);
      const errMsg = res.body.error?.message || res.body.message;
      expect(errMsg).toContain("not found");
    });


    it("bulk-delete endpoint is not captured by /:id param route", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/events/bulk-delete")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ ids: [createdEventA._id] });

      expect(res.status).toBe(200);
      expect(res.body.data.deletedCount).toBe(1);

      // Verify deletion in database
      const verifyRes = await request(app)
        .get(`/api/v1/hotel/events/${createdEventA._id}`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(verifyRes.status).toBe(404);
    });
  });
});
