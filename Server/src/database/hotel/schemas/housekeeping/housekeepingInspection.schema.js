import mongoose from 'mongoose';

const housekeepingInspectionSchema = new mongoose.Schema(
  {
    task_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HousekeepingTask',
      required: true,
    },
    inspector_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    comments: {
      type: String,
    },
    inspected_at: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
housekeepingInspectionSchema.index({ task_id: 1 });
housekeepingInspectionSchema.index({ inspector_id: 1 });

export default housekeepingInspectionSchema;
