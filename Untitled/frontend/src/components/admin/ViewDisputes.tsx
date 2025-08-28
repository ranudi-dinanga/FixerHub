import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertCircle, 
  FileText, 
  MessageSquare, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Filter,
  Search,
  BarChart3,
  Download,
  Send,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Dispute {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  reportedBy: {
    _id: string;
    name: string;
    email: string;
  };
  serviceProvider: {
    _id: string;
    name: string;
    email: string;
  };
  serviceSeeker: {
    _id: string;
    name: string;
    email: string;
  };
  booking: {
    _id: string;
    date: string;
    time: string;
    description: string;
    price: number;
  };
  evidence: Array<{
    fileName: string;
    filePath: string;
    fileType: string;
  }>;
  messages: Array<{
    sender: {
      _id: string;
      name: string;
    };
    message: string;
    timestamp: string;
    isAdmin: boolean;
  }>;
  adminNotes: Array<{
    note: string;
    adminId: {
      _id: string;
      name: string;
    };
    timestamp: string;
  }>;
  assignedAdmin?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface DisputeStats {
  total: number;
  open: number;
  underReview: number;
  resolved: number;
  byStatus: Array<{ _id: string; count: number }>;
  byPriority: Array<{ _id: string; count: number }>;
  byCategory: Array<{ _id: string; count: number }>;
}

const ViewDisputes: React.FC = () => {
  const { currentUser } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [stats, setStats] = useState<DisputeStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  // Form states
  const [adminNote, setAdminNote] = useState('');
  const [resolution, setResolution] = useState('');
  const [outcome, setOutcome] = useState('');
  const [outcomeAmount, setOutcomeAmount] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchDisputes();
      fetchStats();
    }
  }, [currentUser, filters, pagination.page]);

  const fetchDisputes = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      });

      const response = await fetch(`http://localhost:5001/api/disputes/admin?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch disputes');
      }

      const data = await response.json();
      setDisputes(data.disputes);
      setPagination(prev => ({
        ...prev,
        total: data.total,
        totalPages: data.totalPages
      }));
    } catch (error) {
      console.error('Error fetching disputes:', error);
      toast.error('Failed to fetch disputes');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/disputes/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatusUpdate = async (disputeId: string, status: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/disputes/${disputeId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ 
          status,
          adminNote: adminNote.trim() ? adminNote : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast.success('Dispute status updated successfully');
      setAdminNote('');
      fetchDisputes();
      fetchStats();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleResolve = async () => {
    if (!selectedDispute || !resolution.trim()) {
      toast.error('Please provide a resolution');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/disputes/${selectedDispute._id}/resolve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          resolution: resolution.trim(),
          outcome: outcome || undefined,
          outcomeAmount: outcomeAmount ? parseFloat(outcomeAmount) : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to resolve dispute');
      }

      toast.success('Dispute resolved successfully');
      setIsResolveOpen(false);
      setResolution('');
      setOutcome('');
      setOutcomeAmount('');
      fetchDisputes();
      fetchStats();
    } catch (error) {
      console.error('Error resolving dispute:', error);
      toast.error('Failed to resolve dispute');
    }
  };

  const handleSendMessage = async () => {
    if (!selectedDispute || !message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/disputes/${selectedDispute._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ message: message.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      toast.success('Message sent successfully');
      setMessage('');
      fetchDisputes(); // Refresh to get updated messages
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      payment_issue: 'Payment Issue',
      service_quality: 'Service Quality',
      no_show: 'No Show',
      cancellation: 'Cancellation',
      communication: 'Communication',
      safety_concern: 'Safety Concern',
      fraud: 'Fraud',
      other: 'Other'
    };
    return labels[category as keyof typeof labels] || category;
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You need admin privileges to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dispute Management</h1>
        <Button onClick={() => fetchDisputes()} disabled={isLoading}>
          {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          Refresh
        </Button>
      </div>

      {/* Statistics Dashboard */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Disputes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Under Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.underReview}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="payment_issue">Payment Issue</SelectItem>
                  <SelectItem value="service_quality">Service Quality</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                  <SelectItem value="cancellation">Cancellation</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="safety_concern">Safety Concern</SelectItem>
                  <SelectItem value="fraud">Fraud</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search disputes..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => setFilters({ status: '', priority: '', category: '', search: '' })}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disputes List */}
      <Card>
        <CardHeader>
          <CardTitle>Disputes ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center p-8">
              <LoadingSpinner size="lg" />
              <p className="text-gray-500 mt-2">Loading disputes...</p>
            </div>
          ) : disputes.length === 0 ? (
            <div className="text-center p-8">
              <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No disputes found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {disputes.map((dispute) => (
                <div key={dispute._id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{dispute.title}</h3>
                        <Badge className={getPriorityColor(dispute.priority)}>
                          {dispute.priority.charAt(0).toUpperCase() + dispute.priority.slice(1)}
                        </Badge>
                        <Badge className={getStatusColor(dispute.status)}>
                          {dispute.status.replace('_', ' ').charAt(0).toUpperCase() + dispute.status.replace('_', ' ').slice(1)}
                        </Badge>
                        <Badge variant="outline">
                          {getCategoryLabel(dispute.category)}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">{dispute.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Reported by:</span>
                          <p>{dispute.reportedBy.name}</p>
                        </div>
                        <div>
                          <span className="font-medium">Service:</span>
                          <p>{dispute.booking.description}</p>
                        </div>
                        <div>
                          <span className="font-medium">Date:</span>
                          <p>{dispute.booking.date}</p>
                        </div>
                        <div>
                          <span className="font-medium">Amount:</span>
                          <p>LKR {dispute.booking.price}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedDispute(dispute);
                          setIsDetailOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      
                      {dispute.status === 'open' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDispute(dispute);
                            setIsResolveOpen(true);
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Resolve
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDispute(dispute);
                          setIsMessageOpen(true);
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={pagination.page * pagination.limit >= pagination.total}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Dispute Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dispute Details</DialogTitle>
          </DialogHeader>
          {selectedDispute && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700">Title</h4>
                  <p className="text-gray-900">{selectedDispute.title}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Category</h4>
                  <Badge>{getCategoryLabel(selectedDispute.category)}</Badge>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Priority</h4>
                  <Badge className={getPriorityColor(selectedDispute.priority)}>
                    {selectedDispute.priority.charAt(0).toUpperCase() + selectedDispute.priority.slice(1)}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Status</h4>
                  <Badge className={getStatusColor(selectedDispute.status)}>
                    {selectedDispute.status.replace('_', ' ').charAt(0).toUpperCase() + selectedDispute.status.replace('_', ' ').slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                <p className="text-gray-900 bg-gray-50 p-3 rounded">{selectedDispute.description}</p>
              </div>

              {/* Booking Details */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Booking Details</h4>
                <div className="bg-gray-50 p-3 rounded space-y-2">
                  <p><span className="font-medium">Service:</span> {selectedDispute.booking.description}</p>
                  <p><span className="font-medium">Date:</span> {selectedDispute.booking.date} at {selectedDispute.booking.time}</p>
                  <p><span className="font-medium">Amount:</span> LKR {selectedDispute.booking.price}</p>
                </div>
              </div>

              {/* Users Involved */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Users Involved</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">Service Provider</p>
                    <p className="text-sm text-gray-600">{selectedDispute.serviceProvider.name}</p>
                    <p className="text-sm text-gray-500">{selectedDispute.serviceProvider.email}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">Service Seeker</p>
                    <p className="text-sm text-gray-600">{selectedDispute.serviceSeeker.name}</p>
                    <p className="text-sm text-gray-500">{selectedDispute.serviceSeeker.email}</p>
                  </div>
                </div>
              </div>

              {/* Evidence */}
              {selectedDispute.evidence.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Evidence Files</h4>
                  <div className="space-y-2">
                    {selectedDispute.evidence.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{file.fileName}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {selectedDispute.messages.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Communication History</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedDispute.messages.map((msg, index) => (
                      <div key={index} className={`p-3 rounded ${msg.isAdmin ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{msg.sender.name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(msg.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {selectedDispute.adminNotes.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Admin Notes</h4>
                  <div className="space-y-2">
                    {selectedDispute.adminNotes.map((note, index) => (
                      <div key={index} className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{note.adminId.name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(note.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{note.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Resolve Dispute Dialog */}
      <Dialog open={isResolveOpen} onOpenChange={setIsResolveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resolution Description *
              </label>
              <Textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Describe how this dispute was resolved..."
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Outcome
                </label>
                <Select value={outcome} onValueChange={setOutcome}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="refund">Full Refund</SelectItem>
                    <SelectItem value="partial_refund">Partial Refund</SelectItem>
                    <SelectItem value="service_redo">Service Redo</SelectItem>
                    <SelectItem value="warning">Warning Issued</SelectItem>
                    <SelectItem value="suspension">Account Suspension</SelectItem>
                    <SelectItem value="no_action">No Action Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {outcome && (outcome === 'refund' || outcome === 'partial_refund') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Refund Amount (LKR)
                  </label>
                  <Input
                    type="number"
                    value={outcomeAmount}
                    onChange={(e) => setOutcomeAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResolveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={!resolution.trim()}>
              Resolve Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message to the users involved in this dispute..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMessageOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={!message.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewDisputes;
