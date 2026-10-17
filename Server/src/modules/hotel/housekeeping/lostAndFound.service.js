import mongoose from "mongoose";
import crypto from "crypto";
import { getModel } from "../../../database/hotel/modelFactory.js";
import ApiError from "../../../utils/apiError.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import { parsePagination } from "../../../utils/query.js";

const VALID_TRANSITIONS = {
  REPORTED: ["REPORTED", "CLAIMED", "DISCARDED", "DONATED"],
  CLAIMED: ["CLAIMED"], // Terminal custody
  DISCARDED: ["DISCARDED"], // Terminal disposal
  DONATED: ["DONATED"], // Terminal donation
};

const generateReferenceNumber = async (LostFoundItem) => {
  let isUnique = false;
  let ref = "";
  while (!isUnique) {
    const randHex = crypto.randomBytes(2).toString("hex").toUpperCase();
    const timeSlice = Date.now().toString().slice(-6);
    ref = `LF-${timeSlice}${randHex}`;
    const existing = await LostFoundItem.findOne({ reference_number: ref });
    if (!existing) {
      isUnique = true;
    }
  }
  return ref;
};

export const createItem = async (tenantConn, itemData) => {
  const LostFoundItem = await getModel(tenantConn, "LostFoundItem");
  const Employee = await getModel(tenantConn, "Employee");

  let reference_number = itemData.reference_number;
  if (reference_number) {
    const existing = await LostFoundItem.findOne({ reference_number });
    if (existing) {
      throw new ApiError(HTTP_STATUS.CONFLICT, "Reference number already exists in this hotel");
    }
  } else {
    reference_number = await generateReferenceNumber(LostFoundItem);
  }

  if (itemData.found_by) {
    if (!mongoose.Types.ObjectId.isValid(itemData.found_by)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Employee ID format");
    }
    const employee = await Employee.findById(itemData.found_by);
    if (!employee) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Employee not found in this hotel");
    }
  }

  const payload = {
    ...itemData,
    reference_number,
    item_name: itemData.item_name || itemData.item_type,
    is_deleted: false,
    status: itemData.status || "REPORTED",
  };

  if (payload.status === "CLAIMED" && !payload.claimed_date) {
    payload.claimed_date = new Date();
  }

  const item = new LostFoundItem(payload);
  await item.save();

  if (item.found_by) {
    await item.populate("found_by", "first_name last_name employee_ref email phone");
  }

  return item;
};

export const getItems = async (tenantConn, query = {}) => {
  const LostFoundItem = await getModel(tenantConn, "LostFoundItem");
  const filter = { is_deleted: { $ne: true } };

  if (query.status) {
    filter.status = query.status.toUpperCase();
  }

  if (query.item_type) {
    filter.item_type = { $regex: query.item_type, $options: "i" };
  }

  if (query.found_location) {
    filter.found_location = { $regex: query.found_location, $options: "i" };
  }

  if (query.reference_number) {
    filter.reference_number = { $regex: query.reference_number, $options: "i" };
  }

  if (query.found_by) {
    if (mongoose.Types.ObjectId.isValid(query.found_by)) {
      filter.found_by = query.found_by;
    }
  }

  if (query.search || query.q) {
    const searchTerm = query.search || query.q;
    const regex = { $regex: searchTerm, $options: "i" };
    filter.$or = [
      { reference_number: regex },
      { item_type: regex },
      { item_name: regex },
      { description: regex },
      { found_location: regex },
      { finder_name: regex },
      { claimed_by: regex },
    ];
  }

  if (query.found_date || query.date) {
    const targetDate = new Date(query.found_date || query.date);
    if (!isNaN(targetDate.getTime())) {
      const startOfDay = new Date(targetDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      filter.found_date = { $gte: startOfDay, $lte: endOfDay };
    }
  } else if (query.start_date || query.end_date) {
    filter.found_date = {};
    if (query.start_date) {
      filter.found_date.$gte = new Date(query.start_date);
    }
    if (query.end_date) {
      const end = new Date(query.end_date);
      end.setUTCHours(23, 59, 59, 999);
      filter.found_date.$lte = end;
    }
  }

  const { page, limit, skip } = parsePagination(query);

  const [items, total] = await Promise.all([
    LostFoundItem.find(filter)
      .populate("found_by", "first_name last_name employee_ref email phone")
      .sort({ found_date: -1, created_at: -1 })
      .skip(skip)
      .limit(limit),
    LostFoundItem.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getItemById = async (tenantConn, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Item ID format");
  }

  const LostFoundItem = await getModel(tenantConn, "LostFoundItem");
  const item = await LostFoundItem.findOne({ _id: id, is_deleted: { $ne: true } })
    .populate("found_by", "first_name last_name employee_ref email phone");

  if (!item) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Lost & Found item not found");
  }

  return item;
};

export const updateItem = async (tenantConn, id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Item ID format");
  }

  const LostFoundItem = await getModel(tenantConn, "LostFoundItem");
  const Employee = await getModel(tenantConn, "Employee");

  const item = await LostFoundItem.findOne({ _id: id, is_deleted: { $ne: true } });
  if (!item) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Lost & Found item not found");
  }

  if (updateData.found_by) {
    if (!mongoose.Types.ObjectId.isValid(updateData.found_by)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Employee ID format");
    }
    const employee = await Employee.findById(updateData.found_by);
    if (!employee) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Employee not found in this hotel");
    }
  }

  // Lifecycle transition enforcement
  if (updateData.status && updateData.status !== item.status) {
    const allowed = VALID_TRANSITIONS[item.status] || [];
    if (!allowed.includes(updateData.status)) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `Invalid status transition from ${item.status} to ${updateData.status}`
      );
    }
  }

  if (updateData.status === "CLAIMED") {
    if (!updateData.claimed_date && !item.claimed_date) {
      updateData.claimed_date = new Date();
    }
  }

  if (updateData.item_name && !updateData.item_type) {
    updateData.item_type = updateData.item_name;
  }

  Object.assign(item, updateData);
  await item.save();

  if (item.found_by) {
    await item.populate("found_by", "first_name last_name employee_ref email phone");
  }

  return item;
};

export const deleteItem = async (tenantConn, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Item ID format");
  }

  const LostFoundItem = await getModel(tenantConn, "LostFoundItem");
  const item = await LostFoundItem.findOne({ _id: id, is_deleted: { $ne: true } });
  if (!item) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Lost & Found item not found");
  }

  item.is_deleted = true;
  await item.save();

  return { message: "Lost & Found item deleted successfully" };
};
