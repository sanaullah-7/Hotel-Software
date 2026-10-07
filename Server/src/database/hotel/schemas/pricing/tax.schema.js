import mongoose from 'mongoose';

const taxSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
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
    rate: {
      type: Number,
      required: true,
      min: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    calc_type: {
      type: String,
      enum: ['Percentage', 'Fixed', 'PERCENTAGE', 'FIXED'],
      default: 'Percentage',
    },
    applicable_on: {
      type: String,
      default: 'Room Charge & Extra Services',
    },
    is_compound: {
      type: Boolean,
      default: false,
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

taxSchema.index({ code: 1 }, { unique: true });

taxSchema.index({ hotelId: 1, code: 1 }, { unique: true });

export default taxSchema;
