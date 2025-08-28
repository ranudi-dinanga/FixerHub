const Dispute = require('../models/Dispute');
const Booking = require('../models/Booking');
const User = require('../models/User');
const mongoose = require('mongoose');

// Create a new dispute
exports.createDispute = async (req, res) => {
  try {
    const {
      title,
      description,
      bookingId,
      category,
      priority = 'medium'
    } = req.body;

    const userId = req.user.id;

    // Validate required fields
    if (!title || !description || !bookingId || !category) {
      return res.status(400).json({ 
        message: 'Title, description, booking ID, and category are required'
      });
    }

    // Validate booking exists and user is involved
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is involved in the booking
    if (booking.serviceProvider.toString() !== userId && 
        booking.serviceSeeker.toString() !== userId) {
      return res.status(403).json({ 
        message: 'You can only report disputes for bookings you are involved in' 
      });
    }

    // Check if dispute already exists for this booking
    const existingDispute = await Dispute.findOne({ 
      booking: bookingId,
      status: { $in: ['open', 'under_review'] }
    });

    if (existingDispute) {
      return res.status(400).json({ 
        message: 'A dispute is already open for this booking' 
      });
    }

    // Create dispute
    const dispute = new Dispute({
      title,
      description,
      booking: bookingId,
      serviceProvider: booking.serviceProvider,
      serviceSeeker: booking.serviceSeeker,
      reportedBy: userId,
      category,
      priority
    });

    await dispute.save();

    // Populate the created dispute
    const populatedDispute = await Dispute.findById(dispute._id)
      .populate('booking', 'date time description price')
      .populate('serviceProvider', 'name email')
      .populate('serviceSeeker', 'name email')
      .populate('reportedBy', 'name email');

    res.status(201).json({
      message: 'Dispute created successfully',
      dispute: populatedDispute
    });

  } catch (error) {
    console.error('Error creating dispute:', error);
    res.status(500).json({ 
      message: 'Error creating dispute',
      error: error.message 
    });
  }
};

// Get disputes for a user
exports.getUserDisputes = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const disputes = await Dispute.getDisputesByUser(userId);
    
    res.json(disputes);
  } catch (error) {
    console.error('Error fetching user disputes:', error);
    res.status(500).json({ 
      message: 'Error fetching disputes',
      error: error.message 
    });
  }
};

// Get all disputes for admin
exports.getAllDisputes = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { status, priority, category, page = 1, limit = 20 } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (category) filters.category = category;

    const disputes = await Dispute.getDisputesForAdmin(filters)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Dispute.countDocuments(filters);

    res.json({
      disputes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error fetching all disputes:', error);
    res.status(500).json({ 
      message: 'Error fetching disputes',
      error: error.message 
    });
  }
};

// Get single dispute by ID
exports.getDisputeById = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(disputeId)) {
      return res.status(400).json({ message: 'Invalid dispute ID' });
    }

    const dispute = await Dispute.findById(disputeId)
      .populate('booking', 'date time description price')
      .populate('serviceProvider', 'name email')
      .populate('serviceSeeker', 'name email')
      .populate('reportedBy', 'name email')
      .populate('assignedAdmin', 'name email')
      .populate('resolvedBy', 'name email');

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    // Check if user has access to this dispute
    if (req.user.role !== 'admin' && 
        dispute.serviceProvider.toString() !== userId && 
        dispute.serviceSeeker.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(dispute);

  } catch (error) {
    console.error('Error fetching dispute:', error);
    res.status(500).json({ 
      message: 'Error fetching dispute',
      error: error.message 
    });
  }
};

// Update dispute status (admin only)
exports.updateDisputeStatus = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { status, adminNote } = req.body;
    const adminId = req.user.id;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    if (!mongoose.Types.ObjectId.isValid(disputeId)) {
      return res.status(400).json({ message: 'Invalid dispute ID' });
    }

    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    // Update status
    dispute.status = status;
    
    // Add admin note if provided
    if (adminNote) {
      await dispute.addAdminNote(adminNote, adminId);
    }

    // Assign admin if not already assigned
    if (!dispute.assignedAdmin) {
      dispute.assignedAdmin = adminId;
    }

    await dispute.save();

    // Populate the updated dispute
    const updatedDispute = await Dispute.findById(disputeId)
      .populate('booking', 'date time description price')
      .populate('serviceProvider', 'name email')
      .populate('serviceSeeker', 'name email')
      .populate('reportedBy', 'name email')
      .populate('assignedAdmin', 'name email');

    res.json({
      message: 'Dispute status updated successfully',
      dispute: updatedDispute
    });

  } catch (error) {
    console.error('Error updating dispute status:', error);
    res.status(500).json({ 
      message: 'Error updating dispute status',
      error: error.message 
    });
  }
};

