import Joi from "joi";

export const createFolioSchema = Joi.object({
  guest_id: Joi.string().hex().length(24).required().messages({
    "any.required": "guest_id is required",
  }),
  reservation_id: Joi.string().hex().length(24).optional().allow(null),
  stay_id: Joi.string().hex().length(24).optional().allow(null),
  currency: Joi.string().default("PKR"),
});
