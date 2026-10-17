import Joi from "joi";

export const createHousekeepingTaskSchema = Joi.object({
  room_id: Joi.string().hex().length(24).required().messages({
    "any.required": "room_id is required",
  }),
  assigned_to: Joi.string().hex().length(24).optional().allow(null),
  task_type: Joi.string().valid("CLEANING", "INSPECTION", "TURN_DOWN", "DEEP_CLEANING").required(),
  priority: Joi.string().valid("LOW", "MEDIUM", "HIGH", "URGENT").default("MEDIUM"),
  status: Joi.string().valid("PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "VERIFIED", "CANCELLED").optional(),
  scheduled_at: Joi.date().iso().optional().allow(null),
  scheduled_end_at: Joi.date().iso().optional().allow(null),
  started_at: Joi.date().iso().optional().allow(null),
  completed_at: Joi.date().iso().optional().allow(null),
  notes: Joi.string().allow("", null).max(500),
});

export const updateHousekeepingTaskSchema = Joi.object({
  assigned_to: Joi.string().hex().length(24).optional().allow(null),
  task_type: Joi.string().valid("CLEANING", "INSPECTION", "TURN_DOWN", "DEEP_CLEANING").optional(),
  status: Joi.string().valid("PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "VERIFIED", "CANCELLED").optional(),
  priority: Joi.string().valid("LOW", "MEDIUM", "HIGH", "URGENT").optional(),
  scheduled_at: Joi.date().iso().optional().allow(null),
  scheduled_end_at: Joi.date().iso().optional().allow(null),
  started_at: Joi.date().iso().optional().allow(null),
  completed_at: Joi.date().iso().optional().allow(null),
  notes: Joi.string().allow("", null).max(500),
});
