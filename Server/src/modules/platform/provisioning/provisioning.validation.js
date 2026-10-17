import Joi from "joi";

export const onboardSchema = Joi.object({
  property_name: Joi.string().trim().required().min(3).max(100),
  address: Joi.string().trim().required().min(5).max(200),
  city: Joi.string().trim().required().min(2).max(50),
});
