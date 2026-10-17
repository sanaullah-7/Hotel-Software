import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import restaurantCategorySchema from "../../../../database/hotel/schemas/restaurant/restaurantCategory.schema.js";
import restaurantMenuItemSchema from "../../../../database/hotel/schemas/restaurant/restaurantMenuItem.schema.js";
import restaurantTableSchema from "../../../../database/hotel/schemas/restaurant/restaurantTable.schema.js";
import restaurantOrderSchema from "../../../../database/hotel/schemas/restaurant/restaurantOrder.schema.js";
import {
  createCategorySchema,
  updateCategorySchema,
  createMenuItemSchema,
  updateMenuItemSchema,
  createTableSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  VALID_ORDER_STATUS_TRANSITIONS,
  ORDER_STATUSES,
  PAYMENT_MODES,
  DIETARY_FLAGS,
  TABLE_STATUSES,
} from "../restaurant.validation.js";

// Create isolated test models using memory schemas
const CategoryModel = mongoose.model("TestRestaurantCategory", restaurantCategorySchema);
const MenuItemModel = mongoose.model("TestRestaurantMenuItem", restaurantMenuItemSchema);
const TableModel = mongoose.model("TestRestaurantTable", restaurantTableSchema);
const OrderModel = mongoose.model("TestRestaurantOrder", restaurantOrderSchema);

