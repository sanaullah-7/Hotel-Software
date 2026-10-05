import mongoose from 'mongoose';

const parkingRecordSchema = new mongoose.Schema(
  {
    space_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingSpace',
      required: true,
    },
    guest_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      // Optional, could be an employee or visitor
    },
    vehicle_plate: {
      type: String,
      required: true,
      trim: true,
    },
    vehicle_model: {
      type: String,
    },
    entry_time: {
      type: Date,
      required: true,
      default: Date.now,
    },
    exit_time: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['PARKED', 'EXITED'],
      default: 'PARKED',
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
parkingRecordSchema.index({ space_id: 1 });
parkingRecordSchema.index({ vehicle_plate: 1 });

export default parkingRecordSchema;
