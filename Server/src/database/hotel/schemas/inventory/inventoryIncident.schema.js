import mongoose from 'mongoose';

const inventoryIncidentSchema = new mongoose.Schema(
  {
    incident_ref: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true,
    },
    quantity_lost: {
      type: Number,
      required: true,
      min: 1,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    reason: {
      type: String,
      enum: ['DAMAGE', 'THEFT', 'EXPIRED', 'UNKNOWN'],
      required: true,
    },
    description: {
      type: String,
    },
    reported_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    status: {
      type: String,
      enum: ['REPORTED', 'INVESTIGATING', 'RESOLVED'],
      default: 'REPORTED',
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
inventoryIncidentSchema.index({ incident_ref: 1 });
inventoryIncidentSchema.index({ item_id: 1 });

export default inventoryIncidentSchema;
