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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  FileText,
  Calendar,
  User
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getFileUrl, isImageFile, isPdfFile, formatCurrency } from '@/utils/fileHelpers';
import { Payment } from '@/types';

const ReceivedPayments = () => {
  const { currentUser } = useAuth();
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [confirmationNotes, setConfirmationNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    fetchPayments();
  }, []);

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
        setAllPayments(allData.payments || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
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
      setIsConfirmDialogOpen(false);
      setSelectedPayment(null);
      setConfirmationNotes('');
      fetchPayments(); // Refresh the list
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Failed to process payment confirmation');
    }
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'pending_provider_confirmation':
        return 'bg-orange-500';
      case 'confirmed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'pending_customer_action':
        return 'bg-blue-500';
      case 'created':
        return 'bg-gray-500';
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
      case 'pending_provider_confirmation':
      case 'pending_customer_action':
      case 'created':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'refunded':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // formatCurrency is now imported from utils

  const viewReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsReceiptDialogOpen(true);
  };

  const confirmPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsConfirmDialogOpen(true);
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
            variant={activeTab === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveTab('all')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            All Payments
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments.length}</div>
            <p className="text-xs text-muted-foreground">
              Payments awaiting confirmation
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Received</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allPayments.filter(p => p.status === 'confirmed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Confirmed payments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(allPayments
                .filter(p => p.status === 'confirmed')
                .reduce((sum, p) => sum + p.amount, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Total earnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === 'pending' ? 'Pending Payments' : 'All Payments'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(activeTab === 'pending' ? pendingPayments : allPayments).length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              {activeTab === 'pending' 
                ? "No pending payments to review." 
                : "No payments received yet."}
            </div>
          ) : (
            <Table>
              <TableCaption>
                {activeTab === 'pending' 
                  ? 'Payments requiring your confirmation' 
                  : 'All your received payments'}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(activeTab === 'pending' ? pendingPayments : allPayments).map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <div>
                                                  <div className="font-medium">{typeof payment.payer === 'object' ? payment.payer.name : 'Customer'}</div>
                        <div className="text-sm text-gray-500">{typeof payment.payer === 'object' ? payment.payer.email : 'Email not available'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium truncate max-w-[200px]">
                          {typeof payment.booking === 'object' ? payment.booking.description : 'Service booking'}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {typeof payment.booking === 'object' ? `${payment.booking.date} at ${payment.booking.time}` : 'Date not available'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'Date not available'}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">
                        {formatCurrency(payment.amount, payment.currency)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(payment.status)} flex items-center gap-1`}>
                        {getStatusIcon(payment.status)}
                        {payment.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {payment.bankTransferDetails && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewReceipt(payment)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View Receipt
                          </Button>
                        )}
                        {payment.status === 'pending_provider_confirmation' && (
                          <Button
                            size="sm"
                            onClick={() => confirmPayment(payment)}
                            className="flex items-center gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Confirm
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

      {/* Payment Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
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
                <div><strong>Customer:</strong> {typeof selectedPayment.payer === 'object' ? selectedPayment.payer.name : 'Customer'}</div>
                <div><strong>Service:</strong> {typeof selectedPayment.booking === 'object' ? selectedPayment.booking.description : 'Service booking'}</div>
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

      {/* Receipt Viewer Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
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
                    <div><strong>Customer:</strong> {typeof selectedPayment.payer === 'object' ? selectedPayment.payer.name : 'Customer'}</div>
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
                          console.error('Failed to load receipt image:', getFileUrl(selectedPayment.bankTransferDetails!.receiptPath));
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.display = 'none';
                          const nextSibling = target.nextElementSibling as HTMLElement;
                          if (nextSibling) nextSibling.style.display = 'block';
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
            <Button variant="outline" onClick={() => setIsReceiptDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceivedPayments;
