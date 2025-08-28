const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken: auth } = require('../middleware/auth');
const { uploadMiddleware, handleUploadError } = require('../utils/fileUpload');


// Payment routes
router.post('/create-payment-intent', auth, paymentController.createPaymentIntent);
router.post('/confirm-stripe-payment', auth, paymentController.confirmStripePayment);
router.post('/upload-bank-transfer-receipt', auth, uploadMiddleware.receipt, paymentController.uploadBankTransferReceipt);
router.post('/verify-bank-transfer', auth, paymentController.verifyBankTransfer); // Admin only
router.get('/history/:userId', auth, paymentController.getPaymentHistory);
router.get('/invoice/:paymentId', auth, paymentController.generateInvoice);
router.post('/refund', auth, paymentController.processRefund);
router.get('/stats/:userId', auth, paymentController.getPaymentStats);

// Service provider payment management
router.get('/pending', auth, paymentController.getPendingPayments);
router.post('/confirm-receipt', auth, paymentController.confirmPaymentReceipt);
router.get('/received', auth, paymentController.getReceivedPayments);
router.post('/acknowledge', auth, paymentController.acknowledgePayment);
router.post('/create-dispute', auth, paymentController.createPaymentDispute);

// Error handling middleware for file uploads
router.use(handleUploadError);

module.exports = router;
