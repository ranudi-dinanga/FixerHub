const mongoose = require('mongoose');

// Database performance monitoring utilities
class DatabasePerformanceMonitor {
  static async analyzeCollectionStats(collectionName) {
    try {
      const db = mongoose.connection.db;
      const collection = db.collection(collectionName);
      
      // Get collection stats
      const stats = await collection.stats();
      
      // Get index information
      const indexes = await collection.indexes();
      
      // Get sample documents to analyze structure
      const sampleDocs = await collection.find().limit(5).toArray();
      
      return {
        collectionName,
        stats: {
          count: stats.count,
          size: stats.size,
          avgObjSize: stats.avgObjSize,
          storageSize: stats.storageSize,
          indexes: stats.nindexes,
          totalIndexSize: stats.totalIndexSize
        },
        indexes: indexes.map(idx => ({
          name: idx.name,
          key: idx.key,
          unique: idx.unique,
          sparse: idx.sparse
        })),
        sampleDocs: sampleDocs.length,
        recommendations: []
      };
    } catch (error) {
      console.error(`Error analyzing collection ${collectionName}:`, error);
      return { error: error.message };
    }
  }

  static async analyzeQueryPerformance(query, collectionName) {
    try {
      const db = mongoose.connection.db;
      const collection = db.collection(collectionName);
      
      // Enable query profiling
      await db.admin().command({ profile: 2 });
      
      // Execute query with profiling
      const startTime = Date.now();
      const result = await collection.find(query).toArray();
      const endTime = Date.now();
      
      // Get profiling data
      const profileData = await db.admin().command({ profile: 0 });
      
      return {
        query: JSON.stringify(query),
        executionTime: endTime - startTime,
        resultCount: result.length,
        profileData: profileData
      };
    } catch (error) {
      console.error('Error analyzing query performance:', error);
      return { error: error.message };
    }
  }

  static async getSlowQueries() {
    try {
      const db = mongoose.connection.db;
      
      // Get slow query log (if enabled)
      const slowQueries = await db.admin().command({ getLog: 'global' });
      
      return slowQueries;
    } catch (error) {
      console.error('Error getting slow queries:', error);
      return { error: error.message };
    }
  }

  static async optimizeIndexes(collectionName) {
    try {
      const db = mongoose.connection.db;
      const collection = db.collection(collectionName);
      
      // Analyze index usage
      const indexUsage = await collection.aggregate([
        { $indexStats: {} }
      ]).toArray();
      
      // Get query patterns
      const queryPatterns = await collection.aggregate([
        { $sample: { size: 100 } },
        { $project: { _id: 1, serviceProvider: 1, serviceSeeker: 1, status: 1, createdAt: 1 } }
      ]).toArray();
      
      return {
        indexUsage,
        queryPatterns: queryPatterns.length,
        recommendations: this.generateIndexRecommendations(indexUsage, queryPatterns)
      };
    } catch (error) {
      console.error('Error optimizing indexes:', error);
      return { error: error.message };
    }
  }

  static generateIndexRecommendations(indexUsage, queryPatterns) {
    const recommendations = [];
    
    // Check for unused indexes
    const unusedIndexes = indexUsage.filter(idx => idx.accesses.ops === 0);
    if (unusedIndexes.length > 0) {
      recommendations.push({
        type: 'remove_unused_indexes',
        indexes: unusedIndexes.map(idx => idx.name),
        reason: 'These indexes are not being used and consume storage space'
      });
    }
    
    // Check for missing compound indexes
    if (queryPatterns.length > 0) {
      recommendations.push({
        type: 'add_compound_indexes',
        suggestion: 'Consider adding compound indexes for common query patterns: { serviceProvider: 1, status: 1, createdAt: -1 }'
      });
    }
    
    return recommendations;
  }

  static async getDatabaseStats() {
    try {
      const db = mongoose.connection.db;
      
      // Get database stats
      const dbStats = await db.admin().command({ dbStats: 1 });
      
      // Get server status
      const serverStatus = await db.admin().command({ serverStatus: 1 });
      
      return {
        database: {
          name: dbStats.db,
          collections: dbStats.collections,
          views: dbStats.views,
          objects: dbStats.objects,
          avgObjSize: dbStats.avgObjSize,
          dataSize: dbStats.dataSize,
          storageSize: dbStats.storageSize,
          indexes: dbStats.indexes,
          indexSize: dbStats.indexSize
        },
        server: {
          version: serverStatus.version,
          uptime: serverStatus.uptime,
          connections: serverStatus.connections,
          opcounters: serverStatus.opcounters
        }
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return { error: error.message };
    }
  }
}

module.exports = DatabasePerformanceMonitor;
