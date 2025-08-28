const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = 'uploads/profiles/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created upload directory: ${uploadDir}`);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitizedName}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    console.log('Profile image upload attempt:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      console.log('File type validation passed');
      return cb(null, true);
    }
    
    console.log('File type validation failed');
    cb(new Error('Only image files (JPEG, JPG, PNG, GIF) are allowed!'));
  }
});

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  console.error('File upload error:', error);
  
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({ 
          message: 'File too large. Please upload a smaller file (max 5MB).',
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
  
  if (error.message.includes('Only image files')) {
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

// User registration and authentication
router.post('/register', userController.register);
router.post('/login', userController.login);

// Get service providers with filters
router.get('/providers', userController.getServiceProviders);
router.get('/providers/:id', userController.getProviderDetails);

// Get user profile
router.get('/profile/:id', userController.getProfile);
router.put('/profile/:id', authenticateToken, upload.single('image'), handleUploadError, userController.updateProfile);

// Email verification routes
router.get('/verify-email', userController.verifyEmail);
router.post('/resend-verification', userController.resendVerificationEmail);

// Admin routes
router.post('/admin/login', userController.adminLogin);
router.get('/admin/users', authenticateToken, requireAdmin, userController.getAllUsers);
router.put('/admin/users/:id', authenticateToken, requireAdmin, userController.adminUpdateUser);
router.delete('/admin/users/:id', authenticateToken, requireAdmin, userController.deleteUser);
router.get('/admin/stats', authenticateToken, requireAdmin, userController.getDashboardStats);
router.patch('/admin/users/:id/verify', authenticateToken, requireAdmin, userController.toggleUserVerification);
router.put('/admin/users/:id/promote', authenticateToken, requireAdmin, userController.promoteToAdmin); // Fixed route
module.exports = router;