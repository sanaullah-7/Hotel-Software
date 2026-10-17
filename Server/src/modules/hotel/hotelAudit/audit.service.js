import { getModel } from "../../../database/hotel/modelFactory.js";
import ApiError from "../../../utils/apiError.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import { parsePagination, escapeRegex } from "../../../utils/query.js";

/**
 * List audit logs with search, module filter, importance filter, time filter / date ranges, and pagination.
 */
export const getAuditLogs = async (tenantConn, query = {}) => {
  const AuditLog = await getModel(tenantConn, "AuditLog");
  const { page, limit, skip } = parsePagination(query, { defaultLimit: 15, maxLimit: 100 });

  const filter = {};

  // Module filter (case-insensitive)
  if (query.module && query.module !== "all" && query.module !== "All") {
    filter.$or = [
      { module: new RegExp(`^${escapeRegex(query.module.trim())}$`, "i") },
      { entity_name: new RegExp(`^${escapeRegex(query.module.trim())}$`, "i") },
    ];
  }

  // Importance filter
  if (query.importance && query.importance !== "all" && query.importance !== "All") {
    filter.importance = query.importance.trim();
  }

  // Time filter: Daily, Weekly, Monthly, Yearly or custom date range
  const now = new Date();
  if (query.timeFilter && query.timeFilter !== "all" && query.timeFilter !== "All") {
    if (query.timeFilter.toLowerCase() === "daily") {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filter.timestamp = { $gte: startOfDay };
    } else if (query.timeFilter.toLowerCase() === "weekly") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filter.timestamp = { $gte: weekAgo };
    } else if (query.timeFilter.toLowerCase() === "monthly") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filter.timestamp = { $gte: monthAgo };
    } else if (query.timeFilter.toLowerCase() === "yearly") {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      filter.timestamp = { $gte: yearAgo };
    }
  } else if (query.startDate || query.endDate) {
    filter.timestamp = {};
    if (query.startDate) {
      filter.timestamp.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      filter.timestamp.$lte = end;
    }
  }

  // Text search on description, recordId, action, user_name, module
  if (query.search && query.search.trim()) {
    const searchRegex = new RegExp(escapeRegex(query.search.trim()), "i");
    const searchConditions = [
      { description: searchRegex },
      { recordId: searchRegex },
      { action: searchRegex },
      { user_name: searchRegex },
      { module: searchRegex },
    ];
    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
      delete filter.$or;
    } else {
      filter.$or = searchConditions;
    }
  }

  const [totalCount, docs] = await Promise.all([
    AuditLog.countDocuments(filter),
    AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  // Format docs to ensure client compatibility (dateTime, userName, id, recordId)
  const logs = docs.map((doc) => ({
    id: String(doc._id),
    _id: doc._id,
    dateTime: (doc.timestamp || new Date()).toISOString(),
    timestamp: doc.timestamp,
    userId: doc.performed_by ? String(doc.performed_by) : null,
    userName: doc.user_name || "Admin",
    module: doc.module || doc.entity_name || "System",
    action: doc.action,
    recordId: doc.recordId || (doc.entity_id ? String(doc.entity_id) : ""),
    description: doc.description,
    importance: doc.importance || "Normal",
    status: doc.status || "Completed",
    previousValue: doc.previous_value || null,
    newValue: doc.new_value || null,
    ipAddress: doc.ip_address || null,
  }));

  return {
    logs,
    totalCount,
    totalPages: Math.ceil(totalCount / limit) || 1,
    currentPage: page,
    limit,
  };
};

/**
 * Create a new audit log record.
 */
export const createAuditLog = async (tenantConn, data, user = {}, ipAddress = null) => {
  const AuditLog = await getModel(tenantConn, "AuditLog");

  const moduleName = data.module || data.entity_name || "System";
  const userName = data.userName || data.user_name || user?.fullName || user?.email || "Admin";
  const userId = data.userId || data.performed_by || user?.id || null;
  const recordId = data.recordId || (data.entity_id ? String(data.entity_id) : null);

  const doc = new AuditLog({
    module: moduleName,
    entity_name: moduleName,
    action: data.action,
    recordId,
    entity_id: recordId,
    description: data.description,
    importance: data.importance || "Normal",
    status: data.status || "Completed",
    performed_by: userId,
    user_name: userName,
    previous_value: data.previousValue ?? data.previous_value ?? null,
    new_value: data.newValue ?? data.new_value ?? null,
    changes: data.changes ?? null,
    ip_address: ipAddress || data.ipAddress || data.ip_address || null,
    timestamp: data.dateTime ? new Date(data.dateTime) : (data.timestamp ? new Date(data.timestamp) : new Date()),
  });

  const saved = await doc.save();

  return {
    id: String(saved._id),
    _id: saved._id,
    dateTime: saved.timestamp.toISOString(),
    timestamp: saved.timestamp,
    userId: saved.performed_by ? String(saved.performed_by) : null,
    userName: saved.user_name,
    module: saved.module,
    action: saved.action,
    recordId: saved.recordId || "",
    description: saved.description,
    importance: saved.importance,
    status: saved.status,
    previousValue: saved.previous_value,
    newValue: saved.new_value,
    ipAddress: saved.ip_address,
  };
};

/**
 * Get audit log by ID
 */
export const getAuditLogById = async (tenantConn, id) => {
  const AuditLog = await getModel(tenantConn, "AuditLog");
  const doc = await AuditLog.findById(id).lean();
  if (!doc) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Audit log not found");
  }

  return {
    id: String(doc._id),
    _id: doc._id,
    dateTime: (doc.timestamp || new Date()).toISOString(),
    timestamp: doc.timestamp,
    userId: doc.performed_by ? String(doc.performed_by) : null,
    userName: doc.user_name || "Admin",
    module: doc.module || doc.entity_name || "System",
    action: doc.action,
    recordId: doc.recordId || (doc.entity_id ? String(doc.entity_id) : ""),
    description: doc.description,
    importance: doc.importance || "Normal",
    status: doc.status || "Completed",
    previousValue: doc.previous_value || null,
    newValue: doc.new_value || null,
    ipAddress: doc.ip_address || null,
  };
};

/**
 * Get audit summary / stats (counts of total, critical, important, normal)
 */
export const getAuditMetrics = async (tenantConn) => {
  const AuditLog = await getModel(tenantConn, "AuditLog");
  const [total, critical, important, normal] = await Promise.all([
    AuditLog.countDocuments(),
    AuditLog.countDocuments({ importance: "Critical" }),
    AuditLog.countDocuments({ importance: "Important" }),
    AuditLog.countDocuments({ importance: "Normal" }),
  ]);

  return {
    total,
    critical,
    important,
    normal,
  };
};
