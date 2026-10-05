import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import crypto from "crypto";
import app from "../../../../app.js";
import { connectPlatformDB, closePlatformDB } from "../../../../database/platform/platformConnection.js";
import { closeAllHotelConnections } from "../../../../database/connectionManager.js";
import { getModel } from "../../../../database/hotel/modelFactory.js";

const randomEmail = (prefix = "ops") => `${prefix}_${crypto.randomBytes(4).toString("hex")}@hotel.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe("Phase 9: Operations (Housekeeping & Maintenance)", () => {
  let adminTokenA, adminTokenB;
  let hotelA, hotelB;
  let roomTypeA, roomA;

  beforeAll(async () => {
    await connectPlatformDB();

    // Setup Hotel A
    const emailA = randomEmail("adminA");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Ops Admin A", email: emailA, phone: randomPhone(), password: "Password123!"
    });
    const loginA = await request(app).post("/api/v1/auth/login").send({ email: emailA, password: "Password123!" });
    const tempTokenA = loginA.body.data.accessToken;

    const onboardA = await request(app).post("/api/v1/provisioning/onboard").set("Authorization", `Bearer ${tempTokenA}`).send({
      property_name: "Operations Hotel A", address: "900 Service Blvd", city: "Lahore"
    });
    hotelA = onboardA.body.data.hotelId;

    const reloginA = await request(app).post("/api/v1/auth/login").send({ email: emailA, password: "Password123!" });
    adminTokenA = reloginA.body.data.accessToken;

    // RoomType & Room in Hotel A
    const resRtA = await request(app).post("/api/v1/hotel/room-types").set("Authorization", `Bearer ${adminTokenA}`).send({
      name: "Executive Room", code: `EXEC_${crypto.randomBytes(2).toString("hex")}`.toUpperCase(), base_occupancy: 2, max_occupancy: 3, base_price: 180
    });
    roomTypeA = resRtA.body.data;

    const resRoomA = await request(app).post("/api/v1/hotel/rooms").set("Authorization", `Bearer ${adminTokenA}`).send({
      room_number: `401_${crypto.randomBytes(2).toString("hex")}`, room_type_id: roomTypeA._id, floor: "4", housekeeping_status: "DIRTY"
    });
    roomA = resRoomA.body.data;

    // Setup Hotel B
    const emailB = randomEmail("adminB");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Ops Admin B", email: emailB, phone: randomPhone(), password: "Password123!"
    });
    const loginB = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "Password123!" });
    const tempTokenB = loginB.body.data.accessToken;

    const onboardB = await request(app).post("/api/v1/provisioning/onboard").set("Authorization", `Bearer ${tempTokenB}`).send({
      property_name: "Operations Hotel B", address: "950 Utility St", city: "Karachi"
    });
    hotelB = onboardB.body.data.hotelId;

    const reloginB = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "Password123!" });
    adminTokenB = reloginB.body.data.accessToken;
  });

  afterAll(async () => {
    await closeAllHotelConnections();
    await closePlatformDB();
  });

  describe("Housekeeping Task Workflow", () => {
    let taskId;

    it("should create housekeeping task for a dirty room", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/housekeeping/tasks")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          room_id: roomA._id,
          task_type: "CLEANING",
          priority: "HIGH",
          notes: "Deep clean needed",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("PENDING");

      taskId = res.body.data._id;
    });

    it("should update housekeeping task to COMPLETED and mark room housekeeping_status as CLEAN", async () => {
      const res = await request(app)
        .put(`/api/v1/hotel/housekeeping/tasks/${taskId}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          status: "COMPLETED",
          notes: "Room cleaned and sanitized",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("COMPLETED");

      // Verify room housekeeping_status in DB
      const Room = await getModel(hotelA, "Room");
      const roomInDb = await Room.findById(roomA._id);
      expect(roomInDb.housekeeping_status).toBe("CLEAN");
    });
  });

  describe("Maintenance Ticket Workflow", () => {
    let ticketId;

    it("should create critical maintenance ticket and set room status to MAINTENANCE", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/maintenance/tickets")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          title: "AC Leaking Water",
          description: "Air conditioner unit leaking water near window",
          room_id: roomA._id,
          priority: "CRITICAL",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.ticket_ref).toMatch(/^TICK-/);

      ticketId = res.body.data._id;

      // Verify room status updated to MAINTENANCE
      const Room = await getModel(hotelA, "Room");
      const roomInDb = await Room.findById(roomA._id);
      expect(roomInDb.status).toBe("MAINTENANCE");
    });

    it("should resolve maintenance ticket and restore room status to AVAILABLE", async () => {
      const res = await request(app)
        .put(`/api/v1/hotel/maintenance/tickets/${ticketId}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          status: "RESOLVED",
          resolution_notes: "Replaced drain hose and re-tested unit",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("RESOLVED");

      // Verify room status restored to AVAILABLE
      const Room = await getModel(hotelA, "Room");
      const roomInDb = await Room.findById(roomA._id);
      expect(roomInDb.status).toBe("AVAILABLE");
    });
  });
});
