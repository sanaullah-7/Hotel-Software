import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../src/app.js";
import { connectPlatformDB } from "../../src/database/platform/platformConnection.js";
import Account from "../../src/database/platform/models/account.model.js";
import Hotel from "../../src/database/platform/models/hotel.model.js";
import PlatformTransaction from "../../src/database/platform/models/platformTransaction.model.js";
import { ROLES } from "../../src/constants/roles.js";
import { ENV } from "../../src/config/env.js";

describe("Platform Finance & Revenue Telemetry Integration", () => {
  let adminToken;
  let adminAccount;
  let testHotel;

  beforeAll(async () => {
    await connectPlatformDB();

    adminAccount = await Account.findOne({ email: "test_finance_admin@example.com" });
    if (!adminAccount) {
      adminAccount = await Account.create({
        fullName: "Finance Platform Tester",
        email: "test_finance_admin@example.com",
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

    testHotel = await Hotel.findOne({ tenant_db_name: "test_finance_hotel_db" });
    if (!testHotel) {
      testHotel = await Hotel.create({
        property_name: "Serena Shigar Fort",
        ownerId: adminAccount._id,
        address: "Shigar Valley",
        city: "Skardu",
        province: "Gilgit-Baltistan",
        status: "active",
        tenant_db_name: "test_finance_hotel_db",
        subscriptionPlan: "ENTERPRISE",
      });
    }
  });

  afterAll(async () => {
    await PlatformTransaction.deleteMany({ hotelId: testHotel?._id });
    await Hotel.deleteOne({ _id: testHotel?._id });
    await Account.deleteOne({ _id: adminAccount?._id });
  });

  it("rejects unauthenticated requests to finance overview", async () => {
    const res = await request(app).get("/api/v1/analytics/overview");
    expect(res.status).toBe(401);
  });

  it("calculates real revenue overview metrics", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/overview")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.monthlyRevenue).toBeGreaterThanOrEqual(0);
    expect(res.body.data.totalRevenue).toBeGreaterThan(0);
    expect(typeof res.body.data.revenueGrowth).toBe("number");
  });

  it("returns 12-month revenue trend telemetry", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/revenue")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBe(12);
    expect(res.body.data[0]).toHaveProperty("month");
    expect(res.body.data[0]).toHaveProperty("revenue");
    expect(res.body.data[0]).toHaveProperty("subscriptions");
  });

  it("queries the platform transaction ledger with pagination and filters", async () => {
    const res = await request(app)
      .get("/api/v1/finance/transactions?limit=5")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.data).toBeInstanceOf(Array);
    expect(res.body.data.total).toBeGreaterThan(0);

    const firstTx = res.body.data.data[0];
    expect(firstTx).toHaveProperty("id");
    expect(firstTx).toHaveProperty("amount");
    expect(firstTx).toHaveProperty("hotelName");
  });

  it("records a new platform transaction in the ledger", async () => {
    const payload = {
      hotelId: testHotel._id.toString(),
      planTier: "ENTERPRISE",
      planName: "Enterprise Elite License",
      amount: 29999,
      type: "SUBSCRIPTION_RENEWAL",
      status: "SUCCESS",
      paymentMethod: "Standard Chartered Corporate Wire",
      notes: "Annual upfront discount applied",
    };

    const res = await request(app)
      .post("/api/v1/finance/transactions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.transaction.amount).toBe(29999);
    expect(res.body.data.transaction.transactionId).toMatch(/^TXN-/);
  });

  it("retrieves real platform activity log", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/recent-activity")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
