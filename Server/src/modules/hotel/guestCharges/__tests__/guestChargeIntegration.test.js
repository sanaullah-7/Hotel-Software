import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import crypto from "crypto";
import app from "../../../../app.js";
import { connectPlatformDB, closePlatformDB } from "../../../../database/platform/platformConnection.js";
import { closeAllHotelConnections } from "../../../../database/connectionManager.js";

const randomEmail = (prefix = "gc_admin") => `${prefix}_${crypto.randomBytes(4).toString("hex")}@hotel.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;

describe("Guest Charges & Dynamic Folio / Billing Integration", () => {
  let adminToken;
  let hotelId;
  let guest;
  let room;
  let roomType;
  let reservation;
  let folio;

  beforeAll(async () => {
    await connectPlatformDB();

    const adminEmail = randomEmail("gc_owner");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Guest Charge Admin",
      email: adminEmail,
      phone: randomPhone(),
      password: "Password123!",
    });

    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: adminEmail,
      password: "Password123!",
    });
    const tempToken = loginRes.body.data.accessToken;

    const onboardRes = await request(app)
      .post("/api/v1/provisioning/onboard")
      .set("Authorization", `Bearer ${tempToken}`)
      .send({
        property_name: "Grand Folio Hotel",
        address: "777 Royal Ave",
        city: "Karachi",
      });
    hotelId = onboardRes.body.data.hotelId;

    const relogin = await request(app).post("/api/v1/auth/login").send({
      email: adminEmail,
      password: "Password123!",
    });
    adminToken = relogin.body.data.accessToken;

    // Create Room Type & Room
    const rtRes = await request(app)
      .post("/api/v1/hotel/room-types")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Deluxe Suite",
        code: `DLX_${crypto.randomBytes(2).toString("hex").toUpperCase()}`,
        base_occupancy: 2,
        max_occupancy: 3,
        base_price: 200,
      });
    roomType = rtRes.body.data;

    const roomNumber = `305_${crypto.randomBytes(2).toString("hex")}`;
    const roomRes = await request(app)
      .post("/api/v1/hotel/rooms")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        room_number: roomNumber,
        room_type_id: roomType._id,
        floor: "3",
      });
    room = roomRes.body.data;

    // Create Guest
    const guestRes = await request(app)
      .post("/api/v1/hotel/guests")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        first_name: "Tariq",
        last_name: "Mehmood",
        email: randomEmail("tariq"),
        phone: randomPhone(),
      });
    guest = guestRes.body.data;

    // Create Reservation
    const inDate = new Date();
    inDate.setDate(inDate.getDate() + 1);
    const outDate = new Date();
    outDate.setDate(outDate.getDate() + 4);

    const resRes = await request(app)
      .post("/api/v1/hotel/reservations")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        primary_guest_id: guest._id,
        room_type_id: roomType._id,
        room_id: room._id,
        expected_check_in: inDate.toISOString(),
        expected_check_out: outDate.toISOString(),
        adults: 2,
        children: 0,
      });
    reservation = resRes.body.data?.reservation || resRes.body.data;
    folio = resRes.body.data?.folio;

    if (!folio) {
      const folioRes = await request(app)
        .post("/api/v1/hotel/folios")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          guest_id: guest._id,
          reservation_id: reservation._id,
        });
      folio = folioRes.body.data;
    }
  });

  afterAll(async () => {
    await closeAllHotelConnections();
    await closePlatformDB();
  });

  it("1. POST /api/v1/hotel/guest-charges — creates consumption charge and increments Folio balance automatically", async () => {
    const chargeRes = await request(app)
      .post("/api/v1/hotel/guest-charges")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        folio_id: folio._id,
        charge_type: "CONSUMPTION",
        item_name: "Minibar Red Bull (250ml)",
        quantity: 2,
        unit_price: 350,
        amount: 700,
        description: "Minibar Red Bull (250ml) (Consumption)",
        notes: "Consumed from room minibar",
      });

    expect(chargeRes.status).toBe(201);
    expect(chargeRes.body.success).toBe(true);
    expect(chargeRes.body.data.amount).toBe(700);
    expect(chargeRes.body.data.quantity).toBe(2);
    expect(chargeRes.body.data.is_voided).toBe(false);

    // Verify Folio balance is automatically incremented (initial room charge 600 + consumption 700 = 1300)
    const updatedFolioRes = await request(app)
      .get(`/api/v1/hotel/folios/${folio._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(updatedFolioRes.status).toBe(200);
    expect(updatedFolioRes.body.data.balance).toBe(600 + 700);
  });

  it("2. POST /api/v1/hotel/guest-charges — attaches to an active Invoice on the guest's folio", async () => {
    const chargeRes = await request(app)
      .post("/api/v1/hotel/guest-charges")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        reservation_id: reservation._id,
        charge_type: "DAMAGE",
        item_name: "Stained Bath Towel",
        quantity: 1,
        unit_price: 1500,
        amount: 1500,
        description: "Missing / Damaged Luxury Towel",
        notes: "Housekeeping inspection loss charge",
      });

    expect(chargeRes.status).toBe(201);
    expect(chargeRes.body.data.invoice_id).toBeDefined();

    // Verify Folio balance increased: 600 (room charge) + 700 + 1500 = 2800
    const folioRes = await request(app)
      .get(`/api/v1/hotel/folios/${folio._id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(folioRes.body.data.balance).toBe(600 + 700 + 1500);
  });

  it("3. GET /api/v1/hotel/guest-charges — retrieves live populated charge records and supports filtering", async () => {
    const getRes = await request(app)
      .get("/api/v1/hotel/guest-charges")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.success).toBe(true);
    expect(getRes.body.data.length).toBeGreaterThanOrEqual(2);

    // Filter by charge type
    const filterRes = await request(app)
      .get("/api/v1/hotel/guest-charges?charge_type=DAMAGE")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(filterRes.status).toBe(200);
    expect(filterRes.body.data.every((c) => c.charge_type === "DAMAGE")).toBe(true);
  });

  it("4. PATCH /api/v1/hotel/guest-charges/:id/void — voids charge and reduces Folio balance", async () => {
    // Create temporary charge to void
    const tempChargeRes = await request(app)
      .post("/api/v1/hotel/guest-charges")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        folio_id: folio._id,
        charge_type: "MISCELLANEOUS",
        item_name: "Accidental Charge",
        quantity: 1,
        unit_price: 500,
        amount: 500,
        description: "Test charge for reversal",
      });

    const chargeId = tempChargeRes.body.data._id;

    // Void the charge
    const voidRes = await request(app)
      .patch(`/api/v1/hotel/guest-charges/${chargeId}/void`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(voidRes.status).toBe(200);
    expect(voidRes.body.data.is_voided).toBe(true);

    // Verify Folio balance reverted back to 2800 (3300 - 500)
    const folioRes = await request(app)
      .get(`/api/v1/hotel/folios/${folio._id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(folioRes.body.data.balance).toBe(600 + 700 + 1500);
  });
});
