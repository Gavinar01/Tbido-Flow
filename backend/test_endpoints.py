import requests
import json

# Base URL for the Flask app
BASE_URL = "http://localhost:5000"

def test_venues_endpoint():
    """Test the venues endpoint"""
    print("Testing venues endpoint...")
    response = requests.get(f"{BASE_URL}/make-server-1bbfbc2f/venues")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    return response

def test_signup():
    """Test user signup"""
    print("\nTesting signup endpoint...")
    signup_data = {
        "email": "test@example.com",
        "password": "testpassword",
        "name": "Test User",
        "isAdmin": False
    }
    response = requests.post(f"{BASE_URL}/make-server-1bbfbc2f/signup", json=signup_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    return response

def test_login():
    """Test user login"""
    print("\nTesting login endpoint...")
    login_data = {
        "email": "test@example.com",
        "password": "testpassword"
    }
    response = requests.post(f"{BASE_URL}/make-server-1bbfbc2f/login", json=login_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    return response

if __name__ == "__main__":
    try:
        # Test venues endpoint (no authentication required)
        venues_response = test_venues_endpoint()
        
        # Test signup
        signup_response = test_signup()
        
        # Test login
        login_response = test_login()
        
        print("\nAll tests completed!")
    except Exception as e:
        print(f"Error during testing: {e}")
        print("Make sure the Flask server is running on port 5000")
