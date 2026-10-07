import Joi from "joi";

export const createRefundSchema = Joi.object({
  payment_id: Joi.string().hex().length(24).required().messages({
    "any.required": "payment_id is required",
    "string.length": "Invalid payment_id format",
  }),
  amount: Joi.number().required().greater(0).messages({
    "any.required": "refund amount is required",
    "number.greater": "refund amount must be greater than 0",
  }),
  reason: Joi.string().trim().min(3).max(500).required().messages({
    "any.required": "reason is required",
  }),
});
