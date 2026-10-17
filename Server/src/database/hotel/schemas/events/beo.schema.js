import mongoose from 'mongoose';

const beoSchema = new mongoose.Schema(
  {
    beo_ref: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    event_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: false,
    },
    title: {
      type: String,
      trim: true,
    },
    client: {
      type: String,
      trim: true,
    },
    venue: {
      type: String,
      trim: true,
    },
    setup_requirements: {
      type: String,
      default: 'Standard banquet layout',
    },
    food_and_beverage: {
      type: String,
    },
    catering: {
      type: String,
    },
    audio_visual: {
      type: String,
    },
    av_setup: {
      type: String,
    },
    schedule: {
      type: String,
    },
    attendance: {
      type: String,
    },
    total_price: {
      type: String,
      default: '$0',
    },
    deposit_paid: {
      type: String,
      default: '$0',
    },
    coordinator: {
      type: String,
      default: 'Marcella Dubois (Senior Event Director)',
    },
    status: {
      type: String,
      default: 'Confirmed & Deposit Paid',
    },
    status_type: {
      type: String,
      default: 'confirmed',
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee', 
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
beoSchema.index({ event_id: 1 });

export default beoSchema;

