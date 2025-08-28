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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import { 
  Download, 
  AlertTriangle, 
  Eye, 
  Filter, 
  Search,
  CreditCard,
  Building,
  Calendar,
  DollarSign,
  FileText,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Payment {
  _id: string;
  booking: {
    _id: string;
    description: string;
    date: string;
    time: string;
  };
  payer: {
    _id: string;
    name: string;
    email: string;
  };
  payee: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  currency: string;
  paymentMethod: 'stripe' | 'bank_transfer' | 'cash' | 'refund';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  createdAt: string;
  paidDate?: string;
  invoice?: {
    invoiceNumber: string;
  };
}

interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  stats: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
}

const PaymentHistory = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
    search: ''
  });
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDisputeDialogOpen, setIsDisputeDialogOpen] = useState(false);
  const [disputeForm, setDisputeForm] = useState({
    issue: '',
    description: '',
    category: ''
  });

  const itemsPerPage = 10;

  useEffect(() => {
    if (currentUser?._id) {
      fetchPaymentHistory();
      fetchPaymentStats();
    }
  }, [currentUser?._id, currentPage, filters]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });

      if (filters.status) queryParams.append('status', filters.status);
      if (filters.paymentMethod) queryParams.append('paymentMethod', filters.paymentMethod);

      const response = await fetch(
        `http://localhost:5001/api/payments/history/${currentUser?._id}?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch payment history');

      const data = await response.json();
      setPayments(data.payments);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      toast.error('Failed to fetch payment history');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/payments/stats/${currentUser?._id}?period=month`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch payment stats');

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    }
  };

  const downloadInvoice = async (paymentId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/payments/invoice/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to generate invoice');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${paymentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  const openDisputeDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDisputeDialogOpen(true);
  };

  const submitDispute = async () => {
    if (!selectedPayment || !disputeForm.issue || !disputeForm.description || !disputeForm.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/disputes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          paymentId: selectedPayment._id,
          ...disputeForm
        })
      });

      if (!response.ok) throw new Error('Failed to submit dispute');

      toast.success('Dispute submitted successfully');
      setIsDisputeDialogOpen(false);
      setDisputeForm({ issue: '', description: '', category: '' });
      setSelectedPayment(null);
      
      // Refresh payment history
      fetchPaymentHistory();
    } catch (error) {
      console.error('Error submitting dispute:', error);
      toast.error('Failed to submit dispute');
    }
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'processing':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      case 'refunded':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPaymentMethodIcon = (method: Payment['paymentMethod']) => {
    switch (method) {
      case 'stripe':
        return <CreditCard className="h-4 w-4" />;
      case 'bank_transfer':
        return <Building className="h-4 w-4" />;
      case 'cash':
        return <DollarSign className="h-4 w-4" />;
      case 'refund':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        payment.booking.description.toLowerCase().includes(searchTerm) ||
        payment.payer.name.toLowerCase().includes(searchTerm) ||
        payment.payee.name.toLowerCase().includes(searchTerm) ||
        payment.amount.toString().includes(searchTerm)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-muted-foreground">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Payment History</h2>
        <Button onClick={() => navigate('/disputes')} variant="outline">
          <AlertTriangle className="h-4 w-4 mr-2" />
          View Disputes
        </Button>
      </div>

      {/* Payment Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPayments}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs. {stats.totalAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Payments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.stats.find(s => s._id === 'completed')?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search payments..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <Select
                value={filters.paymentMethod}
                onValueChange={(value) => setFilters(prev => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All methods</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <Button
                variant="outline"
                onClick={() => setFilters({ status: '', paymentMethod: '', search: '' })}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No payments found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <p className="font-medium">{payment.booking.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {payment.payer._id === currentUser?._id ? 'To: ' : 'From: '}
                          {payment.payer._id === currentUser?._id 
                            ? payment.payee.name 
                            : payment.payer.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                    <div className="font-medium">
                        {payment.currency === 'LKR' ? `Rs. ${payment.amount.toFixed(2)}` : `$${payment.amount.toFixed(2)}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(payment.paymentMethod)}
                        <span className="capitalize">
                          {payment.paymentMethod.replace('_', ' ')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadInvoice(payment._id)}
                          disabled={!payment.invoice?.invoiceNumber}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Invoice
                        </Button>
                        {payment.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDisputeDialog(payment)}
                          >
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Dispute
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

      {/* Dispute Dialog */}
      <Dialog open={isDisputeDialogOpen} onOpenChange={setIsDisputeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Report Payment Issue</DialogTitle>
            <DialogDescription>
              Please provide details about the issue with this payment. Our team will review and take appropriate action.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Issue Type</label>
              <Select
                value={disputeForm.category}
                onValueChange={(value) => setDisputeForm(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment_not_received">Payment Not Received</SelectItem>
                  <SelectItem value="service_not_rendered">Service Not Rendered</SelectItem>
                  <SelectItem value="quality_issue">Quality Issue</SelectItem>
                  <SelectItem value="fraud">Fraud</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Issue Summary</label>
              <Input
                placeholder="Brief description of the issue"
                value={disputeForm.issue}
                onChange={(e) => setDisputeForm(prev => ({ ...prev, issue: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Detailed Description</label>
              <Textarea
                placeholder="Provide detailed information about the issue..."
                value={disputeForm.description}
                onChange={(e) => setDisputeForm(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDisputeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitDispute} disabled={!disputeForm.issue || !disputeForm.description || !disputeForm.category}>
              Submit Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentHistory;
