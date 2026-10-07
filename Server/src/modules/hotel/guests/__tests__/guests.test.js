import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import crypto from "crypto";
import app from "../../../../app.js";
import { connectPlatformDB, closePlatformDB } from "../../../../database/platform/platformConnection.js";
import { getHotelConnection, closeAllHotelConnections } from "../../../../database/connectionManager.js";
import { getModel } from "../../../../database/hotel/modelFactory.js";
import { ROLES } from "../../../../constants/roles.js";
import Account from "../../../../database/platform/models/account.model.js";

const randomEmail = (prefix = "gst") => `${prefix}_${crypto.randomBytes(4).toString("hex")}@hotel.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe("Phase 5: Guest Management & Tenant Isolation", () => {
  let adminTokenA, adminTokenB, userTokenA;
  let hotelA, hotelB;
  let accountA, accountB, userAccountA;

  beforeAll(async () => {
    await connectPlatformDB();

    // Hotel A Admin Setup
    const emailA = randomEmail("adminA");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Admin A", email: emailA, phone: randomPhone(), password: "Password123!"
    });
    const loginA = await request(app).post("/api/v1/auth/login").send({ email: emailA, password: "Password123!" });
    const tempTokenA = loginA.body.data.accessToken;

    const onboardA = await request(app).post("/api/v1/provisioning/onboard").set("Authorization", `Bearer ${tempTokenA}`).send({
      property_name: "Grand Hotel A", address: "123 Main St", city: "Lahore"
    });
    hotelA = onboardA.body.data.hotelId;

    const reloginA = await request(app).post("/api/v1/auth/login").send({ email: emailA, password: "Password123!" });
    adminTokenA = reloginA.body.data.accessToken;
    accountA = reloginA.body.data.account;

    // Hotel A User Setup (Standard HOTEL_USER role)
    const emailUserA = randomEmail("userA");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "User A", email: emailUserA, phone: randomPhone(), password: "Password123!"
    });
    userAccountA = await Account.findOne({ email: emailUserA });
    userAccountA.hotelId = hotelA;
    userAccountA.role = ROLES.HOTEL_USER;
    await userAccountA.save();

    const loginUserA = await request(app).post("/api/v1/auth/login").send({ email: emailUserA, password: "Password123!" });
    userTokenA = loginUserA.body.data.accessToken;

    // Hotel B Admin Setup
    const emailB = randomEmail("adminB");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Admin B", email: emailB, phone: randomPhone(), password: "Password123!"
    });
    const loginB = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "Password123!" });
    const tempTokenB = loginB.body.data.accessToken;

    const onboardB = await request(app).post("/api/v1/provisioning/onboard").set("Authorization", `Bearer ${tempTokenB}`).send({
      property_name: "Grand Hotel B", address: "456 Park Ave", city: "Karachi"
    });
    hotelB = onboardB.body.data.hotelId;

    const reloginB = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "Password123!" });
    adminTokenB = reloginB.body.data.accessToken;
    accountB = reloginB.body.data.account;
  });

  afterAll(async () => {
    await closeAllHotelConnections();
    await closePlatformDB();
  });

  describe("Authentication & RBAC Enforcement", () => {
    it("should reject unauthenticated access to guest endpoints", async () => {
      const res = await request(app).get("/api/v1/hotel/guests");
      expect(res.status).toBe(401);
    });

    it("should allow HOTEL_USER to create and view guests but forbid guest deletion", async () => {
      // Create guest as HOTEL_USER
      const createRes = await request(app)
        .post("/api/v1/hotel/guests")
        .set("Authorization", `Bearer ${userTokenA}`)
        .send({
          first_name: "UserCreated",
          last_name: "Guest",
          email: randomEmail("user_guest"),
          phone: randomPhone()
        });
      expect(createRes.status).toBe(201);
      const guestId = createRes.body.data._id;

      // View guest as HOTEL_USER
      const viewRes = await request(app)
        .get(`/api/v1/hotel/guests/${guestId}`)
        .set("Authorization", `Bearer ${userTokenA}`);
      expect(viewRes.status).toBe(200);

      // Attempt delete guest as HOTEL_USER -> 403 Forbidden
      const deleteRes = await request(app)
        .delete(`/api/v1/hotel/guests/${guestId}`)
        .set("Authorization", `Bearer ${userTokenA}`);
      expect(deleteRes.status).toBe(403);
    });
  });

  describe("Guest Creation & Validation", () => {
    it("should create a new guest successfully with complete payload", async () => {
      const passportNo = `PASS_${crypto.randomBytes(3).toString("hex")}`.toUpperCase();
      const res = await request(app)
        .post("/api/v1/hotel/guests")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          first_name: "Ali",
          last_name: "Khan",
          email: "ali.khan@example.com",
          phone: "03001234567",
          passport_number: passportNo,
          address: "Street 10",
          city: "Lahore",
          country: "Pakistan",
          nationality: "Pakistani",
          vip_status: true,
          notes: "VIP Guest"
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.first_name).toBe("Ali");
      expect(res.body.data.passport_number).toBe(passportNo);
      expect(res.body.data.guest_ref).toBeDefined();
    });

    it("should reject creation with missing required fields", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/guests")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          first_name: "OnlyFirstName"
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject creation with malformed email", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/guests")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          first_name: "Invalid",
          last_name: "Email",
          email: "not-an-email"
        });

      expect(res.status).toBe(400);
    });
  });

  describe("Database Indexes & Concurrent Identity Uniqueness", () => {
    it("should verify MongoDB tenant indexes exist for Guest collection", async () => {
      const GuestModel = await getModel(hotelA, "Guest");
      await GuestModel.createIndexes();
      const indexes = await GuestModel.collection.getIndexes();

      expect(indexes).toHaveProperty("hotelId_1_passport_number_1");
      expect(indexes).toHaveProperty("hotelId_1_national_id_1");
      expect(indexes).toHaveProperty("hotelId_1_guest_ref_1");
    });

    it("should reject duplicate passport number in the same hotel tenant", async () => {
      const passportNo = `DUP_PASS_${crypto.randomBytes(3).toString("hex")}`.toUpperCase();

      const res1 = await request(app)
        .post("/api/v1/hotel/guests")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          first_name: "First",
          last_name: "Guest",
          passport_number: passportNo
        });
      expect(res1.status).toBe(201);

      const res2 = await request(app)
        .post("/api/v1/hotel/guests")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          first_name: "Second",
          last_name: "Guest",
          passport_number: passportNo
        });

      expect(res2.status).toBe(409);
      expect(res2.body.error.message).toMatch(/passport number already exists/i);
    });

    it("should allow the SAME passport number in different hotels (per-tenant uniqueness)", async () => {
      const passportNo = `MULTI_PASS_${crypto.randomBytes(3).toString("hex")}`.toUpperCase();

      // Create in Hotel A
      const resA = await request(app)
        .post("/api/v1/hotel/guests")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          first_name: "Guest",
          last_name: "HotelA",
          passport_number: passportNo
        });
      expect(resA.status).toBe(201);

      // Create in Hotel B
      const resB = await request(app)
        .post("/api/v1/hotel/guests")
        .set("Authorization", `Bearer ${adminTokenB}`)
        .send({
          first_name: "Guest",
          last_name: "HotelB",
          passport_number: passportNo
        });
      expect(resB.status).toBe(201);
    });

    it("should enforce concurrent duplicate guest creation safety on real MongoDB", async () => {
      const passportNo = `CONC_PASS_${crypto.randomBytes(3).toString("hex")}`.toUpperCase();
      const payload = {
        first_name: "Concurrent",
        last_name: "Runner",
        passport_number: passportNo
      };

      const [r1, r2] = await Promise.all([
        request(app).post("/api/v1/hotel/guests").set("Authorization", `Bearer ${adminTokenA}`).send(payload),
        request(app).post("/api/v1/hotel/guests").set("Authorization", `Bearer ${adminTokenA}`).send(payload)
      ]);

      const statuses = [r1.status, r2.status].sort();
      expect(statuses[0]).toBe(201);
      expect(statuses[1]).toBe(409);

      const GuestModel = await getModel(hotelA, "Guest");
      const dbCount = await GuestModel.countDocuments({ passport_number: passportNo });
      expect(dbCount).toBe(1);
    });
  });

  describe("Mass Assignment & Protection", () => {
    it("should strip injected hotelId or tenantId fields during guest creation and update", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/guests")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          first_name: "Hacker",
          last_name: "Attempt",
          hotelId: hotelB,
          tenantId: "fake-tenant"
        });

      expect(res.status).toBe(201);
      const guestId = res.body.data._id;

      // Verify guest is saved in Hotel A, not Hotel B
      const GuestModelA = await getModel(hotelA, "Guest");
      const foundInA = await GuestModelA.findOne({ _id: guestId, hotelId: hotelA });
      expect(foundInA).not.toBeNull();

      const GuestModelB = await getModel(hotelB, "Guest");
      const foundInB = await GuestModelB.findOne({ _id: guestId, hotelId: hotelB });
      expect(foundInB).toBeNull();
    });
  });

  describe("Tenant Isolation (Cross-Tenant Security)", () => {
    let guestA_id, guestB_id;

    beforeAll(async () => {
      // Create Guest in Hotel A
      const resA = await request(app)
        .post("/api/v1/hotel/guests")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          first_name: "IsoGuestA",
          last_name: "OwnerA"
        });
      guestA_id = resA.body.data._id;

      // Create Guest in Hotel B
      const resB = await request(app)
        .post("/api/v1/hotel/guests")
        .set("Authorization", `Bearer ${adminTokenB}`)
        .send({
          first_name: "IsoGuestB",
          last_name: "OwnerB"
        });
      guestB_id = resB.body.data._id;
    });

    it("should prevent Hotel A from reading Hotel B guest", async () => {
      const res = await request(app)
        .get(`/api/v1/hotel/guests/${guestB_id}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(res.status).toBe(404);
    });

    it("should prevent Hotel A from updating Hotel B guest", async () => {
      const res = await request(app)
        .put(`/api/v1/hotel/guests/${guestB_id}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ first_name: "HackedName" });
      expect(res.status).toBe(404);
    });

    it("should prevent Hotel A from deleting Hotel B guest", async () => {
      const res = await request(app)
        .delete(`/api/v1/hotel/guests/${guestB_id}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(res.status).toBe(404);

      // Verify Guest B still exists in Hotel B
      const checkRes = await request(app)
        .get(`/api/v1/hotel/guests/${guestB_id}`)
        .set("Authorization", `Bearer ${adminTokenB}`);
      expect(checkRes.status).toBe(200);
    });

    it("should prevent Hotel B from reading/updating/deleting Hotel A guest", async () => {
      const readRes = await request(app)
        .get(`/api/v1/hotel/guests/${guestA_id}`)
        .set("Authorization", `Bearer ${adminTokenB}`);
      expect(readRes.status).toBe(404);

      const updateRes = await request(app)
        .put(`/api/v1/hotel/guests/${guestA_id}`)
        .set("Authorization", `Bearer ${adminTokenB}`)
        .send({ notes: "Malicious Note" });
      expect(updateRes.status).toBe(404);

      const deleteRes = await request(app)
        .delete(`/api/v1/hotel/guests/${guestA_id}`)
        .set("Authorization", `Bearer ${adminTokenB}`);
      expect(deleteRes.status).toBe(404);
    });
  });

  describe("Guest List, Search, Update & Delete Lifecycle", () => {
    let testGuestId;

    it("should list guests with pagination and search", async () => {
      const listRes = await request(app)
        .get("/api/v1/hotel/guests?page=1&limit=10")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(listRes.status).toBe(200);
      expect(Array.isArray(listRes.body.data)).toBe(true);
      expect(listRes.body.meta).toBeDefined();

      testGuestId = listRes.body.data[0]._id;
    });

    it("should update guest details successfully", async () => {
      const updateRes = await request(app)
        .put(`/api/v1/hotel/guests/${testGuestId}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          city: "Islamabad",
          vip_status: true,
          notes: "Updated note"
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.city).toBe("Islamabad");
      expect(updateRes.body.data.vip_status).toBe(true);
    });

    it("should delete guest successfully", async () => {
      const deleteRes = await request(app)
        .delete(`/api/v1/hotel/guests/${testGuestId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(deleteRes.status).toBe(200);

      // Verify guest no longer found
      const getRes = await request(app)
        .get(`/api/v1/hotel/guests/${testGuestId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(getRes.status).toBe(404);
    });
  });
});
