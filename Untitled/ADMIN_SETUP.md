# FixerHub Admin System Setup

This document provides instructions for setting up and using the admin system in FixerHub.

## Features

The admin system includes the following features:

- **Dashboard Overview**: View statistics about users, service providers, and seekers
- **User Management**: View, edit, and delete users
- **Email Verification Management**: Toggle user email verification status
- **Service Provider Management**: Manage service provider accounts
- **Service Seeker Management**: Manage service seeker accounts
- **Statistics**: View detailed analytics about the platform

## Setup Instructions

### 1. Create Admin User

First, you need to create an admin user in the database. Run the following command from the backend directory:

```bash
cd backend
node createAdmin.js
```

This will create an admin user with the following credentials:
- **Email**: admin@fixerhub.com
- **Password**: admin123

### 2. Start the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend application:
```bash
cd frontend
npm run dev
```

### 3. Access Admin Dashboard

1. Navigate to the admin login page: `http://localhost:8080/admin/login`
2. Use the admin credentials:
   - Email: admin@fixerhub.com
   - Password: admin123
3. You will be redirected to the admin dashboard

## Admin Dashboard Features

### Overview Tab
- **Total Users**: Shows the total number of registered users
- **Service Providers**: Shows the number of service providers
- **Service Seekers**: Shows the number of service seekers
- **Recent Registrations**: Shows registrations from the last 7 days
- **Email Verification Status**: Shows verified vs unverified users
- **Service Categories**: Shows distribution of service providers by category

### Service Providers Tab
- View all service providers
- Edit provider information
- Delete provider accounts
- View provider ratings and details

### Service Seekers Tab
- View all service seekers
- Edit seeker information
- Delete seeker accounts

### All Users Tab
- View all users regardless of role
- Toggle email verification status
- Edit user information
- Delete user accounts

## API Endpoints

The admin system uses the following API endpoints:

- `POST /api/users/admin/login` - Admin login
- `GET /api/users/admin/users` - Get all users
- `PUT /api/users/admin/users/:id` - Update user
- `DELETE /api/users/admin/users/:id` - Delete user
- `GET /api/users/admin/stats` - Get dashboard statistics
- `PATCH /api/users/admin/users/:id/verify` - Toggle user verification

## Security Notes

- Admin credentials are stored in the database, not hardcoded
- Admin users have the role 'admin' in the database
- Admin routes should be protected with proper authentication middleware
- Consider implementing role-based access control for additional security

## Customization

You can customize the admin system by:

1. **Adding more statistics**: Modify the `getDashboardStats` function in `userController.js`
2. **Adding new admin features**: Create new controller functions and routes
3. **Customizing the UI**: Modify the React components in the frontend
4. **Adding more user management features**: Extend the user model and controller

## Troubleshooting

### Common Issues

1. **Admin login fails**: Make sure you've run the `createAdmin.js` script
2. **Statistics not loading**: Check that the backend server is running
3. **User management not working**: Verify that the API endpoints are accessible

### Database Issues

If you need to reset the admin user:

1. Delete the admin user from the database
2. Run `node createAdmin.js` again
3. Restart the backend server

## Future Enhancements

Potential improvements to the admin system:

- **Advanced Analytics**: Add charts and graphs for better data visualization
- **Bulk Operations**: Allow bulk editing and deletion of users
- **Audit Logs**: Track admin actions for security
- **User Activity Monitoring**: Monitor user login patterns and activity
- **Content Moderation**: Tools for moderating reviews and content
- **Payment Management**: Admin tools for managing payments and refunds 