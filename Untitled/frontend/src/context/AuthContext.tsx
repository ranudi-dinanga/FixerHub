import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Provider, Homeowner } from '../types';
import { useNavigate } from 'react-router-dom';
import { toast } from '../components/ui/use-toast';
import { userApi } from '../services/api';
interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User> & { description?: string; hourlyRate?: number }) => Promise<void>;
  logout: () => void;
  allProviders: Provider[];
  getProviderById: (id: string) => Provider | undefined;
  updateCurrentUser: (user: User) => void;
  refreshCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allProviders, setAllProviders] = useState<Provider[]>([]);
  const navigate = useNavigate();

  // Initialize from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log('Initializing user from localStorage:', parsedUser);
      setCurrentUser(parsedUser);
    }
  }, []);

  // Fetch all providers when component mounts
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const providers = await userApi.getServiceProviders();
        setAllProviders(providers);
      } catch (error) {
        console.error('Error fetching providers:', error);
      }
    };
    fetchProviders();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await userApi.login({ email, password });
      const { user, token } = response;
      
      console.log('Login response user data:', user);

      // Store token and user data
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setCurrentUser(user);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      });
      
      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'service_provider') {
        navigate('/provider-dashboard');
      } else {
        navigate('/services');
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (userData: Partial<User> & { description?: string; hourlyRate?: number }) => {
    try {

      const response = await userApi.register(userData);
      const { message, requiresVerification } = response;

      if (requiresVerification) {
        toast({
          title: "Registration successful!",
          description: message || "Please check your email to verify your account before logging in.",
        });
        
        // Redirect to login page with a message
        navigate('/login?message=verify-email');
      } else {
        // Legacy flow - if no verification required
        const { user, token } = response;
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentUser(user);
        
        toast({
          title: "Registration successful",
          description: `Welcome, ${user.name}!`,
        });

        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (user.role === 'service_provider') {
          navigate('/provider-dashboard');
        } else {
          navigate('/services');
        }
      }
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    navigate('/');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const getProviderById = (id: string): Provider | undefined => {
    return allProviders.find(provider => provider._id === id);
  };

  const updateCurrentUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const refreshCurrentUser = async () => {
    if (!currentUser?._id) return;
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      // Fetch updated user data from server
      const response = await fetch(`http://localhost:5001/api/users/profile/${currentUser._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        console.log('User data refreshed:', updatedUser);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    allProviders,
    getProviderById,
    updateCurrentUser,
    refreshCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

