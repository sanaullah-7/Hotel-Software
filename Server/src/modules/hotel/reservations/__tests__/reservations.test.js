import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import crypto from "crypto";
import mongoose from "mongoose";
import app from "../../../../app.js";
import { connectPlatformDB, closePlatformDB } from "../../../../database/platform/platformConnection.js";
import { getHotelConnection, closeAllHotelConnections } from "../../../../database/connectionManager.js";
import { getModel } from "../../../../database/hotel/modelFactory.js";

const randomEmail = (prefix = "res") => `${prefix}_${crypto.randomBytes(4).toString("hex")}@hotel.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe("Phase 6: Reservations & Availability Management", () => {
  let adminTokenA, adminTokenB;
  let hotelA, hotelB;
  let guestA, guestB;
  let roomTypeA, roomA;

  beforeAll(async () => {
    await connectPlatformDB();

    // 1. Setup Hotel A
    const emailA = randomEmail("adminA");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Admin Hotel A", email: emailA, phone: randomPhone(), password: "Password123!"
    });
    const loginA = await request(app).post("/api/v1/auth/login").send({ email: emailA, password: "Password123!" });
    const tempTokenA = loginA.body.data.accessToken;

    const onboardA = await request(app).post("/api/v1/provisioning/onboard").set("Authorization", `Bearer ${tempTokenA}`).send({
      property_name: "Reservation Haven A", address: "100 Bay St", city: "Lahore"
    });
    hotelA = onboardA.body.data.hotelId;

    const reloginA = await request(app).post("/api/v1/auth/login").send({ email: emailA, password: "Password123!" });
    adminTokenA = reloginA.body.data.accessToken;

    // Create Guest A in Hotel A
    const resGuestA = await request(app).post("/api/v1/hotel/guests").set("Authorization", `Bearer ${adminTokenA}`).send({
      first_name: "Guest", last_name: "Alpha", email: randomEmail("guestA"), phone: randomPhone()
    });
    guestA = resGuestA.body.data;

    // Create RoomType A in Hotel A
    const resRtA = await request(app).post("/api/v1/hotel/room-types").set("Authorization", `Bearer ${adminTokenA}`).send({
      name: "Deluxe Suite", code: `DLX_${crypto.randomBytes(2).toString("hex")}`.toUpperCase(), base_occupancy: 2, max_occupancy: 4, base_price: 150
    });
    roomTypeA = resRtA.body.data;

    // Create Room A in Hotel A
    const resRoomA = await request(app).post("/api/v1/hotel/rooms").set("Authorization", `Bearer ${adminTokenA}`).send({
      room_number: `101_${crypto.randomBytes(2).toString("hex")}`, room_type_id: roomTypeA._id, floor: "1"
    });
    roomA = resRoomA.body.data;

    // 2. Setup Hotel B
    const emailB = randomEmail("adminB");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Admin Hotel B", email: emailB, phone: randomPhone(), password: "Password123!"
    });
    const loginB = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "Password123!" });
    const tempTokenB = loginB.body.data.accessToken;

    const onboardB = await request(app).post("/api/v1/provisioning/onboard").set("Authorization", `Bearer ${tempTokenB}`).send({
      property_name: "Reservation Haven B", address: "200 Beach Rd", city: "Karachi"
    });
    hotelB = onboardB.body.data.hotelId;

    const reloginB = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "Password123!" });
    adminTokenB = reloginB.body.data.accessToken;

    // Create Guest B in Hotel B
    const resGuestB = await request(app).post("/api/v1/hotel/guests").set("Authorization", `Bearer ${adminTokenB}`).send({
      first_name: "Guest", last_name: "Beta", email: randomEmail("guestB"), phone: randomPhone()
    });
    guestB = resGuestB.body.data;
  });

  afterAll(async () => {
    await closeAllHotelConnections();
    await closePlatformDB();
  });

  describe("Availability Checks", () => {
    it("should report availability for room types in Hotel A", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/reservations/availability")
        .query({ check_in: "2026-11-01", check_out: "2026-11-05", room_type_id: roomTypeA._id })
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].available_rooms).toBe(1);
    });

    it("should reject check_out date before check_in date", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/reservations/availability")
        .query({ check_in: "2026-11-05", check_out: "2026-11-01" })
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(400);
    });
  });

  describe("Reservation Creation & Cross-Tenant Validation", () => {
    it("should create a reservation successfully in Hotel A", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          primary_guest_id: guestA._id,
          room_type_id: roomTypeA._id,
          room_id: roomA._id,
          expected_check_in: "2026-11-01T14:00:00.000Z",
          expected_check_out: "2026-11-05T10:00:00.000Z",
          adults: 2,
          children: 0,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reservation.booking_ref).toMatch(/^RES-/);
      expect(res.body.data.reservation.status).toBe("CONFIRMED");
    });

    it("should reject reservation in Hotel A using Guest from Hotel B (Cross-Tenant Guard)", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          primary_guest_id: guestB._id, // Belongs to Hotel B!
          room_type_id: roomTypeA._id,
          expected_check_in: "2026-11-10T14:00:00.000Z",
          expected_check_out: "2026-11-12T10:00:00.000Z",
          adults: 1,
        });

      expect(res.status).toBe(404);
      expect(res.body.error.message).toMatch(/guest not found/i);
    });
  });

  describe("Double-Booking & Overlap Prevention", () => {
    it("should reject double-booking assigned room for overlapping dates", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          primary_guest_id: guestA._id,
          room_type_id: roomTypeA._id,
          room_id: roomA._id, // Room A is already booked Nov 1 - Nov 5!
          expected_check_in: "2026-11-03T14:00:00.000Z",
          expected_check_out: "2026-11-07T10:00:00.000Z",
          adults: 1,
        });

      expect(res.status).toBe(409);
      expect(res.body.error.message).toMatch(/already booked/i);
    });

    it("should allow booking for non-overlapping dates (after check-out)", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          primary_guest_id: guestA._id,
          room_type_id: roomTypeA._id,
          room_id: roomA._id,
          expected_check_in: "2026-11-06T14:00:00.000Z", // After Nov 5
          expected_check_out: "2026-11-08T10:00:00.000Z",
          adults: 1,
        });

      expect(res.status).toBe(201);
    });

    it("should allow booking starting on the exact check-out date of an existing reservation (Case 4)", async () => {
      // 1. Booking 1: Nov 20 -> Nov 22
      const res1 = await request(app)
        .post("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          primary_guest_id: guestA._id,
          room_type_id: roomTypeA._id,
          room_id: roomA._id,
          expected_check_in: "2026-11-20T14:00:00.000Z",
          expected_check_out: "2026-11-22T10:00:00.000Z",
          adults: 1,
        });
      expect(res1.status).toBe(201);

      // 2. Booking 2 starting on exact check-out day: Nov 22 -> Nov 24
      const res2 = await request(app)
        .post("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          primary_guest_id: guestA._id,
          room_type_id: roomTypeA._id,
          room_id: roomA._id,
          expected_check_in: "2026-11-22T14:00:00.000Z",
          expected_check_out: "2026-11-24T10:00:00.000Z",
          adults: 1,
        });
      expect(res2.status).toBe(201);
    });

    it("should allow booking a room if the previous reservation was CANCELLED (Case 5)", async () => {
      // 1. Create a reservation
      const res1 = await request(app)
        .post("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          primary_guest_id: guestA._id,
          room_type_id: roomTypeA._id,
          expected_check_in: "2027-01-01T14:00:00.000Z",
          expected_check_out: "2027-01-05T10:00:00.000Z",
          adults: 1,
        });
      expect(res1.status).toBe(201);
      const resId = res1.body.data.reservation._id;

      // 2. Cancel it
      const cancelRes = await request(app)
        .post(`/api/v1/hotel/reservations/${resId}/cancel`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ cancellation_reason: "Testing cancel release" });
      expect(cancelRes.status).toBe(200);

      // 3. New booking for same dates should succeed
      const res2 = await request(app)
        .post("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          primary_guest_id: guestA._id,
          room_type_id: roomTypeA._id,
          expected_check_in: "2027-01-01T14:00:00.000Z",
          expected_check_out: "2027-01-05T10:00:00.000Z",
          adults: 1,
        });
      expect(res2.status).toBe(201);
    });

    it("should reject booking a room if the room is OUT_OF_ORDER", async () => {
      const connA = await getHotelConnection(hotelA);
      const Room = await getModel(connA, "Room");

      // Temporarily mark roomA as OUT_OF_ORDER
      await Room.findByIdAndUpdate(roomA._id, { status: "OUT_OF_ORDER" });

      const res = await request(app)
        .post("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          primary_guest_id: guestA._id,
          room_id: roomA._id,
          room_type_id: roomTypeA._id,
          expected_check_in: "2027-02-01T14:00:00.000Z",
          expected_check_out: "2027-02-05T10:00:00.000Z",
          adults: 1,
        });
      expect(res.status).toBe(409);
      expect(res.body.message).toContain("out of order");

      // Restore roomA status
      await Room.findByIdAndUpdate(roomA._id, { status: "AVAILABLE" });
    });

    it("should execute compensating rollback on room lock if subsequent reservation creation fails", async () => {
      const connA = await getHotelConnection(hotelA);
      const Room = await getModel(connA, "Room");
      const Reservation = await getModel(connA, "Reservation");

      // Intentionally cause failure on createReservation by mocking Reservation.create rejection
      const originalCreate = Reservation.create;
      Reservation.create = () => {
        throw new Error("Simulated database failure during Reservation.create");
      };

      const res = await request(app)
        .post("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          primary_guest_id: guestA._id,
          room_id: roomA._id,
          room_type_id: roomTypeA._id,
          expected_check_in: "2027-03-01T14:00:00.000Z",
          expected_check_out: "2027-03-05T10:00:00.000Z",
          adults: 1,
        });
      expect(res.status).toBe(500);

      // Verify compensating cleanup: roomA active_bookings must NOT contain the failed date interval
      const updatedRoom = await Room.findById(roomA._id);
      const lingeringBooking = (updatedRoom.active_bookings || []).find(
        (b) => new Date(b.check_in).toISOString() === "2027-03-01T14:00:00.000Z"
      );
      expect(lingeringBooking).toBeUndefined();

      // Restore Reservation.create
      Reservation.create = originalCreate;
    });

    it("Test A & B: should preserve existing room locks even when another booking attempt on the room fails", async () => {
      const connA = await getHotelConnection(hotelA);
      const Room = await getModel(connA, "Room");
      const Reservation = await getModel(connA, "Reservation");

      const existingLockId = new mongoose.Types.ObjectId();
      const existingResId = new mongoose.Types.ObjectId();
      const existingCheckIn = new Date("2027-04-01T14:00:00.000Z");
      const existingCheckOut = new Date("2027-04-05T10:00:00.000Z");

      // Inject a pre-existing active booking lock
      await Room.findByIdAndUpdate(roomA._id, {
        $push: {
          active_bookings: {
            _id: existingLockId,
            reservation_id: existingResId,
            check_in: existingCheckIn,
            check_out: existingCheckOut,
          },
        },
      });

      // Inject failure on Reservation.create for a subsequent request
      const originalCreate = Reservation.create;
      Reservation.create = () => {
        throw new Error("Simulated failure during concurrent booking");
      };

      const res = await request(app)
        .post("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          primary_guest_id: guestA._id,
          room_id: roomA._id,
          room_type_id: roomTypeA._id,
          expected_check_in: "2027-04-10T14:00:00.000Z",
          expected_check_out: "2027-04-15T10:00:00.000Z",
          adults: 1,
        });

      Reservation.create = originalCreate;
      expect(res.status).toBe(500);

      // Verify the pre-existing lock is completely preserved
      const updatedRoom = await Room.findById(roomA._id);
      const preservedLock = (updatedRoom.active_bookings || []).find(
        (b) => b._id.toString() === existingLockId.toString()
      );
      expect(preservedLock).toBeDefined();
      expect(preservedLock.reservation_id.toString()).toBe(existingResId.toString());

      // Clean up injected pre-existing lock
      await Room.findByIdAndUpdate(roomA._id, {
        $pull: { active_bookings: { _id: existingLockId } },
      });
    });

    it("Test C: should clean up partial reservation write if ReservationRoom creation fails", async () => {
      const connA = await getHotelConnection(hotelA);
      const Room = await getModel(connA, "Room");
      const Reservation = await getModel(connA, "Reservation");
      const ReservationRoom = await getModel(connA, "ReservationRoom");

      // Mock ReservationRoom.create to fail after Reservation is created
      const originalRoomCreate = ReservationRoom.create;
      ReservationRoom.create = () => {
        throw new Error("Simulated database failure during ReservationRoom.create");
      };

      const checkInStr = "2027-06-01T14:00:00.000Z";
      const checkOutStr = "2027-06-05T10:00:00.000Z";

      const res = await request(app)
        .post("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          primary_guest_id: guestA._id,
          room_id: roomA._id,
          room_type_id: roomTypeA._id,
          expected_check_in: checkInStr,
          expected_check_out: checkOutStr,
          adults: 1,
        });

      ReservationRoom.create = originalRoomCreate;
      expect(res.status).toBe(500);

      // 1. Room lock must be cleaned up
      const updatedRoom = await Room.findById(roomA._id);
      const lingeringLock = (updatedRoom.active_bookings || []).find(
        (b) => new Date(b.check_in).toISOString() === checkInStr
      );
      expect(lingeringLock).toBeUndefined();

      // 2. Partial Reservation document must NOT linger in the database
      const orphanRes = await Reservation.findOne({
        expected_check_in: new Date(checkInStr),
        expected_check_out: new Date(checkOutStr),
        primary_guest_id: guestA._id,
      });
      expect(orphanRes).toBeNull();
    });

    it("Test D: should preserve a successfully committed reservation against later failure cleanups", async () => {
      const connA = await getHotelConnection(hotelA);
      const Room = await getModel(connA, "Room");
      const Reservation = await getModel(connA, "Reservation");

      // 1. Create a successful reservation on Room A
      const successRes = await request(app)
        .post("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          primary_guest_id: guestA._id,
          room_id: roomA._id,
          room_type_id: roomTypeA._id,
          expected_check_in: "2027-07-01T14:00:00.000Z",
          expected_check_out: "2027-07-05T10:00:00.000Z",
          adults: 1,
        });

      expect(successRes.status).toBe(201);
      const committedResId = successRes.body.data.reservation._id;

      // 2. Attempt another reservation that fails during creation
      const originalCreate = Reservation.create;
      Reservation.create = () => {
        throw new Error("Simulated failure during subsequent reservation attempt");
      };

      const failRes = await request(app)
        .post("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          primary_guest_id: guestA._id,
          room_id: roomA._id,
          room_type_id: roomTypeA._id,
          expected_check_in: "2027-07-10T14:00:00.000Z",
          expected_check_out: "2027-07-15T10:00:00.000Z",
          adults: 1,
        });

      Reservation.create = originalCreate;
      expect(failRes.status).toBe(500);

      // 3. Verify committed reservation and its lock are completely intact
      const preservedRes = await Reservation.findById(committedResId);
      expect(preservedRes).not.toBeNull();
      expect(preservedRes.status).toBe("CONFIRMED");

      const updatedRoom = await Room.findById(roomA._id);
      const committedLock = (updatedRoom.active_bookings || []).find(
        (b) => b.reservation_id && b.reservation_id.toString() === committedResId.toString()
      );
      expect(committedLock).toBeDefined();
    });
  });

  describe("Reservation List, View & Cancel Lifecycle", () => {
    let reservationId;

    beforeAll(async () => {
      const res = await request(app)
        .post("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          primary_guest_id: guestA._id,
          room_type_id: roomTypeA._id,
          expected_check_in: "2026-12-10T14:00:00.000Z",
          expected_check_out: "2026-12-15T10:00:00.000Z",
          adults: 1,
        });
      reservationId = res.body.data.reservation._id;
    });

    it("should list reservations with pagination", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should retrieve reservation details by ID", async () => {
      const res = await request(app)
        .get(`/api/v1/hotel/reservations/${reservationId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(reservationId);
      expect(res.body.data.primary_guest_id).toBeDefined();
    });

    it("should cancel reservation successfully", async () => {
      const res = await request(app)
        .post(`/api/v1/hotel/reservations/${reservationId}/cancel`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ cancellation_reason: "Travel plans changed" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("CANCELLED");
    });
  });

  describe("Group Reservations Lifecycle & Multi-Tenancy", () => {
    let groupIdA;

    it("should create a group reservation successfully in Hotel A", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/reservations/groups")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          name: "Acme Annual Summit",
          contact_person: "Alice Walker",
          email: "alice@acme.com",
          phone: "1234567890",
          expected_check_in: "2026-12-01T00:00:00.000Z",
          expected_check_out: "2026-12-05T00:00:00.000Z",
          rooms_count: 5,
          total_guests: 10,
          room_types: "Standard",
          status: "CONFIRMED",
          total_price: 2500,
          billing_instructions: "Master folio to company",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("Acme Annual Summit");
      expect(res.body.data.contact_person).toBe("Alice Walker");
      expect(res.body.data.rooms_count).toBe(5);
      expect(res.body.data.total_price).toBe(2500);
      groupIdA = res.body.data._id;
    });

    it("should reject group reservation with missing required fields", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/reservations/groups")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          name: "Incomplete Group",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should list group reservations and isolate across hotels", async () => {
      const resA = await request(app)
        .get("/api/v1/hotel/reservations/groups")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(resA.status).toBe(200);
      expect(resA.body.data.length).toBeGreaterThanOrEqual(1);
      expect(resA.body.data.some((g) => g._id === groupIdA)).toBe(true);

      // Hotel B should not see Hotel A's group reservation
      const resB = await request(app)
        .get("/api/v1/hotel/reservations/groups")
        .set("Authorization", `Bearer ${adminTokenB}`);

      expect(resB.status).toBe(200);
      expect(resB.body.data.some((g) => g._id === groupIdA)).toBe(false);
    });

    it("should retrieve a group reservation by ID", async () => {
      const res = await request(app)
        .get(`/api/v1/hotel/reservations/groups/${groupIdA}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(groupIdA);
      expect(res.body.data.name).toBe("Acme Annual Summit");
    });

    it("should prevent cross-hotel access to group reservation by ID", async () => {
      const res = await request(app)
        .get(`/api/v1/hotel/reservations/groups/${groupIdA}`)
        .set("Authorization", `Bearer ${adminTokenB}`);

      expect(res.status).toBe(404);
    });

    it("should update a group reservation successfully", async () => {
      const res = await request(app)
        .put(`/api/v1/hotel/reservations/groups/${groupIdA}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          contact_person: "Alice Walker-Smith",
          total_price: 2800,
          rooms_count: 6,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.contact_person).toBe("Alice Walker-Smith");
      expect(res.body.data.total_price).toBe(2800);
      expect(res.body.data.rooms_count).toBe(6);
    });

    it("should reject cancelling group reservation with invalid token or cross-hotel access", async () => {
      // 1. Unauthorized
      const unauthRes = await request(app)
        .post(`/api/v1/hotel/reservations/groups/${groupIdA}/cancel`)
        .send({ cancellation_reason: "Test unauth" });
      expect(unauthRes.status).toBe(401);

      // 2. Cross-hotel access
      const crossRes = await request(app)
        .post(`/api/v1/hotel/reservations/groups/${groupIdA}/cancel`)
        .set("Authorization", `Bearer ${adminTokenB}`)
        .send({ cancellation_reason: "Cross hotel attempt" });
      expect(crossRes.status).toBe(404);
    });

    it("should cancel a group reservation successfully and retain the document with CANCELLED status", async () => {
      const res = await request(app)
        .post(`/api/v1/hotel/reservations/groups/${groupIdA}/cancel`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ cancellation_reason: "Corporate event postponed" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("CANCELLED");
      expect(res.body.data.cancellation_reason).toBe("Corporate event postponed");

      // Confirm document is retained with 200 OK
      const getRes = await request(app)
        .get(`/api/v1/hotel/reservations/groups/${groupIdA}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data._id).toBe(groupIdA);
      expect(getRes.body.data.status).toBe("CANCELLED");
      expect(getRes.body.data.group_ref).toBeDefined();
      expect(getRes.body.data.name).toBe("Acme Annual Summit");
      expect(getRes.body.data.contact_person).toBe("Alice Walker-Smith");
      expect(getRes.body.data.total_price).toBe(2800);
      expect(getRes.body.data.rooms_count).toBe(6);
    });

    it("should reject cancelling an already cancelled group reservation", async () => {
      const res = await request(app)
        .post(`/api/v1/hotel/reservations/groups/${groupIdA}/cancel`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ cancellation_reason: "Double cancel attempt" });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error?.message || res.body.message).toContain("already cancelled");
    });

    it("should cancel child reservations and release room inventory when group is cancelled", async () => {
      // 1. Create a new group
      const groupRes = await request(app)
        .post("/api/v1/hotel/reservations/groups")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          name: "Cascade Group Test",
          contact_person: "Bob Smith",
          email: "bob@cascade.com",
          phone: "9876543210",
          expected_check_in: "2026-12-10T00:00:00.000Z",
          expected_check_out: "2026-12-15T00:00:00.000Z",
          rooms_count: 1,
          total_guests: 2,
          room_types: "Standard",
          status: "CONFIRMED",
          total_price: 1000,
        });
      expect(groupRes.status).toBe(201);
      const childGroupId = groupRes.body.data._id;

      // 2. Create a child reservation assigned to roomA
      const childRes = await request(app)
        .post("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          group_id: childGroupId,
          primary_guest_id: guestA._id,
          room_type_id: roomTypeA._id,
          room_id: roomA._id,
          expected_check_in: "2026-12-10T14:00:00.000Z",
          expected_check_out: "2026-12-15T10:00:00.000Z",
          adults: 2,
          children: 0,
        });
      expect(childRes.status).toBe(201);
      const childResId = childRes.body.data.reservation._id;
      expect(childRes.body.data.reservation.status).toBe("CONFIRMED");

      // Verify roomA has active booking
      const roomCheckBefore = await request(app)
        .get("/api/v1/hotel/reservations/availability")
        .query({ check_in: "2026-12-10", check_out: "2026-12-15", room_type_id: roomTypeA._id })
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(roomCheckBefore.body.data[0].available_rooms).toBe(0);

      // 3. Cancel the group
      const cancelGroupRes = await request(app)
        .post(`/api/v1/hotel/reservations/groups/${childGroupId}/cancel`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ cancellation_reason: "Group trip called off" });
      expect(cancelGroupRes.status).toBe(200);
      expect(cancelGroupRes.body.data.status).toBe("CANCELLED");

      // 4. Verify child reservation status is CANCELLED
      const childCheckAfter = await request(app)
        .get(`/api/v1/hotel/reservations/${childResId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(childCheckAfter.status).toBe(200);
      expect(childCheckAfter.body.data.status).toBe("CANCELLED");

      // 5. Verify room availability was released
      const roomCheckAfter = await request(app)
        .get("/api/v1/hotel/reservations/availability")
        .query({ check_in: "2026-12-10", check_out: "2026-12-15", room_type_id: roomTypeA._id })
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(roomCheckAfter.body.data[0].available_rooms).toBe(1);
    });

    it("should reject group cancellation if a child reservation is in active IN_HOUSE stay", async () => {
      // 1. Create a new group
      const groupRes = await request(app)
        .post("/api/v1/hotel/reservations/groups")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          name: "In-House Guard Group",
          contact_person: "Charlie Brown",
          email: "charlie@guard.com",
          phone: "5551234567",
          expected_check_in: "2026-12-20T00:00:00.000Z",
          expected_check_out: "2026-12-25T00:00:00.000Z",
          rooms_count: 1,
          total_guests: 1,
          status: "CONFIRMED",
          total_price: 500,
        });
      const inHouseGroupId = groupRes.body.data._id;

      // 2. Create child reservation
      const childRes = await request(app)
        .post("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          group_id: inHouseGroupId,
          primary_guest_id: guestA._id,
          room_type_id: roomTypeA._id,
          room_id: roomA._id,
          expected_check_in: "2026-12-20T14:00:00.000Z",
          expected_check_out: "2026-12-25T10:00:00.000Z",
          adults: 1,
        });
      const childResId = childRes.body.data.reservation._id;

      // 3. Update child reservation status to IN_HOUSE (simulating check-in)
      await request(app)
        .put(`/api/v1/hotel/reservations/${childResId}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ status: "IN_HOUSE" });

      // 4. Attempt to cancel the group - must be rejected
      const cancelAttempt = await request(app)
        .post(`/api/v1/hotel/reservations/groups/${inHouseGroupId}/cancel`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ cancellation_reason: "Attempted cancellation during stay" });

      expect(cancelAttempt.status).toBe(400);
      expect(cancelAttempt.body.success).toBe(false);
      expect(cancelAttempt.body.error?.message || cancelAttempt.body.message).toContain("in-house");

      // 5. Confirm group status remains unchanged (CONFIRMED)
      const groupCheck = await request(app)
        .get(`/api/v1/hotel/reservations/groups/${inHouseGroupId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(groupCheck.body.data.status).toBe("CONFIRMED");
    });
  });

  describe("Phase 3 Step 4: Future Reservation Room Reassignment", () => {
    let reassignRoomB;

    beforeAll(async () => {
      // Create destination room B in hotel A
      const resRoomB = await request(app)
        .post("/api/v1/hotel/rooms")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_number: `402_${crypto.randomBytes(2).toString("hex")}`,
          room_type_id: roomTypeA._id,
          floor: "4",
        });
      reassignRoomB = resRoomB.body.data;
    });

    it("should successfully reassign a future reservation to an available room and update locks", async () => {
      const connA = await getHotelConnection(hotelA);
      const Room = await getModel(connA, "Room");
      const ReservationRoom = await getModel(connA, "ReservationRoom");

      // 1. Create a reservation on roomA
      const createRes = await request(app)
        .post("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          primary_guest_id: guestA._id,
          room_id: roomA._id,
          room_type_id: roomTypeA._id,
          expected_check_in: "2027-08-01T14:00:00.000Z",
          expected_check_out: "2027-08-05T10:00:00.000Z",
          adults: 1,
        });

      expect(createRes.status).toBe(201);
      const reservationId = createRes.body.data.reservation._id;

      // 2. Reassign to roomB
      const reassignRes = await request(app)
        .post(`/api/v1/hotel/reservations/${reservationId}/reassign-room`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_id: reassignRoomB._id,
        });

      expect(reassignRes.status).toBe(200);
      expect(reassignRes.body.success).toBe(true);

      // 3. Verify ReservationRoom is now assigned to roomB
      const resRoom = await ReservationRoom.findOne({ reservation_id: reservationId });
      expect(resRoom.room_id.toString()).toBe(reassignRoomB._id.toString());

      // 4. Verify source roomA lock has been released
      const updatedSourceRoom = await Room.findById(roomA._id);
      const sourceLock = (updatedSourceRoom.active_bookings || []).find(
        (b) => b.reservation_id && b.reservation_id.toString() === reservationId.toString()
      );
      expect(sourceLock).toBeUndefined();

      // 5. Verify destination roomB has acquired the lock
      const updatedDestRoom = await Room.findById(reassignRoomB._id);
      const destLock = (updatedDestRoom.active_bookings || []).find(
        (b) => b.reservation_id && b.reservation_id.toString() === reservationId.toString()
      );
      expect(destLock).toBeDefined();
      expect(destLock._id).toBeDefined();
    });

    it("should reject reassignment if destination room is already booked for overlapping dates", async () => {
      const connA = await getHotelConnection(hotelA);
      const Room = await getModel(connA, "Room");
      const ReservationRoom = await getModel(connA, "ReservationRoom");

      // 1. Create Res 1 on roomB: 2027-09-01 -> 2027-09-05
      const res1 = await request(app)
        .post("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          primary_guest_id: guestA._id,
          room_id: reassignRoomB._id,
          room_type_id: roomTypeA._id,
          expected_check_in: "2027-09-01T14:00:00.000Z",
          expected_check_out: "2027-09-05T10:00:00.000Z",
          adults: 1,
        });
      expect(res1.status).toBe(201);

      // 2. Create Res 2 on roomA with overlapping dates: 2027-09-03 -> 2027-09-07
      const res2 = await request(app)
        .post("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          primary_guest_id: guestA._id,
          room_id: roomA._id,
          room_type_id: roomTypeA._id,
          expected_check_in: "2027-09-03T14:00:00.000Z",
          expected_check_out: "2027-09-07T10:00:00.000Z",
          adults: 1,
        });
      expect(res2.status).toBe(201);
      const res2Id = res2.body.data.reservation._id;

      // 3. Attempt to reassign Res 2 to roomB -> must fail with 409 Conflict
      const conflictReassign = await request(app)
        .post(`/api/v1/hotel/reservations/${res2Id}/reassign-room`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_id: reassignRoomB._id,
        });

      expect(conflictReassign.status).toBe(409);
      expect(conflictReassign.body.error?.message || conflictReassign.body.message).toMatch(/already booked/i);

      // 4. Verify source roomA lock and assignment remain intact
      const resRoom2 = await ReservationRoom.findOne({ reservation_id: res2Id });
      expect(resRoom2.room_id.toString()).toBe(roomA._id.toString());

      const sourceRoom = await Room.findById(roomA._id);
      const sourceLock = (sourceRoom.active_bookings || []).find(
        (b) => b.reservation_id && b.reservation_id.toString() === res2Id.toString()
      );
      expect(sourceLock).toBeDefined();
    });

    it("should reject reassignment if destination room is OUT_OF_ORDER", async () => {
      const connA = await getHotelConnection(hotelA);
      const Room = await getModel(connA, "Room");

      // Mark roomB as OUT_OF_ORDER
      await Room.findByIdAndUpdate(reassignRoomB._id, { status: "OUT_OF_ORDER" });

      const res = await request(app)
        .post("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          primary_guest_id: guestA._id,
          room_id: roomA._id,
          room_type_id: roomTypeA._id,
          expected_check_in: "2027-10-01T14:00:00.000Z",
          expected_check_out: "2027-10-05T10:00:00.000Z",
          adults: 1,
        });
      const reservationId = res.body.data.reservation._id;

      const reassignFail = await request(app)
        .post(`/api/v1/hotel/reservations/${reservationId}/reassign-room`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_id: reassignRoomB._id,
        });

      expect(reassignFail.status).toBe(409);
      expect(reassignFail.body.error?.message || reassignFail.body.message).toMatch(/out of order/i);

      // Restore roomB
      await Room.findByIdAndUpdate(reassignRoomB._id, { status: "AVAILABLE" });
    });

    it("should reject future reassignment if reservation is already IN_HOUSE", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          primary_guest_id: guestA._id,
          room_id: roomA._id,
          room_type_id: roomTypeA._id,
          expected_check_in: "2027-11-01T14:00:00.000Z",
          expected_check_out: "2027-11-05T10:00:00.000Z",
          adults: 1,
        });
      const reservationId = res.body.data.reservation._id;

      // Mark reservation IN_HOUSE
      const connA = await getHotelConnection(hotelA);
      const Reservation = await getModel(connA, "Reservation");
      await Reservation.findByIdAndUpdate(reservationId, { status: "IN_HOUSE" });

      const reassignFail = await request(app)
        .post(`/api/v1/hotel/reservations/${reservationId}/reassign-room`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_id: reassignRoomB._id,
        });

      expect(reassignFail.status).toBe(400);
      expect(reassignFail.body.error?.message || reassignFail.body.message).toMatch(/checked in.*active-stay/i);
    });

    it("should reject cross-tenant reassignment attempt", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          primary_guest_id: guestA._id,
          room_id: roomA._id,
          room_type_id: roomTypeA._id,
          expected_check_in: "2027-12-01T14:00:00.000Z",
          expected_check_out: "2027-12-05T10:00:00.000Z",
          adults: 1,
        });
      const reservationId = res.body.data.reservation._id;

      // Hotel B admin attempts to reassign Hotel A's reservation
      const crossTenant = await request(app)
        .post(`/api/v1/hotel/reservations/${reservationId}/reassign-room`)
        .set("Authorization", `Bearer ${adminTokenB}`)
        .send({
          room_id: reassignRoomB._id,
        });

      expect(crossTenant.status).toBe(404);
    });

    it("should safely reassign one room of a multi-room reservation while preserving unrelated locks sharing the same reservation ID", async () => {
      const connA = await getHotelConnection(hotelA);
      const Room = await getModel(connA, "Room");
      const Reservation = await getModel(connA, "Reservation");
      const ReservationRoom = await getModel(connA, "ReservationRoom");

      // Create two distinct rooms for the multi-room booking, plus a third destination room
      const resR1 = await request(app)
        .post("/api/v1/hotel/rooms")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_number: `601_${crypto.randomBytes(2).toString("hex")}`,
          room_type_id: roomTypeA._id,
          floor: "6",
        });
      const room1 = resR1.body.data;

      const resR2 = await request(app)
        .post("/api/v1/hotel/rooms")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_number: `602_${crypto.randomBytes(2).toString("hex")}`,
          room_type_id: roomTypeA._id,
          floor: "6",
        });
      const room2 = resR2.body.data;

      const resR3 = await request(app)
        .post("/api/v1/hotel/rooms")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_number: `603_${crypto.randomBytes(2).toString("hex")}`,
          room_type_id: roomTypeA._id,
          floor: "6",
        });
      const room3 = resR3.body.data;

      // Create reservation initially assigned to room1
      const res = await request(app)
        .post("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          primary_guest_id: guestA._id,
          room_id: room1._id,
          room_type_id: roomTypeA._id,
          expected_check_in: "2027-12-10T14:00:00.000Z",
          expected_check_out: "2027-12-15T10:00:00.000Z",
          adults: 2,
        });
      const reservationId = res.body.data.reservation._id;

      // Add a second room assignment and lock on room2 sharing the SAME reservation_id
      const resRoom2 = await ReservationRoom.create({
        reservation_id: reservationId,
        room_id: room2._id,
        room_type_id: roomTypeA._id,
        rate_plan_id: roomTypeA._id, // placeholder
        adults: 1,
      });

      const lockId2 = new mongoose.Types.ObjectId();
      await Room.findByIdAndUpdate(room2._id, {
        $push: {
          active_bookings: {
            _id: lockId2,
            reservation_id: reservationId,
            check_in: new Date("2027-12-10T14:00:00.000Z"),
            check_out: new Date("2027-12-15T10:00:00.000Z"),
          },
        },
      });

      // Find the first ReservationRoom record (for room1)
      const resRoom1 = await ReservationRoom.findOne({
        reservation_id: reservationId,
        room_id: room1._id,
      });

      // Reassign resRoom1 from room1 to room3
      const reassignRes = await request(app)
        .post(`/api/v1/hotel/reservations/${reservationId}/reassign-room`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_id: room3._id,
          reservation_room_id: resRoom1._id,
        });

      expect(reassignRes.status).toBe(200);

      // Verify room1's lock was removed
      const updatedRoom1 = await Room.findById(room1._id);
      const room1Locks = (updatedRoom1.active_bookings || []).filter(
        (b) => b.reservation_id && b.reservation_id.toString() === reservationId.toString()
      );
      expect(room1Locks).toHaveLength(0);

      // Verify room3 received a unique lock
      const updatedRoom3 = await Room.findById(room3._id);
      const room3Locks = (updatedRoom3.active_bookings || []).filter(
        (b) => b.reservation_id && b.reservation_id.toString() === reservationId.toString()
      );
      expect(room3Locks).toHaveLength(1);
      expect(room3Locks[0]._id.toString()).not.toBe(lockId2.toString());

      // CRITICAL ASSERTION: room2's lock with the SAME reservation_id is PRESERVED!
      const updatedRoom2 = await Room.findById(room2._id);
      const room2Locks = (updatedRoom2.active_bookings || []).filter(
        (b) => b.reservation_id && b.reservation_id.toString() === reservationId.toString()
      );
      expect(room2Locks).toHaveLength(1);
      expect(room2Locks[0]._id.toString()).toBe(lockId2.toString());
    });

    it("should fail safely if source room lock is missing or does not match dates", async () => {
      const connA = await getHotelConnection(hotelA);
      const Room = await getModel(connA, "Room");

      // Create room with booking
      const resR4 = await request(app)
        .post("/api/v1/hotel/rooms")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_number: `604_${crypto.randomBytes(2).toString("hex")}`,
          room_type_id: roomTypeA._id,
          floor: "6",
        });
      const room4 = resR4.body.data;

      const resR5 = await request(app)
        .post("/api/v1/hotel/rooms")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_number: `605_${crypto.randomBytes(2).toString("hex")}`,
          room_type_id: roomTypeA._id,
          floor: "6",
        });
      const room5 = resR5.body.data;

      const res = await request(app)
        .post("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          primary_guest_id: guestA._id,
          room_id: room4._id,
          room_type_id: roomTypeA._id,
          expected_check_in: "2027-12-20T14:00:00.000Z",
          expected_check_out: "2027-12-25T10:00:00.000Z",
          adults: 1,
        });
      const reservationId = res.body.data.reservation._id;

      // Corrupt/remove the lock on room4
      await Room.findByIdAndUpdate(room4._id, { $set: { active_bookings: [] } });

      // Attempt reassignment: must fail safely with 409 Conflict without modifying room5
      const failRes = await request(app)
        .post(`/api/v1/hotel/reservations/${reservationId}/reassign-room`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_id: room5._id,
        });

      expect(failRes.status).toBe(409);
      expect(failRes.body.error?.message || failRes.body.message).toMatch(/booking lock not found/i);

      // Verify room5 was not locked
      const checkRoom5 = await Room.findById(room5._id);
      expect(checkRoom5.active_bookings || []).toHaveLength(0);
    });
  });
});
