import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { bookingApi } from '@/services/api';
import { Booking } from '@/types';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

interface BookingContextType {
  bookings: Booking[];
  isLoading: boolean;
  lastFetched: Date | null;
  createBooking: (bookingData: Partial<Booking>) => Promise<void>;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => Promise<void>;
  addReview: (bookingId: string, rating: number, review: string) => Promise<void>;
  getUserBookings: () => Booking[];
  fetchBookings: () => Promise<void>;
  refreshBookings: () => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const { currentUser } = useAuth();
  const isInitialized = useRef(false);
  const abortController = useRef<AbortController | null>(null);

  const fetchBookings = useCallback(async (forceRefresh = false) => {
    try {
      if (!currentUser?._id) {
        console.error('No user ID available for fetching bookings.');
        return;
      }

      // Prevent multiple simultaneous requests
      if (isLoading && !forceRefresh) {
        console.log('Fetch already in progress, skipping...');
        return;
      }

      // Check if we need to fetch (cache for 5 minutes unless forced)
      const now = new Date();
      const cacheTime = 5 * 60 * 1000; // 5 minutes
      if (!forceRefresh && lastFetched && (now.getTime() - lastFetched.getTime()) < cacheTime) {
        console.log('Using cached bookings data');
        return;
      }

      // Cancel any ongoing request
      if (abortController.current) {
        abortController.current.abort();
      }

      // Create new abort controller
      abortController.current = new AbortController();
      
      setIsLoading(true);
      console.log('Fetching bookings for user:', currentUser._id, 'with role:', currentUser.role);
      
      const startTime = performance.now();
      const fetchedBookings = await bookingApi.getBookings(currentUser._id, currentUser.role);
      const endTime = performance.now();
      
      // Check if request was cancelled
      if (abortController.current?.signal.aborted) {
        console.log('Request was cancelled');
        return;
      }
      
      console.log(`Bookings fetched in ${(endTime - startTime).toFixed(2)}ms`);
      setBookings(fetchedBookings);
      setLastFetched(now);
      isInitialized.current = true;
    } catch (error: any) {
      // Don't show error if request was cancelled
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
        return;
      }
      
      console.error('Error fetching bookings:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch bookings';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?._id, currentUser?.role, lastFetched, isLoading]);

  // Manual refresh function
  const refreshBookings = useCallback(async () => {
    console.log('Manual refresh requested');
    await fetchBookings(true);
  }, [fetchBookings]);

  useEffect(() => {
    if (currentUser?._id && !isInitialized.current) {
      fetchBookings();
    }
  }, [currentUser?._id, currentUser?.role, fetchBookings]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  const createBooking = async (bookingData: Partial<Booking>) => {
    try {
      const newBooking = await bookingApi.createBooking(bookingData);
      setBookings(prev => [...prev, newBooking]);
      toast.success('Booking created successfully');
    } catch (error: any) {
      console.error('Error creating booking:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create booking';
      toast.error(errorMessage);
      throw error;
    }
  };

  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      const updatedBooking = await bookingApi.updateBookingStatus(bookingId, status);
      setBookings(prev => prev.map(booking => 
        booking._id === bookingId ? updatedBooking : booking
      ));
      toast.success(`Booking ${status} successfully`);
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update booking status';
      toast.error(errorMessage);
      throw error;
    }
  };

  const addReview = async (bookingId: string, rating: number, review: string) => {
    try {
      console.log('BookingContext: addReview called with:', { bookingId, rating, review });
      const updatedBooking = await bookingApi.addRating(bookingId, rating, review);
      console.log('BookingContext: Review API response:', updatedBooking);
      
      setBookings(prev => prev.map(booking => 
        booking._id === bookingId ? updatedBooking : booking
      ));
      toast.success('Review added successfully');
    } catch (error: any) {
      console.error('BookingContext: Error adding review:', error);
      console.error('BookingContext: Error details:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to add review';
      toast.error(errorMessage);
      throw error;
    }
  };

  const getUserBookings = () => {
    return bookings;
  };

  const value = {
    bookings,
    isLoading,
    lastFetched,
    createBooking,
    updateBookingStatus,
    addReview,
    getUserBookings,
    fetchBookings,
    refreshBookings,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
