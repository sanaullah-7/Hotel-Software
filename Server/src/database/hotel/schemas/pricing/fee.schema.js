import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    calc_type: {
      type: String,
      enum: ['Per Night', 'Per Stay', 'Per Person', 'Fixed', 'PER_NIGHT', 'PER_STAY', 'PER_PERSON', 'FIXED'],
      default: 'Per Night',
    },
    fee_type: {
      type: String,
      default: 'PER_NIGHT',
    },
    charge_type: {
      type: String,
      default: 'Room',
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'ACTIVE', 'INACTIVE'],
      default: 'Active',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

feeSchema.index({ code: 1 }, { unique: true });

export default feeSchema;
