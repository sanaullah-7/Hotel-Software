import Joi from "joi";

const TIME = /^([01]\d|2[0-3]):?([0-5]\d)$/;

export const updateProfileSchema = Joi.object({
  property_name: Joi.string().trim().min(2).max(150),
  legal_name: Joi.string().trim().max(200).allow(""),
  email: Joi.string().email().trim().lowercase().max(150),
  phone: Joi.string().trim().min(5).max(30),
  address: Joi.string().trim().min(1).max(250),
  city: Joi.string().trim().min(1).max(100),
  country: Joi.string().trim().min(1).max(100),
  currency: Joi.string().length(3).uppercase(),
  timezone: Joi.string().trim().max(60),
  logo_url: Joi.string().uri().max(500).allow("")
}).min(1); // At least one field must be provided to update

export const updatePoliciesSchema = Joi.object({
  check_in_time: Joi.string().pattern(TIME).message("Must be a valid time format HH:mm"),
  check_out_time: Joi.string().pattern(TIME).message("Must be a valid time format HH:mm"),
  early_checkin_policy: Joi.string().max(1000).allow(""),
  late_checkout_policy: Joi.string().max(1000).allow(""),
  cancellation_policy: Joi.string().max(1000).allow(""),
  no_show_policy: Joi.string().max(1000).allow(""),
  pet_policy: Joi.string().max(1000).allow(""),
  smoking_policy: Joi.string().max(1000).allow(""),
  age_policy: Joi.string().max(1000).allow(""),
  payment_methods_accepted: Joi.array().items(Joi.string().trim().max(50)).max(30),
  id_verification_required: Joi.boolean(),
  pets_allowed: Joi.boolean()
}).min(1);
