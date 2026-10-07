import mongoose from 'mongoose';

const attendanceRecordSchema = new mongoose.Schema(
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
      enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY', 'WEEKEND'],
      default: 'PRESENT',
      required: true,
    },
    shift: {
      type: String,
      enum: ['DAY', 'NIGHT', 'Day Shift', 'Night Shift', 'GENERAL'],
      default: 'Day Shift',
    },
    break_time: {
      type: String,
      default: '01:00',
    },
    total_hours: {
      type: String,
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
// Enforce single authoritative attendance record per employee per date
attendanceRecordSchema.index({ employee_id: 1, date: 1 }, { unique: true });
attendanceRecordSchema.index({ date: 1, status: 1 });

export default attendanceRecordSchema;
