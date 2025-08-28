import React from 'react'
import { Text, Button, Reply } from '@botonic/react'

export default class extends React.Component {
  render() {
    return (
      <>
        <Text>
          🔍 **Finding Service Providers on FixerHub**

          Great! Let me help you find the perfect service provider for your needs.

          **📍 How to Find Providers:**

          1. **Search by Location** - We show providers in your area
          2. **Filter by Service Type** - Choose from categories like:
             • 🔧 Plumbing (leaks, installations, repairs)
             • ⚡ Electrical (wiring, installations, troubleshooting)
             • 🧹 Cleaning (regular, deep cleaning, move-in/out)
             • 🏠 Home Repairs (painting, carpentry, general fixes)
             • 🌿 Gardening & Landscaping
             • 🔒 Security Systems
             • And many more!

          3. **View Provider Profiles** - See ratings, reviews, and pricing
          4. **Compare Options** - Check availability and rates

          **✅ What You'll See for Each Provider:**
          • ⭐ Customer ratings and reviews
          • 💰 Hourly rates and pricing
          • 📅 Available time slots
          • 🛡️ Verification status (all providers are verified!)
          • 📱 Contact information
          • 🏆 Specializations and experience

          **🔒 Safety First:**
          All our service providers go through a thorough verification process including background checks and skill assessments.

          Ready to find a provider? Visit our Services page or tell me what specific service you need!
        </Text>
        
        <Reply>
          <Button url="http://localhost:5173/services">🔍 Browse All Services</Button>
          <Button onClick="Book service">📅 How to Book</Button>
          <Button onClick="Pricing">💰 View Pricing</Button>
          <Button onClick="Help">❓ More Help</Button>
        </Reply>
      </>
    )
  }
}
