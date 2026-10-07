import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    leave_type: {
      type: String,
      enum: ['SICK', 'CASUAL', 'ANNUAL', 'MATERNITY', 'UNPAID', 'SPECIAL', 'PERSONAL', 'OTHER'],
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
    days: {
      type: Number,
      min: 1,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
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
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
leaveRequestSchema.index({ employee_id: 1 });
leaveRequestSchema.index({ status: 1 });
leaveRequestSchema.index({ start_date: 1, end_date: 1 });

export default leaveRequestSchema;
