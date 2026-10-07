import Joi from "joi";

export const CANONICAL_DEPARTMENTS = [
  "VIP_ARRIVALS",
  "HOUSEKEEPING",
  "MAINTENANCE",
  "FOOD_AND_BEVERAGE",
  "SECURITY_FRONT_DESK",
  "GENERAL",
];

export const VALID_SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
export const VALID_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED"];

export const createAlertSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200).required().messages({
    "any.required": "Alert title is required",
    "string.empty": "Alert title cannot be empty",
    "string.min": "Alert title must be at least 2 characters",
    "string.max": "Alert title cannot exceed 200 characters",
  }),
  message: Joi.string().trim().min(2).max(2000).required().messages({
    "any.required": "Alert message is required",
    "string.empty": "Alert message cannot be empty",
    "string.min": "Alert message must be at least 2 characters",
    "string.max": "Alert message cannot exceed 2000 characters",
  }),
  department: Joi.string()
    .valid(...CANONICAL_DEPARTMENTS)
    .default("GENERAL")
    .optional()
    .messages({
      "any.only": "Invalid alert department",
    }),
  type: Joi.string().trim().max(100).optional(),
  severity: Joi.string()
    .valid(...VALID_SEVERITIES)
    .default("HIGH")
    .optional()
    .messages({
      "any.only": "Invalid alert severity",
    }),
  status: Joi.string()
    .valid(...VALID_STATUSES)
    .default("OPEN")
    .optional()
    .messages({
      "any.only": "Invalid alert status",
    }),
  action_required: Joi.string().trim().max(500).optional().allow(null, ""),
  location: Joi.string().trim().max(200).optional().allow(null, ""),
  guest_name: Joi.string().trim().max(200).optional().allow(null, ""),
  reported_by: Joi.string().trim().max(100).optional().allow(null, ""),
  assigned_to: Joi.string().trim().max(100).optional().allow(null, ""),
  expires_at: Joi.date().iso().optional().allow(null),
});

export const updateAlertSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200).optional(),
  message: Joi.string().trim().min(2).max(2000).optional(),
  department: Joi.string()
    .valid(...CANONICAL_DEPARTMENTS)
    .optional()
    .messages({
      "any.only": "Invalid alert department",
    }),
  type: Joi.string().trim().max(100).optional(),
  severity: Joi.string()
    .valid(...VALID_SEVERITIES)
    .optional()
    .messages({
      "any.only": "Invalid alert severity",
    }),
  status: Joi.string()
    .valid(...VALID_STATUSES)
    .optional()
    .messages({
      "any.only": "Invalid alert status",
    }),
  is_active: Joi.boolean().optional(),
  action_required: Joi.string().trim().max(500).optional().allow(null, ""),
  location: Joi.string().trim().max(200).optional().allow(null, ""),
  guest_name: Joi.string().trim().max(200).optional().allow(null, ""),
  reported_by: Joi.string().trim().max(100).optional().allow(null, ""),
  assigned_to: Joi.string().trim().max(100).optional().allow(null, ""),
  expires_at: Joi.date().iso().optional().allow(null),
}).min(1);

export const queryAlertSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().trim().max(100).optional().allow(""),
  status: Joi.string().valid(...VALID_STATUSES).optional(),
  severity: Joi.string().valid(...VALID_SEVERITIES).optional(),
  department: Joi.string().valid(...CANONICAL_DEPARTMENTS).optional(),
  type: Joi.string().trim().max(100).optional(),
  is_active: Joi.boolean().optional(),
  sortBy: Joi.string()
    .valid("created_at", "updated_at", "severity", "status", "department", "title")
    .optional(),
  sortOrder: Joi.string().valid("asc", "desc", "1", "-1").optional(),
});
