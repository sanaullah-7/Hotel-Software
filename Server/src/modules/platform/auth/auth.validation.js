// Joi ek validation library hai.JO RULES DEFINE KARTI HA
// Client ne jo data bheja hai, kya woh hamare rules ke according hai?
import Joi from "joi";

//  Ye schema registration request ke data ko validate karta hai.
export const registerSchema = Joi.object({//Joi.object():"Main ek object ke rules define kar raha hoon."
  // User ka full name
  // fullName ki value string honi chahiye.
  fullName: Joi.string().trim().min(2).max(100).required().messages({
    // Matlab Joi ke specific error codes ke liye apne custom messages define kar rahe hain.
    "string.empty": "Full name is required",
    "string.min": "Full name must be at least 2 characters",
    "string.max": "Full name cannot exceed 100 characters",
  }),

  // User ki email
  email: Joi.string().trim().lowercase().email().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
  }),

  // Matlab Pakistani number ka specific pattern require kar rahe ho.
  phone: Joi.string()
  // "Phone number exactly mere defined pattern ke according hona chahiye."
    .pattern(/^03[0-9]{9}$/)//03 + 9 digits
    .messages({
      "string.pattern.base":
        "Phone must be a valid Pakistani number (03XXXXXXXXX)",
    }),

  // Password
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.empty": "Password is required",
  }),
});

//Login ke waqt sirf email aur password required hain.

export const loginSchema = Joi.object({
  // Account email
  email: Joi.string().trim().lowercase().email().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
  }),

  // Account password
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});
