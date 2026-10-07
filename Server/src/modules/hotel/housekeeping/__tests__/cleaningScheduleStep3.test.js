import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import crypto from "crypto";
import app from "../../../../app.js";
import { connectPlatformDB, closePlatformDB } from "../../../../database/platform/platformConnection.js";
import { closeAllHotelConnections } from "../../../../database/connectionManager.js";
import { getModel } from "../../../../database/hotel/modelFactory.js";

const randomEmail = (prefix = "cs") => `${prefix}_${crypto.randomBytes(4).toString("hex")}@hotel.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe("Phase 7 Step 3: Cleaning Schedule Backend Migration & Integrity", () => {
  let adminTokenA, adminTokenB;
  let hotelA, hotelB;
  let roomTypeA, roomA1, roomA2;
  let roomTypeB, roomB1;
  let employeeA, employeeB;
  let scheduleTaskId;

  beforeAll(async () => {
    await connectPlatformDB();

    // 1. Setup Tenant A
    const emailA = randomEmail("cs_admin_a");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Cleaning Schedule Admin A",
      email: emailA,
      phone: randomPhone(),
      password: "Password123!"
    });
    const loginA = await request(app).post("/api/v1/auth/login").send({ email: emailA, password: "Password123!" });
    const tempTokenA = loginA.body.data.accessToken;

    const onboardA = await request(app).post("/api/v1/provisioning/onboard")
      .set("Authorization", `Bearer ${tempTokenA}`)
      .send({
        property_name: "Schedule Hotel A",
        address: "300 Schedule Ave",
        city: "Islamabad"
      });
    hotelA = onboardA.body.data.hotelId;

    const reloginA = await request(app).post("/api/v1/auth/login").send({ email: emailA, password: "Password123!" });
    adminTokenA = reloginA.body.data.accessToken;

    // Room Type & Rooms for Tenant A
    const rtResA = await request(app).post("/api/v1/hotel/room-types")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({
        name: "Standard Suite A",
        code: `SCH_${crypto.randomBytes(2).toString("hex")}`.toUpperCase(),
        base_occupancy: 2,
        max_occupancy: 4,
        base_price: 180
      });
    roomTypeA = rtResA.body.data;

    const rResA1 = await request(app).post("/api/v1/hotel/rooms")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({
        room_number: `301_${crypto.randomBytes(2).toString("hex")}`,
        room_type_id: roomTypeA._id,
        floor: "3",
        housekeeping_status: "DIRTY"
      });
    roomA1 = rResA1.body.data;

    const rResA2 = await request(app).post("/api/v1/hotel/rooms")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({
        room_number: `302_${crypto.randomBytes(2).toString("hex")}`,
        room_type_id: roomTypeA._id,
        floor: "3",
        housekeeping_status: "DIRTY"
      });
    roomA2 = rResA2.body.data;

    // Department & Employee for Tenant A
    const deptResA = await request(app).post("/api/v1/hotel/departments")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({
        name: "Housekeeping Schedule Dept A",
        code: `HKA_${crypto.randomBytes(2).toString("hex")}`.toUpperCase()
      });
    const deptA = deptResA.body.data;

    const empResA = await request(app).post("/api/v1/hotel/employees")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({
        employee_ref: `EMP-SCH-A-${crypto.randomBytes(2).toString("hex")}`.toUpperCase(),
        first_name: "Ahmed",
        last_name: "Cleaner",
        phone: randomPhone(),
        email: randomEmail("emp_sch_a"),
        department_id: deptA._id,
        job_title: "Room Attendant"
      });
    employeeA = empResA.body.data;

    // 2. Setup Tenant B
    const emailB = randomEmail("cs_admin_b");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Cleaning Schedule Admin B",
      email: emailB,
      phone: randomPhone(),
      password: "Password123!"
    });
    const loginB = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "Password123!" });
    const tempTokenB = loginB.body.data.accessToken;

    const onboardB = await request(app).post("/api/v1/provisioning/onboard")
      .set("Authorization", `Bearer ${tempTokenB}`)
      .send({
        property_name: "Schedule Hotel B",
        address: "400 Resort St",
        city: "Quetta"
      });
    hotelB = onboardB.body.data.hotelId;

    const reloginB = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "Password123!" });
    adminTokenB = reloginB.body.data.accessToken;

    // Room Type & Room for Tenant B
    const rtResB = await request(app).post("/api/v1/hotel/room-types")
      .set("Authorization", `Bearer ${adminTokenB}`)
      .send({
        name: "Standard Suite B",
        code: `SCHB_${crypto.randomBytes(2).toString("hex")}`.toUpperCase(),
        base_occupancy: 2,
        max_occupancy: 2,
        base_price: 150
      });
    roomTypeB = rtResB.body.data;

    const rResB1 = await request(app).post("/api/v1/hotel/rooms")
      .set("Authorization", `Bearer ${adminTokenB}`)
      .send({
        room_number: `401_${crypto.randomBytes(2).toString("hex")}`,
        room_type_id: roomTypeB._id,
        floor: "4",
        housekeeping_status: "DIRTY"
      });
    roomB1 = rResB1.body.data;

    // Department & Employee for Tenant B
    const deptResB = await request(app).post("/api/v1/hotel/departments")
      .set("Authorization", `Bearer ${adminTokenB}`)
      .send({
        name: "Housekeeping Schedule Dept B",
        code: `HKB_${crypto.randomBytes(2).toString("hex")}`.toUpperCase()
      });
    const deptB = deptResB.body.data;

    const empResB = await request(app).post("/api/v1/hotel/employees")
      .set("Authorization", `Bearer ${adminTokenB}`)
      .send({
        employee_ref: `EMP-SCH-B-${crypto.randomBytes(2).toString("hex")}`.toUpperCase(),
        first_name: "Fatima",
        last_name: "Staff",
        phone: randomPhone(),
        email: randomEmail("emp_sch_b"),
        department_id: deptB._id,
        job_title: "Room Attendant"
      });
    employeeB = empResB.body.data;
  });

  afterAll(async () => {
    await closeAllHotelConnections();
    await closePlatformDB();
  });

  describe("Scheduling Timestamps & Semantic Integrity", () => {
    it("creates a scheduled cleaning task with scheduled_at distinct from started_at", async () => {
      const scheduledStart = "2026-10-07T09:00:00.000Z";
      const scheduledEnd = "2026-10-07T10:00:00.000Z";

      const res = await request(app)
        .post("/api/v1/hotel/housekeeping/tasks")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_id: roomA1._id,
          assigned_to: employeeA._id,
          task_type: "CLEANING",
          priority: "MEDIUM",
          status: "ASSIGNED",
          scheduled_at: scheduledStart,
          scheduled_end_at: scheduledEnd,
          notes: "Daily morning clean"
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.room_id._id).toBe(roomA1._id);
      expect(res.body.data.assigned_to._id).toBe(employeeA._id);
      expect(res.body.data.scheduled_at).toBe(scheduledStart);
      expect(res.body.data.scheduled_end_at).toBe(scheduledEnd);
      // started_at must NOT be forced to scheduled_at
      expect(res.body.data.started_at).toBeFalsy();

      scheduleTaskId = res.body.data._id;
    });

    it("starting the task records actual started_at while preserving scheduled_at", async () => {
      const res = await request(app)
        .put(`/api/v1/hotel/housekeeping/tasks/${scheduleTaskId}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          status: "IN_PROGRESS"
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("IN_PROGRESS");
      expect(res.body.data.started_at).toBeTruthy();
      expect(res.body.data.scheduled_at).toBe("2026-10-07T09:00:00.000Z");
    });
  });

  describe("Filtering Capabilities", () => {
    it("filters tasks by room_id", async () => {
      const res = await request(app)
        .get(`/api/v1/hotel/housekeeping/tasks?room_id=${roomA1._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every(t => t.room_id._id === roomA1._id)).toBe(true);
    });

    it("filters tasks by assigned_to", async () => {
      const res = await request(app)
        .get(`/api/v1/hotel/housekeeping/tasks?assigned_to=${employeeA._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every(t => t.assigned_to._id === employeeA._id)).toBe(true);
    });

    it("filters tasks by task_type", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/housekeeping/tasks?task_type=CLEANING")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every(t => t.task_type === "CLEANING")).toBe(true);
    });

    it("filters tasks by scheduled_date", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/housekeeping/tasks?scheduled_date=2026-10-07")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.some(t => t._id === scheduleTaskId)).toBe(true);
    });
  });

  describe("Cancellation & Soft Delete Auditing", () => {
    it("supports CANCELLED status lifecycle state", async () => {
      const res = await request(app)
        .put(`/api/v1/hotel/housekeeping/tasks/${scheduleTaskId}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          status: "CANCELLED",
          notes: "Guest requested cancellation"
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("CANCELLED");
    });

    it("soft-deletes task and preserves operational record in database", async () => {
      // Create a task to delete
      const createRes = await request(app)
        .post("/api/v1/hotel/housekeeping/tasks")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_id: roomA2._id,
          task_type: "TURN_DOWN",
          priority: "LOW"
        });
      const toDeleteId = createRes.body.data._id;

      // Delete it
      const delRes = await request(app)
        .delete(`/api/v1/hotel/housekeeping/tasks/${toDeleteId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);

      // Verify excluded from active list
      const listRes = await request(app)
        .get("/api/v1/hotel/housekeeping/tasks")
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(listRes.body.data.some(t => t._id === toDeleteId)).toBe(false);

      // Verify document still exists in MongoDB with is_deleted = true for audit trail
      const HousekeepingTask = await getModel(hotelA, "HousekeepingTask");
      const inDb = await HousekeepingTask.findById(toDeleteId);
      expect(inDb).toBeTruthy();
      expect(inDb.is_deleted).toBe(true);
    });
  });

  describe("Room Housekeeping Status Lifecycle & Multi-Tenant Isolation", () => {
    it("marking task COMPLETED sets Room.housekeeping_status to CLEAN", async () => {
      const res = await request(app)
        .put(`/api/v1/hotel/housekeeping/tasks/${scheduleTaskId}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          status: "COMPLETED"
        });

      expect(res.status).toBe(200);

      const Room = await getModel(hotelA, "Room");
      const roomInDb = await Room.findById(roomA1._id);
      expect(roomInDb.housekeeping_status).toBe("CLEAN");
    });

    it("Tenant B cannot read, update, or delete Tenant A schedule task", async () => {
      // Read
      const bList = await request(app)
        .get("/api/v1/hotel/housekeeping/tasks")
        .set("Authorization", `Bearer ${adminTokenB}`);
      expect(bList.body.data.some(t => t._id === scheduleTaskId)).toBe(false);

      // Update
      const bUpdate = await request(app)
        .put(`/api/v1/hotel/housekeeping/tasks/${scheduleTaskId}`)
        .set("Authorization", `Bearer ${adminTokenB}`)
        .send({ status: "PENDING" });
      expect(bUpdate.status).toBe(404);

      // Delete
      const bDel = await request(app)
        .delete(`/api/v1/hotel/housekeeping/tasks/${scheduleTaskId}`)
        .set("Authorization", `Bearer ${adminTokenB}`);
      expect(bDel.status).toBe(404);
    });
  });
});
