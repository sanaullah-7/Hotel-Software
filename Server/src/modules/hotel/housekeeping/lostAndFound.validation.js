import Joi from "joi";

export const createLostFoundItemSchema = Joi.object({
  reference_number: Joi.string().trim().max(50).optional(),
  item_type: Joi.string().trim().max(100).required().messages({
    "any.required": "item_type is required",
    "string.empty": "item_type cannot be empty",
  }),
  item_name: Joi.string().trim().max(150).optional().allow("", null),
  description: Joi.string().trim().max(1000).required().messages({
    "any.required": "description is required",
    "string.empty": "description cannot be empty",
  }),
  found_location: Joi.string().trim().max(150).required().messages({
    "any.required": "found_location is required",
    "string.empty": "found_location cannot be empty",
  }),
  found_by: Joi.string().hex().length(24).optional().allow(null),
  finder_name: Joi.string().trim().max(100).optional().allow("", null),
  found_date: Joi.date().iso().optional(),
  status: Joi.string().valid("REPORTED", "CLAIMED", "DISCARDED", "DONATED").default("REPORTED"),
  claimed_by: Joi.string().trim().max(150).optional().allow("", null),
  claimed_date: Joi.date().iso().optional().allow(null),
});

export const updateLostFoundItemSchema = Joi.object({
  item_type: Joi.string().trim().max(100).optional(),
  item_name: Joi.string().trim().max(150).optional().allow("", null),
  description: Joi.string().trim().max(1000).optional(),
  found_location: Joi.string().trim().max(150).optional(),
  found_by: Joi.string().hex().length(24).optional().allow(null),
  finder_name: Joi.string().trim().max(100).optional().allow("", null),
  found_date: Joi.date().iso().optional(),
  status: Joi.string().valid("REPORTED", "CLAIMED", "DISCARDED", "DONATED").optional(),
  claimed_by: Joi.string().trim().max(150).optional().allow("", null),
  claimed_date: Joi.date().iso().optional().allow(null),
});
