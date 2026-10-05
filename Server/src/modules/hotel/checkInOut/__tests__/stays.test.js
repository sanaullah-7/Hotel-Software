import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import crypto from "crypto";
import app from "../../../../app.js";
import { connectPlatformDB, closePlatformDB } from "../../../../database/platform/platformConnection.js";
import { closeAllHotelConnections } from "../../../../database/connectionManager.js";
import { getModel } from "../../../../database/hotel/modelFactory.js";

const randomEmail = (prefix = "sty") => `${prefix}_${crypto.randomBytes(4).toString("hex")}@hotel.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe("Phase 7: Stay Lifecycle (Check-in & Check-out)", () => {
  let adminTokenA, adminTokenB;
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
  });
});
