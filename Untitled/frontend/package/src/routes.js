import Welcome from './actions/welcome'
import Help from './actions/help'
import FindServices from './actions/find-services'
import BookService from './actions/book-service'
import Pricing from './actions/pricing'
import HowItWorks from './actions/how-it-works'
import Contact from './actions/contact'
import Features from './actions/features'
import Review from './actions/review'
import Billing from './actions/billing'

export const routes = [
  // Welcome and basic commands
  { path: 'welcome', text: /^(hi|hello|hey|start|welcome|greetings)/i, action: Welcome },
  { path: 'help', text: /^(help|what can you do|commands|menu|options)/i, action: Help },
  
  // Service-specific searches
  { path: 'find-services', text: /.*\b(find|search|look for|need|want)\b.*(plumber|plumbing|leak|pipe|water|drain)/i, action: FindServices },
  { path: 'find-services', text: /.*\b(find|search|look for|need|want)\b.*(electrician|electrical|wiring|power|outlet|lights)/i, action: FindServices },
  { path: 'find-services', text: /.*\b(find|search|look for|need|want)\b.*(cleaner|cleaning|clean|maid|housekeeping)/i, action: FindServices },
  { path: 'find-services', text: /.*\b(find|search|look for|need|want)\b.*(repair|fix|maintenance|handyman|contractor)/i, action: FindServices },
  { path: 'find-services', text: /.*\b(find|search|look for|need|want)\b.*(service|provider|professional)/i, action: FindServices },
  
  // Booking and scheduling
  { path: 'book-service', text: /.*\b(book|schedule|appointment|hire|reserve|arrange)/i, action: BookService },
  { path: 'book-service', text: /.*\b(when.*available|availability|time slot|calendar)/i, action: BookService },
  
  // Pricing and costs
  { path: 'pricing', text: /.*\b(price|cost|rate|fee|how much|pricing|expensive|cheap|budget|afford)/i, action: Pricing },
  { path: 'pricing', text: /.*\b(expense|track|spending|money|payment)/i, action: Pricing },
  
  // Platform information
  { path: 'how-it-works', text: /.*\b(how.*work|process|step|getting started|how to use)/i, action: HowItWorks },
  { path: 'features', text: /.*\b(feature|what.*do|capability|function|what.*offer)/i, action: Features },
  
  // Reviews and ratings
  { path: 'review', text: /.*\b(review|rating|rate|feedback|testimonial|experience)/i, action: Review },
  { path: 'review', text: /.*\b(leave.*review|write.*review|rate.*service|give.*rating)/i, action: Review },
  { path: 'review', text: /.*\b(how was|satisfied|quality|recommend)/i, action: Review },
  
  // Billing and payments
  { path: 'billing', text: /.*\b(billing|payment|invoice|receipt|charge|transaction)/i, action: Billing },
  { path: 'billing', text: /.*\b(pay|paid|bill|credit card|payment method)/i, action: Billing },
  { path: 'billing', text: /.*\b(refund|dispute|chargeback|billing issue)/i, action: Billing },
  
  // Support and contact
  { path: 'contact', text: /.*\b(contact|support|customer service|phone|email|help me)/i, action: Contact },
  { path: 'contact', text: /.*\b(problem|issue|complaint|bug|error)/i, action: Contact },
  
  // Emergency patterns
  { path: 'find-services', text: /.*\b(emergency|urgent|asap|immediately|now|broken|not working)/i, action: FindServices },
  
  // Catch-all fallback
  { path: 'help', text: /.*/i, action: Help }
]
