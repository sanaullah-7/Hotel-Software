import Joi from "joi";

export const lineItemSchema = Joi.object({
  charge_id: Joi.string().hex().length(24).optional().allow(null),
  description: Joi.string().required().trim().max(200),
  amount: Joi.number().required().min(0),
  tax_amount: Joi.number().min(0).default(0),
});

export const createInvoiceSchema = Joi.object({
  folio_id: Joi.string().hex().length(24).optional(),
  reservation_id: Joi.string().trim().max(100).optional(),
  guest_id: Joi.string().hex().length(24).optional(),
  due_date: Joi.date().iso().optional().allow(null),
  line_items: Joi.array().items(lineItemSchema).min(1).required().messages({
    "array.min": "Invoice must contain at least one line item",
  }),
}).or("folio_id", "reservation_id");

export const updateInvoiceSchema = Joi.object({
  due_date: Joi.date().iso().optional(),
  status: Joi.string().valid("UNPAID", "PARTIALLY_PAID", "PAID", "VOIDED").optional(),
});
