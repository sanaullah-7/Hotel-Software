import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    tier: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      enum: ["BASIC", "STANDARD", "PRO", "PREMIUM", "ENTERPRISE"],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    billingPeriod: {
      type: String,
      default: "month",
      enum: ["month", "quarter", "year"],
    },
    maxRooms: {
      type: Number,
      required: true,
      default: 50,
    },
    maxStaff: {
      type: Number,
      default: 10,
    },
    features: {
      type: [String],
      default: [],
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
