import Joi from 'joi';

const ATTENDANCE_STATUSES = [
  'PRESENT',
  'ABSENT',
  'LATE',
  'HALF_DAY',
  'ON_LEAVE',
  'HOLIDAY',
  'WEEKEND',
];

const SHIFT_OPTIONS = [
  'DAY',
  'NIGHT',
  'Day Shift',
  'Night Shift',
  'GENERAL',
];

export const createAttendanceSchema = Joi.object({
  employee_id: Joi.string().hex().length(24).required().messages({
    'string.hex': 'employee_id must be a valid 24-character hex ID',
    'string.length': 'employee_id must be 24 characters long',
    'any.required': 'employee_id is required',
    'string.empty': 'employee_id cannot be empty',
  }),
  date: Joi.date().iso().required().messages({
    'any.required': 'date is required',
    'date.format': 'date must be a valid ISO date',
  }),
  status: Joi.string()
    .uppercase()
    .valid(...ATTENDANCE_STATUSES)
    .default('PRESENT')
    .messages({
      'any.only': `status must be one of: ${ATTENDANCE_STATUSES.join(', ')}`,
    }),
  shift: Joi.string()
    .valid(...SHIFT_OPTIONS)
    .default('Day Shift')
    .messages({
      'any.only': `shift must be one of: ${SHIFT_OPTIONS.join(', ')}`,
    }),
  clock_in_time: Joi.date().iso().allow(null).optional(),
  clock_out_time: Joi.date().iso().allow(null).optional(),
  break_time: Joi.string().allow('', null).optional(),
  total_hours: Joi.string().allow('', null).optional(),
  notes: Joi.string().allow('', null).optional(),
});

export const updateAttendanceSchema = Joi.object({
  status: Joi.string()
    .uppercase()
    .valid(...ATTENDANCE_STATUSES)
    .optional()
    .messages({
      'any.only': `status must be one of: ${ATTENDANCE_STATUSES.join(', ')}`,
    }),
  shift: Joi.string()
    .valid(...SHIFT_OPTIONS)
    .optional()
    .messages({
      'any.only': `shift must be one of: ${SHIFT_OPTIONS.join(', ')}`,
    }),
  clock_in_time: Joi.date().iso().allow(null).optional(),
  clock_out_time: Joi.date().iso().allow(null).optional(),
  break_time: Joi.string().allow('', null).optional(),
  total_hours: Joi.string().allow('', null).optional(),
  notes: Joi.string().allow('', null).optional(),
}).min(1);

export const queryAttendanceSchema = Joi.object({
  query: Joi.object({
    date: Joi.date().iso().optional(),
    start_date: Joi.date().iso().optional(),
    end_date: Joi.date().iso().optional(),
    employee_id: Joi.string().hex().length(24).optional(),
    status: Joi.string().uppercase().valid(...ATTENDANCE_STATUSES).optional(),
    shift: Joi.string().valid(...SHIFT_OPTIONS).optional(),
    search: Joi.string().allow('').optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(1000).optional(),
  }),
});
