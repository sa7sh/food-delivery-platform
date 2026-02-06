// Test food items endpoints
async function testFoods() {
  const baseUrl = 'http://localhost:5000/api';

  try {
    // Test 1: Get all public food items
    console.log('--- TEST 1: Get All Public Foods ---');
    const res1 = await fetch(`${baseUrl}/foods`);
    const data1 = await res1.json();
    console.log(`Status: ${res1.status}`);
    if (Array.isArray(data1)) {
      console.log(`Count: ${data1.length}`);
      data1.slice(0, 5).forEach(f => console.log(`- ${f.name} (Category: ${f.category}, Available: ${f.isAvailable})`));
    } else {
      console.log('Response:', data1);
    }

    // Test 2: Login as a restaurant
    console.log('\n--- TEST 2: Login as Restaurant ---');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@restaurant.com',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    console.log(`Status: ${loginRes.status}`);
    console.log('Login Response:', loginData.success ? 'Success' : 'Failed');

    if (!loginData.token) {
      console.log('No token received. Cannot test authenticated endpoints.');
      return;
    }

    const token = loginData.token;
    console.log('Token:', token.substring(0, 20) + '...');

    // Test 3: Get my foods (authenticated)
    console.log('\n--- TEST 3: Get My Foods (Authenticated) ---');
    const res3 = await fetch(`${baseUrl}/foods/my-foods`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data3 = await res3.json();
    console.log(`Status: ${res3.status}`);
    if (Array.isArray(data3)) {
      console.log(`Count: ${data3.length}`);
      data3.forEach(f => console.log(`- ${f.name} (Category: ${f.category}, Available: ${f.isAvailable})`));
    } else {
      console.log('Response:', data3);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testFoods();
