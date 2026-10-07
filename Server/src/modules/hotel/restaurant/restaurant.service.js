import mongoose from "mongoose";
import crypto from "crypto";
import { getModel } from "../../../database/hotel/modelFactory.js";
import ApiError from "../../../utils/apiError.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import { asString, escapeRegex, parsePagination } from "../../../utils/query.js";
import { VALID_ORDER_STATUS_TRANSITIONS } from "./restaurant.validation.js";
import { createGuestCharge, voidGuestCharge } from "../guestCharges/guestCharge.service.js";

// =============================================================================
// IDENTIFIER GENERATORS
// =============================================================================

export const generateOrderRef = async (tenantConn) => {
  const RestaurantOrder = await getModel(tenantConn, "RestaurantOrder");
  for (let attempt = 0; attempt < 5; attempt++) {
    const randHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    const candidate = `ORD-${Date.now().toString().slice(-6)}${randHex}`;
    const exists = await RestaurantOrder.findOne({ order_ref: candidate });
    if (!exists) return candidate;
  }
  return `ORD-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
};

export const generateMenuItemSku = async (tenantConn) => {
  const RestaurantMenuItem = await getModel(tenantConn, "RestaurantMenuItem");
  for (let attempt = 0; attempt < 5; attempt++) {
    const randHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    const candidate = `SKU-${Date.now().toString().slice(-6)}${randHex}`;
    const exists = await RestaurantMenuItem.findOne({ sku: candidate });
    if (!exists) return candidate;
  }
  return `SKU-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
};

// =============================================================================
// CATEGORIES SERVICE
// =============================================================================

export const createCategory = async (tenantConn, data) => {
  const RestaurantCategory = await getModel(tenantConn, "RestaurantCategory");
  const trimmedName = data.name.trim();

  const existing = await RestaurantCategory.findOne({
    name: new RegExp(`^${escapeRegex(trimmedName)}$`, "i"),
  });
  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, `Category '${trimmedName}' already exists`);
  }

  const category = await RestaurantCategory.create({
    name: trimmedName,
    description: data.description ? data.description.trim() : "",
    status: data.status || "ACTIVE",
    display_order: data.display_order !== undefined ? data.display_order : 0,
  });

  return category;
};

export const getCategories = async (tenantConn, query = {}) => {
  const RestaurantCategory = await getModel(tenantConn, "RestaurantCategory");
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    filter.name = { $regex: escapeRegex(query.search.trim()), $options: "i" };
  }

  const categories = await RestaurantCategory.find(filter).sort({
    display_order: 1,
    name: 1,
  });

  return categories;
};

export const getCategoryById = async (tenantConn, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Category ID format");
  }

  const RestaurantCategory = await getModel(tenantConn, "RestaurantCategory");
  const category = await RestaurantCategory.findById(id);

  if (!category) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Category not found");
  }

  return category;
};

export const updateCategory = async (tenantConn, id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Category ID format");
  }

  const RestaurantCategory = await getModel(tenantConn, "RestaurantCategory");
  const category = await RestaurantCategory.findById(id);

  if (!category) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Category not found");
  }

  if (data.name && data.name.trim() !== category.name) {
    const trimmedName = data.name.trim();
    const existing = await RestaurantCategory.findOne({
      _id: { $ne: id },
      name: new RegExp(`^${escapeRegex(trimmedName)}$`, "i"),
    });
    if (existing) {
      throw new ApiError(HTTP_STATUS.CONFLICT, `Category '${trimmedName}' already exists`);
    }
    category.name = trimmedName;
  }

  if (data.description !== undefined) category.description = data.description.trim();
  if (data.status !== undefined) category.status = data.status;
  if (data.display_order !== undefined) category.display_order = data.display_order;

  await category.save();
  return category;
};

