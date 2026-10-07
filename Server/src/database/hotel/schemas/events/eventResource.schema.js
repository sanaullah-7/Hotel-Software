import mongoose from 'mongoose';

const eventResourceSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    event_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    resource_type: {
      type: String, // e.g., 'ROOM', 'EQUIPMENT', 'STAFF'
      required: true,
    },
    resource_id: {
      type: mongoose.Schema.Types.ObjectId, // Could ref a Room, InventoryItem, or Employee
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    start_time: {
      type: Date,
      required: true,
    },
    end_time: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['REQUESTED', 'ALLOCATED', 'RETURNED', 'CANCELLED'],
      default: 'REQUESTED',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
eventResourceSchema.index({ event_id: 1 });
eventResourceSchema.index({ resource_id: 1 });
eventResourceSchema.index({ start_time: 1, end_time: 1 });

export default eventResourceSchema;
