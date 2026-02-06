// Test the public restaurants endpoint
async function testPublicRestaurants() {
  const baseUrl = 'http://localhost:5000/api';

  try {
    console.log('--- Testing /public/restaurants endpoint ---\n');

    const res = await fetch(`${baseUrl}/public/restaurants`);
    const data = await res.json();

    console.log(`Status: ${res.status}`);
    console.log(`Total restaurants: ${data.length}\n`);

    // Check first few restaurants
    data.slice(0, 3).forEach((r, index) => {
      console.log(`Restaurant ${index + 1}: ${r.name || 'No Name'}`);
      console.log(`  _id: ${r._id}`);
      console.log(`  email: ${r.email || 'N/A'}`);
      console.log(`  cuisineType: ${r.cuisineType || 'N/A'}`);
      console.log(`  isOpen: ${r.isOpen}`);
      console.log(`  profileImage: ${r.profileImage ? 'YES (' + r.profileImage.substring(0, 30) + '...)' : 'NO'}`);
      console.log(`  restaurantImage: ${r.restaurantImage ? 'YES (' + r.restaurantImage.substring(0, 30) + '...)' : 'NO'}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testPublicRestaurants();
