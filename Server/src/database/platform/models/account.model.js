import mongoose from "mongoose";
import { ROLES } from "../../../constants/roles.js";

const accountSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.HOTEL_USER,
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel", // Kept null if PLATFORM_ADMIN
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "pending", "suspended", "banned"],
      default: "active",
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    // Incremented on logout / password reset to revoke every previously issued token.
    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      // Never serialize credentials or security-state fields to a client.
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.failedLoginAttempts;
        delete ret.lockUntil;
        delete ret.tokenVersion;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.failedLoginAttempts;
        delete ret.lockUntil;
        delete ret.tokenVersion;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Indexes
// email / phone indexes are created by unique: true in schema
accountSchema.index({ hotelId: 1 });

export default mongoose.model("Account", accountSchema);
