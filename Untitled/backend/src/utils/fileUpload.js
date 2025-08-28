const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { handleError } = require('./common');

// Ensure upload directories exist
const createUploadDirs = () => {
  const uploadDirs = [
    'uploads',
    'uploads/profiles',
    'uploads/certifications',
    'uploads/receipts',
    'uploads/evidence',
    'uploads/bills',
    'uploads/disputes'
  ];
  
  uploadDirs.forEach(dir => {
    const fullPath = path.join(__dirname, '../../../', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`Created directory: ${fullPath}`);
    }
  });
};

// Initialize directories on module load
createUploadDirs();

// Common file filter function
const createFileFilter = (allowedTypes = ['image', 'pdf']) => {
  return (req, file, cb) => {
    const allowedMimeTypes = [];
    
    if (allowedTypes.includes('image')) {
      allowedMimeTypes.push('image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp');
    }
    if (allowedTypes.includes('pdf')) {
      allowedMimeTypes.push('application/pdf');
    }
    if (allowedTypes.includes('document')) {
      allowedMimeTypes.push('application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    }

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const allowedTypesString = allowedTypes.join(', ');
      cb(new Error(`Only ${allowedTypesString} files are allowed!`), false);
    }
  };
};

// Generate unique filename
const generateFilename = (originalname) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const extension = path.extname(originalname);
  const basename = path.basename(originalname, extension);
  
  // Sanitize filename
  const sanitizedBasename = basename.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${timestamp}-${random}-${sanitizedBasename}${extension}`;
};

// Storage configurations for different upload types
const storageConfigs = {
  receipts: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../../../', 'uploads/receipts'));
    },
    filename: (req, file, cb) => {
      cb(null, generateFilename(file.originalname));
    }
  }),
  
  bills: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../../../', 'uploads/bills'));
    },
    filename: (req, file, cb) => {
      cb(null, generateFilename(file.originalname));
    }
  }),
  
  evidence: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../../../', 'uploads/evidence'));
    },
    filename: (req, file, cb) => {
      cb(null, generateFilename(file.originalname));
    }
  }),
  
  profiles: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../../../', 'uploads/profiles'));
    },
    filename: (req, file, cb) => {
      cb(null, generateFilename(file.originalname));
    }
  }),
  
  certifications: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../../../', 'uploads/certifications'));
    },
    filename: (req, file, cb) => {
      cb(null, generateFilename(file.originalname));
    }
  })
};

// Create upload middleware factory
const createUploadMiddleware = (type, options = {}) => {
  const {
    maxFileSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image', 'pdf'],
    maxFiles = 1
  } = options;

  const storage = storageConfigs[type];
  if (!storage) {
    throw new Error(`Unknown upload type: ${type}`);
  }

  const upload = multer({
    storage,
    limits: {
      fileSize: maxFileSize,
      files: maxFiles
    },
    fileFilter: createFileFilter(allowedTypes)
  });

  return maxFiles === 1 ? upload.single('file') : upload.array('files', maxFiles);
};

// Predefined upload middleware
const uploadMiddleware = {
  // Receipt uploads (bank transfer receipts)
  receipt: createUploadMiddleware('receipts', {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image', 'pdf']
  }),
  
  // Bill uploads
  bill: createUploadMiddleware('bills', {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image', 'pdf']
  }),
  
  // Evidence uploads (disputes)
  evidence: createUploadMiddleware('evidence', {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image', 'pdf', 'document'],
    maxFiles: 5
  }),
  
  // Profile picture uploads
  profile: createUploadMiddleware('profiles', {
    maxFileSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image']
  }),
  
  // Certification uploads
  certification: createUploadMiddleware('certifications', {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image', 'pdf']
  })
};

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({ 
          message: 'File too large. Please upload a smaller file.',
          error: 'FILE_TOO_LARGE' 
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({ 
          message: 'Too many files. Please upload fewer files.',
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
  
  if (error.message.includes('Only')) {
    return res.status(400).json({ 
      message: error.message,
      error: 'INVALID_FILE_TYPE' 
    });
  }
  
  return handleError(error, res, 'File upload failed');
};

// Clean up old files
const cleanupOldFiles = (directory, maxAgeInDays = 30) => {
  const maxAge = maxAgeInDays * 24 * 60 * 60 * 1000;
  const dirPath = path.join(__dirname, '../../../', 'uploads', directory);
  
  if (!fs.existsSync(dirPath)) return;
  
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${dirPath}:`, err);
      return;
    }
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        
        if (Date.now() - stats.mtime.getTime() > maxAge) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Error deleting old file ${filePath}:`, err);
            } else {
              console.log(`Deleted old file: ${filePath}`);
            }
          });
        }
      });
    });
  });
};

// Schedule cleanup for temporary files (receipts and evidence)
const scheduleCleanup = () => {
  // Clean up old temporary files every 24 hours
  setInterval(() => {
    cleanupOldFiles('receipts', 90); // Keep receipts for 90 days
    cleanupOldFiles('evidence', 180); // Keep evidence for 180 days
  }, 24 * 60 * 60 * 1000);
};

// File validation helper
const validateFile = (file, options = {}) => {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image', 'pdf'] } = options;
  
  if (!file) {
    throw new Error('No file provided');
  }
  
  if (file.size > maxSize) {
    throw new Error(`File size exceeds limit of ${Math.round(maxSize / (1024 * 1024))}MB`);
  }
  
  const allowedMimeTypes = [];
  if (allowedTypes.includes('image')) {
    allowedMimeTypes.push('image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp');
  }
  if (allowedTypes.includes('pdf')) {
    allowedMimeTypes.push('application/pdf');
  }
  
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  return true;
};

// Get file URL helper
const getFileUrl = (filePath) => {
  if (!filePath) return null;
  
  // If already a relative path, use as is
  if (!filePath.includes('uploads/')) {
    return `/uploads/${filePath}`;
  }
  
  // Convert absolute path to relative URL
  const relativePath = filePath.replace(/\\/g, '/');
  return `/uploads/${relativePath.split('/uploads/')[1]}`;
};

// Get full file path for multer file
const getFullFilePath = (file, subfolder) => {
  if (!file) return null;
  return `${subfolder}/${file.filename}`;
};

// Validate and process uploaded file
const processUploadedFile = (file, subfolder) => {
  if (!file) throw new Error('No file uploaded');
  
  return {
    filename: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    relativePath: `${subfolder}/${file.filename}`,
    url: `/uploads/${subfolder}/${file.filename}`
  };
};

module.exports = {
  uploadMiddleware,
  handleUploadError,
  createUploadMiddleware,
  createUploadDirs,
  cleanupOldFiles,
  scheduleCleanup,
  validateFile,
  getFileUrl,
  getFullFilePath,
  processUploadedFile,
  generateFilename
};
