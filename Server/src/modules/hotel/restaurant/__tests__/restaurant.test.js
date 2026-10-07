import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import crypto from "crypto";
import app from "../../../../app.js";
import { connectPlatformDB, closePlatformDB } from "../../../../database/platform/platformConnection.js";
import { closeAllHotelConnections } from "../../../../database/connectionManager.js";
import { getModel } from "../../../../database/hotel/modelFactory.js";
import Account from "../../../../database/platform/models/account.model.js";
import { ROLES } from "../../../../constants/roles.js";

const randomEmail = (prefix = "rest") => `${prefix}_${crypto.randomBytes(4).toString("hex")}@hotel.com`;
const randomPhone = () => `03${Math.floor(100000001 + Math.random() * 899999999)}`;
const getErrMsg = (res) => res.body?.error?.message || res.body?.message || "";

describe("Restaurant & POS Integration Suite (Step 3)", () => {
  let adminTokenA, adminTokenB, staffTokenA;
  let hotelA, hotelB;
  let categoryA1, categoryA2, categoryB1;
  let menuItemA1, menuItemA2, menuItemB1;
  let tableA1, tableA2, tableB1;
  let guestA, reservationA, openFolioA, closedFolioA;

  beforeAll(async () => {
    await connectPlatformDB();

    // 1. Hotel A Setup (Admin)
    const emailA = randomEmail("adminA");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Admin Hotel A", email: emailA, phone: randomPhone(), password: "Password123!", role: ROLES.HOTEL_USER
    });
    const loginA = await request(app).post("/api/v1/auth/login").send({ email: emailA, password: "Password123!" });
    const onboardA = await request(app).post("/api/v1/provisioning/onboard")
      .set("Authorization", `Bearer ${loginA.body.data.accessToken}`)
      .send({ property_name: "Grand Alpha Restaurant Hotel", address: "100 Food Ave", city: "Metropolis" });
    hotelA = onboardA.body.data.hotelId;

    const reloginA = await request(app).post("/api/v1/auth/login").send({ email: emailA, password: "Password123!" });
    adminTokenA = reloginA.body.data.accessToken;

    // 2. Hotel B Setup (Admin - for tenant isolation)
    const emailB = randomEmail("adminB");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Admin Hotel B", email: emailB, phone: randomPhone(), password: "Password123!", role: ROLES.HOTEL_USER
    });
    const loginB = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "Password123!" });
    const onboardB = await request(app).post("/api/v1/provisioning/onboard")
      .set("Authorization", `Bearer ${loginB.body.data.accessToken}`)
      .send({ property_name: "Grand Beta Restaurant Hotel", address: "200 Dine St", city: "Metropolis" });
    hotelB = onboardB.body.data.hotelId;

    const reloginB = await request(app).post("/api/v1/auth/login").send({ email: emailB, password: "Password123!" });
    adminTokenB = reloginB.body.data.accessToken;

    // 3. Staff User in Hotel A (non-admin, HOTEL_USER)
    const emailStaffA = randomEmail("staffA");
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Waiter Staff A", email: emailStaffA, phone: randomPhone(), password: "Password123!", role: ROLES.HOTEL_USER
    });
    await Account.findOneAndUpdate({ email: emailStaffA }, { hotelId: hotelA, role: ROLES.HOTEL_USER });
    const loginStaffA = await request(app).post("/api/v1/auth/login").send({ email: emailStaffA, password: "Password123!" });
    staffTokenA = loginStaffA.body.data.accessToken;

    // 4. Setup Guest, Room, Reservation & Folios in Hotel A for ROOM_FOLIO tests
    const roomTypeRes = await request(app).post("/api/v1/hotel/room-types")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({
        name: "Deluxe Suite", code: `DLX_${crypto.randomBytes(2).toString("hex").toUpperCase()}`,
        base_occupancy: 2, max_occupancy: 2, base_price: 200
      });
    const roomType = roomTypeRes.body.data;

    await request(app).post("/api/v1/hotel/rooms")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({ room_number: "301", room_type_id: roomType._id, floor: "3" });

    const guestRes = await request(app).post("/api/v1/hotel/guests")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({ first_name: "Gourmet", last_name: "Guest", email: randomEmail("guest"), phone: randomPhone() });
    guestA = guestRes.body.data;

    const inDate = new Date();
    const outDate = new Date();
    outDate.setDate(outDate.getDate() + 3);

    const resRes = await request(app).post("/api/v1/hotel/reservations")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({
        primary_guest_id: guestA._id,
        room_type_id: roomType._id,
        expected_check_in: inDate.toISOString(),
        expected_check_out: outDate.toISOString(),
        adults: 1
      });
    reservationA = resRes.body.data.reservation;

    // Create Open Folio
    const folioRes = await request(app).post("/api/v1/hotel/folios")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({ reservation_id: reservationA._id });
    openFolioA = folioRes.body.data;

    // Create another reservation and Folio that is CLOSED
    const resRes2 = await request(app).post("/api/v1/hotel/reservations")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({
        primary_guest_id: guestA._id,
        room_type_id: roomType._id,
        expected_check_in: inDate.toISOString(),
        expected_check_out: outDate.toISOString(),
        adults: 1
      });
    const folioRes2 = await request(app).post("/api/v1/hotel/folios")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({ reservation_id: resRes2.body.data.reservation._id });
    closedFolioA = folioRes2.body.data;

    // Manually mark closedFolioA as CLOSED in database to test closed folio rejection
    const FolioModelA = await getModel(hotelA, "Folio");
    await FolioModelA.findByIdAndUpdate(closedFolioA._id, { status: "CLOSED" });
  });

  afterAll(async () => {
    await closeAllHotelConnections();
    await closePlatformDB();
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * 1. CATEGORIES: CRUD, DUPLICATE REJECTION & TENANT ISOLATION
   * ────────────────────────────────────────────────────────────────────────── */
  describe("1. Restaurant Categories", () => {
    it("should allow HOTEL_ADMIN to create categories in Hotel A", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/restaurant/categories")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ name: "Appetizers", description: "Starters and snacks", display_order: 1 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("Appetizers");
      expect(res.body.data.status).toBe("ACTIVE");
      categoryA1 = res.body.data;

      // Second category
      const res2 = await request(app)
        .post("/api/v1/hotel/restaurant/categories")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ name: "Main Course", description: "Hearty entrees", display_order: 2 });
      categoryA2 = res2.body.data;
    });

    it("should reject duplicate category name (case-insensitive) in the same hotel with 409", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/restaurant/categories")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ name: "appetizers", description: "Duplicate test" });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(getErrMsg(res)).toMatch(/already exists/i);
    });

    it("should allow same category name in different hotel (tenant-scoped)", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/restaurant/categories")
        .set("Authorization", `Bearer ${adminTokenB}`)
        .send({ name: "Appetizers", description: "Hotel B Starters" });

      expect(res.status).toBe(201);
      categoryB1 = res.body.data;
    });

    it("should list categories only for the caller's tenant", async () => {
      const resA = await request(app)
        .get("/api/v1/hotel/restaurant/categories")
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(resA.status).toBe(200);
      const namesA = resA.body.data.map(c => c.name);
      expect(namesA).toContain("Appetizers");
      expect(namesA).toContain("Main Course");

      const resB = await request(app)
        .get("/api/v1/hotel/restaurant/categories")
        .set("Authorization", `Bearer ${adminTokenB}`);

      expect(resB.status).toBe(200);
      const namesB = resB.body.data.map(c => c.name);
      expect(namesB).toContain("Appetizers");
      expect(namesB).not.toContain("Main Course");
    });

    it("should update a category", async () => {
      const res = await request(app)
        .put(`/api/v1/hotel/restaurant/categories/${categoryA1._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ description: "Updated starters" });

      expect(res.status).toBe(200);
      expect(res.body.data.description).toBe("Updated starters");
    });

    it("should reject cross-tenant category access / update", async () => {
      // Hotel A admin tries to update Hotel B category
      const res = await request(app)
        .put(`/api/v1/hotel/restaurant/categories/${categoryB1._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ name: "Hacked Category" });

      expect(res.status).toBe(404);
    });

    it("should soft-deactivate category if menu items reference it", async () => {
      // Create a temporary category and item in Hotel A
      const catRes = await request(app)
        .post("/api/v1/hotel/restaurant/categories")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ name: "Beverages" });
      const tempCatId = catRes.body.data._id;

      await request(app)
        .post("/api/v1/hotel/restaurant/menu")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          name: "Fresh Lemonade",
          category_id: tempCatId,
          price: 5,
        });

      // Attempt to delete category
      const delRes = await request(app)
        .delete(`/api/v1/hotel/restaurant/categories/${tempCatId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(delRes.status).toBe(200);
      expect(delRes.body.data.deactivation).toBe(true);

      // Verify category is now INACTIVE
      const checkRes = await request(app)
        .get(`/api/v1/hotel/restaurant/categories/${tempCatId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(checkRes.body.data.status).toBe("INACTIVE");
    });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * 2. MENU ITEMS: CRUD, SKU GENERATION/UNIQUENESS, TENANT BOUNDARY
   * ────────────────────────────────────────────────────────────────────────── */
  describe("2. Restaurant Menu Items", () => {
    it("should create menu item with custom SKU and validate category existence", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/restaurant/menu")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          name: "Crispy Spring Rolls",
          category_id: categoryA1._id,
          price: 12.50,
          sku: "ROLLS-01",
          dietary_flags: ["VEGETARIAN"],
          is_available: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.sku).toBe("ROLLS-01");
      expect(res.body.data.name).toBe("Crispy Spring Rolls");
      expect(res.body.data.price).toBe(12.50);
      expect(res.body.data.dietary_flags).toEqual(["VEGETARIAN"]);
      menuItemA1 = res.body.data;
    });

    it("should auto-generate a unique concurrency-safe SKU if omitted", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/restaurant/menu")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          name: "Grilled Ribeye Steak",
          category_id: categoryA2._id,
          price: 35.00,
          dietary_flags: ["GLUTEN_FREE"],
          is_available: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.sku).toBeDefined();
      expect(res.body.data.sku).toMatch(/^SKU-/);
      menuItemA2 = res.body.data;
    });

    it("should reject duplicate SKU in same hotel with 409", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/restaurant/menu")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          name: "Another Spring Roll",
          category_id: categoryA1._id,
          price: 10,
          sku: "ROLLS-01", // duplicate
        });

      expect(res.status).toBe(409);
      expect(getErrMsg(res)).toMatch(/already exists/i);
    });

    it("should reject cross-tenant category reference (Hotel A item using Hotel B category)", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/restaurant/menu")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          name: "Cross Tenant Test Item",
          category_id: categoryB1._id, // Hotel B category!
          price: 15,
        });

      expect(res.status).toBe(400);
      expect(getErrMsg(res)).toMatch(/Category does not exist/i);
    });

    it("should create menu item in Hotel B and ensure tenant isolation", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/restaurant/menu")
        .set("Authorization", `Bearer ${adminTokenB}`)
        .send({
          name: "Beta Garlic Bread",
          category_id: categoryB1._id,
          price: 8,
          sku: "ROLLS-01", // same SKU allowed in different hotel
        });

      expect(res.status).toBe(201);
      menuItemB1 = res.body.data;

      // Hotel A cannot read Hotel B menu item by ID
      const getCross = await request(app)
        .get(`/api/v1/hotel/restaurant/menu/${menuItemB1._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`);
      expect(getCross.status).toBe(404);
    });

    it("should update menu item and enforce category validation", async () => {
      const res = await request(app)
        .put(`/api/v1/hotel/restaurant/menu/${menuItemA1._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          price: 14.00,
          is_available: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.price).toBe(14.00);
    });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * 3. RESTAURANT TABLES: CRUD, NUMBER UNIQUENESS & TENANT ISOLATION
   * ────────────────────────────────────────────────────────────────────────── */
  describe("3. Restaurant Tables", () => {
    it("should create tables with valid capacities and numbers", async () => {
      const res1 = await request(app)
        .post("/api/v1/hotel/restaurant/tables")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ table_number: "T-01", capacity: 4, location: "Main Hall" });

      expect(res1.status).toBe(201);
      expect(res1.body.data.table_number).toBe("T-01");
      expect(res1.body.data.status).toBe("AVAILABLE");
      tableA1 = res1.body.data;

      const res2 = await request(app)
        .post("/api/v1/hotel/restaurant/tables")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ table_number: "T-02", capacity: 2, location: "Patio" });

      expect(res2.status).toBe(201);
      tableA2 = res2.body.data;
    });

    it("should reject duplicate table number in the same hotel with 409", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/restaurant/tables")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ table_number: "T-01", capacity: 6 });

      expect(res.status).toBe(409);
      expect(getErrMsg(res)).toMatch(/already exists/i);
    });

    it("should allow same table number in a different hotel", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/restaurant/tables")
        .set("Authorization", `Bearer ${adminTokenB}`)
        .send({ table_number: "T-01", capacity: 4 });

      expect(res.status).toBe(201);
      tableB1 = res.body.data;
    });

    it("should enforce tenant isolation on tables", async () => {
      const res = await request(app)
        .get(`/api/v1/hotel/restaurant/tables/${tableB1._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(404);
    });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * 4. ORDER CREATION: SERVER PRICE SNAPSHOTS, INTEGRITY & REJECTIONS
   * ────────────────────────────────────────────────────────────────────────── */
  describe("4. Order Creation & Pricing Authority", () => {
    it("should compute authoritative subtotal and total using backend snapshots (ignoring client prices)", async () => {
      // Client attempts to send forged price of $1.00 each
      const res = await request(app)
        .post("/api/v1/hotel/restaurant/orders")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          table_id: tableA1._id,
          customer_name: "Walk-in Guest",
          payment_mode: "CASH",
          items: [
            {
              menu_item_id: menuItemA1._id, // Real price = $14.00
              quantity: 2,
              price: 1.00, // FORGED - should be ignored!
              subtotal: 2.00, // FORGED - should be ignored!
            },
            {
              menu_item_id: menuItemA2._id, // Real price = $35.00
              quantity: 1,
              price: 5.00, // FORGED - should be ignored!
              subtotal: 5.00, // FORGED - should be ignored!
            },
          ],
        });

      expect(res.status).toBe(201);
      const order = res.body.data;
      expect(order.order_ref).toBeDefined();
      expect(order.order_ref).toMatch(/^ORD-/);
      expect(order.status).toBe("PENDING");
      expect(order.payment_mode).toBe("CASH");

      // Authoritative calculation: (2 * 14.00) + (1 * 35.00) = 28.00 + 35.00 = 63.00
      expect(order.total_amount).toBe(63.00);

      // Verify item snapshots
      expect(order.items).toHaveLength(2);
      expect(order.items[0].item_name_snapshot).toBe("Crispy Spring Rolls");
      expect(order.items[0].unit_price_snapshot).toBe(14.00);
      expect(order.items[0].subtotal).toBe(28.00);

      expect(order.items[1].item_name_snapshot).toBe("Grilled Ribeye Steak");
      expect(order.items[1].unit_price_snapshot).toBe(35.00);
      expect(order.items[1].subtotal).toBe(35.00);
    });

    it("should preserve historical order snapshot even if menu item price later changes", async () => {
      // 1. Create order
      const orderRes = await request(app)
        .post("/api/v1/hotel/restaurant/orders")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          payment_mode: "CARD",
          items: [{ menu_item_id: menuItemA1._id, quantity: 1 }],
        });
      expect(orderRes.status).toBe(201);
      const orderId = orderRes.body.data._id;
      expect(orderRes.body.data.total_amount).toBe(14.00);

      // 2. Change menu item price from $14.00 to $99.00
      await request(app)
        .put(`/api/v1/hotel/restaurant/menu/${menuItemA1._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ price: 99.00 });

      // 3. Re-fetch historical order - price snapshot must remain $14.00, total $14.00
      const fetchedOrder = await request(app)
        .get(`/api/v1/hotel/restaurant/orders/${orderId}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(fetchedOrder.status).toBe(200);
      expect(fetchedOrder.body.data.total_amount).toBe(14.00);
      expect(fetchedOrder.body.data.items[0].unit_price_snapshot).toBe(14.00);

      // Restore price for subsequent tests
      await request(app)
        .put(`/api/v1/hotel/restaurant/menu/${menuItemA1._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ price: 14.00 });
    });

    it("should reject order if menu item is unavailable or inactive", async () => {
      // Mark menuItemA2 unavailable
      await request(app)
        .put(`/api/v1/hotel/restaurant/menu/${menuItemA2._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ is_available: false });

      const res = await request(app)
        .post("/api/v1/hotel/restaurant/orders")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          payment_mode: "CASH",
          items: [{ menu_item_id: menuItemA2._id, quantity: 1 }],
        });

      expect(res.status).toBe(400);
      expect(getErrMsg(res)).toMatch(/currently unavailable/i);

      // Restore availability
      await request(app)
        .put(`/api/v1/hotel/restaurant/menu/${menuItemA2._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ is_available: true });
    });

    it("should reject cross-tenant item reference in order", async () => {
      // Hotel A attempts to order Hotel B's menu item
      const res = await request(app)
        .post("/api/v1/hotel/restaurant/orders")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          payment_mode: "CASH",
          items: [{ menu_item_id: menuItemB1._id, quantity: 1 }],
        });

      expect(res.status).toBe(400);
      expect(getErrMsg(res)).toMatch(/Menu item not found in this hotel/i);
    });

    it("should reject cross-tenant table reference in order", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/restaurant/orders")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          table_id: tableB1._id, // Hotel B's table
          payment_mode: "CASH",
          items: [{ menu_item_id: menuItemA1._id, quantity: 1 }],
        });

      expect(res.status).toBe(400);
      expect(getErrMsg(res)).toMatch(/Table not found in this hotel/i);
    });

    it("should return existing order when submitted with duplicate idempotency_key", async () => {
      const key = "idem-order-key-12345";
      const res1 = await request(app)
        .post("/api/v1/hotel/restaurant/orders")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          payment_mode: "CASH",
          idempotency_key: key,
          items: [{ menu_item_id: menuItemA1._id, quantity: 1 }],
        });

      expect(res1.status).toBe(201);
      const firstOrderId = res1.body.data._id;

      const res2 = await request(app)
        .post("/api/v1/hotel/restaurant/orders")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          payment_mode: "CASH",
          idempotency_key: key,
          items: [{ menu_item_id: menuItemA1._id, quantity: 1 }],
        });

      expect(res2.status).toBe(201);
      expect(res2.body.data._id).toBe(firstOrderId);
    });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * 5. ROOM FOLIO ORDERS & BILLING GUESTCHARGE INTEGRATION
   * ────────────────────────────────────────────────────────────────────────── */
  describe("5. Room Folio Orders & Billing Integration", () => {
    let folioOrder;

    it("should create order with payment_mode ROOM_FOLIO and post authoritative GuestCharge", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/restaurant/orders")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          folio_id: openFolioA._id,
          room_number: "301",
          customer_name: "Gourmet Guest",
          payment_mode: "ROOM_FOLIO",
          items: [{ menu_item_id: menuItemA1._id, quantity: 2 }], // 2 * 14.00 = 28.00
        });

      if (res.status !== 201) {
        console.error("DEBUG Folio Order Fail:", res.status, JSON.stringify(res.body));
      }
      expect(res.status).toBe(201);
      folioOrder = res.body.data;
      expect(folioOrder.payment_mode).toBe("ROOM_FOLIO");
      expect(folioOrder.folio_id).toBe(openFolioA._id);
      expect(folioOrder.total_amount).toBe(28.00);

      // Verify authoritative GuestCharge was created directly in Billing
      const GuestChargeModel = await getModel(hotelA, "GuestCharge");
      const charge = await GuestChargeModel.findOne({
        folio_id: openFolioA._id,
        reference_id: folioOrder._id,
      });

      expect(charge).toBeDefined();
      expect(charge.charge_type).toBe("RESTAURANT");
      expect(charge.amount).toBe(28.00);
      expect(charge.is_voided).toBe(false);
      expect(charge.description).toContain(folioOrder.order_ref);
    });

    it("should reject ROOM_FOLIO order if folio is missing or closed", async () => {
      // 1. Missing folio_id when payment_mode is ROOM_FOLIO
      const resMissing = await request(app)
        .post("/api/v1/hotel/restaurant/orders")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          payment_mode: "ROOM_FOLIO",
          items: [{ menu_item_id: menuItemA1._id, quantity: 1 }],
        });
      expect(resMissing.status).toBe(400);
      expect(getErrMsg(resMissing)).toMatch(/folio/i);

      // 2. Closed folio
      const resClosed = await request(app)
        .post("/api/v1/hotel/restaurant/orders")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          folio_id: closedFolioA._id,
          payment_mode: "ROOM_FOLIO",
          items: [{ menu_item_id: menuItemA1._id, quantity: 1 }],
        });
      expect(resClosed.status).toBe(400);
      expect(getErrMsg(resClosed)).toMatch(/Folio must be active and open/i);
    });

    it("should void the GuestCharge if order is cancelled from PENDING state", async () => {
      const cancelRes = await request(app)
        .patch(`/api/v1/hotel/restaurant/orders/${folioOrder._id}/status`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ status: "CANCELLED", notes: "Guest changed mind" });

      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.data.status).toBe("CANCELLED");

      // Verify GuestCharge is now voided
      const GuestChargeModel = await getModel(hotelA, "GuestCharge");
      const charge = await GuestChargeModel.findOne({
        reference_id: folioOrder._id,
      });

      expect(charge).toBeDefined();
      expect(charge.is_voided).toBe(true);
    });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * 6. WALK-IN PAYMENT BOUNDARY: CASH, CARD, ONLINE (NO COMPETING LEDGER)
   * ────────────────────────────────────────────────────────────────────────── */
  describe("6. Walk-in Payment Boundary (CASH / CARD / ONLINE)", () => {
    it("should create CASH order without requiring folio and not creating billing charges", async () => {
      const initialChargeCount = await (await getModel(hotelA, "GuestCharge")).countDocuments();

      const res = await request(app)
        .post("/api/v1/hotel/restaurant/orders")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          payment_mode: "CASH",
          customer_name: "Walk-in Diner",
          items: [{ menu_item_id: menuItemA1._id, quantity: 1 }],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.folio_id).toBeNull();
      expect(res.body.data.payment_mode).toBe("CASH");

      // GuestCharges count must remain identical
      const postChargeCount = await (await getModel(hotelA, "GuestCharge")).countDocuments();
      expect(postChargeCount).toBe(initialChargeCount);
    });

    it("should record settled_at when walk-in order transitions to COMPLETED", async () => {
      const orderRes = await request(app)
        .post("/api/v1/hotel/restaurant/orders")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          payment_mode: "CARD",
          items: [{ menu_item_id: menuItemA1._id, quantity: 1 }],
        });

      const orderId = orderRes.body.data._id;
      expect(orderRes.body.data.settled_at).toBeFalsy();

      // Progress: PENDING -> PREPARING -> SERVED -> COMPLETED
      await request(app)
        .patch(`/api/v1/hotel/restaurant/orders/${orderId}/status`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ status: "PREPARING" });

      await request(app)
        .patch(`/api/v1/hotel/restaurant/orders/${orderId}/status`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ status: "SERVED" });

      const completeRes = await request(app)
        .patch(`/api/v1/hotel/restaurant/orders/${orderId}/status`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ status: "COMPLETED" });

      expect(completeRes.status).toBe(200);
      expect(completeRes.body.data.status).toBe("COMPLETED");
      expect(completeRes.body.data.settled_at).toBeDefined();
      expect(new Date(completeRes.body.data.settled_at).getTime()).toBeGreaterThan(0);
    });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * 7. ORDER LIFECYCLE STATE MACHINE & TERMINAL IMMUTABILITY
   * ────────────────────────────────────────────────────────────────────────── */
  describe("7. Order Lifecycle State Machine", () => {
    let lifecycleOrder;

    beforeAll(async () => {
      const res = await request(app)
        .post("/api/v1/hotel/restaurant/orders")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          payment_mode: "CASH",
          items: [{ menu_item_id: menuItemA1._id, quantity: 1 }],
        });
      lifecycleOrder = res.body.data;
    });

    it("should reject invalid transition jumps (e.g. PENDING directly to COMPLETED)", async () => {
      const res = await request(app)
        .patch(`/api/v1/hotel/restaurant/orders/${lifecycleOrder._id}/status`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ status: "COMPLETED" });

      expect(res.status).toBe(400);
      expect(getErrMsg(res)).toMatch(/Invalid order status transition/i);
    });

    it("should allow valid transition from PENDING to PREPARING", async () => {
      const res = await request(app)
        .patch(`/api/v1/hotel/restaurant/orders/${lifecycleOrder._id}/status`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ status: "PREPARING" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("PREPARING");
    });

    it("should allow valid transition from PREPARING to SERVED", async () => {
      const res = await request(app)
        .patch(`/api/v1/hotel/restaurant/orders/${lifecycleOrder._id}/status`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ status: "SERVED" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("SERVED");
    });

    it("should REJECT cancellation after SERVED (requires billing refund/void)", async () => {
      const res = await request(app)
        .patch(`/api/v1/hotel/restaurant/orders/${lifecycleOrder._id}/status`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ status: "CANCELLED" });

      expect(res.status).toBe(400);
      expect(getErrMsg(res)).toMatch(/Invalid order status transition/i);
    });

    it("should allow transition from SERVED to COMPLETED", async () => {
      const res = await request(app)
        .patch(`/api/v1/hotel/restaurant/orders/${lifecycleOrder._id}/status`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ status: "COMPLETED" });

      expect(completeStatusRes => completeStatusRes.status).toBeDefined();
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("COMPLETED");
    });

    it("should protect terminal state: COMPLETED cannot transition to any other status", async () => {
      const res = await request(app)
        .patch(`/api/v1/hotel/restaurant/orders/${lifecycleOrder._id}/status`)
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({ status: "CANCELLED" });

      expect(res.status).toBe(400);
      expect(getErrMsg(res)).toMatch(/Cannot modify an order in terminal state/i);
    });

    it("should reject deletion of completed order (historical protection)", async () => {
      const res = await request(app)
        .delete(`/api/v1/hotel/restaurant/orders/${lifecycleOrder._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(400);
      expect(getErrMsg(res)).toMatch(/Completed historical orders cannot be deleted/i);
    });

    it("should reject physical deletion of pending order (audit integrity)", async () => {
      const pendingOrderRes = await request(app)
        .post("/api/v1/hotel/restaurant/orders")
        .set("Authorization", `Bearer ${adminTokenA}`)
        .send({
          payment_mode: "CASH",
          items: [{ menu_item_id: menuItemA1._id, quantity: 1 }],
        });
      expect(pendingOrderRes.status).toBe(201);

      const res = await request(app)
        .delete(`/api/v1/hotel/restaurant/orders/${pendingOrderRes.body.data._id}`)
        .set("Authorization", `Bearer ${adminTokenA}`);

      expect(res.status).toBe(400);
      expect(getErrMsg(res)).toMatch(/Physical deletion of restaurant orders is prohibited/i);
    });
  });

  /* ──────────────────────────────────────────────────────────────────────────
   * 8. RBAC: LEAST PRIVILEGE ENFORCEMENT
   * ────────────────────────────────────────────────────────────────────────── */
  describe("8. RBAC & Authorization", () => {
    it("should reject unauthenticated requests with 401", async () => {
      const res = await request(app).get("/api/v1/hotel/restaurant/categories");
      expect(res.status).toBe(401);
    });

    it("should reject non-admin (HOTEL_USER) from creating categories with 403", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/restaurant/categories")
        .set("Authorization", `Bearer ${staffTokenA}`)
        .send({ name: "Unauthorized Cat" });

      expect(res.status).toBe(403);
    });

    it("should reject non-admin (HOTEL_USER) from creating menu items with 403", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/restaurant/menu")
        .set("Authorization", `Bearer ${staffTokenA}`)
        .send({
          name: "Unauthorized Item",
          category_id: categoryA1._id,
          price: 10,
        });

      expect(res.status).toBe(403);
    });

    it("should reject non-admin (HOTEL_USER) from creating tables with 403", async () => {
      const res = await request(app)
        .post("/api/v1/hotel/restaurant/tables")
        .set("Authorization", `Bearer ${staffTokenA}`)
        .send({ table_number: "T-99", capacity: 4 });

      expect(res.status).toBe(403);
    });

    it("should ALLOW non-admin (HOTEL_USER) to read menu, create orders and update status", async () => {
      // 1. Read menu
      const readRes = await request(app)
        .get("/api/v1/hotel/restaurant/menu")
        .set("Authorization", `Bearer ${staffTokenA}`);
      expect(readRes.status).toBe(200);

      // 2. Create order
      const orderRes = await request(app)
        .post("/api/v1/hotel/restaurant/orders")
        .set("Authorization", `Bearer ${staffTokenA}`)
        .send({
          payment_mode: "CASH",
          items: [{ menu_item_id: menuItemA1._id, quantity: 1 }],
        });
      expect(orderRes.status).toBe(201);
      const staffOrderId = orderRes.body.data._id;

      // 3. Update status (waiter moves PENDING -> PREPARING)
      const updateRes = await request(app)
        .patch(`/api/v1/hotel/restaurant/orders/${staffOrderId}/status`)
        .set("Authorization", `Bearer ${staffTokenA}`)
        .send({ status: "PREPARING" });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.status).toBe("PREPARING");
    });
  });
});
