import Joi from 'joi';

export const openShiftSchema = Joi.object({
  opening_float: Joi.number().min(0).precision(2).required().messages({
    'any.required': 'Opening float is required',
    'number.base': 'Opening float must be a number',
    'number.min': 'Opening float cannot be negative',
  }),
  drawer_name: Joi.string().trim().max(100).optional().allow(''),
  notes: Joi.string().trim().max(1000).optional().allow(''),
});

export const closeShiftSchema = Joi.object({
  actual_counted_cash: Joi.number().min(0).precision(2).required().messages({
    'any.required': 'Actual counted cash is required to close shift',
    'number.base': 'Actual counted cash must be a number',
    'number.min': 'Actual counted cash cannot be negative',
  }),
  shift_id: Joi.string().hex().length(24).optional(),
  notes: Joi.string().trim().max(1000).optional().allow(''),
});

export const getShiftsQuerySchema = Joi.object({
  status: Joi.string().valid('OPEN', 'CLOSED').optional(),
  staff_id: Joi.string().hex().length(24).optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});
