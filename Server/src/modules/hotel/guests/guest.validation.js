import Joi from "joi";

const optionalText = (max) => Joi.string().trim().max(max).allow('', null);

export const createGuestSchema = Joi.object({
  guest_ref: Joi.string().trim().max(50),
  first_name: Joi.string().trim().max(100).required(),
  last_name: Joi.string().trim().max(100).required(),
  email: Joi.string().trim().lowercase().email().max(150).allow('', null),
  phone: Joi.string().trim().max(30).allow('', null),
  passport_number: Joi.string().trim().uppercase().pattern(/^[A-Z0-9][A-Z0-9_\-\/ ]*$/).max(50).allow('', null)
    .messages({ 'string.pattern.base': 'passport_number contains invalid characters' }),
  national_id: Joi.string().trim().uppercase().pattern(/^[A-Z0-9][A-Z0-9_\-\/ ]*$/).max(50).allow('', null)
    .messages({ 'string.pattern.base': 'national_id contains invalid characters' }),
  address: optionalText(255),
  city: optionalText(100),
  country: optionalText(100),
  nationality: optionalText(100),
  date_of_birth: Joi.date().iso().max('now').allow(null, ''),
  vip_status: Joi.boolean().default(false),
  notes: optionalText(1000),
});

// guest_ref is a system-generated identifier and is IMMUTABLE after creation:
// it is deliberately absent from the update schema (stripped if sent).
export const updateGuestSchema = Joi.object({
  first_name: Joi.string().trim().max(100),
  last_name: Joi.string().trim().max(100),
  email: Joi.string().trim().lowercase().email().max(150).allow('', null),
  phone: Joi.string().trim().max(30).allow('', null),
  passport_number: Joi.string().trim().uppercase().pattern(/^[A-Z0-9][A-Z0-9_\-\/ ]*$/).max(50).allow('', null)
    .messages({ 'string.pattern.base': 'passport_number contains invalid characters' }),
  national_id: Joi.string().trim().uppercase().pattern(/^[A-Z0-9][A-Z0-9_\-\/ ]*$/).max(50).allow('', null)
    .messages({ 'string.pattern.base': 'national_id contains invalid characters' }),
  address: optionalText(255),
  city: optionalText(100),
  country: optionalText(100),
  nationality: optionalText(100),
  date_of_birth: Joi.date().iso().max('now').allow(null, ''),
  vip_status: Joi.boolean(),
  notes: optionalText(1000),
}).min(1);
