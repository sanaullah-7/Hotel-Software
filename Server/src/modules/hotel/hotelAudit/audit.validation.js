import Joi from "joi";

export const createAuditLogSchema = Joi.object({
  module: Joi.string().trim().required().messages({
    "any.required": "Module is required",
  }),
  action: Joi.string().trim().required().messages({
    "any.required": "Action is required",
  }),
  description: Joi.string().trim().required().messages({
    "any.required": "Description is required",
  }),
  recordId: Joi.string().trim().allow("", null).optional(),
  entity_id: Joi.any().optional(),
  entity_name: Joi.string().trim().allow("", null).optional(),
  importance: Joi.string().trim().valid("Normal", "Important", "Critical").default("Normal"),
  status: Joi.string().trim().valid("Completed", "Failed", "Pending").default("Completed"),
  userName: Joi.string().trim().allow("", null).optional(),
  user_name: Joi.string().trim().allow("", null).optional(),
  userId: Joi.any().optional(),
  performed_by: Joi.any().optional(),
  previousValue: Joi.any().optional(),
  newValue: Joi.any().optional(),
  previous_value: Joi.any().optional(),
  new_value: Joi.any().optional(),
  changes: Joi.any().optional(),
  dateTime: Joi.date().iso().allow("", null).optional(),
  timestamp: Joi.date().iso().allow("", null).optional(),
  ipAddress: Joi.string().trim().allow("", null).optional(),
  ip_address: Joi.string().trim().allow("", null).optional(),
});