export const deleteCategory = async (tenantConn, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Category ID format");
  }

  const RestaurantCategory = await getModel(tenantConn, "RestaurantCategory");
  const category = await RestaurantCategory.findById(id);

  if (!category) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Category not found");
  }

  const RestaurantMenuItem = await getModel(tenantConn, "RestaurantMenuItem");
  const itemCount = await RestaurantMenuItem.countDocuments({ category_id: id });

  if (itemCount > 0) {
    category.status = "INACTIVE";
    await category.save();
    return { deactivation: true, message: "Category has existing menu items and was deactivated instead of deleted" };
  }

  await RestaurantCategory.findByIdAndDelete(id);
  return { deleted: true };
};

// =============================================================================
// MENU ITEMS SERVICE
// =============================================================================

export const createMenuItem = async (tenantConn, data) => {
  const RestaurantCategory = await getModel(tenantConn, "RestaurantCategory");
  const RestaurantMenuItem = await getModel(tenantConn, "RestaurantMenuItem");

  if (!mongoose.Types.ObjectId.isValid(data.category_id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Category ID format");
  }

  const category = await RestaurantCategory.findById(data.category_id);
  if (!category) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Category does not exist in this hotel");
  }

  let finalSku = data.sku ? data.sku.trim().toUpperCase() : "";
  if (finalSku) {
    const existing = await RestaurantMenuItem.findOne({ sku: finalSku });
    if (existing) {
      throw new ApiError(HTTP_STATUS.CONFLICT, `Menu item with SKU '${finalSku}' already exists`);
    }
  } else {
    finalSku = await generateMenuItemSku(tenantConn);
  }

  const menuItem = await RestaurantMenuItem.create({
    sku: finalSku,
    category_id: category._id,
    name: data.name.trim(),
    description: data.description ? data.description.trim() : "",
    price: data.price,
    currency: data.currency ? data.currency.trim().toUpperCase() : "PKR",
    is_available: data.is_available !== undefined ? data.is_available : true,
    dietary_flags: Array.isArray(data.dietary_flags) ? data.dietary_flags : [],
    status: data.status || "ACTIVE",
  });

  return menuItem;
};

export const getMenuItems = async (tenantConn, query = {}) => {
  const RestaurantMenuItem = await getModel(tenantConn, "RestaurantMenuItem");
  const filter = {};

  if (query.category_id) {
    if (!mongoose.Types.ObjectId.isValid(query.category_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Category ID format");
    }
    filter.category_id = query.category_id;
  }

  if (query.is_available !== undefined) {
    filter.is_available = query.is_available === true || query.is_available === "true";
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.dietary) {
    filter.dietary_flags = query.dietary.trim().toUpperCase();
  }

  if (query.search) {
    const s = escapeRegex(query.search.trim());
    filter.$or = [
      { name: { $regex: s, $options: "i" } },
      { description: { $regex: s, $options: "i" } },
      { sku: { $regex: s, $options: "i" } },
    ];
  }

  const { page, limit, skip } = parsePagination(query);

  const [items, total] = await Promise.all([
    RestaurantMenuItem.find(filter)
      .populate("category_id", "name status display_order")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit),
    RestaurantMenuItem.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getMenuItemById = async (tenantConn, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Menu Item ID format");
  }

  const RestaurantMenuItem = await getModel(tenantConn, "RestaurantMenuItem");
  const menuItem = await RestaurantMenuItem.findById(id).populate("category_id", "name status display_order");

  if (!menuItem) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Menu item not found");
  }

  return menuItem;
};

export const updateMenuItem = async (tenantConn, id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Menu Item ID format");
  }

  const RestaurantMenuItem = await getModel(tenantConn, "RestaurantMenuItem");
  const menuItem = await RestaurantMenuItem.findById(id);

  if (!menuItem) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Menu item not found");
  }

  if (data.category_id && data.category_id.toString() !== menuItem.category_id.toString()) {
    if (!mongoose.Types.ObjectId.isValid(data.category_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Category ID format");
    }
    const RestaurantCategory = await getModel(tenantConn, "RestaurantCategory");
    const category = await RestaurantCategory.findById(data.category_id);
    if (!category) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Category does not exist in this hotel");
    }
    menuItem.category_id = category._id;
  }

  if (data.sku && data.sku.trim().toUpperCase() !== menuItem.sku) {
    const newSku = data.sku.trim().toUpperCase();
    const existing = await RestaurantMenuItem.findOne({ _id: { $ne: id }, sku: newSku });
    if (existing) {
      throw new ApiError(HTTP_STATUS.CONFLICT, `Menu item with SKU '${newSku}' already exists`);
    }
    menuItem.sku = newSku;
  }

  if (data.name !== undefined) menuItem.name = data.name.trim();
  if (data.description !== undefined) menuItem.description = data.description.trim();
  if (data.price !== undefined) menuItem.price = data.price;
  if (data.currency !== undefined) menuItem.currency = data.currency.trim().toUpperCase();
  if (data.is_available !== undefined) menuItem.is_available = data.is_available;
  if (data.dietary_flags !== undefined) menuItem.dietary_flags = data.dietary_flags;
  if (data.status !== undefined) menuItem.status = data.status;

  await menuItem.save();
  return menuItem;
};

