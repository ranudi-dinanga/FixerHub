# FixerHub - Complete Developer Guide & System Walkthrough

## 🎯 Table of Contents
1. [System Overview](#system-overview)
2. [Complete Testing Workflow](#complete-testing-workflow)
3. [File Architecture & Dependencies](#file-architecture--dependencies)
4. [Component Breakdown](#component-breakdown)
5. [Testing Scenarios](#testing-scenarios)
6. [Viva Preparation](#viva-preparation)
7. [Troubleshooting Guide](#troubleshooting-guide)
8. [Development Workflow](#development-workflow)

## 🏗️ System Overview

FixerHub is a **service marketplace platform** with three user roles:
- **Service Seeker (Homeowner)**: Books services, makes payments, leaves reviews
- **Service Provider**: Offers services, manages bookings, earns certifications
- **Admin**: Approves certifications, manages disputes, monitors system

**Core Flow**: Registration → Email Verification → Role-Based Dashboard → Service Interaction → Payment → Review

## 🧪 Complete Testing Workflow

### Prerequisites Setup
```bash
# 1. Install dependencies
cd backend && npm install
cd frontend && npm install

# 2. Start services
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend  
cd frontend && npm run dev

# Terminal 3: MongoDB
mongod
```

### 🚀 Step-by-Step Testing Procedure

#### Phase 1: Service Provider Registration & Onboarding
```bash
# Browser 1: Service Provider
1. Open http://localhost:5173/register
2. Select "Service Provider" role
3. Fill all required fields:
   - Name: "John Plumber"
   - Email: "john@temp-mail.org"
   - Password: "password123"
   - Service Category: "Plumbing"
   - Hourly Rate: "50"
   - Bank Name: "Test Bank"
   - Account Number: "1234567890"
   - Branch Name: "Main Branch"
   - Service Description: "Professional plumbing services"
4. Upload profile picture (optional, +25 points)
5. Submit registration
6. Check email for verification link
7. Click verification link
8. Login with credentials
9. Access provider dashboard
```

#### Phase 2: Service Seeker Registration
```bash
# Browser 2: Service Seeker
1. Open http://localhost:5173/register
2. Select "Homeowner" role
3. Fill basic information:
   - Name: "Sarah Homeowner"
   - Email: "sarah@temp-mail.org"
   - Password: "password123"
   - Location: "New York"
4. Submit registration
5. Verify email
6. Login and access seeker dashboard
```

#### Phase 3: Service Provider Certification Upload
```bash
# Browser 1: Service Provider Dashboard
1. Navigate to "Certifications" section
2. Click "Upload New Certification"
3. Fill form:
   - Type: "Trade"
   - Title: "Plumbing License"
   - Description: "State-issued plumbing license"
   - Points: "25"
4. Upload certification document (PDF/JPG)
5. Submit for admin review
```

#### Phase 4: Admin Certification Approval
```bash
# Browser 3: Admin Dashboard
1. Login as admin (admin@fixerhub.com / admin123)
2. Navigate to "Pending Certifications"
3. Review John Plumber's certification
4. Click "Approve"
5. Verify points are added to provider
6. Check certification status changed to "Approved"
```

#### Phase 5: Service Booking Process
```bash
# Browser 2: Service Seeker
1. Browse service providers
2. Click on "John Plumber"
3. View profile and certifications
4. Click "Book Service"
5. Fill booking form:
   - Service Description: "Fix leaking faucet"
   - Preferred Date: "Tomorrow"
   - Preferred Time: "2:00 PM"
   - Budget: "100-150"
6. Submit booking request

# Browser 1: Service Provider
1. Check "New Bookings" section
2. View Sarah's request
3. Click "Send Quote"
4. Set price: "120"
5. Add notes: "Will bring necessary tools"
6. Send quote

# Browser 2: Service Seeker
1. View received quote
2. Accept quote
3. Confirm booking
```

#### Phase 6: Service Completion & Payment
```bash
# Browser 1: Service Provider
1. Mark service as "In Progress"
2. Complete service
3. Mark as "Completed"
4. Upload completion photos
5. Request payment

# Browser 2: Service Seeker
1. View completion notification
2. Process payment (Stripe test card: 4242 4242 4242 4242)
3. Leave review and rating
```

#### Phase 7: Dispute Resolution (Optional)
```bash
# Browser 2: Service Seeker
1. Report issue if dissatisfied
2. Upload evidence
3. Submit dispute

# Browser 3: Admin
1. Review dispute
2. Investigate evidence
3. Make resolution decision
4. Update dispute status
```

## 📁 File Architecture & Dependencies

### 🔐 Authentication System

#### Frontend Files
```
frontend/src/context/AuthContext.tsx          # Global auth state management
frontend/src/components/auth/LoginForm.tsx    # Login form component
frontend/src/components/auth/RegisterForm.tsx # Registration form component
frontend/src/components/auth/ProtectedRoute.tsx # Route protection
frontend/src/services/api.ts                  # API service layer
frontend/src/types/index.ts                   # TypeScript interfaces
```

#### Backend Files
```
backend/src/controllers/userController.js      # User registration/login logic
backend/src/middleware/auth.js                # JWT verification middleware
backend/src/models/User.js                    # User data model
backend/src/routes/userRoutes.js              # Authentication endpoints
backend/src/services/emailService.js          # Email verification service
```

**Key Dependencies**: JWT tokens, bcrypt password hashing, email verification

### 👥 User Management

#### Frontend Files
```
frontend/src/pages/Profile.tsx                # User profile display/edit
frontend/src/components/profile/EditProfileForm.tsx # Profile editing form
frontend/src/pages/ProviderDashboard.tsx      # Service provider dashboard
frontend/src/pages/SeekerDashboard.tsx        # Service seeker dashboard
```

#### Backend Files
```
backend/src/controllers/userController.js      # Profile update logic
backend/src/models/User.js                    # User schema & methods
backend/src/routes/userRoutes.js              # Profile management endpoints
```

**Key Dependencies**: Role-based access control, profile picture uploads

### 🏆 Certification System

#### Frontend Files
```
frontend/src/components/certifications/CertificationUpload.tsx # Upload form
frontend/src/components/certifications/CertificationList.tsx   # Display list
frontend/src/pages/ProviderDashboard.tsx      # Certification status display
```

#### Backend Files
```
backend/src/controllers/certificationController.js # Upload/approval logic
backend/src/models/Certification.js            # Certification schema
backend/src/routes/certificationRoutes.js      # Certification endpoints
backend/src/models/User.js                    # Points calculation methods
```

**Key Dependencies**: File upload handling, admin approval workflow, points system

### 📅 Booking Management

#### Frontend Files
```
frontend/src/components/bookings/BookingForm.tsx      # Service booking form
frontend/src/components/bookings/BookingList.tsx      # Booking display
frontend/src/components/bookings/QuotationForm.tsx    # Provider quote form
frontend/src/pages/ProviderDashboard.tsx              # Provider booking view
```

#### Backend Files
```
backend/src/controllers/bookingController.js           # Booking logic
backend/src/models/Booking.js                         # Booking schema
backend/src/routes/bookingRoutes.js                   # Booking endpoints
backend/src/models/User.js                           # User relationship
```

**Key Dependencies**: Real-time updates, status management, quotation system

### 💳 Payment Processing

#### Frontend Files
```
frontend/src/components/payments/PaymentForm.tsx      # Payment interface
frontend/src/components/payments/PaymentHistory.tsx   # Transaction history
frontend/src/services/stripe.ts                      # Stripe integration
```

#### Backend Files
```
backend/src/controllers/paymentController.js           # Payment processing
backend/src/models/Payment.js                         # Payment schema
backend/src/routes/paymentRoutes.js                   # Payment endpoints
backend/src/services/stripeService.js                 # Stripe backend service
```

**Key Dependencies**: Stripe API, webhook handling, receipt management

### ⚖️ Dispute Resolution

#### Frontend Files
```
frontend/src/components/disputes/DisputeForm.tsx      # Issue reporting
frontend/src/components/disputes/DisputeList.tsx      # Dispute display
frontend/src/components/disputes/EvidenceUpload.tsx   # File evidence upload
```

#### Backend Files
```
backend/src/controllers/disputeController.js           # Dispute management
backend/src/models/Dispute.js                         # Dispute schema
backend/src/routes/disputeRoutes.js                   # Dispute endpoints
```

**Key Dependencies**: File evidence handling, admin mediation workflow

### 📧 Email System

#### Frontend Files
```
frontend/src/components/auth/EmailVerification.tsx    # Verification component
frontend/src/context/AuthContext.tsx                  # Verification status
```

#### Backend Files
```
backend/src/services/emailService.js                  # Email sending logic
backend/src/controllers/userController.js              # Verification triggers
backend/src/models/User.js                           # Verification status
```

**Key Dependencies**: Email service API, verification tokens, template system

## 🔧 Component Breakdown

### Core Components by Feature

#### 1. Authentication Components
- **LoginForm**: User login interface
- **RegisterForm**: User registration with role selection
- **ProtectedRoute**: Route protection based on auth status
- **EmailVerification**: Email verification handling

#### 2. Dashboard Components
- **ProviderDashboard**: Service provider main interface
- **SeekerDashboard**: Service seeker main interface
- **AdminDashboard**: Administrative control panel

#### 3. Profile Components
- **EditProfileForm**: Profile editing with role-specific fields
- **ProfileDisplay**: Profile information display
- **AvatarUpload**: Profile picture management

#### 4. Service Components
- **ServiceList**: Available services display
- **ServiceCard**: Individual service information
- **ServiceFilter**: Search and filtering interface

#### 5. Booking Components
- **BookingForm**: Service request submission
- **BookingList**: Booking history and status
- **QuotationForm**: Provider quote submission

#### 6. Certification Components
- **CertificationUpload**: Document upload interface
- **CertificationList**: Certification display and status
- **CertificationApproval**: Admin approval interface

## 🧪 Testing Scenarios

### Critical Path Testing

#### 1. User Registration Flow
```bash
# Test Case: Complete registration process
Expected: User can register, verify email, and access dashboard
Files to Monitor: 
- frontend/src/components/auth/RegisterForm.tsx
- backend/src/controllers/userController.js
- backend/src/services/emailService.js
```

#### 2. Certification Workflow
```bash
# Test Case: Certification upload to approval
Expected: Provider uploads cert → Admin reviews → Points awarded
Files to Monitor:
- frontend/src/components/certifications/CertificationUpload.tsx
- backend/src/controllers/certificationController.js
- backend/src/models/User.js (points calculation)
```

#### 3. Booking Process
```bash
# Test Case: Complete service booking cycle
Expected: Seeker books → Provider quotes → Service → Payment → Review
Files to Monitor:
- frontend/src/components/bookings/BookingForm.tsx
- backend/src/controllers/bookingController.js
- frontend/src/components/payments/PaymentForm.tsx
```

### Edge Case Testing

#### 1. Invalid Data Handling
```bash
# Test invalid email formats, empty required fields
# Monitor form validation and error handling
Files: All form components with Zod validation
```

#### 2. File Upload Limits
```bash
# Test oversized files, invalid formats
# Monitor upload restrictions and error messages
Files: Upload components and backend middleware
```

#### 3. Concurrent User Actions
```bash
# Test multiple users accessing same data
# Monitor data consistency and race conditions
Files: Backend controllers and database operations
```

## 🎓 Viva Preparation

### Key Concepts to Master

#### 1. System Architecture
- **Frontend**: React + TypeScript with Context API
- **Backend**: Node.js + Express with MongoDB
- **Communication**: RESTful API with JWT authentication
- **File Storage**: Local file system with organized directories

#### 2. Data Flow Understanding
```
User Action → Frontend State → API Call → Backend Processing → Database → Response → UI Update
```

#### 3. Role-Based Access Control
- **Service Seeker**: Limited to booking and review functions
- **Service Provider**: Extended profile, certification management
- **Admin**: Full system access, approval workflows

#### 4. Security Measures
- JWT token validation
- Password hashing with bcrypt
- File upload restrictions
- Role-based route protection

### Viva Questions & Answers

#### Q: How does the certification system work?
**A**: 
1. Provider uploads document via `CertificationUpload.tsx`
2. File stored in `uploads/certifications/` directory
3. Admin reviews in admin dashboard
4. Approval triggers points calculation in `User.js`
5. Points determine certification level (Bronze to Diamond)

#### Q: Explain the payment flow
**A**:
1. Service completion triggers payment request
2. Stripe integration handles card payments
3. Payment confirmation updates booking status
4. Receipt generation and storage
5. Payment history maintained in database

#### Q: How is email verification implemented?
**A**:
1. Registration generates verification token
2. Email service sends verification link
3. User clicks link to verify account
4. Backend updates user verification status
5. Protected routes check verification before access

#### Q: What happens when a certification is approved?
**A**:
1. Admin clicks approve button
2. `certificationController.js` processes approval
3. User model updates `certificationPoints`
4. `totalPoints` recalculated
5. Certification level automatically updated
6. Frontend dashboard reflects changes

### Files to Focus On During Viva

#### High Priority Files
```
frontend/src/context/AuthContext.tsx          # Authentication logic
frontend/src/components/profile/EditProfileForm.tsx # Role-based forms
backend/src/controllers/userController.js      # User management
backend/src/controllers/certificationController.js # Certification system
backend/src/models/User.js                    # Data structure
```

#### Medium Priority Files
```
frontend/src/components/auth/RegisterForm.tsx # Registration flow
frontend/src/pages/ProviderDashboard.tsx      # Provider functionality
backend/src/middleware/auth.js                # Security middleware
backend/src/routes/ # API endpoint definitions
```

## 🚨 Troubleshooting Guide

### Common Issues & Solutions

#### 1. Authentication Failures
```bash
# Problem: JWT token expired
Solution: Check token expiration in AuthContext
Files: frontend/src/context/AuthContext.tsx

# Problem: Email verification not working
Solution: Check email service configuration
Files: backend/src/services/emailService.js
```

#### 2. File Upload Issues
```bash
# Problem: Files not uploading
Solution: Check upload directory permissions
Files: backend/uploads/ directory structure

# Problem: File size too large
Solution: Verify multer configuration
Files: backend/src/middleware/upload.js
```

#### 3. Database Connection Issues
```bash
# Problem: MongoDB connection failed
Solution: Check connection string and MongoDB status
Files: backend/src/config/database.js

# Problem: Data not saving
Solution: Verify model schema and validation
Files: backend/src/models/ directory
```

#### 4. Frontend Build Issues
```bash
# Problem: TypeScript compilation errors
Solution: Check type definitions and imports
Files: frontend/src/types/index.ts

# Problem: Component not rendering
Solution: Verify component props and state
Files: All component files in frontend/src/components/
```

### Debug Commands
```bash
# Backend debugging
cd backend && npm run dev  # Watch for errors
tail -f logs/app.log       # Monitor logs

# Frontend debugging
cd frontend && npm run dev  # Development server
# Open browser dev tools for console errors

# Database debugging
mongosh                     # Connect to MongoDB
show collections           # List collections
db.users.find()           # Query users
```

## 🚀 Development Workflow

### Adding New Features

#### 1. Backend Development
```bash
# 1. Create model in backend/src/models/
# 2. Add controller in backend/src/controllers/
# 3. Define routes in backend/src/routes/
# 4. Update middleware if needed
# 5. Test with Postman/curl
```

#### 2. Frontend Development
```bash
# 1. Create component in frontend/src/components/
# 2. Add page in frontend/src/pages/
# 3. Update types in frontend/src/types/
# 4. Integrate with API services
# 5. Test in browser
```

#### 3. Testing Process
```bash
# 1. Unit tests for models and controllers
# 2. Integration tests for API endpoints
# 3. Component testing for React components
# 4. End-to-end testing for complete workflows
```

### Code Quality Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code style enforcement
- **Prettier**: Code formatting
- **Git Hooks**: Pre-commit validation

---

## 📚 Additional Resources

### Documentation Files
- `README.md` - Comprehensive system overview
- `QUICK_START.md` - Quick setup guide
- `SYSTEM_FLOW.md` - System flow diagrams

### Key Directories
```
FixerHub/
├── frontend/src/           # React application
├── backend/src/            # Node.js server
├── uploads/                # File storage
└── docs/                   # Documentation
```

### Testing Checklist
- [ ] User registration (both roles)
- [ ] Email verification
- [ ] Profile management
- [ ] Certification upload/approval
- [ ] Service booking process
- [ ] Payment processing
- [ ] Review system
- [ ] Admin functions
- [ ] Error handling
- [ ] Security validation

---

**🎯 Developer Guide Complete!**

This guide provides everything a new developer needs to understand, test, and work with the FixerHub system. Use it alongside the other documentation files for complete system mastery.
