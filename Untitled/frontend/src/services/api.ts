import axios from 'axios';
import { User, Provider, Booking, Review, Quotation, Certification } from '@/types';

const API_URL = 'http://localhost:5001/api';

const apiInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include auth token
apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

interface LoginResponse {
  user: User;
  token: string;
}

interface RegisterResponse {
  user?: User;
  token?: string;
  message?: string;
  requiresVerification?: boolean;
}

// User related API calls
export const userApi = {
  register: async (userData: Partial<User> & { description?: string; hourlyRate?: number }): Promise<RegisterResponse> => {
    try {
      const response = await apiInstance.post<RegisterResponse>('/users/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  login: async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
    try {
      const response = await apiInstance.post<LoginResponse>('/users/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getServiceProviders: async (filters?: { location?: string; category?: string }): Promise<Provider[]> => {
    try {
      const response = await apiInstance.get<Provider[]>('/users/providers', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
    try {
      const response = await apiInstance.put<User>(`/users/profile/${userId}`, updates);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update profile with image upload
  updateProfileWithImage: async (userId: string, formData: FormData): Promise<User> => {
    try {
      const response = await fetch(`${API_URL}/users/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }
      
      return response.json();
    } catch (error) {
      throw error;
    }
  },

  // Admin API calls
  adminLogin: async (credentials: { email: string; password: string }): Promise<{ user: User }> => {
    try {
      const response = await apiInstance.post<{ user: User }>('/users/admin/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await apiInstance.get<User[]>('/users/admin/users');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  adminUpdateUser: async (userId: string, updates: Partial<User>): Promise<User> => {
    try {
      const response = await apiInstance.put<User>(`/users/admin/users/${userId}`, updates);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteUser: async (userId: string): Promise<{ message: string }> => {
    try {
      const response = await apiInstance.delete<{ message: string }>(`/users/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getDashboardStats: async (): Promise<any> => {
    try {
      const response = await apiInstance.get('/users/admin/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  toggleUserVerification: async (userId: string): Promise<any> => {
    try {
      const response = await apiInstance.patch(`/users/admin/users/${userId}/verify`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Booking related API calls
export const bookingApi = {
  createBooking: async (bookingData: Partial<Booking>): Promise<Booking> => {
    try {
      const response = await apiInstance.post<Booking>('/bookings', bookingData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getBookings: async (userId: string, role: string): Promise<Booking[]> => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      const endpoint = role === 'service_provider' 
        ? `/bookings/provider/${userId}`
        : `/bookings/seeker/${userId}`;
      
      console.log('Fetching bookings with endpoint:', endpoint);
      console.log('User ID:', userId);
      console.log('User role:', role);
      
      const response = await apiInstance.get<Booking[]>(endpoint);
      console.log('Bookings response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getBookings:', error);
      throw error;
    }
  },

  updateBookingStatus: async (bookingId: string, status: string): Promise<Booking> => {
    try {
      const response = await apiInstance.patch<Booking>(`/bookings/${bookingId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  addRating: async (bookingId: string, rating: number, review: string): Promise<Booking> => {
    try {
      console.log('API: Adding rating for booking:', bookingId, 'Rating:', rating, 'Review:', review);
      const response = await apiInstance.post<Booking>(`/bookings/${bookingId}/rating`, { rating, review });
      console.log('API: Rating added successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API: Error adding rating:', error);
      console.error('API: Error response:', error.response?.data);
      throw error;
    }
  },
};

// Review related API calls
export const reviewApi = {
  addReview: async (reviewData: Partial<Review>): Promise<Review> => {
    try {
      const response = await apiInstance.post<Review>('/reviews', reviewData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getProviderReviews: async (providerId: string): Promise<Review[]> => {
    try {
      const response = await apiInstance.get<Review[]>(`/reviews/provider/${providerId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getSeekerReviews: async (seekerId: string): Promise<Review[]> => {
    try {
      const response = await apiInstance.get<Review[]>(`/reviews/seeker/${seekerId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Billing related API calls
export const billingApi = {
  processPayment: async (paymentData: { amount: number, currency: string, paymentMethodId: string }): Promise<any> => {
    try {
      const response = await apiInstance.post<any>('/bookings/process-payment', paymentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Quotation related API calls
export const quotationApi = {
  sendQuotation: async (bookingId: string, quotationData: { quoteAmount: number, terms: string }): Promise<Booking> => {
    try {
      const response = await apiInstance.post<Booking>(`/bookings/${bookingId}/quotation`, quotationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Service provider related API calls
export const providerApi = {
  searchProviders: async (searchParams: any) => {
    try {
      const response = await apiInstance.get('/providers/search', { params: searchParams });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getProviderDetails: async (id: string) => {
    try {
      const response = await apiInstance.get(`/users/providers/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Certification API
export const certificationApi = {
  // Upload certification
  uploadCertification: async (formData: FormData): Promise<any> => {
    const response = await fetch(`${API_URL}/certifications/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload certification');
    }
    
    return response.json();
  },

  // Get provider certifications
  getProviderCertifications: async (providerId: string): Promise<Certification[]> => {
    const response = await fetch(`${API_URL}/certifications/provider/${providerId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch certifications');
    }
    
    return response.json();
  },

  // Get pending certifications (admin only)
  getPendingCertifications: async (): Promise<Certification[]> => {
    const response = await fetch(`${API_URL}/certifications/admin/pending`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch pending certifications');
    }
    
    return response.json();
  },

  // Get all certifications (admin only)
  getAllCertifications: async (filters?: { status?: string; category?: string; providerId?: string }): Promise<Certification[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.providerId) params.append('providerId', filters.providerId);

    const response = await fetch(`${API_URL}/certifications/admin/all?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch certifications');
    }
    
    return response.json();
  },

  // Get certification statistics (admin only)
  getCertificationStats: async (): Promise<any> => {
    const response = await fetch(`${API_URL}/certifications/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch certification statistics');
    }
    
    return response.json();
  },

  // Approve certification (admin only)
  approveCertification: async (certificationId: string, adminNotes?: string): Promise<any> => {
    const response = await fetch(`${API_URL}/certifications/admin/${certificationId}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ adminNotes })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to approve certification');
    }
    
    return response.json();
  },

  // Reject certification (admin only)
  rejectCertification: async (certificationId: string, rejectionReason: string, adminNotes?: string): Promise<any> => {
    const response = await fetch(`${API_URL}/certifications/admin/${certificationId}/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ rejectionReason, adminNotes })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reject certification');
    }
    
    return response.json();
  },

  // Delete certification
  deleteCertification: async (certificationId: string): Promise<any> => {
    const response = await fetch(`${API_URL}/certifications/${certificationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete certification');
    }
    
    return response.json();
  }
};

export default apiInstance; 