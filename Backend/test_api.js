
async function testApi() {
  const baseUrl = 'http://localhost:5000/api/public/restaurants';

  try {
    console.log('--- TEST 1: No Params ---');
    const res1 = await fetch(baseUrl);
    const data1 = await res1.json();
    if (Array.isArray(data1)) {
      console.log(`Count: ${data1.length}`);
      data1.forEach(r => console.log(`- ${r.name} (Cuisine: ${r.cuisineType}, Open: ${r.isOpen})`));
    } else {
      console.log('Response:', data1);
    }

    console.log('\n--- TEST 2: Filter by Cuisine "Burger" ---');
    // Using simple query string since we don't have axios params
    const res2 = await fetch(`${baseUrl}?cuisine=Burger`);
    const data2 = await res2.json();
    console.log(`Count: ${data2.length} `);
    data2.forEach(r => console.log(`- ${r.name} (Cuisine: ${r.cuisineType}, Open: ${r.isOpen})`));

    console.log('\n--- TEST 3: Filter by isOpen=true ---');
    const res3 = await fetch(`${baseUrl}?isOpen=true`);
    const data3 = await res3.json();
    console.log(`Count: ${data3.length} `);
    data3.forEach(r => console.log(`- ${r.name} (Cuisine: ${r.cuisineType}, Open: ${r.isOpen})`));

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testApi();
