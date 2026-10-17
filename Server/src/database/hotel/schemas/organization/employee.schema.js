import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    employee_ref: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    job_title: {
      type: String,
      required: true,
    },
    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ON_LEAVE', 'TERMINATED'],
      default: 'ACTIVE',
    },

    // Additional Personal & Contact Information
    address: { type: String, trim: true },
    dob: { type: String, trim: true },
    gender: { type: String, trim: true },
    nationality: { type: String, trim: true },
    marital_status: { type: String, trim: true },
    languages: { type: String, trim: true },
    alt_phone: { type: String, trim: true },

    // Employment Details
    joining_date: { type: String, trim: true },
    employment_type: { type: String, trim: true },
    shift: { type: String, trim: true },
    salary: { type: Number, min: 0 },
    reports_to: { type: String, trim: true },

    // Professional & Qualifications
    experience: { type: String, trim: true },
    education: { type: String, trim: true },
    skills: { type: String, trim: true },

    // Emergency Contact
    emergency_contact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      relation: { type: String, trim: true },
    },

    // Additional Details
    notes: { type: String, trim: true },
    avatar: { type: String, trim: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
employeeSchema.index({ email: 1 });
employeeSchema.index({ department_id: 1 });

export default employeeSchema;