// Resolve dispute (admin only)
exports.resolveDispute = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { resolution, outcome, outcomeAmount } = req.body;
    const adminId = req.user.id;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    if (!mongoose.Types.ObjectId.isValid(disputeId)) {
      return res.status(400).json({ message: 'Invalid dispute ID' });
    }

    if (!resolution) {
      return res.status(400).json({ message: 'Resolution is required' });
    }

    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    // Resolve the dispute
    await dispute.resolve(resolution, adminId, outcome, outcomeAmount);

    // Populate the resolved dispute
    const resolvedDispute = await Dispute.findById(disputeId)
      .populate('booking', 'date time description price')
      .populate('serviceProvider', 'name email')
      .populate('serviceSeeker', 'name email')
      .populate('reportedBy', 'name email')
      .populate('resolvedBy', 'name email');

    res.json({
      message: 'Dispute resolved successfully',
      dispute: resolvedDispute
    });

  } catch (error) {
    console.error('Error resolving dispute:', error);
    res.status(500).json({ 
      message: 'Error resolving dispute',
      error: error.message 
    });
  }
};

// Add message to dispute
exports.addMessage = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(disputeId)) {
      return res.status(400).json({ message: 'Invalid dispute ID' });
    }

    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    // Check if user has access to this dispute
    if (req.user.role !== 'admin' && 
        dispute.serviceProvider.toString() !== userId && 
        dispute.serviceSeeker.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Add message
    const isAdmin = req.user.role === 'admin';
    await dispute.addMessage(userId, message, isAdmin);

    // Populate the updated dispute
    const updatedDispute = await Dispute.findById(disputeId)
      .populate('booking', 'date time description price')
      .populate('serviceProvider', 'name email')
      .populate('serviceSeeker', 'name email')
      .populate('reportedBy', 'name email')
      .populate('assignedAdmin', 'name email')
      .populate('messages.sender', 'name email');

    res.json({
      message: 'Message added successfully',
      dispute: updatedDispute
    });

  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ 
      message: 'Error adding message',
      error: error.message 
    });
  }
};

// Upload evidence file
exports.uploadEvidence = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!mongoose.Types.ObjectId.isValid(disputeId)) {
      return res.status(400).json({ message: 'Invalid dispute ID' });
    }

    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    // Check if user has access to this dispute
    if (req.user.role !== 'admin' && 
        dispute.serviceProvider.toString() !== userId && 
        dispute.serviceSeeker.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Add evidence
    dispute.evidence.push({
      filePath: req.file.path,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      uploadedBy: userId
    });

    await dispute.save();

    res.json({
      message: 'Evidence uploaded successfully',
      evidence: dispute.evidence[dispute.evidence.length - 1]
    });

  } catch (error) {
    console.error('Error uploading evidence:', error);
    res.status(500).json({ 
      message: 'Error uploading evidence',
      error: error.message 
    });
  }
};

// Get dispute statistics for admin dashboard
exports.getDisputeStats = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const stats = await Dispute.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Dispute.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Dispute.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalDisputes = await Dispute.countDocuments();
    const openDisputes = await Dispute.countDocuments({ status: 'open' });
    const underReview = await Dispute.countDocuments({ status: 'under_review' });
    const resolved = await Dispute.countDocuments({ status: 'resolved' });

    res.json({
      total: totalDisputes,
      open: openDisputes,
      underReview,
      resolved,
      byStatus: stats,
      byPriority: priorityStats,
      byCategory: categoryStats
    });

  } catch (error) {
    console.error('Error fetching dispute stats:', error);
    res.status(500).json({ 
      message: 'Error fetching dispute statistics',
      error: error.message 
    });
  }
};
