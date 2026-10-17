import mongoose from "mongoose";
import crypto from "crypto";
import { getModel } from "../../../database/hotel/modelFactory.js";
import ApiError from "../../../utils/apiError.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import { asString, escapeRegex, parsePagination } from "../../../utils/query.js";

const PROTECTED_FIELDS = [
  "_id",
  "hotelId",
  "tenantId",
  "created_at",
  "updated_at",
  "__v",
];

const stripProtected = (data) => {
  const clean = { ...data };
  for (const k of PROTECTED_FIELDS) delete clean[k];
  return clean;
};

const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

/**
 * Generates a unique incident reference code for the tenant (e.g. INC-20261007-AB12)
 */
export const generateIncidentRef = async (tenantConn) => {
  const InventoryIncident = await getModel(tenantConn, "InventoryIncident");
  const dateStr = getLocalDateString();

  for (let attempt = 0; attempt < 5; attempt++) {
    const randomHex = crypto.randomBytes(2).toString("hex").toUpperCase();
    const candidateRef = `INC-${dateStr}-${randomHex}`;
    const exists = await InventoryIncident.findOne({ incident_ref: candidateRef });
    if (!exists) {
      return candidateRef;
    }
  }

  const fallbackHex = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `INC-${dateStr}-${fallbackHex}`;
};

// =============================================================================
// INVENTORY ITEM CRUD & QUERIES
// =============================================================================

/**
 * Creates a new inventory item with tenant uniqueness and canonical room link validation.
 */
export const createInventoryItem = async (tenantConn, itemData, user) => {
  const InventoryItem = await getModel(tenantConn, "InventoryItem");
  const data = stripProtected(itemData);

  // Check unique SKU within tenant
  const existingSku = await InventoryItem.findOne({ sku: data.sku });
  if (existingSku) {
    throw new ApiError(HTTP_STATUS.CONFLICT, `An inventory item with SKU '${data.sku}' already exists`);
  }

  // Canonical room validation if linked to a room
  if (data.room_id) {
    if (!mongoose.Types.ObjectId.isValid(data.room_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid room ID format");
    }
    const Room = await getModel(tenantConn, "Room");
    const room = await Room.findById(data.room_id);
    if (!room) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Referenced room not found");
    }
    data.room_number = room.room_number || data.room_number;
    data.location_type = "ROOM";
  }

  const newItem = new InventoryItem(data);
  await newItem.save();

  // If initial quantity > 0, record initial stock opening movement if recorded_by can be resolved
  if (newItem.quantity > 0) {
    const recordedBy = user?._id || user?.id || null;
    if (recordedBy && mongoose.Types.ObjectId.isValid(recordedBy)) {
      const InventoryMovement = await getModel(tenantConn, "InventoryMovement");
      await InventoryMovement.create({
        item_id: newItem._id,
        movement_type: "PURCHASE",
        quantity: newItem.quantity,
        previous_quantity: 0,
        new_quantity: newItem.quantity,
        recorded_by: recordedBy,
        notes: "Initial stock upon item creation",
      });
    }
  }

  return newItem.toObject();
};

/**
 * Queries inventory items with pagination, category, status, location, and low-stock filters.
 */
