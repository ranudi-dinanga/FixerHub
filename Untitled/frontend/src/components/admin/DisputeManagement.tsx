import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import { 
  AlertTriangle, 
  Eye, 
  Filter, 
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  FileText,
  TrendingUp,
  Ban,
  Warning
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Dispute {
  _id: string;
  payment: {
    _id: string;
    amount: number;
    paymentMethod: string;
    status: string;
  };
  booking: {
    _id: string;
    description: string;
    date: string;
    time: string;
  };
  reportedBy: {
    _id: string;
    name: string;
    email: string;
  };
  issue: string;
  description: string;
  category: string;
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  evidence: Array<{
    filePath: string;
    fileName: string;
    fileType: string;
  }>;
  adminNotes: Array<{
    adminId: string;
    note: string;
    createdAt: string;
  }>;
  penalty?: {
    amount: number;
    reason: string;
    type: 'warning' | 'fine' | 'suspension' | 'ban';
    appliedBy: string;
    appliedAt: string;
    dueDate: string;
    status: 'pending' | 'paid' | 'overdue' | 'waived';
  };
  resolution?: {
    description: string;
    action: string;
    outcome: string;
    resolvedBy: string;
    resolvedAt: string;
  };
  timeline: Array<{
    action: string;
    description: string;
    performedBy: string;
    timestamp: string;
  }>;
  createdAt: string;
}

interface DisputeStats {
  totalDisputes: number;
  openDisputes: number;
  stats: Array<{
    _id: string;
    count: number;
  }>;
  categoryStats: Array<{
    _id: string;
    count: number;
  }>;
  priorityStats: Array<{
    _id: string;
    count: number;
  }>;
}

const DisputeManagement = () => {
  const { currentUser } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [stats, setStats] = useState<DisputeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    search: ''
  });
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isPenaltyDialogOpen, setIsPenaltyDialogOpen] = useState(false);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [penaltyForm, setPenaltyForm] = useState({
    amount: '',
    reason: '',
    type: '',
    dueDate: ''
  });
  const [resolveForm, setResolveForm] = useState({
    description: '',
    action: '',
    outcome: ''
  });
  const [adminNote, setAdminNote] = useState('');

  const itemsPerPage = 10;

  useEffect(() => {
    if (currentUser?._id && currentUser?.role === 'admin') {
      fetchDisputes();
      fetchDisputeStats();
    }
  }, [currentUser?._id, currentPage, filters]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });

      if (filters.status) queryParams.append('status', filters.status);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.category) queryParams.append('category', filters.category);

      const response = await fetch(
        `http://localhost:5001/api/disputes/all?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch disputes');

      const data = await response.json();
      setDisputes(data.disputes);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching disputes:', error);
      toast.error('Failed to fetch disputes');
    } finally {
      setLoading(false);
    }
  };

  const fetchDisputeStats = async () => {
    try {
      const response = await fetch(
        'http://localhost:5001/api/disputes/stats?period=month',
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch dispute stats');

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dispute stats:', error);
    }
  };

  const addAdminNote = async (disputeId: string) => {
    if (!adminNote.trim()) {
      toast.error('Please enter a note');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/disputes/${disputeId}/admin-note`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ note: adminNote })
      });

      if (!response.ok) throw new Error('Failed to add admin note');

      toast.success('Admin note added successfully');
      setAdminNote('');
      fetchDisputes(); // Refresh disputes
    } catch (error) {
      console.error('Error adding admin note:', error);
      toast.error('Failed to add admin note');
    }
  };

  const applyPenalty = async () => {
    if (!selectedDispute || !penaltyForm.amount || !penaltyForm.reason || !penaltyForm.type) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/disputes/${selectedDispute._id}/penalty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(penaltyForm)
      });

      if (!response.ok) throw new Error('Failed to apply penalty');

      toast.success('Penalty applied successfully');
      setIsPenaltyDialogOpen(false);
      setPenaltyForm({ amount: '', reason: '', type: '', dueDate: '' });
      fetchDisputes(); // Refresh disputes
    } catch (error) {
      console.error('Error applying penalty:', error);
      toast.error('Failed to apply penalty');
    }
  };

  const resolveDispute = async () => {
    if (!selectedDispute || !resolveForm.description || !resolveForm.action || !resolveForm.outcome) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/disputes/${selectedDispute._id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(resolveForm)
      });

      if (!response.ok) throw new Error('Failed to resolve dispute');

      toast.success('Dispute resolved successfully');
      setIsResolveDialogOpen(false);
      setResolveForm({ description: '', action: '', outcome: '' });
      fetchDisputes(); // Refresh disputes
    } catch (error) {
      console.error('Error resolving dispute:', error);
      toast.error('Failed to resolve dispute');
    }
  };

  const closeDispute = async (disputeId: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/disputes/${disputeId}/close`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) throw new Error('Failed to close dispute');

      toast.success('Dispute closed successfully');
      fetchDisputes(); // Refresh disputes
    } catch (error) {
      console.error('Error closing dispute:', error);
      toast.error('Failed to close dispute');
    }
  };

  const getStatusColor = (status: Dispute['status']) => {
    switch (status) {
      case 'open':
        return 'bg-red-500';
      case 'under_review':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-green-500';
      case 'closed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: Dispute['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-600';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityIcon = (priority: Dispute['priority']) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4" />;
      case 'high':
        return <AlertCircle className="h-4 w-4" />;
      case 'medium':
        return <Clock className="h-4 w-4" />;
      case 'low':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const filteredDisputes = disputes.filter(dispute => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        dispute.issue.toLowerCase().includes(searchTerm) ||
        dispute.description.toLowerCase().includes(searchTerm) ||
        dispute.reportedBy.name.toLowerCase().includes(searchTerm) ||
        dispute.booking.description.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

  if (currentUser?.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-muted-foreground">Loading disputes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Dispute Management</h2>
      </div>

      {/* Dispute Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Disputes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDisputes}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Disputes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.openDisputes}</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.priorityStats.find(s => s._id === 'high')?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">High priority</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent</CardTitle>
              <Ban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.priorityStats.find(s => s._id === 'urgent')?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">Urgent priority</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search disputes..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={filters.priority}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  <SelectItem value="payment_not_received">Payment Not Received</SelectItem>
                  <SelectItem value="service_not_rendered">Service Not Rendered</SelectItem>
                  <SelectItem value="quality_issue">Quality Issue</SelectItem>
                  <SelectItem value="fraud">Fraud</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
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

      {/* Disputes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Disputes</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDisputes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No disputes found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Priority</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDisputes.map((dispute) => (
                  <TableRow key={dispute._id}>
                    <TableCell>
                      <Badge className={getPriorityColor(dispute.priority)}>
                        <div className="flex items-center gap-1">
                          {getPriorityIcon(dispute.priority)}
                          {dispute.priority.charAt(0).toUpperCase() + dispute.priority.slice(1)}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <p className="font-medium">{dispute.issue}</p>
                        <p className="text-sm text-muted-foreground">
                          {dispute.category.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{dispute.reportedBy.name}</p>
                        <p className="text-sm text-muted-foreground">{dispute.reportedBy.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        ${dispute.payment.amount.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(dispute.status)}>
                        {dispute.status.replace(/_/g, ' ').charAt(0).toUpperCase() + 
                         dispute.status.replace(/_/g, ' ').slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(dispute.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedDispute(dispute);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {dispute.status === 'open' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedDispute(dispute);
                              setIsPenaltyDialogOpen(true);
                            }}
                          >
                            <Warning className="h-4 w-4 mr-1" />
                            Penalty
                          </Button>
                        )}
                        {dispute.status === 'under_review' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedDispute(dispute);
                              setIsResolveDialogOpen(true);
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolve
                          </Button>
                        )}
                        {dispute.status === 'resolved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => closeDispute(dispute._id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Close
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="px-4 py-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* View Dispute Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Dispute Details</DialogTitle>
          </DialogHeader>
          {selectedDispute && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Issue</label>
                  <p className="text-sm">{selectedDispute.issue}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <p className="text-sm capitalize">{selectedDispute.category.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Badge className={getPriorityColor(selectedDispute.priority)}>
                    {selectedDispute.priority.charAt(0).toUpperCase() + selectedDispute.priority.slice(1)}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge className={getStatusColor(selectedDispute.status)}>
                    {selectedDispute.status.replace(/_/g, ' ').charAt(0).toUpperCase() + 
                     selectedDispute.status.replace(/_/g, ' ').slice(1)}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm">{selectedDispute.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Payment Details</label>
                <p className="text-sm">
                  Amount: ${selectedDispute.payment.amount.toFixed(2)} | 
                  Method: {selectedDispute.payment.paymentMethod} | 
                  Status: {selectedDispute.payment.status}
                </p>
              </div>
              {selectedDispute.evidence.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Evidence</label>
                  <div className="space-y-2">
                    {selectedDispute.evidence.map((evidence, index) => (
                      <div key={index} className="text-sm text-muted-foreground">
                        {evidence.fileName} ({evidence.fileType})
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedDispute.adminNotes.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Admin Notes</label>
                  <div className="space-y-2">
                    {selectedDispute.adminNotes.map((note, index) => (
                      <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                        {note.note}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Add Admin Note</label>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a note..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={() => addAdminNote(selectedDispute._id)}>
                    Add Note
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Apply Penalty Dialog */}
      <Dialog open={isPenaltyDialogOpen} onOpenChange={setIsPenaltyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Apply Penalty</DialogTitle>
            <DialogDescription>
              Apply a penalty to the user involved in this dispute.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Penalty Type</label>
              <Select
                value={penaltyForm.type}
                onValueChange={(value) => setPenaltyForm(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select penalty type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="fine">Fine</SelectItem>
                  <SelectItem value="suspension">Suspension</SelectItem>
                  <SelectItem value="ban">Ban</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (if applicable)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={penaltyForm.amount}
                onChange={(e) => setPenaltyForm(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <Textarea
                placeholder="Explain the reason for this penalty..."
                value={penaltyForm.reason}
                onChange={(e) => setPenaltyForm(prev => ({ ...prev, reason: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date</label>
              <Input
                type="date"
                value={penaltyForm.dueDate}
                onChange={(e) => setPenaltyForm(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPenaltyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={applyPenalty} disabled={!penaltyForm.type || !penaltyForm.reason}>
              Apply Penalty
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dispute Dialog */}
      <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <DialogDescription>
              Provide resolution details for this dispute.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Resolution Description</label>
              <Textarea
                placeholder="Describe how the dispute was resolved..."
                value={resolveForm.description}
                onChange={(e) => setResolveForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Action Taken</label>
              <Input
                placeholder="What action was taken?"
                value={resolveForm.action}
                onChange={(e) => setResolveForm(prev => ({ ...prev, action: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Outcome</label>
              <Select
                value={resolveForm.outcome}
                onValueChange={(value) => setResolveForm(prev => ({ ...prev, outcome: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="partial_refund">Partial Refund</SelectItem>
                  <SelectItem value="service_redone">Service Redone</SelectItem>
                  <SelectItem value="penalty_applied">Penalty Applied</SelectItem>
                  <SelectItem value="dispute_dismissed">Dispute Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResolveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={resolveDispute} disabled={!resolveForm.description || !resolveForm.action || !resolveForm.outcome}>
              Resolve Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DisputeManagement;
