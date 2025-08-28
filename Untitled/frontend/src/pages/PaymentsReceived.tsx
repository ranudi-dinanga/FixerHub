import React from 'react';
import PaymentManagement from '@/components/payments/PaymentManagement';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const PaymentsReceived = () => {
  const { currentUser } = useAuth();

  // Redirect if not a service provider
  if (!currentUser || currentUser.role !== 'service_provider') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Payments Received</h1>
        <p className="text-gray-600 mt-2">
          Manage your received payments, confirm bank transfers, and handle payment disputes.
        </p>
      </div>
      
      <PaymentManagement />
    </div>
  );
};

export default PaymentsReceived;
