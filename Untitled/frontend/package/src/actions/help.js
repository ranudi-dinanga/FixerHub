import React from 'react'
import { Text, Button, Reply } from '@botonic/react'

export default class extends React.Component {
  render() {
    return (
      <>
        <Text>
          🤖 **FixerHub Assistant - Help Menu**

          Here's what I can help you with:

          **🔍 Finding Services:**
          • "Find a plumber" - Search for plumbing services
          • "Need an electrician" - Find electrical services
          • "Looking for cleaners" - Find cleaning services
          • "Home repair services" - General repair services

          **📅 Booking & Scheduling:**
          • "Book a service" - How to book appointments
          • "Schedule cleaning" - Set up recurring services
          • "Cancel appointment" - Cancellation process

          **💰 Pricing & Costs:**
          • "How much does it cost?" - Pricing information
          • "Service rates" - Rate structures
          • "Budget tracking" - Expense management features

          **🏠 Platform Features:**
          • "How does FixerHub work?" - Platform overview
          • "What features do you have?" - Feature list
          • "Safety and verification" - Security information

          **⭐ Reviews & Ratings:**
          • "Leave a review" - Rate your service experience
          • "Write review" - Share feedback about providers
          • "View reviews" - See what others are saying
          • "Rating system" - How reviews work

          **💳 Billing & Payments:**
          • "Billing info" - Payment methods and invoices
          • "Payment history" - View past transactions
          • "Billing support" - Help with payment issues
          • "Refund" - Process refunds and disputes

          **📞 Support:**
          • "Contact support" - Get help from our team
          • "Technical issues" - Troubleshooting help

          **Quick Commands:**
          Just type any of these phrases, and I'll provide detailed information!

          What would you like to know more about? 😊
        </Text>
        
        <Reply>
          <Button onClick="Find services">🔍 Find Services</Button>
          <Button onClick="Book service">📅 Book Service</Button>
          <Button onClick="Review">⭐ Reviews</Button>
          <Button onClick="Billing">💳 Billing</Button>
          <Button onClick="Pricing">💰 Pricing</Button>
          <Button onClick="Contact">📞 Contact</Button>
        </Reply>
      </>
    )
  }
}
