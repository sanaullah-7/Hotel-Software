import mongoose from "mongoose";

const platformAuditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      index: true,
      uppercase: true,
      trim: true,
    },
    entity: {
      type: String,
      required: true,
      trim: true,
    },
    entityId: {
      type: String,
      default: null,
    },
    entityType: {
      type: String,
      enum: ["hotel", "user", "subscription", "plan", "security", "system"],
      default: "hotel",
      index: true,
    },
    performedBy: {
      type: String,
      default: "Super Admin",
    },
    performedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },
    ip: {
      type: String,
      default: "127.0.0.1",
    },
    severity: {
      type: String,
      enum: ["INFO", "WARNING", "CRITICAL"],
      default: "INFO",
      index: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PlatformAuditLog", platformAuditLogSchema);
