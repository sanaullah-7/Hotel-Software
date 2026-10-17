import Joi from "joi";

export const checkInSchema = Joi.object({
  reservation_id: Joi.string().hex().length(24).required().messages({
    "any.required": "reservation_id is required for check-in",
    "string.length": "reservation_id must be a valid 24-character ObjectId",
  }),
  room_id: Joi.string().hex().length(24).optional().allow(null),
  primary_guest_id: Joi.string().hex().length(24).optional().allow(null),
  total_guests: Joi.number().integer().min(1).default(1),
  notes: Joi.string().allow("", null).max(500),
  manager_override: Joi.boolean().optional(),
  override_cleanliness: Joi.boolean().optional(),
});

export const checkOutSchema = Joi.object({
  stay_id: Joi.string().hex().length(24).optional(),
  reservation_id: Joi.string().hex().length(24).optional(),
  notes: Joi.string().allow("", null).max(500),
  damage_reported: Joi.object({
    has_damage: Joi.boolean().optional(),
    item_name: Joi.string().allow("", null).max(200).optional(),
    amount: Joi.number().min(0).optional(),
    is_missing: Joi.boolean().optional(),
  }).optional().allow(null),
}).unknown(true);

export const transferStayRoomSchema = Joi.object({
  room_id: Joi.string().hex().length(24).optional().messages({
    "string.length": "room_id must be a valid 24-character ObjectId",
  }),
  new_room_id: Joi.string().hex().length(24).optional().messages({
    "string.length": "new_room_id must be a valid 24-character ObjectId",
  }),
  source_room_id: Joi.string().hex().length(24).optional().allow(null),
  stay_room_id: Joi.string().hex().length(24).optional().allow(null),
  reason: Joi.string().allow("", null).max(500),
  notes: Joi.string().allow("", null).max(500),
  manager_override: Joi.boolean().optional(),
  override_cleanliness: Joi.boolean().optional(),
}).or("room_id", "new_room_id").messages({
  "object.missing": "Destination room_id is required",
});

