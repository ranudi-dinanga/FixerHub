import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, FileText, Upload, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useBooking } from '@/context/BookingContext';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ReportIssueProps {
  onClose?: () => void;
  selectedBookingId?: string;
}

const ReportIssue: React.FC<ReportIssueProps> = ({ onClose, selectedBookingId }) => {
  const { currentUser } = useAuth();
  const { getUserBookings } = useBooking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<string>(selectedBookingId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const bookings = getUserBookings().filter(booking => 
    booking.status === 'completed' || booking.status === 'accepted'
  );

  const categories = [
    { value: 'payment_issue', label: 'Payment Issue', description: 'Problems with payment processing or refunds' },
    { value: 'service_quality', label: 'Service Quality', description: 'Poor work quality or incomplete service' },
    { value: 'no_show', label: 'No Show', description: 'Service provider or seeker did not show up' },
    { value: 'cancellation', label: 'Cancellation', description: 'Last-minute cancellations or rescheduling issues' },
    { value: 'communication', label: 'Communication', description: 'Poor communication or unresponsiveness' },
    { value: 'safety_concern', label: 'Safety Concern', description: 'Safety issues during service delivery' },
    { value: 'fraud', label: 'Fraud', description: 'Suspicious or fraudulent behavior' },
    { value: 'other', label: 'Other', description: 'Other issues not covered above' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    if (selectedBookingId) {
      setSelectedBooking(selectedBookingId);
    }
  }, [selectedBookingId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedBooking) {
      newErrors.booking = 'Please select a booking';
    }
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!category) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];

      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }

      if (!allowedTypes.includes(file.type)) {
        toast.error(`File ${file.name} is not a supported type.`);
        return false;
      }

      return true;
    });

    setEvidenceFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create dispute
      const disputeData = {
        title: title.trim(),
        description: description.trim(),
        bookingId: selectedBooking,
        category,
        priority
      };

      const response = await fetch('http://localhost:5001/api/disputes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(disputeData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create dispute');
      }

      const { dispute } = await response.json();

      // Upload evidence files if any
      if (evidenceFiles.length > 0) {
        for (const file of evidenceFiles) {
          const formData = new FormData();
          formData.append('evidence', file);

          const evidenceResponse = await fetch(`http://localhost:5001/api/disputes/${dispute._id}/evidence`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: formData
          });

          if (!evidenceResponse.ok) {
            console.warn(`Failed to upload evidence file: ${file.name}`);
          }
        }
      }

      toast.success('Issue reported successfully! Our admin team will review it shortly.');
      
      // Reset form
      setSelectedBooking('');
      setTitle('');
      setDescription('');
      setCategory('');
      setPriority('medium');
      setEvidenceFiles([]);
      setErrors({});

      if (onClose) {
        onClose();
      }

    } catch (error) {
      console.error('Error reporting issue:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to report issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedBookingDetails = () => {
    return bookings.find(booking => booking._id === selectedBooking);
  };

  const selectedBookingDetails = getSelectedBookingDetails();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Report an Issue</h1>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        )}
      </div>

      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Please provide detailed information about the issue you're experiencing. 
          Our admin team will review your report and take appropriate action.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Booking Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Booking</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedBooking} onValueChange={setSelectedBooking}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a booking to report an issue about" />
              </SelectTrigger>
              <SelectContent>
                {bookings.map((booking) => (
                  <SelectItem key={booking._id} value={booking._id}>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {typeof booking.serviceProvider === 'object' 
                          ? booking.serviceProvider.name 
                          : 'Unknown Provider'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {booking.date} - {booking.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.booking && (
              <p className="text-red-500 text-sm mt-1">{errors.booking}</p>
            )}
          </CardContent>
        </Card>

        {/* Selected Booking Details */}
        {selectedBookingDetails && (
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Service Provider:</span>
                  <p className="text-gray-600">
                    {typeof selectedBookingDetails.serviceProvider === 'object' 
                      ? selectedBookingDetails.serviceProvider.name 
                      : 'Unknown'}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Date & Time:</span>
                  <p className="text-gray-600">
                    {selectedBookingDetails.date} at {selectedBookingDetails.time}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Service:</span>
                  <p className="text-gray-600">{selectedBookingDetails.description}</p>
                </div>
                <div>
                  <span className="font-medium">Amount:</span>
                  <p className="text-gray-600">LKR {selectedBookingDetails.price}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Issue Details */}
        <Card>
          <CardHeader>
            <CardTitle>Issue Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Issue Title *
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief description of the issue"
                maxLength={200}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Detailed Description *
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide a detailed description of what happened, when it occurred, and any relevant context..."
                rows={4}
                maxLength={2000}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Category *
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{cat.label}</span>
                          <span className="text-xs text-gray-500">{cat.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                )}
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority Level
                </label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((pri) => (
                      <SelectItem key={pri.value} value={pri.value}>
                        <Badge className={pri.color}>{pri.label}</Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evidence Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Evidence & Supporting Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="evidence" className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Evidence Files
                </label>
                <Input
                  id="evidence"
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: Images, PDFs, Word documents, text files. Max size: 10MB per file.
                </p>
              </div>

              {evidenceFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
                  {evidenceFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          {onClose && (
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 mr-2" />
                Report Issue
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReportIssue;