export const getInventoryItems = async (tenantConn, query = {}) => {
  const InventoryItem = await getModel(tenantConn, "InventoryItem");
  const { page, limit, skip } = parsePagination(query, { defaultLimit: 20, maxLimit: 100 });

  const filter = {};

  if (query.status) {
    filter.status = asString(query.status);
  }

  if (query.category) {
    filter.category = asString(query.category);
  }

  if (query.location_type) {
    filter.location_type = asString(query.location_type);
  }

  if (query.room_number) {
    const rawR = asString(query.room_number).trim();
    const cleanR = rawR.replace(/^Room\s*/i, "").trim();
    filter.$or = [
      { room_number: rawR },
      { room_number: cleanR },
      { location: new RegExp(`Room\\s*${escapeRegex(cleanR)}`, "i") },
    ];
  }

  if (query.condition) {
    filter.condition = asString(query.condition);
  }

  if (query.low_stock === true || query.low_stock === "true") {
    filter.$expr = { $lte: ["$quantity", "$reorder_level"] };
  }

  if (query.search) {
    const term = asString(query.search);
    if (term) {
      const escaped = escapeRegex(term);
      const regex = new RegExp(escaped, "i");
      filter.$or = [
        { name: regex },
        { sku: regex },
        { category: regex },
        { location: regex },
        { room_number: regex },
        { supplier: regex },
      ];
    }
  }

  const allowedSortFields = [
    "created_at",
    "updated_at",
    "name",
    "sku",
    "category",
    "quantity",
    "reorder_level",
    "unit_cost",
    "status",
  ];
  const sortBy = allowedSortFields.includes(query.sortBy) ? query.sortBy : "created_at";
  const sortOrder = query.sortOrder === "asc" || query.sortOrder === "1" ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const [items, total] = await Promise.all([
    InventoryItem.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("room_id", "room_number room_type_id status")
      .lean(),
    InventoryItem.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Retrieves a single inventory item by ID.
 */
export const getInventoryItemById = async (tenantConn, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid inventory item ID format");
  }

  const InventoryItem = await getModel(tenantConn, "InventoryItem");
  const item = await InventoryItem.findById(id)
    .populate("room_id", "room_number room_type_id status")
    .lean();

  if (!item) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Inventory item not found");
  }

  return item;
};

/**
 * Updates inventory item metadata (disallows direct quantity tampering).
 */
export const updateInventoryItem = async (tenantConn, id, updates) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid inventory item ID format");
  }

  const InventoryItem = await getModel(tenantConn, "InventoryItem");
  const existing = await InventoryItem.findById(id);
  if (!existing) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Inventory item not found");
  }

  const data = stripProtected(updates);
  // Protect stock quantity from direct metadata overwrite
  delete data.quantity;

  if (data.sku && data.sku !== existing.sku) {
    const skuExists = await InventoryItem.findOne({ sku: data.sku, _id: { $ne: id } });
    if (skuExists) {
      throw new ApiError(HTTP_STATUS.CONFLICT, `An inventory item with SKU '${data.sku}' already exists`);
    }
  }

  if (data.room_id) {
    if (!mongoose.Types.ObjectId.isValid(data.room_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid room ID format");
    }
    const Room = await getModel(tenantConn, "Room");
    const room = await Room.findById(data.room_id);
    if (!room) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Referenced room not found");
    }
    data.room_number = room.room_number || data.room_number;
    data.location_type = "ROOM";
  }

  const updated = await InventoryItem.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  )
    .populate("room_id", "room_number room_type_id status")
    .lean();

  return updated;
};

/**
 * Business-safe deactivation of an inventory item.
 */
export const deactivateInventoryItem = async (tenantConn, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid inventory item ID format");
  }

  const InventoryItem = await getModel(tenantConn, "InventoryItem");
  const existing = await InventoryItem.findById(id);
  if (!existing) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Inventory item not found");
  }

  existing.status = "INACTIVE";
  await existing.save();

  return { success: true, message: "Inventory item deactivated successfully" };
};

// =============================================================================
// ATOMIC STOCK ADJUSTMENT & MOVEMENT LEDGER
// =============================================================================

/**
 * Authoritative stock adjustment: mutates InventoryItem atomically and appends an immutable InventoryMovement.
 */
