import Joi from "joi";

export const createGuestChargeSchema = Joi.object({
  folio_id: Joi.string().hex().length(24).optional().allow(null, ""),
  reservation_id: Joi.string().optional().allow(null, ""),
  guest_id: Joi.string().optional().allow(null, ""),
  room_number: Joi.string().optional().allow(null, ""),
  booking_id: Joi.string().optional().allow(null, ""), // compatibility alias
  charge_type: Joi.string()
    .valid(
      "ROOM_RATE",
      "RESTAURANT",
      "SPA",
      "MINIBAR",
      "LAUNDRY",
      "OTHER_SERVICE",
      "TAX",
      "FEE",
      "ROOM_SERVICE",
      "PARKING",
      "MISCELLANEOUS",
      "DAMAGE",
      "CONSUMPTION",
      "MISSING_ITEM",
      "Damage",
      "Consumption",
      "Minibar",
      "Room Service",
      "Other Service",
      "Laundry",
      "Miscellaneous",
      "External Order"
    )
    .required()
    .messages({
      "any.required": "charge_type is required",
    }),
  item_name: Joi.string().optional().allow("", null),
  quantity: Joi.number().min(1).optional().default(1),
  unit_price: Joi.number().min(0).optional(),
  description: Joi.string().trim().max(500).optional().allow("", null),
  amount: Joi.number().min(0).optional(),
  notes: Joi.string().trim().max(500).optional().allow("", null),
  date: Joi.date().iso().optional().allow(null),
  reference_id: Joi.string().hex().length(24).optional().allow(null, ""),
}).or("folio_id", "reservation_id", "booking_id", "guest_id", "room_number");
