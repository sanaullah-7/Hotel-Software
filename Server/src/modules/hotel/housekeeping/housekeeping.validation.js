import Joi from "joi";

export const createHousekeepingTaskSchema = Joi.object({
  room_id: Joi.string().hex().length(24).required().messages({
    "any.required": "room_id is required",
  }),
  assigned_to: Joi.string().hex().length(24).optional().allow(null),
  task_type: Joi.string().valid("CLEANING", "INSPECTION", "TURN_DOWN", "DEEP_CLEANING").required(),
  priority: Joi.string().valid("LOW", "MEDIUM", "HIGH", "URGENT").default("MEDIUM"),
  notes: Joi.string().allow("", null).max(500),
});

export const updateHousekeepingTaskSchema = Joi.object({
  assigned_to: Joi.string().hex().length(24).optional().allow(null),
  status: Joi.string().valid("PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "VERIFIED").optional(),
  priority: Joi.string().valid("LOW", "MEDIUM", "HIGH", "URGENT").optional(),
  notes: Joi.string().allow("", null).max(500),
});
