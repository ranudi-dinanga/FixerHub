import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Star, Award, Image as ImageIcon } from 'lucide-react';
import EditProfileForm from '@/components/profile/EditProfileForm';

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState<boolean>(false);

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p>Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={currentUser.image} />
              <AvatarFallback>
                <User className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{currentUser.name}</CardTitle>
              <p className="text-muted-foreground capitalize">{currentUser.role.replace('_', ' ')}</p>
              {currentUser.role === 'service_provider' && currentUser.serviceCategory && (
                <p className="text-sm text-blue-600">{currentUser.serviceCategory}</p>
              )}
              {currentUser.rating && (
                <p className="text-sm text-yellow-600 flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {currentUser.rating}/5 ({currentUser.totalRatings} reviews)
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div className="space-y-6">
              {/* Display Profile Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">Name</h3>
                  <p className="text-lg">{currentUser.name}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">Email</h3>
                  <p className="text-lg">{currentUser.email}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">Location</h3>
                  <p className="text-lg">{currentUser.location || 'Not specified'}</p>
                </div>
                {currentUser.role === 'service_provider' && currentUser.hourlyRate && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground">Hourly Rate</h3>
                    <p className="text-lg">LKR {currentUser.hourlyRate}</p>
                  </div>
                )}
              </div>

              {currentUser.description && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">
                    {currentUser.role === 'service_provider' ? 'Service Description' : 'About Me'}
                  </h3>
                  <p className="text-lg">{currentUser.description}</p>
                </div>
              )}

              {/* Points and Achievements Section */}
              {currentUser.role === 'service_provider' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Points & Achievements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-sm text-blue-800 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Profile Picture
                      </h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {currentUser.profilePicturePoints || 0}
                      </p>
                      <p className="text-xs text-blue-600">
                        {currentUser.image ? 'Profile picture uploaded (+25 points)' : 'No profile picture yet'}
                      </p>
                    </div>
                    <div className="space-y-2 p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-sm text-green-800 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Certification
                      </h4>
                      <p className="text-2xl font-bold text-green-600">
                        {currentUser.certificationPoints || 0}
                      </p>
                      <p className="text-xs text-green-600">
                        Level: {currentUser.certificationLevel || 'Bronze'}
                      </p>
                    </div>
                    <div className="space-y-2 p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-sm text-purple-800 flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Total Points
                      </h4>
                      <p className="text-2xl font-bold text-purple-600">
                        {(currentUser.profilePicturePoints || 0) + (currentUser.certificationPoints || 0)}
                      </p>
                      <p className="text-xs text-purple-600">
                        Combined score
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentUser.role === 'service_provider' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Banking Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">Bank Name</h4>
                      <p>{currentUser.bankName || 'Not specified'}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">Account Number</h4>
                      <p>{currentUser.accountNumber || 'Not specified'}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">Branch Name</h4>
                      <p>{currentUser.branchName || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <EditProfileForm 
                onSuccess={() => {
                  setIsEditing(false);
                }} 
              />
              <div className="pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile; 