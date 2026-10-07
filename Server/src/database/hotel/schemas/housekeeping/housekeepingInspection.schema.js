import mongoose from 'mongoose';

const housekeepingInspectionSchema = new mongoose.Schema(
  {
    task_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HousekeepingTask',
      required: true,
    },
    checklist_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HousekeepingChecklist',
    },
    inspector_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PASSED', 'FAILED'],
      default: 'PENDING',
      required: true,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    comments: {
      type: String,
      trim: true,
    },
    inspected_at: {
      type: Date,
      default: Date.now,
      required: true,
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
housekeepingInspectionSchema.index({ task_id: 1 });
housekeepingInspectionSchema.index({ inspector_id: 1 });
housekeepingInspectionSchema.index({ status: 1 });
housekeepingInspectionSchema.index({ inspected_at: -1 });
housekeepingInspectionSchema.index({ is_deleted: 1 });

export default housekeepingInspectionSchema;
