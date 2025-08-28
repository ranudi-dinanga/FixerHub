const Certification = require('../models/Certification');
const User = require('../models/User');
const mongoose = require('mongoose');

// Upload a new certification
exports.uploadCertification = async (req, res) => {
  try {
    console.log('Certification upload request received:', {
      body: req.body,
      file: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      } : 'No file',
      user: req.user ? {
        _id: req.user._id,
        role: req.user.role,
        email: req.user.email
      } : 'No user'
    });

    const {
      title,
      issuingOrganization,
      certificateNumber,
      issueDate,
      expiryDate,
      category,
      points,
      description
    } = req.body;

    const serviceProviderId = req.user._id;

    // Validate required fields
    if (!title || !issuingOrganization || !certificateNumber || !issueDate || !category) {
      console.log('Missing required fields:', { title, issuingOrganization, certificateNumber, issueDate, category });
      return res.status(400).json({
        message: 'Missing required fields: title, issuingOrganization, certificateNumber, issueDate, and category are required'
      });
    }

    // Check if user is a service provider
    const user = await User.findById(serviceProviderId);
    if (!user) {
      console.log('User not found:', serviceProviderId);
      return res.status(404).json({
        message: 'User not found'
      });
    }
    
    if (user.role !== 'service_provider') {
      console.log('User is not a service provider:', { userId: serviceProviderId, role: user.role });
      return res.status(403).json({
        message: 'Only service providers can upload certifications'
      });
    }

    // Check if document file was uploaded
    if (!req.file) {
      console.log('No file uploaded in request');
      return res.status(400).json({
        message: 'Certification document is required'
      });
    }

    console.log('File validation passed, creating certification record...');

    // Create certification
    const certification = new Certification({
      serviceProvider: serviceProviderId,
      title: title.trim(),
      issuingOrganization: issuingOrganization.trim(),
      certificateNumber: certificateNumber.trim(),
      issueDate: new Date(issueDate),
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      category,
      points: points || 10,
      description: description ? description.trim() : undefined,
      documentFile: req.file.path,
      status: 'pending'
    });

    console.log('Saving certification to database...');
    await certification.save();
    console.log('Certification saved successfully:', certification._id);

    // Update user's total certifications count
    console.log('Updating user certification count...');
    user.totalCertifications += 1;
    await user.save();
    console.log('User certification count updated:', user.totalCertifications);

    // Populate service provider details
    const populatedCertification = await Certification.findById(certification._id)
      .populate('serviceProvider', 'name email serviceCategory');

    console.log('Certification upload completed successfully');

    res.status(201).json({
      message: 'Certification uploaded successfully and is pending approval',
      certification: populatedCertification
    });
  } catch (error) {
    console.error('Certification upload error:', error);
    
    // Handle specific database errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', '),
        error: 'VALIDATION_ERROR'
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid data format provided',
        error: 'CAST_ERROR'
      });
    }
    
    res.status(500).json({
      message: 'Error uploading certification',
      error: error.message
    });
  }
};

// Get all certifications for a service provider
exports.getProviderCertifications = async (req, res) => {
  try {
    const { providerId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return res.status(400).json({ message: 'Invalid provider ID format' });
    }

    const certifications = await Certification.find({ serviceProvider: providerId })
      .sort({ createdAt: -1 });

    res.json(certifications);
  } catch (error) {
    console.error('Get provider certifications error:', error);
    res.status(500).json({
      message: 'Error fetching certifications',
      error: error.message
    });
  }
};

// Get all pending certifications (admin only)
exports.getPendingCertifications = async (req, res) => {
  try {
    const certifications = await Certification.find({ status: 'pending' })
      .populate('serviceProvider', 'name email serviceCategory location')
      .sort({ createdAt: -1 });

    res.json(certifications);
  } catch (error) {
    console.error('Get pending certifications error:', error);
    res.status(500).json({
      message: 'Error fetching pending certifications',
      error: error.message
    });
  }
};

// Get all certifications with filters (admin only)
exports.getAllCertifications = async (req, res) => {
  try {
    const { status, category, providerId } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    if (providerId) {
      query.serviceProvider = providerId;
    }

    const certifications = await Certification.find(query)
      .populate('serviceProvider', 'name email serviceCategory location')
      .sort({ createdAt: -1 });

    res.json(certifications);
  } catch (error) {
    console.error('Get all certifications error:', error);
    res.status(500).json({
      message: 'Error fetching certifications',
      error: error.message
    });
  }
};

