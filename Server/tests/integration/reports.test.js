import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../src/app.js";
import { connectPlatformDB } from "../../src/database/platform/platformConnection.js";
import Account from "../../src/database/platform/models/account.model.js";
import Hotel from "../../src/database/platform/models/hotel.model.js";
import { ROLES } from "../../src/constants/roles.js";
import { ENV } from "../../src/config/env.js";

describe("Platform Reporting & Analytics Integration Suite", () => {
  let adminToken;
  let adminAccount;
  let testHotel;

  beforeAll(async () => {
    await connectPlatformDB();

    adminAccount = await Account.findOne({ email: "test_reports_admin@example.com" });
    if (!adminAccount) {
      adminAccount = await Account.create({
        fullName: "Reports Super Admin",
        email: "test_reports_admin@example.com",
        password: "hashedPassword123",
        role: ROLES.PLATFORM_ADMIN,
        status: "active",
        tokenVersion: 0,
      });
    }

    adminToken = jwt.sign(
      { id: adminAccount._id.toString(), type: "access", tv: adminAccount.tokenVersion || 0 },
      ENV.JWT_ACCESS_SECRET,
      { algorithm: "HS256", expiresIn: "1h" }
    );

    testHotel = await Hotel.findOne({ tenant_db_name: "test_reports_hotel_db" });
    if (!testHotel) {
      testHotel = await Hotel.create({
        property_name: "Islamabad Serena View",
        ownerId: adminAccount._id,
        address: "Club Road",
        city: "Islamabad",
        province: "ICT",
        status: "active",
        tenant_db_name: "test_reports_hotel_db",
        subscriptionPlan: "PRO",
      });
    }
  });

  afterAll(async () => {
    await Hotel.deleteOne({ _id: testHotel?._id });
    await Account.deleteOne({ _id: adminAccount?._id });
  });

  it("rejects unauthorized access without valid token", async () => {
    const res = await request(app).get("/api/v1/reports/hotels");
    expect(res.status).toBe(401);
  });

  it("compiles and returns real hotel distribution report", async () => {
    const res = await request(app)
      .get("/api/v1/reports/hotels")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalHotels).toBeGreaterThanOrEqual(1);
    expect(res.body.data.byCity).toBeInstanceOf(Array);
    expect(res.body.data.monthlyGrowth).toBeInstanceOf(Array);
    expect(res.body.data.monthlyGrowth.length).toBe(12);
  });

  it("compiles and returns SaaS revenue & MRR report", async () => {
    const res = await request(app)
      .get("/api/v1/reports/revenue")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.mrr).toBeGreaterThanOrEqual(0);
    expect(res.body.data.arr).toBe(res.body.data.mrr * 12);
    expect(res.body.data.topEarningCities).toBeInstanceOf(Array);
    expect(res.body.data.monthlyTrend).toBeInstanceOf(Array);
    expect(res.body.data.monthlyTrend.length).toBe(12);
  });

  it("compiles and returns user and staff demographic report", async () => {
    const res = await request(app)
      .get("/api/v1/reports/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalUsers).toBeGreaterThanOrEqual(1);
    expect(res.body.data).toHaveProperty("activeManagers");
    expect(res.body.data).toHaveProperty("activeReceptionists");
    expect(res.body.data).toHaveProperty("activeRate");
    expect(res.body.data.monthlyGrowth).toBeInstanceOf(Array);
    expect(res.body.data.monthlyGrowth.length).toBe(12);
  });
});
