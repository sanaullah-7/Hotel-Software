import Joi from "joi";

export const createPaymentSchema = Joi.object({
  invoice_id: Joi.string().hex().length(24).optional().allow(null),
  folio_id: Joi.string().hex().length(24).optional(),
  guest_id: Joi.string().hex().length(24).optional(),
  amount: Joi.number().required().greater(0).messages({
    "any.required": "payment amount is required",
    "number.greater": "payment amount must be greater than 0",
  }),
  payment_method: Joi.string().valid("CASH", "CREDIT_CARD", "BANK_TRANSFER", "WALLET", "OTHER").required(),
  transaction_id: Joi.string().allow("", null).max(100),
  cash_shift_id: Joi.string().hex().length(24).optional().allow(null),
}).or("folio_id", "invoice_id");
