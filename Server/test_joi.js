import Joi from "joi";

const schema = Joi.object({
  otp: Joi.string().length(6).required()
});

const { error, value } = schema.validate({ otp: 123456 }, { stripUnknown: true });
console.log("Error:", error);
console.log("Value:", value);
console.log("Typeof otp:", typeof value.otp);
