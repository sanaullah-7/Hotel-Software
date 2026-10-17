import bcrypt from "bcryptjs";
import crypto from "crypto";

async function simulate() {
  const otp = crypto.randomInt(100000, 999999).toString();
  console.log("Generated OTP:", otp);

  const hash = await bcrypt.hash(otp, 10);
  console.log("Hash:", hash);

  const isValidOTP = await bcrypt.compare(otp, hash);
  console.log("isValidOTP (same):", isValidOTP);

  // Simulate user sending via Joi validation
  const submittedOtp = otp; // Joi passes it as string
  const isMatch = await bcrypt.compare(submittedOtp, hash);
  console.log("isMatch (submitted):", isMatch);
}

simulate();
