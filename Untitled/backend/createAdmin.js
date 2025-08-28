const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB Atlas (same as your main application)
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@cluster0000.ufxjm6l.mongodb.net/fixerhub?retryWrites=true&w=majority&appName=Cluster0000';
    
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB Atlas successfully');

    // Check if admin already exists
    console.log('Checking if admin user already exists...');
    const existingAdmin = await User.findOne({ email: 'admin@fixerhub.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists with email: admin@fixerhub.com');
      console.log('Admin ID:', existingAdmin._id);
      process.exit(0);
    }
    console.log('No existing admin found, creating new admin user...');

    // Hash password before saving
    console.log('Hashing admin password...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('Password hashed successfully');

    // Create admin user
    console.log('Creating admin user...');
    const adminUser = new User({
      name: 'Admin',
      email: 'admin@fixerhub.com',
      password: hashedPassword,
      role: 'admin',
      location: 'System',
      emailVerified: true
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@fixerhub.com');
    console.log('🔑 Password: admin123');
    console.log('🆔 Admin ID:', adminUser._id);
    console.log('👤 Role:', adminUser.role);
    
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    
    if (error.name === 'MongooseServerSelectionError') {
      console.error('🔌 Connection Error: Could not connect to MongoDB Atlas');
      console.error('💡 Please check:');
      console.error('   1. Your internet connection');
      console.error('   2. MongoDB Atlas cluster status');
      console.error('   3. Network access settings in MongoDB Atlas');
      console.error('   4. Connection string in your .env file');
    }
    
    process.exit(1);
  }
};

createAdminUser();