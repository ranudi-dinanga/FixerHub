import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { reviewApi, bookingApi } from '@/services/api';
import { Review, Booking } from '@/types';
import ReviewCard from '@/components/reviews/ReviewCard';
import ReviewForm from '@/components/reviews/ReviewForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, ThumbsUp } from 'lucide-react';

const Reviews: React.FC = () => {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [completedBookings, setCompletedBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?._id) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's reviews
      if (currentUser?.role === 'service_seeker') {
        const userReviews = await reviewApi.getSeekerReviews(currentUser._id!);
        setReviews(userReviews);
        
        // Fetch completed bookings without reviews
        const bookings = await bookingApi.getBookings(currentUser._id!, currentUser.role);
        const completedWithoutReviews = bookings.filter(
          booking => booking.status === 'completed' && 
          !userReviews.some(review => review.booking === booking._id)
        );
        setCompletedBookings(completedWithoutReviews);
      } else if (currentUser?.role === 'service_provider') {
        const providerReviews = await reviewApi.getProviderReviews(currentUser._id!);
        setReviews(providerReviews);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    setSelectedBooking(null);
    fetchData();
  };

  const openReviewForm = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowReviewForm(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center">
          <Star className="mr-3 text-yellow-500" />
          Reviews
        </h1>

        <Tabs defaultValue="my-reviews" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-reviews">My Reviews</TabsTrigger>
            {currentUser?.role === 'service_seeker' && (
              <TabsTrigger value="write-review">Write Review</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="my-reviews" className="space-y-4">
            {reviews.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No reviews yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))}
              </div>
            )}
          </TabsContent>

          {currentUser?.role === 'service_seeker' && (
            <TabsContent value="write-review" className="space-y-4">
              {showReviewForm && selectedBooking ? (
                <div>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowReviewForm(false)}
                    className="mb-4"
                  >
                    ← Back to Bookings
                  </Button>
                  <ReviewForm 
                    booking={selectedBooking} 
                    onSuccess={handleReviewSubmitted}
                  />
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Completed Services</h3>
                  {completedBookings.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <ThumbsUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">
                          No completed services available for review
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {completedBookings.map((booking) => (
                        <Card key={booking._id}>
                          <CardHeader>
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
                          </CardHeader>
                          <CardContent>
                            <p className="mb-4">{booking.description}</p>
                            <Button onClick={() => openReviewForm(booking)}>
                              Write Review
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Reviews;
