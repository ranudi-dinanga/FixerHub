const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Dispute = require('../models/Dispute');
const mongoose = require('mongoose');
const { 
  validateObjectId, 
  handleError, 
  handleNotFound, 
  handleSuccess, 
  validateRequiredFields,
  convertToLKR,
  convertToUSD,
  formatCurrency
} = require('../utils/common');
const { processUploadedFile } = require('../utils/fileUpload');

// Check if Stripe secret key exists before initializing
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn('Warning: STRIPE_SECRET_KEY not found in environment variables');
}

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Create payment intent for Stripe
exports.createPaymentIntent = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ message: 'Stripe is not configured. Please check environment variables.' });
    }

    const { amount, bookingId, currency = 'LKR' } = req.body;

    if (!validateRequiredFields({ amount, bookingId }, ['amount', 'bookingId'], res)) {
      return;
    }

    if (!validateObjectId(bookingId, 'booking ID', res)) {
      return;
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return handleNotFound(res, 'Booking');
    }

    // Convert LKR to USD for Stripe (Stripe doesn't support LKR)
    const usdAmount = currency === 'LKR' ? convertToUSD(amount) : amount;
    
    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(usdAmount * 100), // Convert to cents
      currency: 'usd', // Stripe payment in USD
      metadata: {
        bookingId,
        serviceType: booking.description,
        serviceDate: booking.date.toISOString(),
        originalCurrency: currency,
        originalAmount: amount.toString()
      }
    });

    // Create payment record
    const payment = new Payment({
      booking: bookingId,
      payer: req.user._id,
      payee: booking.serviceProvider,
      amount: amount,
      currency: currency.toUpperCase(),
      paymentMethod: 'stripe',
      status: 'pending_customer_action',
      stripePaymentIntentId: paymentIntent.id,
      metadata: {
        description: booking.description,
        serviceType: 'service_booking',
        bookingDate: booking.date
      }
    });

    await payment.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id
    });
  } catch (error) {
    return handleError(error, res, 'Error creating payment intent');
  }
};

// Confirm Stripe payment
exports.confirmStripePayment = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ message: 'Stripe is not configured. Please check environment variables.' });
    }

    const { paymentIntentId, paymentId } = req.body;

    if (!validateRequiredFields({ paymentIntentId, paymentId }, ['paymentIntentId', 'paymentId'], res)) {
      return;
    }

    if (!validateObjectId(paymentId, 'payment ID', res)) {
      return;
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return handleNotFound(res, 'Payment');
    }

    // Verify payment belongs to current user
    if (payment.payer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to confirm this payment' });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // Update payment status
      await payment.markAsConfirmed(paymentIntent.latest_charge);
      
      // Update booking status
      const booking = await Booking.findById(payment.booking);
      if (booking) {
        booking.paymentStatus = 'paid';
        booking.status = 'paid';
        booking.paymentDate = new Date();
        booking.paymentMethod = 'stripe';
        booking.paymentId = paymentIntent.latest_charge;
        await booking.save();
      }

      res.json({
        success: true,
        message: 'Payment completed successfully',
        payment,
        booking
      });
    } else {
      await payment.markAsFailed('Payment intent not succeeded');
      res.status(400).json({
        success: false,
        message: 'Payment failed',
        status: paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ message: 'Error confirming payment' });
  }
};

