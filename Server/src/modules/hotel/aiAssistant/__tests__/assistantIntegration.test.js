import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../../../../app.js";
import { connectPlatformDB } from "../../../../database/platform/platformConnection.js";
import { getHotelConnection } from "../../../../database/connectionManager.js";
import Account from "../../../../database/platform/models/account.model.js";
import { ROLES } from "../../../../constants/roles.js";
import { getModel } from "../../../../database/hotel/modelFactory.js";
import crypto from "crypto";

const randomEmail = (prefix = "ai") =>
  `${prefix}_${crypto.randomBytes(4).toString("hex")}@hotel.com`;

const randomPhone = () =>
  `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe("AI Executive Assistant Backend Integration Suite", () => {
  let platformConnection;
  let tokenA;
  let tokenB;
  const hotelIdA = new mongoose.Types.ObjectId().toString();
  const hotelIdB = new mongoose.Types.ObjectId().toString();

  beforeAll(async () => {
    platformConnection = await connectPlatformDB();
    const connA = await getHotelConnection(hotelIdA);
    const connB = await getHotelConnection(hotelIdB);

    // Setup Hotel A Admin
    const emailA = randomEmail("ai_admin_a");
    const pass = "Password123!";
    await request(app).post("/api/v1/auth/register").send({
      fullName: "AI Admin A",
      email: emailA,
      phone: randomPhone(),
      password: pass,
    });
    await Account.findOneAndUpdate(
      { email: emailA },
      { role: ROLES.HOTEL_ADMIN, hotelId: hotelIdA }
    );
    const loginResA = await request(app).post("/api/v1/auth/login").send({
      email: emailA,
      password: pass,
    });
    tokenA = loginResA.body.data.accessToken;

    // Seed test data in Hotel A
    const RoomA = await getModel(connA, "Room");
    const dummyTypeId = new mongoose.Types.ObjectId();
    await RoomA.create([
      { room_number: "101", room_type_id: dummyTypeId, status: "Available", base_price: 12000 },
      { room_number: "102", room_type_id: dummyTypeId, status: "Occupied", base_price: 25000 },
      { room_number: "103", room_type_id: dummyTypeId, status: "Maintenance", base_price: 8000 },
    ]);

    const ReservationA = await getModel(connA, "Reservation");
    const dummyGuestId = new mongoose.Types.ObjectId();
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    await ReservationA.create([
      {
        booking_ref: "RES-AI-01",
        primary_guest_id: dummyGuestId,
        status: "CONFIRMED",
        expected_check_in: today,
        expected_check_out: tomorrow,
        adults: 2,
      },
      {
        booking_ref: "RES-AI-02",
        primary_guest_id: dummyGuestId,
        status: "IN_HOUSE",
        expected_check_in: today,
        expected_check_out: tomorrow,
        adults: 1,
      },
    ]);

    const InventoryA = await getModel(connA, "InventoryItem");
    await InventoryA.create([
      { sku: "SKU-TOWEL", name: "Bath Towels", category: "Linens", quantity: 2, minimum_stock: 10, unit: "pieces" },
      { sku: "SKU-COFFEE", name: "Coffee Pods", category: "F&B", quantity: 80, minimum_stock: 20, unit: "boxes" },
    ]);

    // Setup Hotel B Admin (for tenant isolation check)
    const emailB = randomEmail("ai_admin_b");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "AI Admin B",
      email: emailB,
      phone: randomPhone(),
      password: pass,
    });
    await Account.findOneAndUpdate(
      { email: emailB },
      { role: ROLES.HOTEL_ADMIN, hotelId: hotelIdB }
    );
    const loginResB = await request(app).post("/api/v1/auth/login").send({
      email: emailB,
      password: pass,
    });
    tokenB = loginResB.body.data.accessToken;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("1. Security & Authentication", () => {
    it("should reject unauthenticated chat requests with 401", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/assistant/chat")
        .send({ message: "How many rooms are available?" });
      expect(res.status).toBe(401);
    });

    it("should reject unauthenticated summary requests with 401", async () => {
      const res = await request(app).get("/api/v1/hotel/assistant/summary");
      expect(res.status).toBe(401);
    });
  });

  describe("2. Validation & Input Sanitation", () => {
    it("should return 400 when message is missing or empty", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/assistant/chat")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ message: "   " });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("3. Out-of-Domain Guardrails", () => {
    it("should politely decline out-of-domain questions in English", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/assistant/chat")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ message: "What do you think about Pakistan politics and cricket?" });

      expect(res.status).toBe(200);
      expect(res.body.data.domain).toBe("out_of_domain");
      expect(res.body.data.isLive).toBe(false);
      expect(res.body.data.reply).toContain("outside my operational domain");
    });

    it("should politely decline out-of-domain questions in Roman Urdu", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/assistant/chat")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ message: "Pakistan ke bare mein aap ka kya khayal hai?" });

      expect(res.status).toBe(200);
      expect(res.body.data.domain).toBe("out_of_domain");
      expect(res.body.data.reply).toContain("hotel operations ke domain se bahir");
    });
  });

  describe("4. Live Domain Intelligence Queries", () => {
    it("should answer room availability questions with exact live DB data", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/assistant/chat")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ message: "How many rooms are available right now?" });

      expect(res.status).toBe(200);
      expect(res.body.data.domain).toBe("rooms");
      expect(res.body.data.reply).toContain("Total Rooms: 3");
      expect(res.body.data.reply).toContain("Available: 1 rooms");
      expect(res.body.data.reply).toContain("Occupied / Booked: 1 rooms");
    });

    it("should answer room availability questions in Roman Urdu", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/assistant/chat")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ message: "Kitne kamray khali hain aur kitne booked hain?" });

      expect(res.status).toBe(200);
      expect(res.body.data.domain).toBe("rooms");
      expect(res.body.data.reply).toContain("Khali (Available): 1 rooms");
      expect(res.body.data.reply).toContain("Booked / Occupied: 1 rooms");
    });

    it("should answer specific room inquiry", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/assistant/chat")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ message: "What is the status of room 101?" });

      expect(res.status).toBe(200);
      expect(res.body.data.domain).toBe("rooms_specific");
      expect(res.body.data.reply).toContain("Room 101");
      expect(res.body.data.reply).toContain("Available");
    });

    it("should answer reservation queries with live booking numbers", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/assistant/chat")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ message: "How many bookings or reservations do we have?" });

      expect(res.status).toBe(200);
      expect(res.body.data.domain).toBe("reservations");
      expect(res.body.data.reply).toContain("Total System Reservations: 2");
    });

    it("should identify low stock inventory items", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/assistant/chat")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ message: "Show me inventory stock items" });

      expect(res.status).toBe(200);
      expect(res.body.data.domain).toBe("inventory");
      expect(res.body.data.reply).toContain("Bath Towels");
    });
  });

  describe("5. Executive Summary & Suggestions APIs", () => {
    it("should return executive summary KPIs", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/assistant/summary")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalRooms).toBe(3);
      expect(res.body.data.availableRooms).toBe(1);
      expect(res.body.data.activeReservations).toBe(2);
    });

    it("should return dynamic inquiry suggestions tailored to hotel state", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/assistant/suggestions")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("6. Strict Multi-Tenant Isolation", () => {
    it("should ensure Hotel B sees 0 rooms and 0 bookings", async () => {
      const resB = await request(app)
        .post("/api/v1/hotel/assistant/chat")
        .set("Authorization", `Bearer ${tokenB}`)
        .send({ message: "How many rooms are available?" });

      expect(resB.status).toBe(200);
      expect(resB.body.data.reply).toContain("Total Rooms: 0");
    });
  });

  describe("7. Typo-Tolerant Fuzzy Matching & Read-Only Invariants", () => {
    it("should accurately resolve misspelled query 'bring me the expensee reports'", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/assistant/chat")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ message: "bring me the expensee reports" });

      expect(res.status).toBe(200);
      expect(res.body.data.domain).toBe("financials");
      expect(res.body.data.isLive).toBe(true);
      expect(res.body.data.reply).toContain("Financial & Revenue");
    });

    it("should accurately resolve misspelled query 'show resevation stats'", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/assistant/chat")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ message: "show resevation stats" });

      expect(res.status).toBe(200);
      expect(res.body.data.domain).toBe("reservations");
      expect(res.body.data.isLive).toBe(true);
      expect(res.body.data.reply).toContain("Reservation & Guest Traffic");
    });

    it("should remain strictly read-only and not create any chat documents in tenant database", async () => {
      const connA = await getHotelConnection(hotelIdA);
      const collectionsBefore = await connA.db.listCollections().toArray();
      const collectionNamesBefore = collectionsBefore.map((c) => c.name);

      await request(app)
        .post("/api/v1/hotel/assistant/chat")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ message: "bring me the expensee reports" });

      const collectionsAfter = await connA.db.listCollections().toArray();
      const collectionNamesAfter = collectionsAfter.map((c) => c.name);

      // Verify no 'assistantchats', 'messages', or similar collections were introduced
      expect(collectionNamesAfter).toEqual(collectionNamesBefore);
      expect(collectionNamesAfter.includes("assistantchats")).toBe(false);
      expect(collectionNamesAfter.includes("messages")).toBe(false);
    });
  });
});
