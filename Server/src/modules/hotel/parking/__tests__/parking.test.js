import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../../../app.js";
import { connectPlatformDB } from "../../../../database/platform/platformConnection.js";
import { closeAllHotelConnections } from "../../../../database/connectionManager.js";
import { ROLES } from "../../../../constants/roles.js";
import crypto from "crypto";

const randomEmail = (prefix = "prk") =>
  `${prefix}_${crypto.randomBytes(4).toString("hex")}@hotel.com`;
const randomPhone = () =>
  `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe("Hotel Parking Module Backend Integration", () => {
  let adminToken, hotelId;

  beforeAll(async () => {
    await connectPlatformDB();

    const email = randomEmail("admin");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Parking Admin",
      email,
      phone: randomPhone(),
      password: "password123",
      role: ROLES.HOTEL_USER,
    });

    const login = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, password: "password123" });
    const tempToken = login.body.data.accessToken;

    const onboard = await request(app)
      .post("/api/v1/provisioning/onboard")
      .set("Authorization", `Bearer ${tempToken}`)
      .send({
        property_name: "Grand Parking Hotel",
        address: "123 Valet Way",
        city: "Islamabad",
      });
    hotelId = onboard.body.data.hotelId;

    const loginAgain = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, password: "password123" });
    adminToken = loginAgain.body.data.accessToken;
  });

  afterAll(async () => {
    await closeAllHotelConnections();
  });

  describe("Parking Spaces Management", () => {
    it("should start with empty parking spaces for a fresh hotel", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/parking/spaces")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(0);
    });

    it("should create a new custom parking space", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/parking/spaces")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          space_number: "VIP-01",
          location: "Front Porch",
          status: "AVAILABLE",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.space_number).toBe("VIP-01");
      expect(res.body.data.location).toBe("Front Porch");
    });

    it("should prevent duplicate parking space creation", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/parking/spaces")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          space_number: "VIP-01",
        });

      expect(res.status).toBe(409);
    });

    it("should toggle parking space status (BLOCKED / AVAILABLE)", async () => {
      const res = await request(app)
        .patch("/api/v1/hotel/parking/spaces/VIP-01/status")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "BLOCKED" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("BLOCKED");

      // Unblock it
      const unblockRes = await request(app)
        .patch("/api/v1/hotel/parking/spaces/VIP-01/status")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "AVAILABLE" });

      expect(unblockRes.status).toBe(200);
      expect(unblockRes.body.data.status).toBe("AVAILABLE");
    });
  });

  describe("Parking Records & Operational Flow", () => {
    let createdRecordId;

    it("should park a car and mark the space OCCUPIED", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/parking/records")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          carNumber: "ICT-9988",
          guestName: "Hamza Tariq",
          roomNumber: "302",
          parkingSpace: "VIP-01",
          carType: "SUV",
          chargeType: "Daily",
          chargeAmount: 500,
          paymentStatus: "Paid",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.vehicle_plate).toBe("ICT-9988");
      expect(res.body.data.guest_name).toBe("Hamza Tariq");
      expect(res.body.data.status).toBe("PARKED");
      expect(res.body.data.charge_amount).toBe(500);
      createdRecordId = res.body.data._id;

      // Verify space is now OCCUPIED
      const spacesRes = await request(app)
        .get("/api/v1/hotel/parking/spaces")
        .set("Authorization", `Bearer ${adminToken}`);
      const vipSpace = spacesRes.body.data.find((s) => s.space_number === "VIP-01");
      expect(vipSpace.status).toBe("OCCUPIED");
    });

    it("should prevent assigning an already occupied space", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/parking/records")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          carNumber: "LE-1234",
          guestName: "Another Guest",
          parkingSpace: "VIP-01",
        });

      expect(res.status).toBe(400);
      expect(res.body.error?.message || res.body.message).toContain("OCCUPIED");
    });

    it("should prevent blocking or deleting an occupied space", async () => {
      const blockRes = await request(app)
        .patch("/api/v1/hotel/parking/spaces/VIP-01/status")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "BLOCKED" });

      expect(blockRes.status).toBe(400);

      const deleteRes = await request(app)
        .delete("/api/v1/hotel/parking/spaces/VIP-01")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(400);
    });

    it("should retrieve metrics with accurate parked count and charges", async () => {
      const res = await request(app)
        .get("/api/v1/hotel/parking/metrics")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalSpaces).toBeGreaterThanOrEqual(1);
      expect(res.body.data.parkedCars).toBeGreaterThanOrEqual(1);
      expect(res.body.data.todaysCharges).toBeGreaterThanOrEqual(500);
    });

    it("should list records and support filtering/search", async () => {
      const searchRes = await request(app)
        .get("/api/v1/hotel/parking/records?search=Hamza")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(searchRes.status).toBe(200);
      expect(searchRes.body.data.length).toBe(1);
      expect(searchRes.body.data[0].guest_name).toBe("Hamza Tariq");
    });

    it("should update a parking record (e.g. change vehicle plate or payment)", async () => {
      const res = await request(app)
        .patch(`/api/v1/hotel/parking/records/${createdRecordId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          vehicle_model: "Toyota Fortuner",
          paymentStatus: "Paid",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.vehicle_model).toBe("Toyota Fortuner");
    });

    it("should checkout a car and release the parking space to AVAILABLE", async () => {
      const res = await request(app)
        .post(`/api/v1/hotel/parking/records/${createdRecordId}/checkout`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("EXITED");
      expect(res.body.data.exit_time).toBeTruthy();

      // Check space is back to AVAILABLE
      const spacesRes = await request(app)
        .get("/api/v1/hotel/parking/spaces")
        .set("Authorization", `Bearer ${adminToken}`);
      const vipSpace = spacesRes.body.data.find((s) => s.space_number === "VIP-01");
      expect(vipSpace.status).toBe("AVAILABLE");
    });

    it("should delete parking space once released", async () => {
      const deleteRes = await request(app)
        .delete("/api/v1/hotel/parking/spaces/VIP-01")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(200);
    });
  });
});
