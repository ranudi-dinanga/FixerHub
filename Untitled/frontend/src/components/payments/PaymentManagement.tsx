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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  FileText,
  Calendar,
  User,
  AlertTriangle,
  ThumbsUp,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getFileUrl, isImageFile, isPdfFile } from '@/utils/fileHelpers';
import { Payment } from '@/types';

const PaymentManagement = () => {
  const { currentUser } = useAuth();
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [completedPayments, setCompletedPayments] = useState<Payment[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  
  // Dialog states
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [isAcknowledgeDialogOpen, setIsAcknowledgeDialogOpen] = useState(false);
  const [isDisputeDialogOpen, setIsDisputeDialogOpen] = useState(false);
  
  // Form states
  const [confirmationNotes, setConfirmationNotes] = useState('');
  const [acknowledgmentNote, setAcknowledgmentNote] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [disputeCategory, setDisputeCategory] = useState('');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'all'>('pending');

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [allPayments, statusFilter, searchTerm, activeTab]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const [pendingResponse, allResponse] = await Promise.all([
        fetch('http://localhost:5001/api/payments/pending', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }),
        fetch('http://localhost:5001/api/payments/received', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        })
      ]);

      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingPayments(pendingData.payments || []);
      }

      if (allResponse.ok) {
        const allData = await allResponse.json();
        const payments = allData.payments || [];
        setAllPayments(payments);
        setCompletedPayments(payments.filter(p => p.status === 'confirmed'));
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let payments = [];
    
    switch (activeTab) {
      case 'pending':
        payments = pendingPayments;
        break;
      case 'completed':
        payments = completedPayments;
        break;
      case 'all':
        payments = allPayments;
        break;
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      payments = payments.filter(p => p.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      payments = payments.filter(p => 
        p.payer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.booking.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.payer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPayments(payments);
  };

  const handleConfirmPayment = async (confirmed: boolean) => {
    if (!selectedPayment) return;

    try {
      const response = await fetch('http://localhost:5001/api/payments/confirm-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          paymentId: selectedPayment._id,
          confirmed,
          notes: confirmationNotes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to confirm payment');
      }

      toast.success(confirmed ? 'Payment confirmed successfully!' : 'Payment rejected');
      resetDialogStates();
      fetchPayments();
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Failed to process payment confirmation');
    }
  };

  const handleAcknowledgePayment = async () => {
    if (!selectedPayment) return;

    try {
      const response = await fetch('http://localhost:5001/api/payments/acknowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          paymentId: selectedPayment._id,
          acknowledgmentNote
        })
      });

      if (!response.ok) {
        throw new Error('Failed to acknowledge payment');
      }

      toast.success('Payment acknowledged successfully!');
      resetDialogStates();
      fetchPayments();
    } catch (error) {
      console.error('Error acknowledging payment:', error);
      toast.error('Failed to acknowledge payment');
    }
  };

  const handleCreateDispute = async () => {
    if (!selectedPayment || !disputeReason || !disputeDescription) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/payments/create-dispute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          paymentId: selectedPayment._id,
          reason: disputeReason,
          description: disputeDescription,
          category: disputeCategory || 'payment_issue'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create dispute');
      }

      toast.success('Dispute created successfully!');
      resetDialogStates();
      fetchPayments();
    } catch (error) {
      console.error('Error creating dispute:', error);
      toast.error(error.message || 'Failed to create dispute');
    }
  };

  const resetDialogStates = () => {
    setIsConfirmDialogOpen(false);
    setIsReceiptDialogOpen(false);
    setIsAcknowledgeDialogOpen(false);
    setIsDisputeDialogOpen(false);
    setSelectedPayment(null);
    setConfirmationNotes('');
    setAcknowledgmentNote('');
    setDisputeReason('');
    setDisputeDescription('');
    setDisputeCategory('');
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'created':
        return 'bg-gray-500';
      case 'pending_customer_action':
        return 'bg-yellow-500';
      case 'pending_provider_confirmation':
        return 'bg-orange-500';
      case 'confirmed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-600';
      case 'refunded':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'created':
        return <Clock className="h-4 w-4" />;
      case 'pending_customer_action':
        return <User className="h-4 w-4" />;
      case 'pending_provider_confirmation':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'refunded':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'LKR' ? 'Rs. ' : '$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const openDialog = (payment: Payment, dialogType: string) => {
    setSelectedPayment(payment);
    switch (dialogType) {
      case 'confirm':
        setIsConfirmDialogOpen(true);
        break;
      case 'receipt':
        setIsReceiptDialogOpen(true);
        break;
      case 'acknowledge':
        setIsAcknowledgeDialogOpen(true);
        break;
      case 'dispute':
        setIsDisputeDialogOpen(true);
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payment Management</h2>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'pending' ? 'default' : 'outline'}
            onClick={() => setActiveTab('pending')}
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            Pending ({pendingPayments.length})
          </Button>
          <Button
            variant={activeTab === 'completed' ? 'default' : 'outline'}
            onClick={() => setActiveTab('completed')}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Completed ({completedPayments.length})
          </Button>
          <Button
            variant={activeTab === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveTab('all')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            All Payments ({allPayments.length})
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedPayments.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rs. {completedPayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedPayments.filter(p => 
                new Date(p.createdAt).getMonth() === new Date().getMonth()
              ).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <Input
            placeholder="Search by customer name or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending_provider_confirmation">Pending Confirmation</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === 'pending' && 'Pending Payments'}
            {activeTab === 'completed' && 'Completed Payments'}
            {activeTab === 'all' && 'All Payments'}
            {filteredPayments.length > 0 && ` (${filteredPayments.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              No payments found matching your criteria.
            </div>
          ) : (
            <Table>
              <TableCaption>
                Manage your payment receipts and disputes
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{payment.payer.name}</div>
                          <div className="text-sm text-gray-500">{payment.payer.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium truncate max-w-[200px]">
                          {payment.booking.description}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {payment.booking.date} at {payment.booking.time}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">
                        {formatCurrency(payment.amount, payment.currency)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(payment.status)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(payment.status)}
                        {payment.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        {/* View Receipt Button */}
                        {payment.bankTransferDetails && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog(payment, 'receipt')}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            Receipt
                          </Button>
                        )}
                        
                        {/* Confirm Payment Button - Only for pending */}
                        {payment.status === 'pending_provider_confirmation' && (
                          <Button
                            size="sm"
                            onClick={() => openDialog(payment, 'confirm')}
                            className="flex items-center gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Confirm
                          </Button>
                        )}
                        
                        {/* Acknowledge Button - Only for confirmed */}
                        {payment.status === 'confirmed' && !payment.adminNotes && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog(payment, 'acknowledge')}
                            className="flex items-center gap-1 text-green-600"
                          >
                            <ThumbsUp className="h-3 w-3" />
                            Acknowledge
                          </Button>
                        )}
                        
                        {/* Dispute Button - Only for confirmed payments */}
                        {payment.status === 'confirmed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog(payment, 'dispute')}
                            className="flex items-center gap-1 text-red-600"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            Dispute
                          </Button>
                        )}
                        
                        {/* Show acknowledgment status */}
                        {payment.adminNotes && (
                          <Badge variant="outline" className="text-green-600">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Acknowledged
                          </Badge>
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

      {/* Payment Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={() => resetDialogStates()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment Receipt</DialogTitle>
            <DialogDescription>
              Please verify that you have received the payment for this service.
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div><strong>Customer:</strong> {selectedPayment.payer.name}</div>
                <div><strong>Service:</strong> {selectedPayment.booking.description}</div>
                <div><strong>Amount:</strong> {formatCurrency(selectedPayment.amount, selectedPayment.currency)}</div>
                <div><strong>Payment Method:</strong> Bank Transfer</div>
              </div>
              <div>
                <label className="text-sm font-medium">Notes (optional)</label>
                <Textarea
                  value={confirmationNotes}
                  onChange={(e) => setConfirmationNotes(e.target.value)}
                  placeholder="Add any notes about this payment..."
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleConfirmPayment(false)}
              className="flex items-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              Reject Payment
            </Button>
            <Button
              onClick={() => handleConfirmPayment(true)}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Acknowledgment Dialog */}
      <Dialog open={isAcknowledgeDialogOpen} onOpenChange={() => resetDialogStates()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acknowledge Payment</DialogTitle>
            <DialogDescription>
              Acknowledge that you have received this payment and are satisfied with the transaction.
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg space-y-2">
                <div><strong>Customer:</strong> {selectedPayment.payer.name}</div>
                <div><strong>Service:</strong> {selectedPayment.booking.description}</div>
                <div><strong>Amount:</strong> {formatCurrency(selectedPayment.amount, selectedPayment.currency)}</div>
                <div><strong>Status:</strong> Confirmed</div>
              </div>
              <div>
                <label className="text-sm font-medium">Acknowledgment Note (optional)</label>
                <Textarea
                  value={acknowledgmentNote}
                  onChange={(e) => setAcknowledgmentNote(e.target.value)}
                  placeholder="Thank the customer or add any positive feedback..."
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => resetDialogStates()}>
              Cancel
            </Button>
            <Button
              onClick={handleAcknowledgePayment}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <ThumbsUp className="h-4 w-4" />
              Acknowledge Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispute Creation Dialog */}
      <Dialog open={isDisputeDialogOpen} onOpenChange={() => resetDialogStates()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Payment Dispute</DialogTitle>
            <DialogDescription>
              Report an issue with this payment. This will create a formal dispute that will be reviewed by our support team.
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg space-y-2">
                <div><strong>Customer:</strong> {selectedPayment.payer.name}</div>
                <div><strong>Service:</strong> {selectedPayment.booking.description}</div>
                <div><strong>Amount:</strong> {formatCurrency(selectedPayment.amount, selectedPayment.currency)}</div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Dispute Category</label>
                <Select value={disputeCategory} onValueChange={setDisputeCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select dispute category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payment_issue">Payment Issue</SelectItem>
                    <SelectItem value="service_quality">Service Quality</SelectItem>
                    <SelectItem value="incomplete_payment">Incomplete Payment</SelectItem>
                    <SelectItem value="unauthorized_charge">Unauthorized Charge</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Reason *</label>
                <Input
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Brief reason for the dispute"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Detailed Description *</label>
                <Textarea
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  placeholder="Provide a detailed explanation of the issue..."
                  className="mt-1 min-h-[100px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => resetDialogStates()}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateDispute}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
              disabled={!disputeReason || !disputeDescription}
            >
              <AlertTriangle className="h-4 w-4" />
              Create Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Viewer Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={() => resetDialogStates()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
          </DialogHeader>
          {selectedPayment && selectedPayment.bankTransferDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Transfer Details</h3>
                  <div className="space-y-1 text-sm">
                    <div><strong>Bank:</strong> {selectedPayment.bankTransferDetails.bankName}</div>
                    <div><strong>Account:</strong> {selectedPayment.bankTransferDetails.accountNumber}</div>
                    <div><strong>Branch:</strong> {selectedPayment.bankTransferDetails.branchName}</div>
                    <div><strong>Reference:</strong> {selectedPayment.bankTransferDetails.referenceNumber}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Payment Info</h3>
                  <div className="space-y-1 text-sm">
                    <div><strong>Amount:</strong> {formatCurrency(selectedPayment.amount, selectedPayment.currency)}</div>
                    <div><strong>Date:</strong> {new Date(selectedPayment.bankTransferDetails.transferDate).toLocaleDateString()}</div>
                    <div><strong>Customer:</strong> {selectedPayment.payer.name}</div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Receipt File</h3>
                <div className="border rounded-lg p-4 bg-gray-50">
                  {isImageFile(selectedPayment.bankTransferDetails.receiptPath) ? (
                    // Display image
                    <>
                      <img
                        src={getFileUrl(selectedPayment.bankTransferDetails.receiptPath)}
                        alt="Payment Receipt"
                        className="max-w-full h-auto max-h-96 object-contain mx-auto"
                        onError={(e) => {
                          console.error('Failed to load receipt image:', getFileUrl(selectedPayment.bankTransferDetails.receiptPath));
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling!.style.display = 'block';
                        }}
                      />
                      <div className="text-center text-gray-500 hidden">
                        <div className="p-4">
                          <p className="mb-2">Receipt image could not be loaded</p>
                          <p className="text-sm">Path: {selectedPayment.bankTransferDetails.receiptPath}</p>
                          <a 
                            href={getFileUrl(selectedPayment.bankTransferDetails.receiptPath)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Try opening in new tab
                          </a>
                        </div>
                      </div>
                    </>
                  ) : isPdfFile(selectedPayment.bankTransferDetails.receiptPath) ? (
                    // Display PDF link
                    <div className="text-center p-4">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p className="mb-2">PDF Receipt</p>
                      <a 
                        href={getFileUrl(selectedPayment.bankTransferDetails.receiptPath)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Open PDF Receipt
                      </a>
                    </div>
                  ) : (
                    // Generic file
                    <div className="text-center p-4">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p className="mb-2">Receipt File</p>
                      <a 
                        href={getFileUrl(selectedPayment.bankTransferDetails.receiptPath)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Download Receipt
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => resetDialogStates()}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentManagement;


