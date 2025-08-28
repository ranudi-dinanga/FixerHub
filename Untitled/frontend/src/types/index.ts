export interface User {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role: 'service_seeker' | 'service_provider' | 'admin';
  location: string;
  serviceCategory?: string;
  rating?: number;
  totalRatings?: number;
  description?: string;
  hourlyRate?: number;
  image?: string;
  bankName?: string;
  accountNumber?: string;
  branchName?: string;
  // Certification system fields
  certificationPoints?: number;
  totalCertifications?: number;
  verifiedCertifications?: number;
  certificationLevel?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  // Profile picture points
  profilePicturePoints?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Provider extends User {
  role: 'service_provider';
  serviceCategory: string;
  hourlyRate: number;
  bankName: string;
  accountNumber: string;
  branchName: string;
  certificationPoints: number;
  certificationLevel: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  verifiedCertifications: number;
  totalCertifications: number;
}

export interface Homeowner extends User {
  role: 'service_seeker';
}

export interface Admin extends User {
  role: 'admin';
}

export interface Booking {
  _id?: string;
  serviceProvider: string | Provider;
  serviceSeeker: string | Homeowner;
  date: string;
  time: string;
  description: string;
  price: number;
  originalPrice?: number;
  status: 'pending' | 'quote_requested' | 'quote_sent' | 'quote_accepted' | 'accepted' | 'declined' | 'completed' | 'paid';
  terms?: string;
  paymentStatus?: 'unpaid' | 'processing' | 'paid' | 'failed' | 'refunded' | 'pending_verification' | 'disputed';
  paymentIntentId?: string;
  invoice?: {
    invoiceNumber: string;
    dueDate: string;
    paidDate?: string;
    taxAmount: number;
    totalAmount: number;
  };
  image?: string;
  rating?: number;
  review?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  _id?: string;
  booking: string | Booking;
  serviceProvider: string | Provider;
  serviceSeeker: string | Homeowner;
  ratings: {
    overall: number;
    quality: number;
    timeliness: number;
    communication: number;
    valueForMoney: number;
    cleanliness: number;
  };
  comment: string;
  photos?: string[];
  wouldRecommend: boolean;
  isVerified?: boolean;
  helpful?: string[];
  providerResponse?: {
    response: string;
    responseDate: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Quotation {
  _id?: string;
  booking: string;
  serviceProvider: string;
  amount: number;
  terms: string;
  validUntil: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Certification {
  _id?: string;
  serviceProvider: string | User;
  title: string;
  issuingOrganization: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate?: string;
  category: 'technical' | 'safety' | 'professional' | 'trade' | 'other';
  points: number;
  description?: string;
  documentFile: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  reviewedBy?: string | User;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  _id?: string;
  booking: string | Booking;
  payer: string | User;
  payee: string | User;
  amount: number;
  currency: string;
  paymentMethod: 'stripe' | 'bank_transfer' | 'cash' | 'refund';
  status: 'created' | 'pending_customer_action' | 'pending_provider_confirmation' | 'confirmed' | 'failed' | 'cancelled' | 'refunded';
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  bankTransferDetails?: {
    bankName: string;
    accountNumber: string;
    branchName: string;
    transferDate: string;
    referenceNumber: string;
    receiptPath: string;
  };
  invoice?: {
    invoiceNumber: string;
    dueDate: string;
    paidDate?: string;
    taxAmount: number;
    totalAmount: number;
    subtotal: number;
  };
  metadata?: {
    description: string;
    serviceType: string;
    bookingDate: string;
  };
  notes?: string;
  refundDetails?: {
    refundId: string;
    refundAmount: number;
    refundReason: string;
    refundDate: string;
  };
  adminNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}
