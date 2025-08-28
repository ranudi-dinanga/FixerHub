import React from 'react'
import { Text, Button, Reply } from '@botonic/react'

export default class extends React.Component {
  render() {
    return (
      <>
        <Text>
          💰 **FixerHub Pricing Information**

          Let me break down how pricing works on our platform:

          **🏷️ How Pricing Works:**

          **For Customers (Service Seekers):**
          • 🆓 **Platform Usage** - Completely FREE!
          • 🔍 **Finding Providers** - FREE browsing and comparison
          • 📅 **Booking Services** - No booking fees
          • 💳 **Payment** - Pay providers directly, no hidden charges

          **📊 Service Provider Rates (Examples):**
          • 🔧 **Plumbers**: $50-120/hour (varies by complexity)
          • ⚡ **Electricians**: $60-150/hour (depends on job type)
          • 🧹 **Cleaners**: $25-45/hour (house size dependent)
          • 🏠 **General Repairs**: $40-80/hour (skill level based)
          • 🌿 **Gardening**: $30-60/hour (service type dependent)

          **💡 Pricing Factors:**
          • Service complexity and skill required
          • Time of day (emergency rates may apply)
          • Provider experience and ratings
          • Materials and equipment needed
          • Travel distance and accessibility

          **💰 Expense Tracking Features:**
          • 📊 **Smart Charts** - Visual spending breakdown
          • 📈 **Monthly/Yearly Reports** - Track your home maintenance budget
          • 🏷️ **Category Sorting** - See where your money goes
          • 💾 **Digital Records** - Keep all receipts organized
          • 📱 **Export Options** - Download for tax purposes

          **🎯 Money-Saving Tips:**
          • Book recurring services for discounts
          • Compare multiple providers
          • Bundle multiple tasks with one provider
          • Schedule during off-peak hours
          • Regular maintenance prevents costly repairs

          **🔒 Payment Security:**
          All payments are processed through secure, encrypted channels with buyer protection.
        </Text>
        
        <Reply>
          <Button url="http://localhost:5173/services">💰 View Live Rates</Button>
          <Button onClick="Book service">📅 Book Service</Button>
          <Button onClick="Features">📊 Expense Tracking</Button>
          <Button onClick="Help">❓ More Questions</Button>
        </Reply>
      </>
    )
  }
}
