import Joi from "joi";

export const createFolioSchema = Joi.object({
  guest_id: Joi.string().hex().length(24).optional(),
  reservation_id: Joi.string().hex().length(24).optional().allow(null),
  stay_id: Joi.string().hex().length(24).optional().allow(null),
  currency: Joi.string().default("PKR"),
}).or("guest_id", "reservation_id");
