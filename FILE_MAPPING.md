# FixerHub - Complete File Mapping & Component Guide

## 🗂️ File Structure Overview

```
FixerHub/
├── frontend/src/                    # React Frontend Application
│   ├── components/                  # Reusable UI Components
│   ├── pages/                      # Main Application Pages
│   ├── context/                    # React Context Providers
│   ├── services/                   # API Service Layer
│   ├── types/                      # TypeScript Type Definitions
│   ├── hooks/                      # Custom React Hooks
│   ├── lib/                        # Utility Libraries
│   └── utils/                      # Helper Functions
├── backend/src/                     # Node.js Backend Server
│   ├── controllers/                 # Business Logic Controllers
│   ├── models/                      # Database Models & Schemas
│   ├── routes/                      # API Route Definitions
│   ├── middleware/                  # Custom Middleware
│   ├── services/                    # Business Services
│   ├── config/                      # Configuration Files
│   └── utils/                       # Utility Functions
└── uploads/                         # File Storage Directory
    ├── profiles/                    # Profile Pictures
    ├── certifications/              # Certification Documents
    ├── evidence/                    # Dispute Evidence Files
    └── receipts/                    # Payment Receipts
```

## 🔐 Authentication & User Management

### Frontend Files
| File Path | Purpose | Key Functions |
|-----------|---------|---------------|
| `frontend/src/context/AuthContext.tsx` | Global authentication state | User login/logout, token management, role-based access |
| `frontend/src/components/auth/LoginForm.tsx` | User login interface | Form validation, API calls, error handling |
| `frontend/src/components/auth/RegisterForm.tsx` | User registration | Role selection, form validation, profile picture upload |
| `frontend/src/components/auth/EmailVerification.tsx` | Email verification | Verification status, resend functionality |
| `frontend/src/components/auth/ProtectedRoute.tsx` | Route protection | Authentication checks, role-based routing |
| `frontend/src/services/api.ts` | API service layer | HTTP requests, authentication headers |
| `frontend/src/types/index.ts` | TypeScript interfaces | User types, API response types |

### Backend Files
| File Path | Purpose | Key Functions |
|-----------|---------|---------------|
| `backend/src/controllers/userController.js` | User management logic | Registration, login, profile updates, email verification |
| `backend/src/middleware/auth.js` | JWT verification | Token validation, role checking, route protection |
| `backend/src/models/User.js` | User data model | Schema definition, password hashing, points calculation |
| `backend/src/routes/userRoutes.js` | Authentication endpoints | POST /register, POST /login, GET /profile/:id |
| `backend/src/services/emailService.js` | Email functionality | Verification emails, password reset, notifications |
| `backend/src/config/database.js` | Database connection | MongoDB connection, connection pooling |

## 👥 Profile Management

### Frontend Files
| File Path | Purpose | Key Functions |
|-----------|---------|---------------|
| `frontend/src/pages/Profile.tsx` | Profile display page | User information, points display, achievements |
| `frontend/src/components/profile/EditProfileForm.tsx` | Profile editing | Role-based forms, validation, file uploads |
| `frontend/src/components/profile/ProfilePictureUpload.tsx` | Avatar management | Image upload, preview, validation |
| `frontend/src/components/profile/ProfileDisplay.tsx` | Profile information | User details, statistics, certifications |

### Backend Files
| File Path | Purpose | Key Functions |
|-----------|---------|---------------|
| `backend/src/controllers/userController.js` | Profile updates | Update logic, file handling, points management |
| `backend/src/models/User.js` | Profile data | Schema fields, methods, validation |
| `backend/src/middleware/upload.js` | File upload handling | Multer configuration, file validation, storage |

## 🏆 Certification System

### Frontend Files
| File Path | Purpose | Key Functions |
|-----------|---------|---------------|
| `frontend/src/components/certifications/CertificationUpload.tsx` | Document upload | File selection, form validation, submission |
| `frontend/src/components/certifications/CertificationList.tsx` | Certification display | Status, points, approval status |
| `frontend/src/components/certifications/CertificationManagement.tsx` | Admin interface | Approval/rejection, status updates |
| `frontend/src/pages/ProviderDashboard.tsx` | Provider view | Certification status, points display |

