import requests
import json

# Base URL for the Flask backend
BASE_URL = 'http://localhost:5000'

def test_signup():
    print("Testing user signup...")
    url = f"{BASE_URL}/make-server-1bbfbc2f/signup"
    data = {
        "email": "test@example.com",
        "password": "password123",
        "name": "Test User",
        "isAdmin": False
    }
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.json().get('access_token')

def test_login():
    print("\nTesting user login...")
    url = f"{BASE_URL}/make-server-1bbfbc2f/login"
    data = {
        "email": "test@example.com",
        "password": "password123"
    }
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.json().get('access_token')

def test_get_venues(token):
    print("\nTesting get venues...")
    url = f"{BASE_URL}/make-server-1bbfbc2f/venues"
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(url, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

def test_create_reservation(token):
    print("\nTesting create reservation...")
    url = f"{BASE_URL}/make-server-1bbfbc2f/reservations"
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    data = {
        "venue": "1",
        "purpose": "Team Meeting",
        "date": "2023-12-15",
        "startTime": "09:00",
        "endTime": "10:00",
        "name": "Test User",
        "organization": "Test Org",
        "maxParticipants": 10
    }
    response = requests.post(url, headers=headers, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

def test_get_reservations(token):
    print("\nTesting get reservations...")
    url = f"{BASE_URL}/make-server-1bbfbc2f/reservations"
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(url, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

if __name__ == '__main__':
    try:
        # Test signup
        token = test_signup()
        
        # Test login
        if not token:
            token = test_login()
        
        # Test get venues
        test_get_venues(token)
        
        # Test create reservation
        test_create_reservation(token)
        
        # Test get reservations
        test_get_reservations(token)
        
    except Exception as e:
        print(f"Error during testing: {str(e)}")
        print("Make sure the Flask backend is running on port 5000")
