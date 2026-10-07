import Joi from 'joi';

export const PAYROLL_RUN_STATUSES = ['DRAFT', 'PROCESSING', 'APPROVED', 'COMPLETED', 'FAILED'];
export const PAYROLL_ITEM_STATUSES = ['PENDING', 'PAID', 'FAILED'];

export const createPayrollRunSchema = Joi.object({
  run_ref: Joi.string().trim().max(50).optional(),
  period_start: Joi.date().iso().required().messages({
    'any.required': 'period_start is required',
    'date.format': 'period_start must be a valid ISO date',
  }),
  period_end: Joi.date().iso().required().messages({
    'any.required': 'period_end is required',
    'date.format': 'period_end must be a valid ISO date',
  }),
  process_date: Joi.date().iso().optional().allow(null),
  notes: Joi.string().allow('', null).optional(),
  auto_generate_items: Joi.boolean().default(true),
  status: Joi.string()
    .uppercase()
    .valid(...PAYROLL_RUN_STATUSES)
    .default('DRAFT')
    .messages({
      'any.only': `status must be one of: ${PAYROLL_RUN_STATUSES.join(', ')}`,
    }),
});

export const updatePayrollRunSchema = Joi.object({
  status: Joi.string()
    .uppercase()
    .valid(...PAYROLL_RUN_STATUSES)
    .optional()
    .messages({
      'any.only': `status must be one of: ${PAYROLL_RUN_STATUSES.join(', ')}`,
    }),
  notes: Joi.string().allow('', null).optional(),
  process_date: Joi.date().iso().optional().allow(null),
}).min(1);

export const createPayrollItemSchema = Joi.object({
  employee_id: Joi.string().hex().length(24).required().messages({
    'string.hex': 'employee_id must be a valid 24-character hex ID',
    'string.length': 'employee_id must be 24 characters long',
    'any.required': 'employee_id is required',
  }),
  base_salary: Joi.number().min(0).optional(),
  bonuses: Joi.number().min(0).default(0),
  deductions: Joi.number().min(0).default(0),
  status: Joi.string()
    .uppercase()
    .valid(...PAYROLL_ITEM_STATUSES)
    .default('PENDING')
    .messages({
      'any.only': `status must be one of: ${PAYROLL_ITEM_STATUSES.join(', ')}`,
    }),
});

export const updatePayrollItemSchema = Joi.object({
  base_salary: Joi.number().min(0).optional(),
  bonuses: Joi.number().min(0).optional(),
  deductions: Joi.number().min(0).optional(),
  status: Joi.string()
    .uppercase()
    .valid(...PAYROLL_ITEM_STATUSES)
    .optional()
    .messages({
      'any.only': `status must be one of: ${PAYROLL_ITEM_STATUSES.join(', ')}`,
    }),
}).min(1);

export const queryPayrollRunSchema = Joi.object({
  status: Joi.string().uppercase().valid(...PAYROLL_RUN_STATUSES).optional(),
  period_start: Joi.date().iso().optional(),
  period_end: Joi.date().iso().optional(),
  search: Joi.string().trim().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

export const queryPayrollItemSchema = Joi.object({
  run_id: Joi.string().hex().length(24).optional(),
  employee_id: Joi.string().hex().length(24).optional(),
  status: Joi.string().uppercase().valid(...PAYROLL_ITEM_STATUSES).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
});

export const updateEmployeeSalarySchema = Joi.object({
  salary: Joi.number().min(0).required().messages({
    'any.required': 'salary is required',
    'number.min': 'salary must be greater than or equal to 0',
  }),
});
