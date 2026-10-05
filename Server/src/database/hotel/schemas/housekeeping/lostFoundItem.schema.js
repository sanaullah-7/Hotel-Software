import mongoose from 'mongoose';

const lostFoundItemSchema = new mongoose.Schema(
  {
    reference_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    item_type: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    found_location: {
      type: String, // e.g., 'Room 101', 'Lobby'
      required: true,
    },
    found_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    found_date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    status: {
      type: String,
      enum: ['REPORTED', 'CLAIMED', 'DISCARDED', 'DONATED'],
      default: 'REPORTED',
      required: true,
    },
    claimed_by: {
      type: String, // Guest name or details
    },
    claimed_date: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
lostFoundItemSchema.index({ reference_number: 1 });
lostFoundItemSchema.index({ status: 1 });

export default lostFoundItemSchema;
