import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import crypto from "crypto";
import app from "../../../../app.js";
import { connectPlatformDB, closePlatformDB } from "../../../../database/platform/platformConnection.js";
import { closeAllHotelConnections } from "../../../../database/connectionManager.js";
import { getModel } from "../../../../database/hotel/modelFactory.js";

const randomEmail = (prefix = "hk") => `${prefix}_${crypto.randomBytes(4).toString("hex")}@hotel.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe("Phase 7 Step 2: Room Cleaning Backend Migration & Integrity", () => {
  let adminTokenA, adminTokenB;
  let hotelA, hotelB;
  let roomTypeA, roomA1, roomA2;
  let roomTypeB, roomB1;
  let employeeA, employeeB;
  let createdTaskId;

  beforeAll(async () => {
    await connectPlatformDB();

    // 1. Setup Tenant A
    const emailA = randomEmail("hk_admin_a");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "HK Admin A",
      email: emailA,
      phone: randomPhone(),
      password: "Password123!"
    });
    const loginA = await request(app).post("/api/v1/auth/login").send({ email: emailA, password: "Password123!" });
    const tempTokenA = loginA.body.data.accessToken;

    const onboardA = await request(app).post("/api/v1/provisioning/onboard")
      .set("Authorization", `Bearer ${tempTokenA}`)
      .send({
        property_name: "Grand Palace Hotel A",
        address: "101 Grand Ave",
        city: "Lahore"
      });
    hotelA = onboardA.body.data.hotelId;

    const reloginA = await request(app).post("/api/v1/auth/login").send({ email: emailA, password: "Password123!" });
    adminTokenA = reloginA.body.data.accessToken;

    // Room Type & Rooms for Tenant A
    const rtResA = await request(app).post("/api/v1/hotel/room-types")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({
        name: "Deluxe Suite A",
        code: `DLX_${crypto.randomBytes(2).toString("hex")}`.toUpperCase(),
        base_occupancy: 2,
        max_occupancy: 4,
        base_price: 250
      });
    roomTypeA = rtResA.body.data;

    const rResA1 = await request(app).post("/api/v1/hotel/rooms")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({
        room_number: `101_${crypto.randomBytes(2).toString("hex")}`,
        room_type_id: roomTypeA._id,
        floor: "1",
        housekeeping_status: "DIRTY"
      });
    roomA1 = rResA1.body.data;

    const rResA2 = await request(app).post("/api/v1/hotel/rooms")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({
        room_number: `102_${crypto.randomBytes(2).toString("hex")}`,
        room_type_id: roomTypeA._id,
        floor: "1",
        housekeeping_status: "DIRTY"
      });
    roomA2 = rResA2.body.data;

    // Department & Employee for Tenant A
    const deptResA = await request(app).post("/api/v1/hotel/departments")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({
        name: "Housekeeping Dept A",
        code: `HK_${crypto.randomBytes(2).toString("hex")}`.toUpperCase()
      });
    const deptA = deptResA.body.data;

    const empResA = await request(app).post("/api/v1/hotel/employees")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({
        employee_ref: `EMP-A-${crypto.randomBytes(2).toString("hex")}`.toUpperCase(),
        first_name: "John",
        last_name: "Cleaner",
        phone: randomPhone(),
        email: randomEmail("emp_a"),
        department_id: deptA._id,
        job_title: "Housekeeper"
      });
    employeeA = empResA.body.data;

    // 2. Setup Tenant B
    const emailB = randomEmail("hk_admin_b");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "HK Admin B",
      email: emailB,
      phone: randomPhone(),
      password: "Password123!"
    });
    const loginB = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "Password123!" });
    const tempTokenB = loginB.body.data.accessToken;

    const onboardB = await request(app).post("/api/v1/provisioning/onboard")
      .set("Authorization", `Bearer ${tempTokenB}`)
      .send({
        property_name: "Royal Resort B",
        address: "202 Royal St",
        city: "Karachi"
      });
    hotelB = onboardB.body.data.hotelId;

    const reloginB = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "Password123!" });
    adminTokenB = reloginB.body.data.accessToken;

    // Room Type & Room for Tenant B
    const rtResB = await request(app).post("/api/v1/hotel/room-types")
      .set("Authorization", `Bearer ${adminTokenB}`)
      .send({
        name: "Standard Suite B",
        code: `STD_${crypto.randomBytes(2).toString("hex")}`.toUpperCase(),
        base_occupancy: 2,
        max_occupancy: 2,
        base_price: 150
      });
    roomTypeB = rtResB.body.data;

    const rResB1 = await request(app).post("/api/v1/hotel/rooms")
      .set("Authorization", `Bearer ${adminTokenB}`)
      .send({
        room_number: `201_${crypto.randomBytes(2).toString("hex")}`,
        room_type_id: roomTypeB._id,
        floor: "2",
        housekeeping_status: "DIRTY"
      });
    roomB1 = rResB1.body.data;

    // Department & Employee for Tenant B
    const deptResB = await request(app).post("/api/v1/hotel/departments")
      .set("Authorization", `Bearer ${adminTokenB}`)
      .send({
        name: "Housekeeping Dept B",
        code: `HKB_${crypto.randomBytes(2).toString("hex")}`.toUpperCase()
      });
    const deptB = deptResB.body.data;

    const empResB = await request(app).post("/api/v1/hotel/employees")
      .set("Authorization", `Bearer ${adminTokenB}`)
      .send({
        employee_ref: `EMP-B-${crypto.randomBytes(2).toString("hex")}`.toUpperCase(),
        first_name: "Sara",
        last_name: "Staff",
        phone: randomPhone(),
        email: randomEmail("emp_b"),
        department_id: deptB._id,
        job_title: "Housekeeper"
      });
    employeeB = empResB.body.data;
  });

  afterAll(async () => {
    await closeAllHotelConnections();
    await closePlatformDB();
  });

  describe("Housekeeping Task Creation", () => {
    it("should successfully create a valid housekeeping task for Tenant A", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/housekeeping/tasks")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_id: roomA1._id,
          assigned_to: employeeA._id,
          task_type: "CLEANING",
          priority: "HIGH",
          status: "ASSIGNED",
          notes: "Thorough cleaning needed",
          started_at: new Date().toISOString()
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.room_id._id).toBe(roomA1._id);
      expect(res.body.data.assigned_to._id).toBe(employeeA._id);
      expect(res.body.data.status).toBe("ASSIGNED");
      expect(res.body.data.priority).toBe("HIGH");

      createdTaskId = res.body.data._id;
    });

    it("should reject creation when room does not exist", async () => {
      const fakeRoomId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .post("/api/v1/hotel/housekeeping/tasks")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_id: fakeRoomId,
          task_type: "CLEANING"
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should reject creation referencing a cross-tenant room", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/housekeeping/tasks")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_id: roomB1._id, // Belongs to Tenant B
          task_type: "CLEANING"
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should reject creation referencing a cross-tenant employee", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/housekeeping/tasks")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_id: roomA1._id,
          assigned_to: employeeB._id, // Belongs to Tenant B
          task_type: "CLEANING"
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Housekeeping Task Read & Isolation", () => {
    it("should list tasks scoped strictly to Tenant A", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/housekeeping/tasks")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some(t => t._id === createdTaskId)).toBe(true);
    });

    it("Tenant B should NOT see Tenant A's housekeeping task", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/housekeeping/tasks")
        .set("Authorization", `Bearer ${adminTokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.some(t => t._id === createdTaskId)).toBe(false);
    });

    it("should filter tasks by status", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/housekeeping/tasks?status=ASSIGNED")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every(t => t.status === "ASSIGNED")).toBe(true);
    });
  });

  describe("Housekeeping Task Update & Status Lifecycle", () => {
    it("Tenant B must be rejected when attempting to update Tenant A's task", async () => {
      const res = await request(app)
        .put(`/api/v1/hotel/housekeeping/tasks/${createdTaskId}`)
        .set("Authorization", `Bearer ${adminTokenB}`)
        .send({
          status: "COMPLETED"
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("Tenant A updates task to IN_PROGRESS", async () => {
      const res = await request(app)
        .put(`/api/v1/hotel/housekeeping/tasks/${createdTaskId}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          status: "IN_PROGRESS",
          notes: "Cleaning currently underway"
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("IN_PROGRESS");
      expect(res.body.data.notes).toBe("Cleaning currently underway");
    });

    it("transitioning task to COMPLETED automatically updates Room.housekeeping_status to CLEAN", async () => {
      const res = await request(app)
        .put(`/api/v1/hotel/housekeeping/tasks/${createdTaskId}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          status: "COMPLETED",
          completed_at: new Date().toISOString()
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("COMPLETED");

      // Verify room housekeeping_status in Tenant A DB
      const Room = await getModel(hotelA, "Room");
      const roomInDb = await Room.findById(roomA1._id);
      expect(roomInDb.housekeeping_status).toBe("CLEAN");
    });

    it("transitioning task to VERIFIED automatically updates Room.housekeeping_status to INSPECTED", async () => {
      const res = await request(app)
        .put(`/api/v1/hotel/housekeeping/tasks/${createdTaskId}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          status: "VERIFIED"
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("VERIFIED");

      // Verify room housekeeping_status in Tenant A DB
      const Room = await getModel(hotelA, "Room");
      const roomInDb = await Room.findById(roomA1._id);
      expect(roomInDb.housekeeping_status).toBe("INSPECTED");
    });
  });

  describe("Housekeeping Task Deletion & Tenant Isolation", () => {
    let taskToDeleteId;

    beforeAll(async () => {
      // Create a temporary task to test deletion
      const res = await request(app)
        .post("/api/v1/hotel/housekeeping/tasks")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_id: roomA2._id,
          task_type: "TURN_DOWN",
          priority: "LOW"
        });
      taskToDeleteId = res.body.data._id;
    });

    it("Tenant B cannot delete Tenant A's task (404 isolation)", async () => {
      const res = await request(app)
        .delete(`/api/v1/hotel/housekeeping/tasks/${taskToDeleteId}`)
        .set("Authorization", `Bearer ${adminTokenB}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("Tenant A successfully deletes task", async () => {
      const res = await request(app)
        .delete(`/api/v1/hotel/housekeeping/tasks/${taskToDeleteId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify task is gone
      const listRes = await request(app)
        .get("/api/v1/hotel/housekeeping/tasks")
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(listRes.body.data.some(t => t._id === taskToDeleteId)).toBe(false);
    });
  });
});
