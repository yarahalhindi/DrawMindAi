import urllib.request
import json

# The data we want to send to your database
data = {
    "full_name": "Test User",
    "email": "newtest@email.com",
    "password": "password123",
    "user_role": "Mother"
}

# The request setup
req = urllib.request.Request("http://127.0.0.1:8000/signup", method="POST")
req.add_header('Content-Type', 'application/json')
json_data = json.dumps(data).encode('utf-8')

# Send it and print the result!
try:
    response = urllib.request.urlopen(req, data=json_data)
    print("🐳 RESPONSE FROM NEON:", response.read().decode('utf-8'))
except Exception as e:
    print("❌ ERROR:", e)