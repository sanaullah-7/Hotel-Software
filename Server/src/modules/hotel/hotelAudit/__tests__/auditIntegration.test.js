import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../../../../app.js";
import { connectPlatformDB } from "../../../../database/platform/platformConnection.js";
import { getHotelConnection } from "../../../../database/connectionManager.js";
import Account from "../../../../database/platform/models/account.model.js";
import { ROLES } from "../../../../constants/roles.js";
import crypto from "crypto";

const randomEmail = (prefix = "aud") =>
  `${prefix}_${crypto.randomBytes(4).toString("hex")}@hotel.com`;

const randomPhone = () =>
  `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe("Hotel Audit Log Backend Integration Suite", () => {
  let platformConnection;
  let tokenA;
  let tokenB;
  const hotelIdA = new mongoose.Types.ObjectId().toString();
  const hotelIdB = new mongoose.Types.ObjectId().toString();

  beforeAll(async () => {
    platformConnection = await connectPlatformDB();
    await getHotelConnection(hotelIdA);
    await getHotelConnection(hotelIdB);

    // Setup Hotel A Admin
    const emailA = randomEmail("audit_admin_a");
    const pass = "Password123!";
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Audit Admin A",
      email: emailA,
      phone: randomPhone(),
      password: pass,
    });
    await Account.findOneAndUpdate(
      { email: emailA },
      { role: ROLES.HOTEL_ADMIN, hotelId: hotelIdA }
    );
    const loginResA = await request(app).post("/api/v1/auth/login").send({
      email: emailA,
      password: pass,
    });
    tokenA = loginResA.body.data.accessToken;

    // Setup Hotel B Admin (for multi-tenant isolation verification)
    const emailB = randomEmail("audit_admin_b");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Audit Admin B",
      email: emailB,
      phone: randomPhone(),
      password: pass,
    });
    await Account.findOneAndUpdate(
      { email: emailB },
      { role: ROLES.HOTEL_ADMIN, hotelId: hotelIdB }
    );
    const loginResB = await request(app).post("/api/v1/auth/login").send({
      email: emailB,
      password: pass,
    });
    tokenB = loginResB.body.data.accessToken;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("1. Security & Authentication", () => {
    it("should reject unauthenticated requests to /hotel/audit-logs with 401", async () => {
      const res = await request(app).get("/api/v1/hotel/audit-logs");
      expect(res.status).toBe(401);
    });

    it("should reject unauthenticated audit creation with 401", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/audit-logs")
        .send({ module: "Rooms", action: "Test", description: "Test unauth" });
      expect(res.status).toBe(401);
    });
  });

  describe("2. Audit Log Creation & Validation", () => {
    it("should validate required fields on audit creation", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/audit-logs")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ module: "Rooms" }); // missing action and description

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should successfully create an audit log with standard fields", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/audit-logs")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          module: "Reservation",
          action: "Created Booking",
          recordId: "RES-9988",
          description: "Guest John Doe checked into Deluxe Suite.",
          importance: "Important",
          status: "Completed",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.module).toBe("Reservation");
      expect(res.body.data.action).toBe("Created Booking");
      expect(res.body.data.recordId).toBe("RES-9988");
      expect(res.body.data.importance).toBe("Important");
      expect(res.body.data.id).toBeDefined();
    });

    it("should create audit log with critical importance and previous/new state snapshot", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/audit-logs")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          module: "Rooms",
          action: "Deleted Room",
          recordId: "Room 101",
          description: "Room 101 was permanently decommissioned.",
          importance: "Critical",
          previousValue: { roomNo: "101", status: "Available" },
          newValue: null,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.importance).toBe("Critical");
      expect(res.body.data.recordId).toBe("Room 101");
    });
  });

  describe("3. Query Filtering & Metrics", () => {
    it("should list audit logs with pagination and match totalCount", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/audit-logs?page=1&limit=10")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.logs.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data.totalCount).toBeGreaterThanOrEqual(2);
      expect(res.body.data.currentPage).toBe(1);
    });

    it("should filter logs by module", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/audit-logs?module=Reservation")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.logs.every((l) => l.module === "Reservation")).toBe(true);
    });

    it("should filter logs by importance", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/audit-logs?importance=Critical")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.logs.every((l) => l.importance === "Critical")).toBe(true);
    });

    it("should search logs by keyword across description, recordId, and action", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/audit-logs?search=9988")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.logs.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.logs[0].recordId).toBe("RES-9988");
    });

    it("should retrieve audit metrics summary", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/audit-logs/metrics")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBeGreaterThanOrEqual(2);
      expect(res.body.data.critical).toBeGreaterThanOrEqual(1);
      expect(res.body.data.important).toBeGreaterThanOrEqual(1);
    });
  });

  describe("4. Tenant Isolation", () => {
    it("should ensure Hotel B cannot see audit logs of Hotel A", async () => {
      const resB = await request(app)
        .get("/api/v1/hotel/audit-logs")
        .set("Authorization", `Bearer ${tokenB}`);

      expect(resB.status).toBe(200);
      expect(resB.body.data.totalCount).toBe(0);
      expect(resB.body.data.logs).toEqual([]);
    });
  });
});
