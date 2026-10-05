import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import crypto from "crypto";
import app from "../../../../app.js";
import { connectPlatformDB, closePlatformDB } from "../../../../database/platform/platformConnection.js";
import { closeAllHotelConnections } from "../../../../database/connectionManager.js";
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
});
