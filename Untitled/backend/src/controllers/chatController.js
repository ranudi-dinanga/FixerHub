const axios = require('axios');
const User = require('../models/User');
const Booking = require('../models/Booking');

// Store conversation context in memory (in production, use Redis or database)
const conversationContexts = new Map();

// Enhanced AI response generator with backend integration
const generateIntelligentResponse = async (message, userId, context) => {
  const lowerMessage = message.toLowerCase();
  
  try {
    // Get user data for personalization
    let user = null;
    if (userId) {
      user = await User.findById(userId);
    }

    // Greeting patterns with personalization
    if (lowerMessage.match(/\b(hi|hello|hey|good morning|good afternoon|good evening)\b/)) {
      const greetings = [
        `Hello${user?.name ? ` ${user.name}` : ''}! It's great to meet you. How can I make your day easier with FixerHub?`,
        `Hi${user?.name ? ` ${user.name}` : ''}! I'm so glad you're here. What kind of home service are you looking for today?`,
        `Hey${user?.name ? ` ${user.name}` : ''}! Welcome to FixerHub. I'm excited to help you find the perfect service provider. What do you need?`,
        `Good to see you${user?.name ? ` ${user.name}` : ''}! I'm here to help make finding home services as easy as possible. What's on your mind?`
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // Service finding patterns with real data
    if (lowerMessage.match(/\b(find|search|need|want|looking for)\b.*(plumber|plumbing|leak|pipe|water|drain)\b/)) {
      return await getServiceResponseWithData('plumbing', context, user);
    }

    if (lowerMessage.match(/\b(find|search|need|want|looking for)\b.*(electrician|electrical|wiring|power|outlet|lights)\b/)) {
      return await getServiceResponseWithData('electrical', context, user);
    }

    if (lowerMessage.match(/\b(find|search|need|want|looking for)\b.*(clean|cleaner|cleaning|maid|housekeeping)\b/)) {
      return await getServiceResponseWithData('cleaning', context, user);
    }

    // Emergency patterns
    if (lowerMessage.match(/\b(emergency|urgent|asap|immediately|now|broken|not working)\b/)) {
      return "Oh no! That sounds urgent! 🚨 I understand you need immediate help. Let me connect you with emergency service providers in your area right away. What type of emergency service do you need? (plumbing, electrical, etc.) I'll prioritize finding available professionals who can help you ASAP.";
    }

    // Booking patterns with user booking history
    if (lowerMessage.match(/\b(book|schedule|appointment|hire|reserve|arrange)\b/)) {
      let bookingResponse = "Absolutely! I'd love to help you book a service. 📅";
      
      if (user) {
        const recentBookings = await Booking.find({ userId: userId }).sort({ createdAt: -1 }).limit(3);
        if (recentBookings.length > 0) {
          bookingResponse += ` I see you've used our services before - that's wonderful!`;
        }
      }

      bookingResponse += "\n\nTo get you connected with the right professional quickly, could you tell me:\n\n1. What type of service do you need?\n2. When would you prefer the appointment?\n3. Is this urgent or can it wait a few days?\n\nOnce I have these details, I can show you available providers and help you schedule right away!";
      
      return bookingResponse;
    }

    // Check booking status
    if (lowerMessage.match(/\b(my booking|booking status|appointment status|when is my|scheduled)\b/)) {
      if (!user) {
        return "I'd love to help you check your booking status! Please log in to your account so I can access your booking information.";
      }

      const recentBookings = await Booking.find({ userId: userId }).sort({ createdAt: -1 }).limit(5);
      
      if (recentBookings.length === 0) {
        return "I don't see any recent bookings in your account. Would you like me to help you schedule a new service?";
      }

      let response = "Here are your recent bookings:\n\n";
      recentBookings.forEach((booking, index) => {
        response += `${index + 1}. **${booking.serviceType}** - ${booking.status}\n`;
        response += `   Scheduled: ${new Date(booking.scheduledDate).toLocaleDateString()}\n`;
        if (booking.providerName) {
          response += `   Provider: ${booking.providerName}\n`;
        }
        response += "\n";
      });

      response += "Need help with any of these bookings? Just let me know!";
      return response;
    }

    // Pricing patterns
    if (lowerMessage.match(/\b(price|cost|rate|fee|how much|pricing|expensive|cheap|budget|afford)\b/)) {
      return "Great question about pricing! 💰 I want to make sure you get the best value. Our pricing varies by service type and provider, but here's what I can tell you:\n\n• Most services have transparent hourly rates\n• You can see exact pricing before booking\n• We offer competitive rates with verified professionals\n• Many providers offer free estimates for larger jobs\n\nWhat specific service are you interested in? I can give you more detailed pricing information!";
    }

    // How it works patterns
    if (lowerMessage.match(/\b(how.*work|process|step|getting started|how to use)\b/)) {
      return "I'm happy to walk you through how FixerHub works! It's really simple:\n\n🔍 **Step 1**: Tell me what service you need\n📍 **Step 2**: I'll show you verified providers in your area\n⭐ **Step 3**: Compare ratings, prices, and availability\n📅 **Step 4**: Book your preferred provider\n✅ **Step 5**: Get the job done and leave a review\n\nThe whole process is designed to be super easy and secure. Would you like to start with finding a service now?";
    }

    // Contact/support patterns
    if (lowerMessage.match(/\b(contact|support|customer service|phone|email|help me|problem|issue)\b/)) {
      return "I'm here to help you right now! 😊 But if you need additional support, here are your options:\n\n📞 **Phone**: Our support team is available 24/7\n📧 **Email**: support@fixerhub.com\n💬 **Live Chat**: That's me! I'm always here\n\nWhat specific issue can I help you resolve? I'll do my best to get it sorted out for you immediately.";
    }

    // Review patterns
    if (lowerMessage.match(/\b(review|rating|rate|feedback|testimonial|experience)\b/)) {
      let reviewResponse = "Reviews are so important for our community! ⭐ They help other customers make great choices and help our service providers improve.\n\nI can help you:\n• Leave a review for a recent service\n• Find highly-rated providers\n• Understand our rating system\n\n";

      if (user) {
        const completedBookings = await Booking.find({ 
          userId: userId, 
          status: 'completed' 
        }).sort({ createdAt: -1 }).limit(3);

        if (completedBookings.length > 0) {
          reviewResponse += "I see you have some recent completed services. Would you like to leave reviews for any of these?\n\n";
          completedBookings.forEach((booking, index) => {
            reviewResponse += `• ${booking.serviceType} - ${new Date(booking.completedDate || booking.scheduledDate).toLocaleDateString()}\n`;
          });
        }
      }

      reviewResponse += "\nWhat would you like to do regarding reviews?";
      return reviewResponse;
    }

    // Billing patterns
    if (lowerMessage.match(/\b(billing|payment|invoice|receipt|charge|transaction|pay|paid|bill)\b/)) {
      return "I can definitely help with billing questions! 💳 FixerHub makes payments simple and secure:\n\n• All payments are processed securely\n• You'll receive email receipts automatically\n• You can view your payment history anytime\n• We support all major payment methods\n\nAre you looking to make a payment, view past transactions, or do you have a billing question I can help with?";
    }

    // Fallback with personality
    const fallbackResponses = [
      "I want to make sure I understand exactly what you need. Could you tell me a bit more about what you're looking for? I'm here to help in any way I can!",
      "That's interesting! I'm not quite sure I caught what you need help with. Could you rephrase that? I'm really eager to assist you with FixerHub services.",
      "I'm listening and want to help you find exactly what you need. Could you give me a bit more detail about your request?",
      "Let me make sure I can give you the best possible help. What specific service or information are you looking for today?"
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I apologize, but I'm having trouble processing your request right now. Could you please try again or contact our support team for assistance?";
  }
};

const getServiceResponseWithData = async (serviceType, context, user) => {
  try {
    // In a real implementation, you'd query your service providers database
    // For now, I'll simulate with static data

    const serviceResponses = {
      plumbing: {
        message: "Perfect! I can help you find reliable plumbers in your area. 🔧\n\nOur verified plumbing professionals can help with:\n• Leak repairs and pipe fixes\n• Drain cleaning and unclogging\n• Faucet and fixture installations\n• Emergency plumbing services\n• Water heater repairs\n\nWould you like me to show you available plumbers near you? I can filter by ratings, pricing, or availability - whatever matters most to you!",
        providers: [
          { name: "Mike's Plumbing", rating: 4.8, rate: "$75/hr", available: "Today" },
          { name: "ProFlow Services", rating: 4.9, rate: "$85/hr", available: "Tomorrow" },
          { name: "QuickFix Plumbing", rating: 4.7, rate: "$70/hr", available: "This afternoon" }
        ]
      },
      electrical: {
        message: "Excellent! I'll help you find qualified electricians nearby. ⚡\n\nOur certified electrical professionals handle:\n• Wiring and rewiring projects\n• Outlet and switch installations\n• Lighting fixture setups\n• Circuit breaker repairs\n• Electrical troubleshooting\n\nSafety is our top priority - all electricians are licensed and insured. Ready to see who's available in your area?",
        providers: [
          { name: "Spark Electric", rating: 4.9, rate: "$90/hr", available: "Today" },
          { name: "PowerPro Solutions", rating: 4.8, rate: "$95/hr", available: "Tomorrow" },
          { name: "Voltage Masters", rating: 4.7, rate: "$85/hr", available: "This evening" }
        ]
      },
      cleaning: {
        message: "Wonderful! I can connect you with trusted cleaning professionals. 🧹\n\nOur cleaning services include:\n• Regular house cleaning\n• Deep cleaning services\n• Move-in/move-out cleaning\n• Post-construction cleanup\n• Specialized cleaning needs\n\nWould you prefer a one-time service or regular cleaning? I can show you highly-rated cleaners with availability that works for your schedule!",
        providers: [
          { name: "Sparkle Clean Co", rating: 4.9, rate: "$25/hr", available: "Today" },
          { name: "Fresh Start Cleaning", rating: 4.8, rate: "$30/hr", available: "Tomorrow" },
          { name: "Pristine Home Services", rating: 4.7, rate: "$28/hr", available: "This weekend" }
        ]
      }
    };

    const serviceData = serviceResponses[serviceType];
    if (!serviceData) {
      return "I'd be happy to help you find service providers! Could you tell me more specifically what type of service you need?";
    }

    let response = serviceData.message;
    
    // Add provider information
    if (serviceData.providers && serviceData.providers.length > 0) {
      response += "\n\n**Top providers near you:**\n";
      serviceData.providers.forEach((provider, index) => {
        response += `\n${index + 1}. **${provider.name}** ⭐ ${provider.rating}\n`;
        response += `   Rate: ${provider.rate} | Available: ${provider.available}`;
      });
      
      response += "\n\nWould you like me to help you book with any of these providers?";
    }

    return response;

  } catch (error) {
    console.error('Error getting service response:', error);
    return "I'm having trouble accessing our provider database right now, but I'd still love to help! Could you tell me more about what you need?";
  }
};

// Main chat endpoint
const handleChatMessage = async (req, res) => {
  try {
    const { message, userId, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create conversation context
    const contextKey = sessionId || `user_${userId || 'anonymous'}`;
    let context = conversationContexts.get(contextKey) || {
      messages: [],
      userPreferences: {},
      lastActivity: new Date()
    };

    // Add user message to context
    context.messages.push({
      sender: 'user',
      text: message,
      timestamp: new Date()
    });

    // Generate AI response
    const aiResponse = await generateIntelligentResponse(message, userId, context);

    // Add AI response to context
    context.messages.push({
      sender: 'bot',
      text: aiResponse,
      timestamp: new Date()
    });

    // Update context
    context.lastActivity = new Date();
    conversationContexts.set(contextKey, context);

    // Clean up old conversations (older than 24 hours)
    cleanupOldContexts();

    res.json({
      response: aiResponse,
      sessionId: contextKey,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Error handling chat message:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      response: "I apologize, but I'm having trouble processing your request right now. Could you please try again?"
    });
  }
};

// Get conversation history
const getConversationHistory = async (req, res) => {
  try {
    const { sessionId, userId } = req.query;
    const contextKey = sessionId || `user_${userId || 'anonymous'}`;
    
    const context = conversationContexts.get(contextKey);
    
    if (!context) {
      return res.json({ messages: [] });
    }

    res.json({
      messages: context.messages,
      lastActivity: context.lastActivity
    });

  } catch (error) {
    console.error('Error getting conversation history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Clear conversation
const clearConversation = async (req, res) => {
  try {
    const { sessionId, userId } = req.body;
    const contextKey = sessionId || `user_${userId || 'anonymous'}`;
    
    conversationContexts.delete(contextKey);
    
    res.json({ message: 'Conversation cleared successfully' });

  } catch (error) {
    console.error('Error clearing conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Cleanup function for old contexts
const cleanupOldContexts = () => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  for (const [key, context] of conversationContexts.entries()) {
    if (context.lastActivity < twentyFourHoursAgo) {
      conversationContexts.delete(key);
    }
  }
};

// Run cleanup periodically
setInterval(cleanupOldContexts, 60 * 60 * 1000); // Every hour

module.exports = {
  handleChatMessage,
  getConversationHistory,
  clearConversation
};
