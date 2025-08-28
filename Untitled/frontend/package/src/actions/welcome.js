import React from 'react'
import { Text, Carousel, Element, Button } from '@botonic/react'

export default class extends React.Component {
  render() {
    return (
      <>
        <Text>
          🎉 Welcome to FixerHub! 

          I'm your virtual assistant, ready to help you navigate our smart home services platform.

          ✨ **What is FixerHub?**
          FixerHub is your one-stop solution for finding, booking, and managing home service professionals. Whether you need a plumber, electrician, cleaner, or any other home service, we've got you covered!

          🔧 **What I can help you with:**
          • Find trusted service providers near you
          • Book appointments and manage tasks
          • Learn about our services and pricing
          • Track your expenses and manage billing
          • Leave reviews and ratings for providers
          • Understand how FixerHub works
          • Get support and contact information

          **Just type what you need help with, or try these commands:**
          • "Find a plumber"
          • "How does it work?"
          • "What are your prices?"
          • "Book a service"
          • "Help" - to see all available commands

          Ready to get started? What would you like to know about FixerHub? 🏠
        </Text>
        
        <Carousel>
          <Element>
            <Text>🔍 **Find Services**</Text>
            <Button onClick="Find services">Find Providers</Button>
          </Element>
          <Element>
            <Text>📅 **Book Services**</Text>
            <Button onClick="Book service">Book Now</Button>
          </Element>
          <Element>
            <Text>💰 **Pricing Info**</Text>
            <Button onClick="Pricing">View Pricing</Button>
          </Element>
          <Element>
            <Text>❓ **How It Works**</Text>
            <Button onClick="How it works">Learn More</Button>
          </Element>
        </Carousel>
      </>
    )
  }
}
