const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  payee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'LKR',
    enum: ['LKR', 'USD']
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'bank_transfer', 'cash', 'refund'],
    required: true
  },
  status: {
    type: String,
    enum: ['created', 'pending_customer_action', 'pending_provider_confirmation', 'confirmed', 'failed', 'cancelled', 'refunded'],
    default: 'created'
  },
  stripePaymentIntentId: String,
  stripeChargeId: String,
  bankTransferDetails: {
    bankName: String,
    accountNumber: String,
    branchName: String,
    transferDate: Date,
    referenceNumber: String,
    receiptPath: String
  },
  invoice: {
    invoiceNumber: String,
    dueDate: Date,
    paidDate: Date,
    taxAmount: Number,
    totalAmount: Number,
    subtotal: Number
  },
  metadata: {
    description: String,
    serviceType: String,
    bookingDate: Date
  },
  notes: String,
  refundDetails: {
    refundId: String,
    refundAmount: Number,
    refundReason: String,
    refundDate: Date
  },
  adminNotes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
paymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Generate invoice number
paymentSchema.methods.generateInvoiceNumber = function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${year}${month}${day}-${random}`;
};

// Mark as confirmed
paymentSchema.methods.markAsConfirmed = function(transactionId) {
  this.status = 'confirmed';
  this.invoice.paidDate = new Date();
  if (transactionId) {
    this.stripeChargeId = transactionId;
  }
  return this.save();
};

// Mark as failed
paymentSchema.methods.markAsFailed = function(reason) {
  this.status = 'failed';
  this.notes = reason;
  return this.save();
};

// Process refund
paymentSchema.methods.processRefund = function(refundAmount, reason) {
  this.status = 'refunded';
  this.refundDetails = {
    refundAmount,
    refundReason: reason,
    refundDate: new Date()
  };
  return this.save();
};

module.exports = mongoose.model('Payment', paymentSchema);
