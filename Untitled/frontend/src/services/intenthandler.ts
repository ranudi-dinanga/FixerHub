import nlp from 'compromise';

// Intent detection using compromise
export function detectIntent(text: string): string {
  const doc = nlp(text.toLowerCase());
  
  // Greeting patterns
  if (doc.has('hello|hi|hey|good morning|good afternoon|good evening')) {
    return 'greet';
  }
  
  // Plumbing patterns
  if (doc.has('plumber|plumbing|leak|pipe|water|drain|faucet|toilet|sink')) {
    return 'find_plumbing';
  }
  
  // Electrical patterns
  if (doc.has('electrician|electrical|wiring|power|outlet|lights|circuit|breaker')) {
    return 'find_electrical';
  }
  
  // Cleaning patterns
  if (doc.has('clean|cleaner|cleaning|maid|housekeeping|dust|vacuum')) {
    return 'find_cleaning';
  }
  
  // Emergency patterns
  if (doc.has('emergency|urgent|asap|immediately|now|broken|not working|broken')) {
    return 'emergency';
  }
  
  // Booking patterns
  if (doc.has('book|schedule|appointment|hire|reserve|arrange')) {
    return 'book_service';
  }
  
  // Pricing patterns
  if (doc.has('price|cost|rate|fee|how much|pricing|expensive|cheap|budget|afford')) {
    return 'pricing';
  }
  
  // How it works patterns
  if (doc.has('how work|process|step|getting started|how to use')) {
    return 'how_it_works';
  }
  
  // Contact/support patterns
  if (doc.has('contact|support|customer service|phone|email|help me|problem|issue')) {
    return 'contact_support';
  }
  
  // Review patterns
  if (doc.has('review|rating|rate|feedback|testimonial|experience')) {
    return 'review';
  }
  
  // Billing patterns
  if (doc.has('billing|payment|invoice|receipt|charge|transaction|pay|paid|bill')) {
    return 'billing';
  }
  
  // Default fallback
  return 'fallback';
} 