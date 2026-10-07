import Joi from "joi";

const LEAVE_TYPES = [
  'SICK',
  'CASUAL',
  'ANNUAL',
  'MATERNITY',
  'UNPAID',
  'SPECIAL',
  'PERSONAL',
  'OTHER'
];

const LEAVE_STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED'
];

export const createLeaveRequestSchema = Joi.object({
  employee_id: Joi.string().hex().length(24).required().messages({
    'string.hex': 'employee_id must be a valid 24-character hex ID',
    'string.length': 'employee_id must be 24 characters long',
    'any.required': 'employee_id is required'
  }),
  leave_type: Joi.string().trim().uppercase().valid(...LEAVE_TYPES).required().messages({
    'any.only': `leave_type must be one of: ${LEAVE_TYPES.join(', ')}`,
    'any.required': 'leave_type is required'
  }),
  start_date: Joi.date().iso().required().messages({
    'date.base': 'start_date must be a valid ISO date',
    'any.required': 'start_date is required'
  }),
  end_date: Joi.date().iso().required().messages({
    'date.base': 'end_date must be a valid ISO date',
    'any.required': 'end_date is required'
  }),
  days: Joi.number().integer().min(1).optional(),
  reason: Joi.string().trim().max(1000).required().messages({
    'string.empty': 'reason cannot be empty',
    'any.required': 'reason is required'
  }),
  status: Joi.string().trim().uppercase().valid(...LEAVE_STATUSES).default('PENDING'),
  approved_by: Joi.string().hex().length(24).allow(null, '').optional(),
  manager_comments: Joi.string().trim().max(1000).allow('', null).optional(),
});

export const updateLeaveRequestSchema = Joi.object({
  employee_id: Joi.string().hex().length(24).optional(),
  leave_type: Joi.string().trim().uppercase().valid(...LEAVE_TYPES).optional(),
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().optional(),
  days: Joi.number().integer().min(1).optional(),
  reason: Joi.string().trim().max(1000).optional(),
  status: Joi.string().trim().uppercase().valid(...LEAVE_STATUSES).optional(),
  approved_by: Joi.string().hex().length(24).allow(null, '').optional(),
  manager_comments: Joi.string().trim().max(1000).allow('', null).optional(),
}).min(1);
