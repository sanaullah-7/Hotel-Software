import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      default: null,
    },
    planTier: {
      type: String,
      enum: ["BASIC", "STANDARD", "PRO", "PREMIUM", "ENTERPRISE"],
      default: "STANDARD",
      uppercase: true,
      trim: true,
    },
    planName: {
      type: String,
      required: true,
      default: "Standard Pro",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      default: 9999,
    },
    billingPeriod: {
      type: String,
      enum: ["month", "quarter", "year"],
      default: "month",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "TRIAL", "EXPIRED", "SUSPENDED", "CANCELLED"],
      default: "ACTIVE",
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
    },
    paymentMethod: {
      type: String,
      default: "Direct Bank Transfer",
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);