// Handle bank transfer receipt upload
exports.uploadBankTransferReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Process uploaded file using multer helper
    const fileInfo = processUploadedFile(req.file, 'receipts');
    console.log('Processed file info:', fileInfo);

    const { bookingId, bankDetails } = req.body;
    
    if (!validateRequiredFields({ bookingId }, ['bookingId'], res)) {
      return;
    }

    if (!validateObjectId(bookingId, 'booking ID', res)) {
      return;
    }

    const booking = await Booking.findById(bookingId).populate('serviceProvider', 'name bankName accountNumber branchName');
    if (!booking) {
      return handleNotFound(res, 'Booking');
    }

    // Verify user authorization
    if (booking.serviceSeeker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to upload receipt for this booking' });
    }

    // Parse bank details if it's a string
    let parsedBankDetails = {};
    if (typeof bankDetails === 'string') {
      try {
        parsedBankDetails = JSON.parse(bankDetails);
      } catch (e) {
        parsedBankDetails = {};
      }
    } else {
      parsedBankDetails = bankDetails || {};
    }

    // Check if payment already exists for this booking
    let payment = await Payment.findOne({ booking: bookingId, paymentMethod: 'bank_transfer' });
    
    if (payment) {
      // Update existing payment
      payment.status = 'pending_provider_confirmation';
      payment.bankTransferDetails = {
        ...payment.bankTransferDetails,
        bankName: parsedBankDetails.bankName || booking.serviceProvider?.bankName || 'N/A',
        accountNumber: parsedBankDetails.accountNumber || booking.serviceProvider?.accountNumber || 'N/A',
        branchName: parsedBankDetails.branchName || booking.serviceProvider?.branchName || 'N/A',
        transferDate: new Date(),
        referenceNumber: payment.bankTransferDetails?.referenceNumber || `BT-${Date.now()}`,
        receiptPath: fileInfo.relativePath
      };
      payment.updatedAt = new Date();
    } else {
      // Create new payment record
      payment = new Payment({
        booking: bookingId,
        payer: req.user._id,
        payee: booking.serviceProvider._id || booking.serviceProvider,
        amount: booking.price,
        currency: 'LKR',
        paymentMethod: 'bank_transfer',
        status: 'pending_provider_confirmation',
        bankTransferDetails: {
          bankName: parsedBankDetails.bankName || booking.serviceProvider?.bankName || 'N/A',
          accountNumber: parsedBankDetails.accountNumber || booking.serviceProvider?.accountNumber || 'N/A',
          branchName: parsedBankDetails.branchName || booking.serviceProvider?.branchName || 'N/A',
          transferDate: new Date(),
          referenceNumber: `BT-${Date.now()}`,
          receiptPath: fileInfo.relativePath
        },
        metadata: {
          description: booking.description,
          serviceType: 'service_booking',
          bookingDate: booking.date
        }
      });
    }

    await payment.save();

    // Update booking with receipt information
    booking.paymentStatus = 'processing';
    booking.receiptPath = fileInfo.relativePath;
    booking.receiptUploadDate = new Date();
    await booking.save();

    return handleSuccess(res, { 
      payment, 
      booking,
      fileInfo,
      message: 'Receipt uploaded successfully. Payment is awaiting confirmation by the service provider.' 
    }, 'Receipt uploaded successfully');
  } catch (error) {
    console.error('Error uploading receipt:', error);
    return handleError(error, res, 'Error uploading receipt');
  }
};

// Verify bank transfer payment (admin function)
exports.verifyBankTransfer = async (req, res) => {
  try {
    const { paymentId, verified, adminNotes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: 'Invalid payment ID format' });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (verified) {
      // Mark payment as completed
      await payment.markAsCompleted();
      
      // Update booking status
      const booking = await Booking.findById(payment.booking);
      if (booking) {
        await booking.markAsPaid('bank_transfer', payment.bankTransferDetails.referenceNumber);
        await booking.addPaymentRecord({
          amount: payment.amount,
          method: 'bank_transfer',
          status: 'completed',
          transactionId: payment.bankTransferDetails.referenceNumber,
          notes: 'Bank transfer verified by admin'
        });
      }

      res.json({
        success: true,
        message: 'Bank transfer verified successfully',
        payment,
        booking
      });
    } else {
      // Mark payment as failed
      await payment.markAsFailed('Bank transfer verification failed');
      
      // Update booking status
      const booking = await Booking.findById(payment.booking);
      if (booking) {
        booking.paymentStatus = 'failed';
        await booking.save();
      }

      res.json({
        success: true,
        message: 'Bank transfer marked as failed',
        payment,
        booking
      });
    }
  } catch (error) {
    console.error('Error verifying bank transfer:', error);
    res.status(500).json({ message: 'Error verifying bank transfer' });
  }
};

// Get payment history for a user
exports.getPaymentHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status, paymentMethod } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const query = {
      $or: [
        { payer: userId },
        { payee: userId }
      ]
    };

    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    const payments = await Payment.find(query)
      .populate('booking', 'description date time')
      .populate('payer', 'name email')
      .populate('payee', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ message: 'Error fetching payment history' });
  }
};

