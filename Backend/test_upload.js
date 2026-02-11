
const API_URL = 'http://localhost:5000/api';

async function runTest() {
  try {
    console.log('1. Registering new test user...');
    const email = `test_${Date.now()}@test.com`;
    const password = 'password123';

    let token;

    // Register
    const regRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, phone: '1234567890', role: 'restaurant' })
    });

    if (!regRes.ok) {
      console.error('Registration failed:', await regRes.text());
      return;
    }
    console.log('   Registration successful');

    // Login
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!loginRes.ok) {
      console.error('Login failed:', await loginRes.text());
      return;
    }

    const loginData = await loginRes.json();
    token = loginData.token;
    console.log('   Login successful, token obtained');


    console.log('2. Preparing Image Payload...');
    // Create a dummy base64 image (small red dot)
    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';

    console.log('   Image string length:', base64Image.length);

    console.log('3. Sending PUT /restaurant/profile...');
    const updateRes = await fetch(`${API_URL}/restaurant/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Debug Restaurant',
        restaurantImage: base64Image
      })
    });

    if (!updateRes.ok) {
      console.error('Update failed:', await updateRes.text());
      return;
    }

    const updateData = await updateRes.json();
    console.log('   Update response:', updateRes.status);
    console.log('   Response body (restaurantImage present?):', !!updateData.restaurantImage);


    console.log('4. Verifying via GET /restaurant/profile...');
    const getRes = await fetch(`${API_URL}/restaurant/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!getRes.ok) {
      console.error('GET failed:', await getRes.text());
      return;
    }

    const getData = await getRes.json();
    console.log('   GET Response (restaurantImage present?):', !!getData.restaurantImage);
    console.log('   GET Response (name):', getData.name);

    if (getData.name === 'Debug Restaurant') {
      console.log('✅ SUCCESS: specific name updated.');
    } else {
      console.log('❌ FAILURE: Name did not update.');
    }

    if (getData.restaurantImage === base64Image) {
      console.log('✅ SUCCESS: Image saved and retrieved correctly!');
    } else {
      console.log('❌ FAILURE: Image content mismatch or missing.');
      console.log('   Retrieved:', getData.restaurantImage ? getData.restaurantImage.substring(0, 20) + '...' : 'null');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

runTest();
