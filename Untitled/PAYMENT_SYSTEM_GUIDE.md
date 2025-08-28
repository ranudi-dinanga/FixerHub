# FixerHub Payment System Guide

## 🎯 Overview

The FixerHub payment system provides a comprehensive solution for handling payments between service seekers (customers) and service providers. The system supports both Stripe credit card payments and bank transfer payments with receipt verification.

## 📋 Payment Flow & Status Lifecycle

### Payment Statuses (Logical Order)

1. **`created`** - Payment record created, initial state
2. **`pending_customer_action`** - Waiting for customer to complete payment (Stripe)
3. **`pending_provider_confirmation`** - Waiting for provider to confirm receipt (Bank Transfer)
4. **`confirmed`** - Payment successfully completed and confirmed
5. **`failed`** - Payment failed or was rejected
6. **`cancelled`** - Payment was cancelled by user
7. **`refunded`** - Payment was refunded

### 🔄 Complete Payment Workflows

#### Stripe Payment Flow
```
Service Completed → Create Payment Intent → Customer Pays → Auto-Confirmed
     ↓                     ↓                    ↓              ↓
[completed] → [pending_customer_action] → [confirmed] → [Service Paid]
```

#### Bank Transfer Flow
```
Service Completed → Customer Uploads Receipt → Provider Reviews → Confirmed/Rejected
     ↓                      ↓                      ↓                ↓
[completed] → [pending_provider_confirmation] → [confirmed/failed] → [Service Paid/Disputed]
```

## 🏗 System Architecture

### Backend Components

#### 1. **Payment Model** (`/backend/src/models/Payment.js`)
- Centralized payment tracking
- Comprehensive metadata storage
- Built-in status management methods

#### 2. **Payment Controller** (`/backend/src/controllers/paymentController.js`)
**Key Endpoints:**
- `POST /api/payments/create-payment-intent` - Create Stripe payment
- `POST /api/payments/confirm-stripe-payment` - Confirm Stripe payment
- `POST /api/payments/upload-bank-transfer-receipt` - Upload bank receipt
- `GET /api/payments/pending` - Get pending confirmations for provider
- `POST /api/payments/confirm-receipt` - Provider confirms/rejects payment
- `POST /api/payments/acknowledge` - Provider acknowledges satisfaction
- `POST /api/payments/create-dispute` - Create payment dispute

#### 3. **File Upload System** (`/backend/src/utils/fileUpload.js`)
- Secure file handling for receipts
- Automatic directory creation
- File validation and sanitization

### Frontend Components

#### 1. **BookingList/BookingHistory** - Customer Payment Interface
- Initiate Stripe payments
- Upload bank transfer receipts
- View payment status

#### 2. **PaymentManagement** - Provider Payment Interface
- Review pending payments
- Confirm/reject bank transfers
- Acknowledge completed payments
- Create disputes for problematic payments

## 💳 Payment Methods

### 1. Stripe Payments
**Process:**
1. Customer completes service
2. Clicks "Pay with Stripe"
3. Enters card details
4. Payment processed automatically
5. Status: `confirmed` (immediate)

**Benefits:**
- Instant confirmation
- Secure card processing
- Automatic currency conversion (LKR→USD)

### 2. Bank Transfer Payments
**Process:**
1. Customer completes service
2. Views provider's bank details
3. Makes bank transfer manually
4. Uploads receipt image/PDF
5. Provider reviews and confirms
6. Status: `confirmed` or `failed`

**Benefits:**
- Lower transaction fees
- Direct bank-to-bank transfer
- Receipt verification system

## 👥 User Roles & Capabilities

### Service Seekers (Customers)
- ✅ Make Stripe payments
- ✅ Upload bank transfer receipts
- ✅ View payment history
- ✅ Track payment status

### Service Providers
- ✅ View pending payment confirmations
- ✅ Review uploaded receipts
- ✅ Confirm/reject bank transfers
- ✅ Acknowledge payment satisfaction
- ✅ Create payment disputes
- ✅ View earnings dashboard

