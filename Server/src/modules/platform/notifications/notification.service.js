import PlatformNotification from "../../../database/platform/models/platformNotification.model.js";
import Hotel from "../../../database/platform/models/hotel.model.js";
import Subscription from "../../../database/platform/models/subscription.model.js";
import PlatformTransaction from "../../../database/platform/models/platformTransaction.model.js";
import ApiError from "../../../utils/apiError.js";
import logger from "../../../config/logger.js";

/**
 * Creates and persists a new platform alert or notification.
 */
export const createNotification = async ({
  title,
  message,
  type = "info",
  category = "system",
  entityId = null,
  entityType = null,
  recipientRole = "PLATFORM_ADMIN",
}) => {
  try {
    const item = await PlatformNotification.create({
      title,
      message,
      type: type.toLowerCase(),
      category: category.toLowerCase(),
      entityId: entityId ? String(entityId) : null,
      entityType: entityType ? String(entityType) : null,
      recipientRole,
      read: false,
    });
    return item;
  } catch (err) {
    logger.error("Failed to create platform notification:", err.message);
    return null;
  }
};

/**
 * Seeds initial platform notifications based on current real database state if empty.
 */
export const seedInitialNotificationsIfEmpty = async () => {
  const count = await PlatformNotification.countDocuments();
  if (count > 0) return;

  logger.info("Generating baseline platform notification alerts from active entities...");

  const [pendingHotels, activeHotels, expiredSubs, recentTxns] = await Promise.all([
    Hotel.find({ status: "pending" }).limit(5).lean(),
    Hotel.find({ status: "active" }).limit(5).lean(),
    Subscription.find({ status: "EXPIRED" }).populate("hotelId", "property_name").limit(5).lean(),
    PlatformTransaction.find({ status: "SUCCESS" }).populate("hotelId", "property_name").sort({ paidAt: -1 }).limit(3).lean(),
  ]);

  const notifications = [];

  // 1. Pending registration alerts
  pendingHotels.forEach((h, idx) => {
    notifications.push({
      title: "New Hotel Registration Awaiting Review",
      message: `${h.property_name} in ${h.city} submitted property documents for platform onboarding.`,
      type: "warning",
      category: "hotel",
      entityId: h._id.toString(),
      entityType: "hotel",
      read: false,
      createdAt: new Date(Date.now() - (idx + 1) * 2 * 3600000),
    });
  });

  // 2. Active hotel provisioning notices
  activeHotels.forEach((h, idx) => {
    notifications.push({
      title: "Hotel Operational & Tenant Active",
      message: `${h.property_name} is active with multi-tenant database initialized and ready for bookings.`,
      type: "success",
      category: "hotel",
      entityId: h._id.toString(),
      entityType: "hotel",
      read: idx > 1, // mark some older ones as read
      createdAt: new Date(Date.now() - (idx + 2) * 5 * 3600000),
    });
  });

  // 3. Expired subscription alerts
  expiredSubs.forEach((sub, idx) => {
    const hotelName = sub.hotelId?.property_name || "Hotel Partner";
    notifications.push({
      title: "SaaS Subscription Overdue for Renewal",
      message: `${hotelName}'s ${sub.planName || sub.planTier} agreement has expired. Super admin review needed.`,
      type: "error",
      category: "subscription",
      entityId: sub._id.toString(),
      entityType: "subscription",
      read: false,
      createdAt: new Date(Date.now() - (idx + 1) * 8 * 3600000),
    });
  });

  // 4. Financial revenue notices
  recentTxns.forEach((tx, idx) => {
    const hotelName = tx.hotelId?.property_name || "Partner Property";
    notifications.push({
      title: "Platform Revenue Payment Collected",
      message: `Received PKR ${tx.amount.toLocaleString()} from ${hotelName} via ${tx.paymentMethod}.`,
      type: "info",
      category: "finance",
      entityId: tx._id.toString(),
      entityType: "transaction",
      read: true,
      createdAt: tx.paidAt || new Date(Date.now() - (idx + 1) * 12 * 3600000),
    });
  });

  if (notifications.length > 0) {
    await PlatformNotification.insertMany(notifications);
    logger.info(`Generated ${notifications.length} baseline platform notification alerts.`);
  }
};

/**
 * List platform notifications with filters and pagination.
 */
export const listNotifications = async ({
  page = 1,
  limit = 20,
  read = "",
  category = "",
  type = "",
} = {}) => {
  await seedInitialNotificationsIfEmpty();

  const query = {};

  if (read !== "") {
    query.read = read === "true" || read === true;
  }

  if (category) {
    query.category = category.toLowerCase();
  }

  if (type) {
    query.type = type.toLowerCase();
  }

  const numericPage = Math.max(1, parseInt(page, 10) || 1);
  const numericLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (numericPage - 1) * numericLimit;

  const [items, total, unreadCount] = await Promise.all([
    PlatformNotification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(numericLimit)
      .lean(),
    PlatformNotification.countDocuments(query),
    PlatformNotification.countDocuments({ read: false }),
  ]);

  const formatted = items.map((n) => ({
    id: n._id.toString(),
    _id: n._id.toString(),
    title: n.title,
    message: n.message,
    type: n.type || "info",
    category: n.category || "system",
    entityId: n.entityId,
    entityType: n.entityType,
    read: n.read || false,
    readAt: n.readAt,
    createdAt: n.createdAt,
  }));

  return {
    data: formatted,
    total,
    page: numericPage,
    limit: numericLimit,
    totalPages: Math.ceil(total / numericLimit) || 1,
    unreadCount,
  };
};

/**
 * Mark a single notification as read.
 */
export const markAsRead = async (id) => {
  const item = await PlatformNotification.findByIdAndUpdate(
    id,
    { $set: { read: true, readAt: new Date() } },
    { returnDocument: "after" }
  );

  if (!item) throw new ApiError(404, "Notification not found");

  const unreadCount = await PlatformNotification.countDocuments({ read: false });
  return {
    success: true,
    message: "Notification marked as read",
    notification: item,
    unreadCount,
  };
};

/**
 * Mark all unread platform notifications as read.
 */
export const markAllAsRead = async () => {
  await PlatformNotification.updateMany(
    { read: false },
    { $set: { read: true, readAt: new Date() } }
  );

  return {
    success: true,
    message: "All notifications marked as read",
    unreadCount: 0,
  };
};

/**
 * Delete / dismiss a notification.
 */
export const deleteNotification = async (id) => {
  const item = await PlatformNotification.findByIdAndDelete(id);
  if (!item) throw new ApiError(404, "Notification not found");

  const unreadCount = await PlatformNotification.countDocuments({ read: false });
  return {
    success: true,
    message: "Notification deleted",
    unreadCount,
  };
};

/**
 * Count unread notifications.
 */
export const getUnreadCount = async () => {
  await seedInitialNotificationsIfEmpty();
  const count = await PlatformNotification.countDocuments({ read: false });
  return { count };
};
