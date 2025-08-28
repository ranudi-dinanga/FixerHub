import React from 'react'
import { Text, Button, Reply } from '@botonic/react'

export default class extends React.Component {
  render() {
    return (
      <>
        <Text>
          🔧 **How FixerHub Works**

          Welcome to the future of home services! Here's how our smart platform makes your life easier:

          **🎯 Our Mission:**
          FixerHub eliminates the stress of finding reliable home service professionals. No more hunting through phone books or wondering if someone is trustworthy!

          **📱 The FixerHub Process:**

          **1. 🔍 Smart Search**
          • Enter your location and service needed
          • Our algorithm matches you with nearby verified professionals
          • Filter by ratings, price, availability, and specializations

          **2. 📊 Compare & Choose**
          • View detailed provider profiles with real customer reviews
          • See transparent pricing and availability calendars
          • Check verification badges and certifications

          **3. 📅 Easy Booking**
          • Book instantly or schedule for later
          • Set up one-time or recurring appointments
          • Add special instructions and requirements

          **4. 🔔 Stay Updated**
          • Get SMS, email, or push notifications
          • Track your service provider's arrival
          • Receive appointment reminders

          **5. 💰 Smart Expense Management**
          • All transactions automatically logged
          • Visual charts show spending patterns
          • Export reports for budgeting or taxes

          **🛡️ Safety & Quality Guarantee:**
          • All providers undergo background checks
          • Insurance verification required
          • Skill assessments and certifications validated
          • Customer review system ensures quality

          **👥 Family & Household Collaboration:**
          • Share account access with family members
          • Everyone can book and manage services
          • Centralized household task management

          Ready to experience the FixerHub difference?
        </Text>
        
        <Reply>
          <Button url="http://localhost:5173/register">🚀 Get Started</Button>
          <Button onClick="Find services">🔍 Find Services</Button>
          <Button onClick="Features">✨ See Features</Button>
          <Button onClick="Help">❓ More Info</Button>
        </Reply>
      </>
    )
  }
}
