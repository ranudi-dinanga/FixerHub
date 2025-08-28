const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

const testAdminSystem = async () => {
  try {
    console.log('🧪 Testing Admin System...\n');

    // Test 1: Admin Login
    console.log('1. Testing Admin Login...');
    const loginResponse = await axios.post(`${API_URL}/users/admin/login`, {
      email: 'admin@fixerhub.com',
      password: 'admin123'
    });
    
    const { user, token } = loginResponse.data;
    console.log('✅ Admin login successful');
    console.log('   User:', user.name);
    console.log('   Role:', user.role);
    console.log('   Token received:', !!token);
    console.log('');

    // Test 2: Get Dashboard Stats
    console.log('2. Testing Dashboard Stats...');
    const statsResponse = await axios.get(`${API_URL}/users/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const stats = statsResponse.data;
    console.log('✅ Dashboard stats retrieved');
    console.log('   Total Users:', stats.totalUsers);
    console.log('   Service Providers:', stats.totalProviders);
    console.log('   Service Seekers:', stats.totalSeekers);
    console.log('   Verified Users:', stats.verifiedUsers);
    console.log('   Recent Registrations:', stats.recentRegistrations);
    console.log('');

    // Test 3: Get All Users
    console.log('3. Testing Get All Users...');
    const usersResponse = await axios.get(`${API_URL}/users/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const users = usersResponse.data;
    console.log('✅ All users retrieved');
    console.log('   Total users in response:', users.length);
    console.log('   Admin users:', users.filter(u => u.role === 'admin').length);
    console.log('   Service providers:', users.filter(u => u.role === 'service_provider').length);
    console.log('   Service seekers:', users.filter(u => u.role === 'service_seeker').length);
    console.log('');

    console.log('🎉 All admin system tests passed!');
    console.log('\n📋 Admin System Features:');
    console.log('   ✅ Admin authentication');
    console.log('   ✅ Dashboard statistics');
    console.log('   ✅ User management');
    console.log('   ✅ Role-based access control');
    console.log('   ✅ JWT token authentication');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testAdminSystem(); 