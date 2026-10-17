import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    property_name: {
      type: String,
      required: true,
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    province: {
      type: String,
      trim: true,
      default: "Punjab",
    },
    country: {
      type: String,
      trim: true,
      default: "Pakistan",
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    totalRooms: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "active", "inactive", "suspended", "rejected"],
      default: "pending",
    },
    tenant_db_name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    subscriptionPlan: {
      type: String,
      enum: ["BASIC", "STANDARD", "PRO", "PREMIUM", "ENTERPRISE"],
      default: "STANDARD",
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    suspensionReason: {
      type: String,
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    suspendedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Hotel", hotelSchema);
