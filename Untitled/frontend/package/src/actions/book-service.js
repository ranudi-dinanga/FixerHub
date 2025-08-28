import React from 'react'
import { Text, Button, Reply } from '@botonic/react'

export default class extends React.Component {
  render() {
    return (
      <>
        <Text>
          📅 **Booking Services on FixerHub**

          Perfect! Let me walk you through our easy booking process.

          **🚀 How to Book in 4 Simple Steps:**

          **Step 1: Find Your Provider** 🔍
          • Browse by service category or location
          • Compare ratings, reviews, and prices
          • Select your preferred provider

          **Step 2: Choose Date & Time** 📅
          • View real-time availability
          • Pick a convenient time slot
          • Set up one-time or recurring appointments

          **Step 3: Provide Details** 📝
          • Describe your service needs
          • Add any special requirements
          • Confirm your contact information

          **Step 4: Confirm & Pay** 💳
          • Review booking details
          • Secure payment processing
          • Get instant confirmation

          **🔔 After Booking:**
          • Receive SMS/email reminders
          • Track your appointment status
          • Direct communication with provider
          • Rate and review after completion

          **📱 Booking Options:**
          • **One-time Services** - Perfect for repairs or installations
          • **Recurring Services** - Great for cleaning, maintenance
          • **Emergency Services** - Priority booking for urgent needs

          **💡 Pro Tips:**
          • Book in advance for better availability
          • Provide clear descriptions for accurate quotes
          • Set up notifications so you never miss appointments

          Need to make a booking right now?
        </Text>
        
        <Reply>
          <Button url="http://localhost:5173/services">📅 Book Now</Button>
          <Button url="http://localhost:5173/bookings">📋 My Bookings</Button>
          <Button onClick="Pricing">💰 Pricing Info</Button>
          <Button onClick="Help">❓ More Help</Button>
        </Reply>
      </>
    )
  }
}
