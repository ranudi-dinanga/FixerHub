import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Provider } from '@/types';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';

interface ProviderCardProps {
  provider: Provider;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider }) => {
  const navigate = useNavigate();

  // Function to capitalize category
  const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={provider.image || 'https://images.unsplash.com/photo-1721322800607-8c38375eef04'} 
          alt={provider.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-4">
        <div className="mb-2">
          <h3 className="text-lg font-semibold">{provider.name}</h3>
          <div className="text-sm text-muted-foreground">
            {formatCategory(provider.serviceCategory)}
          </div>
        </div>
        <div className="flex items-center text-sm mb-2">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
          <span className="font-medium">{provider.rating.toFixed(1)}</span>
          <span className="text-muted-foreground ml-1">
            ({provider.totalRatings} ratings)
          </span>
        </div>
        <div className="text-sm text-muted-foreground mb-2">
          {provider.location}
        </div>
        {provider.hourlyRate && (
          <div className="font-semibold text-service-blue">
            ${provider.hourlyRate}/hr
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full" 
          onClick={() => navigate(`/provider/${provider._id}`)}
        >
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProviderCard;
