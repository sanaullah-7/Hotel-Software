import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import app from "../../src/app.js";
import { connectPlatformDB } from "../../src/database/platform/platformConnection.js";
import Account from "../../src/database/platform/models/account.model.js";
import Hotel from "../../src/database/platform/models/hotel.model.js";
import SubscriptionPlan from "../../src/database/platform/models/subscriptionPlan.model.js";
import Subscription from "../../src/database/platform/models/subscription.model.js";
import { ROLES } from "../../src/constants/roles.js";
import { ENV } from "../../src/config/env.js";

describe("Platform Subscriptions Integration Engine", () => {
  let adminToken;
  let adminAccount;
  let testHotel;

  beforeAll(async () => {
    await connectPlatformDB();

    // 1. Create or ensure a test super admin account
    adminAccount = await Account.findOne({ email: "test_sub_admin@example.com" });
    if (!adminAccount) {
      adminAccount = await Account.create({
        fullName: "Platform Admin Tester",
        email: "test_sub_admin@example.com",
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

    // 2. Create a test active hotel
    testHotel = await Hotel.findOne({ tenant_db_name: "test_sub_hotel_db" });
    if (!testHotel) {
      testHotel = await Hotel.create({
        property_name: "Grand Hunza Palace",
        ownerId: adminAccount._id,
        address: "Karakoram Highway",
        city: "Hunza",
        province: "Gilgit-Baltistan",
        status: "active",
        tenant_db_name: "test_sub_hotel_db",
        subscriptionPlan: "STANDARD",
      });
    }
  });

  afterAll(async () => {
    // Clean up test records
    await Subscription.deleteMany({ hotelId: testHotel?._id });
    await Hotel.deleteOne({ _id: testHotel?._id });
    await Account.deleteOne({ _id: adminAccount?._id });
  });

  it("rejects unauthorized access without valid token", async () => {
    const res = await request(app).get("/api/v1/subscriptions/plans");
    expect(res.status).toBe(401);
  });

  it("auto-seeds and fetches subscription plans", async () => {
    const res = await request(app)
      .get("/api/v1/subscriptions/plans")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(4);

    const proPlan = res.body.data.find((p) => p.tier === "PRO");
    expect(proPlan).toBeDefined();
    expect(proPlan.price).toBe(12999);
  });

  it("updates plan pricing and capacity limits", async () => {
    const plansRes = await request(app)
      .get("/api/v1/subscriptions/plans")
      .set("Authorization", `Bearer ${adminToken}`);

    const targetPlan = plansRes.body.data[0];

    const updateRes = await request(app)
      .patch(`/api/v1/subscriptions/plans/${targetPlan.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ maxRooms: 35, price: 5499 });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.maxRooms).toBe(35);
    expect(updateRes.body.data.price).toBe(5499);
  });

  it("synchronizes and lists hotel subscriptions", async () => {
    const res = await request(app)
      .get("/api/v1/subscriptions?search=Grand Hunza Palace")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.data).toBeInstanceOf(Array);
    expect(res.body.data.total).toBeGreaterThan(0);

    const subForTestHotel = res.body.data.data.find(
      (s) => s.hotelName === "Grand Hunza Palace"
    );
    expect(subForTestHotel).toBeDefined();
    expect(subForTestHotel.status).toBe("ACTIVE");
  });

  it("calculates real subscription statistics and MRR", async () => {
    const res = await request(app)
      .get("/api/v1/subscriptions/stats")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.active).toBeGreaterThanOrEqual(1);
    expect(res.body.data.totalRevenueMonthly).toBeGreaterThan(0);
    expect(res.body.data.distribution).toBeInstanceOf(Array);
  });

  it("can update subscription status, renew dates, and change tier", async () => {
    const listRes = await request(app)
      .get("/api/v1/subscriptions?search=Hunza")
      .set("Authorization", `Bearer ${adminToken}`);

    const sub = listRes.body.data.data[0];
    expect(sub).toBeDefined();

    const futureDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

    const updateRes = await request(app)
      .patch(`/api/v1/subscriptions/${sub.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        status: "ACTIVE",
        planTier: "ENTERPRISE",
        amount: 29999,
        endDate: futureDate,
        paymentMethod: "Meezan Bank Corporate",
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.subscription.planTier).toBe("ENTERPRISE");
    expect(updateRes.body.data.subscription.amount).toBe(29999);
    expect(updateRes.body.data.subscription.paymentMethod).toBe("Meezan Bank Corporate");
  });
});
