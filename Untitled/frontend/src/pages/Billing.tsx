import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { bookingApi } from '@/services/api';
import { Booking } from '@/types';
import PaymentForm from '@/components/billing/PaymentForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Receipt, Clock, CheckCircle } from 'lucide-react';

const Billing: React.FC = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?._id) {
      fetchBookings();
    }
  }, [currentUser]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const userBookings = await bookingApi.getBookings(currentUser!._id!, currentUser!.role);
      setBookings(userBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setSelectedBooking(null);
    fetchBookings();
  };

  const openPaymentForm = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowPaymentForm(true);
  };

  const getStatusBadge = (status: string, paymentStatus?: string) => {
    if (paymentStatus === 'completed') {
      return <Badge className="bg-green-500">Paid</Badge>;
    }
    
    switch (status) {
      case 'completed':
        return <Badge className="bg-blue-500">Awaiting Payment</Badge>;
      case 'accepted':
        return <Badge className="bg-yellow-500">In Progress</Badge>;
      case 'pending':
        return <Badge className="bg-gray-500">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const pendingPayments = bookings.filter(
    booking => booking.status === 'completed' && booking.paymentStatus !== 'completed'
  );

  const paidBookings = bookings.filter(
    booking => booking.paymentStatus === 'completed'
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center">
          <CreditCard className="mr-3 text-blue-500" />
          Billing & Payments
        </h1>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">Pending Payments</TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {showPaymentForm && selectedBooking ? (
              <div>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPaymentForm(false)}
                  className="mb-4"
                >
                  ← Back to Payments
                </Button>
                <PaymentForm 
                  booking={selectedBooking} 
                  onSuccess={handlePaymentSuccess}
                />
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold mb-4">Services Awaiting Payment</h3>
                {pendingPayments.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
                      <p className="text-gray-500">No pending payments</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {pendingPayments.map((booking) => (
                      <Card key={booking._id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">
                                Service with {
                                  typeof booking.serviceProvider === 'string' 
                                    ? 'Provider' 
                                    : booking.serviceProvider.name
                                }
                              </CardTitle>
                              <p className="text-sm text-gray-600">
                                Completed on {new Date(booking.date).toLocaleDateString()}
                              </p>
                            </div>
                            {getStatusBadge(booking.status, booking.paymentStatus)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="mb-4">{booking.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold text-green-600">
                              Rs. {booking.price.toFixed(2)}
                            </span>
                            <Button onClick={() => openPaymentForm(booking)}>
                              Pay Now
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Payment History</h3>
            {paidBookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No payment history yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {paidBookings.map((booking) => (
                  <Card key={booking._id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            Service with {
                              typeof booking.serviceProvider === 'string' 
                                ? 'Provider' 
                                : booking.serviceProvider.name
                            }
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            Paid on {booking.invoice?.paidDate 
                              ? new Date(booking.invoice.paidDate).toLocaleDateString()
                              : 'N/A'
                            }
                          </p>
                        </div>
                        <Badge className="bg-green-500">Paid</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">{booking.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-semibold">
                          Rs. {booking.price.toFixed(2)}
                        </span>
                        <Button variant="outline" size="sm">
                          Download Receipt
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Billing;
