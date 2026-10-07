import mongoose from 'mongoose';

const incidentTimelineEventSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: String,
      trim: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    detail: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

const inventoryIncidentSchema = new mongoose.Schema(
  {
    incident_ref: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
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
    unit_loss_value: {
      type: Number,
      min: 0,
      default: 0,
    },
    total_loss_value: {
      type: Number,
      min: 0,
      default: 0,
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
      trim: true,
    },
    reported_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    status: {
      type: String,
      enum: ['REPORTED', 'INVESTIGATING', 'RESOLVED'],
      default: 'REPORTED',
      required: true,
    },
    resolution_type: {
      type: String,
      enum: ['RECOVERED', 'REPLACED', 'WRITTEN_OFF'],
      default: null,
    },
    resolution_notes: {
      type: String,
      trim: true,
      default: null,
    },
    resolution_date: {
      type: Date,
      default: null,
    },
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
    },
    room_number: {
      type: String,
      trim: true,
      default: null,
    },
    guest_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      default: null,
    },
    guest_charge_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GuestCharge',
      default: null,
    },
    timeline: [incidentTimelineEventSchema],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
inventoryIncidentSchema.index({ item_id: 1, date: -1 });
inventoryIncidentSchema.index({ status: 1 });
inventoryIncidentSchema.index({ room_number: 1 });

export default inventoryIncidentSchema;
