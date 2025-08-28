import React, { useState, useRef, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBooking } from '@/context/BookingContext';
import { Booking, Provider } from '@/types';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Calendar, Clock, Filter, Star, CreditCard, Building, Upload, AlertTriangle, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
      // Create payment intent using new payment system
      const response = await fetch('http://localhost:5001/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          amount: booking.price, // Amount in LKR
          bookingId: booking._id,
          currency: 'LKR'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
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
          {isProcessing ? 'Processing...' : `Pay Rs. ${booking.price.toFixed(2)}`}
        </Button>
      </div>
    </form>
  );
};

interface BankDetailsDialogProps {
  provider: Provider;
}

const BankDetailsDialog: React.FC<BankDetailsDialogProps> = ({ provider }) => {
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Bank Transfer Details</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium mb-1">Service Provider</h3>
            <p className="text-sm text-gray-500">{provider.name}</p>
          </div>
          <div>
            <h3 className="font-medium mb-1">Bank Name</h3>
            <p className="text-sm text-gray-500">{provider.bankName}</p>
          </div>
          <div>
            <h3 className="font-medium mb-1">Account Number</h3>
            <p className="text-sm text-gray-500">{provider.accountNumber}</p>
          </div>
          <div>
            <h3 className="font-medium mb-1">Branch Name</h3>
            <p className="text-sm text-gray-500">{provider.branchName}</p>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          Please use these details to make your bank transfer. Keep the transaction receipt for your records.
        </div>
      </div>
    </DialogContent>
  );
};

