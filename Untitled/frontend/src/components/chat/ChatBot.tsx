import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send, X, Minimize2 } from 'lucide-react';
import axios from 'axios';
import { detectIntent } from '@/services/intenthandler';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatBotProps {
  userId?: string;
  userInfo?: {
    name?: string;
    email?: string;
  };
}

const ChatBot: React.FC<ChatBotProps> = ({ userId, userInfo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatContext, setChatContext] = useState<any>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_BASE_URL = 'http://localhost:5001/api';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: `Hello${userInfo?.name ? ` ${userInfo.name}` : ''}! 👋 I'm your FixerHub assistant. I'm here to help you find service providers, book appointments, check pricing, and answer any questions you might have. What can I help you with today?`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, userInfo?.name]);

  const simulateTyping = (duration: number = 1500) => {
    setIsTyping(true);
    return new Promise(resolve => setTimeout(() => {
      setIsTyping(false);
      resolve(true);
    }, duration));
  };

  const getHumanLikeResponse = async (userMessage: string, context: any) => {
    try {
      // Simulate typing delay
      await simulateTyping();

      // Call backend API for AI response
      const response = await axios.post(`${API_BASE_URL}/chat/message`, {
        message: userMessage,
        userId: userId,
        sessionId: context.sessionId
      });
      
      return response.data.response;
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Fallback to local response generation
      return await generateIntelligentResponse(userMessage, context);
    }
  };

  // Updated generateIntelligentResponse with compromise-based intent detection
  const generateIntelligentResponse = async (message: string, context: any): Promise<string> => {
    const intent = detectIntent(message);
    
    switch (intent) {
      case 'greet':
        const greetings = [
          "Hello there! It's great to meet you. How can I make your day easier with FixerHub?",
          "Hi! I'm so glad you're here. What kind of home service are you looking for today?",
          "Hey! Welcome to FixerHub. I'm excited to help you find the perfect service provider. What do you need?",
          "Good to see you! I'm here to help make finding home services as easy as possible. What's on your mind?"
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
        
      case 'find_plumbing':
        return await getServiceResponse('plumbing', context);
        
      case 'find_electrical':
        return await getServiceResponse('electrical', context);
        
      case 'find_cleaning':
        return await getServiceResponse('cleaning', context);
        
      case 'emergency':
        return "Oh no! That sounds urgent! 🚨 I understand you need immediate help. Let me connect you with emergency service providers in your area right away. What type of emergency service do you need? (plumbing, electrical, etc.) I'll prioritize finding available professionals who can help you ASAP.";
        
      case 'book_service':
        return "Absolutely! I'd love to help you book a service. 📅 To get you connected with the right professional quickly, could you tell me:\n\n1. What type of service do you need?\n2. When would you prefer the appointment?\n3. Is this urgent or can it wait a few days?\n\nOnce I have these details, I can show you available providers and help you schedule right away!";
        
      case 'pricing':
        return "Great question about pricing! 💰 I want to make sure you get the best value. Our pricing varies by service type and provider, but here's what I can tell you:\n\n• Most services have transparent hourly rates\n• You can see exact pricing before booking\n• We offer competitive rates with verified professionals\n• Many providers offer free estimates for larger jobs\n\nWhat specific service are you interested in? I can give you more detailed pricing information!";
        
      case 'how_it_works':
        return "I'm happy to walk you through how FixerHub works! It's really simple:\n\n🔍 **Step 1**: Tell me what service you need\n📍 **Step 2**: I'll show you verified providers in your area\n⭐ **Step 3**: Compare ratings, prices, and availability\n📅 **Step 4**: Book your preferred provider\n✅ **Step 5**: Get the job done and leave a review\n\nThe whole process is designed to be super easy and secure. Would you like to start with finding a service now?";
        
      case 'contact_support':
        return "I'm here to help you right now! 😊 But if you need additional support, here are your options:\n\n📞 **Phone**: Our support team is available 24/7\n📧 **Email**: support@fixerhub.com\n💬 **Live Chat**: That's me! I'm always here\n\nWhat specific issue can I help you resolve? I'll do my best to get it sorted out for you immediately.";
        
      case 'review':
        return "Reviews are so important for our community! ⭐ They help other customers make great choices and help our service providers improve.\n\nI can help you:\n• Leave a review for a recent service\n• Find highly-rated providers\n• Understand our rating system\n\nDid you recently use a service that you'd like to review? Or are you looking for highly-rated providers for a new job?";
        
      case 'billing':
        return "I can definitely help with billing questions! 💳 FixerHub makes payments simple and secure:\n\n• All payments are processed securely\n• You'll receive email receipts automatically\n• You can view your payment history anytime\n• We support all major payment methods\n\nAre you looking to make a payment, view past transactions, or do you have a billing question I can help with?";
        
      default:
        const fallbackResponses = [
          "I want to make sure I understand exactly what you need. Could you tell me a bit more about what you're looking for? I'm here to help in any way I can!",
          "That's interesting! I'm not quite sure I caught what you need help with. Could you rephrase that? I'm really eager to assist you with FixerHub services.",
          "I'm listening and want to help you find exactly what you need. Could you give me a bit more detail about your request?",
          "Let me make sure I can give you the best possible help. What specific service or information are you looking for today?"
        ];
        return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
  };

  const getServiceResponse = async (serviceType: string, context: any): Promise<string> => {
    try {
      // You could make an API call here to get real providers
      const serviceResponses = {
        plumbing: "Perfect! I can help you find reliable plumbers in your area. 🔧\n\nOur verified plumbing professionals can help with:\n• Leak repairs and pipe fixes\n• Drain cleaning and unclogging\n• Faucet and fixture installations\n• Emergency plumbing services\n• Water heater repairs\n\nWould you like me to show you available plumbers near you? I can filter by ratings, pricing, or availability - whatever matters most to you!",
        electrical: "Excellent! I'll help you find qualified electricians nearby. ⚡\n\nOur certified electrical professionals handle:\n• Wiring and rewiring projects\n• Outlet and switch installations\n• Lighting fixture setups\n• Circuit breaker repairs\n• Electrical troubleshooting\n\nSafety is our top priority - all electricians are licensed and insured. Ready to see who's available in your area?",
        cleaning: "Wonderful! I can connect you with trusted cleaning professionals. 🧹\n\nOur cleaning services include:\n• Regular house cleaning\n• Deep cleaning services\n• Move-in/move-out cleaning\n• Post-construction cleanup\n• Specialized cleaning needs\n\nWould you prefer a one-time service or regular cleaning? I can show you highly-rated cleaners with availability that works for your schedule!"
      };
      
      return serviceResponses[serviceType] || "I'd be happy to help you find service providers! Could you tell me more specifically what type of service you need?";
    } catch (error) {
      return "I'm having trouble accessing our provider database right now, but I'd still love to help! Could you tell me more about what you need?";
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Update context with user message
    const updatedContext = {
      ...chatContext,
      lastUserMessage: inputValue,
      userId,
      userInfo,
      conversationHistory: messages,
    };
    setChatContext(updatedContext);

    // Get bot response
    const botResponseText = await getHumanLikeResponse(inputValue, updatedContext);
    
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: botResponseText,
      sender: 'bot',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, botMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-blue-600 hover:bg-blue-700"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className={`fixed bottom-4 right-4 z-50 w-96 shadow-2xl transition-all duration-300 ${
          isMinimized ? 'h-16' : 'h-[500px]'
        }`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/api/placeholder/32/32" />
                <AvatarFallback className="bg-blue-500 text-white">FH</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sm">FixerHub Assistant</h3>
                <p className="text-xs text-blue-100">Always here to help</p>
              </div>
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-blue-700"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-blue-700"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="p-0 flex flex-col h-[calc(500px-4rem)]">
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    size="icon"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </>
  );
};

export default ChatBot;  