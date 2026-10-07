import mongoose from "mongoose";
import crypto from "crypto";
import { getModel } from "../../../database/hotel/modelFactory.js";
import ApiError from "../../../utils/apiError.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import { asString, escapeRegex, parsePagination } from "../../../utils/query.js";
import {
  CANONICAL_DEPARTMENTS,
  VALID_SEVERITIES,
  VALID_STATUSES,
} from "./operationsAlert.validation.js";

const PROTECTED_FIELDS = [
  "_id",
  "alert_ref",
  "hotelId",
  "tenantId",
  "created_at",
  "updated_at",
  "resolved_at",
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

export const generateAlertRef = async (tenantConn) => {
  const OperationsAlert = await getModel(tenantConn, "OperationsAlert");
  const dateStr = getLocalDateString();

  for (let attempt = 0; attempt < 5; attempt++) {
    const randomHex = crypto.randomBytes(2).toString("hex").toUpperCase();
    const candidateRef = `ALT-${dateStr}-${randomHex}`;
    const exists = await OperationsAlert.findOne({ alert_ref: candidateRef });
    if (!exists) {
      return candidateRef;
    }
  }

  // Fallback if 5 collisions occur
  const fallbackHex = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `ALT-${dateStr}-${fallbackHex}`;
};

export const createAlert = async (tenantConn, alertData, user) => {
  const OperationsAlert = await getModel(tenantConn, "OperationsAlert");
  const data = stripProtected(alertData);

  const alert_ref = await generateAlertRef(tenantConn);

  // Status & active lifecycle invariant
  const status = data.status && VALID_STATUSES.includes(data.status) ? data.status : "OPEN";
  const is_active = status !== "RESOLVED";
  const resolved_at = status === "RESOLVED" ? new Date() : null;

  // Department & type alignment
  let department = data.department || "GENERAL";
  if (!data.department && data.type && CANONICAL_DEPARTMENTS.includes(data.type)) {
    department = data.type;
  }
  const type = data.type || department;

  const reported_by =
    (typeof data.reported_by === "string" && data.reported_by.trim()) ||
    user?.fullName ||
    "Front Office";

  const newAlert = new OperationsAlert({
    ...data,
    alert_ref,
    status,
    is_active,
    resolved_at,
    department,
    type,
    reported_by,
  });

  await newAlert.save();
  return newAlert.toObject();
};

export const getAlerts = async (tenantConn, query = {}) => {
  const OperationsAlert = await getModel(tenantConn, "OperationsAlert");
  const { page, limit, skip } = parsePagination(query, { defaultLimit: 20, maxLimit: 100 });

  const filter = {};

  if (query.status && VALID_STATUSES.includes(query.status)) {
    filter.status = query.status;
  }

  if (query.is_active !== undefined) {
    if (query.is_active === true || query.is_active === "true") {
      filter.is_active = true;
    } else if (query.is_active === false || query.is_active === "false") {
      filter.is_active = false;
    }
  }

  if (query.department && CANONICAL_DEPARTMENTS.includes(query.department)) {
    filter.department = query.department;
  }

  if (query.type) {
    filter.type = asString(query.type);
  }

  if (query.severity && VALID_SEVERITIES.includes(query.severity)) {
    filter.severity = query.severity;
  }

  if (query.search) {
    const term = asString(query.search);
    if (term) {
      const escaped = escapeRegex(term);
      const regex = new RegExp(escaped, "i");
      filter.$or = [
        { title: regex },
        { message: regex },
        { location: regex },
        { guest_name: regex },
        { alert_ref: regex },
        { reported_by: regex },
      ];
    }
  }

  // Safe sorting whitelist
  const allowedSortFields = [
    "created_at",
    "updated_at",
    "severity",
    "status",
    "department",
    "title",
  ];
  const sortBy = allowedSortFields.includes(query.sortBy) ? query.sortBy : "created_at";
  const sortOrder = query.sortOrder === "asc" || query.sortOrder === "1" ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const [alerts, total] = await Promise.all([
    OperationsAlert.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    OperationsAlert.countDocuments(filter),
  ]);

  return {
    alerts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getAlertById = async (tenantConn, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid alert ID format");
  }

  const OperationsAlert = await getModel(tenantConn, "OperationsAlert");
  const alert = await OperationsAlert.findById(id).lean();

  if (!alert) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Operations alert not found");
  }

  return alert;
};

export const updateAlert = async (tenantConn, id, updateData, user) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid alert ID format");
  }

  const OperationsAlert = await getModel(tenantConn, "OperationsAlert");
  const existing = await OperationsAlert.findById(id);

  if (!existing) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Operations alert not found");
  }

  const data = stripProtected(updateData);

  // Status and is_active lifecycle invariant
  if (data.status) {
    if (data.status === "RESOLVED") {
      data.is_active = false;
      data.resolved_at = new Date();
    } else {
      data.is_active = true;
      data.resolved_at = null;
    }
  } else if (data.is_active !== undefined) {
    if (data.is_active === false) {
      data.status = "RESOLVED";
      data.resolved_at = new Date();
    } else if (data.is_active === true && existing.status === "RESOLVED") {
      data.status = "OPEN";
      data.resolved_at = null;
    }
  }

  const updated = await OperationsAlert.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  ).lean();

  return updated;
};

export const deleteAlert = async (tenantConn, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid alert ID format");
  }

  const OperationsAlert = await getModel(tenantConn, "OperationsAlert");
  const existing = await OperationsAlert.findById(id);

  if (!existing) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Operations alert not found");
  }

  await OperationsAlert.findByIdAndDelete(id);
  return { success: true };
};
