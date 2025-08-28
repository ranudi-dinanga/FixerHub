const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const Booking = require('../models/Booking');
const { authenticateToken } = require('../middleware/auth');
require('dotenv').config();
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/receipts/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
const filetypes = /jpeg|jpg|png|gif|pdf/;
const mimetype = filetypes.test(file.mimetype) || file.mimetype === 'application/pdf';
const extname = filetypes.test(path.extname(file.originalname).toLowerCase()) || path.extname(file.originalname).toLowerCase() === '.pdf';

if (mimetype && extname) {
  return cb(null, true);
}
cb(new Error('Only image and PDF files are allowed!'));
  }
});

// Create a new booking
router.post('/', authenticateToken, bookingController.createBooking);

// Get provider's bookings
router.get('/provider/:providerId', authenticateToken, bookingController.getProviderBookings);

// Get seeker's bookings
router.get('/seeker/:seekerId', authenticateToken, bookingController.getSeekerBookings);

// Get single booking by ID
router.get('/:bookingId', authenticateToken, bookingController.getBookingById);

// Update booking status
router.patch('/:bookingId/status', authenticateToken, bookingController.updateBookingStatus);

// Add rating and review
router.post('/:bookingId/rating', authenticateToken, bookingController.addRating);

// Process payment (legacy - now handled by payment routes)
router.post('/process-payment', authenticateToken, bookingController.processPayment);

// Send quotation
router.post('/:bookingId/quotation', authenticateToken, bookingController.sendQuotation);

// Legacy receipt upload (now handled by payment routes)
router.post('/upload-receipt', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ message: 'Booking ID is required' });
    }

    // Update booking with receipt information
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        $set: {
          paymentStatus: 'pending_verification',
          receiptPath: req.file.path
        }
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      message: 'Receipt uploaded successfully',
      booking
    });
  } catch (error) {
    console.error('Error uploading receipt:', error);
    res.status(500).json({ message: 'Error uploading receipt' });
  }
});

module.exports = router; 