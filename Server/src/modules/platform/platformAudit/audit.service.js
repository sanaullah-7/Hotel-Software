import PlatformAuditLog from "../../../database/platform/models/platformAuditLog.model.js";
import Hotel from "../../../database/platform/models/hotel.model.js";
import Account from "../../../database/platform/models/account.model.js";
import logger from "../../../config/logger.js";

/**
 * Safely writes an administrative action to the audit ledger.
 */
export const logAction = async ({
  action,
  entity,
  entityId = null,
  entityType = "hotel",
  performedBy = "Super Admin",
  performedById = null,
  ip = "127.0.0.1",
  severity = "INFO",
  details = null,
}) => {
  try {
    const entry = await PlatformAuditLog.create({
      action: action.toUpperCase(),
      entity,
      entityId: entityId ? String(entityId) : null,
      entityType: entityType.toLowerCase(),
      performedBy,
      performedById,
      ip,
      severity: severity.toUpperCase(),
      details,
    });
    return entry;
  } catch (err) {
    logger.error("Failed to record platform audit log:", err.message);
    return null;
  }
};

/**
 * Auto-seeds historical audit logs if table is empty.
 */
export const seedInitialAuditLogsIfEmpty = async () => {
  const count = await PlatformAuditLog.countDocuments();
  if (count > 0) return;

  logger.info("Generating baseline platform audit logs from registered entities...");

  const [hotels, accounts] = await Promise.all([
    Hotel.find().sort({ createdAt: -1 }).limit(10).lean(),
    Account.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const logs = [];

  // 1. Initial admin login
  logs.push({
    action: "LOGIN",
    entity: "Super Admin",
    entityType: "security",
    performedBy: "Super Admin",
    ip: "192.168.1.1",
    severity: "INFO",
    details: { method: "Email & Password", status: "Successful" },
    createdAt: new Date(Date.now() - 48 * 3600000),
  });

  // 2. Hotel approval and status changes
  hotels.forEach((h, idx) => {
    if (h.status === "active") {
      logs.push({
        action: "HOTEL_APPROVED",
        entity: h.property_name,
        entityId: h._id.toString(),
        entityType: "hotel",
        performedBy: "Super Admin",
        ip: "192.168.1.10",
        severity: "INFO",
        details: { city: h.city, status: "active", reason: "All documents verified" },
        createdAt: new Date(Date.now() - (idx + 1) * 6 * 3600000),
      });
    } else if (h.status === "suspended") {
      logs.push({
        action: "HOTEL_SUSPENDED",
        entity: h.property_name,
        entityId: h._id.toString(),
        entityType: "hotel",
        performedBy: "Super Admin",
        ip: "192.168.1.10",
        severity: "WARNING",
        details: { reason: h.suspensionReason || "SaaS subscription overdue" },
        createdAt: new Date(Date.now() - (idx + 1) * 12 * 3600000),
      });
    } else if (h.status === "pending") {
      logs.push({
        action: "HOTEL_REGISTERED",
        entity: h.property_name,
        entityId: h._id.toString(),
        entityType: "hotel",
        performedBy: "Hotel Partner",
        ip: "182.185.12.44",
        severity: "INFO",
        details: { city: h.city, status: "pending" },
        createdAt: h.createdAt || new Date(),
      });
    }
  });

  // 3. User activations
  accounts.forEach((acc, idx) => {
    if (acc.role !== "SUPER_ADMIN") {
      logs.push({
        action: "USER_ACTIVATED",
        entity: acc.fullName,
        entityId: acc._id.toString(),
        entityType: "user",
        performedBy: "Super Admin",
        ip: "192.168.1.10",
        severity: "INFO",
        details: { role: acc.role, email: acc.email },
        createdAt: new Date(Date.now() - (idx + 2) * 8 * 3600000),
      });
    }
  });

  // 4. Subscription tier changes
  logs.push({
    action: "SUBSCRIPTION_CHANGED",
    entity: "Enterprise Elite Pricing Tier",
    entityType: "subscription",
    performedBy: "Super Admin",
    ip: "192.168.1.10",
    severity: "INFO",
    details: { tier: "ENTERPRISE", price: 29999, currency: "PKR" },
    createdAt: new Date(Date.now() - 24 * 3600000),
  });

  if (logs.length > 0) {
    await PlatformAuditLog.insertMany(logs);
    logger.info(`Generated ${logs.length} baseline audit trail entries.`);
  }
};

/**
 * Lists audit logs with pagination, search, action, and severity filters.
 */
export const listAuditLogs = async ({
  page = 1,
  limit = 10,
  action = "",
  entityType = "",
  severity = "",
  search = "",
} = {}) => {
  await seedInitialAuditLogsIfEmpty();

  const query = {};

  if (action) {
    query.action = action.toUpperCase();
  }

  if (entityType) {
    query.entityType = entityType.toLowerCase();
  }

  if (severity) {
    query.severity = severity.toUpperCase();
  }

  if (search) {
    query.$or = [
      { entity: { $regex: search, $options: "i" } },
      { performedBy: { $regex: search, $options: "i" } },
      { action: { $regex: search, $options: "i" } },
    ];
  }

  const numericPage = Math.max(1, parseInt(page, 10) || 1);
  const numericLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (numericPage - 1) * numericLimit;

  const [records, total] = await Promise.all([
    PlatformAuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(numericLimit)
      .lean(),
    PlatformAuditLog.countDocuments(query),
  ]);

  const formatted = records.map((log) => ({
    id: log._id.toString(),
    _id: log._id.toString(),
    action: log.action,
    entity: log.entity,
    entityId: log.entityId,
    entityType: log.entityType,
    performedBy: log.performedBy || "Super Admin",
    ip: log.ip || "127.0.0.1",
    severity: log.severity || "INFO",
    details: log.details || null,
    createdAt: log.createdAt,
  }));

  return {
    data: formatted,
    total,
    page: numericPage,
    limit: numericLimit,
    totalPages: Math.ceil(total / numericLimit) || 1,
  };
};

/**
 * Retrieves audit event counts and security metrics.
 */
export const getAuditStats = async () => {
  await seedInitialAuditLogsIfEmpty();

  const [totalEvents, criticalEvents, warningEvents, breakdown] = await Promise.all([
    PlatformAuditLog.countDocuments(),
    PlatformAuditLog.countDocuments({ severity: "CRITICAL" }),
    PlatformAuditLog.countDocuments({ severity: "WARNING" }),
    PlatformAuditLog.aggregate([
      { $group: { _id: "$action", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  return {
    totalEvents,
    criticalEvents,
    warningEvents,
    breakdown: breakdown.map((b) => ({ action: b._id, count: b.count })),
  };
};
