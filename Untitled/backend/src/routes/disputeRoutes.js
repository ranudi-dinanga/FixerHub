const express = require('express');
const router = express.Router();
const disputeController = require('../controllers/disputeController');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for evidence file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/evidence/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'evidence-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for evidence files
  },
  fileFilter: function (req, file, cb) {
    // Allow images, PDFs, and common document formats
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'), false);
    }
  }
});

// Create a new dispute
router.post('/', authenticateToken, disputeController.createDispute);

// Get disputes for the authenticated user
router.get('/user', authenticateToken, disputeController.getUserDisputes);

// Get all disputes (admin only)
router.get('/admin', authenticateToken, disputeController.getAllDisputes);

// Get dispute statistics (admin only)
router.get('/admin/stats', authenticateToken, disputeController.getDisputeStats);

// Get single dispute by ID
router.get('/:disputeId', authenticateToken, disputeController.getDisputeById);

// Update dispute status (admin only)
router.patch('/:disputeId/status', authenticateToken, disputeController.updateDisputeStatus);

// Resolve dispute (admin only)
router.patch('/:disputeId/resolve', authenticateToken, disputeController.resolveDispute);

// Add message to dispute
router.post('/:disputeId/messages', authenticateToken, disputeController.addMessage);

// Upload evidence file
router.post('/:disputeId/evidence', authenticateToken, upload.single('evidence'), disputeController.uploadEvidence);

module.exports = router;
