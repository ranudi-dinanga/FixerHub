import React from 'react'
import { Text, Button, Reply, Carousel, Element } from '@botonic/react'

export default class extends React.Component {
  render() {
    return (
      <>
        <Text>
          ⭐ **Reviews & Ratings on FixerHub**

          Your feedback helps build a trusted community! Here's everything about our review system:

          **📝 How Reviews Work:**

          **After Service Completion:**
          • Automatic review prompt via SMS/email
          • Rate your experience (1-5 stars)
          • Write detailed feedback about the service
          • Upload photos of completed work (optional)
          • Rate different aspects: punctuality, quality, professionalism

          **🌟 Rating Categories:**
          • **Overall Experience** - General satisfaction (1-5 stars)
          • **Service Quality** - Work completed to standards
          • **Timeliness** - Arrived on time and finished as expected
          • **Communication** - Clear, professional interaction
          • **Value for Money** - Fair pricing for service received
          • **Cleanliness** - Left workspace clean and tidy

          **💬 Review Guidelines:**
          • Be honest and constructive
          • Focus on specific aspects of service
          • Include details that help other customers
          • Upload before/after photos when relevant
          • Mention if you'd hire them again

          **🏆 Review Benefits:**
          • **For Customers**: Help others make informed decisions
          • **For Providers**: Build reputation and attract more clients
          • **Verified Reviews**: Only actual customers can review
          • **Response System**: Providers can respond to reviews

          **📊 Review Display:**
          • Average rating prominently shown
          • Recent reviews highlighted
          • Filter reviews by service type
          • Sort by most recent or highest rated
          • Verified purchase badges

          **🛡️ Review Integrity:**
          • Anti-fraud detection system
          • Verified service completion required
          • Report inappropriate reviews
          • Moderation for quality control
          • No fake review tolerance policy

          **💰 Review Incentives:**
          • Loyalty points for detailed reviews
          • Early access to new providers
          • Exclusive discounts for active reviewers
          • Featured customer status

          Ready to leave a review or want to see what others are saying?
        </Text>
        
        <Carousel>
          <Element>
            <Text>📝 **Leave a Review**</Text>
            <Button url="http://localhost:5173/reviews/new">Write Review</Button>
          </Element>
          <Element>
            <Text>⭐ **View Reviews**</Text>
            <Button url="http://localhost:5173/reviews">Browse Reviews</Button>
          </Element>
          <Element>
            <Text>🏆 **My Reviews**</Text>
            <Button url="http://localhost:5173/profile/reviews">My Reviews</Button>
          </Element>
          <Element>
            <Text>📊 **Review Stats**</Text>
            <Button onClick="Features">Review Analytics</Button>
          </Element>
        </Carousel>

        <Reply>
          <Button url="http://localhost:5173/reviews/write">✍️ Write Review</Button>
          <Button url="http://localhost:5173/bookings">📋 Recent Services</Button>
          <Button onClick="Billing">💳 Billing Info</Button>
          <Button onClick="Help">❓ More Help</Button>
        </Reply>
      </>
    )
  }
}
