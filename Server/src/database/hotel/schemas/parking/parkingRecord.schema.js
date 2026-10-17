import mongoose from 'mongoose';

const parkingRecordSchema = new mongoose.Schema(
  {
    record_ref: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    space_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingSpace',
      required: true,
    },
    guest_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      // Optional, could be a walk-in, employee, or visitor
    },
    guest_name: {
      type: String,
      trim: true,
      default: '',
    },
    room_number: {
      type: String,
      trim: true,
      default: '',
    },
    vehicle_plate: {
      type: String,
      required: true,
      trim: true,
    },
    vehicle_model: {
      type: String,
      trim: true,
      default: '',
    },
    vehicle_type: {
      type: String,
      enum: ['Sedan', 'SUV', 'Hatchback', 'Van', 'Bike', 'Other'],
      default: 'Sedan',
    },
    entry_time: {
      type: Date,
      required: true,
      default: Date.now,
    },
    exit_time: {
      type: Date,
    },
    charge_type: {
      type: String,
      enum: ['Free', 'Hourly', 'Daily'],
      default: 'Free',
    },
    charge_amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    payment_status: {
      type: String,
      enum: ['Paid', 'Pending'],
      default: 'Pending',
    },
    car_image: {
      type: String,
      default: '',
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
parkingRecordSchema.index({ status: 1 });
parkingRecordSchema.index({ entry_time: -1 });

export default parkingRecordSchema;
