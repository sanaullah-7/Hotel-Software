import mongoose from 'mongoose';

const operationsAlertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true, // e.g., 'SECURITY', 'MAINTENANCE_EMERGENCY', 'VIP_ARRIVAL', 'WEATHER'
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['INFO', 'WARNING', 'CRITICAL'],
      default: 'INFO',
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    expires_at: {
      type: Date,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
operationsAlertSchema.index({ type: 1 });
operationsAlertSchema.index({ is_active: 1 });

export default operationsAlertSchema;