### System Administrators
- ✅ Override payment statuses
- ✅ Resolve disputes
- ✅ Process refunds
- ✅ Generate reports

## 🔧 Key Features

### Payment Dashboard
- **Summary Cards:** Pending, Confirmed, Total Earnings, Monthly Stats
- **Filter Options:** Status, Customer name, Date range
- **Search Functionality:** Find specific payments quickly

### Receipt Management
- **Image Viewer:** View uploaded bank receipts
- **Validation:** Automatic file type and size checking
- **Storage:** Secure file storage with organized directory structure

### Dispute System
- **Categories:** Payment Issue, Service Quality, Incomplete Payment, etc.
- **Documentation:** Detailed reason and description required
- **Tracking:** Full audit trail of dispute creation and resolution

### Status Tracking
- **Real-time Updates:** Status changes reflected immediately
- **Clear Indicators:** Color-coded badges with descriptive icons
- **History:** Complete payment timeline tracking

## 🛡 Security Features

### File Upload Security
- File type validation (images, PDFs only)
- Size limits (5MB max)
- Sanitized filenames
- Secure storage paths

### Payment Security
- Stripe PCI compliance
- Encrypted data transmission
- User authorization checks
- Transaction audit trails

### Access Control
- Role-based permissions
- Payment ownership verification
- Provider authorization for confirmations

## 📊 Business Logic

### Payment Confirmation Rules
1. **Stripe payments** - Auto-confirmed upon successful charge
2. **Bank transfers** - Require provider manual confirmation
3. **Failed payments** - Can be retried with new receipt upload
4. **Disputed payments** - Frozen until admin resolution

### Status Transition Rules
- ❌ Cannot skip status levels
- ❌ Cannot revert confirmed payments (except via refund)
- ✅ Failed payments can be retried
- ✅ Pending payments can be cancelled

## 🚀 Implementation Guide

### For Customers (Service Seekers)
```typescript
// Use BookingHistory component
import BookingHistory from '@/components/bookings/BookingHistory';

// Provides:
// - Payment options (Stripe/Bank Transfer)
// - Receipt upload functionality
// - Payment status tracking
```

### For Providers (Service Providers)
```typescript
// Use PaymentManagement component
import PaymentManagement from '@/components/payments/PaymentManagement';

// Provides:
// - Pending payment reviews
// - Receipt confirmation interface
// - Earnings dashboard
// - Dispute creation tools
```

### Backend Integration
```javascript
// All payment routes are under /api/payments/
// Authentication required for all endpoints
// File upload middleware handles receipt uploads
```

## 🔍 Troubleshooting

### Common Issues

1. **Receipt Upload Fails**
   - Check file size (max 5MB)
   - Verify file type (images/PDFs only)
   - Ensure proper authentication

2. **Payment Status Not Updating**
   - Refresh payment list
   - Check network connectivity
   - Verify user permissions

3. **Stripe Payment Issues**
   - Verify Stripe configuration
   - Check currency conversion settings
   - Confirm payment intent creation

### Error Handling
- Comprehensive error messages
- Graceful fallbacks for failed operations
- User-friendly notifications via toast system

## 📈 Analytics & Reporting

### Available Metrics
- Total payments processed
- Success/failure rates
- Average payment amounts
- Monthly/weekly trends
- Provider earnings summaries

### Export Options
- PDF invoice generation
- Payment history exports
- Dispute reports
- Earnings statements

## 🔄 Future Enhancements

### Planned Features
- [ ] Automated dispute resolution
- [ ] Multi-currency support expansion
- [ ] Batch payment processing
- [ ] Advanced analytics dashboard
- [ ] Mobile app payment integration

### Scalability Considerations
- Database indexing for payment queries
- File storage optimization
- Caching for frequently accessed data
- API rate limiting for security

---

## 📞 Support

For technical support or questions about the payment system:
- Check the troubleshooting section above
- Review the API documentation
- Contact the development team

**Last Updated:** December 2024
**Version:** 2.0.0