export const deleteMenuItem = async (tenantConn, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Menu Item ID format");
  }

  const RestaurantMenuItem = await getModel(tenantConn, "RestaurantMenuItem");
  const menuItem = await RestaurantMenuItem.findById(id);

  if (!menuItem) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Menu item not found");
  }

  const RestaurantOrder = await getModel(tenantConn, "RestaurantOrder");
  const referencedInOrders = await RestaurantOrder.findOne({ "items.menu_item_id": id });

  if (referencedInOrders) {
    menuItem.status = "INACTIVE";
    menuItem.is_available = false;
    await menuItem.save();
    return { deactivation: true, message: "Menu item has historical order snapshots and was deactivated instead of deleted" };
  }

  await RestaurantMenuItem.findByIdAndDelete(id);
  return { deleted: true };
};

// =============================================================================
// TABLES SERVICE
// =============================================================================

export const createTable = async (tenantConn, data) => {
  const RestaurantTable = await getModel(tenantConn, "RestaurantTable");
  const tableNumber = data.table_number.trim();

  const existing = await RestaurantTable.findOne({ table_number: tableNumber });
  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, `Table '${tableNumber}' already exists`);
  }

  const table = await RestaurantTable.create({
    table_number: tableNumber,
    capacity: data.capacity,
    location: data.location ? data.location.trim() : "",
    status: data.status || "AVAILABLE",
  });

  return table;
};

export const getTables = async (tenantConn, query = {}) => {
  const RestaurantTable = await getModel(tenantConn, "RestaurantTable");
  const filter = {};

  if (query.status) filter.status = query.status;
  if (query.location) filter.location = { $regex: escapeRegex(query.location.trim()), $options: "i" };

  const tables = await RestaurantTable.find(filter).sort({ table_number: 1 });
  return tables;
};

export const getTableById = async (tenantConn, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Table ID format");
  }

  const RestaurantTable = await getModel(tenantConn, "RestaurantTable");
  const table = await RestaurantTable.findById(id);

  if (!table) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Table not found");
  }

  return table;
};

export const updateTable = async (tenantConn, id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Table ID format");
  }

  const RestaurantTable = await getModel(tenantConn, "RestaurantTable");
  const table = await RestaurantTable.findById(id);

  if (!table) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Table not found");
  }

  if (data.table_number && data.table_number.trim() !== table.table_number) {
    const newNumber = data.table_number.trim();
    const existing = await RestaurantTable.findOne({ _id: { $ne: id }, table_number: newNumber });
    if (existing) {
      throw new ApiError(HTTP_STATUS.CONFLICT, `Table '${newNumber}' already exists`);
    }
    table.table_number = newNumber;
  }

  if (data.capacity !== undefined) table.capacity = data.capacity;
  if (data.location !== undefined) table.location = data.location.trim();
  if (data.status !== undefined) table.status = data.status;

  await table.save();
  return table;
};

