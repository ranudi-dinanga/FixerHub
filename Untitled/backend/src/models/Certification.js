const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
  serviceProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  issuingOrganization: {
    type: String,
    required: true,
    trim: true
  },
  certificateNumber: {
    type: String,
    required: true,
    trim: true
  },
  issueDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date
  },
  category: {
    type: String,
    required: true,
    enum: ['technical', 'safety', 'professional', 'trade', 'other']
  },
  points: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
    default: 10
  },
  description: {
    type: String,
    maxlength: 500
  },
  documentFile: {
    type: String, // Path to uploaded file
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    maxlength: 1000
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
certificationSchema.index({ serviceProvider: 1, status: 1 });
certificationSchema.index({ status: 1, createdAt: -1 });
certificationSchema.index({ category: 1, status: 1 });

// Virtual for checking if certification is expired
certificationSchema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

// Virtual for checking if certification is active (approved and not expired)
certificationSchema.virtual('isActive').get(function() {
  return this.status === 'approved' && !this.isExpired;
});

module.exports = mongoose.model('Certification', certificationSchema);
