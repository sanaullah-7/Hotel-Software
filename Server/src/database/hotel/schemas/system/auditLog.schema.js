import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    module: {
      type: String,
      required: true,
      trim: true,
    },
    // entity_name alias / fallback for backward compatibility
    entity_name: {
      type: String,
      trim: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    recordId: {
      type: String,
      trim: true,
      default: null,
    },
    entity_id: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    importance: {
      type: String,
      enum: ['Normal', 'Important', 'Critical'],
      default: 'Normal',
    },
    status: {
      type: String,
      enum: ['Completed', 'Failed', 'Pending'],
      default: 'Completed',
    },
    performed_by: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    user_name: {
      type: String,
      trim: true,
      default: 'Admin',
    },
    previous_value: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    new_value: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    ip_address: {
      type: String,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: false,
  }
);

// Pre-save hook to ensure module / entity_name and recordId / entity_id compatibility
auditLogSchema.pre('save', function (next) {
  if (!this.entity_name && this.module) {
    this.entity_name = this.module;
  }
  if (!this.module && this.entity_name) {
    this.module = this.entity_name;
  }
  if (!this.recordId && this.entity_id) {
    this.recordId = String(this.entity_id);
  }
  if (!this.entity_id && this.recordId) {
    this.entity_id = this.recordId;
  }
  if (typeof next === 'function') {
    next();
  }
});

// Indexes
auditLogSchema.index({ module: 1 });
auditLogSchema.index({ entity_name: 1, entity_id: 1 });
auditLogSchema.index({ performed_by: 1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ importance: 1 });

export default auditLogSchema;
