// Test script for Nodemailer email service
require('dotenv').config();
const emailService = require('./src/services/emailService');

async function testEmailConfiguration() {
  console.log('🧪 Testing Email Configuration\n');
  
  // Check environment variables
  console.log('🔍 Checking environment variables:');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST || 'Not set');
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT || 'Not set');
  console.log('EMAIL_USER:', process.env.EMAIL_USER || 'Not set');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***Set***' : 'Not set');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'Not set');
  console.log('');

  // Test connection
  console.log('🔗 Testing email server connection...');
  const connectionSuccess = await emailService.testConnection();
  
  if (!connectionSuccess) {
    console.log('\n❌ Email connection failed. Please check:');
    console.log('1. Your Gmail credentials are correct');
    console.log('2. You have enabled 2-factor authentication on Gmail');
    console.log('3. You have generated an app password');
    console.log('4. The app password is correctly set in EMAIL_PASS');
    return false;
  }

  return true;
}

async function testSendEmail(recipientEmail) {
  if (!recipientEmail) {
    console.log('ℹ️  To test sending emails, run: node test_nodemailer.js your@email.com');
    return;
  }

  try {
    console.log(`📤 Testing email sending to: ${recipientEmail}`);
    
    const result = await emailService.sendTestEmail(recipientEmail, 'FixerHub Email Test');
    
    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log('📬 Message ID:', result.messageId);
      console.log('📧 Check your inbox (and spam folder)');
    }
    
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
  }
}

async function testVerificationEmail(recipientEmail) {
  if (!recipientEmail) {
    return;
  }

  try {
    console.log(`\n📧 Testing verification email to: ${recipientEmail}`);
    
    const testVerificationLink = 'http://localhost:5173/verify-email?token=test-token-123';
    const result = await emailService.sendVerificationEmail(recipientEmail, testVerificationLink);
    
    if (result.success) {
      console.log('✅ Verification email sent successfully!');
      console.log('📬 Message ID:', result.messageId);
    }
    
  } catch (error) {
    console.error('❌ Failed to send verification email:', error.message);
  }
}

async function showSetupInstructions() {
  console.log('\n📋 Gmail Setup Instructions:');
  console.log('==========================================');
  console.log('1. Enable 2-Factor Authentication on your Gmail account');
  console.log('2. Go to Google Account Settings > Security > 2-Step Verification');
  console.log('3. Scroll down to "App passwords" and click it');
  console.log('4. Select "Mail" and "Other (custom name)"');
  console.log('5. Enter "FixerHub" as the app name');
  console.log('6. Copy the generated 16-character app password');
  console.log('7. Update your .env file with:');
  console.log('   EMAIL_PASS=your-16-character-app-password');
  console.log('');
  console.log('🔐 Security Note: Never use your regular Gmail password!');
  console.log('Always use app passwords for third-party applications.');
  console.log('');
}

async function runTests() {
  console.log('🚀 Starting Nodemailer Email Tests\n');
  
  const recipientEmail = process.argv[2];
  
  // Test configuration
  const configSuccess = await testEmailConfiguration();
  
  if (!configSuccess) {
    await showSetupInstructions();
    return;
  }
  
  // Test sending emails if recipient provided
  if (recipientEmail) {
    console.log('\n' + '='.repeat(50));
    await testSendEmail(recipientEmail);
    await testVerificationEmail(recipientEmail);
  } else {
    console.log('\n💡 Tip: Run with an email address to test sending:');
    console.log('node test_nodemailer.js your@email.com');
  }
  
  console.log('\n🏁 Tests completed!');
  
  if (configSuccess) {
    console.log('\n🎉 Your email system is ready to use!');
    console.log('Now you can test the full registration flow:');
    console.log('1. Start your servers: npm run dev');
    console.log('2. Register a new user');
    console.log('3. Check email for verification link');
    console.log('4. Click verification link');
    console.log('5. Login with verified account');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Test interrupted. Exiting...');
  process.exit(0);
});

if (require.main === module) {
  runTests().catch(error => {
    console.error('💥 Test failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  testEmailConfiguration,
  testSendEmail,
  testVerificationEmail
};
