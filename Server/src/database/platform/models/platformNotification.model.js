import mongoose from "mongoose";

const platformNotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["info", "warning", "error", "success"],
      default: "info",
      index: true,
    },
    category: {
      type: String,
      enum: ["hotel", "subscription", "finance", "security", "system"],
      default: "system",
      index: true,
    },
    entityId: {
      type: String,
      default: null,
    },
    entityType: {
      type: String,
      default: null,
    },
    recipientRole: {
      type: String,
      default: "PLATFORM_ADMIN",
      index: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PlatformNotification", platformNotificationSchema);
