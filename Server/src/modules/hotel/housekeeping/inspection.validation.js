import Joi from "joi";

export const createInspectionSchema = Joi.object({
  task_id: Joi.string().hex().length(24).optional().allow(null),
  room_id: Joi.string().hex().length(24).optional().allow(null),
  room_number: Joi.string().trim().max(50).optional().allow("", null),
  inspector_id: Joi.string().hex().length(24).optional().allow(null),
  inspector_name: Joi.string().trim().max(100).optional().allow("", null),
  checklist_id: Joi.string().hex().length(24).optional().allow(null),
  status: Joi.string().valid("PENDING", "PASSED", "FAILED").default("PENDING"),
  passed: Joi.boolean().optional(),
  score: Joi.number().min(0).max(100).optional().default(0),
  comments: Joi.string().trim().max(1000).optional().allow("", null),
  inspected_at: Joi.date().iso().optional(),
}).or("task_id", "room_id", "room_number");

export const updateInspectionSchema = Joi.object({
  task_id: Joi.string().hex().length(24).optional().allow(null),
  room_id: Joi.string().hex().length(24).optional().allow(null),
  room_number: Joi.string().trim().max(50).optional().allow("", null),
  inspector_id: Joi.string().hex().length(24).optional().allow(null),
  inspector_name: Joi.string().trim().max(100).optional().allow("", null),
  checklist_id: Joi.string().hex().length(24).optional().allow(null),
  status: Joi.string().valid("PENDING", "PASSED", "FAILED").optional(),
  passed: Joi.boolean().optional(),
  score: Joi.number().min(0).max(100).optional(),
  comments: Joi.string().trim().max(1000).optional().allow("", null),
  inspected_at: Joi.date().iso().optional(),
});

export const createChecklistSchema = Joi.object({
  name: Joi.string().trim().max(150).required().messages({
    "any.required": "Checklist name is required",
    "string.empty": "Checklist name cannot be empty",
  }),
  task_type: Joi.string().trim().max(100).default("INSPECTION"),
  items: Joi.array().items(
    Joi.object({
      description: Joi.string().trim().required().messages({
        "any.required": "Item description is required",
        "string.empty": "Item description cannot be empty",
      }),
      is_required: Joi.boolean().default(true),
    })
  ).default([]),
  status: Joi.string().valid("ACTIVE", "INACTIVE").default("ACTIVE"),
});

export const updateChecklistSchema = Joi.object({
  name: Joi.string().trim().max(150).optional(),
  task_type: Joi.string().trim().max(100).optional(),
  items: Joi.array().items(
    Joi.object({
      description: Joi.string().trim().required(),
      is_required: Joi.boolean().default(true),
    })
  ).optional(),
  status: Joi.string().valid("ACTIVE", "INACTIVE").optional(),
});
