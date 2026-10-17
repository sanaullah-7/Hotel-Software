import Joi from "joi";

export const CANONICAL_CATEGORIES = [
  "GENERAL",
  "PLUMBING",
  "ELECTRICAL",
  "HOUSEKEEPING",
  "NOISE",
  "AIR_CONDITIONING",
  "ROOM_SERVICE",
  "AMENITIES",
];

export const VALID_SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
export const VALID_STATUSES = ["OPEN", "INVESTIGATING", "RESOLVED", "CLOSED"];

export const createComplaintSchema = Joi.object({
  guest_id: Joi.string().hex().length(24).required().messages({
    "string.length": "Invalid Guest ID format",
    "string.hex": "Invalid Guest ID format",
    "any.required": "Guest ID is required",
  }),
  room_id: Joi.string().hex().length(24).optional().allow(null, "").messages({
    "string.length": "Invalid Room ID format",
    "string.hex": "Invalid Room ID format",
  }),
  reservation_id: Joi.string().hex().length(24).optional().allow(null, "").messages({
    "string.length": "Invalid Reservation ID format",
    "string.hex": "Invalid Reservation ID format",
  }),
  category: Joi.string()
    .valid(...CANONICAL_CATEGORIES)
    .required()
    .messages({
      "any.only": "Invalid complaint category",
      "any.required": "Category is required",
    }),
  description: Joi.string().trim().max(2000).required().messages({
    "any.required": "Description is required",
  }),
  severity: Joi.string().valid(...VALID_SEVERITIES).default("MEDIUM").optional(),
  status: Joi.string().valid(...VALID_STATUSES).default("OPEN").optional(),
  assigned_to: Joi.string().hex().length(24).optional().allow(null, "").messages({
    "string.length": "Invalid Employee ID format",
    "string.hex": "Invalid Employee ID format",
  }),
  resolution_notes: Joi.string().trim().max(2000).optional().allow(null, ""),
  compensation_offered: Joi.string().trim().max(500).optional().allow(null, ""),
});

export const updateComplaintSchema = Joi.object({
  category: Joi.string().valid(...CANONICAL_CATEGORIES).optional().messages({
    "any.only": "Invalid complaint category",
  }),
  description: Joi.string().trim().max(2000).optional(),
  severity: Joi.string().valid(...VALID_SEVERITIES).optional(),
  status: Joi.string().valid(...VALID_STATUSES).optional(),
  room_id: Joi.string().hex().length(24).optional().allow(null, "").messages({
    "string.length": "Invalid Room ID format",
    "string.hex": "Invalid Room ID format",
  }),
  reservation_id: Joi.string().hex().length(24).optional().allow(null, "").messages({
    "string.length": "Invalid Reservation ID format",
    "string.hex": "Invalid Reservation ID format",
  }),
  assigned_to: Joi.string().hex().length(24).optional().allow(null, "").messages({
    "string.length": "Invalid Employee ID format",
    "string.hex": "Invalid Employee ID format",
  }),
  resolution_notes: Joi.string().trim().max(2000).optional().allow(null, ""),
  compensation_offered: Joi.string().trim().max(500).optional().allow(null, ""),
}).min(1);

export const queryComplaintSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().trim().max(100).optional().allow(""),
  status: Joi.string().valid(...VALID_STATUSES).optional(),
  severity: Joi.string().valid(...VALID_SEVERITIES).optional(),
  category: Joi.string().valid(...CANONICAL_CATEGORIES).optional(),
  guest_id: Joi.string().hex().length(24).optional(),
  room_id: Joi.string().hex().length(24).optional(),
  reservation_id: Joi.string().hex().length(24).optional(),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid("asc", "desc", "1", "-1").optional(),
});
