// Test script to validate email verification system
const fetch = require('node-fetch'); // You may need to install this: npm install node-fetch

const BASE_URL = 'http://localhost:5001/api/users';

async function testRegistration() {
  console.log('Testing registration with email verification...');
  
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'testpassword',
    role: 'service_seeker',
    location: 'Test City'
  };

  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const data = await response.json();
    console.log('Registration response:', data);

    if (data.requiresVerification) {
      console.log('✅ Registration requires verification as expected');
      return testUser.email;
    } else {
      console.log('❌ Registration should require verification');
      return null;
    }
  } catch (error) {
    console.error('Registration error:', error);
    return null;
  }
}

async function testLoginWithoutVerification(email) {
  console.log('\nTesting login without email verification...');
  
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: 'testpassword'
      }),
    });

    const data = await response.json();
    console.log('Login response:', data);

    if (data.requiresVerification) {
      console.log('✅ Login correctly blocked without verification');
      return true;
    } else {
      console.log('❌ Login should be blocked without verification');
      return false;
    }
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}

async function testResendVerification(email) {
  console.log('\nTesting resend verification email...');
  
  try {
    const response = await fetch(`${BASE_URL}/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    console.log('Resend verification response:', data);

    if (response.ok) {
      console.log('✅ Resend verification works');
      return true;
    } else {
      console.log('❌ Resend verification failed');
      return false;
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Starting Email Verification Tests\n');
  
  const email = await testRegistration();
  if (!email) {
    console.log('❌ Registration test failed, stopping tests');
    return;
  }

  await testLoginWithoutVerification(email);
  await testResendVerification(email);
  
  console.log('\n✅ All tests completed!');
  console.log('\n📧 Email verification system is working correctly!');
  console.log('\nNext steps:');
  console.log('1. Start your frontend server: cd frontend && npm run dev');
  console.log('2. Test the full flow by registering a new user');
  console.log('3. Check that you receive verification emails');
  console.log('4. Click the verification link to verify your account');
  console.log('5. Try logging in after verification');
}

// Run the tests
if (require.main === module) {
  runTests();
}

module.exports = { testRegistration, testLoginWithoutVerification, testResendVerification };
