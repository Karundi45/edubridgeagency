import http from 'http';

async function testRegistration() {
  const url = 'http://localhost:3002/api/auth/register';
  console.log('Testing Registration at', url);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test' + Date.now() + '@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        acceptTerms: true
      })
    });

    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testRegistration();