export const deleteTable = async (tenantConn, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Table ID format");
  }

  const RestaurantTable = await getModel(tenantConn, "RestaurantTable");
  const table = await RestaurantTable.findById(id);

  if (!table) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Table not found");
  }

  const RestaurantOrder = await getModel(tenantConn, "RestaurantOrder");
  const activeOrder = await RestaurantOrder.findOne({
    table_id: id,
    status: { $in: ["PENDING", "PREPARING", "SERVED"] },
  });

  if (activeOrder) {
    throw new ApiError(HTTP_STATUS.CONFLICT, "Cannot delete table with active orders");
  }

  await RestaurantTable.findByIdAndDelete(id);
  return { deleted: true };
};

// =============================================================================
// ORDERS & POS SERVICE
// =============================================================================

export const createOrder = async (tenantConn, orderData, user) => {
  const RestaurantOrder = await getModel(tenantConn, "RestaurantOrder");
  const RestaurantMenuItem = await getModel(tenantConn, "RestaurantMenuItem");

  if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Order must contain at least one item");
  }

  // 1. Resolve and freeze authoritative item snapshots
  const snapshots = [];
  for (const itemInput of orderData.items) {
    if (!mongoose.Types.ObjectId.isValid(itemInput.menu_item_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Invalid Menu Item ID format: ${itemInput.menu_item_id}`);
    }

    const menuItem = await RestaurantMenuItem.findById(itemInput.menu_item_id);
    if (!menuItem) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Menu item not found in this hotel");
    }

    if (menuItem.status !== "ACTIVE" || !menuItem.is_available) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Menu item '${menuItem.name}' is currently unavailable`);
    }

    const qty = parseInt(itemInput.quantity, 10);
    if (isNaN(qty) || qty < 1) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Quantity for '${menuItem.name}' must be at least 1`);
    }

    const unitPrice = menuItem.price;
    const subtotal = +(unitPrice * qty).toFixed(2);

    snapshots.push({
      menu_item_id: menuItem._id,
      item_name_snapshot: menuItem.name,
      unit_price_snapshot: unitPrice,
      quantity: qty,
      subtotal,
      special_requests: itemInput.special_requests ? itemInput.special_requests.trim() : "",
    });
  }

  // Authoritative total calculation from server-side snapshots
  const totalAmount = +snapshots.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2);

  // 2. Validate referenced table if provided
  let tableDoc = null;
  if (orderData.table_id) {
    if (!mongoose.Types.ObjectId.isValid(orderData.table_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Table ID format");
    }
    const RestaurantTable = await getModel(tenantConn, "RestaurantTable");
    tableDoc = await RestaurantTable.findById(orderData.table_id);
    if (!tableDoc) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Referenced table not found in this hotel");
    }
  }

  // 3. Validate referenced guest if provided
  if (orderData.guest_id) {
    if (!mongoose.Types.ObjectId.isValid(orderData.guest_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Guest ID format");
    }
    const Guest = await getModel(tenantConn, "Guest");
    const guest = await Guest.findById(orderData.guest_id);
    if (!guest) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Referenced guest not found in this hotel");
    }
  }

  // 4. Validate referenced server/employee if provided
  if (orderData.server_id) {
    if (!mongoose.Types.ObjectId.isValid(orderData.server_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Server ID format");
    }
    const Employee = await getModel(tenantConn, "Employee");
    const employee = await Employee.findById(orderData.server_id);
    if (!employee) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Referenced server employee not found in this hotel");
    }
  }

  // 5. Billing boundary: Room Folio vs Walk-in settlement
  const paymentMode = orderData.payment_mode || "ROOM_FOLIO";
  let resolvedFolioId = null;

  if (paymentMode === "ROOM_FOLIO") {
    const Folio = await getModel(tenantConn, "Folio");

    if (orderData.folio_id) {
      if (!mongoose.Types.ObjectId.isValid(orderData.folio_id)) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Folio ID format");
      }
      const folio = await Folio.findById(orderData.folio_id);
      if (!folio) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Folio not found in this hotel");
      }
      if (folio.status !== "OPEN") {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Folio must be active and open for room charges");
      }
      resolvedFolioId = folio._id;
    } else if (orderData.room_number) {
      // Attempt to resolve active open folio from current checked-in stay in this room
      const Room = await getModel(tenantConn, "Room");
      const Stay = await getModel(tenantConn, "Stay");

      const room = await Room.findOne({ room_number: orderData.room_number.trim() });
      if (!room) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Room '${orderData.room_number}' not found in this hotel`);
      }

      const activeStay = await Stay.findOne({ room_id: room._id, status: "CHECKED_IN" });
      if (!activeStay) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, `No checked-in guest stay found for room '${orderData.room_number}'`);
      }

      const activeFolio = await Folio.findOne({ stay_id: activeStay._id, status: "OPEN" });
      if (!activeFolio) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, `No open folio found for stay in room '${orderData.room_number}'`);
      }
      resolvedFolioId = activeFolio._id;
    } else {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Active open folio or room number is required for room folio charges");
    }
  }

  // 6. Idempotency protection: check if order with same idempotency_key exists
  const idempotencyKey = orderData.idempotency_key ? orderData.idempotency_key.trim() : null;
  if (idempotencyKey) {
    const existing = await RestaurantOrder.findOne({ idempotency_key: idempotencyKey });
    if (existing) {
      return existing;
    }
  }

  // 7. Generate collision-free order ref
  const orderRef = await generateOrderRef(tenantConn);

  // 8. Persist canonical RestaurantOrder
  const orderDocToCreate = {
    order_ref: orderRef,
    table_id: tableDoc ? tableDoc._id : null,
    guest_id: orderData.guest_id || null,
    folio_id: resolvedFolioId,
    server_id: orderData.server_id || null,
    customer_name: orderData.customer_name ? orderData.customer_name.trim() : "",
    room_number: orderData.room_number ? orderData.room_number.trim() : "",
    payment_mode: paymentMode,
    notes: orderData.notes ? orderData.notes.trim() : "",
    status: "PENDING",
    total_amount: totalAmount,
    items: snapshots,
  };
  if (idempotencyKey) {
    orderDocToCreate.idempotency_key = idempotencyKey;
  }
  const newOrder = await RestaurantOrder.create(orderDocToCreate);

  // 9. If ROOM_FOLIO, post authoritative GuestCharge directly to Billing with rollback safeguard
  if (paymentMode === "ROOM_FOLIO" && resolvedFolioId) {
    try {
      await createGuestCharge(tenantConn, {
        folio_id: resolvedFolioId.toString(),
        charge_type: "RESTAURANT",
        description: `Restaurant Order ${orderRef}`,
        amount: totalAmount,
        reference_id: newOrder._id,
      });
    } catch (chargeErr) {
      // Rollback persisted order to guarantee financial consistency
      await RestaurantOrder.findByIdAndDelete(newOrder._id);
      throw chargeErr;
    }
  }

  return newOrder;
};

