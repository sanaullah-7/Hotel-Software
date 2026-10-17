import mongoose from "mongoose";
import Hotel from "../../../database/platform/models/hotel.model.js";
import Account from "../../../database/platform/models/account.model.js";
import ApiError from "../../../utils/apiError.js";
import logger from "../../../config/logger.js";
import { getModel } from "../../../database/hotel/modelFactory.js";
import { logAction } from "../platformAudit/audit.service.js";
import { createNotification } from "../notifications/notification.service.js";

const CITY_PROVINCE_MAP = {
  lahore: "Punjab",
  rawalpindi: "Punjab",
  faisalabad: "Punjab",
  multan: "Punjab",
  gujranwala: "Punjab",
  sialkot: "Punjab",
  bahawalpur: "Punjab",
  sargodha: "Punjab",
  murree: "Punjab",
  karachi: "Sindh",
  hyderabad: "Sindh",
  sukkur: "Sindh",
  larkana: "Sindh",
  islamabad: "ICT",
  peshawar: "Khyber Pakhtunkhwa",
  abbottabad: "Khyber Pakhtunkhwa",
  mardan: "Khyber Pakhtunkhwa",
  swat: "Khyber Pakhtunkhwa",
  quetta: "Balochistan",
  gwadar: "Balochistan",
  gilgit: "Gilgit-Baltistan",
  skardu: "Gilgit-Baltistan",
  hunza: "Gilgit-Baltistan",
  muzaffarabad: "Azad Kashmir",
  mirpur: "Azad Kashmir",
};

const resolveProvince = (city, province) => {
  if (province && String(province).trim() && province !== 'undefined') {
    return String(province).trim();
  }
  const lowerCity = (city || "").trim().toLowerCase();
  return CITY_PROVINCE_MAP[lowerCity] || "Punjab";
};

/**
 * Safely fetches tenant database statistics (rooms, revenue, staff)
 * without failing if tenant DB is unprovisioned or empty.
 */
