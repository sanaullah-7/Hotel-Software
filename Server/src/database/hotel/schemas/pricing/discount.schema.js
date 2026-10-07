import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema(
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
    description: {
      type: String,
      default: '',
    },
    discount_type: {
      type: String,
      enum: ['Percentage', 'Fixed', 'PERCENTAGE', 'FIXED'],
      default: 'Percentage',
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    applicable_rate_plan: {
      type: String,
      default: 'All Rate Plans',
    },
    valid_from: {
      type: Date,
    },
    valid_to: {
      type: Date,
    },
    min_nights: {
      type: Number,
      default: 1,
      min: 1,
    },
    max_usage_count: {
      type: Number,
      default: 100,
    },
    current_usage_count: {
      type: Number,
      default: 0,
      min: 0,
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

discountSchema.index({ code: 1 }, { unique: true });

discountSchema.index({ hotelId: 1, code: 1 }, { unique: true });

export default discountSchema;
