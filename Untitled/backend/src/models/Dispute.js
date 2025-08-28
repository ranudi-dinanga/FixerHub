const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  // Basic dispute information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  
  // Related entities
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  
  serviceProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  serviceSeeker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Who reported the dispute
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Dispute category and priority
  category: {
    type: String,
    enum: [
      'payment_issue',
      'service_quality',
      'no_show',
      'cancellation',
      'communication',
      'safety_concern',
      'fraud',
      'other'
    ],
    required: true
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['open', 'under_review', 'resolved', 'closed'],
    default: 'open'
  },
  
  // Admin handling
  assignedAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  adminNotes: [{
    note: String,
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Resolution details
  resolution: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  resolvedAt: Date,
  
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Evidence and attachments
  evidence: [{
    filePath: String,
    fileName: String,
    fileType: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Communication history
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Escalation tracking
  escalatedAt: Date,
  
  escalationReason: String,
  
  // Final outcome
  outcome: {
    type: String,
    enum: ['refund', 'partial_refund', 'service_redo', 'warning', 'suspension', 'no_action'],
    required: false
  },
  
  outcomeAmount: {
    type: Number,
    min: 0
  },
  
  outcomeCurrency: {
    type: String,
    default: 'LKR'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
disputeSchema.index({ status: 1, priority: 1, createdAt: -1 });
disputeSchema.index({ reportedBy: 1, createdAt: -1 });
disputeSchema.index({ booking: 1 });
disputeSchema.index({ serviceProvider: 1, serviceSeeker: 1 });
disputeSchema.index({ category: 1, status: 1 });

// Pre-save middleware to update updatedAt
disputeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to add admin note
disputeSchema.methods.addAdminNote = function(note, adminId) {
  this.adminNotes.push({
    note,
    adminId,
    timestamp: new Date()
  });
  return this.save();
};

// Method to add message
disputeSchema.methods.addMessage = function(sender, message, isAdmin = false) {
  this.messages.push({
    sender,
    message,
    timestamp: new Date(),
    isAdmin
  });
  return this.save();
};

// Method to resolve dispute
disputeSchema.methods.resolve = function(resolution, adminId, outcome = null, outcomeAmount = null) {
  this.status = 'resolved';
  this.resolution = resolution;
  this.resolvedAt = new Date();
  this.resolvedBy = adminId;
  
  if (outcome) {
    this.outcome = outcome;
    this.outcomeAmount = outcomeAmount;
  }
  
  return this.save();
};

// Static method to get disputes by user
disputeSchema.statics.getDisputesByUser = function(userId) {
  return this.find({
    $or: [
      { serviceProvider: userId },
      { serviceSeeker: userId },
      { reportedBy: userId }
    ]
  }).populate('booking', 'date time description price')
    .populate('serviceProvider', 'name email')
    .populate('serviceSeeker', 'name email')
    .populate('reportedBy', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to get disputes for admin
disputeSchema.statics.getDisputesForAdmin = function(filters = {}) {
  const query = {};
  
  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.category) query.category = filters.category;
  
  return this.find(query)
    .populate('booking', 'date time description price')
    .populate('serviceProvider', 'name email')
    .populate('serviceSeeker', 'name email')
    .populate('reportedBy', 'name email')
    .populate('assignedAdmin', 'name email')
    .sort({ priority: 1, createdAt: -1 });
};

module.exports = mongoose.model('Dispute', disputeSchema);
