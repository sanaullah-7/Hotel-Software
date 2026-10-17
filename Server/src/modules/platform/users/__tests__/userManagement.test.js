import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../../../../app.js";
import { connectPlatformDB } from "../../../../database/platform/platformConnection.js";
import Account from "../../../../database/platform/models/account.model.js";
import Hotel from "../../../../database/platform/models/hotel.model.js";
import { ROLES } from "../../../../constants/roles.js";
import crypto from "crypto";

const randomHex = () => crypto.randomBytes(4).toString("hex");

describe("Platform User Management & Multi-Hotel Staff Directory Suite", () => {
  let superAdminToken;
  let testManagerId;
  let testReceptionistId;
  let testHotelId;

  beforeAll(async () => {
    await connectPlatformDB();

    // Log in as Platform Super Admin
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: "admin@explorepakistan.com",
      password: "admin123",
    });
    expect(loginRes.status).toBe(200);
    superAdminToken = loginRes.body.data.accessToken;

    // Seed test hotel
    testHotelId = new mongoose.Types.ObjectId();
    const hotel = await Hotel.create({
      _id: testHotelId,
      property_name: `Pearl Continental ${randomHex()}`,
      address: "The Mall Road",
      city: "Murree",
      province: "Punjab",
      ownerId: new mongoose.Types.ObjectId(),
      status: "active",
      tenant_db_name: `hotel_${testHotelId.toString()}`,
    });

    // Seed test manager
    const manager = await Account.create({
      fullName: `Manager ${randomHex()}`,
      email: `mgr_${randomHex()}@test.com`,
      phone: `03${Math.floor(100000000 + Math.random() * 900000000)}`,
      password: "HashedPassword123!",
      role: ROLES.HOTEL_ADMIN,
      hotelId: hotel._id,
      status: "active",
      tokenVersion: 0,
    });
    testManagerId = manager._id.toString();

    // Seed test receptionist
    const receptionist = await Account.create({
      fullName: `Receptionist ${randomHex()}`,
      email: `rec_${randomHex()}@test.com`,
      phone: `03${Math.floor(100000000 + Math.random() * 900000000)}`,
      password: "HashedPassword123!",
      role: ROLES.HOTEL_USER,
      hotelId: hotel._id,
      status: "pending",
      tokenVersion: 0,
    });
    testReceptionistId = receptionist._id.toString();
  });

  afterAll(async () => {
    if (testManagerId) await Account.findByIdAndDelete(testManagerId);
    if (testReceptionistId) await Account.findByIdAndDelete(testReceptionistId);
    if (testHotelId) await Hotel.findByIdAndDelete(testHotelId);
    await mongoose.connection.close();
  });

  it("should list users with pagination and populated hotel information", async () => {
    const res = await request(app)
      .get("/api/v1/users?page=1&limit=10")
      .set("Authorization", `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.data)).toBe(true);
    expect(res.body.data.total).toBeGreaterThanOrEqual(2);

    const foundMgr = res.body.data.data.find((u) => u.id === testManagerId);
    expect(foundMgr).toBeDefined();
    expect(foundMgr.role).toBe("MANAGER");
    expect(foundMgr.hotelName).toContain("Pearl Continental");
  });

  it("should filter users by role (MANAGER vs RECEPTIONIST)", async () => {
    const mgrRes = await request(app)
      .get("/api/v1/users?role=MANAGER")
      .set("Authorization", `Bearer ${superAdminToken}`);

    expect(mgrRes.status).toBe(200);
    expect(mgrRes.body.data.data.some((u) => u.id === testManagerId)).toBe(true);
    expect(mgrRes.body.data.data.some((u) => u.id === testReceptionistId)).toBe(false);

    const recRes = await request(app)
      .get("/api/v1/users?role=RECEPTIONIST")
      .set("Authorization", `Bearer ${superAdminToken}`);

    expect(recRes.status).toBe(200);
    expect(recRes.body.data.data.some((u) => u.id === testReceptionistId)).toBe(true);
    expect(recRes.body.data.data.some((u) => u.id === testManagerId)).toBe(false);
  });

  it("should retrieve a single user by ID", async () => {
    const res = await request(app)
      .get(`/api/v1/users/${testManagerId}`)
      .set("Authorization", `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(testManagerId);
    expect(res.body.data.role).toBe("MANAGER");
  });

  it("should suspend a user account and increment tokenVersion for session revocation", async () => {
    const res = await request(app)
      .patch(`/api/v1/users/${testManagerId}/suspend`)
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({ reason: "Security violation" });

    expect(res.status).toBe(200);
    expect(res.body.data.user.status).toBe("SUSPENDED");

    const updatedAccount = await Account.findById(testManagerId);
    expect(updatedAccount.status).toBe("suspended");
    expect(updatedAccount.tokenVersion).toBeGreaterThan(0);
  });

  it("should activate a user account", async () => {
    const res = await request(app)
      .patch(`/api/v1/users/${testManagerId}/activate`)
      .set("Authorization", `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.status).toBe("ACTIVE");

    const updatedAccount = await Account.findById(testManagerId);
    expect(updatedAccount.status).toBe("active");
  });

  it("should return overall user statistics", async () => {
    const res = await request(app)
      .get("/api/v1/users/stats")
      .set("Authorization", `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalManagers).toBeGreaterThanOrEqual(1);
    expect(res.body.data.totalReceptionists).toBeGreaterThanOrEqual(1);
    expect(res.body.data.totalUsers).toBeGreaterThanOrEqual(2);
  });

  it("should block non-admin requests with 401/403", async () => {
    const res = await request(app).get("/api/v1/users");
    expect(res.status).toBe(401);
  });
});
