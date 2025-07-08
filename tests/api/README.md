# DevDeck API Testing

Comprehensive testing suite for DevDeck API endpoints.

## Quick Start

1. **Set environment variables:**
   ```bash
   export API_BASE_URL="http://localhost:5000"
   export TEST_JWT_TOKEN="your-jwt-token"
   ```

2. **Run all tests:**
   ```bash
   ./test-api.sh
   ```

## Test Scripts

### Automated Testing
- `test-api.sh` - Comprehensive API endpoint testing
- `test-results.json` - Test results in JSON format
- `test.log` - Detailed test execution log

### Manual Testing
- `DevDeck-API.postman_collection.json` - Postman collection
- `openapi.yaml` - OpenAPI 3.0 specification

## Test Categories

### 1. Health Check Tests
- Application health status
- Service connectivity
- Performance benchmarks

### 2. Authentication Tests
- GitHub OAuth flow
- JWT token validation
- User session management

### 3. Portfolio API Tests
- CRUD operations
- Public portfolio access
- Permission validation

### 4. Error Handling Tests
- Invalid requests
- Unauthorized access
- Rate limiting

### 5. Performance Tests
- Response time validation
- Load testing scenarios
- Resource usage monitoring

## Environment Configuration

### Required Variables
```bash
# API endpoint
API_BASE_URL="https://your-backend.railway.app"

# Authentication (for authenticated tests)
TEST_JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Optional: Test data
TEST_USER_ID="user_id"
TEST_PORTFOLIO_ID="portfolio_id"
```

### Development Setup
```bash
# Local development
export API_BASE_URL="http://localhost:5000"

# Get JWT token from browser dev tools after login
export TEST_JWT_TOKEN="your-local-jwt-token"
```

### Production Testing
```bash
# Production environment
export API_BASE_URL="https://your-backend.railway.app"
export TEST_JWT_TOKEN="your-production-jwt-token"
```

## Test Execution

### Command Line Testing
```bash
# Run all tests
./test-api.sh

# Run with custom configuration
API_BASE_URL="https://staging.api.com" ./test-api.sh

# Run specific test category
# (modify script to include category flags)
```

### Postman Testing
1. Import `DevDeck-API.postman_collection.json`
2. Set environment variables:
   - `base_url`: Your API base URL
   - `jwt_token`: Your JWT token
3. Run collection or individual requests

### OpenAPI Testing
1. Use tools like Swagger UI or Insomnia
2. Import `openapi.yaml`
3. Configure authentication and base URL
4. Test endpoints interactively

## Test Results

### Success Criteria
- All health checks pass
- Authentication flow works
- CRUD operations function correctly
- Error handling is appropriate
- Performance meets requirements

### Result Formats

**Console Output:**
```
=== DevDeck API Testing ===
🧪 Testing: Health Check
✅ Health Check - Status: 200

📊 Test Results Summary
Total Tests: 15
Passed: 14
Failed: 1
Success Rate: 93%
```

**JSON Report (`test-results.json`):**
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "summary": {
    "total": 15,
    "passed": 14,
    "failed": 1,
    "success_rate": 93
  },
  "tests": {
    "Health Check": {"status": "PASS", "code": 200},
    "Get User Profile": {"status": "FAIL", "expected": 200, "actual": 401}
  }
}
```

## Continuous Integration

### GitHub Actions
```yaml
name: API Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run API Tests
        env:
          API_BASE_URL: ${{ secrets.API_BASE_URL }}
          TEST_JWT_TOKEN: ${{ secrets.TEST_JWT_TOKEN }}
        run: |
          chmod +x tests/api/test-api.sh
          tests/api/test-api.sh
```

### Local Pre-commit Hook
```bash
#!/bin/sh
# .git/hooks/pre-commit
echo "Running API tests..."
cd tests/api
./test-api.sh
if [ $? -ne 0 ]; then
  echo "API tests failed. Commit aborted."
  exit 1
fi
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if API server is running
   - Verify base URL is correct
   - Ensure firewall allows connections

2. **Authentication Errors**
   - Verify JWT token is valid and not expired
   - Check token format (Bearer prefix)
   - Ensure user has required permissions

3. **Rate Limiting**
   - Reduce request frequency
   - Implement proper retry logic
   - Use different IP addresses for testing

4. **Timeout Issues**
   - Increase timeout values
   - Check network connectivity
   - Monitor server performance

### Performance Benchmarks

- Health endpoint: < 100ms
- Authentication: < 500ms
- Portfolio CRUD: < 1000ms
- Analytics queries: < 2000ms

### Best Practices

1. **Test Data Management**
   - Use dedicated test accounts
   - Clean up test data after runs
   - Avoid testing with production data

2. **Error Handling**
   - Test both success and failure scenarios
   - Validate error response formats
   - Check appropriate HTTP status codes

3. **Security Testing**
   - Test unauthorized access attempts
   - Validate input sanitization
   - Check for information disclosure

4. **Performance Testing**
   - Monitor response times
   - Test under load conditions
   - Validate resource usage

## Resources

- [API Documentation](../docs/api/README.md)
- [Postman Collection](../docs/api/DevDeck-API.postman_collection.json)
- [OpenAPI Specification](../docs/api/openapi.yaml)
- [DevDeck Repository](https://github.com/your-org/devdeck)
