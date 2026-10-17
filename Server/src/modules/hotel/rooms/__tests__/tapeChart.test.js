import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../../../app.js";
import { connectPlatformDB } from "../../../../database/platform/platformConnection.js";
import { closeAllHotelConnections } from "../../../../database/connectionManager.js";
import { getModel } from "../../../../database/hotel/modelFactory.js";
import mongoose from "mongoose";
import Account from "../../../../database/platform/models/account.model.js";
import { ROLES } from "../../../../constants/roles.js";
import crypto from "crypto";
import { validateTapeChartQuery } from "../tapeChart.validation.js";

const randomEmail = (prefix = "tc") => `${prefix}_${crypto.randomBytes(4).toString("hex")}@hotel.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe("Phase 3 - Step 1: Read-Only Tape Chart API Integration Suite", () => {
  let adminTokenA, adminTokenB, userTokenA;
  let hotelA_id, hotelB_id;
  let roomTypeA, roomTypeB;
  let roomA1, roomA2, roomA3, roomB1;
  let guestA, guestB;

  beforeAll(async () => {
    await connectPlatformDB();

    // 1. Hotel A Setup
    const emailA = randomEmail("adminA");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Admin A",
      email: emailA,
      phone: randomPhone(),
      password: "password123",
      role: ROLES.HOTEL_USER,
    });
    const loginA = await request(app).post("/api/v1/auth/login").send({ email: emailA, password: "password123" });
    const onboardA = await request(app)
      .post("/api/v1/provisioning/onboard")
      .set("Authorization", `Bearer ${loginA.body.data.accessToken}`)
      .send({
        property_name: "Tape Chart Grand Resort",
        address: "Karakoram Highway",
        city: "Gilgit",
      });
    hotelA_id = onboardA.body.data.hotelId;
    const loginA2 = await request(app).post("/api/v1/auth/login").send({ email: emailA, password: "password123" });
    adminTokenA = loginA2.body.data.accessToken;

    // 2. Hotel B Setup (For Tenant Isolation)
    const emailB = randomEmail("adminB");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Admin B",
      email: emailB,
      phone: randomPhone(),
      password: "password123",
      role: ROLES.HOTEL_USER,
    });
    const loginB = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "password123" });
    const onboardB = await request(app)
      .post("/api/v1/provisioning/onboard")
      .set("Authorization", `Bearer ${loginB.body.data.accessToken}`)
      .send({
        property_name: "Tape Chart B Hotel",
        address: "Mall Road",
        city: "Murree",
      });
    hotelB_id = onboardB.body.data.hotelId;
    const loginB2 = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "password123" });
    adminTokenB = loginB2.body.data.accessToken;

    // 3. Standard User for Hotel A
    const emailUserA = randomEmail("userA");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Receptionist A",
      email: emailUserA,
      phone: randomPhone(),
      password: "password123",
      role: ROLES.HOTEL_USER,
    });
    await Account.findOneAndUpdate({ email: emailUserA }, { hotelId: hotelA_id, role: ROLES.HOTEL_USER });
    const loginUserA = await request(app).post("/api/v1/auth/login").send({ email: emailUserA, password: "password123" });
    userTokenA = loginUserA.body.data.accessToken;

    // 4. Create Room Types in Hotel A & B
    const RoomTypeModelA = await getModel(hotelA_id, "RoomType");
    roomTypeA = await RoomTypeModelA.create({
      name: "Deluxe Suite",
      code: `DLX_${crypto.randomBytes(2).toString("hex")}`.toUpperCase(),
      base_price: 250,
      base_occupancy: 2,
      max_occupancy: 4,
    });

    const RoomTypeModelB = await getModel(hotelB_id, "RoomType");
    roomTypeB = await RoomTypeModelB.create({
      name: "Standard Room B",
      code: `STD_${crypto.randomBytes(2).toString("hex")}`.toUpperCase(),
      base_price: 150,
      base_occupancy: 1,
      max_occupancy: 2,
    });

    // 5. Create Physical Rooms in Hotel A
    const RoomModelA = await getModel(hotelA_id, "Room");
    roomA1 = await RoomModelA.create({
      room_number: "101",
      floor: "1",
      room_type_id: roomTypeA._id,
      status: "AVAILABLE",
      housekeeping_status: "CLEAN",
    });

    roomA2 = await RoomModelA.create({
      room_number: "102",
      floor: "1",
      room_type_id: roomTypeA._id,
      status: "MAINTENANCE",
      housekeeping_status: "DIRTY",
    });

    roomA3 = await RoomModelA.create({
      room_number: "103",
      floor: "1",
      room_type_id: roomTypeA._id,
      status: "AVAILABLE",
      housekeeping_status: "INSPECTED",
    });

    // Create Room in Hotel B
    const RoomModelB = await getModel(hotelB_id, "Room");
    roomB1 = await RoomModelB.create({
      room_number: "201",
      floor: "2",
      room_type_id: roomTypeB._id,
      status: "AVAILABLE",
      housekeeping_status: "CLEAN",
    });

    // 6. Create Guests in Hotel A & B
    const GuestModelA = await getModel(hotelA_id, "Guest");
    guestA = await GuestModelA.create({
      first_name: "Ahmed",
      last_name: "Khan",
      email: randomEmail("guestA"),
      phone: "03001234567",
      guest_ref: "GST-A01",
    });

    const GuestModelB = await getModel(hotelB_id, "Guest");
    guestB = await GuestModelB.create({
      first_name: "Bilal",
      last_name: "Tariq",
      email: randomEmail("guestB"),
      phone: "03111234567",
      guest_ref: "GST-B01",
    });

    // 7. Create Maintenance Ticket for Room 102 in Hotel A
    const MaintenanceTicketModelA = await getModel(hotelA_id, "MaintenanceTicket");
    await MaintenanceTicketModelA.create({
      ticket_ref: "TICK-102",
      title: "AC not cooling",
      description: "Needs refrigerant gas refill",
      room_id: roomA2._id,
      priority: "HIGH",
      status: "IN_PROGRESS",
    });
  });

  afterAll(async () => {
    await closeAllHotelConnections();
    await mongoose.connection.close();
  });

  // ----------------------------------------------------
  // 1. QUERY VALIDATION TESTS
  // ----------------------------------------------------
  describe("1. Query Parameter Validation", () => {
    it("should reject request when startDate is missing", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/rooms/tape-chart?endDate=2026-11-20")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.details.join(" ")).toMatch(/startDate query parameter is required/i);
    });

    it("should reject request when endDate is missing", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/rooms/tape-chart?startDate=2026-11-20")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.details.join(" ")).toMatch(/endDate query parameter is required/i);
    });

    it("should reject invalid date format (non-YYYY-MM-DD)", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/rooms/tape-chart?startDate=20-11-2026&endDate=2026-11-25")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(400);
      expect(res.body.error.details.join(" ")).toMatch(/Dates must be formatted as YYYY-MM-DD/i);
    });

    it("should reject impossible calendar dates (e.g., Feb 30 or Nov 31)", async () => {
      const res1 = await request(app)
        .get("/api/v1/hotel/rooms/tape-chart?startDate=2026-02-30&endDate=2026-03-05")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res1.status).toBe(400);
      expect(res1.body.error.details.join(" ")).toMatch(/Invalid calendar date/i);

      const res2 = await request(app)
        .get("/api/v1/hotel/rooms/tape-chart?startDate=2026-11-10&endDate=2026-11-31")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res2.status).toBe(400);
      expect(res2.body.error.details.join(" ")).toMatch(/Invalid calendar date/i);
    });

    it("should reject when endDate equals startDate", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/rooms/tape-chart?startDate=2026-11-20&endDate=2026-11-20")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(400);
      expect(res.body.error.details.join(" ")).toMatch(/endDate must be strictly later than startDate/i);
    });

    it("should reject when endDate is earlier than startDate", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/rooms/tape-chart?startDate=2026-11-20&endDate=2026-11-18")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(400);
      expect(res.body.error.details.join(" ")).toMatch(/endDate must be strictly later than startDate/i);
    });

    it("should reject date ranges exceeding 31 calendar days", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/rooms/tape-chart?startDate=2026-11-01&endDate=2026-12-05") // 34 days
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(400);
      expect(res.body.error.details.join(" ")).toMatch(/Date range cannot exceed 31 days/i);
    });

    it("should accept valid 7-day, 14-day, and 30-day date ranges", async () => {
      // 7 days
      const res7 = await request(app)
        .get("/api/v1/hotel/rooms/tape-chart?startDate=2026-11-01&endDate=2026-11-08")
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(res7.status).toBe(200);
      expect(res7.body.data.date_range.total_days).toBe(7);

      // 14 days
      const res14 = await request(app)
        .get("/api/v1/hotel/rooms/tape-chart?startDate=2026-11-01&endDate=2026-11-15")
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(res14.status).toBe(200);
      expect(res14.body.data.date_range.total_days).toBe(14);

      // 30 days
      const res30 = await request(app)
        .get("/api/v1/hotel/rooms/tape-chart?startDate=2026-11-01&endDate=2026-12-01")
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(res30.status).toBe(200);
      expect(res30.body.data.date_range.total_days).toBe(30);
    });

    it("should sanitize query parameters by attaching req.validatedQuery and stripping unknown parameters", async () => {
      // Direct middleware assertion
      const mockReq = {
        query: {
          startDate: "2026-11-01",
          endDate: "2026-11-08",
          unknownParam: "unauthorized_override",
          injection: { malicious: true },
        },
      };
      let nextCalled = false;
      validateTapeChartQuery(mockReq, {}, (err) => {
        expect(err).toBeUndefined();
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
      expect(mockReq.validatedQuery).toBeDefined();
      expect(mockReq.validatedQuery.startDate).toBe("2026-11-01");
      expect(mockReq.validatedQuery.endDate).toBe("2026-11-08");
      expect(mockReq.validatedQuery.unknownParam).toBeUndefined();
      expect(mockReq.validatedQuery.injection).toBeUndefined();

      // End-to-end HTTP request with extra query parameters
      const res = await request(app)
        .get("/api/v1/hotel/rooms/tape-chart?startDate=2026-11-01&endDate=2026-11-08&unknownParam=unauthorized_override&extra=123")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.date_range.start_date).toBe("2026-11-01");
      expect(res.body.data.date_range.end_date).toBe("2026-11-08");
    });
  });

  // ----------------------------------------------------
  // 2. RESERVATION BOUNDARIES & LIFECYCLE TESTS
  // ----------------------------------------------------
  describe("2. Reservation Boundaries & Lifecycle Filtering", () => {
    let resInside, resSpanning, resOverlapStart, resOverlapEnd;
    let resTouchStart, resTouchEnd, resCancelled, resNoShow, resPending;

    beforeAll(async () => {
      const ReservationModel = await getModel(hotelA_id, "Reservation");
      const ResRoomModel = await getModel(hotelA_id, "ReservationRoom");

      // Query window to test against: Nov 10 to Nov 20 (2026-11-10 to 2026-11-20)

      // 1. Fully inside: Nov 12 -> Nov 15
      resInside = await ReservationModel.create({
        booking_ref: "RES-INSIDE-01",
        primary_guest_id: guestA._id,
        status: "CONFIRMED",
        expected_check_in: new Date("2026-11-12T14:00:00.000Z"),
        expected_check_out: new Date("2026-11-15T11:00:00.000Z"),
        adults: 2,
      });
      await ResRoomModel.create({
        reservation_id: resInside._id,
        room_type_id: roomTypeA._id,
        room_id: roomA1._id,
        rate_plan_id: new mongoose.Types.ObjectId(),
        adults: 2,
      });

      // 2. Starts before, ends within: Nov 05 -> Nov 12
      resOverlapStart = await ReservationModel.create({
        booking_ref: "RES-OVLP-START",
        primary_guest_id: guestA._id,
        status: "CONFIRMED",
        expected_check_in: new Date("2026-11-05T14:00:00.000Z"),
        expected_check_out: new Date("2026-11-12T11:00:00.000Z"),
        adults: 1,
      });
      await ResRoomModel.create({
        reservation_id: resOverlapStart._id,
        room_type_id: roomTypeA._id,
        room_id: roomA3._id,
        rate_plan_id: new mongoose.Types.ObjectId(),
        adults: 1,
      });

      // 3. Starts within, ends after: Nov 18 -> Nov 25
      resOverlapEnd = await ReservationModel.create({
        booking_ref: "RES-OVLP-END",
        primary_guest_id: guestA._id,
        status: "CONFIRMED",
        expected_check_in: new Date("2026-11-18T14:00:00.000Z"),
        expected_check_out: new Date("2026-11-25T11:00:00.000Z"),
        adults: 1,
      });
      await ResRoomModel.create({
        reservation_id: resOverlapEnd._id,
        room_type_id: roomTypeA._id,
        room_id: roomA1._id,
        rate_plan_id: new mongoose.Types.ObjectId(),
        adults: 1,
      });

      // 4. Spans entire range: Nov 01 -> Nov 30
      resSpanning = await ReservationModel.create({
        booking_ref: "RES-SPANNING",
        primary_guest_id: guestA._id,
        status: "CONFIRMED",
        expected_check_in: new Date("2026-11-01T14:00:00.000Z"),
        expected_check_out: new Date("2026-11-30T11:00:00.000Z"),
        adults: 2,
      });
      await ResRoomModel.create({
        reservation_id: resSpanning._id,
        room_type_id: roomTypeA._id,
        room_id: roomA2._id,
        rate_plan_id: new mongoose.Types.ObjectId(),
        adults: 2,
      });

      // 5. Ends exactly on range startDate (Nov 10 00:00:00): Nov 05 -> Nov 10
      // MUST be EXCLUDED by half-open rule (check_out > rangeStart is false)
      resTouchStart = await ReservationModel.create({
        booking_ref: "RES-TOUCH-START",
        primary_guest_id: guestA._id,
        status: "CONFIRMED",
        expected_check_in: new Date("2026-11-05T14:00:00.000Z"),
        expected_check_out: new Date("2026-11-10T00:00:00.000Z"),
        adults: 1,
      });
      await ResRoomModel.create({
        reservation_id: resTouchStart._id,
        room_type_id: roomTypeA._id,
        room_id: roomA1._id,
        rate_plan_id: new mongoose.Types.ObjectId(),
        adults: 1,
      });

      // 6. Begins exactly on range endDate (Nov 20 00:00:00): Nov 20 -> Nov 25
      // MUST be EXCLUDED by half-open rule (check_in < rangeEnd is false)
      resTouchEnd = await ReservationModel.create({
        booking_ref: "RES-TOUCH-END",
        primary_guest_id: guestA._id,
        status: "CONFIRMED",
        expected_check_in: new Date("2026-11-20T00:00:00.000Z"),
        expected_check_out: new Date("2026-11-25T11:00:00.000Z"),
        adults: 1,
      });
      await ResRoomModel.create({
        reservation_id: resTouchEnd._id,
        room_type_id: roomTypeA._id,
        room_id: roomA1._id,
        rate_plan_id: new mongoose.Types.ObjectId(),
        adults: 1,
      });

      // 7. CANCELLED reservation overlapping window: Nov 14 -> Nov 16 (MUST be EXCLUDED)
      resCancelled = await ReservationModel.create({
        booking_ref: "RES-CANCELLED",
        primary_guest_id: guestA._id,
        status: "CANCELLED",
        expected_check_in: new Date("2026-11-14T14:00:00.000Z"),
        expected_check_out: new Date("2026-11-16T11:00:00.000Z"),
        adults: 1,
      });
      await ResRoomModel.create({
        reservation_id: resCancelled._id,
        room_type_id: roomTypeA._id,
        room_id: roomA1._id,
        rate_plan_id: new mongoose.Types.ObjectId(),
        adults: 1,
      });

      // 8. NO_SHOW reservation overlapping window: Nov 14 -> Nov 16 (MUST be EXCLUDED)
      resNoShow = await ReservationModel.create({
        booking_ref: "RES-NOSHOW",
        primary_guest_id: guestA._id,
        status: "NO_SHOW",
        expected_check_in: new Date("2026-11-14T14:00:00.000Z"),
        expected_check_out: new Date("2026-11-16T11:00:00.000Z"),
        adults: 1,
      });
      await ResRoomModel.create({
        reservation_id: resNoShow._id,
        room_type_id: roomTypeA._id,
        room_id: roomA1._id,
        rate_plan_id: new mongoose.Types.ObjectId(),
        adults: 1,
      });

      // 9. PENDING reservation: Nov 16 -> Nov 17 (MUST be INCLUDED with status PENDING)
      resPending = await ReservationModel.create({
        booking_ref: "RES-PENDING",
        primary_guest_id: guestA._id,
        status: "PENDING",
        expected_check_in: new Date("2026-11-16T14:00:00.000Z"),
        expected_check_out: new Date("2026-11-17T11:00:00.000Z"),
        adults: 1,
      });
      await ResRoomModel.create({
        reservation_id: resPending._id,
        room_type_id: roomTypeA._id,
        room_id: roomA3._id,
        rate_plan_id: new mongoose.Types.ObjectId(),
        adults: 1,
      });
    });

    it("should return overlapping reservations and enforce canonical half-open boundary exclusions", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/rooms/tape-chart?startDate=2026-11-10&endDate=2026-11-20")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      const items = res.body.data.timeline_items;
      const bookingRefs = items.map((i) => i.booking_ref);

      // Included overlapping items
      expect(bookingRefs).toContain("RES-INSIDE-01");
      expect(bookingRefs).toContain("RES-OVLP-START");
      expect(bookingRefs).toContain("RES-OVLP-END");
      expect(bookingRefs).toContain("RES-SPANNING");
      expect(bookingRefs).toContain("RES-PENDING");

      // Excluded boundary & non-active items
      expect(bookingRefs).not.toContain("RES-TOUCH-START"); // Ends on range start
      expect(bookingRefs).not.toContain("RES-TOUCH-END"); // Begins on range end
      expect(bookingRefs).not.toContain("RES-CANCELLED"); // Cancelled
      expect(bookingRefs).not.toContain("RES-NOSHOW"); // No show

      // Verify pending reservation preserves PENDING status
      const pendingItem = items.find((i) => i.booking_ref === "RES-PENDING");
      expect(pendingItem.status).toBe("PENDING");
      expect(pendingItem.type).toBe("RESERVATION");
    });
  });

  // ----------------------------------------------------
  // 3. ACTIVE STAYS & DEDUPLICATION TESTS
  // ----------------------------------------------------
  describe("3. Active Stays & Deduplication", () => {
    let inHouseRes, inHouseStay;

    beforeAll(async () => {
      const ReservationModel = await getModel(hotelA_id, "Reservation");
      const ResRoomModel = await getModel(hotelA_id, "ReservationRoom");
      const StayModel = await getModel(hotelA_id, "Stay");
      const StayRoomModel = await getModel(hotelA_id, "StayRoom");

      // Create an active in-house reservation with an active Stay in Room 101
      inHouseRes = await ReservationModel.create({
        booking_ref: "RES-INHOUSE-01",
        primary_guest_id: guestA._id,
        status: "IN_HOUSE",
        expected_check_in: new Date("2026-11-10T14:00:00.000Z"),
        expected_check_out: new Date("2026-11-13T11:00:00.000Z"),
        adults: 2,
        special_requests: "Late check-out",
      });

      await ResRoomModel.create({
        reservation_id: inHouseRes._id,
        room_type_id: roomTypeA._id,
        room_id: roomA1._id,
        rate_plan_id: new mongoose.Types.ObjectId(),
        adults: 2,
      });

      inHouseStay = await StayModel.create({
        stay_ref: "STY-INHOUSE-01",
        reservation_id: inHouseRes._id,
        primary_guest_id: guestA._id,
        status: "CHECKED_IN",
        actual_check_in: new Date("2026-11-10T15:00:00.000Z"),
        total_guests: 2,
      });

      await StayRoomModel.create({
        stay_id: inHouseStay._id,
        room_id: roomA1._id,
        guest_id: guestA._id,
        check_in_time: new Date("2026-11-10T15:00:00.000Z"),
        status: "OCCUPIED",
      });
    });

    it("should represent active stay using actual assigned room and prevent duplicate occupancy", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/rooms/tape-chart?startDate=2026-11-10&endDate=2026-11-15")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      const items = res.body.data.timeline_items;

      // Filter items matching this booking
      const matchingItems = items.filter((i) => i.booking_ref === "RES-INHOUSE-01");

      // MUST be exactly 1 item (no duplicate between reservation and stay)
      expect(matchingItems).toHaveLength(1);

      const inHouseItem = matchingItems[0];
      expect(inHouseItem.type).toBe("STAY");
      expect(inHouseItem.status).toBe("IN_HOUSE");
      expect(inHouseItem.room_id).toBe(roomA1._id.toString());
      expect(inHouseItem.stay_id).toBe(inHouseStay._id.toString());
      expect(inHouseItem.stay_ref).toBe("STY-INHOUSE-01");
      expect(inHouseItem.guest.name).toBe("Ahmed Khan");
      expect(inHouseItem.special_requests).toBe("Late check-out");
    });

    it("should handle multi-room reservations accurately", async () => {
      const ReservationModel = await getModel(hotelA_id, "Reservation");
      const ResRoomModel = await getModel(hotelA_id, "ReservationRoom");

      const multiRes = await ReservationModel.create({
        booking_ref: "RES-MULTI-ROOM",
        primary_guest_id: guestA._id,
        status: "CONFIRMED",
        expected_check_in: new Date("2026-11-10T14:00:00.000Z"),
        expected_check_out: new Date("2026-11-12T11:00:00.000Z"),
        adults: 4,
      });

      // Assigned to both Room 101 and Room 103
      await ResRoomModel.create({
        reservation_id: multiRes._id,
        room_type_id: roomTypeA._id,
        room_id: roomA1._id,
        rate_plan_id: new mongoose.Types.ObjectId(),
        adults: 2,
      });
      await ResRoomModel.create({
        reservation_id: multiRes._id,
        room_type_id: roomTypeA._id,
        room_id: roomA3._id,
        rate_plan_id: new mongoose.Types.ObjectId(),
        adults: 2,
      });

      const res = await request(app)
        .get("/api/v1/hotel/rooms/tape-chart?startDate=2026-11-10&endDate=2026-11-15")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      const items = res.body.data.timeline_items;

      const multiItems = items.filter((i) => i.booking_ref === "RES-MULTI-ROOM");
      expect(multiItems).toHaveLength(2);

      const assignedRoomIds = multiItems.map((i) => i.room_id);
      expect(assignedRoomIds).toContain(roomA1._id.toString());
      expect(assignedRoomIds).toContain(roomA3._id.toString());
    });

    it("should not display checked-out stays or vacated stay rooms as active occupancy", async () => {
      const StayModel = await getModel(hotelA_id, "Stay");
      const StayRoomModel = await getModel(hotelA_id, "StayRoom");
      const ReservationModel = await getModel(hotelA_id, "Reservation");

      const checkedOutRes = await ReservationModel.create({
        booking_ref: "RES-CHECKED-OUT-PAST",
        primary_guest_id: guestA._id,
        status: "CHECKED_OUT",
        expected_check_in: new Date("2026-11-01T14:00:00.000Z"),
        expected_check_out: new Date("2026-11-05T11:00:00.000Z"),
        adults: 1,
      });

      const checkedOutStay = await StayModel.create({
        stay_ref: "STY-CHECKED-OUT-PAST",
        reservation_id: checkedOutRes._id,
        primary_guest_id: guestA._id,
        status: "CHECKED_OUT",
        actual_check_in: new Date("2026-11-01T14:00:00.000Z"),
        actual_check_out: new Date("2026-11-05T11:00:00.000Z"),
        total_guests: 1,
      });

      await StayRoomModel.create({
        stay_id: checkedOutStay._id,
        room_id: roomA1._id,
        guest_id: guestA._id,
        check_in_time: new Date("2026-11-01T14:00:00.000Z"),
        check_out_time: new Date("2026-11-05T11:00:00.000Z"),
        status: "VACATED",
      });

      const res = await request(app)
        .get("/api/v1/hotel/rooms/tape-chart?startDate=2026-11-01&endDate=2026-11-10")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      const items = res.body.data.timeline_items;
      const matchingStay = items.find((i) => i.stay_ref === "STY-CHECKED-OUT-PAST");
      expect(matchingStay).toBeUndefined();
    });

    it("should safely ignore reservations without physical room assignments from physical room rows", async () => {
      const ReservationModel = await getModel(hotelA_id, "Reservation");
      const ResRoomModel = await getModel(hotelA_id, "ReservationRoom");

      const unassignedRes = await ReservationModel.create({
        booking_ref: "RES-UNASSIGNED-01",
        primary_guest_id: guestA._id,
        status: "CONFIRMED",
        expected_check_in: new Date("2026-11-12T14:00:00.000Z"),
        expected_check_out: new Date("2026-11-14T11:00:00.000Z"),
        adults: 1,
      });

      // room_id is null / unassigned
      await ResRoomModel.create({
        reservation_id: unassignedRes._id,
        room_type_id: roomTypeA._id,
        room_id: null,
        rate_plan_id: new mongoose.Types.ObjectId(),
        adults: 1,
      });

      const res = await request(app)
        .get("/api/v1/hotel/rooms/tape-chart?startDate=2026-11-10&endDate=2026-11-15")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      const items = res.body.data.timeline_items;
      const unassignedItem = items.find((i) => i.booking_ref === "RES-UNASSIGNED-01");
      expect(unassignedItem).toBeUndefined();
    });
  });

  // ----------------------------------------------------
  // 4. ROOMS, MAINTENANCE & DATA INTEGRITY
  // ----------------------------------------------------
  describe("4. Rooms, Maintenance & Data Integrity", () => {
    it("should return complete untruncated physical rooms with distinct operational & housekeeping statuses", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/rooms/tape-chart?startDate=2026-11-10&endDate=2026-11-15")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      const rooms = res.body.data.rooms;

      // Hotel A has 3 rooms
      expect(rooms).toHaveLength(3);

      const room101 = rooms.find((r) => r.room_number === "101");
      expect(room101.status).toBe("AVAILABLE");
      expect(room101.housekeeping_status).toBe("CLEAN");
      expect(room101.room_type_name).toBe("Deluxe Suite");

      const room102 = rooms.find((r) => r.room_number === "102");
      expect(room102.status).toBe("MAINTENANCE");
      expect(room102.housekeeping_status).toBe("DIRTY");

      // Verify active maintenance ticket is attached without fabricated dates
      expect(room102.active_maintenance).toHaveLength(1);
      expect(room102.active_maintenance[0].ticket_ref).toBe("TICK-102");
      expect(room102.active_maintenance[0].title).toBe("AC not cooling");
      expect(room102.active_maintenance[0].status).toBe("IN_PROGRESS");
    });

    it("should return successful response with empty arrays for a hotel with no rooms or bookings", async () => {
      // Hotel B has 1 room and 0 bookings
      const res = await request(app)
        .get("/api/v1/hotel/rooms/tape-chart?startDate=2026-11-10&endDate=2026-11-15")
        .set("Authorization", `Bearer ${adminTokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rooms).toHaveLength(1);
      expect(res.body.data.rooms[0].room_number).toBe("201");
      expect(res.body.data.timeline_items).toHaveLength(0);
    });
  });

  // ----------------------------------------------------
  // 5. SECURITY & TENANT ISOLATION
  // ----------------------------------------------------
  describe("5. Security & Tenant Isolation", () => {
    it("should strictly prevent Hotel B from viewing Hotel A's rooms or timeline items", async () => {
      const resB = await request(app)
        .get("/api/v1/hotel/rooms/tape-chart?startDate=2026-11-10&endDate=2026-11-15")
        .set("Authorization", `Bearer ${adminTokenB}`);

      expect(resB.status).toBe(200);
      const roomNumbersB = resB.body.data.rooms.map((r) => r.room_number);
      expect(roomNumbersB).not.toContain("101");
      expect(roomNumbersB).not.toContain("102");
      expect(roomNumbersB).not.toContain("103");
      expect(roomNumbersB).toContain("201");

      const timelineItemsB = resB.body.data.timeline_items;
      expect(timelineItemsB).toHaveLength(0);
    });

    it("should reject client-supplied tenant overrides in query parameters", async () => {
      // Hotel B user passes Hotel A's hotelId in query
      const res = await request(app)
        .get(`/api/v1/hotel/rooms/tape-chart?startDate=2026-11-10&endDate=2026-11-15&hotelId=${hotelA_id}`)
        .set("Authorization", `Bearer ${adminTokenB}`);

      expect(res.status).toBe(200);
      // Still only returns Hotel B's room
      const roomNumbers = res.body.data.rooms.map((r) => r.room_number);
      expect(roomNumbers).not.toContain("101");
      expect(roomNumbers).toContain("201");
    });

    it("should reject unauthenticated requests with 401", async () => {
      const res = await request(app).get("/api/v1/hotel/rooms/tape-chart?startDate=2026-11-10&endDate=2026-11-15");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should allow standard HOTEL_USER (Receptionist) to view the tape chart", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/rooms/tape-chart?startDate=2026-11-10&endDate=2026-11-15")
        .set("Authorization", `Bearer ${userTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rooms.length).toBeGreaterThan(0);
    });

    it("should not expose sensitive guest personal or billing data", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/rooms/tape-chart?startDate=2026-11-10&endDate=2026-11-15")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      const items = res.body.data.timeline_items;
      expect(items.length).toBeGreaterThan(0);

      items.forEach((item) => {
        // No folio balance, invoice references, or sensitive credentials
        expect(item.folio_balance).toBeUndefined();
        expect(item.invoice_id).toBeUndefined();
        expect(item.payment_details).toBeUndefined();
        if (item.guest) {
          expect(item.guest.cnic_number).toBeUndefined();
          expect(item.guest.passport_number).toBeUndefined();
          expect(item.guest.base64_data).toBeUndefined();
        }
      });
    });
  });
});
