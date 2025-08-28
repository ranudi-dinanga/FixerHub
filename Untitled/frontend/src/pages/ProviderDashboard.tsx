import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Upload, Star, Clock, TrendingUp, FileText } from 'lucide-react';
import BookingList from '@/components/bookings/BookingList';
import { useBooking } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import EditProfileForm from '@/components/profile/EditProfileForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { certificationApi } from '@/services/api';
import type { Certification } from '@/types';

const ProviderDashboard = () => {
  const { getUserBookings, fetchBookings } = useBooking();
  const { currentUser, refreshCurrentUser } = useAuth();
  const bookings = getUserBookings();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loadingCertifications, setLoadingCertifications] = useState(true);

  useEffect(() => {
    fetchBookings();
    refreshCurrentUser(); // Refresh user data to get latest certification info
    fetchCertifications();

    // Refresh certifications when user returns to the tab
    const handleFocus = () => {
      refreshCertifications();
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []); // Empty dependency array - only run once on mount

  const fetchCertifications = async () => {
    if (!currentUser?._id) return;
    
    try {
      setLoadingCertifications(true);
      const certs = await certificationApi.getProviderCertifications(currentUser._id);
      setCertifications(certs);
      console.log('Fetched certifications:', certs);
    } catch (error) {
      console.error('Error fetching certifications:', error);
    } finally {
      setLoadingCertifications(false);
    }
  };

  const refreshCertifications = async () => {
    await fetchCertifications();
  };

  const pendingBookings = bookings.filter(booking => booking.status === 'pending');
  const acceptedBookings = bookings.filter(booking => booking.status === 'accepted');
  const completedBookings = bookings.filter(booking => booking.status === 'completed');

  // Calculate certification statistics from actual data
  const approvedCertifications = certifications.filter(cert => cert.status === 'approved');
  const pendingCertifications = certifications.filter(cert => cert.status === 'pending');
  const totalCertificationPoints = approvedCertifications.reduce((sum, cert) => sum + (cert.points || 0), 0);

  const getCertificationLevelColor = (level: string) => {
    const colors = {
      bronze: 'bg-amber-100 text-amber-800',
      silver: 'bg-gray-100 text-gray-800',
      gold: 'bg-yellow-100 text-yellow-800',
      platinum: 'bg-blue-100 text-blue-800',
      diamond: 'bg-purple-100 text-purple-800',
    };
    return colors[level as keyof typeof colors] || colors.bronze;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Provider Dashboard</h1>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link to="/certifications/upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload Certification
            </Link>
          </Button>
          <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
            <DialogTrigger asChild>
              <Button>Edit Profile</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader className="sticky top-0 bg-white z-10 pb-4">
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <div className="overflow-y-auto">
                <EditProfileForm onSuccess={() => setIsEditProfileOpen(false)} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Certification Status */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Award className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-blue-900">Certification Status</h3>
                  <p className="text-blue-700">
                    {totalCertificationPoints} points • {approvedCertifications.length} verified certifications
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge className={`text-lg px-4 py-2 ${getCertificationLevelColor(currentUser?.certificationLevel || 'bronze')}`}>
                  {currentUser?.certificationLevel?.toUpperCase() || 'BRONZE'} LEVEL
                </Badge>
                <p className="text-sm text-blue-600 mt-1">
                  {certifications.length} total certifications
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certifications List */}
      <div className="mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Your Certifications
              </h3>
              {certifications.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshCertifications}
                  disabled={loadingCertifications}
                >
                  {loadingCertifications ? 'Refreshing...' : 'Refresh'}
                </Button>
              )}
            </div>
            
            {loadingCertifications ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading certifications...</p>
              </div>
            ) : certifications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No certifications uploaded yet</p>
                <Button asChild variant="outline" className="mt-4">
                  <Link to="/certifications/upload">Upload Your First Certification</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {certifications.map((cert) => (
                  <div key={cert._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{cert.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {cert.issuingOrganization} • {cert.category} • {cert.points} points
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Issued: {new Date(cert.issueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(cert.status)}>
                        {cert.status.toUpperCase()}
                      </Badge>
                      {cert.status === 'approved' && (
                        <div className="text-green-600">
                          <Award className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-yellow-50">
          <CardContent className="pt-6">
            <CardTitle className="text-xl mb-2 flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Pending Requests
            </CardTitle>
            <div className="text-4xl font-bold text-yellow-700">{pendingBookings.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="pt-6">
            <CardTitle className="text-xl mb-2 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Active Jobs
            </CardTitle>
            <div className="text-4xl font-bold text-green-700">{acceptedBookings.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50">
          <CardContent className="pt-6">
            <CardTitle className="text-xl mb-2 flex items-center gap-2">
              <Star className="h-5 w-5 text-blue-600" />
              Completed Jobs
            </CardTitle>
            <div className="text-4xl font-bold text-blue-700">{completedBookings.length}</div>
          </CardContent>
        </Card>
      </div>
      
      <BookingList />
    </div>
  );
};

export default ProviderDashboard;
