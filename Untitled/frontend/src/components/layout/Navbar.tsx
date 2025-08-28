import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { History, Star, CreditCard, DollarSign, User } from 'lucide-react';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-service-blue">Fixerhub</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                {currentUser.role === 'service_seeker' && (
                  <>
                    <Button variant="ghost" onClick={() => navigate('/services')}>
                      Find Services
                    </Button>
                    <Button variant="ghost" onClick={() => navigate('/bookings')}>
                      My Bookings
                    </Button>
                    <Button variant="ghost" onClick={() => navigate('/service-history')}>
                      <History size={16} className="mr-1" />
                      Service History
                    </Button>
                    {/* <Button variant="ghost" onClick={() => navigate('/reviews')}>
                      <Star size={16} className="mr-1" />
                      Reviews
                    </Button>
                    <Button variant="ghost" onClick={() => navigate('/billing')}>
                      <CreditCard size={16} className="mr-1" />
                      Billing
                    </Button> */}
                  </>
                )}
                {currentUser.role === 'service_provider' && (
                  <>
                    <Button variant="ghost" onClick={() => navigate('/provider-dashboard')}>
                      Dashboard
                    </Button>
                    <Button variant="ghost" onClick={() => navigate('/bookings')}>
                      <DollarSign size={16} className="mr-1" />
                      Manage Bookings
                    </Button>
                    <Button variant="ghost" onClick={() => navigate('/reviews')}>
                      <Star size={16} className="mr-1" />
                      Reviews
                    </Button>
                  </>
                )}
                <Button variant="ghost" onClick={() => navigate('/profile')}>
                  <User size={16} className="mr-1" />
                  Profile
                </Button>
                <div className="text-sm font-medium">Hi, {currentUser.name}</div>
                <Button variant="outline" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button onClick={() => navigate('/register')}>
                  Register
                </Button>
                <Link to="/admin/login">
                  <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50">
                    Admin Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
