import Joi from "joi";

export const createMaintenanceTicketSchema = Joi.object({
  title: Joi.string().required().trim().max(150),
  description: Joi.string().required().trim().max(1000),
  room_id: Joi.string().hex().length(24).optional().allow(null),
  location_details: Joi.string().allow("", null).max(200),
  priority: Joi.string().valid("LOW", "MEDIUM", "HIGH", "CRITICAL").default("MEDIUM"),
  assigned_to: Joi.string().hex().length(24).optional().allow(null),
});

export const updateMaintenanceTicketSchema = Joi.object({
  assigned_to: Joi.string().hex().length(24).optional().allow(null),
  status: Joi.string().valid("OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED").optional(),
  priority: Joi.string().valid("LOW", "MEDIUM", "HIGH", "CRITICAL").optional(),
  resolution_notes: Joi.string().allow("", null).max(1000),
});
