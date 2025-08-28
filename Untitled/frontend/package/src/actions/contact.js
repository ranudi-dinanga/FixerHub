import React from 'react'
import { Text, Button, Reply } from '@botonic/react'

export default class extends React.Component {
  render() {
    return (
      <>
        <Text>
          📞 **Contact FixerHub Support**

          We're here to help! Get in touch with our support team for assistance, questions, or feedback.

          **🆘 Support Options:**

          **📧 Email Support**
          • General inquiries: support@fixerhub.com
          • Technical issues: tech@fixerhub.com
          • Billing questions: billing@fixerhub.com
          • Partnership inquiries: partners@fixerhub.com

          **📱 Phone Support**
          • Customer Service: +1 (555) 123-FIXER
          • Emergency Support: +1 (555) 911-HELP
          • Hours: Monday-Friday 8AM-8PM EST
          • Weekend: Saturday-Sunday 10AM-6PM EST

          **💬 Live Chat**
          • Available 24/7 through our website
          • Average response time: Under 2 minutes
          • Instant help for booking and technical issues

          **🏢 Office Address:**
          FixerHub Technologies Inc.
          123 Service Street, Suite 100
          Home City, HC 12345
          United States

          **🔧 Common Support Topics:**
          • Account setup and login issues
          • Booking problems or cancellations
          • Payment and billing questions
          • Provider disputes or quality concerns
          • Technical troubleshooting
          • Feature requests and feedback

          **📱 Social Media:**
          • Twitter: @FixerHubSupport
          • Facebook: facebook.com/fixerhub
          • Instagram: @fixerhub_official

          **💡 Before Contacting Support:**
          • Check our FAQ section
          • Try logging out and back in
          • Clear your browser cache
          • Note any error messages you're seeing

          **🚨 Emergency Services:**
          For urgent home emergencies (water leaks, electrical hazards, etc.), use our emergency booking feature or call our emergency line for immediate assistance.

          How would you like to get in touch with us?
        </Text>
        
        <Reply>
          <Button url="mailto:support@fixerhub.com">📧 Email Support</Button>
          <Button url="tel:+15551234359">📞 Call Us</Button>
          <Button url="http://localhost:5173/support">💬 Live Chat</Button>
          <Button onClick="Help">❓ Back to Help</Button>
        </Reply>
      </>
    )
  }
}