describe("Phase 9 Step 2: Restaurant/POS Backend Domain & Schema Hardening", () => {
  /* ─────────────────────────────────────────────────────────────
     1. RestaurantCategory Domain
  ───────────────────────────────────────────────────────────── */
  describe("RestaurantCategory Schema & Validation", () => {
    it("should instantiate a valid category with default values", () => {
      const doc = new CategoryModel({
        name: "Main Course",
        description: "Delicious entrees and grills",
      });
      const err = doc.validateSync();
      expect(err).toBeUndefined();
      expect(doc.name).toBe("Main Course");
      expect(doc.status).toBe("ACTIVE");
      expect(doc.display_order).toBe(0);
    });

    it("should fail validation if category name is missing", () => {
      const doc = new CategoryModel({ description: "No name" });
      const err = doc.validateSync();
      expect(err).toBeDefined();
      expect(err.errors.name).toBeDefined();
    });

    it("should reject invalid category status enum", () => {
      const doc = new CategoryModel({
        name: "Beverages",
        status: "DISCONTINUED",
      });
      const err = doc.validateSync();
      expect(err).toBeDefined();
      expect(err.errors.status).toBeDefined();
    });

    it("should validate category creation payload with Joi", () => {
      const validPayload = {
        name: "Starters & Appetizers",
        description: "Finger foods and starters",
        status: "ACTIVE",
        display_order: 1,
      };
      const { error, value } = createCategorySchema.validate(validPayload);
      expect(error).toBeUndefined();
      expect(value.name).toBe("Starters & Appetizers");

      const invalidPayload = { name: "   " };
      const { error: errInvalid } = createCategorySchema.validate(invalidPayload);
      expect(errInvalid).toBeDefined();
    });
  });

  /* ─────────────────────────────────────────────────────────────
     2. RestaurantMenuItem Domain
  ───────────────────────────────────────────────────────────── */
  describe("RestaurantMenuItem Schema & Validation", () => {
    const dummyCatId = new mongoose.Types.ObjectId();

    it("should instantiate a valid menu item with required snapshots and defaults", () => {
      const doc = new MenuItemModel({
        sku: "MI-BURGER-01",
        category_id: dummyCatId,
        name: "Classic Beef Burger",
        price: 850,
        dietary_flags: ["NON_VEG", "HALAL"],
      });
      const err = doc.validateSync();
      expect(err).toBeUndefined();
      expect(doc.currency).toBe("PKR");
      expect(doc.is_available).toBe(true);
      expect(doc.status).toBe("ACTIVE");
      expect(doc.sku).toBe("MI-BURGER-01");
      expect(doc.dietary_flags).toEqual(["NON_VEG", "HALAL"]);
    });

    it("should reject negative prices at schema level", () => {
      const doc = new MenuItemModel({
        sku: "MI-MINUS",
        category_id: dummyCatId,
        name: "Negative Item",
        price: -50,
      });
      const err = doc.validateSync();
      expect(err).toBeDefined();
      expect(err.errors.price).toBeDefined();
    });

    it("should require category_id and name", () => {
      const doc = new MenuItemModel({
        sku: "MI-INCOMPLETE",
        price: 100,
      });
      const err = doc.validateSync();
      expect(err).toBeDefined();
      expect(err.errors.name).toBeDefined();
      expect(err.errors.category_id).toBeDefined();
    });

    it("should validate menu item Joi schema with positive price", () => {
      const { error } = createMenuItemSchema.validate({
        category_id: dummyCatId.toHexString(),
        name: "Paneer Tikka",
        price: 450,
        dietary_flags: ["VEG"],
      });
      expect(error).toBeUndefined();

      const { error: errNeg } = createMenuItemSchema.validate({
        category_id: dummyCatId.toHexString(),
        name: "Paneer Tikka",
        price: -10,
      });
      expect(errNeg).toBeDefined();
    });
  });

  /* ─────────────────────────────────────────────────────────────
     3. RestaurantTable Domain
  ───────────────────────────────────────────────────────────── */
  describe("RestaurantTable Schema & Validation", () => {
    it("should instantiate a valid dining table with default status AVAILABLE", () => {
      const doc = new TableModel({
        table_number: "T-01",
        capacity: 4,
        location: "Patio Terrace",
      });
      const err = doc.validateSync();
      expect(err).toBeUndefined();
      expect(doc.status).toBe("AVAILABLE");
      expect(doc.capacity).toBe(4);
    });

    it("should reject capacity less than 1", () => {
      const doc = new TableModel({
        table_number: "T-00",
        capacity: 0,
      });
      const err = doc.validateSync();
      expect(err).toBeDefined();
      expect(err.errors.capacity).toBeDefined();
    });

    it("should enforce TABLE_STATUSES enum constraints", () => {
      const doc = new TableModel({
        table_number: "T-05",
        capacity: 2,
        status: "BROKEN",
      });
      const err = doc.validateSync();
      expect(err).toBeDefined();
      expect(err.errors.status).toBeDefined();
    });
  });

  /* ─────────────────────────────────────────────────────────────
     4. RestaurantOrder & OrderItem Snapshot Architecture
  ───────────────────────────────────────────────────────────── */
  describe("RestaurantOrder Schema & Snapshot Integrity", () => {
    const dummyItemId = new mongoose.Types.ObjectId();

    it("should instantiate a valid order with frozen item snapshots", () => {
      const doc = new OrderModel({
        order_ref: "ORD-TEST-001",
        customer_name: "Sherlock Holmes",
        room_number: "221B",
        payment_mode: "ROOM_FOLIO",
        total_amount: 1200,
        items: [
          {
            menu_item_id: dummyItemId,
            item_name_snapshot: "Smoked Salmon",
            unit_price_snapshot: 600,
            quantity: 2,
            subtotal: 1200,
            special_requests: "Extra lemon",
          },
        ],
      });
      const err = doc.validateSync();
      expect(err).toBeUndefined();
      expect(doc.status).toBe("PENDING");
      expect(doc.items.length).toBe(1);
      expect(doc.items[0].item_name_snapshot).toBe("Smoked Salmon");
      expect(doc.items[0].unit_price_snapshot).toBe(600);
      expect(doc.items[0].subtotal).toBe(1200);
      expect(doc.payment_mode).toBe("ROOM_FOLIO");
    });

    it("should require snapshot fields on order items", () => {
      const doc = new OrderModel({
        order_ref: "ORD-FAIL-001",
        total_amount: 500,
        items: [
          {
            // Missing item_name_snapshot, unit_price_snapshot, quantity, subtotal
            special_requests: "Blank",
          },
        ],
      });
      const err = doc.validateSync();
      expect(err).toBeDefined();
      expect(err.errors["items.0.item_name_snapshot"]).toBeDefined();
      expect(err.errors["items.0.unit_price_snapshot"]).toBeDefined();
      expect(err.errors["items.0.quantity"]).toBeDefined();
      expect(err.errors["items.0.subtotal"]).toBeDefined();
    });

    it("should reject quantity < 1 and negative unit_price_snapshot", () => {
      const doc = new OrderModel({
        order_ref: "ORD-FAIL-002",
        total_amount: 500,
        items: [
          {
            item_name_snapshot: "Item",
            unit_price_snapshot: -10,
            quantity: 0,
            subtotal: -10,
          },
        ],
      });
      const err = doc.validateSync();
      expect(err).toBeDefined();
      expect(err.errors["items.0.quantity"]).toBeDefined();
      expect(err.errors["items.0.unit_price_snapshot"]).toBeDefined();
    });
  });

  /* ─────────────────────────────────────────────────────────────
     5. Order Lifecycle State Machine Contract
  ───────────────────────────────────────────────────────────── */
  describe("Order Lifecycle Transitions", () => {
    it("should allow valid state transitions", () => {
      expect(VALID_ORDER_STATUS_TRANSITIONS.PENDING).toContain("PREPARING");
      expect(VALID_ORDER_STATUS_TRANSITIONS.PENDING).toContain("CANCELLED");
      expect(VALID_ORDER_STATUS_TRANSITIONS.PREPARING).toContain("SERVED");
      expect(VALID_ORDER_STATUS_TRANSITIONS.PREPARING).toContain("CANCELLED");
      expect(VALID_ORDER_STATUS_TRANSITIONS.SERVED).toContain("COMPLETED");
      expect(VALID_ORDER_STATUS_TRANSITIONS.SERVED).not.toContain("CANCELLED");
    });

    it("should enforce terminal status for COMPLETED and CANCELLED", () => {
      expect(VALID_ORDER_STATUS_TRANSITIONS.COMPLETED).toEqual([]);
      expect(VALID_ORDER_STATUS_TRANSITIONS.CANCELLED).toEqual([]);
    });

    it("should validate target status with Joi updateOrderStatusSchema", () => {
      const { error: validErr } = updateOrderStatusSchema.validate({
        status: "COMPLETED",
        notes: "Served and guest satisfied",
      });
      expect(validErr).toBeUndefined();

      const { error: invalidErr } = updateOrderStatusSchema.validate({
        status: "UNKNOWN_STATUS",
      });
      expect(invalidErr).toBeDefined();
    });
  });

  /* ─────────────────────────────────────────────────────────────
     6. Schema Index Specifications Verification
  ───────────────────────────────────────────────────────────── */
  describe("Index Specifications Hardening", () => {
    it("should have correct non-colliding indexes on RestaurantCategory", () => {
      const indexes = restaurantCategorySchema.indexes();
      // Ensure display_order and status indexes are present
      const displayIndex = indexes.find(i => i[0].display_order === 1);
      const statusIndex = indexes.find(i => i[0].status === 1);
      expect(displayIndex).toBeDefined();
      expect(statusIndex).toBeDefined();
      // name has unique: true in path options
      expect(restaurantCategorySchema.path("name").options.unique).toBe(true);
    });

    it("should have correct non-colliding indexes on RestaurantMenuItem", () => {
      const indexes = restaurantMenuItemSchema.indexes();
      const catAvailableIndex = indexes.find(i => i[0].category_id === 1 && i[0].is_available === 1);
      expect(catAvailableIndex).toBeDefined();
      expect(restaurantMenuItemSchema.path("sku").options.unique).toBe(true);
    });

    it("should have correct non-colliding indexes on RestaurantTable", () => {
      const indexes = restaurantTableSchema.indexes();
      const statusIndex = indexes.find(i => i[0].status === 1);
      expect(statusIndex).toBeDefined();
      expect(restaurantTableSchema.path("table_number").options.unique).toBe(true);
    });

    it("should have correct non-colliding indexes on RestaurantOrder", () => {
      const indexes = restaurantOrderSchema.indexes();
      const statusIndex = indexes.find(i => i[0].status === 1);
      const folioIndex = indexes.find(i => i[0].folio_id === 1);
      const createdAtIndex = indexes.find(i => i[0].created_at === -1);
      expect(statusIndex).toBeDefined();
      expect(folioIndex).toBeDefined();
      expect(createdAtIndex).toBeDefined();
      expect(restaurantOrderSchema.path("order_ref").options.unique).toBe(true);
    });
  });
});