const BookingHistory = () => {
  const { getUserBookings, updateBookingStatus, addReview, fetchBookings } = useBooking();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [isStripeDialogOpen, setIsStripeDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [paidBookings, setPaidBookings] = useState<Set<string>>(new Set());
  const itemsPerPage = 5;

  // Fetch bookings for the current user
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Get all bookings for the current user using the serviceSeeker ID
  const allBookings = getUserBookings();
  
  // Filter bookings based on selected status
  const filteredBookings = statusFilter
    ? allBookings.filter(booking => booking.status === statusFilter)
    : allBookings;
  
  // Sort bookings by date (newest first)
  const sortedBookings = [...filteredBookings].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Calculate pagination
  const totalPages = Math.ceil(sortedBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = sortedBookings.slice(startIndex, startIndex + itemsPerPage);

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
      case 'paid':
        return 'bg-purple-500';
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

  const handleStripePayment = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsStripeDialogOpen(true);
  };

  const handleStripeSuccess = async () => {
    if (!selectedBooking) return;
    
    try {
      // Add the booking ID to paid bookings
      setPaidBookings(prev => new Set([...prev, selectedBooking._id]));
      // Show success message first
      toast.success('Payment completed successfully!');
      // Then close dialog
      setIsStripeDialogOpen(false);
      // Refresh bookings to get updated status
      fetchBookings();
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
      // Show success message first
      toast.success('Bank transfer receipt uploaded successfully!');
      // Then close dialog and clear file
      setIsReceiptDialogOpen(false);
      setReceiptFile(null);
      // Refresh bookings to get updated status
      fetchBookings();
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
      formData.append('file', receiptFile);
      formData.append('bookingId', selectedBooking._id);
      formData.append('bankDetails', JSON.stringify({
        bankName: typeof selectedBooking.serviceProvider === 'object' ? selectedBooking.serviceProvider.bankName : 'N/A',
        accountNumber: typeof selectedBooking.serviceProvider === 'object' ? selectedBooking.serviceProvider.accountNumber : 'N/A',
        branchName: typeof selectedBooking.serviceProvider === 'object' ? selectedBooking.serviceProvider.branchName : 'N/A'
      }));

      // Use new payment system endpoint
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
      // Refresh bookings to get updated status
      fetchBookings();
    } catch (error) {
      console.error("Error uploading receipt:", error);
      toast.error("Failed to upload receipt");
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedBooking) {
      toast.error("No booking selected");
      return;
    }
    
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      console.log("Submitting review for booking:", selectedBooking._id, "Rating:", rating, "Review:", review);
      await addReview(selectedBooking._id, rating, review);
      toast.success("Review submitted successfully");
      setIsReviewOpen(false);
      setSelectedBooking(null);
      setRating(0);
      setReview('');
      // Refresh bookings to show the updated rating
      await fetchBookings();
    } catch (error: any) {
      console.error("Error submitting review:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to submit review";
      toast.error(errorMessage);
    }
  };

  const handleViewPaymentHistory = () => {
    navigate('/payment-history');
  };

  const handleViewBill = (booking: Booking) => {
    // Open bill in a new tab
    const billUrl = `/bill/${booking._id}`;
    window.open(billUrl, '_blank');
  };

  const handleReportIssue = () => {
    navigate('/disputes');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Service History</h2>
        
      </div>
      
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium flex items-center">
          <Filter className="h-4 w-4 mr-1" /> Filter by status:
        </span>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={statusFilter === null ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter(null)}
          >
            All
          </Button>
          <Button 
            variant={statusFilter === "pending" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter("pending")}
          >
            Pending
          </Button>
          <Button 
            variant={statusFilter === "accepted" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter("accepted")}
          >
            Accepted
          </Button>
          <Button 
            variant={statusFilter === "declined" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter("declined")}
          >
            Declined
          </Button>
          <Button 
            variant={statusFilter === "completed" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter("completed")}
          >
            Completed
          </Button>
          <Button 
            variant={statusFilter === "paid" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter("paid")}
          >
            Paid
          </Button>
        </div>
      </div>

      {paginatedBookings.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">
            {allBookings.length === 0 
              ? "You haven't requested any services yet." 
              : "No services match the selected filter."}
          </p>
        </div>
      ) : (
        <>
          <Table>
            <TableCaption>Your service request history</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> Date
                </TableHead>
                <TableHead className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Time
                </TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedBookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell>
                    {typeof booking.serviceProvider === 'object' && booking.serviceProvider !== null
                      ? booking.serviceProvider.name
                      : 'Unknown Provider'}
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
                    {booking.status === 'accepted' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleStatusChange(booking._id, 'completed')}
                      >
                        Mark as Complete
                      </Button>
                    )}
                    {/* Service History: Only ratings and bills, no payments */}
                    {booking.status === 'completed' && (
                      <div className="space-y-2">
                        {/* Rate service option if no rating */}
                        {!booking.rating && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setIsReviewOpen(true);
                            }}
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Rate Service
                          </Button>
                        )}
                        
                        {/* Generate/View Bill for all completed services */}
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() => handleViewBill(booking)}
                        >
                          <FileText className="h-4 w-4" />
                          {(booking.paymentStatus === 'paid' || paidBookings.has(booking._id)) ? 'View Bill' : 'Generate Bill'}
                        </Button>
                        
                        {/* Show payment status if paid */}
                        {(booking.paymentStatus === 'paid' || paidBookings.has(booking._id)) && (
                          <div className="text-sm text-green-600 font-medium">
                            ✓ Payment Completed
                          </div>
                        )}
                      </div>
                    )}
                    {booking.status === 'completed' && booking.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{booking.rating}/5</span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious onClick={() => setCurrentPage(currentPage - 1)} />
                  </PaginationItem>
                )}
                
                {Array.from({ length: totalPages }).map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink 
                      isActive={currentPage === index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationNext onClick={() => setCurrentPage(currentPage + 1)} />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* Bank Transfer Dialog */}
      <Dialog 
        open={isReceiptDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setIsReceiptDialogOpen(false);
            setReceiptFile(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Bank Transfer Details</DialogTitle>
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
                    Rs. {selectedBooking.price.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Please use these details to make your bank transfer. After completing the transfer, upload your receipt.
              </div>
              <div className="space-y-4 mt-4">
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
    </div>
  );
};

export default BookingHistory;

