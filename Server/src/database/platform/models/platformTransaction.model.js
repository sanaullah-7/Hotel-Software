import mongoose from "mongoose";

const platformTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
      index: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },
    planTier: {
      type: String,
      default: "STANDARD",
      uppercase: true,
      trim: true,
    },
    planName: {
      type: String,
      default: "Standard Subscription",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "PKR",
    },
    type: {
      type: String,
      enum: ["SUBSCRIPTION_NEW", "SUBSCRIPTION_RENEWAL", "PLAN_UPGRADE", "ONE_TIME_FEE", "REFUND"],
      default: "SUBSCRIPTION_RENEWAL",
    },
    status: {
      type: String,
      enum: ["SUCCESS", "PENDING", "FAILED", "REFUNDED"],
      default: "SUCCESS",
      index: true,
    },
    paymentMethod: {
      type: String,
      default: "Direct Bank Transfer",
    },
    referenceNumber: {
      type: String,
      default: "",
    },
    paidAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("PlatformTransaction", platformTransactionSchema);