### Backend Files
| File Path | Purpose | Key Functions |
|-----------|---------|---------------|
| `backend/src/controllers/certificationController.js` | Certification logic | Upload handling, admin approval, points calculation |
| `backend/src/models/Certification.js` | Certification schema | Document metadata, status tracking, file paths |
| `backend/src/routes/certificationRoutes.js` | Certification endpoints | POST /upload, PATCH /approve, GET /provider/:id |
| `backend/src/models/User.js` | Points management | Add/remove points, level calculation |

## 📅 Booking Management

### Frontend Files
| File Path | Purpose | Key Functions |
|-----------|---------|---------------|
| `frontend/src/components/bookings/BookingForm.tsx` | Service booking | Service details, date/time, budget |
| `frontend/src/components/bookings/BookingList.tsx` | Booking display | Status, history, actions |
| `frontend/src/components/bookings/QuotationForm.tsx` | Provider quotes | Pricing, notes, terms |
| `frontend/src/components/bookings/BookingHistory.tsx` | Historical data | Completed services, reviews |
| `frontend/src/pages/ProviderDashboard.tsx` | Provider bookings | New requests, active services |

### Backend Files
| File Path | Purpose | Key Functions |
|-----------|---------|---------------|
| `backend/src/controllers/bookingController.js` | Booking logic | Create, update, status management, quotations |
| `backend/src/models/Booking.js` | Booking schema | Service details, status, pricing, timeline |
| `backend/src/routes/bookingRoutes.js` | Booking endpoints | POST /bookings, PUT /status, POST /quotes |
| `backend/src/models/User.js` | User relationships | Provider-seeker connections |

## 💳 Payment Processing

### Frontend Files
| File Path | Purpose | Key Functions |
|-----------|---------|---------------|
| `frontend/src/components/payments/PaymentForm.tsx` | Payment interface | Stripe integration, payment methods |
| `frontend/src/components/payments/PaymentHistory.tsx` | Transaction history | Payment records, receipts, status |
| `frontend/src/components/payments/PaymentManagement.tsx` | Provider payments | Received payments, bank details |
| `frontend/src/services/stripe.ts` | Stripe integration | Payment intents, webhook handling |

### Backend Files
| File Path | Purpose | Key Functions |
|-----------|---------|---------------|
| `backend/src/controllers/paymentController.js` | Payment processing | Stripe integration, receipt handling, status updates |
| `backend/src/models/Payment.js` | Payment schema | Transaction details, amounts, status |
| `backend/src/routes/paymentRoutes.js` | Payment endpoints | POST /create-intent, POST /confirm, GET /history |
| `backend/src/services/stripeService.js` | Stripe backend | API calls, webhook processing |

## ⚖️ Dispute Resolution

### Frontend Files
| File Path | Purpose | Key Functions |
|-----------|---------|---------------|
| `frontend/src/components/disputes/DisputeForm.tsx` | Issue reporting | Problem description, evidence upload |
| `frontend/src/components/disputes/DisputeList.tsx` | Dispute display | Status, evidence, resolution |
| `frontend/src/components/disputes/EvidenceUpload.tsx` | File evidence | Document upload, photo evidence |
| `frontend/src/components/admin/DisputeManagement.tsx` | Admin interface | Dispute review, resolution, status updates |

### Backend Files
| File Path | Purpose | Key Functions |
|-----------|---------|---------------|
| `backend/src/controllers/disputeController.js` | Dispute management | Create, update, admin review, resolution |
| `backend/src/models/Dispute.js` | Dispute schema | Issue details, evidence, status tracking |
| `backend/src/routes/disputeRoutes.js` | Dispute endpoints | POST /disputes, PUT /status, POST /evidence |

## 📧 Email & Communication

### Frontend Files
| File Path | Purpose | Key Functions |
|-----------|---------|---------------|
| `frontend/src/components/auth/EmailVerification.tsx` | Verification handling | Status display, resend requests |
| `frontend/src/context/AuthContext.tsx` | Verification state | Email verification status management |

