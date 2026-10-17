import mongoose from "mongoose";
import crypto from "crypto";
import { getModel } from "../../../database/hotel/modelFactory.js";
import ApiError from "../../../utils/apiError.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import { asString, escapeRegex, parsePagination } from "../../../utils/query.js";

const generateRecordRef = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randHex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `PRK-${dateStr}-${randHex}`;
};

/**
 * Optional default parking spaces seeder (no-op by default so fresh hotels start clean).
 */
export const ensureDefaultSpaces = async (_tenantConn) => {
  // Fresh hotel starts with clean parking configuration (0 spaces)
  return;
};

/**
 * Get all parking spaces, sorted naturally by space_number.
 */
export const getParkingSpaces = async (tenantConn) => {
  const ParkingSpace = await getModel(tenantConn, "ParkingSpace");

  const spaces = await ParkingSpace.find().sort({ space_number: 1 });
  return spaces.sort((a, b) =>
    a.space_number.localeCompare(b.space_number, undefined, {
      numeric: true,
      sensitivity: "base",
    })
  );
};

/**
 * Create a new parking space.
 */
export const createParkingSpace = async (tenantConn, data) => {
  const ParkingSpace = await getModel(tenantConn, "ParkingSpace");
  const spaceNumber = data.space_number.trim().toUpperCase();

  const existing = await ParkingSpace.findOne({ space_number: spaceNumber });
  if (existing) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      `Parking space ${spaceNumber} already exists`
    );
  }

  const space = await ParkingSpace.create({
    space_number: spaceNumber,
    location: data.location || "Main Lot",
    is_accessible: Boolean(data.is_accessible),
    vehicle_type_allowed: data.vehicle_type_allowed || "ANY",
    status: data.status || "AVAILABLE",
  });

  return space;
};

/**
 * Update space status (e.g. AVAILABLE, BLOCKED, MAINTENANCE).
 */
export const updateParkingSpaceStatus = async (tenantConn, spaceIdOrNumber, newStatus) => {
  const ParkingSpace = await getModel(tenantConn, "ParkingSpace");

  let query = {};
  if (mongoose.Types.ObjectId.isValid(spaceIdOrNumber)) {
    query = { _id: spaceIdOrNumber };
  } else {
    query = { space_number: spaceIdOrNumber.trim().toUpperCase() };
  }

  const space = await ParkingSpace.findOne(query);
  if (!space) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Parking space not found");
  }

  const normalizedStatus = newStatus.toUpperCase();

  if (space.status === "OCCUPIED" && normalizedStatus !== "OCCUPIED") {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Cannot change status of space ${space.space_number} while it is currently occupied`
    );
  }

  space.status = normalizedStatus;
  await space.save();
  return space;
};

/**
 * Delete a parking space (blocked if currently occupied).
 */
export const deleteParkingSpace = async (tenantConn, spaceIdOrNumber) => {
  const ParkingSpace = await getModel(tenantConn, "ParkingSpace");

  let query = {};
  if (mongoose.Types.ObjectId.isValid(spaceIdOrNumber)) {
    query = { _id: spaceIdOrNumber };
  } else {
    query = { space_number: spaceIdOrNumber.trim().toUpperCase() };
  }

  const space = await ParkingSpace.findOne(query);
  if (!space) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Parking space not found");
  }

  if (space.status === "OCCUPIED") {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Cannot delete space ${space.space_number} because it is currently occupied`
    );
  }

  await ParkingSpace.findByIdAndDelete(space._id);
  return { success: true, message: `Space ${space.space_number} deleted` };
};

/**
 * Helper to parse entry date and time into a Date object.
 */
const parseDateTime = (dateStr, timeStr, defaultDate = new Date()) => {
  if (!dateStr && !timeStr) return defaultDate;
  const d = dateStr || new Date().toISOString().split("T")[0];
  const t = timeStr || "00:00";
  const parsed = new Date(`${d}T${t}`);
  return isNaN(parsed.getTime()) ? defaultDate : parsed;
};

