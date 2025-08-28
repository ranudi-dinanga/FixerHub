import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReportIssue from '@/components/disputes/ReportIssue';
import ViewDisputes from '@/components/admin/ViewDisputes';
import { useAuth } from '@/context/AuthContext';

const TestDisputes: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('report');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Dispute System Test</h1>
          <p className="text-lg text-gray-600">
            Test the dispute management system for both users and admins
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="report">Report Issue (Users)</TabsTrigger>
            <TabsTrigger value="admin" disabled={currentUser?.role !== 'admin'}>
              Admin View (Admin Only)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="report" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Report an Issue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  This form allows users to report issues related to their bookings. 
                  You can select a booking, describe the issue, and upload evidence.
                </p>
                <ReportIssue />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin" className="space-y-6">
            {currentUser?.role === 'admin' ? (
              <ViewDisputes />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Admin Access Required</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    You need admin privileges to view the dispute management dashboard.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Test the Dispute System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">For Regular Users:</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Go to the "Report Issue" tab</li>
                <li>Select a booking from the dropdown</li>
                <li>Fill in the issue details (title, description, category)</li>
                <li>Set priority level</li>
                <li>Upload evidence files if needed</li>
                <li>Submit the report</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">For Admins:</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Switch to the "Admin View" tab</li>
                <li>View all reported disputes</li>
                <li>Use filters to find specific disputes</li>
                <li>Click "View Details" to see full information</li>
                <li>Update dispute status or add admin notes</li>
                <li>Resolve disputes with appropriate outcomes</li>
                <li>Send messages to users involved</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Features Tested:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>✅ Dispute creation with file uploads</li>
                <li>✅ Admin dispute management dashboard</li>
                <li>✅ Status updates and resolution</li>
                <li>✅ Communication between admins and users</li>
                <li>✅ Evidence file management</li>
                <li>✅ Priority and category classification</li>
                <li>✅ Search and filtering capabilities</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestDisputes;
