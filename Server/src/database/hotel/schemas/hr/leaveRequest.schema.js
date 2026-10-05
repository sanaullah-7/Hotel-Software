import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    leave_type: {
      type: String,
      enum: ['SICK', 'CASUAL', 'ANNUAL', 'MATERNITY', 'UNPAID', 'OTHER'],
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING',
      required: true,
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee', // Manager/HR
    },
    manager_comments: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
leaveRequestSchema.index({ employee_id: 1 });
leaveRequestSchema.index({ status: 1 });

export default leaveRequestSchema;
