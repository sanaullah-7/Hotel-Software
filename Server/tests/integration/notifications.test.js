import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../src/app.js";
import { connectPlatformDB } from "../../src/database/platform/platformConnection.js";
import Account from "../../src/database/platform/models/account.model.js";
import PlatformNotification from "../../src/database/platform/models/platformNotification.model.js";
import { ROLES } from "../../src/constants/roles.js";
import { ENV } from "../../src/config/env.js";

describe("Platform Notifications & Alerts Integration Suite", () => {
  let adminToken;
  let adminAccount;
  let testNotification;

  beforeAll(async () => {
    await connectPlatformDB();

    adminAccount = await Account.findOne({ email: "test_notif_admin@example.com" });
    if (!adminAccount) {
      adminAccount = await Account.create({
        fullName: "Notification Super Admin",
        email: "test_notif_admin@example.com",
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

    testNotification = await PlatformNotification.create({
      title: "Integration Test Alert",
      message: "Automated alert verification message",
      type: "warning",
      category: "system",
      read: false,
    });
  });

  afterAll(async () => {
    await PlatformNotification.deleteMany({ title: "Integration Test Alert" });
    await Account.deleteOne({ _id: adminAccount?._id });
  });

  it("rejects unauthorized access without valid token", async () => {
    const res = await request(app).get("/api/v1/notifications");
    expect(res.status).toBe(401);
  });

  it("retrieves paginated platform notifications", async () => {
    const res = await request(app)
      .get("/api/v1/notifications")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.data).toBeInstanceOf(Array);
    expect(res.body.data.total).toBeGreaterThanOrEqual(1);
    expect(res.body.data).toHaveProperty("unreadCount");
  });

  it("retrieves live unread notifications count", async () => {
    const res = await request(app)
      .get("/api/v1/notifications/unread-count")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.count).toBeGreaterThanOrEqual(0);
  });

  it("creates a new platform notification", async () => {
    const res = await request(app)
      .post("/api/v1/notifications")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Integration Test Alert",
        message: "A newly created notification test",
        type: "info",
        category: "hotel",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Integration Test Alert");
    expect(res.body.data.read).toBe(false);
  });

  it("marks a notification as read", async () => {
    const res = await request(app)
      .patch(`/api/v1/notifications/${testNotification._id}/read`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.notification.read).toBe(true);
  });

  it("marks all notifications as read", async () => {
    const res = await request(app)
      .patch("/api/v1/notifications/read-all")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.unreadCount).toBe(0);
  });

  it("deletes / dismisses a notification", async () => {
    const res = await request(app)
      .delete(`/api/v1/notifications/${testNotification._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
