// Load environment variables with fallback
try {
  require('dotenv').config({path:__dirname+'/../.env'});
  console.log('Environment variables loaded from .env file');
} catch (error) {
  console.log('No .env file found, using default values');
}
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const chatRoutes = require('./routes/chatRoutes');
const certificationRoutes = require('./routes/certificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const disputeRoutes = require('./routes/disputeRoutes');
const diagnosticRoutes = require('./routes/diagnosticRoutes');
const { scheduleCleanup } = require('./utils/fileUpload');

const app = express();
console.log('Server is starting...');

// File upload directories are now handled by fileUpload utility

// Middleware
const allowedOrigins = process.env.CORS_ORIGINS ? 
  process.env.CORS_ORIGINS.split(',') : 
  ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from uploads directory
const uploadsPath = path.join(__dirname, '../../../uploads');
console.log('Uploads directory path:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// Debug endpoint to check uploads directory
app.get('/debug/uploads', (req, res) => {
  const fs = require('fs');
  try {
    const files = fs.readdirSync(uploadsPath, { recursive: true });
    res.json({ 
      uploadsPath, 
      files,
      example_url: 'http://localhost:5001/uploads/receipts/filename.jpg'
    });
  } catch (error) {
    res.json({ error: error.message, uploadsPath });
  }
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@cluster0000.ufxjm6l.mongodb.net/fixerhub?retryWrites=true&w=majority&appName=Cluster0000';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas - fixerhub database'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/diagnostics', diagnosticRoutes);

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;

// Enhanced server startup with error handling
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Schedule file cleanup for old uploads
  scheduleCleanup();
}).on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try a different port.`);
  } else if (error.code === 'EACCES') {
    console.error(`Permission denied to bind to port ${PORT}. Try using a port above 1024.`);
  } else {
    console.error('Server startup error:', error);
  }
  process.exit(1);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app; 