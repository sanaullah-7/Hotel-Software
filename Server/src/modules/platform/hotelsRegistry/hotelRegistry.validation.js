import Joi from "joi";

export const reasonSchema = Joi.object({
  reason: Joi.string().trim().max(500).allow("", null).optional(),
});
