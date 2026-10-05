import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    entity_name: {
      type: String, // e.g., 'Reservation', 'Invoice', 'InventoryMovement'
      required: true,
    },
    entity_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    performed_by: {
      type: mongoose.Schema.Types.ObjectId,
      // Ref to Platform Account ID since users are authenticated there,
      required: true,
    },
    changes: {
      type: mongoose.Schema.Types.Mixed, // Stores snapshot of before/after or diff
    },
    ip_address: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    // Append-only logs don't need update timestamps
    timestamps: false,
  }
);

// Indexes
auditLogSchema.index({ entity_name: 1, entity_id: 1 });
auditLogSchema.index({ performed_by: 1 });
auditLogSchema.index({ timestamp: -1 });

export default auditLogSchema;
