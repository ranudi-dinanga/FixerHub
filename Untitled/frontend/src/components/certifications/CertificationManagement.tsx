import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download, 
  Filter, 
  Award,
  Calendar,
  Building,
  Hash,
  FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { certificationApi } from '@/services/api';
import { Certification } from '@/types';
import { format } from 'date-fns';

const CertificationManagement = () => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    providerId: ''
  });
  const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchCertifications();
  }, [filters]);

  const fetchCertifications = async () => {
    try {
      setIsLoading(true);
      const data = await certificationApi.getAllCertifications(filters);
      setCertifications(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch certifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedCertification) return;

    try {
      await certificationApi.approveCertification(selectedCertification._id!, adminNotes);
      toast.success('Certification approved successfully');
      setIsApproveDialogOpen(false);
      setSelectedCertification(null);
      setAdminNotes('');
      fetchCertifications();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve certification');
    }
  };

  const handleReject = async () => {
    if (!selectedCertification || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await certificationApi.rejectCertification(selectedCertification._id!, rejectionReason, adminNotes);
      toast.success('Certification rejected successfully');
      setIsRejectDialogOpen(false);
      setSelectedCertification(null);
      setRejectionReason('');
      setAdminNotes('');
      fetchCertifications();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject certification');
    }
  };

  const handleDelete = async (certificationId: string) => {
    if (!window.confirm('Are you sure you want to delete this certification?')) return;

    try {
      await certificationApi.deleteCertification(certificationId);
      toast.success('Certification deleted successfully');
      fetchCertifications();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete certification');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      technical: 'bg-blue-100 text-blue-800',
      safety: 'bg-green-100 text-green-800',
      professional: 'bg-purple-100 text-purple-800',
      trade: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const openApproveDialog = (certification: Certification) => {
    setSelectedCertification(certification);
    setAdminNotes('');
    setIsApproveDialogOpen(true);
  };

  const openRejectDialog = (certification: Certification) => {
    setSelectedCertification(certification);
    setRejectionReason('');
    setAdminNotes('');
    setIsRejectDialogOpen(true);
  };

  const openViewDialog = (certification: Certification) => {
    setSelectedCertification(certification);
    setIsViewDialogOpen(true);
  };

  const downloadDocument = (filePath: string, fileName: string) => {
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = `http://localhost:5001/${filePath}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading certifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="trade">Trade</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Provider ID</label>
              <Input
                placeholder="Filter by provider ID"
                value={filters.providerId}
                onChange={(e) => setFilters({ ...filters, providerId: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certifications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certifications ({certifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {certifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No certifications found matching the current filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certifications.map((certification) => (
                  <TableRow key={certification._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {typeof certification.serviceProvider === 'object' 
                            ? certification.serviceProvider.name 
                            : 'Unknown Provider'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {typeof certification.serviceProvider === 'object' 
                            ? certification.serviceProvider.email 
                            : 'N/A'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <p className="font-medium truncate">{certification.title}</p>
                        <p className="text-sm text-gray-500 truncate">
                          {certification.issuingOrganization}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(certification.category)}>
                        {certification.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {certification.points} pts
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(certification.status)}>
                        {certification.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>Issued: {format(new Date(certification.issueDate), 'MMM dd, yyyy')}</p>
                        {certification.expiryDate && (
                          <p className="text-gray-500">
                            Expires: {format(new Date(certification.expiryDate), 'MMM dd, yyyy')}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openViewDialog(certification)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadDocument(certification.documentFile, `${certification.title}.pdf`)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {certification.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => openApproveDialog(certification)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => openRejectDialog(certification)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(certification._id!)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Certification</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this certification? This will award {selectedCertification?.points} points to the provider.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Admin Notes (Optional)</label>
              <Textarea
                placeholder="Add any notes about this approval..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Certification</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this certification.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Rejection Reason *</label>
              <Textarea
                placeholder="Explain why this certification is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Admin Notes (Optional)</label>
              <Textarea
                placeholder="Add any additional notes..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReject} className="bg-red-600 hover:bg-red-700">
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Certification Details</DialogTitle>
          </DialogHeader>
          {selectedCertification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Title</label>
                  <p className="font-medium">{selectedCertification.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <Badge className={getCategoryColor(selectedCertification.category)}>
                    {selectedCertification.category}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Points</label>
                  <p className="font-medium">{selectedCertification.points}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <Badge className={getStatusColor(selectedCertification.status)}>
                    {selectedCertification.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Issuing Organization</label>
                <p className="font-medium">{selectedCertification.issuingOrganization}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Certificate Number</label>
                <p className="font-mono">{selectedCertification.certificateNumber}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Issue Date</label>
                  <p className="font-medium">
                    {format(new Date(selectedCertification.issueDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                {selectedCertification.expiryDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Expiry Date</label>
                    <p className="font-medium">
                      {format(new Date(selectedCertification.expiryDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
              </div>
              
              {selectedCertification.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-700">{selectedCertification.description}</p>
                </div>
              )}
              
              {selectedCertification.adminNotes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Admin Notes</label>
                  <p className="text-gray-700">{selectedCertification.adminNotes}</p>
                </div>
              )}
              
              {selectedCertification.rejectionReason && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Rejection Reason</label>
                  <p className="text-red-700">{selectedCertification.rejectionReason}</p>
                </div>
              )}
              
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => downloadDocument(selectedCertification.documentFile, `${selectedCertification.title}.pdf`)}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Document
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CertificationManagement;
