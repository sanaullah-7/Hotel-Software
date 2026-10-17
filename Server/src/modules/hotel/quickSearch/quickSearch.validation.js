import Joi from 'joi';

export const quickSearchSchema = Joi.object({
  query: Joi.object({
    q: Joi.string().trim().max(100).optional().allow('').messages({
      'string.max': 'Search query cannot exceed 100 characters',
    }),
    limit: Joi.number().integer().min(1).max(20).default(5).messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 20',
    }),
  }),
});
