import crypto from "crypto";
import logger from "../../../config/logger.js";

// Generate a random 6 digit OTP
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const sendOTP = async (email, otp) => {
  // In a real application, you would integrate with SendGrid, AWS SES, or NodeMailer here.
  // For now, we simulate the email sending by logging it to the server console.
  logger.info(`[SIMULATED EMAIL] Sending OTP to ${email}: ${otp}`);
};
