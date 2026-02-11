// Simple test to check restaurants endpoint
const baseUrl = 'http://localhost:5000/api';

async function testRestaurantsEndpoint() {
  try {
    console.log('Testing /public/restaurants endpoint...\n');

    const response = await fetch(`${baseUrl}/public/restaurants`);
    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Total restaurants found: ${data.restaurants?.length || 0}\n`);

    if (data.restaurants && data.restaurants.length > 0) {
      console.log('=== RESTAURANTS LIST ===');
      data.restaurants.forEach((restaurant, index) => {
        console.log(`\n${index + 1}. ${restaurant.name || 'NO NAME'}`);
        console.log(`   ID: ${restaurant._id}`);
        console.log(`   Role: ${restaurant.role}`);
        console.log(`   Cuisine: ${restaurant.cuisineType || 'NOT SET'}`);
        console.log(`   Is Open: ${restaurant.isOpen}`);
        console.log(`   Has Image: ${restaurant.restaurantImage ? 'YES' : 'NO'}`);
        console.log(`   Created: ${new Date(restaurant.createdAt).toLocaleString()}`);
      });
    } else {
      console.log('⚠️ NO RESTAURANTS FOUND!');
      console.log('This means either:');
      console.log('1. No restaurant accounts exist in the database');
      console.log('2. Restaurant accounts exist but don\'t match the query criteria');
      console.log('3. There\'s an issue with the backend endpoint');
    }

    console.log('\n=== PAGINATION INFO ===');
    console.log(JSON.stringify(data.pagination, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testRestaurantsEndpoint();
