import mongoose from 'mongoose';

const beoSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    beo_ref: {
      type: String,
      required: true,
      trim: true,
    },
    event_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    setup_requirements: {
      type: String,
      required: true,
    },
    food_and_beverage: {
      type: String,
    },
    audio_visual: {
      type: String,
    },
    schedule: {
      type: String,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'APPROVED', 'DISTRIBUTED', 'COMPLETED', 'CANCELLED'],
      default: 'DRAFT',
      required: true,
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId, // Client or Manager
      ref: 'Employee', 
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
beoSchema.index({ event_id: 1 });
beoSchema.index({ hotelId: 1, beo_ref: 1 }, { unique: true });

export default beoSchema;
