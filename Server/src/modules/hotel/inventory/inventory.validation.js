import Joi from "joi";

export const createInventoryItemSchema = Joi.object({
  sku: Joi.string().trim().max(50).required().messages({
    "any.required": "sku is required",
    "string.empty": "sku cannot be empty",
  }),
  name: Joi.string().trim().max(150).required().messages({
    "any.required": "name is required",
    "string.empty": "name cannot be empty",
  }),
  category: Joi.string().trim().max(100).required().messages({
    "any.required": "category is required",
    "string.empty": "category cannot be empty",
  }),
  description: Joi.string().trim().max(1000).optional().allow("", null),
  location_type: Joi.string().valid("ROOM", "STORAGE").default("STORAGE"),
  room_id: Joi.string().hex().length(24).optional().allow(null),
  room_number: Joi.string().trim().max(50).optional().allow("", null),
  location: Joi.string().trim().max(200).optional().allow("", null),
  quantity: Joi.number().min(0).default(0),
  unit: Joi.string().trim().max(50).default("PIECE"),
  reorder_level: Joi.number().min(0).default(10),
  unit_cost: Joi.number().min(0).default(0),
  condition: Joi.string().valid("NEW", "GOOD", "FAIR", "DAMAGED").default("GOOD"),
  supplier: Joi.string().trim().max(150).optional().allow("", null),
  notes: Joi.string().trim().max(1000).optional().allow("", null),
  status: Joi.string().valid("ACTIVE", "INACTIVE").default("ACTIVE"),
});

export const updateInventoryItemSchema = Joi.object({
  sku: Joi.string().trim().max(50).optional(),
  name: Joi.string().trim().max(150).optional(),
  category: Joi.string().trim().max(100).optional(),
  description: Joi.string().trim().max(1000).optional().allow("", null),
  location_type: Joi.string().valid("ROOM", "STORAGE").optional(),
  room_id: Joi.string().hex().length(24).optional().allow(null),
  room_number: Joi.string().trim().max(50).optional().allow("", null),
  location: Joi.string().trim().max(200).optional().allow("", null),
  quantity: Joi.number().min(0).optional(),
  unit: Joi.string().trim().max(50).optional(),
  reorder_level: Joi.number().min(0).optional(),
  unit_cost: Joi.number().min(0).optional(),
  condition: Joi.string().valid("NEW", "GOOD", "FAIR", "DAMAGED").optional(),
  supplier: Joi.string().trim().max(150).optional().allow("", null),
  notes: Joi.string().trim().max(1000).optional().allow("", null),
  status: Joi.string().valid("ACTIVE", "INACTIVE").optional(),
}).min(1);

export const createInventoryMovementSchema = Joi.object({
  item_id: Joi.string().hex().length(24).required().messages({
    "any.required": "item_id is required",
  }),
  movement_type: Joi.string()
    .valid("PURCHASE", "TRANSFER", "CONSUMPTION", "LOSS", "ADJUSTMENT")
    .required()
    .messages({
      "any.required": "movement_type is required",
    }),
  quantity: Joi.number().greater(0).required().messages({
    "any.required": "quantity is required",
    "number.greater": "quantity must be greater than 0",
  }),
  date: Joi.date().iso().optional(),
  recorded_by: Joi.string().hex().length(24).required().messages({
    "any.required": "recorded_by is required",
  }),
  reference_id: Joi.string().hex().length(24).optional().allow(null),
  reference_type: Joi.string().trim().max(50).optional().allow("", null),
  notes: Joi.string().trim().max(1000).optional().allow("", null),
});

export const createInventoryIncidentSchema = Joi.object({
  incident_ref: Joi.string().trim().max(50).optional(),
  item_id: Joi.string().hex().length(24).required().messages({
    "any.required": "item_id is required",
  }),
  quantity_lost: Joi.number().integer().min(1).required().messages({
    "any.required": "quantity_lost is required",
    "number.min": "quantity_lost must be at least 1",
  }),
  unit_loss_value: Joi.number().min(0).optional(),
  total_loss_value: Joi.number().min(0).optional(),
  date: Joi.date().iso().optional(),
  reason: Joi.string().valid("DAMAGE", "THEFT", "EXPIRED", "UNKNOWN").required().messages({
    "any.required": "reason is required",
  }),
  description: Joi.string().trim().max(1000).optional().allow("", null),
  reported_by: Joi.string().hex().length(24).optional(),
  assigned_to: Joi.string().hex().length(24).optional().allow(null),
  status: Joi.string().valid("REPORTED", "INVESTIGATING", "RESOLVED").default("REPORTED"),
  resolution_type: Joi.string().valid("RECOVERED", "REPLACED", "WRITTEN_OFF").optional().allow(null),
  resolution_notes: Joi.string().trim().max(1000).optional().allow("", null),
  resolution_date: Joi.date().iso().optional().allow(null),
  room_id: Joi.string().hex().length(24).optional().allow(null),
  room_number: Joi.string().trim().max(50).optional().allow("", null),
  guest_id: Joi.string().hex().length(24).optional().allow(null),
  guest_charge_id: Joi.string().hex().length(24).optional().allow(null),
});

export const updateInventoryIncidentSchema = Joi.object({
  status: Joi.string().valid("REPORTED", "INVESTIGATING", "RESOLVED").optional(),
  resolution_type: Joi.string().valid("RECOVERED", "REPLACED", "WRITTEN_OFF").optional().allow(null),
  resolution_notes: Joi.string().trim().max(1000).optional().allow("", null),
  resolution_date: Joi.date().iso().optional().allow(null),
  assigned_to: Joi.string().hex().length(24).optional().allow(null),
  description: Joi.string().trim().max(1000).optional().allow("", null),
  timeline_entry: Joi.object({
    action: Joi.string().trim().required(),
    detail: Joi.string().trim().optional().allow("", null),
    user: Joi.string().trim().optional().allow("", null),
    user_id: Joi.string().hex().length(24).optional().allow(null),
  }).optional(),
}).min(1);

export const stockAdjustmentSchema = Joi.object({
  item_id: Joi.string().hex().length(24).optional(),
  adjustment_type: Joi.string().valid("INCREMENT", "DECREMENT", "SET", "ADD", "SUBTRACT").required().messages({
    "any.required": "adjustment_type is required",
  }),
  quantity: Joi.number().min(0).required().messages({
    "any.required": "quantity is required",
  }),
  reason: Joi.string().valid("PURCHASE", "TRANSFER", "CONSUMPTION", "LOSS", "ADJUSTMENT", "AUDIT").required(),
  notes: Joi.string().trim().max(1000).optional().allow("", null),
  recorded_by: Joi.string().hex().length(24).optional(),
  reference_id: Joi.string().hex().length(24).optional().allow(null),
  reference_type: Joi.string().trim().max(50).optional().allow("", null),
});