/**
 * Get parking records with filters, search, and pagination.
 */
export const getParkingRecords = async (tenantConn, query = {}) => {
  const ParkingRecord = await getModel(tenantConn, "ParkingRecord");

  const filter = {};

  // Status filter
  const status = asString(query.status);
  if (status && status.toUpperCase() !== "ALL") {
    if (status.toUpperCase() === "PARKED") filter.status = "PARKED";
    else if (
      status.toUpperCase() === "EXITED" ||
      status.toLowerCase() === "checked out"
    )
      filter.status = "EXITED";
  }

  // Payment status filter
  const paymentStatus = asString(query.payment_status || query.paymentStatus);
  if (paymentStatus && paymentStatus.toUpperCase() !== "ALL") {
    filter.payment_status =
      paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1).toLowerCase();
  }

  // Vehicle type filter
  const vehicleType = asString(query.vehicle_type || query.carType);
  if (vehicleType && vehicleType.toUpperCase() !== "ALL") {
    filter.vehicle_type = vehicleType;
  }

  // Search query (car plate, guest name, room number)
  const search = asString(query.search || query.q);
  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    filter.$or = [
      { vehicle_plate: regex },
      { guest_name: regex },
      { room_number: regex },
      { vehicle_model: regex },
    ];
  }

  // Date period filtering
  const datePeriod = asString(query.date_period || query.datePeriod);
  if (datePeriod && datePeriod.toUpperCase() !== "ALL TIME") {
    const now = new Date();
    if (datePeriod.toLowerCase() === "daily") {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      filter.entry_time = { $gte: startOfDay, $lte: endOfDay };
    } else if (datePeriod.toLowerCase() === "weekly") {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filter.entry_time = { $gte: oneWeekAgo };
    } else if (datePeriod.toLowerCase() === "monthly") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filter.entry_time = { $gte: startOfMonth };
    } else if (datePeriod.toLowerCase() === "yearly") {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      filter.entry_time = { $gte: startOfYear };
    }
  }

  const { page, limit, skip } = parsePagination(query, { defaultLimit: 50 });

  const records = await ParkingRecord.find(filter)
    .populate("space_id", "space_number location status")
    .populate("guest_id", "first_name last_name email phone")
    .sort({ entry_time: -1, _id: -1 })
    .skip(skip)
    .limit(limit);

  const total = await ParkingRecord.countDocuments(filter);

  return {
    records,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

/**
 * Get aggregated parking metrics for dashboard/overview.
 */
export const getParkingMetrics = async (tenantConn) => {
  const ParkingSpace = await getModel(tenantConn, "ParkingSpace");
  const ParkingRecord = await getModel(tenantConn, "ParkingRecord");

  const totalSpaces = await ParkingSpace.countDocuments();
  const parkedCars = await ParkingRecord.countDocuments({ status: "PARKED" });
  const availableSpaces = Math.max(0, totalSpaces - parkedCars);

  // Today's charges
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const todaysRecords = await ParkingRecord.find({
    entry_time: { $gte: startOfDay, $lte: endOfDay },
  });

  const todaysCharges = todaysRecords.reduce(
    (sum, r) => sum + (Number(r.charge_amount) || 0),
    0
  );

  return {
    totalSpaces,
    parkedCars,
    availableSpaces,
    todaysCharges,
  };
};

/**
 * Get parking record by ID.
 */
export const getParkingRecordById = async (tenantConn, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Parking Record ID");
  }

  const ParkingRecord = await getModel(tenantConn, "ParkingRecord");
  const record = await ParkingRecord.findById(id)
    .populate("space_id", "space_number location status")
    .populate("guest_id", "first_name last_name email phone");

  if (!record) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Parking record not found");
  }

  return record;
};

/**
 * Resolve parking space from payload (accepts space_id or space_number/parkingSpace).
 */
