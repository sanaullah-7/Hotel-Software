import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import crypto from "crypto";
import app from "../../../../app.js";
import { connectPlatformDB, closePlatformDB } from "../../../../database/platform/platformConnection.js";
import { closeAllHotelConnections } from "../../../../database/connectionManager.js";
import { getModel } from "../../../../database/hotel/modelFactory.js";

const randomEmail = (prefix = "lf") => `${prefix}_${crypto.randomBytes(4).toString("hex")}@hotel.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe("Phase 7 Step 4: Lost and Found Backend Migration & Integrity", () => {
  let adminTokenA, adminTokenB;
  let hotelA, hotelB;
  let employeeA, employeeB;
  let testItemId;
  let customRefNum;

  beforeAll(async () => {
    await connectPlatformDB();

    // 1. Setup Tenant A
    const emailA = randomEmail("lf_admin_a");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Lost Found Admin A",
      email: emailA,
      phone: randomPhone(),
      password: "Password123!"
    });
    const loginA = await request(app).post("/api/v1/auth/login").send({ email: emailA, password: "Password123!" });
    const tempTokenA = loginA.body.data.accessToken;

    const onboardA = await request(app).post("/api/v1/provisioning/onboard")
      .set("Authorization", `Bearer ${tempTokenA}`)
      .send({
        property_name: "Lost Found Hotel A",
        address: "400 Custody Way",
        city: "Karachi"
      });
    hotelA = onboardA.body.data.hotelId;

    const reloginA = await request(app).post("/api/v1/auth/login").send({ email: emailA, password: "Password123!" });
    adminTokenA = reloginA.body.data.accessToken;

    // Department & Employee for Tenant A
    const deptResA = await request(app).post("/api/v1/hotel/departments")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({
        name: "Lost & Found Services A",
        code: `LFA_${crypto.randomBytes(2).toString("hex")}`.toUpperCase()
      });
    const deptA = deptResA.body.data;

    const empResA = await request(app).post("/api/v1/hotel/employees")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({
        employee_ref: `EMP-LF-A-${crypto.randomBytes(2).toString("hex")}`.toUpperCase(),
        first_name: "Sarah",
        last_name: "Connor",
        phone: randomPhone(),
        email: randomEmail("emp_lf_a"),
        department_id: deptA._id,
        job_title: "Housekeeper"
      });
    employeeA = empResA.body.data;

    // 2. Setup Tenant B
    const emailB = randomEmail("lf_admin_b");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Lost Found Admin B",
      email: emailB,
      phone: randomPhone(),
      password: "Password123!"
    });
    const loginB = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "Password123!" });
    const tempTokenB = loginB.body.data.accessToken;

    const onboardB = await request(app).post("/api/v1/provisioning/onboard")
      .set("Authorization", `Bearer ${tempTokenB}`)
      .send({
        property_name: "Lost Found Hotel B",
        address: "500 Rival Way",
        city: "Lahore"
      });
    hotelB = onboardB.body.data.hotelId;

    const reloginB = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "Password123!" });
    adminTokenB = reloginB.body.data.accessToken;

    // Department & Employee for Tenant B
    const deptResB = await request(app).post("/api/v1/hotel/departments")
      .set("Authorization", `Bearer ${adminTokenB}`)
      .send({
        name: "Lost & Found Services B",
        code: `LFB_${crypto.randomBytes(2).toString("hex")}`.toUpperCase()
      });
    const deptB = deptResB.body.data;

    const empResB = await request(app).post("/api/v1/hotel/employees")
      .set("Authorization", `Bearer ${adminTokenB}`)
      .send({
        employee_ref: `EMP-LF-B-${crypto.randomBytes(2).toString("hex")}`.toUpperCase(),
        first_name: "Marcus",
        last_name: "Wright",
        phone: randomPhone(),
        email: randomEmail("emp_lf_b"),
        department_id: deptB._id,
        job_title: "Security Officer"
      });
    employeeB = empResB.body.data;
  });

  afterAll(async () => {
    await closeAllHotelConnections();
    await closePlatformDB();
  });

  describe("Item Creation & Input Validation", () => {
    it("should successfully create a valid Lost & Found item with auto-generated reference number", async () => {
      const res = await request(app).post("/api/v1/hotel/housekeeping/lost-and-found")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          item_type: "Electronics",
          item_name: "iPhone 13 Charger",
          description: "White color Apple charger",
          found_location: "Room 101",
          found_by: employeeA._id,
          found_date: "2026-02-01T10:00:00.000Z"
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("_id");
      expect(res.body.data.reference_number).toMatch(/^LF-/);
      expect(res.body.data.status).toBe("REPORTED");
      expect(res.body.data.item_type).toBe("Electronics");
      expect(res.body.data.item_name).toBe("iPhone 13 Charger");
      expect(res.body.data.found_by._id).toBe(employeeA._id);
      expect(res.body.data.found_by.first_name).toBe("Sarah");

      testItemId = res.body.data._id;
    });

    it("should reject creation when required fields are missing", async () => {
      const res = await request(app).post("/api/v1/hotel/housekeeping/lost-and-found")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          item_name: "Missing description and location"
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject creation when referencing an employee from another tenant", async () => {
      const res = await request(app).post("/api/v1/hotel/housekeeping/lost-and-found")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          item_type: "Jewelry",
          item_name: "Gold Bracelet",
          description: "Thin gold bracelet",
          found_location: "Room 205",
          found_by: employeeB._id // Tenant B employee!
        });

      expect(res.status).toBe(404);
      expect(res.body.error.message).toContain("Employee not found in this hotel");
    });

    it("should allow creating with custom reference number and reject duplicate reference number", async () => {
      customRefNum = `LF-CUSTOM-${Date.now()}`;
      const res1 = await request(app).post("/api/v1/hotel/housekeeping/lost-and-found")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          reference_number: customRefNum,
          item_type: "Accessories",
          item_name: "Leather Wallet",
          description: "Brown leather wallet with ID cards",
          found_location: "Lobby"
        });

      expect(res1.status).toBe(201);
      expect(res1.body.data.reference_number).toBe(customRefNum);

      // Attempt duplicate
      const res2 = await request(app).post("/api/v1/hotel/housekeeping/lost-and-found")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          reference_number: customRefNum,
          item_type: "Duplicate Item",
          description: "Should fail due to duplicate ref",
          found_location: "Lobby"
        });

      expect(res2.status).toBe(409);
      expect(res2.body.error.message).toContain("Reference number already exists");
    });
  });

  describe("Item Querying & Backend Filtering", () => {
    it("should list items for Tenant A with pagination", async () => {
      const res = await request(app).get("/api/v1/hotel/housekeeping/lost-and-found")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.meta).toBeDefined();
    });

    it("should filter items by status and search keyword", async () => {
      const res = await request(app).get("/api/v1/hotel/housekeeping/lost-and-found?status=REPORTED&q=iPhone")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0]._id).toBe(testItemId);
    });

    it("should retrieve a single item by ID with populated finder details", async () => {
      const res = await request(app).get(`/api/v1/hotel/housekeeping/lost-and-found/${testItemId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(testItemId);
      expect(res.body.data.found_by.first_name).toBe("Sarah");
      expect(res.body.data.found_by.last_name).toBe("Connor");
    });
  });

  describe("Lifecycle Transitions & Custody Enforcement", () => {
    it("should update item details while in REPORTED state", async () => {
      const res = await request(app).put(`/api/v1/hotel/housekeeping/lost-and-found/${testItemId}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          description: "White Apple 20W USB-C charger with lightning cable",
          found_location: "Room 101 - Under bedside table"
        });

      expect(res.status).toBe(200);
      expect(res.body.data.description).toContain("20W USB-C");
      expect(res.body.data.found_location).toContain("Under bedside table");
      expect(res.body.data.status).toBe("REPORTED");
    });

    it("should transition item to CLAIMED and persist claimant information", async () => {
      const res = await request(app).put(`/api/v1/hotel/housekeeping/lost-and-found/${testItemId}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          status: "CLAIMED",
          claimed_by: "Alice Guest (ID: PASSPORT-98765)",
          claimed_date: "2026-02-05T14:00:00.000Z"
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("CLAIMED");
      expect(res.body.data.claimed_by).toBe("Alice Guest (ID: PASSPORT-98765)");
      expect(res.body.data.claimed_date).toBe("2026-02-05T14:00:00.000Z");
    });

    it("should PROHIBIT invalid transitions from CLAIMED back to REPORTED or DISCARDED", async () => {
      // Once claimed, chain of custody is sealed.
      const res1 = await request(app).put(`/api/v1/hotel/housekeeping/lost-and-found/${testItemId}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          status: "REPORTED"
        });

      expect(res1.status).toBe(400);
      expect(res1.body.error.message).toContain("Invalid status transition from CLAIMED to REPORTED");

      const res2 = await request(app).put(`/api/v1/hotel/housekeeping/lost-and-found/${testItemId}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          status: "DISCARDED"
        });

      expect(res2.status).toBe(400);
      expect(res2.body.error.message).toContain("Invalid status transition from CLAIMED to DISCARDED");
    });

    it("should support DISCARDED disposition from REPORTED and enforce terminal state", async () => {
      const itemRes = await request(app).post("/api/v1/hotel/housekeeping/lost-and-found")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          item_type: "Perishable",
          item_name: "Opened Fruit Basket",
          description: "Left in room after checkout",
          found_location: "Room 303"
        });
      const discardId = itemRes.body.data._id;

      // Transition to DISCARDED
      const discardRes = await request(app).put(`/api/v1/hotel/housekeeping/lost-and-found/${discardId}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ status: "DISCARDED" });

      expect(discardRes.status).toBe(200);
      expect(discardRes.body.data.status).toBe("DISCARDED");

      // Terminal: cannot transition to CLAIMED
      const invalidRes = await request(app).put(`/api/v1/hotel/housekeeping/lost-and-found/${discardId}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ status: "CLAIMED" });

      expect(invalidRes.status).toBe(400);
      expect(invalidRes.body.error.message).toContain("Invalid status transition from DISCARDED to CLAIMED");
    });

    it("should support DONATED disposition from REPORTED and enforce terminal state", async () => {
      const itemRes = await request(app).post("/api/v1/hotel/housekeeping/lost-and-found")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          item_type: "Clothing",
          item_name: "Winter Coat",
          description: "Unclaimed over 90 days",
          found_location: "Lobby Coat Rack"
        });
      const donateId = itemRes.body.data._id;

      // Transition to DONATED
      const donateRes = await request(app).put(`/api/v1/hotel/housekeeping/lost-and-found/${donateId}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ status: "DONATED" });

      expect(donateRes.status).toBe(200);
      expect(donateRes.body.data.status).toBe("DONATED");

      // Terminal: cannot transition to REPORTED
      const invalidRes = await request(app).put(`/api/v1/hotel/housekeeping/lost-and-found/${donateId}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ status: "REPORTED" });

      expect(invalidRes.status).toBe(400);
      expect(invalidRes.body.error.message).toContain("Invalid status transition from DONATED to REPORTED");
    });
  });

  describe("Soft Deletion & Historical Audit Preservation", () => {
    it("should soft-delete item so it is excluded from active queries while preserving audit record", async () => {
      const itemRes = await request(app).post("/api/v1/hotel/housekeeping/lost-and-found")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          item_type: "Other",
          item_name: "Broken Sunglasses",
          description: "Scratched glasses",
          found_location: "Pool Area"
        });
      const toDeleteId = itemRes.body.data._id;

      // Soft delete
      const delRes = await request(app).delete(`/api/v1/hotel/housekeeping/lost-and-found/${toDeleteId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(delRes.status).toBe(200);
      expect(delRes.body.message).toContain("deleted successfully");

      // Excluded from active list
      const listRes = await request(app).get("/api/v1/hotel/housekeeping/lost-and-found")
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(listRes.body.data.some(t => t._id === toDeleteId)).toBe(false);

      // Subsequent fetch or delete returns 404
      const getRes = await request(app).get(`/api/v1/hotel/housekeeping/lost-and-found/${toDeleteId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(getRes.status).toBe(404);

      const delAgain = await request(app).delete(`/api/v1/hotel/housekeeping/lost-and-found/${toDeleteId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(delAgain.status).toBe(404);
    });
  });

  describe("Multi-Tenant Isolation", () => {
    it("Tenant B cannot list Tenant A's Lost & Found items", async () => {
      const res = await request(app).get("/api/v1/hotel/housekeeping/lost-and-found")
        .set("Authorization", `Bearer ${adminTokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.data.some(t => t._id === testItemId)).toBe(false);
    });

    it("Tenant B receives 404 when attempting to access Tenant A's item by ID", async () => {
      const res = await request(app).get(`/api/v1/hotel/housekeeping/lost-and-found/${testItemId}`)
        .set("Authorization", `Bearer ${adminTokenB}`);

      expect(res.status).toBe(404);
      expect(res.body.error.message).toContain("Lost & Found item not found");
    });

    it("Tenant B receives 404 when attempting to update Tenant A's item", async () => {
      const res = await request(app).put(`/api/v1/hotel/housekeeping/lost-and-found/${testItemId}`)
        .set("Authorization", `Bearer ${adminTokenB}`)
        .send({
          description: "Malicious update from Tenant B"
        });

      expect(res.status).toBe(404);
    });

    it("Tenant B receives 404 when attempting to delete Tenant A's item", async () => {
      const res = await request(app).delete(`/api/v1/hotel/housekeeping/lost-and-found/${testItemId}`)
        .set("Authorization", `Bearer ${adminTokenB}`);

      expect(res.status).toBe(404);
    });
  });
});
