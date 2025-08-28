import React, { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useBooking } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import { Provider, Review, Booking } from '@/types';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Star, Clock, MapPin, User, CheckCircle, Award, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { reviewApi, bookingApi } from '@/services/api';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string().min(1, { message: "Please select a time" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  price: z.number().min(1, { message: "Price must be greater than 0" }),
});

type FormValues = z.infer<typeof formSchema>;

interface BookingFormProps {
  provider: Provider;
}

const BookingForm: React.FC<BookingFormProps> = ({ provider }) => {
  const { createBooking } = useBooking();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [previousJobs, setPreviousJobs] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviderData();
  }, [provider._id]);

  const fetchProviderData = async () => {
    try {
      setLoading(true);
      
      // Fetch provider reviews
      const providerReviews = await reviewApi.getProviderReviews(provider._id!);
      setReviews(providerReviews);
      
      // Fetch provider's completed bookings as previous jobs
      const providerBookings = await bookingApi.getBookings(provider._id!, 'service_provider');
      const completedJobs = providerBookings.filter(booking => booking.status === 'completed');
      setPreviousJobs(completedJobs);
    } catch (error) {
      console.error('Error fetching provider data:', error);
      toast.error('Failed to load provider information');
    } finally {
      setLoading(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.ratings.overall, 0) / reviews.length 
    : 0;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: undefined,
      time: "",
      description: "",
      price: provider.hourlyRate || 0,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      if (!currentUser?._id) {
        toast.error('User not authenticated');
        return;
      }
      
      await createBooking({
        serviceProvider: provider._id,
        serviceSeeker: currentUser._id,
        date: data.date.toISOString(),
        time: data.time,
        description: data.description,
        price: data.price,
        image: image || undefined,
        status: 'pending'
      });
      navigate('/bookings');
    } catch (error) {
      console.error("Booking creation error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Book {provider.name}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with a trusted professional for your service needs
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-muted-foreground">Loading provider information...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Provider Info & Reviews */}
            <div className="lg:col-span-2 space-y-6">
              {/* Provider Overview */}
              <Card className="overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-20 w-20 border-4 border-white/20">
                        <AvatarImage src={provider.image} />
                        <AvatarFallback className="text-2xl font-bold bg-white/20 text-white">
                          {provider.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2">{provider.name}</h2>
                      <div className="flex items-center gap-2 mb-3">
                        <Award className="h-4 w-4" />
                        <span className="text-blue-100">{provider.serviceCategory}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-4 w-4",
                                  i < Math.floor(averageRating) ? "fill-yellow-300 text-yellow-300" : "text-white/30"
                                )}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">
                            {averageRating.toFixed(1)} ({reviews.length} reviews)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm">{previousJobs.length} jobs completed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{averageRating.toFixed(1)}</div>
                      <div className="text-sm text-gray-600">Average Rating</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{previousJobs.length}</div>
                      <div className="text-sm text-gray-600">Jobs Completed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reviews Section */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
                  <CardTitle className="flex items-center gap-3 text-amber-800">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Star className="h-5 w-5 text-amber-600" />
                    </div>
                    Customer Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {reviews.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Star className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No reviews yet</p>
                      <p className="text-sm text-gray-400 mt-1">Be the first to review this provider</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {reviews.slice(0, 5).map((review, index) => (
                        <div key={review._id}>
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12 border-2 border-gray-100">
                              <AvatarImage src={typeof review.serviceSeeker === 'string' ? undefined : review.serviceSeeker.image} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                                {typeof review.serviceSeeker === 'string' ? 'U' : review.serviceSeeker.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-semibold text-gray-900">
                                  {typeof review.serviceSeeker === 'string' ? 'Customer' : review.serviceSeeker.name}
                                </span>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        "h-3 w-3",
                                        i < review.ratings.overall ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                      )}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {review.createdAt && format(new Date(review.createdAt), "MMM dd, yyyy")}
                                </span>
                              </div>
                              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                              {review.wouldRecommend && (
                                <div className="mt-3">
                                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Would recommend
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                          {index < reviews.length - 1 && <Separator className="mt-6" />}
                        </div>
                      ))}
                      {reviews.length > 5 && (
                        <div className="text-center pt-6">
                          <p className="text-sm text-gray-500 bg-gray-50 rounded-full px-4 py-2 inline-block">
                            Showing 5 of {reviews.length} reviews
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Previous Jobs Section */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                  <CardTitle className="flex items-center gap-3 text-emerald-800">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Clock className="h-5 w-5 text-emerald-600" />
                    </div>
                    Previous Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {previousJobs.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Clock className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No completed jobs yet</p>
                      <p className="text-sm text-gray-400 mt-1">This provider is new to our platform</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {previousJobs.slice(0, 5).map((job, index) => (
                        <div key={job._id} className="group hover:bg-gray-50 rounded-lg p-4 transition-all duration-200 border border-gray-100">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                              <h4 className="font-semibold text-gray-900">
                                Service for {typeof job.serviceSeeker === 'string' ? 'Customer' : job.serviceSeeker.name}
                              </h4>
                            </div>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 font-semibold">
                              ${job.price}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3 leading-relaxed">{job.description}</p>
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4" />
                              {format(new Date(job.date), "MMM dd, yyyy")}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {typeof job.serviceSeeker === 'string' ? 'Location' : job.serviceSeeker.location}
                            </div>
                          </div>
                        </div>
                      ))}
                      {previousJobs.length > 5 && (
                        <div className="text-center pt-6">
                          <p className="text-sm text-gray-500 bg-gray-50 rounded-full px-4 py-2 inline-block">
                            Showing 5 of {previousJobs.length} completed jobs
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Booking Form */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm sticky top-8">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <CalendarIcon className="h-5 w-5" />
                    </div>
                    Book This Service
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-gray-700 font-medium">Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal bg-white border-gray-200 hover:bg-gray-50",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Time</FormLabel>
                            <FormControl>
                              <Input 
                                type="time" 
                                {...field} 
                                className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe what you need help with..."
                                className="resize-none bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                rows={4}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div>
                        <FormLabel htmlFor="image" className="block mb-2 text-gray-700 font-medium">
                          Upload Image (Optional)
                        </FormLabel>
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="mb-2 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                        {image && (
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                            <img
                              src={image}
                              alt="Preview"
                              className="max-h-24 rounded-md border border-gray-200"
                            />
                          </div>
                        )}
                      </div>
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Price ($)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        Book Service
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingForm;
