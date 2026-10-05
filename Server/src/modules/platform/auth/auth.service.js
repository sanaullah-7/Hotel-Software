import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import Account from "../../../database/platform/models/account.model.js";
import PasswordReset from "../../../database/platform/models/passwordReset.model.js";
import ApiError from "../../../utils/apiError.js";
import logger from "../../../config/logger.js";
import { ENV } from "../../../config/env.js";
import { generateAccessToken, generateRefreshToken } from "../../../utils/generateToken.js";
import { ROLES } from "../../../constants/roles.js";

const MAX_FAILED_LOGINS = 5;
const LOCK_MS = 15 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

// Used to equalize timing between "unknown email" and "wrong password".
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", 10);

const tokenPayload = (account) => ({
  id: account._id,
  role: account.role,
  hotelId: account.hotelId,
  tv: account.tokenVersion ?? 0,
});

// Role/hotelId/status are decided by the backend. They are NEVER read from the client request.
export const registerAccount = async ({ fullName, email, phone, password }) => {
  const query = [{ email }];
  if (phone) query.push({ phone });
  const existing = await Account.findOne({ $or: query });

  if (existing) {
    throw new ApiError(409, "Account already exists with this email or phone");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // The unique indexes on email/phone are the final guarantee under concurrency
  // (E11000 is converted to 409 by the central error handler).
  const account = await Account.create({
    fullName,
    email,
    phone,
    password: hashedPassword,
    role: ROLES.HOTEL_USER,
    hotelId: null,
    status: "active",
  });

  return account;
};

export const loginAccount = async ({ email, password }) => {
  const account = await Account.findOne({ email }).select("+password");

  if (!account) {
    await bcrypt.compare(password, DUMMY_HASH);
    throw new ApiError(401, "Invalid email or password");
  }

  const now = new Date();

  // Account lock check
  if (account.lockUntil && account.lockUntil > now) {
    throw new ApiError(423, "Account is temporarily locked due to multiple failed login attempts. Try again later.");
  }

  // An expired lock starts a fresh failed-attempt window.
  if (account.lockUntil && account.lockUntil <= now) {
    account.failedLoginAttempts = 0;
    account.lockUntil = null;
    await Account.updateOne({ _id: account._id }, { $set: { failedLoginAttempts: 0, lockUntil: null } });
  }

  // Only active accounts can log in.
  if (account.status !== "active") {
    throw new ApiError(403, "Account is not active. Contact support.");
  }

  const isMatch = await bcrypt.compare(password, account.password);

  if (!isMatch) {
    // Atomic increment so concurrent guesses cannot bypass the counter.
    const updated = await Account.findByIdAndUpdate(
      account._id,
      { $inc: { failedLoginAttempts: 1 } },
      { returnDocument: "after" }
    );
    if (updated && updated.failedLoginAttempts >= MAX_FAILED_LOGINS) {
      await Account.updateOne({ _id: account._id }, { $set: { lockUntil: new Date(Date.now() + LOCK_MS) } });
    }
    throw new ApiError(401, "Invalid email or password");
  }

  if (account.failedLoginAttempts > 0 || account.lockUntil) {
    await Account.updateOne({ _id: account._id }, { $set: { failedLoginAttempts: 0, lockUntil: null } });
  }

  const payload = tokenPayload(account);
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return { account, accessToken, refreshToken };
};

// Revokes every access/refresh token issued so far for this account.
export const logoutAccount = async (accountId) => {
  await Account.updateOne({ _id: accountId }, { $inc: { tokenVersion: 1 } });
};

export const forgotPassword = async (email) => {
  const account = await Account.findOne({ email });
  if (!account) {
    // Return standard success to prevent email enumeration attacks
    return true;
  }

  // Generate 6 digit OTP
  const otp = crypto.randomInt(100000, 1000000).toString();

  // Save hashed OTP (expires in 15 mins)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await PasswordReset.create({
    accountId: account._id,
    otp: await bcrypt.hash(otp, 10),
    expiresAt,
  });

  // Email delivery is simulated; never print OTPs outside development/test.
  if (ENV.NODE_ENV !== "production") {
    logger.info(`[SIMULATED EMAIL] Password reset OTP for ${email}: ${otp}`);
  }

  return true;
};

export const resetPassword = async ({ email, otp, newPassword }) => {
  const account = await Account.findOne({ email });
  if (!account) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  const resetRecords = await PasswordReset.find({
    accountId: account._id,
    isUsed: false,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: MAX_OTP_ATTEMPTS },
  }).sort({ createdAt: -1 });

  if (resetRecords.length === 0) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  let validRecord = null;
  for (const record of resetRecords) {
    const isMatch = await bcrypt.compare(otp, record.otp);
    if (isMatch) {
      validRecord = record;
      break;
    }
  }

  if (!validRecord) {
    // Brute-force protection: burn an attempt on every outstanding OTP.
    await PasswordReset.updateMany(
      { accountId: account._id, isUsed: false },
      { $inc: { attempts: 1 } }
    );
    throw new ApiError(400, "Invalid or expired OTP");
  }

  // Single-use: atomically consume the record; only one concurrent request can win.
  const consumed = await PasswordReset.findOneAndUpdate(
    { _id: validRecord._id, isUsed: false },
    { $set: { isUsed: true } }
  );
  if (!consumed) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  // Update password, clear lock state and revoke all existing sessions.
  await Account.updateOne(
    { _id: account._id },
    {
      $set: { password: hashed, failedLoginAttempts: 0, lockUntil: null },
      $inc: { tokenVersion: 1 },
    }
  );

  // Invalidate all pending reset tokens for this account
  await PasswordReset.updateMany({ accountId: account._id }, { $set: { isUsed: true } });
};

export const refreshAuthToken = async (refreshToken) => {
  if (!refreshToken || typeof refreshToken !== "string") {
    throw new ApiError(401, "No refresh token provided");
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, ENV.JWT_REFRESH_SECRET, { algorithms: ["HS256"] });
  } catch (err) {
    throw new ApiError(401, "Invalid refresh token");
  }

  if (decoded.type !== "refresh") {
    throw new ApiError(401, "Invalid refresh token");
  }

  const account = await Account.findById(decoded.id);
  if (!account || account.status !== "active") {
    throw new ApiError(401, "Invalid refresh token or inactive account");
  }

  if ((decoded.tv ?? 0) !== (account.tokenVersion ?? 0)) {
    throw new ApiError(401, "Refresh token has been revoked");
  }

  const payload = tokenPayload(account);

  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  return { newAccessToken, newRefreshToken };
};
