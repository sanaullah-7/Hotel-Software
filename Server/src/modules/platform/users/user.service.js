import mongoose from "mongoose";
import Account from "../../../database/platform/models/account.model.js";
import Hotel from "../../../database/platform/models/hotel.model.js";
import ApiError from "../../../utils/apiError.js";
import logger from "../../../config/logger.js";
import { ROLES } from "../../../constants/roles.js";
import { logAction } from "../platformAudit/audit.service.js";

/**
 * Transforms an Account DB document into a clean, platform user representation.
 */
const formatUserRecord = (account) => {
  const hotel = account.hotelId || {};
  let normalizedRole = account.role;
  if (account.role === ROLES.HOTEL_ADMIN) normalizedRole = "MANAGER";
  else if (account.role === ROLES.HOTEL_USER) normalizedRole = "RECEPTIONIST";

  return {
    id: account._id.toString(),
    _id: account._id.toString(),
    name: account.fullName,
    fullName: account.fullName,
    email: account.email,
    phone: account.phone || "—",
    role: normalizedRole,
    rawRole: account.role,
    status: (account.status || "active").toUpperCase(),
    hotelId: hotel._id ? hotel._id.toString() : (hotel ? String(hotel) : null),
    hotelName: hotel.property_name || hotel.name || "Explore Pakistan Platform",
    city: hotel.city || "—",
    createdAt: account.createdAt,
    lastLogin: account.updatedAt,
  };
};

/**
 * Lists platform and hotel staff accounts with filters, search, and pagination.
 */
export const listUsers = async ({ page = 1, limit = 10, role = "", status = "", search = "", hotelId = "" } = {}) => {
  const query = {};

  // Filter by role
  if (role) {
    const r = role.toUpperCase();
    if (r === "MANAGER" || r === "HOTEL_ADMIN") {
      query.role = { $in: [ROLES.HOTEL_ADMIN, "MANAGER"] };
    } else if (r === "RECEPTIONIST" || r === "HOTEL_USER") {
      query.role = { $in: [ROLES.HOTEL_USER, "RECEPTIONIST"] };
    } else if (r === "SUPER_ADMIN" || r === "PLATFORM_ADMIN") {
      query.role = { $in: [ROLES.PLATFORM_ADMIN, "SUPER_ADMIN"] };
    } else {
      query.role = r;
    }
  } else {
    // Default view: exclude internal platform super admins so manager & receptionist lists stay clean
    query.role = { $in: [ROLES.HOTEL_ADMIN, ROLES.HOTEL_USER, "MANAGER", "RECEPTIONIST"] };
  }

  // Filter by status
  if (status) {
    query.status = status.toLowerCase();
  }

  // Filter by hotel
  if (hotelId && mongoose.Types.ObjectId.isValid(hotelId)) {
    query.hotelId = new mongoose.Types.ObjectId(hotelId);
  }

  // Multi-field text search
  if (search && search.trim()) {
    const s = search.trim();
    query.$or = [
      { fullName: { $regex: s, $options: "i" } },
      { email: { $regex: s, $options: "i" } },
      { phone: { $regex: s, $options: "i" } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;

  const [accounts, total] = await Promise.all([
    Account.find(query)
      .populate("hotelId", "property_name city address status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Account.countDocuments(query),
  ]);

  return {
    data: accounts.map(formatUserRecord),
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

/**
 * Retrieves a single user account by ID.
 */
export const getUserById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const account = await Account.findById(id)
    .populate("hotelId", "property_name city address status")
    .lean();

  if (!account) {
    throw new ApiError(404, "User account not found");
  }

  return formatUserRecord(account);
};

/**
 * Activates a user account.
 */
export const activateUser = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const account = await Account.findById(id);
  if (!account) {
    throw new ApiError(404, "User account not found");
  }

  account.status = "active";
  account.lockUntil = null;
  account.failedLoginAttempts = 0;
  await account.save();

  logger.info(`Super Admin activated user account: ${account.email} (${account._id})`);
  await logAction({
    action: "USER_ACTIVATED",
    entity: account.fullName || account.email,
    entityId: account._id,
    entityType: "user",
    severity: "INFO",
    details: { email: account.email, role: account.role },
  });

  return {
    success: true,
    message: "User account activated successfully",
    user: formatUserRecord(account),
  };
};

/**
 * Suspends a user account and immediately invalidates all active sessions (tokenVersion bump).
 */
export const suspendUser = async (id, reason = "Suspended by Super Admin") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const account = await Account.findById(id);
  if (!account) {
    throw new ApiError(404, "User account not found");
  }

  account.status = "suspended";
  account.tokenVersion = (account.tokenVersion || 0) + 1; // Instant token revocation
  await account.save();

  logger.info(`Super Admin suspended user account: ${account.email} (${account._id}). Reason: ${reason}`);
  await logAction({
    action: "USER_SUSPENDED",
    entity: account.fullName || account.email,
    entityId: account._id,
    entityType: "user",
    severity: "WARNING",
    details: { reason, email: account.email, role: account.role },
  });

  return {
    success: true,
    message: "User account suspended and active sessions revoked",
    user: formatUserRecord(account),
  };
};

/**
 * Assigns a manager or user to a hotel property.
 */
export const assignUserHotel = async (userId, hotelId) => {
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(hotelId)) {
    throw new ApiError(400, "Invalid user or hotel ID");
  }

  const [account, hotel] = await Promise.all([
    Account.findById(userId),
    Hotel.findById(hotelId),
  ]);

  if (!account) throw new ApiError(404, "User account not found");
  if (!hotel) throw new ApiError(404, "Hotel property not found");

  account.hotelId = hotel._id;
  await account.save();

  logger.info(`Super Admin assigned user ${account.email} to hotel ${hotel.property_name}`);
  return {
    success: true,
    message: `User assigned to ${hotel.property_name} successfully`,
    user: formatUserRecord(account),
  };
};

/**
 * Aggregates platform user statistics.
 */
export const getUserStats = async () => {
  const [totalManagers, totalReceptionists, activeUsers, pendingUsers, suspendedUsers] = await Promise.all([
    Account.countDocuments({ role: { $in: [ROLES.HOTEL_ADMIN, "MANAGER"] } }),
    Account.countDocuments({ role: { $in: [ROLES.HOTEL_USER, "RECEPTIONIST"] } }),
    Account.countDocuments({ status: "active", role: { $ne: ROLES.PLATFORM_ADMIN } }),
    Account.countDocuments({ status: "pending", role: { $ne: ROLES.PLATFORM_ADMIN } }),
    Account.countDocuments({ status: "suspended", role: { $ne: ROLES.PLATFORM_ADMIN } }),
  ]);

  return {
    totalManagers,
    totalReceptionists,
    activeUsers,
    pendingUsers,
    suspendedUsers,
    totalUsers: totalManagers + totalReceptionists,
  };
};
