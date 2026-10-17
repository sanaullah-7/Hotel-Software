import Joi from "joi";

export const askAssistantSchema = Joi.object({
  message: Joi.string().trim().min(1).max(2000).required().messages({
    "any.required": "Message is required",
    "string.empty": "Message cannot be empty",
  }),
  history: Joi.array()
    .items(
      Joi.object({
        sender: Joi.string().valid("user", "ai").required(),
        text: Joi.string().required(),
      })
    )
    .optional(),
});
