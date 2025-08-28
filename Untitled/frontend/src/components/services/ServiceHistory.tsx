import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  User, 
  Search, 
  Filter,
  RefreshCw,
  Eye,
  MessageSquare,
  Star
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useBooking } from '@/context/BookingContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import ServiceHistorySkeleton from './ServiceHistorySkeleton';

interface ServiceHistoryProps {
  className?: string;
}

const ServiceHistory: React.FC<ServiceHistoryProps> = ({ className = '' }) => {
  const { currentUser } = useAuth();
  const { getUserBookings, isLoading, fetchBookings } = useBooking();
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    dateRange: ''
  });

  const bookings = getUserBookings();

  useEffect(() => {
    if (bookings.length > 0) {
      applyFilters();
    }
  }, [bookings, filters]);

  const applyFilters = () => {
    let filtered = [...bookings];

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(booking => booking.status === filters.status);
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.description?.toLowerCase().includes(searchTerm) ||
        (typeof booking.serviceProvider === 'object' && 
         booking.serviceProvider?.name?.toLowerCase().includes(searchTerm)) ||
        (typeof booking.serviceSeeker === 'object' && 
         booking.serviceSeeker?.name?.toLowerCase().includes(searchTerm))
      );
    }

    // Date range filter
    if (filters.dateRange) {
      const today = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setDate(today.getDate() - 1);
          break;
        case 'week':
          filterDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(today.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(today.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= filterDate;
      });
    }

    setFilteredBookings(filtered);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pending',
      accepted: 'Accepted',
      completed: 'Completed',
      declined: 'Declined',
      cancelled: 'Cancelled'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const handleRefresh = () => {
    fetchBookings();
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      search: '',
      dateRange: ''
    });
  };

  if (isLoading) {
    return <ServiceHistorySkeleton />;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Service History</h2>
          <p className="text-gray-600">View all your past and current services</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search services..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service History List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Services ({filteredBookings.length})
            {filters.status || filters.search || filters.dateRange ? (
              <span className="text-sm font-normal text-gray-500 ml-2">
                (Filtered from {bookings.length} total)
              </span>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBookings.length === 0 ? (
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-500">
                {filters.status || filters.search || filters.dateRange 
                  ? "Try adjusting your filters or search terms."
                  : "You haven't booked any services yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div key={booking._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="space-y-4">
                    {/* Header with status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {booking.description}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {typeof booking.serviceProvider === 'object' 
                              ? `Service Provider: ${booking.serviceProvider.name}`
                              : 'Service Provider: Unknown'}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {getStatusLabel(booking.status)}
                      </Badge>
                    </div>

                    {/* Service details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="text-sm font-medium">{booking.date}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Time</p>
                          <p className="text-sm font-medium">{booking.time}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="text-sm font-medium">{booking.location || 'Not specified'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Price</p>
                          <p className="text-sm font-medium">LKR {booking.price}</p>
                        </div>
                      </div>
                    </div>

                    {/* Additional details */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Service Category:</span>
                        <p className="font-medium">{booking.serviceCategory || 'General'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Payment Status:</span>
                        <p className="font-medium">{booking.paymentStatus || 'Pending'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <p className="font-medium">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>
                      
                      {booking.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Star className="w-4 h-4" />
                          Rate Service
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Contact
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {filteredBookings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Services</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredBookings.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredBookings.filter(b => b.status === 'completed').length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {filteredBookings.filter(b => b.status === 'pending').length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-purple-600">
                    LKR {filteredBookings
                      .filter(b => b.status === 'completed')
                      .reduce((sum, b) => sum + (b.price || 0), 0)
                      .toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ServiceHistory;
