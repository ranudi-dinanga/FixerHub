import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Booking, User } from '@/types';
import { Calendar, Clock, MapPin, User as UserIcon, CreditCard, Building } from 'lucide-react';

interface BillData extends Booking {
  serviceProvider: User;
  serviceSeeker: User;
}

const Bill: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BillData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await api.get(`/bookings/${bookingId}`);
        setBooking(response.data);
      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  useEffect(() => {
    // Auto-print when the page loads
    if (booking && !loading) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        window.print();
      }, 1000);
    }
  }, [booking, loading]);

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    window.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Bill Not Found</h2>
          <p className="text-gray-600">The requested booking bill could not be found.</p>
          <button 
            onClick={handleClose}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const taxRate = 0.10; // 10% tax
  const subtotal = booking.price;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;
  const invoiceNumber = `FH-${booking._id?.slice(-8).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-white">
      {/* Print-only header */}
      <div className="print:block hidden">
        <style>
          {`
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
              .print-only { display: block !important; }
            }
          `}
        </style>
      </div>

      {/* Screen controls */}
      <div className="no-print bg-gray-100 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Service Bill - {invoiceNumber}</h1>
        <div className="space-x-2">
          <button 
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Print Bill
          </button>
          <button 
            onClick={handleClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close Window
          </button>
        </div>
      </div>

      {/* Bill content - Compact single page layout */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600 mb-1">FixerHub</h1>
          <p className="text-sm text-gray-600">Professional Service Platform</p>
          <div className="mt-3">
            <h2 className="text-xl font-bold text-gray-800">SERVICE BILL</h2>
            <p className="text-sm text-gray-600">Invoice #{invoiceNumber}</p>
          </div>
        </div>

        {/* Bill and Service details in one row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Bill To */}
          <div>
            <h3 className="font-semibold mb-2 text-gray-800">Bill To:</h3>
            <div className="space-y-1 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <UserIcon className="w-3 h-3" />
                <span className="font-medium">{booking.serviceSeeker.name}</span>
              </div>
              <div>{booking.serviceSeeker.email}</div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{booking.serviceSeeker.location}</span>
              </div>
            </div>
          </div>

          {/* Service Provider */}
          <div>
            <h3 className="font-semibold mb-2 text-gray-800">Service By:</h3>
            <div className="space-y-1 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <UserIcon className="w-3 h-3" />
                <span className="font-medium">{booking.serviceProvider.name}</span>
              </div>
              <div>{booking.serviceProvider.email}</div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{booking.serviceProvider.location}</span>
              </div>
              {booking.serviceProvider.serviceCategory && (
                <div className="text-xs text-blue-600 font-medium">
                  {booking.serviceProvider.serviceCategory}
                </div>
              )}
            </div>
          </div>

          {/* Service Details */}
          <div>
            <h3 className="font-semibold mb-2 text-gray-800">Service Details:</h3>
            <div className="space-y-1 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(booking.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span>{booking.time}</span>
              </div>
              <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mt-2 inline-block">
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Service Description */}
        <div className="mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Service Description:</h4>
            <p className="text-sm text-gray-700">{booking.description}</p>
          </div>
        </div>

        {/* Payment breakdown - Compact table */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-gray-800">Payment Summary:</h3>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Description</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-2 text-gray-700">Service Charge</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(subtotal)}</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2 text-gray-700">Service Tax (10%)</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(taxAmount)}</td>
                </tr>
                <tr className="border-t bg-gray-50">
                  <td className="px-4 py-2 font-semibold text-gray-800">Total Amount</td>
                  <td className="px-4 py-2 text-right font-bold text-lg text-blue-600">
                    {formatCurrency(total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment method and footer in one row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2 text-gray-800">Payment Method:</h3>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              {booking.paymentMethod === 'stripe' ? (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Credit Card (via Stripe)</span>
                </>
              ) : (
                <>
                  <Building className="w-4 h-4" />
                  <span>Bank Transfer</span>
                </>
              )}
            </div>
          </div>
          
          <div className="text-right text-sm text-gray-600">
            <p className="mb-1">Thank you for using FixerHub!</p>
            <p className="text-xs">© {new Date().getFullYear()} FixerHub - FYP Project</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bill;
