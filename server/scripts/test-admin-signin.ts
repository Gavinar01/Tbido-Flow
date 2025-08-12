import "dotenv/config";

async function testAdminSignin() {
  try {
    const response = await fetch('http://localhost:8080/api/auth/admin/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@venuebook.com',
        password: 'admin123'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ Admin signin successful:', data);
      } catch (e) {
        console.log('Response is not JSON:', responseText);
      }
    } else {
      console.log('❌ Admin signin failed');
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error data:', errorData);
      } catch (e) {
        console.log('Error response is not JSON:', responseText);
      }
    }
  } catch (error) {
    console.error('❌ Request failed:', error);
  }
}

testAdminSignin();
