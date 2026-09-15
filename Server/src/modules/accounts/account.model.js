import mongoose from "mongoose";
import { ROLES } from "../../constants/roles.js";

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
      // Agar traveller phone provide nahi karta, to multiple accounts ke liye phone missing reh sakta hai.
      sparse: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      // Database se data nikalte waqt password ko automatic chupaye rakhta hai (hide karta hai).
      select: false,
    },

    role: {
      type: String,
      // Account ka role sirf hamare predefined roles mein se ek ho sakta hai.
      enum: Object.values(ROLES),
      default: ROLES.TRAVELLER,
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "pending", "suspended", "banned"],
      default: "active",
    },

    // Boolean ka matlab sirf 2 values:
    // true  // email verified hai
    // false // email verified nahi hai
    // Ye dono fields verification ka status store karti hain.
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },

    // Phase 2 (OAuth) — schema won't need to change later
    googleId: { type: String, default: null },
    facebookId: { type: String, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("Account", accountSchema);
