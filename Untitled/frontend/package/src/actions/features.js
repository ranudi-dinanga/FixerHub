import React from 'react'
import { Text, Button, Reply } from '@botonic/react'

export default class extends React.Component {
  render() {
    return (
      <>
        <Text>
          ✨ **FixerHub Features & Capabilities**

          Discover what makes FixerHub the smartest choice for home services:

          **🔍 Smart Service Discovery:**
          • 📍 Location-based provider matching
          • 🏷️ Service category filtering
          • ⭐ Rating and review system
          • 💰 Price comparison tools
          • 📅 Real-time availability checking

          **📅 Intelligent Booking System:**
          • 🕐 Instant or scheduled bookings
          • 🔄 Recurring service setup
          • ⚡ Emergency/priority booking
          • 📱 Multi-device booking access
          • ✏️ Custom service descriptions

          **🔔 Smart Notifications:**
          • 📧 Email reminders
          • 📱 SMS notifications
          • 🔔 Push notifications
          • ⏰ Customizable reminder timing
          • 📲 Real-time service updates

          **💰 Expense Management:**
          • 📊 **Visual Analytics** - Beautiful charts and graphs
          • 📈 **Spending Trends** - Monthly/yearly breakdowns
          • 🏷️ **Category Tracking** - Know where money goes
          • 💾 **Digital Receipts** - Paperless record keeping
          • 📱 **Export Options** - PDF, CSV for accounting
          • 🎯 **Budget Alerts** - Stay within spending limits

          **👥 Family Collaboration:**
          • 👨‍👩‍👧‍👦 Multi-user account access
          • 🔄 Shared booking management
          • 📋 Centralized task coordination
          • 💬 Internal family notes
          • 🔐 Privacy controls

          **🛡️ Security & Trust:**
          • ✅ Provider background checks
          • 🏆 Skill verification system
          • 🔒 Secure payment processing
          • 🛡️ Insurance verification
          • 📜 Service guarantees

          **📱 User Experience:**
          • 🎨 Clean, intuitive interface
          • 📱 Mobile-responsive design
          • 🚀 Fast loading times
          • 🔍 Powerful search functionality
          • 💬 In-app messaging with providers

          Want to see any of these features in action?
        </Text>
        
        <Reply>
          <Button url="http://localhost:5173/register">🚀 Try Features</Button>
          <Button onClick="Book service">📅 Booking Demo</Button>
          <Button onClick="Pricing">💰 Expense Tracking</Button>
          <Button onClick="Contact">📞 Learn More</Button>
        </Reply>
      </>
    )
  }
}
