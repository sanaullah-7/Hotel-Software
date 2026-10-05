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
});

export const checkOutSchema = Joi.object({
  stay_id: Joi.string().hex().length(24).optional(),
  reservation_id: Joi.string().hex().length(24).optional(),
  notes: Joi.string().allow("", null).max(500),
});
