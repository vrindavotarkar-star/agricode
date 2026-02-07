# Sample API Requests

This document provides sample requests for testing the Kisan Call Centre Query Assistant API.

## Authentication

### Register a new user

```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "farmer_test",
    "email": "farmer@example.com",
    "mobile_number": "9876543210",
    "password": "testpassword123",
    "location": "Maharashtra",
    "crop_type": "Rice",
    "category": "small_farmer"
  }'
```

### Login

```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=farmer_test&password=testpassword123"
```

Response will include access token:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

## Query Processing

### Process agricultural query

```bash
curl -X POST "http://localhost:8000/api/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "query": "How to control pests in rice crop?"
  }'
```

Sample response:
```json
{
  "query": "How to control pests in rice crop?",
  "offline_response": "Pests like aphids can be controlled with neem oil or insecticidal soap. Integrated Pest Management combines biological, cultural, and chemical methods.",
  "ai_response": "For pest control in rice crops, consider these comprehensive approaches:\n\n1. **Cultural Methods**: Crop rotation and proper field sanitation\n2. **Biological Control**: Introduce natural predators like ladybugs\n3. **Chemical Control**: Use targeted insecticides when necessary\n4. **Prevention**: Regular field monitoring and early detection\n\nAlways follow local agricultural guidelines and consider environmental impact."
}
```

### Health check

```bash
curl -X GET "http://localhost:8000/health"
```

Response:
```json
{
  "status": "healthy",
  "message": "Kisan Call Centre API is running"
}
```

## Sample Queries

### Crop-related queries

1. "What are the best fertilizers for wheat?"
2. "How to prevent fungal diseases in tomatoes?"
3. "When is the best time to harvest rice?"
4. "What irrigation methods work best for cotton?"

### Pest and disease queries

1. "How to identify and treat aphids on crops?"
2. "What causes yellowing of leaves in rice plants?"
3. "How to control weeds in maize fields?"
4. "Signs of root rot in vegetables?"

### General farming queries

1. "What crops grow well in sandy soil?"
2. "How to improve soil fertility naturally?"
3. "Best practices for organic farming?"
4. "Weather considerations for planting?"

## Error Responses

### Invalid credentials
```json
{
  "detail": "Incorrect username or password"
}
```

### Missing authentication
```json
{
  "detail": "Not authenticated"
}
```

### Invalid token
```json
{
  "detail": "Could not validate credentials"
}
```

## Testing with Postman

1. Create a new request
2. Set method to POST
3. URL: `http://localhost:8000/auth/login`
4. Body: `x-www-form-urlencoded`
5. Add keys: `username`, `password`
6. Send request and copy the access_token
7. For subsequent requests, add Authorization header: `Bearer <access_token>`

## Testing with Python

```python
import requests

# Login
login_response = requests.post(
    "http://localhost:8000/auth/login",
    data={"username": "farmer_test", "password": "testpassword123"}
)
token = login_response.json()["access_token"]

# Query
headers = {"Authorization": f"Bearer {token}"}
query_response = requests.post(
    "http://localhost:8000/api/query",
    json={"query": "How to control pests in rice?"},
    headers=headers
)
print(query_response.json())
