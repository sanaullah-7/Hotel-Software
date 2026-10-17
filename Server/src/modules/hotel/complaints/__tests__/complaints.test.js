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

const randomEmail = (prefix = "cmp") =>
  `${prefix}_${crypto.randomBytes(4).toString("hex")}@hotel.com`;
const randomPhone = () =>
  `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe("Phase 5: Guest Complaints Backend & Tenant Isolation", () => {
  let adminTokenA, adminTokenB, userTokenA;
  let hotelA, hotelB;
  let guestA1, guestA2, guestB1;
  let roomA1, roomB1;
  let reservationA1, reservationA2;
  let employeeA1;

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
        property_name: "Complaints Hotel A",
        address: "100 Palace Ave",
        city: "Lahore",
      });
    hotelA = onboardA.body.data.hotelId;

    const reloginA = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: emailA, password: "Password123!" });
    adminTokenA = reloginA.body.data.accessToken;

    // Hotel A Standard User Setup (HOTEL_USER role)
    const emailUserA = randomEmail("userA");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Staff User A",
      email: emailUserA,
      phone: randomPhone(),
      password: "Password123!",
    });
    const userAccountA = await Account.findOne({ email: emailUserA });
    userAccountA.hotelId = hotelA;
    userAccountA.role = ROLES.HOTEL_USER;
    await userAccountA.save();

    const loginUserA = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: emailUserA, password: "Password123!" });
    userTokenA = loginUserA.body.data.accessToken;

    // Hotel B Admin Setup
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
        property_name: "Complaints Hotel B",
        address: "200 Sea View",
        city: "Karachi",
      });
    hotelB = onboardB.body.data.hotelId;

    const reloginB = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: emailB, password: "Password123!" });
    adminTokenB = reloginB.body.data.accessToken;

    // Create seed fixtures in Hotel A
    const Guest = await getModel(hotelA, "Guest");
    guestA1 = await Guest.create({
      first_name: "John",
      last_name: "Doe",
      email: randomEmail("guestA1"),
      phone: randomPhone(),
      guest_ref: `GST-${Date.now()}-A1`,
    });
    guestA2 = await Guest.create({
      first_name: "Alice",
      last_name: "Smith",
      email: randomEmail("guestA2"),
      phone: randomPhone(),
      guest_ref: `GST-${Date.now()}-A2`,
    });

    const RoomType = await getModel(hotelA, "RoomType");
    const roomTypeA = await RoomType.create({
      name: "Deluxe Suite",
      code: "DLX-CMP",
      base_occupancy: 2,
      max_occupancy: 4,
      base_price: 150,
    });

    const Room = await getModel(hotelA, "Room");
    roomA1 = await Room.create({
      room_number: "A-101",
      room_type_id: roomTypeA._id,
      floor: "1",
      status: "AVAILABLE",
    });

    const Department = await getModel(hotelA, "Department");
    const deptA = await Department.create({
      name: "Front Desk",
      code: "FD-CMP",
    });

    const Employee = await getModel(hotelA, "Employee");
    employeeA1 = await Employee.create({
      first_name: "David",
      last_name: "Staff",
      email: randomEmail("staffA1"),
      job_title: "Concierge",
      department_id: deptA._id,
      employee_ref: `EMP-${Date.now()}-A1`,
    });

    const Reservation = await getModel(hotelA, "Reservation");
    reservationA1 = await Reservation.create({
      booking_ref: `RES-${Date.now()}-A1`,
      primary_guest_id: guestA1._id,
      expected_check_in: new Date("2026-10-10"),
      expected_check_out: new Date("2026-10-15"),
      adults: 2,
      status: "CONFIRMED",
    });
    reservationA2 = await Reservation.create({
      booking_ref: `RES-${Date.now()}-A2`,
      primary_guest_id: guestA2._id,
      expected_check_in: new Date("2026-10-12"),
      expected_check_out: new Date("2026-10-14"),
      adults: 1,
      status: "CONFIRMED",
    });

    // Create seed fixtures in Hotel B
    const GuestB = await getModel(hotelB, "Guest");
    guestB1 = await GuestB.create({
      first_name: "Bob",
      last_name: "Brown",
      email: randomEmail("guestB1"),
      phone: randomPhone(),
      guest_ref: `GST-${Date.now()}-B1`,
    });

    const RoomTypeB = await getModel(hotelB, "RoomType");
    const roomTypeB = await RoomTypeB.create({
      name: "Standard Room",
      code: "STD-CMP",
      base_occupancy: 2,
      max_occupancy: 2,
      base_price: 100,
    });

    const RoomB = await getModel(hotelB, "Room");
    roomB1 = await RoomB.create({
      room_number: "B-201",
      room_type_id: roomTypeB._id,
      floor: "2",
      status: "AVAILABLE",
    });
  });

  afterAll(async () => {
    await closeAllHotelConnections();
    await closePlatformDB();
  });

  describe("Authentication & RBAC Authorization", () => {
    it("should reject unauthenticated request with 401", async () => {
      const res = await request(app).get("/api/v1/hotel/complaints");
      expect(res.status).toBe(401);
    });

    it("should allow HOTEL_USER to read complaints and create complaints", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/complaints")
        .set("Authorization", `Bearer ${userTokenA}`)
        .send({
          guest_id: guestA1._id.toString(),
          category: "PLUMBING",
          description: "Leaking faucet in bathroom",
          severity: "MEDIUM",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.category).toBe("PLUMBING");
      expect(res.body.data.status).toBe("OPEN");
      expect(res.body.data.complaint_ref).toMatch(/^CMP-\d{8}-[A-F0-9]{4}$/);
    });

    it("should forbid HOTEL_USER from deleting a complaint (403 Forbidden)", async () => {
      // Create complaint as HOTEL_USER
      const createRes = await request(app)
        .post("/api/v1/hotel/complaints")
        .set("Authorization", `Bearer ${userTokenA}`)
        .send({
          guest_id: guestA1._id.toString(),
          category: "NOISE",
          description: "Loud music from next door",
        });
      expect(createRes.status).toBe(201);
      const complaintId = createRes.body.data._id;

      // Attempt delete as HOTEL_USER
      const deleteRes = await request(app)
        .delete(`/api/v1/hotel/complaints/${complaintId}`)
        .set("Authorization", `Bearer ${userTokenA}`);
      expect(deleteRes.status).toBe(403);
    });
  });

  describe("POST /api/v1/hotel/complaints (Create Complaint)", () => {
    it("should create a valid complaint with room, reservation, and employee", async () => {
      const payload = {
        guest_id: guestA1._id.toString(),
        room_id: roomA1._id.toString(),
        reservation_id: reservationA1._id.toString(),
        assigned_to: employeeA1._id.toString(),
        category: "AIR_CONDITIONING",
        description: "AC not cooling properly",
        severity: "HIGH",
        resolution_notes: "Checked thermostat",
        compensation_offered: "Free breakfast voucher",
      };

      const res = await request(app)
        .post("/api/v1/hotel/complaints")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      const complaint = res.body.data;
      expect(complaint.category).toBe("AIR_CONDITIONING");
      expect(complaint.severity).toBe("HIGH");
      expect(complaint.status).toBe("OPEN");
      expect(complaint.guest_id.first_name).toBe("John");
      expect(complaint.room_id.room_number).toBe("A-101");
      expect(complaint.reservation_id.booking_ref).toBe(reservationA1.booking_ref);
      expect(complaint.assigned_to.first_name).toBe("David");
      expect(complaint.resolved_at).toBeNull();
    });

    it("should reject creation when required fields are missing", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/complaints")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          category: "GENERAL",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject invalid category not in canonical enum (e.g. SERVICE, BILLING)", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/complaints")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          guest_id: guestA1._id.toString(),
          category: "SERVICE",
          description: "Invalid category test",
        });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain("Validation failed");
    });

    it("should reject invalid severity", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/complaints")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          guest_id: guestA1._id.toString(),
          category: "ELECTRICAL",
          description: "Light flickering",
          severity: "SUPER_CRITICAL",
        });

      expect(res.status).toBe(400);
    });

    it("should reject non-existent guest_id with 404", async () => {
      const fakeGuestId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .post("/api/v1/hotel/complaints")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          guest_id: fakeGuestId,
          category: "HOUSEKEEPING",
          description: "Need extra towels",
        });

      expect(res.status).toBe(404);
      expect(res.body.error.message).toBe("Guest not found in this hotel");
    });

    it("should reject non-existent room_id with 404", async () => {
      const fakeRoomId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .post("/api/v1/hotel/complaints")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          guest_id: guestA1._id.toString(),
          room_id: fakeRoomId,
          category: "ROOM_SERVICE",
          description: "Late dinner delivery",
        });

      expect(res.status).toBe(404);
      expect(res.body.error.message).toBe("Room not found in this hotel");
    });

    it("should reject reservation that belongs to a different guest", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/complaints")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          guest_id: guestA1._id.toString(),
          reservation_id: reservationA2._id.toString(), // belongs to guestA2!
          category: "AMENITIES",
          description: "Pool towel missing",
        });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe("Reservation does not belong to the specified guest");
    });
  });

  describe("GET /api/v1/hotel/complaints (List & Query Filtering)", () => {
    let cmp1, cmp2, cmp3;

    beforeAll(async () => {
      // Create distinct complaints for query filtering tests
      const r1 = await request(app)
        .post("/api/v1/hotel/complaints")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          guest_id: guestA1._id.toString(),
          category: "PLUMBING",
          description: "Water pressure low in bathroom",
          severity: "LOW",
        });
      cmp1 = r1.body.data;

      const r2 = await request(app)
        .post("/api/v1/hotel/complaints")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          guest_id: guestA2._id.toString(),
          category: "NOISE",
          description: "Elevator noise at night",
          severity: "CRITICAL",
        });
      cmp2 = r2.body.data;

      const r3 = await request(app)
        .post("/api/v1/hotel/complaints")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          guest_id: guestA1._id.toString(),
          category: "HOUSEKEEPING",
          description: "Room was not cleaned by 2pm",
          severity: "MEDIUM",
        });
      cmp3 = r3.body.data;

      // Mark cmp3 as RESOLVED
      await request(app)
        .patch(`/api/v1/hotel/complaints/${cmp3._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ status: "RESOLVED" });
    });

    it("should retrieve complaints list with pagination", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/complaints?page=1&limit=10")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.page).toBe(1);
    });

    it("should filter complaints by category", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/complaints?category=NOISE")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((c) => c.category === "NOISE")).toBe(true);
    });

    it("should filter complaints by status", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/complaints?status=RESOLVED")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.some((c) => c._id === cmp3._id)).toBe(true);
      expect(res.body.data.every((c) => c.status === "RESOLVED")).toBe(true);
    });

    it("should filter complaints by severity", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/complaints?severity=CRITICAL")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((c) => c.severity === "CRITICAL")).toBe(true);
    });

    it("should filter complaints by guest_id", async () => {
      const res = await request(app)
        .get(`/api/v1/hotel/complaints?guest_id=${guestA2._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((c) => c.guest_id._id === guestA2._id.toString())).toBe(true);
    });

    it("should search complaints by description or complaint_ref", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/complaints?search=Elevator")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.some((c) => c.description.includes("Elevator"))).toBe(true);
    });
  });

  describe("GET /api/v1/hotel/complaints/:id (Get Single Complaint)", () => {
    it("should retrieve complaint by ID with populated fields", async () => {
      const createRes = await request(app)
        .post("/api/v1/hotel/complaints")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          guest_id: guestA1._id.toString(),
          room_id: roomA1._id.toString(),
          category: "ELECTRICAL",
          description: "TV remote is out of battery",
        });
      const complaintId = createRes.body.data._id;

      const res = await request(app)
        .get(`/api/v1/hotel/complaints/${complaintId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(complaintId);
      expect(res.body.data.guest_id.first_name).toBe("John");
      expect(res.body.data.room_id.room_number).toBe("A-101");
    });

    it("should return 404 for nonexistent complaint ID", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/api/v1/hotel/complaints/${fakeId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(404);
      expect(res.body.error.message).toBe("Complaint not found");
    });
  });

  describe("PATCH /api/v1/hotel/complaints/:id (Update & Lifecycle)", () => {
    let complaintId;

    beforeAll(async () => {
      const res = await request(app)
        .post("/api/v1/hotel/complaints")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          guest_id: guestA1._id.toString(),
          category: "GENERAL",
          description: "Initial complaint text",
          severity: "MEDIUM",
        });
      complaintId = res.body.data._id;
    });

    it("should update description, severity, and assigned employee", async () => {
      const res = await request(app)
        .patch(`/api/v1/hotel/complaints/${complaintId}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          description: "Updated description text",
          severity: "HIGH",
          assigned_to: employeeA1._id.toString(),
        });

      expect(res.status).toBe(200);
      expect(res.body.data.description).toBe("Updated description text");
      expect(res.body.data.severity).toBe("HIGH");
      expect(res.body.data.assigned_to.first_name).toBe("David");
    });

    it("should transition status to RESOLVED and automatically stamp resolved_at", async () => {
      const res = await request(app)
        .patch(`/api/v1/hotel/complaints/${complaintId}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          status: "RESOLVED",
          resolution_notes: "Fixed by concierge staff",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("RESOLVED");
      expect(res.body.data.resolved_at).not.toBeNull();
      expect(new Date(res.body.data.resolved_at).getTime()).toBeLessThanOrEqual(Date.now());
      expect(res.body.data.resolution_notes).toBe("Fixed by concierge staff");
    });

    it("should support reopening (RESOLVED -> INVESTIGATING) and clear resolved_at", async () => {
      const res = await request(app)
        .patch(`/api/v1/hotel/complaints/${complaintId}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          status: "INVESTIGATING",
          resolution_notes: "Reopened due to recurring issue",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("INVESTIGATING");
      expect(res.body.data.resolved_at).toBeNull();
    });

    it("should prevent modification of immutable fields (guest_id, complaint_ref)", async () => {
      const originalRef = (
        await request(app)
          .get(`/api/v1/hotel/complaints/${complaintId}`)
          .set("Authorization", `Bearer ${adminTokenA}`)
      ).body.data.complaint_ref;

      // Attempt modifying guest_id
      const resGuest = await request(app)
        .patch(`/api/v1/hotel/complaints/${complaintId}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          guest_id: guestA2._id.toString(),
        });
      expect(resGuest.status).toBe(400);

      // Verify complaint_ref remained unchanged
      const checkRes = await request(app)
        .get(`/api/v1/hotel/complaints/${complaintId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(checkRes.body.data.complaint_ref).toBe(originalRef);
    });
  });

  describe("DELETE /api/v1/hotel/complaints/:id (Hard Delete)", () => {
    it("should allow HOTEL_ADMIN to delete complaint and return 404 on subsequent get", async () => {
      const createRes = await request(app)
        .post("/api/v1/hotel/complaints")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          guest_id: guestA1._id.toString(),
          category: "AMENITIES",
          description: "Temporary complaint to delete",
        });
      const tempId = createRes.body.data._id;

      const deleteRes = await request(app)
        .delete(`/api/v1/hotel/complaints/${tempId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.message).toBe("Complaint deleted successfully");

      const getRes = await request(app)
        .get(`/api/v1/hotel/complaints/${tempId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(getRes.status).toBe(404);
    });
  });

  describe("Tenant Isolation Enforcement", () => {
    let complaintA;

    beforeAll(async () => {
      const res = await request(app)
        .post("/api/v1/hotel/complaints")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          guest_id: guestA1._id.toString(),
          category: "PLUMBING",
          description: "Hotel A Private Complaint",
        });
      complaintA = res.body.data;
    });

    it("should prevent Hotel B from listing Hotel A complaints", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/complaints")
        .set("Authorization", `Bearer ${adminTokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.data.some((c) => c._id === complaintA._id)).toBe(false);
    });

    it("should return 404 when Hotel B attempts to read Hotel A complaint by ID", async () => {
      const res = await request(app)
        .get(`/api/v1/hotel/complaints/${complaintA._id}`)
        .set("Authorization", `Bearer ${adminTokenB}`);

      expect(res.status).toBe(404);
      expect(res.body.error.message).toBe("Complaint not found");
    });

    it("should return 404 when Hotel B attempts to update Hotel A complaint", async () => {
      const res = await request(app)
        .patch(`/api/v1/hotel/complaints/${complaintA._id}`)
        .set("Authorization", `Bearer ${adminTokenB}`)
        .send({ description: "Hacked by Hotel B" });

      expect(res.status).toBe(404);
    });

    it("should return 404 when Hotel B attempts to delete Hotel A complaint", async () => {
      const res = await request(app)
        .delete(`/api/v1/hotel/complaints/${complaintA._id}`)
        .set("Authorization", `Bearer ${adminTokenB}`);

      expect(res.status).toBe(404);
    });

    it("should reject cross-tenant relationship creation (Hotel A referencing Hotel B guest)", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/complaints")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          guest_id: guestB1._id.toString(), // belongs to Hotel B!
          category: "ELECTRICAL",
          description: "Cross tenant guest test",
        });

      expect(res.status).toBe(404);
      expect(res.body.error.message).toBe("Guest not found in this hotel");
    });

    it("should reject cross-tenant relationship creation (Hotel A referencing Hotel B room)", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/complaints")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          guest_id: guestA1._id.toString(),
          room_id: roomB1._id.toString(), // belongs to Hotel B!
          category: "ELECTRICAL",
          description: "Cross tenant room test",
        });

      expect(res.status).toBe(404);
      expect(res.body.error.message).toBe("Room not found in this hotel");
    });
  });
});
