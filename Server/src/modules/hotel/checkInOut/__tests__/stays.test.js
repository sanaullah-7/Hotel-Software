import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import crypto from "crypto";
import mongoose from "mongoose";
import app from "../../../../app.js";
import { connectPlatformDB, closePlatformDB } from "../../../../database/platform/platformConnection.js";
import { getHotelConnection, closeAllHotelConnections } from "../../../../database/connectionManager.js";
import { getModel } from "../../../../database/hotel/modelFactory.js";
import Account from "../../../../database/platform/models/account.model.js";
import { ROLES } from "../../../../constants/roles.js";

const randomEmail = (prefix = "sty") => `${prefix}_${crypto.randomBytes(4).toString("hex")}@hotel.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe("Phase 7: Stay Lifecycle (Check-in & Check-out)", () => {
  let adminTokenA, adminTokenB, userTokenA;
  let hotelA, hotelB;
  let guestA, guestB;
  let roomTypeA, roomA;
  let reservationA;

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
      property_name: "Stay Resort A", address: "500 Palm Grove", city: "Lahore"
    });
    hotelA = onboardA.body.data.hotelId;

    const reloginA = await request(app).post("/api/v1/auth/login").send({ email: emailA, password: "Password123!" });
    adminTokenA = reloginA.body.data.accessToken;

    // Staff user in Hotel A (role: HOTEL_USER)
    const emailStaffA = randomEmail("staffA");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Staff A", email: emailStaffA, phone: randomPhone(), password: "Password123!"
    });
    await Account.findOneAndUpdate({ email: emailStaffA }, { hotelId: hotelA, role: ROLES.HOTEL_USER });
    const loginStaffA = await request(app).post("/api/v1/auth/login").send({ email: emailStaffA, password: "Password123!" });
    userTokenA = loginStaffA.body.data.accessToken;

    // Guest A
    const resGuestA = await request(app).post("/api/v1/hotel/guests").set("Authorization", `Bearer ${adminTokenA}`).send({
      first_name: "StayGuest", last_name: "Alpha", email: randomEmail("guestA"), phone: randomPhone()
    });
    guestA = resGuestA.body.data;

    // RoomType A
    const resRtA = await request(app).post("/api/v1/hotel/room-types").set("Authorization", `Bearer ${adminTokenA}`).send({
      name: "Presidential Suite", code: `PRES_${crypto.randomBytes(2).toString("hex")}`.toUpperCase(), base_occupancy: 2, max_occupancy: 4, base_price: 300
    });
    roomTypeA = resRtA.body.data;

    // Room A
    const resRoomA = await request(app).post("/api/v1/hotel/rooms").set("Authorization", `Bearer ${adminTokenA}`).send({
      room_number: `301_${crypto.randomBytes(2).toString("hex")}`, room_type_id: roomTypeA._id, floor: "3"
    });
    roomA = resRoomA.body.data;

    // Reservation A
    const resBookingA = await request(app).post("/api/v1/hotel/reservations").set("Authorization", `Bearer ${adminTokenA}`).send({
      primary_guest_id: guestA._id,
      room_type_id: roomTypeA._id,
      room_id: roomA._id,
      expected_check_in: "2026-10-03T14:00:00.000Z",
      expected_check_out: "2026-10-07T10:00:00.000Z",
      adults: 2,
    });
    reservationA = resBookingA.body.data.reservation;

    // 2. Setup Hotel B
    const emailB = randomEmail("adminB");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Admin Hotel B", email: emailB, phone: randomPhone(), password: "Password123!"
    });
    const loginB = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "Password123!" });
    const tempTokenB = loginB.body.data.accessToken;

    const onboardB = await request(app).post("/api/v1/provisioning/onboard").set("Authorization", `Bearer ${tempTokenB}`).send({
      property_name: "Stay Resort B", address: "600 Ocean Drive", city: "Karachi"
    });
    hotelB = onboardB.body.data.hotelId;

    const reloginB = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "Password123!" });
    adminTokenB = reloginB.body.data.accessToken;
  });

  afterAll(async () => {
    await closeAllHotelConnections();
    await closePlatformDB();
  });

  describe("Check-In Workflow & Room Status Updates", () => {
    let stayId;

    it("should check in guest for reservation and update room status to OCCUPIED", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/stays/check-in")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          reservation_id: reservationA._id,
          room_id: roomA._id,
          total_guests: 2,
          notes: "Guest requested extra towels",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stay.status).toBe("CHECKED_IN");
      expect(res.body.data.room.status).toBe("OCCUPIED");
      expect(res.body.data.reservation.status).toBe("IN_HOUSE");

      stayId = res.body.data.stay._id;
    });

    it("should reject duplicate check-in for the same reservation", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/stays/check-in")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          reservation_id: reservationA._id,
          room_id: roomA._id,
        });

      expect(res.status).toBe(409);
      expect(res.body.error.message).toMatch(/already checked in/i);
    });

    it("should list active stays for Hotel A", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/stays")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it("should retrieve stay details by ID", async () => {
      const res = await request(app)
        .get(`/api/v1/hotel/stays/${stayId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(stayId);
      expect(res.body.data.rooms.length).toBe(1);
    });

    it("should reject check-out attempt from Hotel B on Hotel A stay (Cross-Tenant Security)", async () => {
      const res = await request(app)
        .post(`/api/v1/hotel/stays/${stayId}/check-out`)
        .set("Authorization", `Bearer ${adminTokenB}`)
        .send({ notes: "Malicious check-out attempt" });

      expect(res.status).toBe(404);
    });

    it("should check out guest and update room status to AVAILABLE and housekeeping_status to DIRTY", async () => {
      const res = await request(app)
        .post(`/api/v1/hotel/stays/${stayId}/check-out`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ notes: "Smooth check-out, settled charges" });

      expect(res.status).toBe(200);
      expect(res.body.data.stay.status).toBe("CHECKED_OUT");
      expect(res.body.data.reservation.status).toBe("CHECKED_OUT");

      // Verify room status in DB
      const Room = await getModel(hotelA, "Room");
      const roomInDb = await Room.findById(roomA._id);
      expect(roomInDb.status).toBe("AVAILABLE");
      expect(roomInDb.housekeeping_status).toBe("DIRTY");
    });

    it("should reject check-in when room is DIRTY without manager override (Cleanliness Gate)", async () => {
      // Create a second reservation for room A (which is now DIRTY)
      const resBooking2 = await request(app)
        .post("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          primary_guest_id: guestA._id,
          room_type_id: roomTypeA._id,
          room_id: roomA._id,
          expected_check_in: "2026-10-10T14:00:00.000Z",
          expected_check_out: "2026-10-12T10:00:00.000Z",
          adults: 1,
        });
      expect(resBooking2.status).toBe(201);
      const res2 = resBooking2.body.data.reservation;

      // Attempt check-in without override
      const checkInFail = await request(app)
        .post("/api/v1/hotel/stays/check-in")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          reservation_id: res2._id,
          room_id: roomA._id,
          total_guests: 1,
        });

      expect(checkInFail.status).toBe(409);
      expect(checkInFail.body.error.message).toMatch(/currently DIRTY and cannot be assigned without manager override/i);

      // Attempt check-in with manager_override: true using unauthorized cashier (HOTEL_USER)
      const checkInUnauthorized = await request(app)
        .post("/api/v1/hotel/stays/check-in")
        .set("Authorization", `Bearer ${userTokenA}`)
        .send({
          reservation_id: res2._id,
          room_id: roomA._id,
          total_guests: 1,
          manager_override: true,
        });

      expect(checkInUnauthorized.status).toBe(403);
      expect(checkInUnauthorized.body.error.message).toMatch(/requires manager authorization/i);

      // Now check-in with manager_override: true using authorized manager (HOTEL_ADMIN)
      const checkInOverride = await request(app)
        .post("/api/v1/hotel/stays/check-in")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          reservation_id: res2._id,
          room_id: roomA._id,
          total_guests: 1,
          manager_override: true,
          notes: "Manager approved check-in while quick touch-up completes",
        });

      expect(checkInOverride.status).toBe(201);
      expect(checkInOverride.body.success).toBe(true);
      expect(checkInOverride.body.data.stay.status).toBe("CHECKED_IN");
      expect(checkInOverride.body.data.room.status).toBe("OCCUPIED");
    });
  });

  describe("Phase 3 Step 4: Active-Stay Room Transfer", () => {
    let transferRoomB;
    let transferStayId;
    let transferResId;

    beforeAll(async () => {
      // Create room B in hotel A
      const resRoomB = await request(app)
        .post("/api/v1/hotel/rooms")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_number: `501_${crypto.randomBytes(2).toString("hex")}`,
          room_type_id: roomTypeA._id,
          floor: "5",
        });
      transferRoomB = resRoomB.body.data;

      // Clean roomA first and vacate any leftover StayRooms from earlier tests
      const connA = await getHotelConnection(hotelA);
      const Room = await getModel(connA, "Room");
      const StayRoom = await getModel(connA, "StayRoom");
      await StayRoom.updateMany({ room_id: roomA._id, status: "OCCUPIED" }, { status: "VACATED" });
      await Room.findByIdAndUpdate(roomA._id, { status: "AVAILABLE", housekeeping_status: "CLEAN" });

      // Create reservation and check-in
      const resBooking = await request(app)
        .post("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          primary_guest_id: guestA._id,
          room_type_id: roomTypeA._id,
          room_id: roomA._id,
          expected_check_in: "2027-01-10T14:00:00.000Z",
          expected_check_out: "2027-01-15T10:00:00.000Z",
          adults: 1,
        });
      transferResId = resBooking.body.data.reservation._id;

      const checkInRes = await request(app)
        .post("/api/v1/hotel/stays/check-in")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          reservation_id: transferResId,
          room_id: roomA._id,
        });
      transferStayId = checkInRes.body.data.stay._id;
    });

    it("should successfully transfer an active stay to an eligible room, updating StayRoom, locks, and room statuses", async () => {
      const connA = await getHotelConnection(hotelA);
      const Room = await getModel(connA, "Room");
      const StayRoom = await getModel(connA, "StayRoom");
      const Stay = await getModel(connA, "Stay");
      const ReservationRoom = await getModel(connA, "ReservationRoom");

      const transferRes = await request(app)
        .post(`/api/v1/hotel/stays/${transferStayId}/transfer-room`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_id: transferRoomB._id,
          reason: "Guest requested high floor with mountain view",
        });

      expect(transferRes.status).toBe(200);
      expect(transferRes.body.success).toBe(true);

      // 1. Destination room is now OCCUPIED
      const updatedDestRoom = await Room.findById(transferRoomB._id);
      expect(updatedDestRoom.status).toBe("OCCUPIED");

      // 2. Destination room has active booking lock
      const destLock = (updatedDestRoom.active_bookings || []).find(
        (b) => b.reservation_id && b.reservation_id.toString() === transferResId.toString()
      );
      expect(destLock).toBeDefined();

      // 3. Source room is now AVAILABLE and DIRTY for housekeeping
      const updatedSourceRoom = await Room.findById(roomA._id);
      expect(updatedSourceRoom.status).toBe("AVAILABLE");
      expect(updatedSourceRoom.housekeeping_status).toBe("DIRTY");

      // 4. Source room lock has been released
      const sourceLock = (updatedSourceRoom.active_bookings || []).find(
        (b) => b.reservation_id && b.reservation_id.toString() === transferResId.toString()
      );
      expect(sourceLock).toBeUndefined();

      // 5. Old StayRoom is VACATED
      const oldStayRoom = await StayRoom.findOne({
        stay_id: transferStayId,
        room_id: roomA._id,
      });
      expect(oldStayRoom.status).toBe("VACATED");
      expect(oldStayRoom.check_out_time).toBeDefined();

      // 6. New StayRoom is OCCUPIED
      const newStayRoom = await StayRoom.findOne({
        stay_id: transferStayId,
        room_id: transferRoomB._id,
      });
      expect(newStayRoom.status).toBe("OCCUPIED");

      // 7. ReservationRoom is synchronized with new room
      const resRoom = await ReservationRoom.findOne({ reservation_id: transferResId });
      expect(resRoom.room_id.toString()).toBe(transferRoomB._id.toString());

      // 8. Stay notes record the transfer event
      const updatedStay = await Stay.findById(transferStayId);
      expect(updatedStay.notes).toContain("Transferred");
    });

    it("should reject transfer if destination room is already OCCUPIED", async () => {
      // Create room C and mark it OCCUPIED
      const resRoomC = await request(app)
        .post("/api/v1/hotel/rooms")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_number: `502_${crypto.randomBytes(2).toString("hex")}`,
          room_type_id: roomTypeA._id,
          floor: "5",
        });
      const roomC = resRoomC.body.data;
      const connA = await getHotelConnection(hotelA);
      const Room = await getModel(connA, "Room");
      await Room.findByIdAndUpdate(roomC._id, { status: "OCCUPIED" });

      // Attempt transfer into occupied room C
      const conflictRes = await request(app)
        .post(`/api/v1/hotel/stays/${transferStayId}/transfer-room`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_id: roomC._id,
        });

      expect(conflictRes.status).toBe(409);
      expect(conflictRes.body.error?.message || conflictRes.body.message).toMatch(/currently OCCUPIED/i);

      // Attempt transfer into current room (same room)
      const sameRoomRes = await request(app)
        .post(`/api/v1/hotel/stays/${transferStayId}/transfer-room`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_id: transferRoomB._id,
        });

      expect(sameRoomRes.status).toBe(400);
      expect(sameRoomRes.body.error?.message || sameRoomRes.body.message).toMatch(/cannot be the same/i);
    });

    it("should reject transfer if destination room is DIRTY without manager override", async () => {
      // roomA is currently DIRTY from previous transfer
      const dirtyRes = await request(app)
        .post(`/api/v1/hotel/stays/${transferStayId}/transfer-room`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_id: roomA._id,
        });

      expect(dirtyRes.status).toBe(409);
      expect(dirtyRes.body.error?.message || dirtyRes.body.message).toMatch(/currently DIRTY.*manager override/i);
    });

    it("should reject transfer if stay is already CHECKED_OUT", async () => {
      // Check out the stay
      await request(app)
        .post(`/api/v1/hotel/stays/${transferStayId}/check-out`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ notes: "Guest check out" });

      // Attempt room transfer on checked out stay
      const transferAttempt = await request(app)
        .post(`/api/v1/hotel/stays/${transferStayId}/transfer-room`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_id: roomA._id,
          manager_override: true,
        });

      expect(transferAttempt.status).toBe(400);
      expect(transferAttempt.body.error?.message || transferAttempt.body.message).toMatch(/checked-in stays can be transferred/i);
    });

    it("should safely transfer one room of a multi-room stay while preserving unrelated locks sharing the same reservation ID", async () => {
      const connA = await getHotelConnection(hotelA);
      const Room = await getModel(connA, "Room");
      const Stay = await getModel(connA, "Stay");
      const StayRoom = await getModel(connA, "StayRoom");
      const ReservationRoom = await getModel(connA, "ReservationRoom");

      // Create two rooms for multi-room stay plus a third room for transfer destination
      const resR1 = await request(app)
        .post("/api/v1/hotel/rooms")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_number: `701_${crypto.randomBytes(2).toString("hex")}`,
          room_type_id: roomTypeA._id,
          floor: "7",
        });
      const room1 = resR1.body.data;

      const resR2 = await request(app)
        .post("/api/v1/hotel/rooms")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_number: `702_${crypto.randomBytes(2).toString("hex")}`,
          room_type_id: roomTypeA._id,
          floor: "7",
        });
      const room2 = resR2.body.data;

      const resR3 = await request(app)
        .post("/api/v1/hotel/rooms")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_number: `703_${crypto.randomBytes(2).toString("hex")}`,
          room_type_id: roomTypeA._id,
          floor: "7",
        });
      const room3 = resR3.body.data;

      // Create reservation initially assigned to room1
      const resRes = await request(app)
        .post("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          primary_guest_id: guestA._id,
          room_id: room1._id,
          room_type_id: roomTypeA._id,
          expected_check_in: new Date(Date.now() - 3600000).toISOString(),
          expected_check_out: new Date(Date.now() + 86400000 * 3).toISOString(),
          adults: 2,
        });
      const reservationId = resRes.body.data.reservation._id;

      // Check in to create active stay in room1
      const checkInRes = await request(app)
        .post("/api/v1/hotel/stays/check-in")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          reservation_id: reservationId,
          primary_guest_id: guestA._id,
          room_id: room1._id,
        });
      const multiStayId = checkInRes.body.data.stay._id;

      // Add second room (room2) to this stay & reservation
      await ReservationRoom.create({
        reservation_id: reservationId,
        room_id: room2._id,
        room_type_id: roomTypeA._id,
        rate_plan_id: roomTypeA._id,
        adults: 1,
      });

      const lockId2 = new mongoose.Types.ObjectId();
      await Room.findByIdAndUpdate(room2._id, {
        $push: {
          active_bookings: {
            _id: lockId2,
            reservation_id: reservationId,
            check_in: new Date(Date.now() - 3600000),
            check_out: new Date(Date.now() + 86400000 * 3),
          },
        },
      });

      // Transfer room1 to room3
      const transferRes = await request(app)
        .post(`/api/v1/hotel/stays/${multiStayId}/transfer-room`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          new_room_id: room3._id,
          source_room_id: room1._id,
          reason: "Transfer room1 to room3",
        });

      expect(transferRes.status).toBe(200);

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

    it("should preserve source room OUT_OF_ORDER status during transfer", async () => {
      const connA = await getHotelConnection(hotelA);
      const Room = await getModel(connA, "Room");

      // Create room4 and room5
      const resR4 = await request(app)
        .post("/api/v1/hotel/rooms")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_number: `704_${crypto.randomBytes(2).toString("hex")}`,
          room_type_id: roomTypeA._id,
          floor: "7",
        });
      const room4 = resR4.body.data;

      const resR5 = await request(app)
        .post("/api/v1/hotel/rooms")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_number: `705_${crypto.randomBytes(2).toString("hex")}`,
          room_type_id: roomTypeA._id,
          floor: "7",
        });
      const room5 = resR5.body.data;

      // Create reservation and check in
      const resRes = await request(app)
        .post("/api/v1/hotel/reservations")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          primary_guest_id: guestA._id,
          room_id: room4._id,
          room_type_id: roomTypeA._id,
          expected_check_in: new Date(Date.now() - 3600000).toISOString(),
          expected_check_out: new Date(Date.now() + 86400000 * 3).toISOString(),
          adults: 1,
        });
      const reservationId = resRes.body.data.reservation._id;

      const checkInRes = await request(app)
        .post("/api/v1/hotel/stays/check-in")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          reservation_id: reservationId,
          primary_guest_id: guestA._id,
          room_id: room4._id,
        });
      const oooStayId = checkInRes.body.data.stay._id;

      // Room 4 has maintenance emergency: marked OUT_OF_ORDER while guest is inside
      await Room.findByIdAndUpdate(room4._id, { status: "OUT_OF_ORDER" });

      // Transfer guest to room5
      const transferRes = await request(app)
        .post(`/api/v1/hotel/stays/${oooStayId}/transfer-room`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          new_room_id: room5._id,
          reason: "Emergency: Room 4 pipe burst, transfer to Room 5",
        });

      expect(transferRes.status).toBe(200);

      // Verify room4 preserves OUT_OF_ORDER (not overwritten to AVAILABLE), and is DIRTY
      const updatedRoom4 = await Room.findById(room4._id);
      expect(updatedRoom4.status).toBe("OUT_OF_ORDER");
      expect(updatedRoom4.housekeeping_status).toBe("DIRTY");
    });
  });
});

