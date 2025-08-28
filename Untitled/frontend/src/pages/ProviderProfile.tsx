import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, ArrowLeft, Award, TrendingUp, CheckCircle } from 'lucide-react';
import BookingForm from '@/components/bookings/BookingForm';
import { providerApi } from '@/services/api';
import { Provider } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const ProviderProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProvider = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await providerApi.getProviderDetails(id);
        setProvider(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to fetch provider details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading provider details...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
            <Star className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Provider Not Found</h1>
          <p className="text-gray-600">The service provider you're looking for doesn't exist.</p>
          <Button 
            onClick={() => navigate('/services')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Button>
        </div>
      </div>
    );
  }

  // Function to capitalize category
  const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/services')}
          className="mb-6 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:shadow-md transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Services
        </Button>
      </div>

      {/* Main Content */}
      {currentUser?.role === 'service_seeker' ? (
        <BookingForm provider={provider} />
      ) : (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center space-y-6">
            <div className="p-4 bg-amber-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <Star className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Login Required</h1>
            <p className="text-gray-600 max-w-md mx-auto">
              You need to be logged in as a homeowner to book services with our providers.
            </p>
            <div className="space-x-4">
              <Button 
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Log In
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/register')}
                className="border-gray-300 hover:bg-gray-50"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderProfile;