// Approve certification (admin only)
exports.approveCertification = async (req, res) => {
  try {
    const { certificationId } = req.params;
    const { adminNotes } = req.body;
    const adminId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(certificationId)) {
      return res.status(400).json({ message: 'Invalid certification ID format' });
    }

    const certification = await Certification.findById(certificationId);
    if (!certification) {
      return res.status(404).json({ message: 'Certification not found' });
    }

    if (certification.status !== 'pending') {
      return res.status(400).json({ message: 'Certification is not pending approval' });
    }

    console.log('Approving certification:', {
      certificationId: certification._id,
      title: certification.title,
      points: certification.points,
      serviceProvider: certification.serviceProvider
    });

    // Update certification status
    certification.status = 'approved';
    certification.adminNotes = adminNotes;
    certification.reviewedBy = adminId;
    certification.reviewedAt = new Date();

    await certification.save();
    console.log('Certification status updated to approved');

    // Update user's certification points
    const user = await User.findById(certification.serviceProvider);
    if (user) {
      console.log('User before adding points:', {
        userId: user._id,
        currentPoints: user.certificationPoints,
        verifiedCount: user.verifiedCertifications,
        totalCount: user.totalCertifications
      });

      // Add points and update counts
      user.certificationPoints += certification.points;
      user.verifiedCertifications += 1;
      // Don't increment totalCertifications here as it was already incremented during upload
      
      // Update certification level
      if (user.certificationPoints >= 500) user.certificationLevel = 'diamond';
      else if (user.certificationPoints >= 300) user.certificationLevel = 'platinum';
      else if (user.certificationPoints >= 150) user.certificationLevel = 'gold';
      else if (user.certificationPoints >= 50) user.certificationLevel = 'silver';
      else user.certificationLevel = 'bronze';

      await user.save();
      
      console.log('User after adding points:', {
        userId: user._id,
        newPoints: user.certificationPoints,
        verifiedCount: user.verifiedCertifications,
        totalCount: user.totalCertifications,
        newLevel: user.certificationLevel
      });
    } else {
      console.error('User not found for certification approval:', certification.serviceProvider);
    }

    // Populate service provider details
    const populatedCertification = await Certification.findById(certificationId)
      .populate('serviceProvider', 'name email serviceCategory certificationPoints certificationLevel verifiedCertifications totalCertifications');

    res.json({
      message: 'Certification approved successfully',
      certification: populatedCertification
    });
  } catch (error) {
    console.error('Approve certification error:', error);
    res.status(500).json({
      message: 'Error approving certification',
      error: error.message
    });
  }
};

// Reject certification (admin only)
exports.rejectCertification = async (req, res) => {
  try {
    const { certificationId } = req.params;
    const { rejectionReason, adminNotes } = req.body;
    const adminId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(certificationId)) {
      return res.status(400).json({ message: 'Invalid certification ID format' });
    }

    if (!rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const certification = await Certification.findById(certificationId);
    if (!certification) {
      return res.status(404).json({ message: 'Certification not found' });
    }

    if (certification.status !== 'pending') {
      return res.status(400).json({ message: 'Certification is not pending approval' });
    }

    // Update certification status
    certification.status = 'rejected';
    certification.rejectionReason = rejectionReason;
    certification.adminNotes = adminNotes;
    certification.reviewedBy = adminId;
    certification.reviewedAt = new Date();

    await certification.save();

    // Populate service provider details
    const populatedCertification = await Certification.findById(certificationId)
      .populate('serviceProvider', 'name email serviceCategory');

    res.json({
      message: 'Certification rejected successfully',
      certification: populatedCertification
    });
  } catch (error) {
    console.error('Reject certification error:', error);
    res.status(500).json({
      message: 'Error rejecting certification',
      error: error.message
    });
  }
};

// Delete certification (admin or owner)
exports.deleteCertification = async (req, res) => {
  try {
    const { certificationId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!mongoose.Types.ObjectId.isValid(certificationId)) {
      return res.status(400).json({ message: 'Invalid certification ID format' });
    }

    const certification = await Certification.findById(certificationId);
    if (!certification) {
      return res.status(404).json({ message: 'Certification not found' });
    }

    // Check permissions: admin can delete any, provider can only delete their own
    if (userRole !== 'admin' && certification.serviceProvider.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only delete your own certifications' });
    }

    // If certification was approved, remove points from user
    if (certification.status === 'approved') {
      const user = await User.findById(certification.serviceProvider);
      if (user) {
        await user.removeCertificationPoints(certification.points);
      }
    }

    // Update user's certification count
    const user = await User.findById(certification.serviceProvider);
    if (user) {
      user.totalCertifications = Math.max(0, user.totalCertifications - 1);
      await user.save();
    }

    await Certification.findByIdAndDelete(certificationId);

    res.json({ message: 'Certification deleted successfully' });
  } catch (error) {
    console.error('Delete certification error:', error);
    res.status(500).json({
      message: 'Error deleting certification',
      error: error.message
    });
  }
};

// Get certification statistics (admin only)
exports.getCertificationStats = async (req, res) => {
  try {
    const totalCertifications = await Certification.countDocuments();
    const pendingCertifications = await Certification.countDocuments({ status: 'pending' });
    const approvedCertifications = await Certification.countDocuments({ status: 'approved' });
    const rejectedCertifications = await Certification.countDocuments({ status: 'rejected' });

    // Get certifications by category
    const categoryStats = await Certification.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get top providers by certification points
    const topProviders = await User.aggregate([
      { $match: { role: 'service_provider' } },
      { $sort: { certificationPoints: -1 } },
      { $limit: 10 },
      { $project: { name: 1, email: 1, serviceCategory: 1, certificationPoints: 1, certificationLevel: 1 } }
    ]);

    res.json({
      totalCertifications,
      pendingCertifications,
      approvedCertifications,
      rejectedCertifications,
      categoryStats,
      topProviders
    });
  } catch (error) {
    console.error('Get certification stats error:', error);
    res.status(500).json({
      message: 'Error fetching certification statistics',
      error: error.message
    });
  }
};
