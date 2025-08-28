// Test script to verify Resend API key and email sending
require('dotenv').config();
const { Resend } = require('resend');

async function testResendAPI() {
  try {
    console.log('🧪 Testing Resend API...');
    console.log('🔑 API Key:', process.env.RESEND_API_KEY ? 'Set ✅' : 'NOT SET ❌');
    
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not found in environment variables');
      return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Test sending a simple email with onboarding domain (works for testing)
    const testEmail = {
      from: 'FixerHub <onboarding@resend.dev>',
      to: ['ammysilva2002@gmail.com'], // Can only send to your registered email
      subject: 'Test Email from FixerHub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Test Email</h2>
          <p>This is a test email from your FixerHub application.</p>
          <p>If you receive this, your Resend integration is working correctly!</p>
          <p style="color: #666; font-size: 14px;">Timestamp: ${new Date().toISOString()}</p>
        </div>
      `
    };

    console.log('📤 Sending test email...');
    console.log('Email data:', JSON.stringify({
      from: testEmail.from,
      to: testEmail.to,
      subject: testEmail.subject
    }, null, 2));

    const result = await resend.emails.send(testEmail);
    
    console.log('📬 Email send result:', result);
    console.log('✅ Test email sent successfully!');
    
    return result;
  } catch (error) {
    console.error('❌ Error testing Resend API:', error);
    console.error('🔍 Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data || error.response
    });
    
    // Common error scenarios
    if (error.message.includes('401')) {
      console.error('🚨 API Key Error: Your Resend API key might be invalid or expired');
    } else if (error.message.includes('403')) {
      console.error('🚨 Permission Error: Your API key might not have permission to send emails');
    } else if (error.message.includes('domain')) {
      console.error('🚨 Domain Error: You might need to verify your domain with Resend');
    }
    
    return null;
  }
}

// Alternative test with a working email (change this to your email)
async function testWithRealEmail(recipientEmail) {
  if (!recipientEmail) {
    console.log('ℹ️  To test with a real email, run: node test_resend.js your@email.com');
    return;
  }
  
  try {
    console.log(`🎯 Testing with real email: ${recipientEmail}`);
    
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const result = await resend.emails.send({
      from: 'FixerHub <onboarding@resend.dev>',
      to: [recipientEmail],
      subject: 'FixerHub Email Verification Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">FixerHub Email Test</h2>
          <p>This is a test email from your FixerHub application.</p>
          <p>If you receive this, your email verification system should work!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5173/verify-email?token=test123" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Test Verification Link
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Test timestamp: ${new Date().toISOString()}</p>
        </div>
      `
    });
    
    console.log('📬 Real email send result:', result);
    console.log(`✅ Test email sent successfully to ${recipientEmail}!`);
    console.log('📧 Check your inbox (including spam folder)');
    
  } catch (error) {
    console.error(`❌ Failed to send test email to ${recipientEmail}:`, error.message);
  }
}

// Run the tests
async function runTests() {
  console.log('🚀 Starting Resend API Tests\n');
  
  await testResendAPI();
  
  // Check if a real email was provided as command line argument
  const recipientEmail = process.argv[2];
  if (recipientEmail) {
    console.log('\n' + '='.repeat(50));
    await testWithRealEmail(recipientEmail);
  }
  
  console.log('\n🏁 Tests completed!');
}

if (require.main === module) {
  runTests();
}

module.exports = { testResendAPI, testWithRealEmail };
