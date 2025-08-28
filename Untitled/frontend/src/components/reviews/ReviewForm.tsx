import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { reviewApi } from '@/services/api';
import { Booking } from '@/types';

const reviewSchema = z.object({
  ratings: z.object({
    overall: z.number().min(1).max(5),
    quality: z.number().min(1).max(5),
    timeliness: z.number().min(1).max(5),
    communication: z.number().min(1).max(5),
    valueForMoney: z.number().min(1).max(5),
    cleanliness: z.number().min(1).max(5),
  }),
  comment: z.string().min(10, { message: "Review must be at least 10 characters" }).max(1000),
  wouldRecommend: z.boolean(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  booking: Booking;
  onSuccess?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ booking, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      ratings: {
        overall: 5,
        quality: 5,
        timeliness: 5,
        communication: 5,
        valueForMoney: 5,
        cleanliness: 5,
      },
      comment: "",
      wouldRecommend: true,
    },
  });

  const onSubmit = async (data: ReviewFormValues) => {
    setIsSubmitting(true);
    try {
      await reviewApi.addReview({
        bookingId: booking._id,
        serviceProvider: typeof booking.serviceProvider === 'string' 
          ? booking.serviceProvider 
          : booking.serviceProvider._id,
        serviceSeeker: typeof booking.serviceSeeker === 'string' 
          ? booking.serviceSeeker 
          : booking.serviceSeeker._id,
        ...data,
      });
      
      toast.success('Review submitted successfully!');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = (value: number, onChange: (value: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-6 w-6 cursor-pointer ${
              star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
            onClick={() => onChange(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Rate Your Experience</CardTitle>
        <p className="text-sm text-gray-600">
          Service with {typeof booking.serviceProvider === 'string' ? 'Provider' : booking.serviceProvider.name}
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Rating Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ratings.overall"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Experience</FormLabel>
                    <FormControl>
                      {renderStarRating(field.value, field.onChange)}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ratings.quality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Quality</FormLabel>
                    <FormControl>
                      {renderStarRating(field.value, field.onChange)}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ratings.timeliness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeliness</FormLabel>
                    <FormControl>
                      {renderStarRating(field.value, field.onChange)}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ratings.communication"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Communication</FormLabel>
                    <FormControl>
                      {renderStarRating(field.value, field.onChange)}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ratings.valueForMoney"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value for Money</FormLabel>
                    <FormControl>
                      {renderStarRating(field.value, field.onChange)}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ratings.cleanliness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cleanliness</FormLabel>
                    <FormControl>
                      {renderStarRating(field.value, field.onChange)}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Comment */}
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your experience with this service provider..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Would Recommend */}
            <FormField
              control={form.control}
              name="wouldRecommend"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>
                    I would recommend this service provider to others
                  </FormLabel>
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