### Backend Files
| File Path | Purpose | Key Functions |
|-----------|---------|---------------|
| `backend/src/services/emailService.js` | Email functionality | Verification emails, notifications, templates |
| `backend/src/controllers/userController.js` | Email triggers | Registration verification, status updates |
| `backend/src/models/User.js` | Verification status | Email verification tracking, tokens |

## 🎯 Dashboard & Navigation

### Frontend Files
| File Path | Purpose | Key Functions |
|-----------|---------|---------------|
| `frontend/src/pages/ProviderDashboard.tsx` | Service provider main | Bookings, certifications, earnings, profile |
| `frontend/src/pages/SeekerDashboard.tsx` | Service seeker main | Service history, payments, reviews |
| `frontend/src/pages/AdminDashboard.tsx` | Administrative control | System monitoring, user management, disputes |
| `frontend/src/components/layout/Navbar.tsx` | Navigation | Menu items, user status, logout |
| `frontend/src/components/layout/Sidebar.tsx` | Side navigation | Role-based menu, quick actions |

## 🔍 Search & Discovery

### Frontend Files
| File Path | Purpose | Key Functions |
|-----------|---------|---------------|
| `frontend/src/components/services/ServiceProviderSearch.tsx` | Provider search | Filtering, location, ratings |
| `frontend/src/components/services/ServiceFilter.tsx` | Search filters | Category, price, availability |
| `frontend/src/components/services/ProviderCard.tsx` | Provider display | Profile summary, ratings, services |
| `frontend/src/pages/Services.tsx` | Services page | Service listing, search, comparison |

### Backend Files
| File Path | Purpose | Key Functions |
|-----------|---------|---------------|
| `backend/src/controllers/userController.js` | Provider search | Filtering logic, location search, rating filtering |
| `backend/src/models/User.js` | Search data | Provider information, ratings, availability |

## ⭐ Review & Rating System

### Frontend Files
| File Path | Purpose | Key Functions |
|-----------|---------|---------------|
| `frontend/src/components/reviews/ReviewForm.tsx` | Review submission | Rating categories, comments, photos |
| `frontend/src/components/reviews/ReviewCard.tsx` | Review display | Rating display, comments, responses |
| `frontend/src/pages/Reviews.tsx` | Reviews page | Review listing, filtering, statistics |

### Backend Files
| File Path | Purpose | Key Functions |
|-----------|---------|---------------|
| `backend/src/controllers/reviewController.js` | Review management | Create, update, rating calculations |
| `backend/src/models/Review.js` | Review schema | Rating data, comments, photos |
| `backend/src/routes/reviewRoutes.js` | Review endpoints | POST /reviews, GET /provider/:id/reviews |

## 🛠️ Admin Functions

### Frontend Files
| File Path | Purpose | Key Functions |
|-----------|---------|---------------|
| `frontend/src/pages/AdminDashboard.tsx` | Admin main interface | System overview, statistics, quick actions |
| `frontend/src/components/admin/DisputeManagement.tsx` | Dispute handling | Review, resolution, status updates |
| `frontend/src/components/admin/ViewDisputes.tsx` | Dispute listing | All disputes, filtering, search |
| `frontend/src/pages/AdminLogin.tsx` | Admin authentication | Secure admin login |

### Backend Files
| File Path | Purpose | Key Functions |
|-----------|---------|---------------|
| `backend/src/controllers/certificationController.js` | Certification approval | Admin review, approval/rejection, points |
| `backend/src/controllers/disputeController.js` | Dispute resolution | Admin investigation, decision making |
| `backend/src/controllers/userController.js` | User management | User monitoring, account management |

## 📊 Data Models & Schemas

### Core Models
| File Path | Purpose | Key Fields |
|-----------|---------|------------|
| `backend/src/models/User.js` | User accounts | name, email, role, password, points, certifications |
| `backend/src/models/Certification.js` | Certifications | type, title, points, status, filePath, serviceProvider |
| `backend/src/models/Booking.js` | Service bookings | serviceDescription, date, time, status, price, provider, seeker |
| `backend/src/models/Payment.js` | Payment records | amount, method, status, receipt, booking |
| `backend/src/models/Review.js` | Service reviews | rating, comment, photos, provider, seeker |
| `backend/src/models/Dispute.js` | Dispute cases | issue, evidence, status, resolution, parties |

