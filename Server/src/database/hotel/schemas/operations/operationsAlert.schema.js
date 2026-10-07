import mongoose from 'mongoose';

const operationsAlertSchema = new mongoose.Schema(
  {
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    alert_ref: {
      type: String,
      required: true,
      trim: true,
    },
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
    department: {
      type: String,
      enum: [
        'VIP_ARRIVALS',
        'HOUSEKEEPING',
        'MAINTENANCE',
        'FOOD_AND_BEVERAGE',
        'SECURITY_FRONT_DESK',
        'GENERAL',
      ],
      default: 'GENERAL',
      required: true,
    },
    type: {
      type: String,
      default: function () {
        return this.department || 'GENERAL';
      },
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'HIGH',
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED'],
      default: 'OPEN',
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    action_required: {
      type: String,
      trim: true,
      default: null,
    },
    location: {
      type: String,
      trim: true,
      default: null,
    },
    guest_name: {
      type: String,
      trim: true,
      default: null,
    },
    reported_by: {
      type: String,
      trim: true,
      default: 'Front Office',
    },
    assigned_to: {
      type: String,
      trim: true,
      default: null,
    },
    expires_at: {
      type: Date,
      default: null,
    },
    resolved_at: {
      type: Date,
      default: null,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
operationsAlertSchema.index({ hotelId: 1, alert_ref: 1 }, { unique: true });
operationsAlertSchema.index({ department: 1 });
operationsAlertSchema.index({ type: 1 });
operationsAlertSchema.index({ is_active: 1 });
operationsAlertSchema.index({ status: 1 });
operationsAlertSchema.index({ severity: 1 });
operationsAlertSchema.index({ created_at: -1 });

export default operationsAlertSchema;
