const express = require('express');
const router = express.Router();
const certificationController = require('../controllers/certificationController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = 'uploads/certifications/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created upload directory: ${uploadDir}`);
}

// Configure multer for certification document uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `cert-${uniqueSuffix}-${sanitizedName}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for certification documents
  },
  fileFilter: function (req, file, cb) {
    console.log('File upload attempt:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    // Allow PDF, images, and common document formats
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|gif/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      console.log('File type validation passed');
      return cb(null, true);
    }
    
    console.log('File type validation failed:', { mimetype, extname });
    cb(new Error('Only PDF, DOC, DOCX, and image files are allowed for certifications!'));
  }
});

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  console.error('File upload error:', error);
  
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({ 
          message: 'File too large. Please upload a smaller file (max 10MB).',
          error: 'FILE_TOO_LARGE' 
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({ 
          message: 'Too many files. Please upload only one file.',
          error: 'TOO_MANY_FILES' 
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({ 
          message: 'Unexpected file field.',
          error: 'UNEXPECTED_FIELD' 
        });
      default:
        return res.status(400).json({ 
          message: 'File upload error.',
          error: error.code 
        });
    }
  }
  
  if (error.message.includes('Only PDF, DOC, DOCX, and image files')) {
    return res.status(400).json({ 
      message: error.message,
      error: 'INVALID_FILE_TYPE' 
    });
  }
  
  return res.status(500).json({ 
    message: 'File upload failed',
    error: error.message 
  });
};

// Service provider routes (authenticated)
router.post('/upload', 
  authenticateToken, 
  upload.single('document'), 
  handleUploadError,
  certificationController.uploadCertification
);

router.get('/provider/:providerId', certificationController.getProviderCertifications);

// Admin routes (admin only)
router.get('/admin/pending', authenticateToken, requireAdmin, certificationController.getPendingCertifications);
router.get('/admin/all', authenticateToken, requireAdmin, certificationController.getAllCertifications);
router.get('/admin/stats', authenticateToken, requireAdmin, certificationController.getCertificationStats);
router.patch('/admin/:certificationId/approve', authenticateToken, requireAdmin, certificationController.approveCertification);
router.patch('/admin/:certificationId/reject', authenticateToken, requireAdmin, certificationController.rejectCertification);
router.delete('/admin/:certificationId', authenticateToken, requireAdmin, certificationController.deleteCertification);

// User routes (authenticated users can delete their own certifications)
router.delete('/:certificationId', authenticateToken, certificationController.deleteCertification);

module.exports = router;
