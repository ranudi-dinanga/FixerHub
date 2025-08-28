const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
require('dotenv').config();

// Top of file
const bcrypt = require('bcryptjs');

// Register a new user
const register = async (req, res) => {
  try {
    const { email, role, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create user data object
    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      ...req.body,
      password: hashedPassword,
      // Only include bank details if user is a service provider
      bankName: role === 'service_provider' ? req.body.bankName : undefined,
      accountNumber: role === 'service_provider' ? req.body.accountNumber : undefined,
      branchName: role === 'service_provider' ? req.body.branchName : undefined,
      emailVerified: false // Ensure email is not verified initially
    };

    const user = new User(userData);
    await user.save();

    // Award profile picture points for service providers if they have an image
    if (role === 'service_provider' && userData.image) {
      const pointsToAward = 25; // 25 points for having a profile picture during registration
      await user.addProfilePicturePoints(pointsToAward);
      console.log(`Awarded ${pointsToAward} profile picture points to new service provider ${user._id}`);
    }
    
    // Send verification email
    try {
      await sendVerificationEmail(user.email, user._id);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email sending fails
    }

    // Don't automatically log the user in - require email verification first
    res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account before logging in.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        serviceCategory: user.serviceCategory,
        rating: user.rating,
        totalRatings: user.totalRatings,
        emailVerified: user.emailVerified,
        profilePicturePoints: user.profilePicturePoints
      },
      requiresVerification: true
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email only
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(401).json({ 
        message: 'Please verify your email address before logging in. Check your inbox for the verification email.',
        requiresVerification: true,
        email: user.email
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data and token
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        serviceCategory: user.serviceCategory,
        rating: user.rating,
        totalRatings: user.totalRatings,
        emailVerified: user.emailVerified
      },
      token
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get service providers with filters
const getServiceProviders = async (req, res) => {
  try {
    const { location, category } = req.query;
    let query = { role: 'service_provider' };

    if (location) {
      query.location = new RegExp(location, 'i');
    }
    if (category && category !== 'all') {
      query.serviceCategory = category;
    }

    const providers = await User.find(query)
      .select('name email role location serviceCategory rating totalRatings description hourlyRate image certificationPoints certificationLevel verifiedCertifications')
      .sort({ certificationPoints: -1, rating: -1 }); // Sort by certification points first, then rating

    res.json(providers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get provider details
const getProviderDetails = async (req, res) => {
  try {
    const provider = await User.findOne({
      _id: req.params.id,
      role: 'service_provider'
    }).select('name email role location serviceCategory rating totalRatings description hourlyRate bankName accountNumber branchName image certificationPoints certificationLevel verifiedCertifications totalCertifications');
    
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.json(provider);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log('Profile update request:', {
      userId: id,
      updates: updates,
      hasFile: !!req.file,
      fileInfo: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null
    });

    // Validate user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is updating their own profile
    if (req.user._id.toString() !== id) {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    // Remove sensitive fields that shouldn't be updated directly
    delete updates.password;
    delete updates.role;
    delete updates.rating;
    delete updates.totalRatings;
    delete updates.email; // Prevent email changes through this endpoint

    // Track if profile picture is being added/updated
    let profilePictureChanged = false;
    let hadProfilePicture = !!existingUser.image;

    // If there's an uploaded file, update the image field
    if (req.file) {
      updates.image = `/uploads/profiles/${req.file.filename}`;
      profilePictureChanged = true;
      console.log('Image uploaded:', updates.image);
    }

    // If image field is being updated (even without file upload)
    if (updates.image !== undefined && updates.image !== existingUser.image) {
      profilePictureChanged = true;
    }
    
    // Validate required fields for service providers
    if (existingUser.role === 'service_provider') {
      const requiredFields = ['name', 'location', 'serviceCategory', 'description', 'hourlyRate', 'bankName', 'accountNumber', 'branchName'];
      const missingFields = requiredFields.filter(field => !updates[field] && !existingUser[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          message: `Missing required fields for service provider: ${missingFields.join(', ')}` 
        });
      }
    }

    console.log('Updating user with data:', updates);
    
    const user = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Award profile picture points for service providers
    if (profilePictureChanged && user.role === 'service_provider') {
      const hasProfilePicture = !!user.image;
      
      if (hasProfilePicture && !hadProfilePicture) {
        // Award points for adding a profile picture
        const pointsToAward = 25; // 25 points for adding a profile picture
        await user.addProfilePicturePoints(pointsToAward);
        console.log(`Awarded ${pointsToAward} profile picture points to user ${user._id}`);
      } else if (!hasProfilePicture && hadProfilePicture) {
        // Remove points if profile picture is removed
        const pointsToRemove = 25;
        await user.removeProfilePicturePoints(pointsToRemove);
        console.log(`Removed ${pointsToRemove} profile picture points from user ${user._id}`);
      }
      // If updating existing profile picture, no additional points
    }
    
    console.log('Profile updated successfully for user:', user._id);
    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    
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
    
    res.status(500).json({ message: error.message || 'Error updating profile' });
  }
};

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find admin user in database
    const admin = await User.findOne({ email, role: 'admin' });
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
    
    // Compare hashed password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { _id: admin._id, role: admin.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      user: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      token
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update user (admin only)
const adminUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const user = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get dashboard statistics (admin only)
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProviders = await User.countDocuments({ role: 'service_provider' });
    const totalSeekers = await User.countDocuments({ role: 'service_seeker' });
    const verifiedUsers = await User.countDocuments({ emailVerified: true });
    const unverifiedUsers = await User.countDocuments({ emailVerified: false });
    
    // Get recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    // Get users by service category
    const categoryStats = await User.aggregate([
      { $match: { role: 'service_provider' } },
      { $group: { _id: '$serviceCategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      totalUsers,
      totalProviders,
      totalSeekers,
      verifiedUsers,
      unverifiedUsers,
      recentRegistrations,
      categoryStats
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Toggle user verification status (admin only)
const toggleUserVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.emailVerified = !user.emailVerified;
    await user.save();
    
    res.json({ 
      message: `User ${user.emailVerified ? 'verified' : 'unverified'} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const crypto = require('crypto');
const resend = require('../resend');

// Generate email verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email
const sendVerificationEmail = async (email, userId) => {
  try {
    const token = generateVerificationToken();
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/verify-email?token=${token}`;
    
    console.log('🔄 Preparing to send verification email...');
    console.log('📧 Email:', email);
    console.log('👤 User ID:', userId);
    console.log('🔗 Verification link:', verificationLink);
    
    // Update user with verification token
    const user = await User.findByIdAndUpdate(
      userId,
      {
        emailVerificationToken: token,
        emailVerificationExpires: new Date(Date.now() + 3600000) // 1 hour
      },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      throw new Error('User not found when setting verification token');
    }
    
    console.log('✅ User updated with verification token, attempting to send email...');
    
    // Use Resend with onboarding domain for testing
    const emailData = {
      from: 'no-reply@mail.fixerhub.space', // Using onboarding domain for testing
      to: [email],
      subject: 'Verify your FixerHub account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification - FixerHub</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
            <!-- Header -->
            <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #2563eb;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">FixerHub</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Your Trusted Service Platform</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px 0;">
              <h2 style="color: #333; margin: 0 0 20px 0;">Welcome to FixerHub!</h2>
              
              <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for registering with FixerHub. We're excited to have you join our community of service providers and seekers.
              </p>
              
              <p style="color: #555; line-height: 1.6; margin: 0 0 30px 0;">
                To complete your account setup and start using FixerHub, please verify your email address by clicking the button below:
              </p>
              
              <!-- Verification Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" 
                   style="background-color: #2563eb; 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          display: inline-block; 
                          font-size: 16px; 
                          font-weight: bold;
                          box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);">
                  Verify Email Address
                </a>
              </div>
              
              <!-- Security Info -->
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 30px 0;">
                <h3 style="color: #333; margin: 0 0 10px 0; font-size: 16px;">🔒 Security Information</h3>
                <ul style="color: #666; margin: 0; padding-left: 20px; line-height: 1.6;">
                  <li>This verification link will expire in 1 hour</li>
                  <li>For your security, never share this email with others</li>
                  <li>If you didn't create an account, please ignore this email</li>
                </ul>
              </div>
              
              <!-- Alternative Link -->
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="color: #2563eb; font-size: 12px; word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">
                ${verificationLink}
              </p>
            </div>
            
            <!-- Footer -->
            <div style="border-top: 1px solid #eee; padding: 20px 0; text-align: center;">
              <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">
                Need help? Contact us at support@fixerhub.com
              </p>
              <p style="color: #999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} FixerHub. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      // Plain text version
      text: `
        Welcome to FixerHub!
        
        Thank you for registering with FixerHub. Please verify your email address to complete your account setup.
        
        Click or copy this link to verify your email:
        ${verificationLink}
        
        This link will expire in 1 hour. If you didn't create an account with FixerHub, please ignore this email.
        
        Need help? Contact us at support@fixerhub.com
        
        © ${new Date().getFullYear()} FixerHub. All rights reserved.
      `
    };
    
    console.log('📤 Sending email with data:', JSON.stringify({
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject
    }, null, 2));
    
    const result = await resend.emails.send(emailData);
    
    console.log('📬 Email send result:', result);
    console.log(`✅ Verification email sent successfully to ${email}`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    console.error('🔍 Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data || error.response
    });
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

// Verify email token
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }
    
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }
    
    // Update user as verified
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ message: 'Failed to verify email' });
  }
};

// Resend verification email
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }
    
    await sendVerificationEmail(user.email, user._id);
    res.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Error resending verification email:', error);
    res.status(500).json({ message: 'Failed to send verification email' });
  }
};

// Add this new controller function
const promoteToAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if requesting user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can perform this action' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role: 'admin' },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User promoted to admin successfully',
      user
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  getServiceProviders,
  getProfile,
  getProviderDetails,
  updateProfile,
  adminLogin,
  getAllUsers,
  adminUpdateUser,
  deleteUser,
  getDashboardStats,
  toggleUserVerification,
  verifyEmail,
  resendVerificationEmail,
  promoteToAdmin // Add this to exports
};