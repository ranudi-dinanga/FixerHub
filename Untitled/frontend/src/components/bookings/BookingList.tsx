import React, { useState, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Booking } from '@/types';
import { useBooking } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner, LoadingDots } from '@/components/ui/loading-spinner';
import BookingSkeleton from './BookingSkeleton';
import PerformanceMonitor from './PerformanceMonitor';
import ReportIssue from '../disputes/ReportIssue';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Star, CreditCard, Building, Upload, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { formatCurrency } from '@/utils/fileHelpers';

// Stripe Card Element styles
const cardStyle = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: 'Arial, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#32325d"
      }
    },
    invalid: {
      fontFamily: 'Arial, sans-serif',
      color: "#fa755a",
      iconColor: "#fa755a"
    }
  }
};

// Stripe Payment Form Component
const StripePaymentForm = ({ booking, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!booking) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError('');

    try {
      // Create payment intent
      const response = await fetch('http://localhost:5001/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          amount: booking.price, // Amount in LKR (backend will convert to USD)
          bookingId: booking._id,
          currency: 'LKR'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create payment intent (${response.status})`);
      }

      const { clientSecret, paymentId } = await response.json();

      // Confirm the payment
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        }
      });

      if (paymentError) {
        throw new Error(paymentError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirm payment with backend
        try {
          await fetch('http://localhost:5001/api/payments/confirm-stripe-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
              paymentIntentId: paymentIntent.id,
              paymentId: paymentId
            })
          });
        } catch (confirmError) {
          console.error('Error confirming payment:', confirmError);
          // Don't fail the payment if confirmation fails
        }
        
        toast.success('Payment successful!');
        onSuccess();
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <CardElement options={cardStyle} />
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || isProcessing}>
          {isProcessing ? 'Processing...' : `Pay ${formatCurrency(booking.price)}`}
        </Button>
      </div>
    </form>
  );
};

const BookingList = () => {
  const { getUserBookings, updateBookingStatus, addReview, isLoading, fetchBookings } = useBooking();
  const { currentUser } = useAuth();
  const bookings = getUserBookings();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [isStripeDialogOpen, setIsStripeDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [paidBookings, setPaidBookings] = useState<Set<string>>(new Set());
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [isReportIssueOpen, setIsReportIssueOpen] = useState(false);
  const [selectedBookingForReport, setSelectedBookingForReport] = useState<string>('');

  const isHomeowner = currentUser?.role === 'service_seeker';

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'accepted':
        return 'bg-green-500';
      case 'declined':
        return 'bg-red-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleStatusChange = async (bookingId: string, status: Booking['status']) => {
    try {
      await updateBookingStatus(bookingId, status);
      toast.success(`Booking ${status} successfully`);
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Failed to update booking status");
    }
  };

  const handleSubmitReview = async () => {
    console.log('handleSubmitReview called', { selectedBooking: selectedBooking?._id, rating, review });
    
    if (!selectedBooking) {
      toast.error("No booking selected");
      return;
    }
    
    if (rating === 0) {
      toast.error("Please provide a rating");
      return;
    }

    try {
      console.log('Submitting review for booking:', selectedBooking._id);
      await addReview(selectedBooking._id, rating, review);
      toast.success("Review submitted successfully");
      setIsReviewOpen(false);
      setSelectedBooking(null);
      setRating(0);
      setReview('');
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    }
  };

  const handleStripePayment = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsStripeDialogOpen(true);
  };

  const handleStripeSuccess = async () => {
    if (!selectedBooking) return;
    
    try {
      // Add the booking ID to paid bookings
      setPaidBookings(prev => new Set([...prev, selectedBooking._id]));
      // Close dialog and show success message
      setIsStripeDialogOpen(false);
      toast.success('Payment completed successfully');
      // Note: Bookings will be refreshed when the component re-renders
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Failed to update booking status");
    }
  };

  const handleBankTransfer = async (booking: Booking) => {
    setSelectedBooking(booking);
    setIsReceiptDialogOpen(true);
  };

  const handleBankTransferSuccess = async () => {
    if (!selectedBooking) return;
    
    try {
      // Add the booking ID to paid bookings
      setPaidBookings(prev => new Set([...prev, selectedBooking._id]));
      // Close dialog and show success message
      setIsReceiptDialogOpen(false);
      setReceiptFile(null);
      toast.success('Receipt uploaded successfully!');
      // Note: Bookings will be refreshed when the component re-renders
    } catch (error) {
      console.error("Error uploading receipt:", error);
      toast.error("Failed to upload receipt");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast.error("Please upload an image or PDF file");
        return;
      }
      setReceiptFile(file);
    }
  };

  const handleReceiptUpload = async () => {
    if (!selectedBooking || !receiptFile) return;

    try {
      const formData = new FormData();
      formData.append('file', receiptFile); // Changed from 'receipt' to 'file'
      formData.append('bookingId', selectedBooking._id);
      formData.append('bankDetails', JSON.stringify({
        bankName: typeof selectedBooking.serviceProvider === 'object' ? selectedBooking.serviceProvider.bankName : 'N/A',
        accountNumber: typeof selectedBooking.serviceProvider === 'object' ? selectedBooking.serviceProvider.accountNumber : 'N/A',
        branchName: typeof selectedBooking.serviceProvider === 'object' ? selectedBooking.serviceProvider.branchName : 'N/A'
      }));

      // Use the new payment system endpoint
      const response = await fetch('http://localhost:5001/api/payments/upload-bank-transfer-receipt', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload receipt');
      }

      const data = await response.json();
      toast.success('Receipt uploaded successfully! Payment is pending verification by the service provider.');
      setIsReceiptDialogOpen(false);
      setReceiptFile(null);
      setSelectedBooking(null);
      // Add to paid bookings to update UI immediately
      if (selectedBooking) {
        setPaidBookings(prev => new Set([...prev, selectedBooking._id]));
      }
    } catch (error) {
      console.error("Error uploading receipt:", error);
      toast.error("Failed to upload receipt");
    }
  };

  const getProviderName = (booking: Booking) => {
    if (!booking.serviceProvider) return 'Unknown Provider';
    return typeof booking.serviceProvider === 'string' 
      ? 'Unknown Provider' 
      : booking.serviceProvider.name || 'Unknown Provider';
  };

  const getSeekerName = (booking: Booking) => {
    if (!booking.serviceSeeker) return 'Unknown User';
    return typeof booking.serviceSeeker === 'string'
      ? 'Unknown User'
      : booking.serviceSeeker.name || 'Unknown User';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {isHomeowner ? 'My Bookings' : 'Service Requests'}
        </h2>
        
        {/* Refresh button with loading state */}
        <Button
          variant="outline"
          size="sm"
          onClick={fetchBookings}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          Refresh
        </Button>
      </div>
      
      {/* Loading state */}
      {isLoading ? (
        <BookingSkeleton />
      ) : bookings.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">
            {isHomeowner
              ? "You don't have any bookings yet. Start by finding a service provider!"
              : "You don't have any service requests yet."}
          </p>
        </div>
      ) : (
        <Table>
          <TableCaption>
            {isHomeowner
              ? 'A list of your booked services'
              : 'A list of all your service requests'}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>{isHomeowner ? 'Provider' : 'From'}</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking, index) => (
              <TableRow 
                key={booking._id}
                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <TableCell>
                  {isHomeowner 
                    ? getProviderName(booking)
                    : getSeekerName(booking)}
                </TableCell>
                <TableCell>{booking.date}</TableCell>
                <TableCell>{booking.time}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {booking.description}
                </TableCell>
                <TableCell>{formatCurrency(booking.price)}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {isHomeowner ? (
                    <>
                      {booking.status === 'accepted' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStatusChange(booking._id, 'completed')}
                        >
                          Mark as Complete
                        </Button>
                      )}
                      {booking.status === 'completed' && (
                        <div className="space-y-2">
                          {/* Show rating if exists */}
                          {booking.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{booking.rating}/5</span>
                            </div>
                          )}
                          
                          {/* Show review button if not rated and not paid */}
                          {!booking.rating && !paidBookings.has(booking._id) && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setIsReviewOpen(true);
                              }}
                              className="mb-2"
                            >
                              Rate Service
                            </Button>
                          )}
                          
                          {/* Show payment options if not paid */}
                          {!paidBookings.has(booking._id) && (
                            <div className="flex flex-col gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={() => handleStripePayment(booking)}
                              >
                                <CreditCard className="h-4 w-4" />
                                Pay with Stripe
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={() => handleBankTransfer(booking)}
                              >
                                <Building className="h-4 w-4" />
                                Bank Transfer
                              </Button>
                            </div>
                          )}
                          
                          {/* Show payment status if paid */}
                          {paidBookings.has(booking._id) && (
                            <div className="text-sm text-green-600 font-medium">
                              ✓ Payment Completed
                            </div>
                          )}
                          
                          {/* Report Issue Button */}
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => {
                              setSelectedBookingForReport(booking._id);
                              setIsReportIssueOpen(true);
                            }}
                          >
                            <AlertTriangle className="h-4 w-4" />
                            Report Issue
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {booking.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleStatusChange(booking._id, 'accepted')}
                          >
                            Accept
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleStatusChange(booking._id, 'declined')}
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Review Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Your Service</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4">
              <div className="text-sm font-medium mb-1">Rating</div>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`cursor-pointer ${
                      star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>
            <div className="mb-4">
              <div className="text-sm font-medium mb-1">Review (Optional)</div>
              <Textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience with this service provider"
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitReview}
              disabled={rating === 0}
            >
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Upload Dialog */}
      <Dialog 
        open={isReceiptDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setIsReceiptDialogOpen(false);
            setReceiptFile(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bank Transfer Details</DialogTitle>
            <DialogDescription>
              Please complete the bank transfer using the details below
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="grid gap-4 py-4">
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium mb-1">Service Provider</h3>
                  <p className="text-sm text-gray-500">
                    {typeof selectedBooking.serviceProvider === 'object' 
                      ? selectedBooking.serviceProvider.name 
                      : 'Unknown Provider'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Bank Name</h3>
                  <p className="text-sm text-gray-500">
                    {typeof selectedBooking.serviceProvider === 'object' 
                      ? selectedBooking.serviceProvider.bankName 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Account Number</h3>
                  <p className="text-sm text-gray-500">
                    {typeof selectedBooking.serviceProvider === 'object' 
                      ? selectedBooking.serviceProvider.accountNumber 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Branch Name</h3>
                  <p className="text-sm text-gray-500">
                    {typeof selectedBooking.serviceProvider === 'object' 
                      ? selectedBooking.serviceProvider.branchName 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Amount to Transfer</h3>
                  <p className="text-sm font-semibold text-green-600">
                    {formatCurrency(selectedBooking.price)}
                  </p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                After completing the bank transfer, please upload your receipt below.
              </div>
              <div className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <label htmlFor="receipt" className="text-sm font-medium">Upload Transfer Receipt</label>
                  <Input
                    id="receipt"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsReceiptDialogOpen(false);
              setReceiptFile(null);
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleReceiptUpload}
              disabled={!receiptFile}
            >
              Upload Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stripe Payment Dialog */}
      <Dialog 
        open={isStripeDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setIsStripeDialogOpen(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay with Stripe</DialogTitle>
            <DialogDescription>
              Enter your card details to complete the payment
            </DialogDescription>
          </DialogHeader>
          <Elements stripe={stripePromise}>
            {selectedBooking && !paidBookings.has(selectedBooking._id) && (
              <StripePaymentForm
                booking={selectedBooking}
                onSuccess={handleStripeSuccess}
                onCancel={() => setIsStripeDialogOpen(false)}
              />
            )}
          </Elements>
        </DialogContent>
      </Dialog>
      
      {/* Report Issue Dialog */}
      <Dialog open={isReportIssueOpen} onOpenChange={setIsReportIssueOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <ReportIssue 
            onClose={() => {
              setIsReportIssueOpen(false);
              setSelectedBookingForReport('');
            }}
            selectedBookingId={selectedBookingForReport}
          />
        </DialogContent>
      </Dialog>
      
      {/* Performance Monitor */}
      <PerformanceMonitor
        isLoading={isLoading}
        dataCount={bookings.length}
        onMetricsUpdate={setPerformanceMetrics}
      />
    </div>
  );
};

export default BookingList;