const resolveSpace = async (ParkingSpace, data) => {
  const identifier =
    data.space_id || data.space_number || data.parkingSpace;

  if (!identifier) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Parking space is required");
  }

  let space = null;
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    space = await ParkingSpace.findById(identifier);
  }
  if (!space) {
    space = await ParkingSpace.findOne({
      space_number: String(identifier).trim().toUpperCase(),
    });
  }

  if (!space) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      `Parking space '${identifier}' does not exist`
    );
  }

  return space;
};

/**
 * Create parking record (car entry check-in).
 */
export const createParkingRecord = async (tenantConn, data) => {
  const ParkingSpace = await getModel(tenantConn, "ParkingSpace");
  const ParkingRecord = await getModel(tenantConn, "ParkingRecord");

  const space = await resolveSpace(ParkingSpace, data);

  if (space.status !== "AVAILABLE") {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Parking space ${space.space_number} is currently ${space.status} and cannot be assigned`
    );
  }

  const vehiclePlate = (data.vehicle_plate || data.carNumber || "").trim().toUpperCase();
  if (!vehiclePlate) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Car number / license plate is required");
  }

  // Prevent duplicate parked car with same plate
  const activeRecord = await ParkingRecord.findOne({
    vehicle_plate: vehiclePlate,
    status: "PARKED",
  });
  if (activeRecord) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      `Vehicle ${vehiclePlate} is already parked in space ${activeRecord.space_id}`
    );
  }

  const entryTime = data.entry_time
    ? new Date(data.entry_time)
    : parseDateTime(data.entryDate, data.entryTime);

  const recordRef = generateRecordRef();

  const record = await ParkingRecord.create({
    record_ref: recordRef,
    space_id: space._id,
    guest_id: data.guest_id && mongoose.Types.ObjectId.isValid(data.guest_id) ? data.guest_id : undefined,
    guest_name: (data.guest_name || data.guestName || "").trim(),
    room_number: (data.room_number || data.roomNumber || "").trim(),
    vehicle_plate: vehiclePlate,
    vehicle_model: (data.vehicle_model || "").trim(),
    vehicle_type: data.vehicle_type || data.carType || "Sedan",
    entry_time: entryTime,
    charge_type: data.charge_type || data.chargeType || "Free",
    charge_amount: Number(data.charge_amount ?? data.chargeAmount ?? 0),
    payment_status: data.payment_status || data.paymentStatus || "Pending",
    car_image: data.car_image || data.carImage || "",
    status: "PARKED",
  });

  // Mark space occupied
  space.status = "OCCUPIED";
  await space.save();

  return ParkingRecord.findById(record._id).populate("space_id", "space_number location status");
};

/**
 * Update parking record (handles space re-assignment).
 */
export const updateParkingRecord = async (tenantConn, id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Parking Record ID");
  }

  const ParkingSpace = await getModel(tenantConn, "ParkingSpace");
  const ParkingRecord = await getModel(tenantConn, "ParkingRecord");

  const record = await ParkingRecord.findById(id);
  if (!record) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Parking record not found");
  }

  // Check if space reassignment requested
  const newSpaceIdentifier = data.space_id || data.space_number || data.parkingSpace;
  if (newSpaceIdentifier) {
    const newSpace = await resolveSpace(ParkingSpace, data);

    if (String(newSpace._id) !== String(record.space_id)) {
      if (newSpace.status !== "AVAILABLE") {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          `New parking space ${newSpace.space_number} is currently ${newSpace.status}`
        );
      }

      // Free old space if this record is currently parked
      if (record.status === "PARKED") {
        const oldSpace = await ParkingSpace.findById(record.space_id);
        if (oldSpace) {
          oldSpace.status = "AVAILABLE";
          await oldSpace.save();
        }

        newSpace.status = "OCCUPIED";
        await newSpace.save();
      }

      record.space_id = newSpace._id;
    }
  }

  if (data.vehicle_plate || data.carNumber) {
    record.vehicle_plate = (data.vehicle_plate || data.carNumber).trim().toUpperCase();
  }
  if (data.guest_name !== undefined || data.guestName !== undefined) {
    record.guest_name = (data.guest_name ?? data.guestName ?? "").trim();
  }
  if (data.room_number !== undefined || data.roomNumber !== undefined) {
    record.room_number = (data.room_number ?? data.roomNumber ?? "").trim();
  }
  if (data.vehicle_type || data.carType) {
    record.vehicle_type = data.vehicle_type || data.carType;
  }
  if (data.vehicle_model !== undefined) {
    record.vehicle_model = data.vehicle_model.trim();
  }
  if (data.charge_type || data.chargeType) {
    record.charge_type = data.charge_type || data.chargeType;
  }
  if (data.charge_amount !== undefined || data.chargeAmount !== undefined) {
    record.charge_amount = Number(data.charge_amount ?? data.chargeAmount ?? 0);
  }
  if (data.payment_status || data.paymentStatus) {
    record.payment_status = data.payment_status || data.paymentStatus;
  }
  if (data.car_image !== undefined || data.carImage !== undefined) {
    record.car_image = data.car_image ?? data.carImage ?? "";
  }
  if (data.entry_time) {
    record.entry_time = new Date(data.entry_time);
  } else if (data.entryDate || data.entryTime) {
    record.entry_time = parseDateTime(data.entryDate, data.entryTime, record.entry_time);
  }
  if (data.exit_time) {
    record.exit_time = new Date(data.exit_time);
  } else if (data.exitDate || data.exitTime) {
    record.exit_time = parseDateTime(data.exitDate, data.exitTime, record.exit_time);
  }
  if (data.status) {
    const norm = data.status.toUpperCase() === "CHECKED OUT" ? "EXITED" : data.status.toUpperCase();
    record.status = norm;
  }

  await record.save();
  return ParkingRecord.findById(record._id).populate("space_id", "space_number location status");
};

/**
 * Checkout parking record (records exit timestamp and frees parking spot).
 */
export const checkoutParkingRecord = async (tenantConn, id, checkoutData = {}) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Parking Record ID");
  }

  const ParkingSpace = await getModel(tenantConn, "ParkingSpace");
  const ParkingRecord = await getModel(tenantConn, "ParkingRecord");

  const record = await ParkingRecord.findById(id);
  if (!record) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Parking record not found");
  }

  if (record.status === "EXITED") {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Vehicle is already checked out");
  }

  let exitTime = new Date();
  if (checkoutData.exit_time) {
    exitTime = new Date(checkoutData.exit_time);
  } else if (checkoutData.exitDate || checkoutData.exitTime) {
    exitTime = parseDateTime(checkoutData.exitDate, checkoutData.exitTime, exitTime);
  }

  record.status = "EXITED";
  record.exit_time = exitTime;
  await record.save();

  // Free the space
  const space = await ParkingSpace.findById(record.space_id);
  if (space) {
    space.status = "AVAILABLE";
    await space.save();
  }

  return ParkingRecord.findById(record._id).populate("space_id", "space_number location status");
};

/**
 * Delete parking record (releases space if parked).
 */
export const deleteParkingRecord = async (tenantConn, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Parking Record ID");
  }

  const ParkingSpace = await getModel(tenantConn, "ParkingSpace");
  const ParkingRecord = await getModel(tenantConn, "ParkingRecord");

  const record = await ParkingRecord.findById(id);
  if (!record) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Parking record not found");
  }

  if (record.status === "PARKED") {
    const space = await ParkingSpace.findById(record.space_id);
    if (space) {
      space.status = "AVAILABLE";
      await space.save();
    }
  }

  await ParkingRecord.findByIdAndDelete(id);
  return { success: true, message: "Parking record deleted successfully" };
};
