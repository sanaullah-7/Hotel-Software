import Joi from "joi";

export const createExpenseSchema = Joi.object({
  expense_ref: Joi.string().trim().optional(),
  invoiceNo: Joi.string().trim().optional(),
  category: Joi.string().trim().allow("", null).optional(),
  description: Joi.string().trim().allow("", null).optional(),
  expense: Joi.string().trim().allow("", null).optional(),
  amount: Joi.number().min(0).required().messages({
    "any.required": "Amount is required",
    "number.min": "Amount cannot be negative",
  }),
  currency: Joi.string().trim().optional(),
  date: Joi.date().iso().allow("", null).optional(),
  expense_by: Joi.string().trim().allow("", null).optional(),
  expenseBy: Joi.string().trim().allow("", null).optional(),
  payment_method: Joi.string().trim().allow("", null).optional(),
  paymentMode: Joi.string().trim().allow("", null).optional(),
  status: Joi.string().trim().allow("", null).optional(),
  paid_to: Joi.string().trim().allow("", null).optional(),
  paidTo: Joi.string().trim().allow("", null).optional(),
  receipt_url: Joi.string().trim().allow("", null).optional(),
  cash_shift_id: Joi.string().hex().length(24).optional().allow("", null),
}).or("description", "expense");

export const updateExpenseSchema = Joi.object({
  expense_ref: Joi.string().trim().optional(),
  invoiceNo: Joi.string().trim().optional(),
  category: Joi.string().trim().allow("", null).optional(),
  description: Joi.string().trim().allow("", null).optional(),
  expense: Joi.string().trim().allow("", null).optional(),
  amount: Joi.number().min(0).optional(),
  currency: Joi.string().trim().optional(),
  date: Joi.date().iso().allow("", null).optional(),
  expense_by: Joi.string().trim().allow("", null).optional(),
  expenseBy: Joi.string().trim().allow("", null).optional(),
  payment_method: Joi.string().trim().allow("", null).optional(),
  paymentMode: Joi.string().trim().allow("", null).optional(),
  status: Joi.string().trim().allow("", null).optional(),
  paid_to: Joi.string().trim().allow("", null).optional(),
  paidTo: Joi.string().trim().allow("", null).optional(),
  receipt_url: Joi.string().trim().allow("", null).optional(),
});

export const bulkDeleteExpensesSchema = Joi.object({
  ids: Joi.array()
    .items(Joi.string().trim().required())
    .min(1)
    .required()
    .messages({
      "any.required": "Array of expense IDs is required",
      "array.min": "At least one ID must be provided for bulk deletion",
    }),
});
