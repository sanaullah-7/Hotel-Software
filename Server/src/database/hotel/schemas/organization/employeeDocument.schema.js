import mongoose from 'mongoose';

const employeeDocumentSchema = new mongoose.Schema(
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
    document_type: {
      type: String,
      required: true,
    },
    document_url: {
      type: String,
      required: true,
    },
    issued_date: {
      type: Date,
    },
    expiry_date: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
employeeDocumentSchema.index({ employee_id: 1 });

export default employeeDocumentSchema;
