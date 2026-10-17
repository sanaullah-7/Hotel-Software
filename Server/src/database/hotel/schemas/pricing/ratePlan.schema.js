import mongoose from 'mongoose';

const ratePlanSchema = new mongoose.Schema(
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
    description: {
      type: String,
      default: '',
    },
    room_type: {
      type: String,
      default: 'Deluxe Room',
    },
    meal_plan: {
      type: String,
      default: 'Room Only',
    },
    base_rate: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'PKR',
    },
    pricing_type: {
      type: String,
      default: 'Per Night',
    },
    extra_adult_rate: {
      type: Number,
      default: 0,
      min: 0,
    },
    extra_child_rate: {
      type: Number,
      default: 0,
      min: 0,
    },
    cancellation_policy: {
      type: String,
      default: 'Flexible',
    },
    cancellation_details: {
      type: String,
      default: '',
    },
    min_stay_nights: {
      type: Number,
      default: 1,
      min: 1,
    },
    max_stay_nights: {
      type: Number,
      default: 30,
      min: 1,
    },
    is_base_rate: {
      type: Boolean,
      default: false,
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

ratePlanSchema.index({ code: 1 }, { unique: true });

export default ratePlanSchema;