export const adjustStock = async (tenantConn, itemId, adjustmentData, user) => {
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid inventory item ID format");
  }

  const InventoryItem = await getModel(tenantConn, "InventoryItem");
  const item = await InventoryItem.findById(itemId);
  if (!item) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Inventory item not found");
  }

  let adjType = (adjustmentData.adjustment_type || "").toUpperCase();
  if (adjType === "ADD") adjType = "INCREMENT";
  if (adjType === "SUBTRACT") adjType = "DECREMENT";
  const qty = Number(adjustmentData.quantity);

  if (isNaN(qty) || qty < 0) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Adjustment quantity must be a non-negative number");
  }

  let newQuantity;
  let movementQuantity;
  let delta;

  if (adjType === "INCREMENT") {
    if (qty <= 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Increment quantity must be greater than 0");
    }
    delta = qty;
    newQuantity = item.quantity + delta;
    movementQuantity = delta;
  } else if (adjType === "DECREMENT") {
    if (qty <= 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Decrement quantity must be greater than 0");
    }
    if (item.quantity < qty) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        `Insufficient stock: current stock is ${item.quantity}, requested deduction is ${qty}`
      );
    }
    delta = -qty;
    newQuantity = item.quantity - qty;
    movementQuantity = qty;
  } else if (adjType === "SET") {
    const diff = qty - item.quantity;
    if (diff === 0) {
      return { item: item.toObject(), movement: null };
    }
    delta = diff;
    newQuantity = qty;
    movementQuantity = Math.abs(diff);
  } else {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Unsupported adjustment type: ${adjType}`);
  }

  // Atomic database update with concurrency check for deductions
  let updated;
  if (delta < 0) {
    updated = await InventoryItem.findOneAndUpdate(
      { _id: itemId, quantity: { $gte: Math.abs(delta) } },
      { $inc: { quantity: delta } },
      { new: true, runValidators: true }
    );
    if (!updated) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "Stock update conflict: insufficient stock during atomic deduction"
      );
    }
  } else {
    updated = await InventoryItem.findOneAndUpdate(
      { _id: itemId },
      { $inc: { quantity: delta } },
      { new: true, runValidators: true }
    );
  }

  // Resolve movement type
  const VALID_MOVEMENT_TYPES = ["PURCHASE", "TRANSFER", "CONSUMPTION", "LOSS", "ADJUSTMENT"];
  let movementType = "ADJUSTMENT";
  if (adjustmentData.movement_type && VALID_MOVEMENT_TYPES.includes(adjustmentData.movement_type)) {
    movementType = adjustmentData.movement_type;
  } else if (adjustmentData.reason && VALID_MOVEMENT_TYPES.includes(adjustmentData.reason)) {
    movementType = adjustmentData.reason;
  } else if (adjustmentData.reason === "AUDIT" || adjType === "SET") {
    movementType = "ADJUSTMENT";
  } else if (delta > 0) {
    movementType = "PURCHASE";
  } else if (delta < 0) {
    movementType = "CONSUMPTION";
  }

  const recordedBy = adjustmentData.recorded_by || user?._id || user?.id;
  if (!recordedBy || !mongoose.Types.ObjectId.isValid(recordedBy)) {
    // Revert stock update on failure to maintain atomicity in standalone environments
    await InventoryItem.findByIdAndUpdate(itemId, { $inc: { quantity: -delta } });
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "A valid recorded_by user/employee ID is required");
  }

  const InventoryMovement = await getModel(tenantConn, "InventoryMovement");
  let movement;
  try {
    movement = await InventoryMovement.create({
      item_id: itemId,
      movement_type: movementType,
      quantity: movementQuantity,
      previous_quantity: item.quantity,
      new_quantity: updated.quantity,
      recorded_by: recordedBy,
      reference_id: adjustmentData.reference_id || null,
      reference_type: adjustmentData.reference_type || null,
      notes: adjustmentData.notes || null,
      date: adjustmentData.date || new Date(),
    });
  } catch (err) {
    // Atomicity compensation: Revert the InventoryItem.quantity update if movement insertion fails
    await InventoryItem.findByIdAndUpdate(itemId, { $inc: { quantity: -delta } });
    throw err;
  }

  return {
    item: updated.toObject(),
    movement: movement.toObject(),
  };
};

/**
 * Retrieves movement history for a specific inventory item.
 */
export const getItemMovements = async (tenantConn, itemId, query = {}) => {
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid inventory item ID format");
  }

  const InventoryMovement = await getModel(tenantConn, "InventoryMovement");
  const { page, limit, skip } = parsePagination(query, { defaultLimit: 20, maxLimit: 100 });

  const filter = { item_id: itemId };

  if (query.movement_type) {
    filter.movement_type = asString(query.movement_type);
  }

  const [movements, total] = await Promise.all([
    InventoryMovement.find(filter)
      .sort({ date: -1, created_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate("recorded_by", "firstName lastName email role")
      .lean(),
    InventoryMovement.countDocuments(filter),
  ]);

  return {
    movements,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Retrieves global inventory movements across all items.
 */
export const getMovements = async (tenantConn, query = {}) => {
  const InventoryMovement = await getModel(tenantConn, "InventoryMovement");
  const { page, limit, skip } = parsePagination(query, { defaultLimit: 20, maxLimit: 100 });

  const filter = {};

  if (query.item_id && mongoose.Types.ObjectId.isValid(query.item_id)) {
    filter.item_id = query.item_id;
  }

  if (query.movement_type) {
    filter.movement_type = asString(query.movement_type);
  }

  if (query.reference_type) {
    filter.reference_type = asString(query.reference_type);
  }

  const [movements, total] = await Promise.all([
    InventoryMovement.find(filter)
      .sort({ date: -1, created_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate("item_id", "name sku category unit")
      .populate("recorded_by", "firstName lastName email role")
      .lean(),
    InventoryMovement.countDocuments(filter),
  ]);

  return {
    movements,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

// =============================================================================
// INVENTORY INCIDENTS (MISSING / DAMAGED ITEMS & LIFECYCLE RESOLUTION)
// =============================================================================

/**
 * Reports a new missing or damaged inventory incident.
 */
export const createIncident = async (tenantConn, incidentData, user) => {
  const InventoryIncident = await getModel(tenantConn, "InventoryIncident");
  const InventoryItem = await getModel(tenantConn, "InventoryItem");
  const data = stripProtected(incidentData);

  if (!mongoose.Types.ObjectId.isValid(data.item_id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid item ID format");
  }

  const item = await InventoryItem.findById(data.item_id);
  if (!item) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Referenced inventory item not found");
  }

  const reported_by = data.reported_by || user?._id || user?.id;
  if (!reported_by || !mongoose.Types.ObjectId.isValid(reported_by)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Valid reported_by employee/user ID is required");
  }

  if (data.assigned_to && !mongoose.Types.ObjectId.isValid(data.assigned_to)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid assigned_to employee ID format");
  }

  if (data.room_id) {
    if (!mongoose.Types.ObjectId.isValid(data.room_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid room ID format");
    }
    const Room = await getModel(tenantConn, "Room");
    const room = await Room.findById(data.room_id);
    if (!room) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Referenced room not found");
    }
    data.room_number = room.room_number || data.room_number;
  }

  const incident_ref = data.incident_ref || (await generateIncidentRef(tenantConn));
  const unit_loss_value =
    data.unit_loss_value !== undefined ? Number(data.unit_loss_value) : (item.unit_cost || 0);
  const total_loss_value =
    data.total_loss_value !== undefined
      ? Number(data.total_loss_value)
      : unit_loss_value * Number(data.quantity_lost);

  const initialTimeline = [
    {
      action: "REPORTED_MISSING",
      detail: data.description || `Reported ${data.quantity_lost} lost/damaged due to ${data.reason}`,
      timestamp: new Date(),
      user: user?.fullName || "Staff",
      user_id: user?._id || user?.id || null,
    },
  ];

  const newIncident = new InventoryIncident({
    ...data,
    incident_ref,
    reported_by,
    unit_loss_value,
    total_loss_value,
    status: data.status || "REPORTED",
    timeline: initialTimeline,
  });

  await newIncident.save();
  return newIncident.toObject();
};

/**
 * Queries inventory incidents with pagination and filtering.
 */
export const getIncidents = async (tenantConn, query = {}) => {
  const InventoryIncident = await getModel(tenantConn, "InventoryIncident");
  const { page, limit, skip } = parsePagination(query, { defaultLimit: 20, maxLimit: 100 });

  const filter = {};

  if (query.status) {
    filter.status = asString(query.status);
  }

  if (query.reason) {
    filter.reason = asString(query.reason);
  }

  if (query.item_id && mongoose.Types.ObjectId.isValid(query.item_id)) {
    filter.item_id = query.item_id;
  }

  if (query.room_number) {
    filter.room_number = asString(query.room_number);
  }

  if (query.reported_by && mongoose.Types.ObjectId.isValid(query.reported_by)) {
    filter.reported_by = query.reported_by;
  }

  if (query.assigned_to && mongoose.Types.ObjectId.isValid(query.assigned_to)) {
    filter.assigned_to = query.assigned_to;
  }

  if (query.search) {
    const term = asString(query.search);
    if (term) {
      const escaped = escapeRegex(term);
      const regex = new RegExp(escaped, "i");
      filter.$or = [
        { incident_ref: regex },
        { description: regex },
        { room_number: regex },
        { resolution_notes: regex },
      ];
    }
  }

  const allowedSortFields = [
    "created_at",
    "updated_at",
    "date",
    "status",
    "total_loss_value",
    "quantity_lost",
  ];
  const sortBy = allowedSortFields.includes(query.sortBy) ? query.sortBy : "created_at";
  const sortOrder = query.sortOrder === "asc" || query.sortOrder === "1" ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const [incidents, total] = await Promise.all([
    InventoryIncident.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("item_id", "name sku category unit unit_cost")
      .populate("reported_by", "firstName lastName email")
      .populate("assigned_to", "firstName lastName email")
      .populate("room_id", "room_number room_type_id status")
      .lean(),
    InventoryIncident.countDocuments(filter),
  ]);

  return {
    incidents,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Retrieves a single incident by ID.
 */
export const getIncidentById = async (tenantConn, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid incident ID format");
  }

  const InventoryIncident = await getModel(tenantConn, "InventoryIncident");
  const incident = await InventoryIncident.findById(id)
    .populate("item_id", "name sku category unit unit_cost quantity condition location")
    .populate("reported_by", "firstName lastName email")
    .populate("assigned_to", "firstName lastName email")
    .populate("room_id", "room_number room_type_id status")
    .lean();

  if (!incident) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Inventory incident not found");
  }

  return incident;
};

/**
 * Updates incident status, investigation notes, and resolves the incident.
 * If resolution_type === 'WRITTEN_OFF', deducts the lost stock atomically and records an immutable LOSS movement.
 */
export const updateIncident = async (tenantConn, id, updateData, user) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid incident ID format");
  }

  const InventoryIncident = await getModel(tenantConn, "InventoryIncident");
  const incident = await InventoryIncident.findById(id);

  if (!incident) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Inventory incident not found");
  }

  if (incident.status === "RESOLVED" && updateData.status === "RESOLVED") {
    throw new ApiError(HTTP_STATUS.CONFLICT, "Incident is already resolved");
  }

  const data = stripProtected(updateData);

  // Status transitions and lifecycle events
  if (data.status === "INVESTIGATING" && incident.status === "REPORTED") {
    incident.status = "INVESTIGATING";
    incident.timeline.push({
      action: "INVESTIGATION_STARTED",
      detail: data.description || "Investigation started",
      timestamp: new Date(),
      user: user?.fullName || "Staff",
      user_id: user?._id || user?.id || null,
    });
  }

  if (data.status === "RESOLVED") {
    const resolutionType = data.resolution_type || incident.resolution_type;
    if (!resolutionType || !["RECOVERED", "REPLACED", "WRITTEN_OFF"].includes(resolutionType)) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Resolving an incident requires a valid resolution_type: 'RECOVERED', 'REPLACED', or 'WRITTEN_OFF'"
      );
    }

    const resolutionNotes = data.resolution_notes || incident.resolution_notes || `Incident resolved as ${resolutionType}`;
    const resolutionDate = data.resolution_date || new Date();

    const timelineEntry = {
      action: `RESOLVED_${resolutionType}`,
      detail: resolutionNotes,
      timestamp: new Date(),
      user: user?.fullName || "Staff",
      user_id: user?._id || user?.id || null,
    };

    // ATOMIC RACE-SAFE CONDITIONAL TRANSITION:
    // Only transition from REPORTED or INVESTIGATING to RESOLVED.
    // If concurrent requests attempt to resolve, only ONE succeeds here.
    const claimedIncident = await InventoryIncident.findOneAndUpdate(
      {
        _id: id,
        status: { $in: ["REPORTED", "INVESTIGATING"] },
      },
      {
        $set: {
          status: "RESOLVED",
          resolution_type: resolutionType,
          resolution_notes: resolutionNotes,
          resolution_date: resolutionDate,
        },
        $push: {
          timeline: timelineEntry,
        },
      },
      { new: true, runValidators: true }
    );

    if (!claimedIncident) {
      // Check if already resolved by another concurrent request
      const currentCheck = await InventoryIncident.findById(id);
      if (!currentCheck) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Inventory incident not found");
      }
      if (currentCheck.status === "RESOLVED") {
        throw new ApiError(HTTP_STATUS.CONFLICT, "Incident is already resolved");
      }
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Cannot resolve incident with status ${currentCheck.status}`);
    }

    // If written off as permanent loss, deduct stock exactly once
    if (resolutionType === "WRITTEN_OFF") {
      try {
        await adjustStock(
          tenantConn,
          claimedIncident.item_id,
          {
            adjustment_type: "DECREMENT",
            quantity: claimedIncident.quantity_lost,
            reason: "LOSS",
            notes: `Written off via incident ${claimedIncident.incident_ref}: ${resolutionNotes}`.trim(),
            recorded_by: user?._id || user?.id || claimedIncident.reported_by,
            reference_id: claimedIncident._id,
            reference_type: "INCIDENT",
          },
          user
        );
      } catch (err) {
        // Roll back the incident resolution if stock deduction fails
        await InventoryIncident.findByIdAndUpdate(id, {
          $set: {
            status: incident.status,
            resolution_type: null,
            resolution_notes: incident.resolution_notes || null,
          },
          $pop: { timeline: 1 },
        });
        throw err;
      }
    }

    return claimedIncident.toObject();
  }

  if (data.timeline_entry) {
    incident.timeline.push({
      ...data.timeline_entry,
      timestamp: new Date(),
    });
  }

  if (data.assigned_to !== undefined) incident.assigned_to = data.assigned_to;
  if (data.description !== undefined) incident.description = data.description;
  if (data.resolution_notes !== undefined) incident.resolution_notes = data.resolution_notes;

  await incident.save();
  return incident.toObject();
};
