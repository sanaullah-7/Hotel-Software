import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import crypto from "crypto";
import app from "../../../../app.js";
import { connectPlatformDB, closePlatformDB } from "../../../../database/platform/platformConnection.js";
import { closeAllHotelConnections } from "../../../../database/connectionManager.js";
import { getModel } from "../../../../database/hotel/modelFactory.js";

const randomEmail = (prefix = "ins") => `${prefix}_${crypto.randomBytes(4).toString("hex")}@hotel.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe("Phase 7 Step 5 & Correction: Inspection Checklist Backend Migration & Integrity", () => {
  let adminTokenA, adminTokenB;
  let hotelA, hotelB;
  let roomA, roomB;
  let inspectorA, inspectorB;
  let taskA, taskB;
  let checklistA;
  let inspectionIdA;

  beforeAll(async () => {
    await connectPlatformDB();

    // 1. Setup Tenant A
    const emailA = randomEmail("ins_admin_a");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Inspection Admin A",
      email: emailA,
      phone: randomPhone(),
      password: "Password123!",
    });
    const loginA = await request(app).post("/api/v1/auth/login").send({ email: emailA, password: "Password123!" });
    const tempTokenA = loginA.body.data.accessToken;

    const onboardA = await request(app).post("/api/v1/provisioning/onboard")
      .set("Authorization", `Bearer ${tempTokenA}`)
      .send({
        property_name: "Inspection Hotel A",
        address: "100 Inspector Ave",
        city: "Karachi",
      });
    hotelA = onboardA.body.data.hotelId;

    const reloginA = await request(app).post("/api/v1/auth/login").send({ email: emailA, password: "Password123!" });
    adminTokenA = reloginA.body.data.accessToken;

    // Room Type & Room for Tenant A
    const roomTypeResA = await request(app).post("/api/v1/hotel/room-types")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({
        name: "Deluxe Suite A",
        code: `DLXA_${crypto.randomBytes(2).toString("hex")}`.toUpperCase(),
        base_occupancy: 2,
        max_occupancy: 4,
        base_price: 150,
      });
    const roomTypeA = roomTypeResA.body.data;

    const roomResA = await request(app).post("/api/v1/hotel/rooms")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({
        room_number: `A101_${crypto.randomBytes(2).toString("hex")}`,
        room_type_id: roomTypeA._id,
        floor: "1",
        status: "AVAILABLE",
        housekeeping_status: "DIRTY",
      });
    roomA = roomResA.body.data;

    // Department & Employee for Tenant A
    const deptResA = await request(app).post("/api/v1/hotel/departments")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({
        name: "Quality Assurance A",
        code: `QAA_${crypto.randomBytes(2).toString("hex")}`.toUpperCase(),
      });
    const deptA = deptResA.body.data;

    const empResA = await request(app).post("/api/v1/hotel/employees")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({
        employee_ref: `EMP-QA-A-${crypto.randomBytes(2).toString("hex")}`.toUpperCase(),
        first_name: "John",
        last_name: "Inspector",
        phone: randomPhone(),
        email: randomEmail("qa_a"),
        department_id: deptA._id,
        job_title: "Inspector",
      });
    inspectorA = empResA.body.data;

    // Housekeeping Task for Tenant A
    const taskResA = await request(app).post("/api/v1/hotel/housekeeping/tasks")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({
        room_id: roomA._id,
        assigned_to: inspectorA._id,
        task_type: "INSPECTION",
        priority: "HIGH",
        status: "IN_PROGRESS",
      });
    taskA = taskResA.body.data;

    // 2. Setup Tenant B
    const emailB = randomEmail("ins_admin_b");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Inspection Admin B",
      email: emailB,
      phone: randomPhone(),
      password: "Password123!",
    });
    const loginB = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "Password123!" });
    const tempTokenB = loginB.body.data.accessToken;

    const onboardB = await request(app).post("/api/v1/provisioning/onboard")
      .set("Authorization", `Bearer ${tempTokenB}`)
      .send({
        property_name: "Inspection Hotel B",
        address: "200 Rival Way",
        city: "Lahore",
      });
    hotelB = onboardB.body.data.hotelId;

    const reloginB = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "Password123!" });
    adminTokenB = reloginB.body.data.accessToken;

    const roomTypeResB = await request(app).post("/api/v1/hotel/room-types")
      .set("Authorization", `Bearer ${adminTokenB}`)
      .send({
        name: "Standard B",
        code: `STDB_${crypto.randomBytes(2).toString("hex")}`.toUpperCase(),
        base_occupancy: 2,
        max_occupancy: 4,
        base_price: 100,
      });
    const roomTypeB = roomTypeResB.body.data;

    const roomResB = await request(app).post("/api/v1/hotel/rooms")
      .set("Authorization", `Bearer ${adminTokenB}`)
      .send({
        room_number: `B201_${crypto.randomBytes(2).toString("hex")}`,
        room_type_id: roomTypeB._id,
        floor: "2",
        status: "AVAILABLE",
        housekeeping_status: "DIRTY",
      });
    roomB = roomResB.body.data;

    const deptResB = await request(app).post("/api/v1/hotel/departments")
      .set("Authorization", `Bearer ${adminTokenB}`)
      .send({
        name: "Quality Assurance B",
        code: `QAB_${crypto.randomBytes(2).toString("hex")}`.toUpperCase(),
      });
    const deptB = deptResB.body.data;

    const empResB = await request(app).post("/api/v1/hotel/employees")
      .set("Authorization", `Bearer ${adminTokenB}`)
      .send({
        employee_ref: `EMP-QA-B-${crypto.randomBytes(2).toString("hex")}`.toUpperCase(),
        first_name: "Sarah",
        last_name: "Auditor",
        phone: randomPhone(),
        email: randomEmail("qa_b"),
        department_id: deptB._id,
        job_title: "Inspector",
      });
    inspectorB = empResB.body.data;

    const taskResB = await request(app).post("/api/v1/hotel/housekeeping/tasks")
      .set("Authorization", `Bearer ${adminTokenB}`)
      .send({
        room_id: roomB._id,
        assigned_to: inspectorB._id,
        task_type: "INSPECTION",
        priority: "MEDIUM",
        status: "IN_PROGRESS",
      });
    taskB = taskResB.body.data;
  });

  afterAll(async () => {
    await closeAllHotelConnections();
    await closePlatformDB();
  });

  describe("Checklist Template Management", () => {
    it("should create a checklist template for Tenant A", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/housekeeping/checklists")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          name: "Standard Room Inspection Checklist",
          task_type: "INSPECTION",
          items: [
            { description: "Check bed sheets and pillows", is_required: true },
            { description: "Inspect bathroom cleanliness and towels", is_required: true },
            { description: "Verify mini bar inventory", is_required: false },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("Standard Room Inspection Checklist");
      expect(res.body.data.items.length).toBe(3);
      checklistA = res.body.data;
    });

    it("should retrieve checklists for Tenant A", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/housekeeping/checklists")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.some(c => c._id === checklistA._id)).toBe(true);
    });

    it("should isolate checklist templates from Tenant B", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/housekeeping/checklists")
        .set("Authorization", `Bearer ${adminTokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.data.some(c => c._id === checklistA._id)).toBe(false);
    });
  });

  describe("Correction Issue #1: Inspector Identity & No Auto-Creation", () => {
    it("should reject inspection referencing non-existent inspector_name and NOT auto-create Employee", async () => {
      const EmployeeModel = await getModel(hotelA, "Employee");
      const countBefore = await EmployeeModel.countDocuments();

      const res = await request(app)
        .post("/api/v1/hotel/housekeeping/inspections")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_id: roomA._id,
          inspector_name: "Ghost Inspector Nonexistent",
          score: 80,
          status: "PASSED",
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);

      // Verify Employee count did NOT change
      const countAfter = await EmployeeModel.countDocuments();
      expect(countAfter).toBe(countBefore);
    });

    it("should reject inspection referencing non-existent inspector_id and NOT auto-create Employee", async () => {
      const fakeId = "60c550d3e6c0ecbc9382df99";
      const res = await request(app)
        .post("/api/v1/hotel/housekeeping/inspections")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_id: roomA._id,
          inspector_id: fakeId,
          score: 80,
          status: "PASSED",
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should resolve existing inspector by unambiguous name without creating new records", async () => {
      const EmployeeModel = await getModel(hotelA, "Employee");
      const countBefore = await EmployeeModel.countDocuments();

      const res = await request(app)
        .post("/api/v1/hotel/housekeeping/inspections")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          task_id: taskA._id,
          inspector_name: "John Inspector",
          score: 95,
          status: "PASSED",
          comments: "Resolved by existing employee name.",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.inspector_id._id).toBe(inspectorA._id);

      const countAfter = await EmployeeModel.countDocuments();
      expect(countAfter).toBe(countBefore);
      inspectionIdA = res.body.data._id;
    });
  });

  describe("Correction Issue #2: Pass/Fail Evaluation Rule", () => {
    it("should preserve explicit FAILED status even if score is high (no 70% automatic overwrite)", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/housekeeping/inspections")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          task_id: taskA._id,
          inspector_id: inspectorA._id,
          score: 85,
          status: "FAILED",
          comments: "High score but failed critical safety checklist item.",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe("FAILED");
      expect(res.body.data.passed).toBe(false);
      expect(res.body.data.score).toBe(85);
    });

    it("should preserve explicit PASSED status even if score is lower (e.g. 50% pass on minor remarks)", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/housekeeping/inspections")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          task_id: taskA._id,
          inspector_id: inspectorA._id,
          score: 50,
          status: "PASSED",
          comments: "Pass granted with notes on non-essential amenities.",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe("PASSED");
      expect(res.body.data.passed).toBe(true);
      expect(res.body.data.score).toBe(50);
    });

    it("should reject invalid score range (>100 or <0)", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/housekeeping/inspections")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          task_id: taskA._id,
          inspector_id: inspectorA._id,
          score: 150,
          status: "PASSED",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Correction Issue #3 & #4: Single Lifecycle Owner & Historical Edit Protection", () => {
    let histRoom;
    let histTask;
    let olderInspectionId;
    let newerInspectionId;

    beforeAll(async () => {
      // Create a dedicated room and task for historical lifecycle testing
      const roomRes = await request(app).post("/api/v1/hotel/rooms")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_number: `HIST_${crypto.randomBytes(2).toString("hex")}`,
          room_type_id: roomA.room_type_id._id || roomA.room_type_id,
          floor: "3",
          status: "AVAILABLE",
          housekeeping_status: "DIRTY",
        });
      histRoom = roomRes.body.data;

      const taskRes = await request(app).post("/api/v1/hotel/housekeeping/tasks")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_id: histRoom._id,
          assigned_to: inspectorA._id,
          task_type: "INSPECTION",
          priority: "HIGH",
          status: "IN_PROGRESS",
        });
      histTask = taskRes.body.data;
    });

    it("should record Older Inspection #1 (PASSED) and transition room to INSPECTED", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/housekeeping/inspections")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          task_id: histTask._id,
          inspector_id: inspectorA._id,
          score: 90,
          status: "PASSED",
          inspected_at: "2026-02-01T10:00:00.000Z",
          comments: "Inspection 1: Initial pass",
        });

      expect(res.status).toBe(201);
      olderInspectionId = res.body.data._id;

      // Verify room housekeeping_status transitioned to INSPECTED
      const roomRes = await request(app).get(`/api/v1/hotel/rooms/${histRoom._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(roomRes.body.data.housekeeping_status).toBe("INSPECTED");
    });

    it("should record Newer Inspection #2 (PASSED) maintaining room at INSPECTED", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/housekeeping/inspections")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          task_id: histTask._id,
          inspector_id: inspectorA._id,
          score: 95,
          status: "PASSED",
          inspected_at: "2026-02-02T10:00:00.000Z",
          comments: "Inspection 2: Newer audit pass",
        });

      expect(res.status).toBe(201);
      newerInspectionId = res.body.data._id;

      const roomRes = await request(app).get(`/api/v1/hotel/rooms/${histRoom._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(roomRes.body.data.housekeeping_status).toBe("INSPECTED");
    });

    it("HISTORICAL INTEGRITY: Editing older Inspection #1 from PASSED to FAILED does NOT corrupt current room state", async () => {
      // Modify older Inspection #1
      const updateRes = await request(app)
        .put(`/api/v1/hotel/housekeeping/inspections/${olderInspectionId}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          status: "FAILED",
          score: 40,
          comments: "Audit correction on historical record #1: actually had deficiencies.",
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.status).toBe("FAILED");
      expect(updateRes.body.data.passed).toBe(false);

      // Verify current room status: MUST STILL BE INSPECTED because Newer Inspection #2 is authoritative!
      const roomRes = await request(app).get(`/api/v1/hotel/rooms/${histRoom._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(roomRes.body.data.housekeeping_status).toBe("INSPECTED");
    });

    it("LATEST INTEGRITY: Editing the latest authoritative Inspection #2 to FAILED DOES update current room to DIRTY", async () => {
      // Modify newer Inspection #2 (which is the latest authoritative inspection)
      const updateRes = await request(app)
        .put(`/api/v1/hotel/housekeeping/inspections/${newerInspectionId}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          status: "FAILED",
          score: 30,
          comments: "Latest inspection revised to FAILED.",
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.status).toBe("FAILED");

      // Verify current room status: Now legitimately flips to DIRTY because the authoritative inspection failed!
      const roomRes = await request(app).get(`/api/v1/hotel/rooms/${histRoom._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(roomRes.body.data.housekeeping_status).toBe("DIRTY");
    });
  });

  describe("Tenant Isolation", () => {
    it("Tenant B cannot list Tenant A's inspections", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/housekeeping/inspections")
        .set("Authorization", `Bearer ${adminTokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.data.some(i => i._id === inspectionIdA)).toBe(false);
    });

    it("Tenant B cannot retrieve Tenant A's inspection by ID (returns 404)", async () => {
      const res = await request(app)
        .get(`/api/v1/hotel/housekeeping/inspections/${inspectionIdA}`)
        .set("Authorization", `Bearer ${adminTokenB}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("Tenant B cannot update Tenant A's inspection (returns 404)", async () => {
      const res = await request(app)
        .put(`/api/v1/hotel/housekeeping/inspections/${inspectionIdA}`)
        .set("Authorization", `Bearer ${adminTokenB}`)
        .send({ score: 10 });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("Tenant B cannot delete Tenant A's inspection (returns 404)", async () => {
      const res = await request(app)
        .delete(`/api/v1/hotel/housekeeping/inspections/${inspectionIdA}`)
        .set("Authorization", `Bearer ${adminTokenB}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("Tenant B cannot create an inspection with Tenant A's task_id", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/housekeeping/inspections")
        .set("Authorization", `Bearer ${adminTokenB}`)
        .send({
          task_id: taskA._id,
          inspector_id: inspectorB._id,
          score: 80,
          status: "PASSED",
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("Tenant B cannot create an inspection with Tenant A's inspector_id", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/housekeeping/inspections")
        .set("Authorization", `Bearer ${adminTokenB}`)
        .send({
          task_id: taskB._id,
          inspector_id: inspectorA._id,
          score: 80,
          status: "PASSED",
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Audit Integrity & Soft Deletion", () => {
    it("should soft delete inspection without destroying database audit history", async () => {
      const deleteRes = await request(app)
        .delete(`/api/v1/hotel/housekeeping/inspections/${inspectionIdA}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      // Subsequent GET should return 404
      const getRes = await request(app)
        .get(`/api/v1/hotel/housekeeping/inspections/${inspectionIdA}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(getRes.status).toBe(404);

      // Direct DB inspection confirms soft deletion: record exists with is_deleted = true
      const InspectionModel = await getModel(hotelA, "HousekeepingInspection");
      const dbRecord = await InspectionModel.findById(inspectionIdA);

      expect(dbRecord).not.toBeNull();
      expect(dbRecord.is_deleted).toBe(true);
    });
  });
});