export const getOrders = async (tenantConn, query = {}) => {
  const RestaurantOrder = await getModel(tenantConn, "RestaurantOrder");
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.table_id) {
    if (!mongoose.Types.ObjectId.isValid(query.table_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Table ID format");
    }
    filter.table_id = query.table_id;
  }

  if (query.folio_id) {
    if (!mongoose.Types.ObjectId.isValid(query.folio_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Folio ID format");
    }
    filter.folio_id = query.folio_id;
  }

  if (query.room_number) {
    filter.room_number = query.room_number.trim();
  }

  if (query.start_date || query.end_date) {
    filter.created_at = {};
    if (query.start_date) filter.created_at.$gte = new Date(query.start_date);
    if (query.end_date) filter.created_at.$lte = new Date(query.end_date);
  }

  if (query.search) {
    const s = escapeRegex(query.search.trim());
    filter.$or = [
      { order_ref: { $regex: s, $options: "i" } },
      { customer_name: { $regex: s, $options: "i" } },
      { room_number: { $regex: s, $options: "i" } },
    ];
  }

  const { page, limit, skip } = parsePagination(query);

  const [orders, total] = await Promise.all([
    RestaurantOrder.find(filter)
      .populate("table_id", "table_number location capacity status")
      .populate("guest_id", "first_name last_name email phone")
      .populate("folio_id", "folio_ref status total_charges")
      .populate("server_id", "first_name last_name employee_ref")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit),
    RestaurantOrder.countDocuments(filter),
  ]);

  return {
    orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getOrderById = async (tenantConn, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Order ID format");
  }

  const RestaurantOrder = await getModel(tenantConn, "RestaurantOrder");
  const order = await RestaurantOrder.findById(id)
    .populate("table_id", "table_number location capacity status")
    .populate("guest_id", "first_name last_name email phone")
    .populate("folio_id", "folio_ref status total_charges")
    .populate("server_id", "first_name last_name employee_ref")
    .populate("items.menu_item_id", "name sku price currency");

  if (!order) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Restaurant order not found");
  }

  return order;
};