// Generate invoice PDF
exports.generateInvoice = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: 'Invalid payment ID format' });
    }

    const payment = await Payment.findById(paymentId)
      .populate('booking', 'description date time')
      .populate('payer', 'name email address')
      .populate('payee', 'name email address');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Generate invoice number if not exists
    if (!payment.invoice.invoiceNumber) {
      payment.invoice.invoiceNumber = payment.generateInvoiceNumber();
      await payment.save();
    }

    // Create PDF document
    const doc = new PDFDocument();
    const fileName = `invoice-${payment.invoice.invoiceNumber}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    doc.pipe(res);

    // Add company header
    doc.fontSize(24).text('FixerHub', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text('Professional Service Platform', { align: 'center' });
    doc.moveDown(2);

    // Invoice details
    doc.fontSize(18).text('INVOICE');
    doc.moveDown();
    doc.fontSize(12).text(`Invoice Number: ${payment.invoice.invoiceNumber}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Due Date: ${payment.invoice.dueDate ? new Date(payment.invoice.dueDate).toLocaleDateString() : 'N/A'}`);
    doc.moveDown();

    // Bill to and Bill from
    doc.fontSize(14).text('Bill To:');
    doc.fontSize(12).text(payment.payer.name);
    doc.text(payment.payer.email);
    if (payment.payer.address) doc.text(payment.payer.address);
    doc.moveDown();

    doc.fontSize(14).text('Bill From:');
    doc.fontSize(12).text(payment.payee.name);
    doc.text(payment.payee.email);
    if (payment.payee.address) doc.text(payment.payee.address);
    doc.moveDown();

    // Service details
    doc.fontSize(14).text('Service Details:');
    doc.fontSize(12).text(`Description: ${payment.booking.description}`);
    doc.text(`Service Date: ${new Date(payment.booking.date).toLocaleDateString()}`);
    doc.text(`Service Time: ${payment.booking.time}`);
    doc.moveDown();

    // Payment summary
    const currencySymbol = payment.currency === 'LKR' ? 'Rs. ' : '$';
    doc.fontSize(14).text('Payment Summary:');
    doc.fontSize(12).text(`Subtotal: ${currencySymbol}${payment.amount.toFixed(2)}`);
    doc.text(`Tax: ${currencySymbol}${payment.invoice.taxAmount ? payment.invoice.taxAmount.toFixed(2) : '0.00'}`);
    doc.text(`Total: ${currencySymbol}${payment.amount.toFixed(2)}`);
    doc.moveDown();

    // Payment method
    doc.fontSize(14).text('Payment Method:');
    doc.fontSize(12).text(payment.paymentMethod === 'stripe' ? 'Credit Card (Stripe)' : 'Bank Transfer');
    doc.text(`Status: ${payment.status}`);
    if (payment.invoice.paidDate) {
      doc.text(`Paid Date: ${new Date(payment.invoice.paidDate).toLocaleDateString()}`);
    }

    doc.end();
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ message: 'Error generating invoice' });
  }
};

// Process refund
exports.processRefund = async (req, res) => {
  try {
    const { paymentId, refundAmount, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: 'Invalid payment ID format' });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({ message: 'Payment must be completed to process refund' });
    }

    if (payment.paymentMethod === 'stripe' && payment.stripeChargeId) {
      // Check if Stripe is configured
      if (!stripe) {
        return res.status(500).json({ message: 'Stripe is not configured. Please check environment variables.' });
      }
      
      // Process Stripe refund
      const refund = await stripe.refunds.create({
        charge: payment.stripeChargeId,
        amount: Math.round(refundAmount * 100), // Convert to cents
        reason: reason || 'requested_by_customer'
      });

      await payment.processRefund(refundAmount, reason);
      
      res.json({
        success: true,
        message: 'Refund processed successfully',
        refund,
        payment
      });
    } else {
      // Process manual refund for bank transfers
      await payment.processRefund(refundAmount, reason);
      
      res.json({
        success: true,
        message: 'Manual refund processed successfully',
        payment
      });
    }
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ message: 'Error processing refund' });
  }
};

// Get payment statistics
exports.getPaymentStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = 'month' } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const now = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const stats = await Payment.aggregate([
      {
        $match: {
          $or: [
            { payer: mongoose.Types.ObjectId(userId) },
            { payee: mongoose.Types.ObjectId(userId) }
          ],
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const totalPayments = await Payment.countDocuments({
      $or: [
        { payer: userId },
        { payee: userId }
      ],
      createdAt: { $gte: startDate }
    });

    const totalAmount = await Payment.aggregate([
      {
        $match: {
          $or: [
            { payer: mongoose.Types.ObjectId(userId) },
            { payee: mongoose.Types.ObjectId(userId) }
          ],
          createdAt: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      stats,
      totalPayments,
      totalAmount: totalAmount[0]?.total || 0,
      period,
      startDate,
      endDate: now
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({ message: 'Error fetching payment statistics' });
  }
};

// Get pending payments for service provider to confirm
exports.getPendingPayments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const payments = await Payment.find({
      payee: userId,
      paymentMethod: 'bank_transfer',
      status: 'pending_provider_confirmation'
    })
      .populate('booking', 'description date time price')
      .populate('payer', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments({
      payee: userId,
      paymentMethod: 'bank_transfer',
      status: 'pending_provider_confirmation'
    });

    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    res.status(500).json({ message: 'Error fetching pending payments' });
  }
};

// Confirm payment receipt by service provider
exports.confirmPaymentReceipt = async (req, res) => {
  try {
    const { paymentId, confirmed, notes } = req.body;

    if (!validateObjectId(paymentId, 'payment ID', res)) {
      return;
    }

    const payment = await Payment.findById(paymentId).populate('booking');
    if (!payment) {
      return handleNotFound(res, 'Payment');
    }

    // Verify the service provider is authorized to confirm this payment
    if (payment.payee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to confirm this payment' });
    }

    if (confirmed) {
      // Mark payment as confirmed
      payment.status = 'confirmed';
      payment.invoice.paidDate = new Date();
      payment.notes = notes || 'Payment confirmed by service provider';
      
      // Update booking status
      const booking = await Booking.findById(payment.booking._id);
      if (booking) {
        booking.paymentStatus = 'paid';
        booking.status = 'paid';
        booking.paymentDate = new Date();
        await booking.save();
      }
    } else {
      // Mark payment as failed
      payment.status = 'failed';
      payment.notes = notes || 'Payment rejected by service provider';
      
      // Update booking status
      const booking = await Booking.findById(payment.booking._id);
      if (booking) {
        booking.paymentStatus = 'failed';
        await booking.save();
      }
    }

    await payment.save();

    return handleSuccess(res, { 
      payment,
      message: confirmed ? 'Payment confirmed successfully' : 'Payment rejected'
    }, confirmed ? 'Payment confirmed' : 'Payment rejected');
  } catch (error) {
    console.error('Error confirming payment:', error);
    return handleError(error, res, 'Error confirming payment');
  }
};

// Get received payments for service provider
exports.getReceivedPayments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { payee: userId };
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('booking', 'description date time price')
      .populate('payer', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching received payments:', error);
    res.status(500).json({ message: 'Error fetching received payments' });
  }
};

// Acknowledge payment receipt
exports.acknowledgePayment = async (req, res) => {
  try {
    const { paymentId, acknowledgmentNote } = req.body;

    if (!validateObjectId(paymentId, 'payment ID', res)) {
      return;
    }

    const payment = await Payment.findById(paymentId).populate('booking');
    if (!payment) {
      return handleNotFound(res, 'Payment');
    }

    // Verify the service provider is authorized
    if (payment.payee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to acknowledge this payment' });
    }

    // Add acknowledgment note
    payment.adminNotes = acknowledgmentNote || 'Payment acknowledged by service provider';
    payment.updatedAt = new Date();
    
    await payment.save();

    return handleSuccess(res, { 
      payment,
      message: 'Payment acknowledged successfully'
    }, 'Payment acknowledged');
  } catch (error) {
    console.error('Error acknowledging payment:', error);
    return handleError(error, res, 'Error acknowledging payment');
  }
};

// Create dispute for payment
exports.createPaymentDispute = async (req, res) => {
  try {
    const { paymentId, reason, description, category } = req.body;

    if (!validateRequiredFields({ paymentId, reason, description }, ['paymentId', 'reason', 'description'], res)) {
      return;
    }

    if (!validateObjectId(paymentId, 'payment ID', res)) {
      return;
    }

    const payment = await Payment.findById(paymentId).populate('booking');
    if (!payment) {
      return handleNotFound(res, 'Payment');
    }

    // Verify the service provider is authorized
    if (payment.payee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to dispute this payment' });
    }

    // Check if dispute already exists for this payment
    const existingDispute = await Dispute.findOne({ 
      booking: payment.booking._id, 
      status: { $in: ['open', 'in_progress'] } 
    });

    if (existingDispute) {
      return res.status(400).json({ message: 'A dispute already exists for this payment' });
    }

    // Create new dispute
    const dispute = new Dispute({
      booking: payment.booking._id,
      disputedBy: req.user._id,
      disputedAgainst: payment.payer,
      reason,
      description,
      category: category || 'payment_issue',
      status: 'open',
      amount: payment.amount,
      evidence: [],
      metadata: {
        paymentId: payment._id,
        paymentMethod: payment.paymentMethod,
        originalAmount: payment.amount
      }
    });

    await dispute.save();

    // Update payment status to indicate dispute
    payment.notes = `Payment disputed: ${reason}`;
    await payment.save();

    return handleSuccess(res, { 
      dispute,
      payment,
      message: 'Dispute created successfully'
    }, 'Dispute created');
  } catch (error) {
    console.error('Error creating dispute:', error);
    return handleError(error, res, 'Error creating dispute');
  }
};
