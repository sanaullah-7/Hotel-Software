import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import crypto from "crypto";
import app from "../../../../app.js";
import {
  connectPlatformDB,
  closePlatformDB,
} from "../../../../database/platform/platformConnection.js";
import {
  getHotelConnection,
  closeAllHotelConnections,
} from "../../../../database/connectionManager.js";
import { getModel } from "../../../../database/hotel/modelFactory.js";
import { ROLES } from "../../../../constants/roles.js";
import Account from "../../../../database/platform/models/account.model.js";

const randomEmail = (prefix = "alt") =>
  `${prefix}_${crypto.randomBytes(4).toString("hex")}@hotel.com`;
const randomPhone = () =>
  `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe("Phase 5: Operation Alerts Backend Implementation & Contract Enforcement", () => {
  let adminTokenA, adminTokenB, userTokenA;
  let hotelA, hotelB;

  beforeAll(async () => {
    await connectPlatformDB();

    // Hotel A Admin Setup
    const emailA = randomEmail("adminA");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Admin Hotel A",
      email: emailA,
      phone: randomPhone(),
      password: "Password123!",
    });
    const loginA = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: emailA, password: "Password123!" });
    const tempTokenA = loginA.body.data.accessToken;

    const onboardA = await request(app)
      .post("/api/v1/provisioning/onboard")
      .set("Authorization", `Bearer ${tempTokenA}`)
      .send({
        property_name: "Alerts Hotel A",
        address: "100 Operational Way",
        city: "Lahore",
      });
    hotelA = onboardA.body.data.hotelId;

    const reloginA = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: emailA, password: "Password123!" });
    adminTokenA = reloginA.body.data.accessToken;

    // Hotel A Staff User Setup
    const emailUserA = randomEmail("userA");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Staff User Hotel A",
      email: emailUserA,
      phone: randomPhone(),
      password: "Password123!",
    });
    await Account.findOneAndUpdate(
      { email: emailUserA },
      { role: ROLES.HOTEL_USER, hotelId: new mongoose.Types.ObjectId(hotelA) }
    );
    const loginUserA = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: emailUserA, password: "Password123!" });
    userTokenA = loginUserA.body.data.accessToken;

    // Hotel B Admin Setup (for multi-tenant isolation)
    const emailB = randomEmail("adminB");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Admin Hotel B",
      email: emailB,
      phone: randomPhone(),
      password: "Password123!",
    });
    const loginB = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: emailB, password: "Password123!" });
    const tempTokenB = loginB.body.data.accessToken;

    const onboardB = await request(app)
      .post("/api/v1/provisioning/onboard")
      .set("Authorization", `Bearer ${tempTokenB}`)
      .send({
        property_name: "Alerts Hotel B",
        address: "200 Defense Boulevard",
        city: "Karachi",
      });
    hotelB = onboardB.body.data.hotelId;

    const reloginB = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: emailB, password: "Password123!" });
    adminTokenB = reloginB.body.data.accessToken;
  });

  afterAll(async () => {
    try {
      if (hotelA) {
        const connA = await getHotelConnection(hotelA);
        await connA.dropDatabase();
      }
      if (hotelB) {
        const connB = await getHotelConnection(hotelB);
        await connB.dropDatabase();
      }
      await closeAllHotelConnections();
      await closePlatformDB();
    } catch (e) {
      console.warn("Cleanup warning:", e.message);
    }
  });

  describe("1. Authentication & Security Gate", () => {
    it("should reject unauthenticated GET /operations-alerts with 401", async () => {
      const res = await request(app).get("/api/v1/hotel/operations-alerts");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject unauthenticated POST /operations-alerts with 401", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/operations-alerts")
        .send({ title: "AC Fail", message: "Broken compressor" });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject unauthenticated PATCH /operations-alerts/:id with 401", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .patch(`/api/v1/hotel/operations-alerts/${fakeId}`)
        .send({ status: "IN_PROGRESS" });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject unauthenticated DELETE /operations-alerts/:id with 401", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).delete(`/api/v1/hotel/operations-alerts/${fakeId}`);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("2. POST /api/v1/hotel/operations-alerts (Create & Invariants)", () => {
    it("should create alert with server-generated alert_ref, default status OPEN, and active true", async () => {
      const payload = {
        title: "VIP Presidential Arrival",
        message: "Lady Evelyn Montague landing at private hangar at 5:45 PM.",
        department: "VIP_ARRIVALS",
        severity: "CRITICAL",
        action_required: "Inspect suite amenities and dispatch luxury housefloor deployment kit.",
        location: "Presidential Suite 501",
        guest_name: "Lady Evelyn Montague",
        assigned_to: "Concierge Team (Sarah)",
      };

      const res = await request(app)
        .post("/api/v1/hotel/operations-alerts")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();

      const created = res.body.data;
      expect(created._id).toBeDefined();
      expect(created.alert_ref).toMatch(/^ALT-\d{8}-[A-F0-9]{4}$/);
      expect(created.title).toBe(payload.title);
      expect(created.message).toBe(payload.message);
      expect(created.department).toBe("VIP_ARRIVALS");
      expect(created.type).toBe("VIP_ARRIVALS");
      expect(created.severity).toBe("CRITICAL");
      expect(created.status).toBe("OPEN");
      expect(created.is_active).toBe(true);
      expect(created.action_required).toBe(payload.action_required);
      expect(created.location).toBe(payload.location);
      expect(created.guest_name).toBe(payload.guest_name);
      expect(created.assigned_to).toBe(payload.assigned_to);
      expect(created.reported_by).toBe("Admin Hotel A");
      expect(created.resolved_at).toBeNull();
    });

    it("should ignore client-supplied alert_ref and generate unique reference", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/operations-alerts")
        .set("Authorization", `Bearer ${userTokenA}`)
        .send({
          title: "AC Cooling Malfunction",
          message: "Guest reported ambient room temperature rising to 78°F.",
          department: "MAINTENANCE",
          alert_ref: "FAKE-REF-9999",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.alert_ref).not.toBe("FAKE-REF-9999");
      expect(res.body.data.alert_ref).toMatch(/^ALT-\d{8}-[A-F0-9]{4}$/);
    });

    it("should reject creation with invalid department", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/operations-alerts")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          title: "Bad Department Alert",
          message: "Something broke",
          department: "INVALID_DEPT_XYZ",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.details).toContain("Invalid alert department");
    });

    it("should reject creation with invalid severity", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/operations-alerts")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          title: "Bad Severity Alert",
          message: "Something broke",
          severity: "SUPER_CRITICAL",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.details).toContain("Invalid alert severity");
    });

    it("should reject creation with missing title or message", async () => {
      const res1 = await request(app)
        .post("/api/v1/hotel/operations-alerts")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ message: "No title provided" });
      expect(res1.status).toBe(400);

      const res2 = await request(app)
        .post("/api/v1/hotel/operations-alerts")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ title: "No message provided" });
      expect(res2.status).toBe(400);
    });
  });

  describe("3. GET /api/v1/hotel/operations-alerts (Read, Filter, Search, Pagination)", () => {
    let alert1Id, alert2Id, alert3Id;

    beforeAll(async () => {
      // Seed 3 known alerts in Hotel A
      const a1 = await request(app)
        .post("/api/v1/hotel/operations-alerts")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          title: "Housekeeping Turnover Villa 108",
          message: "Requires deep sanitization and hypoallergenic bedding.",
          department: "HOUSEKEEPING",
          severity: "HIGH",
          location: "Villa 108",
        });
      alert1Id = a1.body.data._id;

      const a2 = await request(app)
        .post("/api/v1/hotel/operations-alerts")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          title: "Special Dietary F&B Anniversary",
          message: "Severe shellfish allergy in Suite 317.",
          department: "FOOD_AND_BEVERAGE",
          severity: "MEDIUM",
          location: "Suite 317",
        });
      alert2Id = a2.body.data._id;

      const a3 = await request(app)
        .post("/api/v1/hotel/operations-alerts")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          title: "Security VIP Escort",
          message: "Rolls-Royce VIP airport transfer.",
          department: "SECURITY_FRONT_DESK",
          severity: "LOW",
          location: "VIP Terminal",
        });
      alert3Id = a3.body.data._id;
    });

    it("should list alerts with standard pagination metadata", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/operations-alerts?page=1&limit=10")
        .set("Authorization", `Bearer ${userTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(10);
      expect(res.body.meta.total).toBeGreaterThanOrEqual(3);
    });

    it("should filter alerts by department", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/operations-alerts?department=HOUSEKEEPING")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((a) => a.department === "HOUSEKEEPING")).toBe(true);
    });

    it("should filter alerts by severity", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/operations-alerts?severity=CRITICAL")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((a) => a.severity === "CRITICAL")).toBe(true);
    });

    it("should filter alerts by status", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/operations-alerts?status=OPEN")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((a) => a.status === "OPEN")).toBe(true);
    });

    it("should filter alerts by search term", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/operations-alerts?search=shellfish")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].location).toBe("Suite 317");
    });

    it("should fetch single alert by valid ID", async () => {
      const res = await request(app)
        .get(`/api/v1/hotel/operations-alerts/${alert1Id}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(alert1Id);
      expect(res.body.data.location).toBe("Villa 108");
    });

    it("should return 404 when alert does not exist", async () => {
      const nonExistent = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/api/v1/hotel/operations-alerts/${nonExistent}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for malformed ID parameter", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/operations-alerts/not-a-valid-id")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("4. PATCH /api/v1/hotel/operations-alerts/:id (Update & Lifecycle Invariant)", () => {
    let testAlertId;

    beforeAll(async () => {
      const res = await request(app)
        .post("/api/v1/hotel/operations-alerts")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          title: "HVAC Pipe Leakage",
          message: "Ceiling dampness in hallway 3",
          department: "MAINTENANCE",
          severity: "MEDIUM",
        });
      testAlertId = res.body.data._id;
    });

    it("should transition status to IN_PROGRESS (Acknowledge flow)", async () => {
      const res = await request(app)
        .patch(`/api/v1/hotel/operations-alerts/${testAlertId}`)
        .set("Authorization", `Bearer ${userTokenA}`)
        .send({ status: "IN_PROGRESS" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("IN_PROGRESS");
      expect(res.body.data.is_active).toBe(true);
      expect(res.body.data.resolved_at).toBeNull();
    });

    it("should escalate urgency to CRITICAL", async () => {
      const res = await request(app)
        .patch(`/api/v1/hotel/operations-alerts/${testAlertId}`)
        .set("Authorization", `Bearer ${userTokenA}`)
        .send({ severity: "CRITICAL" });

      expect(res.status).toBe(200);
      expect(res.body.data.severity).toBe("CRITICAL");
    });

    it("should transition status to RESOLVED, setting is_active false and server resolved_at timestamp", async () => {
      const res = await request(app)
        .patch(`/api/v1/hotel/operations-alerts/${testAlertId}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ status: "RESOLVED" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("RESOLVED");
      expect(res.body.data.is_active).toBe(false);
      expect(res.body.data.resolved_at).toBeDefined();
      expect(new Date(res.body.data.resolved_at).getTime()).toBeGreaterThan(0);
    });

    it("should clear resolved_at and set is_active true when reopening a resolved alert", async () => {
      const res = await request(app)
        .patch(`/api/v1/hotel/operations-alerts/${testAlertId}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ status: "OPEN" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("OPEN");
      expect(res.body.data.is_active).toBe(true);
      expect(res.body.data.resolved_at).toBeNull();
    });

    it("should protect immutable fields from modification", async () => {
      const original = await request(app)
        .get(`/api/v1/hotel/operations-alerts/${testAlertId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      const originalRef = original.body.data.alert_ref;
      const originalCreated = original.body.data.created_at;

      const res = await request(app)
        .patch(`/api/v1/hotel/operations-alerts/${testAlertId}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          title: "Updated Title HVAC",
          alert_ref: "TAMPERED-REF",
          created_at: new Date("2020-01-01").toISOString(),
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("Updated Title HVAC");
      expect(res.body.data.alert_ref).toBe(originalRef);
      expect(res.body.data.created_at).toBe(originalCreated);
    });
  });

  describe("5. DELETE /api/v1/hotel/operations-alerts/:id", () => {
    let alertToDeleteId;

    beforeAll(async () => {
      const res = await request(app)
        .post("/api/v1/hotel/operations-alerts")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          title: "Temporary test alert",
          message: "Will be deleted",
          department: "GENERAL",
        });
      alertToDeleteId = res.body.data._id;
    });

    it("should reject deletion by HOTEL_USER with 403 Forbidden", async () => {
      const res = await request(app)
        .delete(`/api/v1/hotel/operations-alerts/${alertToDeleteId}`)
        .set("Authorization", `Bearer ${userTokenA}`);

      expect(res.status).toBe(403);
    });

    it("should allow deletion by HOTEL_ADMIN and return 404 on subsequent get", async () => {
      const res = await request(app)
        .delete(`/api/v1/hotel/operations-alerts/${alertToDeleteId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const checkRes = await request(app)
        .get(`/api/v1/hotel/operations-alerts/${alertToDeleteId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(checkRes.status).toBe(404);
    });
  });

  describe("6. Tenant Isolation Enforcement", () => {
    let hotelAAlertId;

    beforeAll(async () => {
      const res = await request(app)
        .post("/api/v1/hotel/operations-alerts")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          title: "Secret Hotel A Alert",
          message: "Confidential VIP data for Hotel A only",
          department: "VIP_ARRIVALS",
        });
      hotelAAlertId = res.body.data._id;
    });

    it("should return 404 when Hotel B attempts to read Hotel A alert by ID", async () => {
      const res = await request(app)
        .get(`/api/v1/hotel/operations-alerts/${hotelAAlertId}`)
        .set("Authorization", `Bearer ${adminTokenB}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 404 when Hotel B attempts to update Hotel A alert", async () => {
      const res = await request(app)
        .patch(`/api/v1/hotel/operations-alerts/${hotelAAlertId}`)
        .set("Authorization", `Bearer ${adminTokenB}`)
        .send({ title: "Tampered by Hotel B" });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 404 when Hotel B attempts to delete Hotel A alert", async () => {
      const res = await request(app)
        .delete(`/api/v1/hotel/operations-alerts/${hotelAAlertId}`)
        .set("Authorization", `Bearer ${adminTokenB}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should not return Hotel A alerts in Hotel B list", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/operations-alerts")
        .set("Authorization", `Bearer ${adminTokenB}`);

      expect(res.status).toBe(200);
      const found = res.body.data.some((a) => a._id === hotelAAlertId);
      expect(found).toBe(false);
    });
  });
});