export const updateOrderStatus = async (tenantConn, id, newStatus, user, notes) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Order ID format");
  }

  const RestaurantOrder = await getModel(tenantConn, "RestaurantOrder");
  const order = await RestaurantOrder.findById(id);

  if (!order) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Restaurant order not found");
  }

  // 1. Terminal state protection
  if (order.status === "COMPLETED" || order.status === "CANCELLED") {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Cannot modify an order in terminal state '${order.status}'`
    );
  }

  // 2. Validate canonical state machine transition
  const allowed = VALID_ORDER_STATUS_TRANSITIONS[order.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Invalid order status transition from '${order.status}' to '${newStatus}'`
    );
  }

  // 3. Handle terminal settlements & cancellations
  const updateFields = { status: newStatus };
  if (newStatus === "COMPLETED") {
    updateFields.settled_at = new Date();
  }

  if (newStatus === "CANCELLED") {
    // If order had a room folio charge, void the corresponding GuestCharge using the canonical Billing service
    if (order.payment_mode === "ROOM_FOLIO" && order.folio_id) {
      const GuestCharge = await getModel(tenantConn, "GuestCharge");
      const charges = await GuestCharge.find({ reference_id: order._id, is_voided: false });
      for (const charge of charges) {
        await voidGuestCharge(tenantConn, charge._id);
      }
    }
  }

  if (notes) {
    updateFields.notes = order.notes ? `${order.notes} | ${notes.trim()}` : notes.trim();
  }

  // 4. Atomic conditional progression guard against concurrent race conditions
  const updatedOrder = await RestaurantOrder.findOneAndUpdate(
    { _id: id, status: order.status },
    { $set: updateFields },
    { new: true }
  );

  if (!updatedOrder) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      "Order status was concurrently modified by another request. Please refresh and retry."
    );
  }

  return updatedOrder;
};

export const deleteOrder = async (tenantConn, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Order ID format");
  }

  const RestaurantOrder = await getModel(tenantConn, "RestaurantOrder");
  const order = await RestaurantOrder.findById(id);

  if (!order) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Restaurant order not found");
  }

  // Terminal completed/cancelled orders cannot be deleted
  if (order.status === "COMPLETED") {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Completed historical orders cannot be deleted");
  }

  if (order.status === "CANCELLED") {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Cancelled historical orders cannot be deleted");
  }

  if (order.status === "SERVED") {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Served orders cannot be deleted; complete or adjust them");
  }

  // Prohibit physical deletion of active/pending orders to preserve audit trail
  throw new ApiError(
    HTTP_STATUS.BAD_REQUEST,
    "Physical deletion of restaurant orders is prohibited for audit integrity. Please cancel the order via status update."
  );
};
