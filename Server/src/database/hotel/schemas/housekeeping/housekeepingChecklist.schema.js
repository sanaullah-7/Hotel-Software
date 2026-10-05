import mongoose from 'mongoose';

const housekeepingChecklistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    task_type: {
      type: String,
      required: true,
    },
    items: [
      {
        description: { type: String, required: true },
        is_required: { type: Boolean, default: true },
      },
    ],
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
housekeepingChecklistSchema.index({ task_type: 1 });

export default housekeepingChecklistSchema;