## 🔧 Configuration & Utilities

### Configuration Files
| File Path | Purpose | Key Settings |
|-----------|---------|--------------|
| `backend/src/config/database.js` | Database configuration | MongoDB URI, connection options |
| `backend/src/config/email.js` | Email configuration | SMTP settings, API keys, templates |
| `backend/src/config/stripe.js` | Payment configuration | API keys, webhook endpoints |
| `frontend/src/lib/api.ts` | API configuration | Base URLs, endpoints, headers |

### Utility Files
| File Path | Purpose | Key Functions |
|-----------|---------|---------------|
| `backend/src/utils/common.js` | Common utilities | Helper functions, validations |
| `backend/src/utils/fileUpload.js` | File handling | Upload middleware, validation, storage |
| `frontend/src/utils/fileHelpers.ts` | Frontend file utils | File validation, preview, conversion |
| `frontend/src/lib/utils.ts` | General utilities | Helper functions, formatting |

## 🚀 Development & Testing

### Development Files
| File Path | Purpose | Key Functions |
|-----------|---------|---------------|
| `frontend/package.json` | Frontend dependencies | React, TypeScript, UI libraries |
| `backend/package.json` | Backend dependencies | Express, MongoDB, middleware |
| `frontend/vite.config.ts` | Build configuration | Vite settings, plugins, build options |
| `backend/server.js` | Server entry point | Express app, middleware setup, route registration |

### Testing Files
| File Path | Purpose | Key Functions |
|-----------|---------|---------------|
| `frontend/tests/` | Frontend tests | Component testing, unit tests |
| `backend/test_*.js` | Backend tests | API testing, integration tests |
| `frontend/jest.config.js` | Test configuration | Jest settings, test environment |

## 📁 File Dependencies & Relationships

### Authentication Flow Dependencies
```
LoginForm.tsx → AuthContext.tsx → api.ts → userController.js → User.js → database
```

### Certification Flow Dependencies
```
CertificationUpload.tsx → api.ts → certificationController.js → Certification.js + User.js → database
```

### Booking Flow Dependencies
```
BookingForm.tsx → api.ts → bookingController.js → Booking.js + User.js → database
```

### Payment Flow Dependencies
```
PaymentForm.tsx → stripe.ts → paymentController.js → Payment.js + Booking.js → database
```

## 🎯 Key Files for Viva

### Must-Know Files
1. **`frontend/src/context/AuthContext.tsx`** - Authentication logic
2. **`backend/src/controllers/userController.js`** - User management
3. **`backend/src/models/User.js`** - Data structure
4. **`frontend/src/components/profile/EditProfileForm.tsx`** - Role-based forms
5. **`backend/src/controllers/certificationController.js`** - Certification system

### Important Files
1. **`frontend/src/components/auth/RegisterForm.tsx`** - Registration flow
2. **`backend/src/middleware/auth.js`** - Security middleware
3. **`frontend/src/pages/ProviderDashboard.tsx`** - Provider functionality
4. **`backend/src/routes/`** - API endpoint definitions
5. **`frontend/src/services/api.ts`** - Frontend-backend communication

### Supporting Files
1. **`frontend/src/types/index.ts`** - Type definitions
2. **`backend/src/services/emailService.js`** - Email functionality
3. **`frontend/src/components/bookings/`** - Booking components
4. **`backend/src/models/`** - All data models
5. **`frontend/src/utils/`** - Helper functions

---

## 📚 File Mapping Summary

This document provides a complete mapping of all files in the FixerHub system, showing:
- **Purpose** of each file
- **Key functions** it handles
- **Dependencies** between components
- **File relationships** for different workflows

Use this mapping alongside the `DEVELOPER_GUIDE.md` for complete system understanding and viva preparation.
