const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const DatabasePerformanceMonitor = require('../utils/dbPerformance');

// Database performance diagnostics (admin only)
router.get('/db/performance', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const results = {};
    
    // Analyze bookings collection
    results.bookings = await DatabasePerformanceMonitor.analyzeCollectionStats('bookings');
    
    // Get database stats
    results.databaseStats = await DatabasePerformanceMonitor.getDatabaseStats();
    
    // Analyze index usage
    results.indexOptimization = await DatabasePerformanceMonitor.optimizeIndexes('bookings');
    
    res.json({
      message: 'Database performance analysis completed',
      timestamp: new Date().toISOString(),
      results
    });
  } catch (error) {
    console.error('Database performance analysis error:', error);
    res.status(500).json({ 
      message: 'Error analyzing database performance',
      error: error.message 
    });
  }
});

// Test query performance
router.post('/db/test-query', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { query, collectionName } = req.body;
    
    if (!query || !collectionName) {
      return res.status(400).json({ message: 'Query and collection name are required' });
    }

    const performance = await DatabasePerformanceMonitor.analyzeQueryPerformance(
      query, 
      collectionName
    );
    
    res.json({
      message: 'Query performance test completed',
      performance
    });
  } catch (error) {
    console.error('Query performance test error:', error);
    res.status(500).json({ 
      message: 'Error testing query performance',
      error: error.message 
    });
  }
});

// Get slow queries
router.get('/db/slow-queries', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const slowQueries = await DatabasePerformanceMonitor.getSlowQueries();
    
    res.json({
      message: 'Slow queries retrieved',
      slowQueries
    });
  } catch (error) {
    console.error('Error getting slow queries:', error);
    res.status(500).json({ 
      message: 'Error retrieving slow queries',
      error: error.message 
    });
  }
});

// Database connection health check
router.get('/db/health', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const connection = mongoose.connection;
    
    const health = {
      status: connection.readyState === 1 ? 'connected' : 'disconnected',
      readyState: connection.readyState,
      host: connection.host,
      port: connection.port,
      name: connection.name,
      timestamp: new Date().toISOString()
    };
    
    res.json({
      message: 'Database health check completed',
      health
    });
  } catch (error) {
    console.error('Database health check error:', error);
    res.status(500).json({ 
      message: 'Error checking database health',
      error: error.message 
    });
  }
});

module.exports = router;
