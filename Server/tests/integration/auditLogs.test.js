import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../src/app.js";
import { connectPlatformDB } from "../../src/database/platform/platformConnection.js";
import Account from "../../src/database/platform/models/account.model.js";
import Hotel from "../../src/database/platform/models/hotel.model.js";
import PlatformAuditLog from "../../src/database/platform/models/platformAuditLog.model.js";
import { ROLES } from "../../src/constants/roles.js";
import { ENV } from "../../src/config/env.js";

describe("Platform Audit Logging & Security Trail Integration", () => {
  let adminToken;
  let adminAccount;
  let testHotel;

  beforeAll(async () => {
    await connectPlatformDB();

    adminAccount = await Account.findOne({ email: "test_audit_admin@example.com" });
    if (!adminAccount) {
      adminAccount = await Account.create({
        fullName: "Security Auditor Admin",
        email: "test_audit_admin@example.com",
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

    testHotel = await Hotel.findOne({ tenant_db_name: "test_audit_hotel_db" });
    if (!testHotel) {
      testHotel = await Hotel.create({
        property_name: "Kaghan Continental Resort",
        ownerId: adminAccount._id,
        address: "Main Naran Road",
        city: "Naran",
        province: "Khyber Pakhtunkhwa",
        status: "pending",
        tenant_db_name: "test_audit_hotel_db",
      });
    }
  });

  afterAll(async () => {
    await PlatformAuditLog.deleteMany({ entityId: testHotel?._id?.toString() });
    await Hotel.deleteOne({ _id: testHotel?._id });
    await Account.deleteOne({ _id: adminAccount?._id });
  });

  it("rejects unauthorized access without valid token", async () => {
    const res = await request(app).get("/api/v1/audit-logs");
    expect(res.status).toBe(401);
  });

  it("auto-seeds and lists platform audit logs", async () => {
    const res = await request(app)
      .get("/api/v1/audit-logs?limit=5")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.data).toBeInstanceOf(Array);
    expect(res.body.data.total).toBeGreaterThan(0);

    const first = res.body.data.data[0];
    expect(first).toHaveProperty("action");
    expect(first).toHaveProperty("entity");
    expect(first).toHaveProperty("ip");
    expect(first).toHaveProperty("severity");
  });

  it("retrieves security event metrics and action breakdown", async () => {
    const res = await request(app)
      .get("/api/v1/audit-logs/stats")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalEvents).toBeGreaterThan(0);
    expect(res.body.data.breakdown).toBeInstanceOf(Array);
  });

  it("automatically creates audit log on administrative actions (e.g. hotel approval & suspension)", async () => {
    // 1. Approve test hotel
    const approveRes = await request(app)
      .patch(`/api/v1/hotels/${testHotel._id}/approve`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(approveRes.status).toBe(200);

    // 2. Verify audit entry was logged in PlatformAuditLog
    const auditApprove = await PlatformAuditLog.findOne({
      entityId: testHotel._id.toString(),
      action: "HOTEL_APPROVED",
    });
    expect(auditApprove).toBeDefined();
    expect(auditApprove.entity).toBe("Kaghan Continental Resort");

    // 3. Suspend hotel
    const suspendRes = await request(app)
      .patch(`/api/v1/hotels/${testHotel._id}/suspend`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ reason: "Safety compliance violation" });

    expect(suspendRes.status).toBe(200);

    // 4. Verify suspension was logged with WARNING severity
    const auditSuspend = await PlatformAuditLog.findOne({
      entityId: testHotel._id.toString(),
      action: "HOTEL_SUSPENDED",
    });
    expect(auditSuspend).toBeDefined();
    expect(auditSuspend.severity).toBe("WARNING");
    expect(auditSuspend.details?.reason).toBe("Safety compliance violation");
  });

  it("can record custom administrative audit log via API", async () => {
    const payload = {
      action: "SECURITY_SCAN_TRIGGERED",
      entity: "Platform Infrastructure",
      entityType: "security",
      severity: "INFO",
      details: { scope: "Network and Tenant Isolations", triggeredBy: "Super Admin" },
    };

    const res = await request(app)
      .post("/api/v1/audit-logs")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.action).toBe("SECURITY_SCAN_TRIGGERED");
  });
});
