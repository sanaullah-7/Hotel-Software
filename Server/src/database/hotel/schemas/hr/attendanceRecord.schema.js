import mongoose from 'mongoose';

const attendanceRecordSchema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    clock_in_time: {
      type: Date,
    },
    clock_out_time: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE'],
      required: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
attendanceRecordSchema.index({ employee_id: 1, date: -1 });

export default attendanceRecordSchema;
