# FixerHub - Comprehensive Usage Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Installation & Setup](#installation--setup)
4. [User Roles & Permissions](#user-roles--permissions)
5. [Complete User Flow](#complete-user-flow)
6. [API Endpoints](#api-endpoints)
7. [Features & Functionality](#features--functionality)
8. [Troubleshooting](#troubleshooting)
9. [Development Guide](#development-guide)

## Overview

FixerHub is a comprehensive service marketplace platform that connects service providers (plumbers, electricians, cleaners, etc.) with service seekers (homeowners, businesses). The platform includes advanced features like certification systems, dispute resolution, payment processing, and profile management.

## System Architecture

```
FixerHub/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── context/        # React context providers
│   │   ├── services/       # API service layer
│   │   └── types/          # TypeScript type definitions
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/    # Business logic controllers
│   │   ├── models/         # MongoDB data models
│   │   ├── routes/         # API route definitions
│   │   ├── middleware/     # Custom middleware
│   │   └── services/       # Business services
└── uploads/                 # File storage directory
    ├── profiles/           # Profile pictures
    ├── certifications/     # Certification documents
    ├── evidence/           # Dispute evidence files
    └── receipts/           # Payment receipts
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

### Backend Setup
```bash
cd backend
npm install
npm start
```

**Environment Variables Required:**
```env
MONGODB_URI=mongodb://localhost:27017/fixerhub
JWT_SECRET=your_jwt_secret_here
EMAIL_SERVICE_API_KEY=your_email_service_key
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

**Frontend Environment:**
- Default port: 5173 (Vite)
- Backend API: http://localhost:5001

## User Roles & Permissions

### 1. Service Seeker (Homeowner)
- **Registration**: Basic profile creation
- **Permissions**: 
  - Browse service providers
  - Book services
  - Make payments
  - Leave reviews
  - Report disputes
  - View service history

### 2. Service Provider
- **Registration**: Extended profile with business details
- **Required Fields**:
  - Service category
  - Hourly rate
  - Bank account details
  - Service description
- **Permissions**:
  - Upload certifications
  - Receive bookings
  - Send quotations
  - Process payments
  - Manage profile
  - Earn certification points

### 3. Admin
- **Access**: Full system control
- **Permissions**:
  - Approve/reject certifications
  - Manage disputes
  - Monitor payments
  - User management
  - System analytics

## Complete User Flow

### Service Provider Journey

#### 1. Registration & Onboarding
```
Registration Form → Email Verification → Profile Completion → Dashboard Access
```

**Detailed Steps:**
1. **Fill Registration Form**
   - Personal information (name, email, location)
   - Business details (service category, hourly rate)
   - Banking information (bank name, account number, branch)
   - Profile picture upload (optional, +25 points)

2. **Email Verification**
   - Receive verification email
   - Click verification link
   - Account activation

3. **Profile Completion**
   - Upload certifications
   - Complete service description
   - Set pricing

#### 2. Certification System
```
Upload Document → Admin Review → Approval/Rejection → Points Awarded
```

**Certification Types:**
- **Technical**: 10-100 points
- **Safety**: 15-100 points  
- **Professional**: 20-100 points
- **Trade**: 25-100 points
- **Other**: 10-100 points

**Certification Levels:**
- **Bronze**: 0-49 points
- **Silver**: 50-149 points
- **Gold**: 150-299 points
- **Platinum**: 300-499 points
- **Diamond**: 500+ points

#### 3. Service Management
```
Receive Booking Request → Send Quotation → Service Delivery → Payment Collection
```

**Booking Flow:**
1. **Booking Request Received**
   - Customer details
   - Service requirements
   - Preferred date/time
   - Budget range

2. **Quotation Process**
   - Review requirements
   - Calculate pricing
   - Send detailed quote
   - Negotiate if needed

3. **Service Execution**
   - Confirm booking
   - Complete service
   - Upload completion photos
   - Request payment

#### 4. Payment Processing
```
Service Completion → Invoice Generation → Payment Collection → Funds Transfer
```

**Payment Methods:**
- **Stripe Integration**: Credit/debit cards
- **Bank Transfer**: Direct bank payments
- **Receipt Upload**: Customer uploads payment proof

### Service Seeker Journey

#### 1. Service Discovery
```
Browse Categories → Filter by Location/Rating → View Provider Profiles → Compare Options
```

**Search & Filter Options:**
- Service category
- Location (city, district)
- Rating (minimum rating filter)
- Price range
- Availability
- Certification level

#### 2. Booking Process
```
Select Provider → Choose Service → Set Date/Time → Submit Request
```

**Booking Information Required:**
- Service description
- Preferred date and time
- Budget range
- Special requirements
- Contact information

#### 3. Service Experience
```
Provider Assignment → Service Delivery → Quality Check → Payment
```

**Service Monitoring:**
- Real-time updates
- Provider communication
- Service completion confirmation
- Quality assessment

#### 4. Review & Rating
```
Service Completion → Rating Submission → Review Writing → Provider Feedback
```

**Rating Categories:**
- Overall satisfaction
- Quality of work
- Timeliness
- Communication
- Value for money
- Cleanliness

## API Endpoints

### Authentication
```
POST /api/users/register          # User registration
POST /api/users/login            # User login
POST /api/admin/login            # Admin login
GET  /api/users/verify-email     # Email verification
```

### User Management
```
GET    /api/users/profile/:id     # Get user profile
PUT    /api/users/profile/:id     # Update user profile
GET    /api/users/providers       # Get service providers
GET    /api/users/providers/:id   # Get provider details
```

### Certifications
```
POST   /api/certifications/upload              # Upload certification
GET    /api/certifications/provider/:id        # Get provider certifications
GET    /api/certifications/admin/pending       # Get pending certifications
PATCH  /api/certifications/admin/:id/approve   # Approve certification
PATCH  /api/certifications/admin/:id/reject    # Reject certification
```

### Bookings
```
POST   /api/bookings              # Create booking
GET    /api/bookings/provider     # Get provider bookings
GET    /api/bookings/seeker       # Get seeker bookings
PUT    /api/bookings/:id/status   # Update booking status
POST   /api/bookings/:id/rating  # Submit rating
```

### Payments
```
POST   /api/payments/create-intent     # Create payment intent
POST   /api/payments/confirm           # Confirm payment
POST   /api/payments/upload-receipt    # Upload payment receipt
GET    /api/payments/history           # Get payment history
```

### Disputes
```
POST   /api/disputes              # Create dispute
GET    /api/disputes/user          # Get user disputes
PUT    /api/disputes/:id/status    # Update dispute status
POST   /api/disputes/:id/message   # Add dispute message
```

## Features & Functionality

### 1. Profile Management
- **Profile Pictures**: Upload and manage profile images
- **Points System**: Earn points for certifications and profile completion
- **Verification**: Email verification and admin approval systems
- **Banking Details**: Secure storage of payment information

### 2. Certification System
- **Document Upload**: Support for multiple file formats
- **Admin Review**: Comprehensive approval process
- **Points Calculation**: Dynamic point allocation based on certification type
- **Level Progression**: Automatic level upgrades based on points

### 3. Booking Management
- **Real-time Updates**: Live booking status updates
- **Quotation System**: Detailed pricing and service descriptions
- **Scheduling**: Flexible date and time selection
- **Communication**: Built-in messaging system

### 4. Payment Processing
- **Multiple Methods**: Stripe, bank transfer, receipt upload
- **Invoice Generation**: Automated invoice creation
- **Payment Tracking**: Complete payment history
- **Refund Processing**: Automated refund handling

### 5. Dispute Resolution
- **Issue Reporting**: Structured dispute submission
- **Evidence Upload**: File and photo evidence support
- **Admin Mediation**: Professional dispute resolution
- **Resolution Tracking**: Complete dispute lifecycle

### 6. Review System
- **Multi-category Rating**: Comprehensive quality assessment
- **Photo Reviews**: Visual review support
- **Provider Responses**: Two-way communication
- **Review Verification**: Authenticated review system

## Troubleshooting

### Common Issues

#### 1. Certification Not Showing
**Problem**: Certification exists in database but doesn't appear on dashboard
**Solution**: 
- Check certification status (pending/approved/rejected)
- Verify user ID matches certification serviceProvider
- Refresh user data using dashboard refresh button
- Check browser console for API errors

#### 2. Points Not Updating
**Problem**: Certification approved but points not added
**Solution**:
- Verify certification approval process completed
- Check user model for certificationPoints field
- Ensure user.save() was called after approval
- Check backend logs for approval process

#### 3. Profile Picture Not Uploading
**Problem**: Image upload fails or doesn't display
**Solution**:
- Check file size (max 5MB)
- Verify file type (JPG, PNG, GIF)
- Check upload directory permissions
- Verify image path in database

#### 4. Payment Processing Issues
**Problem**: Stripe payments fail or don't complete
**Solution**:
- Verify Stripe API keys
- Check payment intent creation
- Verify webhook endpoints
- Check payment status in Stripe dashboard

### Debug Steps

1. **Check Backend Logs**
   ```bash
   cd backend
   npm start
   # Watch console output for errors
   ```

2. **Verify Database Connection**
   ```bash
   # Check MongoDB connection
   # Verify collections exist
   # Check document structure
   ```

3. **Test API Endpoints**
   ```bash
   # Use Postman or curl to test endpoints
   # Verify authentication headers
   # Check response formats
   ```

4. **Frontend Debugging**
   ```bash
   cd frontend
   npm run dev
   # Open browser dev tools
   # Check console for errors
   # Verify API calls
   ```

## Development Guide

### Code Structure

#### Backend Patterns
- **MVC Architecture**: Controllers handle business logic, Models define data structure
- **Middleware Chain**: Authentication, validation, and error handling
- **Async/Await**: Modern JavaScript patterns for database operations
- **Error Handling**: Comprehensive error catching and logging

#### Frontend Patterns
- **Component-Based**: Reusable UI components with TypeScript
- **Context API**: Global state management for user data
- **Custom Hooks**: Reusable logic for common operations
- **Form Validation**: Zod schema validation with React Hook Form

### Adding New Features

1. **Backend Development**
   ```bash
   # Create model
   # Add controller methods
   # Define routes
   # Update middleware if needed
   ```

2. **Frontend Development**
   ```bash
   # Create components
   # Add pages
   # Update types
   # Integrate with API
   ```

3. **Testing**
   ```bash
   # Unit tests for models
   # Integration tests for API
   # Component testing
   # End-to-end testing
   ```

### Deployment

#### Production Setup
1. **Environment Configuration**
   - Set production environment variables
   - Configure production database
   - Set up SSL certificates

2. **Build Process**
   ```bash
   # Frontend
   cd frontend
   npm run build
   
   # Backend
   cd backend
   npm run build
   ```

3. **Server Deployment**
   - Use PM2 for process management
   - Set up reverse proxy (Nginx)
   - Configure file uploads
   - Set up monitoring and logging

## Support & Maintenance

### Regular Maintenance Tasks
- **Database Optimization**: Regular index updates and query optimization
- **File Cleanup**: Remove old uploads and temporary files
- **Security Updates**: Keep dependencies updated
- **Performance Monitoring**: Track API response times and user experience

### Monitoring & Alerts
- **Error Tracking**: Monitor application errors and exceptions
- **Performance Metrics**: Track response times and throughput
- **User Analytics**: Monitor user behavior and system usage
- **Security Monitoring**: Track authentication and authorization events

---

**FixerHub** - Building trust through verified services and transparent processes.

For technical support or feature requests, please contact the development team or create an issue in the project repository.
