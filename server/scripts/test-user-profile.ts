import "dotenv/config";

async function testUserProfile() {
  try {
    // First, sign in to get a token
    const signinResponse = await fetch('http://localhost:8080/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'user@test.com',
        password: 'test123'
      })
    });

    if (!signinResponse.ok) {
      console.log('❌ Signin failed:', await signinResponse.text());
      return;
    }

    const signinData = await signinResponse.json();
    const token = signinData.token;
    console.log('✅ Signin successful, got token');

    // Test getting profile
    const getProfileResponse = await fetch('http://localhost:8080/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    console.log('Profile GET response status:', getProfileResponse.status);
    if (getProfileResponse.ok) {
      const profileData = await getProfileResponse.json();
      console.log('✅ Profile retrieved:', profileData.user);
    } else {
      console.log('❌ Profile GET failed:', await getProfileResponse.text());
    }

    // Test updating profile
    const updateProfileResponse = await fetch('http://localhost:8080/api/user/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Updated',
        lastName: 'User',
        organization: 'Test Organization'
      })
    });

    console.log('Profile UPDATE response status:', updateProfileResponse.status);
    if (updateProfileResponse.ok) {
      const updateData = await updateProfileResponse.json();
      console.log('✅ Profile updated:', updateData.user);
    } else {
      console.log('❌ Profile UPDATE failed:', await updateProfileResponse.text());
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUserProfile();
