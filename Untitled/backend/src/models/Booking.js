const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  serviceSeeker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'quote_requested', 'quote_sent', 'quote_accepted', 'accepted', 'declined', 'completed', 'paid', 'cancelled'],
    default: 'pending'
  },
  originalPrice: {
    type: Number
  },
  terms: {
    type: String
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'processing', 'paid', 'failed', 'refunded', 'pending_verification', 'disputed'],
    default: 'unpaid'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'bank_transfer', 'cash'],
    default: 'stripe'
  },
  paymentId: String,
  paymentDate: Date,
  refundId: String,
  refundDate: Date,
  paymentIntentId: String,
  stripePaymentIntentId: String,
  receiptPath: String,
  receiptUploadDate: Date,
  bankTransferDetails: {
    bankName: String,
    accountNumber: String,
    branchName: String,
    transferDate: Date,
    referenceNumber: String
  },
  invoice: {
    invoiceNumber: String,
    dueDate: Date,
    paidDate: Date,
    taxAmount: Number,
    totalAmount: Number,
    subtotal: Number,
    currency: {
      type: String,
      default: 'LKR'
    }
  },
  paymentHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    amount: Number,
    method: String,
    status: String,
    transactionId: String,
    notes: String
  }],
  disputes: [{
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportedAt: {
      type: Date,
      default: Date.now
    },
    issue: String,
    evidence: [String], // Array of file paths
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved', 'closed'],
      default: 'open'
    },
    adminNotes: String,
    penalty: {
      amount: Number,
      reason: String,
      appliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      appliedAt: Date
    },
    resolution: String,
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String
  }
}, {
  timestamps: true
});

// Add database indexes for better query performance
// Compound indexes for common query patterns
bookingSchema.index({ serviceProvider: 1, status: 1, createdAt: -1 });
bookingSchema.index({ serviceSeeker: 1, status: 1, createdAt: -1 });
bookingSchema.index({ serviceProvider: 1, date: 1 });
bookingSchema.index({ serviceSeeker: 1, date: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ paymentStatus: 1, createdAt: -1 });

// Remove single-field indexes that are less efficient
// bookingSchema.index({ serviceProvider: 1, createdAt: -1 });
// bookingSchema.index({ serviceSeeker: 1, createdAt: -1 });
// bookingSchema.index({ status: 1 });
// bookingSchema.index({ paymentStatus: 1 });
// bookingSchema.index({ date: 1 });

// Generate invoice number
bookingSchema.methods.generateInvoiceNumber = function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${year}${month}${day}-${random}`;
};

// Add payment record
bookingSchema.methods.addPaymentRecord = function(paymentData) {
  this.paymentHistory.push(paymentData);
  return this.save();
};

// Mark as paid
bookingSchema.methods.markAsPaid = function(paymentMethod, transactionId) {
  this.paymentStatus = 'paid';
  this.paymentDate = new Date();
  this.paymentMethod = paymentMethod;
  this.paymentId = transactionId;
  this.status = 'paid';
  return this.save();
};

module.exports = mongoose.model('Booking', bookingSchema); 