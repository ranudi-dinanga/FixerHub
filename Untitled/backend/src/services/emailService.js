const resend = require('../resend');
require('dotenv').config();

/**
 * Email Service with Environment-based Routing
 * 
 * Development Mode: All emails sent to DEV_EMAIL_RECIPIENT for testing
 * Production Mode: Emails sent to actual user email addresses
 */

const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

const isDevelopment = () => {
  return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev';
};

/**
 * Get the appropriate recipient email based on environment
 * @param {string} userEmail - The actual user's email address
 * @returns {string} - Email address to send to
 */
const getRecipientEmail = (userEmail) => {
  if (isDevelopment()) {
    const devEmail = process.env.DEV_EMAIL_RECIPIENT;
    if (!devEmail) {
      console.warn('⚠️  DEV_EMAIL_RECIPIENT not set, using user email:', userEmail);
      return userEmail;
    }
    console.log(`📧 Development mode: Redirecting email from ${userEmail} to ${devEmail}`);
    return devEmail;
  }
  
  console.log(`📧 Production mode: Sending email to actual recipient: ${userEmail}`);
  return userEmail;
};

/**
 * Get the appropriate from address based on environment
 * @returns {string} - From email address
 */
const getFromAddress = () => {
  if (isDevelopment()) {
    // In development, use onboarding domain which works with free tier
    return 'FixerHub <onboarding@resend.dev>';
  } else {
    // In production, use your verified domain
    return 'FixerHub <noreply@fixahub.com>';
  }
};

/**
 * Send verification email with environment-aware routing
 * @param {string} userEmail - The user's actual email address
 * @param {string} verificationLink - The verification link
 * @param {string} userName - The user's name (optional)
 * @returns {Object} - Email send result
 */
const sendVerificationEmail = async (userEmail, verificationLink, userName = 'User') => {
  try {
    const recipientEmail = getRecipientEmail(userEmail);
    const fromAddress = getFromAddress();
    
    console.log('🔄 Preparing to send verification email...');
    console.log('📧 Original recipient:', userEmail);
    console.log('📧 Actual recipient:', recipientEmail);
    console.log('🔗 Verification link:', verificationLink);
    console.log('🌍 Environment:', process.env.NODE_ENV || 'development');

    const emailData = {
      from: fromAddress,
      to: [recipientEmail],
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
            
            <!-- Development Notice -->
            ${isDevelopment() && recipientEmail !== userEmail ? `
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 6px;">
              <h3 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">🔧 Development Mode</h3>
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>Original recipient:</strong> ${userEmail}<br>
                <strong>Redirected to:</strong> ${recipientEmail}<br>
                This email was redirected for testing purposes.
              </p>
            </div>
            ` : ''}
            
            <!-- Content -->
            <div style="padding: 30px 0;">
              <h2 style="color: #333; margin: 0 0 20px 0;">Welcome to FixerHub, ${userName}!</h2>
              
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
              ${isDevelopment() ? `
              <p style="color: #999; font-size: 11px; margin: 10px 0 0 0;">
                Environment: ${process.env.NODE_ENV || 'development'} | Mode: Development Testing
              </p>
              ` : ''}
            </div>
          </div>
        </body>
        </html>
      `,
      // Plain text version
      text: `
        Welcome to FixerHub, ${userName}!
        
        ${isDevelopment() && recipientEmail !== userEmail ? 
          `[DEVELOPMENT MODE]\nOriginal recipient: ${userEmail}\nRedirected to: ${recipientEmail}\n\n` : ''
        }
        
        Thank you for registering with FixerHub. Please verify your email address to complete your account setup.
        
        Click or copy this link to verify your email:
        ${verificationLink}
        
        This link will expire in 1 hour. If you didn't create an account with FixerHub, please ignore this email.
        
        Need help? Contact us at support@fixerhub.com
        
        © ${new Date().getFullYear()} FixerHub. All rights reserved.
        
        ${isDevelopment() ? `Environment: ${process.env.NODE_ENV || 'development'}` : ''}
      `
    };
    
    console.log('📤 Sending email with data:', JSON.stringify({
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
      environment: process.env.NODE_ENV || 'development'
    }, null, 2));
    
    const result = await resend.emails.send(emailData);
    
    console.log('📬 Email send result:', result);
    console.log(`✅ Verification email sent successfully!`);
    console.log(`   Original recipient: ${userEmail}`);
    console.log(`   Actual recipient: ${recipientEmail}`);
    
    return {
      success: true,
      result,
      originalRecipient: userEmail,
      actualRecipient: recipientEmail,
      environment: process.env.NODE_ENV || 'development'
    };
    
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

/**
 * Send test email for debugging
 * @param {string} testRecipient - Email to send test to (optional, uses environment logic)
 * @returns {Object} - Email send result
 */
const sendTestEmail = async (testRecipient = 'test@example.com') => {
  try {
    const recipientEmail = getRecipientEmail(testRecipient);
    const fromAddress = getFromAddress();
    
    const result = await resend.emails.send({
      from: fromAddress,
      to: [recipientEmail],
      subject: `FixerHub Test Email - ${process.env.NODE_ENV || 'development'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">FixerHub Test Email</h2>
          <p>This is a test email from your FixerHub application.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">Environment Info:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</li>
              <li><strong>Original recipient:</strong> ${testRecipient}</li>
              <li><strong>Actual recipient:</strong> ${recipientEmail}</li>
              <li><strong>From address:</strong> ${fromAddress}</li>
            </ul>
          </div>
          
          <p>If you receive this email, your configuration is working correctly!</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Sent at: ${new Date().toLocaleString()}<br>
            From: FixerHub Email Service
          </p>
        </div>
      `,
      text: `
        FixerHub Test Email
        
        Environment: ${process.env.NODE_ENV || 'development'}
        Original recipient: ${testRecipient}
        Actual recipient: ${recipientEmail}
        From address: ${fromAddress}
        
        This is a test email from your FixerHub application.
        If you receive this email, your configuration is working correctly!
        
        Sent at: ${new Date().toLocaleString()}
        From: FixerHub Email Service
      `
    });
    
    return {
      success: true,
      result,
      originalRecipient: testRecipient,
      actualRecipient: recipientEmail,
      environment: process.env.NODE_ENV || 'development'
    };
    
  } catch (error) {
    console.error('❌ Error sending test email:', error);
    throw error;
  }
};

/**
 * Log current email configuration
 */
const logEmailConfig = () => {
  console.log('📧 Email Service Configuration:');
  console.log('  Environment:', process.env.NODE_ENV || 'development');
  console.log('  Mode:', isDevelopment() ? 'Development' : 'Production');
  console.log('  From address:', getFromAddress());
  console.log('  Dev recipient:', process.env.DEV_EMAIL_RECIPIENT || 'Not set');
  console.log('  Email routing:', isDevelopment() ? 'All emails → Dev email' : 'User emails → User emails');
};

module.exports = {
  sendVerificationEmail,
  sendTestEmail,
  getRecipientEmail,
  getFromAddress,
  isProduction,
  isDevelopment,
  logEmailConfig
};
  
