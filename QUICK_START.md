# FixerHub - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites Check
```bash
# Check Node.js version (v16+ required)
node --version

# Check MongoDB (v5+ required)
mongod --version

# Check npm
npm --version
```

### 1. Clone & Setup
```bash
git clone <repository-url>
cd FixerHub

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Setup
```bash
# Backend (.env file)
cd backend
cp .env.example .env

# Edit .env with your values:
MONGODB_URI=mongodb://localhost:27017/fixerhub
JWT_SECRET=your_super_secret_key_here
EMAIL_SERVICE_API_KEY=your_email_api_key
```

### 3. Start Services
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - MongoDB (if not running as service)
mongod
```

### 4. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001
- **MongoDB**: mongodb://localhost:27017

## 🔑 Default Admin Account

After first run, create admin account:
```bash
cd backend
node createAdmin.js
```

**Default Credentials:**
- Email: admin@fixerhub.com
- Password: admin123

## 📱 Test User Flows

### Service Provider Registration
1. Go to `/register`
2. Select "Service Provider"
3. Fill all required fields
4. Upload profile picture (+25 points)
5. Verify email
6. Access provider dashboard

### Service Seeker Registration
1. Go to `/register`
2. Select "Homeowner"
3. Fill basic information
4. Verify email
5. Browse services

### Admin Functions
1. Login with admin credentials
2. Access `/admin/dashboard`
3. Review pending certifications
4. Manage disputes
5. Monitor system

## 🐛 Common Quick Fixes

### Frontend Not Loading
```bash
cd frontend
npm run build
npm run dev
```

### Backend Connection Error
```bash
cd backend
npm install
npm start
```

### Database Connection Failed
```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

### File Upload Issues
```bash
# Check upload directory permissions
cd backend
mkdir -p uploads/profiles uploads/certifications
chmod 755 uploads/
```

## 📊 System Health Check

### Backend Health
```bash
curl http://localhost:5001/api/health
```

### Database Status
```bash
# Connect to MongoDB
mongosh
# Check collections
show collections
# Check user count
db.users.countDocuments()
```

### Frontend Build
```bash
cd frontend
npm run build
# Should complete without errors
```

## 🔧 Development Commands

### Backend Development
```bash
cd backend
npm run dev          # Development mode with nodemon
npm run test         # Run tests
npm run lint         # Lint code
```

### Frontend Development
```bash
cd frontend
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Run tests
```

## 📁 Key Files & Directories

```
FixerHub/
├── backend/
│   ├── src/
│   │   ├── server.js              # Main server file
│   │   ├── models/                # Database models
│   │   ├── controllers/           # Business logic
│   │   └── routes/                # API endpoints
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── main.tsx              # App entry point
│   │   ├── components/            # Reusable components
│   │   └── pages/                 # Main pages
│   └── package.json
└── uploads/                       # File storage
```

## 🚨 Emergency Stop

If something goes wrong:
```bash
# Stop all processes
pkill -f "node"
pkill -f "npm"

# Clear ports
sudo lsof -ti:5001 | xargs kill -9
sudo lsof -ti:5173 | xargs kill -9

# Restart fresh
cd backend && npm start
cd frontend && npm run dev
```

## 📞 Need Help?

1. **Check logs** in terminal outputs
2. **Verify environment** variables
3. **Check file permissions** for uploads
4. **Restart services** if needed
5. **Check README.md** for detailed documentation

---

**Quick Start Complete!** 🎉

Your FixerHub application should now be running. Check the comprehensive README.md for detailed usage instructions and troubleshooting.
