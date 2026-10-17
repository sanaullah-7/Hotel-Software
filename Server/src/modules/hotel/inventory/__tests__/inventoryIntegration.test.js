import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import crypto from "crypto";
import mongoose from "mongoose";
import app from "../../../../app.js";
import { connectPlatformDB, closePlatformDB } from "../../../../database/platform/platformConnection.js";
import { closeAllHotelConnections } from "../../../../database/connectionManager.js";
import { getModel } from "../../../../database/hotel/modelFactory.js";

const randomEmail = (prefix = "inv_api") => `${prefix}_${crypto.randomBytes(4).toString("hex")}@hotel.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe("Inventory Module — Step 2: Backend Service, API, Stock Operations & Integration Tests", () => {
  let adminTokenA, staffTokenA, adminTokenB;
  let hotelA, hotelB;
  let roomA;
  let employeeA;
  let createdItemIdA;
  let reportedIncidentIdA;

  beforeAll(async () => {
    await connectPlatformDB();

    // 1. Setup Tenant A
    const emailA = randomEmail("inv_admin_a");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Inventory Admin A",
      email: emailA,
      phone: randomPhone(),
      password: "Password123!",
    });
    const loginA = await request(app).post("/api/v1/auth/login").send({ email: emailA, password: "Password123!" });
    const tempTokenA = loginA.body.data.accessToken;

    const onboardA = await request(app)
      .post("/api/v1/provisioning/onboard")
      .set("Authorization", `Bearer ${tempTokenA}`)
      .send({
        property_name: "Inventory Grand Resort A",
        address: "100 Warehouse Way",
        city: "Karachi",
      });
    hotelA = onboardA.body.data.hotelId;

    const reloginA = await request(app).post("/api/v1/auth/login").send({ email: emailA, password: "Password123!" });
    adminTokenA = reloginA.body.data.accessToken;

    // Dept & Employee for Tenant A
    const deptResA = await request(app)
      .post("/api/v1/hotel/departments")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({
        name: "Inventory Logistics A",
        code: `LOGA_${crypto.randomBytes(2).toString("hex")}`.toUpperCase(),
      });
    const deptA = deptResA.body.data;

    const empResA = await request(app)
      .post("/api/v1/hotel/employees")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({
        employee_ref: `EMP-INV-A-${crypto.randomBytes(2).toString("hex")}`.toUpperCase(),
        first_name: "Marcus",
        last_name: "Vance",
        phone: randomPhone(),
        email: randomEmail("emp_a"),
        department_id: deptA._id,
        job_title: "Store Manager",
      });
    employeeA = empResA.body.data;

    // Room for Tenant A
    const roomTypeResA = await request(app)
      .post("/api/v1/hotel/room-types")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({
        name: `Deluxe Suite ${crypto.randomBytes(2).toString("hex")}`,
        code: `DLX_${crypto.randomBytes(2).toString("hex")}`.toUpperCase(),
        base_occupancy: 2,
        max_occupancy: 4,
        base_price: 15000,
      });
    const roomTypeA = roomTypeResA.body.data;

    const roomResA = await request(app)
      .post("/api/v1/hotel/rooms")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({
        room_number: `301-${crypto.randomBytes(2).toString("hex")}`,
        room_type_id: roomTypeA._id,
        floor: "3",
      });
    roomA = roomResA.body.data;

    // Staff User for Tenant A
    const staffEmailA = randomEmail("staff_a");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Hotel Staff A",
      email: staffEmailA,
      phone: randomPhone(),
      password: "Password123!",
    });
    // Link staff user to Hotel A
    const Account = (await import("../../../../database/platform/models/account.model.js")).default;
    await Account.updateOne({ email: staffEmailA }, { $set: { hotelId: hotelA, role: "HOTEL_USER" } });
    const staffLoginA = await request(app).post("/api/v1/auth/login").send({ email: staffEmailA, password: "Password123!" });
    staffTokenA = staffLoginA.body.data.accessToken;

    // 2. Setup Tenant B (for multi-tenant isolation testing)
    const emailB = randomEmail("inv_admin_b");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Inventory Admin B",
      email: emailB,
      phone: randomPhone(),
      password: "Password123!",
    });
    const loginB = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "Password123!" });
    const tempTokenB = loginB.body.data.accessToken;

    const onboardB = await request(app)
      .post("/api/v1/provisioning/onboard")
      .set("Authorization", `Bearer ${tempTokenB}`)
      .send({
        property_name: "Inventory Hotel B",
        address: "200 Supply St",
        city: "Lahore",
      });
    hotelB = onboardB.body.data.hotelId;

    const reloginB = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "Password123!" });
    adminTokenB = reloginB.body.data.accessToken;
  });

  afterAll(async () => {
    await closeAllHotelConnections();
    await closePlatformDB();
  });

  // =========================================================================
  // 1. INVENTORY ITEM HTTP CRUD & DOMAIN VALIDATION
  // =========================================================================
  describe("1. Inventory Item HTTP Endpoints & Constraints", () => {
    it("POST /api/v1/hotel/inventory — should create a room-linked inventory item", async () => {
      const payload = {
        sku: "BTH-TWL-777",
        name: "Premium Egyptian Cotton Bath Towel",
        category: "BATHROOM",
        description: "650 GSM white plush cotton bath towels",
        location_type: "ROOM",
        room_id: roomA._id,
        quantity: 10,
        unit: "PIECE",
        reorder_level: 4,
        unit_cost: 15.5,
        condition: "NEW",
        supplier: "Royal Textile Mills",
        notes: "Restocked bi-weekly",
        status: "ACTIVE",
      };

      const res = await request(app)
        .post("/api/v1/hotel/inventory")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sku).toBe("BTH-TWL-777");
      expect(res.body.data.name).toBe("Premium Egyptian Cotton Bath Towel");
      expect(res.body.data.quantity).toBe(10);
      expect(res.body.data.room_number).toBe(roomA.room_number);
      expect(res.body.data.condition).toBe("NEW");

      createdItemIdA = res.body.data._id;
    });

    it("POST /api/v1/hotel/inventory — should reject duplicate SKU in same hotel with 409", async () => {
      const payload = {
        sku: "BTH-TWL-777", // Duplicate SKU in Hotel A
        name: "Duplicate Towel Entry",
        category: "BATHROOM",
        quantity: 5,
        unit: "PIECE",
      };

      const res = await request(app)
        .post("/api/v1/hotel/inventory")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send(payload);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      const errMsg = res.body.error?.message || res.body.message;
      expect(errMsg).toContain("already exists");
    });

    it("GET /api/v1/hotel/inventory — should list inventory items with filtering, search, and pagination", async () => {
      // Create a second item in storage
      await request(app)
        .post("/api/v1/hotel/inventory")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          sku: "CLN-DTR-100",
          name: "Floor Disinfectant Concentrate",
          category: "CLEANING",
          location_type: "STORAGE",
          location: "Central Chemical Room",
          quantity: 2, // At or below reorder level
          reorder_level: 5,
          unit_cost: 8.0,
          condition: "GOOD",
        });

      // Query all items
      const res = await request(app)
        .get("/api/v1/hotel/inventory")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.meta || res.body.pagination).toBeDefined();

      // Query low stock items
      const lowStockRes = await request(app)
        .get("/api/v1/hotel/inventory?low_stock=true")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(lowStockRes.status).toBe(200);
      const lowStockSkus = lowStockRes.body.data.map((i) => i.sku);
      expect(lowStockSkus).toContain("CLN-DTR-100");

      // Query with search keyword
      const searchRes = await request(app)
        .get("/api/v1/hotel/inventory?search=Disinfectant")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(searchRes.status).toBe(200);
      expect(searchRes.body.data.length).toBe(1);
      expect(searchRes.body.data[0].sku).toBe("CLN-DTR-100");
    });

    it("GET /api/v1/hotel/inventory/:id — should retrieve item details with populated room", async () => {
      const res = await request(app)
        .get(`/api/v1/hotel/inventory/${createdItemIdA}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(createdItemIdA);
      expect(res.body.data.sku).toBe("BTH-TWL-777");
      expect(res.body.data.room_id).toBeDefined();
    });

    it("PATCH /api/v1/hotel/inventory/:id — should update metadata but protect stock quantity from direct tampering", async () => {
      const res = await request(app)
        .patch(`/api/v1/hotel/inventory/${createdItemIdA}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          name: "Premium Egyptian Cotton Bath Towel (Updated)",
          unit_cost: 16.5,
          notes: "Price updated for Q4",
          quantity: 9999, // Tamper attempt: must be ignored by service layer
        });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("Premium Egyptian Cotton Bath Towel (Updated)");
      expect(res.body.data.unit_cost).toBe(16.5);
      expect(res.body.data.notes).toBe("Price updated for Q4");
      expect(res.body.data.quantity).toBe(10); // Protected: quantity unchanged!
    });

    it("DELETE /api/v1/hotel/inventory/:id — should soft deactivate item", async () => {
      const res = await request(app)
        .delete(`/api/v1/hotel/inventory/${createdItemIdA}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const checkRes = await request(app)
        .get(`/api/v1/hotel/inventory/${createdItemIdA}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(checkRes.body.data.status).toBe("INACTIVE");

      // Re-activate item for following tests
      await request(app)
        .patch(`/api/v1/hotel/inventory/${createdItemIdA}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ status: "ACTIVE" });
    });
  });

  // =========================================================================
  // 2. ATOMIC STOCK ADJUSTMENT & MOVEMENT LEDGER
  // =========================================================================
  describe("2. Authoritative Stock Adjustments & Movement Ledger", () => {
    it("POST /api/v1/hotel/inventory/:id/adjust — INCREMENT should increase stock and record movement", async () => {
      const res = await request(app)
        .post(`/api/v1/hotel/inventory/${createdItemIdA}/adjust`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          adjustment_type: "INCREMENT",
          quantity: 5,
          reason: "PURCHASE",
          notes: "Received supplier shipment #102",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.item.quantity).toBe(15); // 10 + 5
      expect(res.body.data.movement).toBeDefined();
      expect(res.body.data.movement.movement_type).toBe("PURCHASE");
      expect(res.body.data.movement.previous_quantity).toBe(10);
      expect(res.body.data.movement.new_quantity).toBe(15);
      expect(res.body.data.movement.quantity).toBe(5);
    });

    it("POST /api/v1/hotel/inventory/:id/adjust — DECREMENT should decrease stock and record movement", async () => {
      const res = await request(app)
        .post(`/api/v1/hotel/inventory/${createdItemIdA}/adjust`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          adjustment_type: "DECREMENT",
          quantity: 3,
          reason: "CONSUMPTION",
          notes: "Issued 3 towels to Room 301 turnaround",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.item.quantity).toBe(12); // 15 - 3
      expect(res.body.data.movement.movement_type).toBe("CONSUMPTION");
      expect(res.body.data.movement.previous_quantity).toBe(15);
      expect(res.body.data.movement.new_quantity).toBe(12);
      expect(res.body.data.movement.quantity).toBe(3);
    });

    it("POST /api/v1/hotel/inventory/:id/adjust — should reject decrement when insufficient stock (409)", async () => {
      const res = await request(app)
        .post(`/api/v1/hotel/inventory/${createdItemIdA}/adjust`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          adjustment_type: "DECREMENT",
          quantity: 50, // Current stock is 12
          reason: "CONSUMPTION",
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      const errMsg = res.body.error?.message || res.body.message;
      expect(errMsg).toContain("Insufficient stock");
    });

    it("POST /api/v1/hotel/inventory/:id/adjust — SET should adjust stock to exact count (audit count)", async () => {
      const res = await request(app)
        .post(`/api/v1/hotel/inventory/${createdItemIdA}/adjust`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          adjustment_type: "SET",
          quantity: 20,
          reason: "AUDIT",
          notes: "Quarterly physical stocktake reconciliation",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.item.quantity).toBe(20);
      expect(res.body.data.movement.previous_quantity).toBe(12);
      expect(res.body.data.movement.new_quantity).toBe(20);
      expect(res.body.data.movement.quantity).toBe(8); // delta magnitude |20 - 12|
      expect(res.body.data.movement.movement_type).toBe("ADJUSTMENT");
    });

    it("GET /api/v1/hotel/inventory/:id/movements — should retrieve chronological item movements with recorded_by", async () => {
      const res = await request(app)
        .get(`/api/v1/hotel/inventory/${createdItemIdA}/movements`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      expect(res.body.data[0].recorded_by).toBeDefined();
      expect(res.body.meta || res.body.pagination).toBeDefined();
    });

    it("GET /api/v1/hotel/inventory/movements — should retrieve global movements across items", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/inventory/movements")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    });
  });

  // =========================================================================
  // 3. INVENTORY INCIDENTS & LIFECYCLE RESOLUTION
  // =========================================================================
  describe("3. Inventory Incident Lifecycle & Loss Resolution", () => {
    it("POST /api/v1/hotel/inventory/incidents — should report a missing/damaged incident without premature stock deduction", async () => {
      // Stock before reporting incident
      const preCheck = await request(app)
        .get(`/api/v1/hotel/inventory/${createdItemIdA}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      const stockBefore = preCheck.body.data.quantity;

      const payload = {
        item_id: createdItemIdA,
        quantity_lost: 2,
        reason: "DAMAGE",
        description: "Severely stained with permanent chemical solvent during cleaning",
        room_number: "301",
      };

      const res = await request(app)
        .post("/api/v1/hotel/inventory/incidents")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.incident_ref).toMatch(/^INC-/);
      expect(res.body.data.status).toBe("REPORTED");
      expect(res.body.data.quantity_lost).toBe(2);
      expect(res.body.data.total_loss_value).toBe(33); // 2 * 16.5 unit_cost
      expect(res.body.data.timeline.length).toBe(1);
      expect(res.body.data.timeline[0].action).toBe("REPORTED_MISSING");

      reportedIncidentIdA = res.body.data._id;

      // Verify stock was NOT deducted upon initial reporting
      const postCheck = await request(app)
        .get(`/api/v1/hotel/inventory/${createdItemIdA}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(postCheck.body.data.quantity).toBe(stockBefore);
    });

    it("GET /api/v1/hotel/inventory/incidents — should list incidents with filtering and pagination", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/inventory/incidents?status=REPORTED")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].item_id.sku).toBe("BTH-TWL-777");
    });

    it("PATCH /api/v1/hotel/inventory/incidents/:id — should advance status to INVESTIGATING and track timeline", async () => {
      const res = await request(app)
        .patch(`/api/v1/hotel/inventory/incidents/${reportedIncidentIdA}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          status: "INVESTIGATING",
          description: "Evaluating if stains can be removed via industrial dry-cleaning",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("INVESTIGATING");
      expect(res.body.data.timeline.length).toBe(2);
      expect(res.body.data.timeline[1].action).toBe("INVESTIGATION_STARTED");
    });

    it("PATCH /api/v1/hotel/inventory/incidents/:id — should resolve as WRITTEN_OFF and deduct stock atomically", async () => {
      const preStock = await request(app)
        .get(`/api/v1/hotel/inventory/${createdItemIdA}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      const stockBefore = preStock.body.data.quantity; // 20

      const res = await request(app)
        .patch(`/api/v1/hotel/inventory/incidents/${reportedIncidentIdA}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          status: "RESOLVED",
          resolution_type: "WRITTEN_OFF",
          resolution_notes: "Stains unrecoverable. 2 towels discarded permanently.",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("RESOLVED");
      expect(res.body.data.resolution_type).toBe("WRITTEN_OFF");
      expect(res.body.data.timeline.length).toBe(3);
      expect(res.body.data.timeline[2].action).toBe("RESOLVED_WRITTEN_OFF");

      // Verify stock was deducted by quantity_lost (2)
      const postStock = await request(app)
        .get(`/api/v1/hotel/inventory/${createdItemIdA}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(postStock.body.data.quantity).toBe(stockBefore - 2); // 20 - 2 = 18

      // Verify LOSS movement was recorded in ledger
      const movRes = await request(app)
        .get(`/api/v1/hotel/inventory/${createdItemIdA}/movements`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      const lossMovement = movRes.body.data.find((m) => m.movement_type === "LOSS");
      expect(lossMovement).toBeDefined();
      expect(lossMovement.quantity).toBe(2);
      expect(lossMovement.reference_type).toBe("INCIDENT");
    });

    it("PATCH /api/v1/hotel/inventory/incidents/:id — should reject re-resolving an already resolved incident (409)", async () => {
      const res = await request(app)
        .patch(`/api/v1/hotel/inventory/incidents/${reportedIncidentIdA}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          status: "RESOLVED",
          resolution_type: "WRITTEN_OFF",
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      const errMsg = res.body.error?.message || res.body.message;
      expect(errMsg).toContain("already resolved");
    });

    it("should support RECOVERED resolution without stock deduction", async () => {
      // Create another incident for testing RECOVERED outcome
      const incRes = await request(app)
        .post("/api/v1/hotel/inventory/incidents")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          item_id: createdItemIdA,
          quantity_lost: 1,
          reason: "THEFT",
          description: "Suspected missing bathrobe",
        });
      const incId = incRes.body.data._id;

      const preStock = await request(app)
        .get(`/api/v1/hotel/inventory/${createdItemIdA}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      const stockBefore = preStock.body.data.quantity;

      const resolveRes = await request(app)
        .patch(`/api/v1/hotel/inventory/incidents/${incId}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          status: "RESOLVED",
          resolution_type: "RECOVERED",
          resolution_notes: "Found in banquet laundry cart",
        });

      expect(resolveRes.status).toBe(200);
      expect(resolveRes.body.data.resolution_type).toBe("RECOVERED");

      // Stock should remain identical (no deduction)
      const postStock = await request(app)
        .get(`/api/v1/hotel/inventory/${createdItemIdA}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(postStock.body.data.quantity).toBe(stockBefore);
    });
  });

  // =========================================================================
  // 4. MULTI-TENANT ISOLATION & RBAC SECURITY
  // =========================================================================
  describe("4. Multi-Tenant Isolation & RBAC Security", () => {
    it("should strictly prevent Hotel B from accessing Hotel A inventory item", async () => {
      const res = await request(app)
        .get(`/api/v1/hotel/inventory/${createdItemIdA}`)
        .set("Authorization", `Bearer ${adminTokenB}`);

      expect(res.status).toBe(404);
    });

    it("should strictly prevent Hotel B from adjusting Hotel A inventory stock", async () => {
      const res = await request(app)
        .post(`/api/v1/hotel/inventory/${createdItemIdA}/adjust`)
        .set("Authorization", `Bearer ${adminTokenB}`)
        .send({
          adjustment_type: "INCREMENT",
          quantity: 10,
          reason: "PURCHASE",
        });

      expect(res.status).toBe(404);
    });

    it("should allow Hotel B to create an item with the identical SKU as Hotel A independently", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/inventory")
        .set("Authorization", `Bearer ${adminTokenB}`)
        .send({
          sku: "BTH-TWL-777", // Same SKU as Hotel A
          name: "Hotel B Luxury Towel",
          category: "BATHROOM",
          quantity: 50,
          unit: "PIECE",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.sku).toBe("BTH-TWL-777");
      expect(res.body.data.name).toBe("Hotel B Luxury Towel");
      expect(res.body.data.quantity).toBe(50);
    });

    it("should reject unauthenticated requests with 401", async () => {
      const res = await request(app).get("/api/v1/hotel/inventory");
      expect(res.status).toBe(401);
    });
  });

  // =========================================================================
  // 5. STEP 4 HARDENING: CONCURRENT RESOLUTION & ATOMICITY GUARANTEES
  // =========================================================================
  describe("5. Step 4 Hardening: Concurrency & Atomicity Invariants", () => {
    it("Concurrent Incident Resolution: multiple parallel WRITTEN_OFF resolutions result in exactly ONE deduction and 409 for competitors", async () => {
      // 1. Create a fresh test item with 20 units
      const itemRes = await request(app)
        .post("/api/v1/hotel/inventory")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          sku: `SKU-CONC-${crypto.randomBytes(3).toString("hex")}`.toUpperCase(),
          name: "High Value Crystal Vase",
          category: "DECOR",
          quantity: 20,
          unit: "PIECE",
          unit_cost: 100,
        });
      const itemId = itemRes.body.data._id;

      // 2. Report a missing incident of 2 units
      const incRes = await request(app)
        .post("/api/v1/hotel/inventory/incidents")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          item_id: itemId,
          quantity_lost: 2,
          reason: "DAMAGE",
          description: "Broken in dining hall",
        });
      const incidentId = incRes.body.data._id;

      // Verify initial stock remains 20 before resolution
      const checkInitial = await request(app)
        .get(`/api/v1/hotel/inventory/${itemId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(checkInitial.body.data.quantity).toBe(20);

      // 3. Dispatch 5 simultaneous concurrent WRITTEN_OFF resolution requests
      const resolutionPromises = Array.from({ length: 5 }).map((_, idx) =>
        request(app)
          .patch(`/api/v1/hotel/inventory/incidents/${incidentId}`)
          .set("Authorization", `Bearer ${adminTokenA}`)
          .send({
            status: "RESOLVED",
            resolution_type: "WRITTEN_OFF",
            resolution_notes: `Concurrent resolution attempt #${idx + 1}`,
          })
      );

      const results = await Promise.all(resolutionPromises);
      const successful = results.filter((r) => r.status === 200);
      const conflicts = results.filter((r) => r.status === 409);

      // Exactly ONE request must succeed (200), remaining 4 must be rejected with 409 Conflict
      expect(successful.length).toBe(1);
      expect(conflicts.length).toBe(4);

      // 4. Verify stock was deducted EXACTLY ONCE (20 - 2 = 18, NOT double-deducted to 16, 14, 12, etc.)
      const checkFinal = await request(app)
        .get(`/api/v1/hotel/inventory/${itemId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(checkFinal.body.data.quantity).toBe(18);

      // 5. Verify movements ledger has EXACTLY ONE LOSS record
      const movementsRes = await request(app)
        .get(`/api/v1/hotel/inventory/${itemId}/movements`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      const lossMovements = (Array.isArray(movementsRes.body.data) ? movementsRes.body.data : []).filter(
        (m) => m.movement_type === "LOSS"
      );
      expect(lossMovements.length).toBe(1);
      expect(lossMovements[0].quantity).toBe(2);
      expect(lossMovements[0].new_quantity).toBe(18);
    });

    it("Adjustment aliases (ADD, SUBTRACT, SET) are supported and properly normalized", async () => {
      const itemRes = await request(app)
        .post("/api/v1/hotel/inventory")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          sku: `SKU-ALIAS-${crypto.randomBytes(3).toString("hex")}`.toUpperCase(),
          name: "Alias Test Item",
          category: "GENERAL",
          quantity: 10,
          unit: "PIECE",
        });
      const itemId = itemRes.body.data._id;

      // 1. Test ADD alias
      const addRes = await request(app)
        .post(`/api/v1/hotel/inventory/${itemId}/adjust`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          adjustment_type: "ADD",
          quantity: 5,
          reason: "PURCHASE",
        });
      expect(addRes.status).toBe(200);
      expect(addRes.body.data.item.quantity).toBe(15);

      // 2. Test SUBTRACT alias
      const subRes = await request(app)
        .post(`/api/v1/hotel/inventory/${itemId}/adjust`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          adjustment_type: "SUBTRACT",
          quantity: 3,
          reason: "CONSUMPTION",
        });
      expect(subRes.status).toBe(200);
      expect(subRes.body.data.item.quantity).toBe(12);

      // 3. Test SET alias
      const setRes = await request(app)
        .post(`/api/v1/hotel/inventory/${itemId}/adjust`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          adjustment_type: "SET",
          quantity: 25,
          reason: "AUDIT",
        });
      expect(setRes.status).toBe(200);
      expect(setRes.body.data.item.quantity).toBe(25);
    });
  });
});