const getHotelTenantMetrics = async (hotel) => {
  let totalRooms = hotel.totalRooms || 0;
  let revenue = 0;
  let activeBookings = 0;
  let totalStaff = 0;

  if (hotel.status === "active") {
    try {
      const Room = await getModel(hotel._id.toString(), "Room");
      const roomCount = await Room.countDocuments({}).catch(() => 0);
      if (roomCount > 0) totalRooms = roomCount;

      const Payment = await getModel(hotel._id.toString(), "Payment");
      const payments = await Payment.aggregate([
        { $match: { status: { $in: ["COMPLETED", "SUCCESS", "PAID"] } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]).catch(() => []);
      if (payments.length > 0 && payments[0].total) {
        revenue = payments[0].total;
      }

      const Reservation = await getModel(hotel._id.toString(), "Reservation");
      activeBookings = await Reservation.countDocuments({ status: { $in: ["CONFIRMED", "IN_HOUSE"] } }).catch(() => 0);

      const Employee = await getModel(hotel._id.toString(), "Employee");
      totalStaff = await Employee.countDocuments({ status: "ACTIVE" }).catch(() => 0);
    } catch {
      // Graceful fallback if tenant DB is unprovisioned or not reachable
    }
  }

  const PLAN_PRICES = {
    BASIC: 25000,
    STANDARD: 45000,
    PREMIUM: 65000,
    ENTERPRISE: 85000,
  };
  const planRevenue = PLAN_PRICES[(hotel.subscriptionPlan || "STANDARD").toUpperCase()] || 45000;

  return {
    totalRooms,
    revenue: revenue > 0 ? revenue : (hotel.status === "active" ? planRevenue : 0),
    activeBookings,
    totalStaff,
  };
};

/**
 * Transforms a Hotel DB document into a clean, unified platform representation
 * compatible with the Super Admin dashboard and API consumers.
 */
const formatHotelRecord = (hotel, tenantMetrics = null) => {
  const owner = hotel.ownerId || {};
  const metrics = tenantMetrics || {
    totalRooms: hotel.totalRooms || 0,
    revenue: 0,
    activeBookings: 0,
    totalStaff: 0,
  };

  return {
    id: hotel._id.toString(),
    _id: hotel._id.toString(),
    name: hotel.property_name,
    property_name: hotel.property_name,
    hotelName: hotel.property_name,
    city: hotel.city,
    province: resolveProvince(hotel.city, hotel.province),
    country: hotel.country || "Pakistan",
    address: hotel.address,
    status: (hotel.status || "PENDING").toUpperCase(),
    email: hotel.email || owner.email || "",
    phone: hotel.phone || owner.phone || "",
    managerName: owner.fullName || "Hotel Owner",
    managerEmail: owner.email || "",
    managerPhone: owner.phone || "",
    subscriptionPlan: (hotel.subscriptionPlan || "STANDARD").toUpperCase(),
    tenantDbName: hotel.tenant_db_name,
    rating: hotel.rating || 4.8,
    totalRooms: metrics.totalRooms,
    revenue: metrics.revenue,
    activeBookings: metrics.activeBookings,
    totalStaff: metrics.totalStaff,
    createdAt: hotel.createdAt,
    registeredAt: hotel.createdAt,
    approvedAt: hotel.approvedAt,
    suspendedAt: hotel.suspendedAt,
    rejectedAt: hotel.status === 'rejected' ? hotel.updatedAt : null,
    rejectionReason: hotel.rejectionReason,
    suspensionReason: hotel.suspensionReason,
  };
};

/**
 * Lists hotels with multi-field search, status filtering, and pagination.
 */
export const listHotels = async ({ page = 1, limit = 10, status = "", search = "", city = "" } = {}) => {
  const query = {};

  if (status) {
    const s = status.toLowerCase();
    if (s === "approved" || s === "active") {
      query.status = { $in: ["active", "approved"] };
    } else {
      query.status = s;
    }
  }

  if (city) {
    query.city = { $regex: city.trim(), $options: "i" };
  }

  if (search && search.trim()) {
    const s = search.trim();
    query.$or = [
      { property_name: { $regex: s, $options: "i" } },
      { city: { $regex: s, $options: "i" } },
      { address: { $regex: s, $options: "i" } },
      { email: { $regex: s, $options: "i" } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;

  const [hotels, total] = await Promise.all([
    Hotel.find(query)
      .populate("ownerId", "fullName email phone status role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Hotel.countDocuments(query),
  ]);

  const formattedHotels = await Promise.all(
    hotels.map(async (hotel) => {
      const metrics = await getHotelTenantMetrics(hotel);
      return formatHotelRecord(hotel, metrics);
    })
  );

  return {
    data: formattedHotels,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

/**
 * Returns overall hotel statistics for Super Admin dashboard overview.
 */
export const getHotelStats = async () => {
  const [total, active, pending, suspended, rejected, totalManagers, totalReceptionists] = await Promise.all([
    Hotel.countDocuments({}),
    Hotel.countDocuments({ status: "active" }),
    Hotel.countDocuments({ status: "pending" }),
    Hotel.countDocuments({ status: { $in: ["suspended", "inactive"] } }),
    Hotel.countDocuments({ status: "rejected" }),
    Account.countDocuments({ role: { $in: ["HOTEL_ADMIN", "MANAGER"] } }),
    Account.countDocuments({ role: "RECEPTIONIST" }),
  ]);

  const activeHotelsWithPlans = await Hotel.find({ status: "active" }, "subscriptionPlan").lean();
  const PLAN_PRICES = {
    BASIC: 25000,
    STANDARD: 45000,
    PREMIUM: 65000,
    ENTERPRISE: 85000,
    FREE_TRIAL: 0,
  };
  const monthlyRevenue = activeHotelsWithPlans.reduce((sum, h) => {
    const plan = (h.subscriptionPlan || "STANDARD").toUpperCase();
    return sum + (PLAN_PRICES[plan] || 45000);
  }, 0);

  return {
    total,
    active,
    pending,
    suspended,
    rejected,
    totalHotels: total,
    activeHotels: active,
    pendingApprovals: pending,
    suspendedHotels: suspended,
    totalManagers,
    totalReceptionists,
    activeSubscriptions: active,
    monthlyRevenue,
    revenueGrowth: 0,
    hotelGrowth: 0,
    userGrowth: 0,
    subscriptionGrowth: 0,
  };
};

/**
 * Retrieves single hotel details.
 */
export const getHotelById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid hotel ID");
  }

  const hotel = await Hotel.findById(id).populate("ownerId", "fullName email phone status role").lean();
  if (!hotel) {
    throw new ApiError(404, "Hotel property not found");
  }

  const metrics = await getHotelTenantMetrics(hotel);
  return formatHotelRecord(hotel, metrics);
};

/**
 * Super Admin Approval:
 * 1. Sets Hotel status to "active"
 * 2. Sets Owner Account status to "active"
 * 3. Provisions tenant database and HotelProfile seed
 */
export const approveHotel = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid hotel ID");
  }

  const hotel = await Hotel.findById(id);
  if (!hotel) {
    throw new ApiError(404, "Hotel property not found");
  }

  if (hotel.status === "active") {
    return { success: true, message: "Hotel is already active", hotel: formatHotelRecord(hotel) };
  }

  hotel.status = "active";
  hotel.approvedAt = new Date();
  hotel.rejectionReason = null;
  await hotel.save();

  // Activate owner account
  if (hotel.ownerId) {
    await Account.findByIdAndUpdate(hotel.ownerId, { status: "active" });
  }

  // Provision tenant DB and HotelProfile
  try {
    const HotelProfile = await getModel(hotel._id.toString(), "HotelProfile");
    const existingProfile = await HotelProfile.findOne({}).lean();
    if (!existingProfile) {
      await HotelProfile.create({
        property_name: hotel.property_name,
        legal_name: hotel.property_name,
        email: hotel.email || "info@hotel.com",
        phone: hotel.phone || "+923000000000",
        address: hotel.address,
        city: hotel.city,
        country: "Pakistan",
        currency: "PKR",
        timezone: "Asia/Karachi",
      });
    }
  } catch (err) {
    logger.error(`Error provisioning HotelProfile for hotel ${hotel._id}:`, err);
  }

  logger.info(`Super Admin approved hotel: ${hotel.property_name} (${hotel._id})`);
  await logAction({
    action: "HOTEL_APPROVED",
    entity: hotel.property_name,
    entityId: hotel._id,
    entityType: "hotel",
    severity: "INFO",
    details: { city: hotel.city },
  });
  await createNotification({
    title: "Hotel Approved & Provisioned",
    message: `${hotel.property_name} in ${hotel.city} was approved and fully provisioned.`,
    type: "success",
    category: "hotel",
    entityId: hotel._id,
    entityType: "hotel",
  });

  return {
    success: true,
    message: "Hotel successfully approved and activated",
    hotel: formatHotelRecord(hotel),
  };
};

/**
 * Super Admin Rejection:
 * Sets Hotel status to "rejected" with reason.
 */
export const rejectHotel = async (id, reason = "Application does not meet platform criteria") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid hotel ID");
  }

  const hotel = await Hotel.findById(id);
  if (!hotel) {
    throw new ApiError(404, "Hotel property not found");
  }

  hotel.status = "rejected";
  hotel.rejectionReason = reason || "Application rejected by Super Admin";
  await hotel.save();

  if (hotel.ownerId) {
    await Account.findByIdAndUpdate(hotel.ownerId, { status: "suspended" });
  }

  logger.info(`Super Admin rejected hotel: ${hotel.property_name} (${hotel._id}). Reason: ${reason}`);
  await logAction({
    action: "HOTEL_REJECTED",
    entity: hotel.property_name,
    entityId: hotel._id,
    entityType: "hotel",
    severity: "WARNING",
    details: { reason },
  });
  await createNotification({
    title: "Hotel Application Rejected",
    message: `${hotel.property_name} application was rejected. Reason: ${reason}`,
    type: "error",
    category: "hotel",
    entityId: hotel._id,
    entityType: "hotel",
  });

  return {
    success: true,
    message: "Hotel application rejected",
    hotel: formatHotelRecord(hotel),
  };
};

/**
 * Super Admin Deactivation / Suspension:
 * Used for monthly rent default or policy violations.
 * Bumps tokenVersion on all hotel accounts to immediately kill all active sessions.
 */
export const suspendHotel = async (id, reason = "Suspended by Super Admin due to subscription dues") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid hotel ID");
  }

  const hotel = await Hotel.findById(id);
  if (!hotel) {
    throw new ApiError(404, "Hotel property not found");
  }

  hotel.status = "suspended";
  hotel.suspensionReason = reason || "Suspended by administration";
  hotel.suspendedAt = new Date();
  await hotel.save();

  // Atomically invalidate all issued access/refresh tokens for all staff of this hotel
  await Account.updateMany({ hotelId: hotel._id }, { $inc: { tokenVersion: 1 } });

  logger.info(`Super Admin deactivated/suspended hotel: ${hotel.property_name} (${hotel._id})`);
  await logAction({
    action: "HOTEL_SUSPENDED",
    entity: hotel.property_name,
    entityId: hotel._id,
    entityType: "hotel",
    severity: "WARNING",
    details: { reason },
  });
  await createNotification({
    title: "Hotel Suspended",
    message: `${hotel.property_name} has been suspended. Reason: ${reason}`,
    type: "warning",
    category: "hotel",
    entityId: hotel._id,
    entityType: "hotel",
  });

  return {
    success: true,
    message: "Hotel deactivated and sessions revoked",
    hotel: formatHotelRecord(hotel),
  };
};

/**
 * Super Admin Reactivation:
 * Restores hotel status to active once monthly dues or issues are settled.
 */
export const reactivateHotel = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid hotel ID");
  }

  const hotel = await Hotel.findById(id);
  if (!hotel) {
    throw new ApiError(404, "Hotel property not found");
  }

  hotel.status = "active";
  hotel.suspensionReason = null;
  hotel.suspendedAt = null;
  await hotel.save();

  // Ensure owner account is marked active
  if (hotel.ownerId) {
    await Account.findByIdAndUpdate(hotel.ownerId, { status: "active" });
  }

  logger.info(`Super Admin reactivated hotel: ${hotel.property_name} (${hotel._id})`);
  await logAction({
    action: "HOTEL_REACTIVATED",
    entity: hotel.property_name,
    entityId: hotel._id,
    entityType: "hotel",
    severity: "INFO",
  });
  await createNotification({
    title: "Hotel Reactivated",
    message: `${hotel.property_name} operational status was restored.`,
    type: "success",
    category: "hotel",
    entityId: hotel._id,
    entityType: "hotel",
  });

  return {
    success: true,
    message: "Hotel reactivated successfully",
    hotel: formatHotelRecord(hotel),
  };
};
