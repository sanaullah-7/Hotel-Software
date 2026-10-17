import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import crypto from "crypto";
import mongoose from "mongoose";
import app from "../../../../app.js";
import { connectPlatformDB, closePlatformDB } from "../../../../database/platform/platformConnection.js";
import { closeAllHotelConnections } from "../../../../database/connectionManager.js";
import { getModel } from "../../../../database/hotel/modelFactory.js";
import {
  createInventoryItemSchema,
  updateInventoryItemSchema,
  createInventoryMovementSchema,
  createInventoryIncidentSchema,
  updateInventoryIncidentSchema,
  stockAdjustmentSchema,
} from "../inventory.validation.js";

const randomEmail = (prefix = "inv") => `${prefix}_${crypto.randomBytes(4).toString("hex")}@hotel.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe("Inventory Module — Step 1: Backend Foundation & Domain Hardening", () => {
  let adminTokenA, adminTokenB;
  let hotelA, hotelB;
  let employeeA, employeeB;
  let roomA;

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
        room_number: `205-${crypto.randomBytes(2).toString("hex")}`,
        room_type_id: roomTypeA._id,
        floor: "2",
      });
    roomA = roomResA.body.data;

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

    const deptResB = await request(app)
      .post("/api/v1/hotel/departments")
      .set("Authorization", `Bearer ${adminTokenB}`)
      .send({
        name: "Inventory Logistics B",
        code: `LOGB_${crypto.randomBytes(2).toString("hex")}`.toUpperCase(),
      });
    const deptB = deptResB.body.data;

    const empResB = await request(app)
      .post("/api/v1/hotel/employees")
      .set("Authorization", `Bearer ${adminTokenB}`)
      .send({
        employee_ref: `EMP-INV-B-${crypto.randomBytes(2).toString("hex")}`.toUpperCase(),
        first_name: "Arthur",
        last_name: "Pendleton",
        phone: randomPhone(),
        email: randomEmail("emp_b"),
        department_id: deptB._id,
        job_title: "Warehouse Supervisor",
      });
    employeeB = empResB.body.data;
  });

  afterAll(async () => {
    await closeAllHotelConnections();
    await closePlatformDB();
  });

  // =========================================================================
  // 1. INVENTORY ITEM DOMAIN & SCHEMA CONSTRAINTS
  // =========================================================================
  describe("1. InventoryItem Domain & Schema Constraints", () => {
    it("should successfully create an in-room InventoryItem with canonical room link, condition, and supplier", async () => {
      const InventoryItem = await getModel(hotelA, "InventoryItem");

      const item = await InventoryItem.create({
        sku: "BTH-TWL-001",
        name: "Bath Towel (Egyptian Cotton)",
        category: "BATHROOM",
        description: "600 GSM white plush cotton bath towels",
        location_type: "ROOM",
        room_id: roomA._id,
        room_number: roomA.room_number,
        location: `Room ${roomA.room_number} - Bathroom`,
        quantity: 4,
        unit: "PIECE",
        reorder_level: 2,
        unit_cost: 12.5,
        condition: "GOOD",
        supplier: "Royal Linen & Textile Corp.",
        notes: "Restocked bi-weekly",
        status: "ACTIVE",
      });

      expect(item._id).toBeDefined();
      expect(item.sku).toBe("BTH-TWL-001");
      expect(item.name).toBe("Bath Towel (Egyptian Cotton)");
      expect(item.category).toBe("BATHROOM");
      expect(item.location_type).toBe("ROOM");
      expect(String(item.room_id)).toBe(String(roomA._id));
      expect(item.room_number).toBe(roomA.room_number);
      expect(item.quantity).toBe(4);
      expect(item.condition).toBe("GOOD");
      expect(item.supplier).toBe("Royal Linen & Textile Corp.");
      expect(item.status).toBe("ACTIVE");
    });

    it("should successfully create a storage-type InventoryItem with par level defaults", async () => {
      const InventoryItem = await getModel(hotelA, "InventoryItem");

      const item = await InventoryItem.create({
        sku: "AMN-SHM-500",
        name: "Luxury Lavender Shampoo (250ml)",
        category: "AMENITIES",
        location_type: "STORAGE",
        location: "Central Linen Storage (Basement)",
        quantity: 150,
        unit: "BOTTLE",
        reorder_level: 50,
        unit_cost: 2.2,
        condition: "NEW",
        supplier: "EcoSpa Amenities Ltd.",
      });

      expect(item._id).toBeDefined();
      expect(item.location_type).toBe("STORAGE");
      expect(item.room_id).toBeNull();
      expect(item.quantity).toBe(150);
      expect(item.reorder_level).toBe(50);
      expect(item.status).toBe("ACTIVE");
    });

    it("should enforce quantity >= 0 invariant at the Mongoose schema level", async () => {
      const InventoryItem = await getModel(hotelA, "InventoryItem");

      await expect(
        InventoryItem.create({
          sku: "NEG-QTY-001",
          name: "Invalid Negative Item",
          category: "CLEANING",
          quantity: -5,
          unit: "PIECE",
        })
      ).rejects.toThrow();
    });

    it("should reject duplicate SKU within the same tenant hotel", async () => {
      const InventoryItem = await getModel(hotelA, "InventoryItem");

      await expect(
        InventoryItem.create({
          sku: "BTH-TWL-001", // Duplicate of existing item in Hotel A
          name: "Duplicate Towel",
          category: "BATHROOM",
          quantity: 2,
          unit: "PIECE",
        })
      ).rejects.toThrow();
    });

    it("should reject invalid condition or status enums", async () => {
      const InventoryItem = await getModel(hotelA, "InventoryItem");

      await expect(
        InventoryItem.create({
          sku: "INVALID-COND-001",
          name: "Invalid Enum Item",
          category: "BEDROOM",
          quantity: 1,
          unit: "PIECE",
          condition: "SUPER_PERFECT", // Invalid condition enum
        })
      ).rejects.toThrow();

      await expect(
        InventoryItem.create({
          sku: "INVALID-STAT-001",
          name: "Invalid Status Item",
          category: "BEDROOM",
          quantity: 1,
          unit: "PIECE",
          status: "ARCHIVED", // Invalid status enum (must be ACTIVE or INACTIVE)
        })
      ).rejects.toThrow();
    });
  });

  // =========================================================================
  // 2. INVENTORY MOVEMENT LEDGER DOMAIN
  // =========================================================================
  describe("2. InventoryMovement Domain & Ledger Semantics", () => {
    let testItem;

    beforeAll(async () => {
      const InventoryItem = await getModel(hotelA, "InventoryItem");
      testItem = await InventoryItem.create({
        sku: "MOV-ITEM-001",
        name: "Minibar Red Wine",
        category: "KITCHEN",
        quantity: 20,
        unit: "BOTTLE",
        unit_cost: 45,
      });
    });

    it("should record an immutable stock PURCHASE movement with positive magnitude", async () => {
      const InventoryMovement = await getModel(hotelA, "InventoryMovement");

      const movement = await InventoryMovement.create({
        item_id: testItem._id,
        movement_type: "PURCHASE",
        quantity: 10,
        previous_quantity: 20,
        new_quantity: 30,
        recorded_by: employeeA._id,
        reference_type: "EXPENSE",
        notes: "Bulk order purchase batch #440",
      });

      expect(movement._id).toBeDefined();
      expect(String(movement.item_id)).toBe(String(testItem._id));
      expect(movement.movement_type).toBe("PURCHASE");
      expect(movement.quantity).toBe(10);
      expect(movement.previous_quantity).toBe(20);
      expect(movement.new_quantity).toBe(30);
      expect(String(movement.recorded_by)).toBe(String(employeeA._id));
      expect(movement.reference_type).toBe("EXPENSE");
    });

    it("should record a CONSUMPTION movement referencing guest consumption", async () => {
      const InventoryMovement = await getModel(hotelA, "InventoryMovement");

      const movement = await InventoryMovement.create({
        item_id: testItem._id,
        movement_type: "CONSUMPTION",
        quantity: 2,
        previous_quantity: 30,
        new_quantity: 28,
        recorded_by: employeeA._id,
        reference_type: "GUEST_CHARGE",
        notes: "Room 205 Minibar consumption",
      });

      expect(movement.movement_type).toBe("CONSUMPTION");
      expect(movement.quantity).toBe(2);
      expect(movement.new_quantity).toBe(28);
    });

    it("should reject zero or negative quantity in InventoryMovement", async () => {
      const InventoryMovement = await getModel(hotelA, "InventoryMovement");

      await expect(
        InventoryMovement.create({
          item_id: testItem._id,
          movement_type: "CONSUMPTION",
          quantity: 0, // Invalid: must be positive magnitude
          recorded_by: employeeA._id,
        })
      ).rejects.toThrow();

      await expect(
        InventoryMovement.create({
          item_id: testItem._id,
          movement_type: "LOSS",
          quantity: -3, // Invalid: must be positive magnitude
          recorded_by: employeeA._id,
        })
      ).rejects.toThrow();
    });

    it("should reject unsupported movement types", async () => {
      const InventoryMovement = await getModel(hotelA, "InventoryMovement");

      await expect(
        InventoryMovement.create({
          item_id: testItem._id,
          movement_type: "STOLEN_MYSTERY", // Invalid enum
          quantity: 1,
          recorded_by: employeeA._id,
        })
      ).rejects.toThrow();
    });
  });

  // =========================================================================
  // 3. INVENTORY INCIDENT DOMAIN & LIFECYCLE
  // =========================================================================
  describe("3. InventoryIncident Domain & Lifecycle Semantics", () => {
    let incidentItem;

    beforeAll(async () => {
      const InventoryItem = await getModel(hotelA, "InventoryItem");
      incidentItem = await InventoryItem.create({
        sku: "ROB-PLUSH-001",
        name: "Plush Microfiber Bathrobe",
        category: "BATHROOM",
        quantity: 2,
        unit: "PIECE",
        unit_cost: 35,
        location_type: "ROOM",
        room_number: "205",
      });
    });

    it("should create a REPORTED incident with initial loss values and embedded timeline", async () => {
      const InventoryIncident = await getModel(hotelA, "InventoryIncident");

      const incident = await InventoryIncident.create({
        incident_ref: "INC-2026-0001",
        item_id: incidentItem._id,
        quantity_lost: 1,
        unit_loss_value: 35,
        total_loss_value: 35,
        reason: "THEFT",
        description: "Missing from Room 205 closet after checkout inspection",
        reported_by: employeeA._id,
        status: "REPORTED",
        room_number: "205",
        timeline: [
          {
            action: "REPORTED_MISSING",
            user: "Marcus Vance (Housekeeping)",
            user_id: employeeA._id,
            detail: "Logged missing during routine turnaround inspection",
          },
        ],
      });

      expect(incident._id).toBeDefined();
      expect(incident.incident_ref).toBe("INC-2026-0001");
      expect(incident.status).toBe("REPORTED");
      expect(incident.reason).toBe("THEFT");
      expect(incident.resolution_type).toBeNull();
      expect(incident.timeline.length).toBe(1);
      expect(incident.timeline[0].action).toBe("REPORTED_MISSING");
    });

    it("should progress incident lifecycle to INVESTIGATING and append to timeline", async () => {
      const InventoryIncident = await getModel(hotelA, "InventoryIncident");

      const incident = await InventoryIncident.findOne({ incident_ref: "INC-2026-0001" });
      incident.status = "INVESTIGATING";
      incident.assigned_to = employeeA._id;
      incident.timeline.push({
        action: "INVESTIGATION_STARTED",
        user: "Marcus Vance (Supervisor)",
        user_id: employeeA._id,
        detail: "Auditing floor cart and laundry facility",
      });

      await incident.save();

      const updated = await InventoryIncident.findOne({ incident_ref: "INC-2026-0001" });
      expect(updated.status).toBe("INVESTIGATING");
      expect(String(updated.assigned_to)).toBe(String(employeeA._id));
      expect(updated.timeline.length).toBe(2);
    });

    it("should resolve incident with resolution_type (RECOVERED, REPLACED, or WRITTEN_OFF)", async () => {
      const InventoryIncident = await getModel(hotelA, "InventoryIncident");

      const incident = await InventoryIncident.findOne({ incident_ref: "INC-2026-0001" });
      incident.status = "RESOLVED";
      incident.resolution_type = "RECOVERED";
      incident.resolution_notes = "Found in laundry chute sorting bin and sanitized";
      incident.resolution_date = new Date();
      incident.timeline.push({
        action: "RESOLVED_RECOVERED",
        user: "Marcus Vance (Supervisor)",
        user_id: employeeA._id,
        detail: "Item recovered and returned to room inventory",
      });

      await incident.save();

      const resolved = await InventoryIncident.findOne({ incident_ref: "INC-2026-0001" });
      expect(resolved.status).toBe("RESOLVED");
      expect(resolved.resolution_type).toBe("RECOVERED");
      expect(resolved.resolution_notes).toContain("Found in laundry chute");
      expect(resolved.timeline.length).toBe(3);
    });

    it("should reject invalid incident reason or status enum", async () => {
      const InventoryIncident = await getModel(hotelA, "InventoryIncident");

      await expect(
        InventoryIncident.create({
          incident_ref: "INC-INVALID-REASON",
          item_id: incidentItem._id,
          quantity_lost: 1,
          reason: "ALIEN_ABDUCTION", // Invalid reason enum
          reported_by: employeeA._id,
        })
      ).rejects.toThrow();

      await expect(
        InventoryIncident.create({
          incident_ref: "INC-INVALID-STATUS",
          item_id: incidentItem._id,
          quantity_lost: 1,
          reason: "DAMAGE",
          reported_by: employeeA._id,
          status: "CLOSED_FOREVER", // Invalid status enum
        })
      ).rejects.toThrow();
    });
  });

  // =========================================================================
  // 4. JOI VALIDATION LAYER
  // =========================================================================
  describe("4. Joi Validation Layer", () => {
    it("should validate a well-formed create inventory item payload", () => {
      const payload = {
        sku: "KTL-SS-001",
        name: "Electric Kettle (1.5L)",
        category: "KITCHEN",
        location_type: "ROOM",
        room_number: "101",
        quantity: 1,
        unit: "PIECE",
        unit_cost: 32,
        condition: "NEW",
        supplier: "KitchenPro Hotel Equipment",
      };

      const { error, value } = createInventoryItemSchema.validate(payload);
      expect(error).toBeUndefined();
      expect(value.sku).toBe("KTL-SS-001");
      expect(value.condition).toBe("NEW");
    });

    it("should reject create item payload missing required fields or having negative quantity", () => {
      const missingName = {
        sku: "TEST-SKU",
        category: "BATHROOM",
      };
      const { error: err1 } = createInventoryItemSchema.validate(missingName);
      expect(err1).toBeDefined();
      expect(err1.message).toContain("name is required");

      const negativeQty = {
        sku: "TEST-SKU",
        name: "Test",
        category: "BATHROOM",
        quantity: -10,
      };
      const { error: err2 } = createInventoryItemSchema.validate(negativeQty);
      expect(err2).toBeDefined();
      expect(err2.message).toContain("must be greater than or equal to 0");
    });

    it("should validate create inventory movement payload with positive quantity and valid type", () => {
      const payload = {
        item_id: new mongoose.Types.ObjectId().toHexString(),
        movement_type: "PURCHASE",
        quantity: 50,
        recorded_by: new mongoose.Types.ObjectId().toHexString(),
        notes: "Monthly replenishment",
      };

      const { error, value } = createInventoryMovementSchema.validate(payload);
      expect(error).toBeUndefined();
      expect(value.quantity).toBe(50);
    });

    it("should reject movement payload with 0 or negative quantity or malformed ObjectId", () => {
      const zeroQty = {
        item_id: new mongoose.Types.ObjectId().toHexString(),
        movement_type: "PURCHASE",
        quantity: 0,
        recorded_by: new mongoose.Types.ObjectId().toHexString(),
      };
      const { error: err1 } = createInventoryMovementSchema.validate(zeroQty);
      expect(err1).toBeDefined();
      expect(err1.message).toContain("greater than 0");

      const badId = {
        item_id: "invalid-hex-id",
        movement_type: "LOSS",
        quantity: 2,
        recorded_by: new mongoose.Types.ObjectId().toHexString(),
      };
      const { error: err2 } = createInventoryMovementSchema.validate(badId);
      expect(err2).toBeDefined();
    });

    it("should validate incident payload and stock adjustment schema", () => {
      const incidentPayload = {
        item_id: new mongoose.Types.ObjectId().toHexString(),
        quantity_lost: 2,
        reason: "DAMAGE",
        reported_by: new mongoose.Types.ObjectId().toHexString(),
        status: "REPORTED",
      };
      const { error: incErr } = createInventoryIncidentSchema.validate(incidentPayload);
      expect(incErr).toBeUndefined();

      const adjPayload = {
        item_id: new mongoose.Types.ObjectId().toHexString(),
        adjustment_type: "INCREMENT",
        quantity: 10,
        reason: "AUDIT",
        recorded_by: new mongoose.Types.ObjectId().toHexString(),
      };
      const { error: adjErr } = stockAdjustmentSchema.validate(adjPayload);
      expect(adjErr).toBeUndefined();
    });
  });

  // =========================================================================
  // 5. MULTI-TENANT ISOLATION & INDEPENDENT SKU SPACE
  // =========================================================================
  describe("5. Multi-Tenant Isolation & Independent SKU Space", () => {
    it("should allow Tenant A and Tenant B to have the same SKU in their isolated databases", async () => {
      const ItemA = await getModel(hotelA, "InventoryItem");
      const ItemB = await getModel(hotelB, "InventoryItem");

      const sku = "SHARED-SKU-999";

      const itemA = await ItemA.create({
        sku,
        name: "King Bed Sheet (Hotel A)",
        category: "BEDROOM",
        quantity: 10,
        unit: "SET",
      });

      const itemB = await ItemB.create({
        sku,
        name: "King Bed Sheet (Hotel B)",
        category: "BEDROOM",
        quantity: 25,
        unit: "SET",
      });

      expect(itemA._id).toBeDefined();
      expect(itemB._id).toBeDefined();
      expect(itemA.name).toBe("King Bed Sheet (Hotel A)");
      expect(itemB.name).toBe("King Bed Sheet (Hotel B)");

      const countA = await ItemA.countDocuments({ sku });
      const countB = await ItemB.countDocuments({ sku });
      expect(countA).toBe(1);
      expect(countB).toBe(1);
    });

    it("should keep inventory movements and incidents completely isolated between tenants", async () => {
      const MovementA = await getModel(hotelA, "InventoryMovement");
      const MovementB = await getModel(hotelB, "InventoryMovement");

      const countMovA = await MovementA.countDocuments();
      const countMovB = await MovementB.countDocuments();

      expect(countMovA).toBeGreaterThan(0);
      expect(countMovB).toBe(0); // Tenant B has not recorded movements
    });
  });
});
