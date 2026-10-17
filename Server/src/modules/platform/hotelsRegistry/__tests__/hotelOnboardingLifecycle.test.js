import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../../../../app.js";
import { connectPlatformDB } from "../../../../database/platform/platformConnection.js";
import { getHotelConnection } from "../../../../database/connectionManager.js";
import Account from "../../../../database/platform/models/account.model.js";
import Hotel from "../../../../database/platform/models/hotel.model.js";
import { getModel } from "../../../../database/hotel/modelFactory.js";
import { ROLES } from "../../../../constants/roles.js";
import crypto from "crypto";

const randomHex = () => crypto.randomBytes(4).toString("hex");

describe("Hotel Onboarding, Super Admin Approval & Deactivation Integration Suite", () => {
  let superAdminToken;
  let testHotelId;
  let hotelAdminEmail;
  const hotelAdminPass = "SecurePass123!";
  const hotelName = `Grand Serena ${randomHex()}`;

  beforeAll(async () => {
    await connectPlatformDB();

    // Log in as the seeded Super Admin
    const superAdminRes = await request(app).post("/api/v1/auth/login").send({
      email: "admin@explorepakistan.com",
      password: "admin123",
    });

    expect(superAdminRes.status).toBe(200);
    superAdminToken = superAdminRes.body.data.accessToken;
    expect(superAdminToken).toBeDefined();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("1. Hotel Registration & Pending Approval State", () => {
    it("should allow a new hotel to submit registration with status pending", async () => {
      hotelAdminEmail = `manager_${randomHex()}@testresort.com`;
      const res = await request(app)
        .post("/api/v1/auth/register-hotel")
        .send({
          fullName: "Hamza Tariq",
          email: hotelAdminEmail,
          phone: `03${Math.floor(100000001 + Math.random() * 899999999)}`,
          password: hotelAdminPass,
          hotelName,
          address: "Mall Road, Murree",
          city: "Murree",
          subscriptionPlan: "STANDARD",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("pending");
      expect(res.body.data.hotelName).toBe(hotelName);
      expect(res.body.message).toContain("pending Super Admin approval");

      testHotelId = res.body.data.hotelId;
    });

    it("should block the hotel admin from logging in while status is pending", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: hotelAdminEmail,
        password: hotelAdminPass,
      });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("pending review and approval");
    });
  });

  describe("2. Super Admin Inspection & Approval", () => {
    it("should list the registered hotel in Super Admin's pending review list", async () => {
      const res = await request(app)
        .get("/api/v1/hotels?status=pending")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.data)).toBe(true);
      const found = res.body.data.data.find((h) => h.id === testHotelId);
      expect(found).toBeDefined();
      expect(found.hotelName).toBe(hotelName);
      expect(found.status).toBe("PENDING");
    });

    it("should reflect pending counts in Super Admin statistics", async () => {
      const res = await request(app)
        .get("/api/v1/hotels/stats")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.pending).toBeGreaterThanOrEqual(1);
    });

    it("should approve the hotel and provision tenant database", async () => {
      const res = await request(app)
        .patch(`/api/v1/hotels/${testHotelId}/approve`)
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hotel.status).toBe("ACTIVE");

      // Verify DB record
      const hotelDoc = await Hotel.findById(testHotelId);
      expect(hotelDoc.status).toBe("active");
      expect(hotelDoc.approvedAt).toBeDefined();

      const ownerDoc = await Account.findById(hotelDoc.ownerId);
      expect(ownerDoc.status).toBe("active");
    });
  });

  describe("3. Post-Approval Login & Tenant Isolation", () => {
    let hotelToken;

    it("should allow hotel admin to log in successfully once approved", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: hotelAdminEmail,
        password: hotelAdminPass,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      hotelToken = res.body.data.accessToken;
      expect(res.body.data.account.hotelId).toBe(testHotelId);
    });

    it("should guarantee strict multi-tenant isolation with isolated tenant database", async () => {
      // Seed a room in Hotel A
      const connA = await getHotelConnection(testHotelId);
      const RoomA = await getModel(connA, "Room");
      const dummyTypeId = new mongoose.Types.ObjectId();
      await RoomA.create({
        room_number: "VIP-999",
        room_type_id: dummyTypeId,
        status: "Available",
        base_price: 35000,
      });

      // Register and approve Hotel B
      const hotelBName = `Pearl Continental ${randomHex()}`;
      const hotelBEmail = `manager_b_${randomHex()}@pc.com`;
      const regB = await request(app)
        .post("/api/v1/auth/register-hotel")
        .send({
          fullName: "Bilal Khan",
          email: hotelBEmail,
          password: hotelAdminPass,
          hotelName: hotelBName,
          city: "Lahore",
        });

      const hotelBId = regB.body.data.hotelId;
      await request(app)
        .patch(`/api/v1/hotels/${hotelBId}/approve`)
        .set("Authorization", `Bearer ${superAdminToken}`);

      // Login as Hotel B
      const loginB = await request(app).post("/api/v1/auth/login").send({
        email: hotelBEmail,
        password: hotelAdminPass,
      });
      const tokenB = loginB.body.data.accessToken;

      // Ask assistant for room counts or check rooms
      const assistantResB = await request(app)
        .post("/api/v1/hotel/assistant/chat")
        .set("Authorization", `Bearer ${tokenB}`)
        .send({ message: "How many rooms are available?" });

      expect(assistantResB.status).toBe(200);
      // Hotel B has 0 rooms, VIP-999 from Hotel A is NOT visible!
      expect(assistantResB.body.data.reply).toContain("Total Rooms: 0");
    });
  });

  describe("4. Monthly Rent Default & Suspension (Deactivation)", () => {
    it("should allow Super Admin to deactivate/suspend hotel due to unpaid monthly rent", async () => {
      const res = await request(app)
        .patch(`/api/v1/hotels/${testHotelId}/suspend`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send({ reason: "Unpaid monthly SaaS subscription fee for October" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hotel.status).toBe("SUSPENDED");
      expect(res.body.data.hotel.suspensionReason).toContain("Unpaid monthly");
    });

    it("should immediately reject hotel admin login when deactivated", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: hotelAdminEmail,
        password: hotelAdminPass,
      });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("inactive or suspended due to subscription/fee dues");
    });

    it("should restore access when Super Admin reactivates the hotel upon payment", async () => {
      const res = await request(app)
        .patch(`/api/v1/hotels/${testHotelId}/reactivate`)
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.hotel.status).toBe("ACTIVE");

      // Verify login works again
      const loginAgain = await request(app).post("/api/v1/auth/login").send({
        email: hotelAdminEmail,
        password: hotelAdminPass,
      });

      expect(loginAgain.status).toBe(200);
      expect(loginAgain.body.data.accessToken).toBeDefined();
    });
  });

  describe("5. Rejection Flow", () => {
    it("should allow Super Admin to reject an unqualified hotel application", async () => {
      const hotelCName = `Incomplete Hotel ${randomHex()}`;
      const hotelCEmail = `manager_c_${randomHex()}@test.com`;
      const regC = await request(app)
        .post("/api/v1/auth/register-hotel")
        .send({
          fullName: "Zahid Ahmed",
          email: hotelCEmail,
          password: hotelAdminPass,
          hotelName: hotelCName,
          city: "Peshawar",
        });

      const hotelCId = regC.body.data.hotelId;

      const rejectRes = await request(app)
        .patch(`/api/v1/hotels/${hotelCId}/reject`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send({ reason: "Incomplete property documentation provided" });

      expect(rejectRes.status).toBe(200);
      expect(rejectRes.body.data.hotel.status).toBe("REJECTED");

      // Login is blocked
      const loginC = await request(app).post("/api/v1/auth/login").send({
        email: hotelCEmail,
        password: hotelAdminPass,
      });

      expect(loginC.status).toBe(403);
      expect(loginC.body.message).toContain("Incomplete property documentation provided");
    });
  });
});
