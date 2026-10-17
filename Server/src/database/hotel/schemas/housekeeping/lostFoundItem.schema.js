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
      trim: true,
    },
    item_name: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    found_location: {
      type: String, // e.g., 'Room 101', 'Lobby'
      required: true,
      trim: true,
    },
    found_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    finder_name: {
      type: String,
      trim: true,
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
      trim: true,
    },
    claimed_date: {
      type: Date,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
lostFoundItemSchema.index({ status: 1 });
lostFoundItemSchema.index({ is_deleted: 1 });
lostFoundItemSchema.index({ found_date: -1 });

export default lostFoundItemSchema;
