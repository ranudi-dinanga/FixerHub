import React from 'react';
import BookingList from '@/components/bookings/BookingList';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { History } from 'lucide-react';

const Bookings = () => {
  const { currentUser } = useAuth();
  const isHomeowner = currentUser?.role === 'service_seeker';

  return (
    <div className="container mx-auto py-8 px-4">
      {isHomeowner && (
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Current Bookings</h1>
          <Button asChild variant="outline">
            <Link to="/service-history" className="flex items-center gap-2">
              <History size={16} />
              View Service History
            </Link>
          </Button>
        </div>
      )}
      <BookingList />
    </div>
  );
};

export default Bookings;
