#!/bin/bash

# DevDeck API Documentation Generator
# Creates comprehensive API documentation and testing scripts

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[API-DOCS]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}[DOCS]${NC} $1"
}

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DOCS_DIR="$PROJECT_ROOT/docs/api"
TESTS_DIR="$PROJECT_ROOT/tests/api"
LOG_FILE="$DOCS_DIR/generation.log"

# Create directories
mkdir -p "$DOCS_DIR"
mkdir -p "$TESTS_DIR"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

print_header "DevDeck API Documentation Generator"
log "Starting API documentation generation"

# 1. Create comprehensive API documentation
print_status "Creating API documentation..."
cat > "$DOCS_DIR/README.md" << 'EOF'
# DevDeck API Documentation

Comprehensive API documentation for DevDeck - Developer Portfolio Platform.

## Base URL

- **Production:** `https://your-backend.railway.app`
- **Development:** `http://localhost:5000`

## Authentication

DevDeck uses GitHub OAuth for authentication and JWT tokens for API access.

### Authentication Flow

1. **GitHub OAuth Login**
   ```
   GET /auth/github
   ```

2. **GitHub OAuth Callback**
   ```
   GET /auth/github/callback
   ```

3. **Get Current User**
   ```
   GET /auth/me
   Headers: Authorization: Bearer <jwt_token>
   ```

4. **Logout**
   ```
   POST /auth/logout
   Headers: Authorization: Bearer <jwt_token>
   ```

## API Endpoints

### Health Check

#### GET /health
Returns the health status of the application and its services.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600,
  "services": {
    "database": {
      "status": "connected",
      "host": "mongodb://...",
      "name": "devdeck"
    },
    "cache": {
      "status": "connected"
    }
  },
  "version": "1.0.0"
}
```

### User Management

#### GET /api/users/profile
Get current user's profile information.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "githubId": 12345,
    "username": "johndoe",
    "email": "john@example.com",
    "name": "John Doe",
    "avatar": "https://github.com/johndoe.png",
    "bio": "Full-stack developer",
    "location": "San Francisco, CA",
    "website": "https://johndoe.dev",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### PUT /api/users/profile
Update current user's profile information.

**Headers:**
- `Authorization: Bearer <jwt_token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "John Doe",
  "bio": "Full-stack developer passionate about React and Node.js",
  "location": "San Francisco, CA",
  "website": "https://johndoe.dev"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    // Updated user object
  }
}
```

### Portfolio Management

#### GET /api/portfolio
Get current user's portfolios.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sort` (optional): Sort field (default: createdAt)
- `order` (optional): Sort order (asc/desc, default: desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "portfolios": [
      {
        "id": "portfolio_id",
        "title": "My Portfolio",
        "slug": "my-portfolio",
        "description": "A showcase of my work",
        "isPublic": true,
        "theme": "modern",
        "customDomain": null,
        "views": 150,
        "content": {
          "bio": "I'm a passionate developer...",
          "skills": ["React", "Node.js", "MongoDB"],
          "experience": [],
          "education": [],
          "contact": {
            "email": "john@example.com",
            "linkedin": "johndoe",
            "github": "johndoe"
          }
        },
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### POST /api/portfolio
Create a new portfolio.

**Headers:**
- `Authorization: Bearer <jwt_token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "title": "My New Portfolio",
  "description": "A showcase of my latest work",
  "isPublic": true,
  "theme": "modern"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Portfolio created successfully",
  "data": {
    // Created portfolio object
  }
}
```

#### GET /api/portfolio/:id
Get a specific portfolio by ID.

**Headers:**
- `Authorization: Bearer <jwt_token>` (for private portfolios)

**Response:**
```json
{
  "success": true,
  "data": {
    // Portfolio object
  }
}
```

#### PUT /api/portfolio/:id
Update a specific portfolio.

**Headers:**
- `Authorization: Bearer <jwt_token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "title": "Updated Portfolio Title",
  "description": "Updated description",
  "isPublic": false,
  "content": {
    "bio": "Updated bio...",
    "skills": ["React", "Node.js", "TypeScript"]
  }
}
```

#### DELETE /api/portfolio/:id
Delete a specific portfolio.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Response:**
```json
{
  "success": true,
  "message": "Portfolio deleted successfully"
}
```

### Public Portfolio Access

#### GET /api/portfolio/public/:slug
Get a public portfolio by slug.

**Response:**
```json
{
  "success": true,
  "data": {
    // Public portfolio object
  }
}
```

#### GET /api/portfolio/public/user/:username
Get all public portfolios for a user.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "username": "johndoe",
      "name": "John Doe",
      "avatar": "https://github.com/johndoe.png"
    },
    "portfolios": [],
    "pagination": {}
  }
}
```

### Project Management

#### GET /api/projects
Get projects for current user.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Query Parameters:**
- `portfolioId` (optional): Filter by portfolio
- `featured` (optional): Filter featured projects
- `status` (optional): Filter by status

#### POST /api/projects
Create a new project.

**Headers:**
- `Authorization: Bearer <jwt_token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "portfolioId": "portfolio_id",
  "title": "My Project",
  "description": "Project description",
  "technologies": ["React", "Node.js"],
  "githubUrl": "https://github.com/user/repo",
  "liveUrl": "https://project.com",
  "featured": true,
  "status": "completed"
}
```

#### PUT /api/projects/:id
Update a project.

#### DELETE /api/projects/:id
Delete a project.

### Analytics

#### GET /api/analytics/portfolio/:id
Get analytics for a portfolio.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Query Parameters:**
- `startDate` (optional): Start date for analytics
- `endDate` (optional): End date for analytics
- `granularity` (optional): day/week/month

**Response:**
```json
{
  "success": true,
  "data": {
    "totalViews": 1500,
    "uniqueVisitors": 800,
    "viewsToday": 25,
    "topReferrers": [
      {"source": "github.com", "count": 300},
      {"source": "linkedin.com", "count": 200}
    ],
    "viewsByDate": [
      {"date": "2024-01-15", "views": 25, "visitors": 20}
    ]
  }
}
```

#### POST /api/analytics/track
Track a portfolio view or interaction.

**Request Body:**
```json
{
  "portfolioId": "portfolio_id",
  "event": "view",
  "source": "direct",
  "userAgent": "Mozilla/5.0...",
  "ip": "192.168.1.1"
}
```

## Error Responses

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Invalid email format"
    }
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` (401): Invalid or missing authentication
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid input data
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

## Rate Limiting

- **General API:** 100 requests per 15 minutes per IP
- **Authentication:** 5 requests per 15 minutes per IP
- **Analytics tracking:** 1000 requests per hour per IP

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page`: Page number (1-based, default: 1)
- `limit`: Items per page (max: 100, default: 10)
- `sort`: Sort field
- `order`: Sort order (asc/desc)

**Response Format:**
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## WebSocket Events

DevDeck supports real-time updates via WebSocket:

**Connection:** `ws://localhost:5000` or `wss://your-backend.railway.app`

**Events:**
- `portfolio:updated` - Portfolio was updated
- `analytics:view` - New portfolio view
- `project:created` - New project added

## SDKs and Tools

### JavaScript/TypeScript SDK
```javascript
import { DevDeckAPI } from '@devdeck/api-client';

const api = new DevDeckAPI({
  baseURL: 'https://your-backend.railway.app',
  token: 'your-jwt-token'
});

// Get user profile
const profile = await api.users.getProfile();

// Create portfolio
const portfolio = await api.portfolios.create({
  title: 'My Portfolio',
  description: 'A showcase of my work'
});
```

### cURL Examples

**Get Health Status:**
```bash
curl -X GET https://your-backend.railway.app/health
```

**Get User Profile:**
```bash
curl -X GET https://your-backend.railway.app/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Create Portfolio:**
```bash
curl -X POST https://your-backend.railway.app/api/portfolio \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Portfolio",
    "description": "A showcase of my work",
    "isPublic": true
  }'
```

## Testing

See the [API Testing Guide](../tests/README.md) for comprehensive testing examples and tools.

## Support

For API support and questions:
- GitHub Issues: [DevDeck Repository](https://github.com/your-org/devdeck)
- Documentation: [Full Documentation](https://docs.devdeck.dev)
EOF

print_success "API documentation created"

# 2. Create API testing scripts
print_status "Creating API testing scripts..."
cat > "$TESTS_DIR/test-api.sh" << 'EOF'
#!/bin/bash

# DevDeck API Testing Script
# Comprehensive API endpoint testing

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Configuration
BASE_URL="${API_BASE_URL:-http://localhost:5000}"
TEST_TOKEN="${TEST_JWT_TOKEN:-}"
TEST_RESULTS_FILE="$(dirname "$0")/test-results.json"
LOG_FILE="$(dirname "$0")/test.log"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Logging
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Test result tracking
test_results=()

# Print functions
print_header() {
    echo -e "${PURPLE}=== $1 ===${NC}"
}

print_test() {
    echo -e "${BLUE}🧪 Testing: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_failure() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# HTTP request function
make_request() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local auth_required="$4"
    local expected_status="$5"
    
    local url="$BASE_URL$endpoint"
    local headers="-H 'Content-Type: application/json'"
    
    if [ "$auth_required" = "true" ] && [ ! -z "$TEST_TOKEN" ]; then
        headers="$headers -H 'Authorization: Bearer $TEST_TOKEN'"
    fi
    
    local curl_cmd="curl -s -w '%{http_code}' -X $method $headers"
    
    if [ ! -z "$data" ]; then
        curl_cmd="$curl_cmd -d '$data'"
    fi
    
    curl_cmd="$curl_cmd '$url'"
    
    local response=$(eval $curl_cmd)
    local status_code="${response: -3}"
    local body="${response%???}"
    
    echo "$status_code|$body"
}

# Test function
run_test() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local auth_required="$5"
    local expected_status="$6"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    print_test "$test_name"
    
    local result=$(make_request "$method" "$endpoint" "$data" "$auth_required" "$expected_status")
    local status_code="${result%%|*}"
    local response_body="${result#*|}"
    
    log "Test: $test_name - Status: $status_code"
    
    if [ "$status_code" = "$expected_status" ]; then
        print_success "$test_name - Status: $status_code"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        test_results+=("\"$test_name\": {\"status\": \"PASS\", \"code\": $status_code}")
    else
        print_failure "$test_name - Expected: $expected_status, Got: $status_code"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        test_results+=("\"$test_name\": {\"status\": \"FAIL\", \"expected\": $expected_status, \"actual\": $status_code}")
        
        # Log response for debugging
        if [ ! -z "$response_body" ]; then
            log "Response: $response_body"
        fi
    fi
    
    echo
}

# Performance test function
performance_test() {
    local test_name="$1"
    local endpoint="$2"
    local max_time="$3"
    
    print_test "Performance: $test_name"
    
    local start_time=$(date +%s%N)
    local result=$(make_request "GET" "$endpoint" "" "false" "200")
    local end_time=$(date +%s%N)
    
    local duration=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
    
    if [ $duration -le $max_time ]; then
        print_success "$test_name - ${duration}ms (under ${max_time}ms)"
    else
        print_warning "$test_name - ${duration}ms (over ${max_time}ms)"
    fi
    
    echo
}

# Main testing function
run_api_tests() {
    print_header "DevDeck API Testing"
    echo "Base URL: $BASE_URL"
    echo "Test Token: ${TEST_TOKEN:+[SET]}${TEST_TOKEN:-[NOT SET]}"
    echo
    
    # Clear previous results
    > "$LOG_FILE"
    test_results=()
    
    # Health Check Tests
    print_header "Health Check Tests"
    run_test "Health Check" "GET" "/health" "" "false" "200"
    
    # Performance Tests
    print_header "Performance Tests"
    performance_test "Health Endpoint Performance" "/health" 1000
    
    # Authentication Tests
    print_header "Authentication Tests"
    run_test "GitHub OAuth Redirect" "GET" "/auth/github" "" "false" "302"
    
    if [ ! -z "$TEST_TOKEN" ]; then
        run_test "Get Current User" "GET" "/auth/me" "" "true" "200"
    else
        print_warning "Skipping authenticated tests - no token provided"
    fi
    
    # Public API Tests
    print_header "Public API Tests"
    run_test "Public Portfolio Test" "GET" "/api/portfolio/public/test" "" "false" "200"
    
    # Portfolio API Tests (if authenticated)
    if [ ! -z "$TEST_TOKEN" ]; then
        print_header "Portfolio API Tests"
        run_test "Get User Portfolios" "GET" "/api/portfolio" "" "true" "200"
        
        # Test portfolio creation
        local portfolio_data='{
            "title": "Test Portfolio",
            "description": "API Test Portfolio",
            "isPublic": true
        }'
        run_test "Create Portfolio" "POST" "/api/portfolio" "$portfolio_data" "true" "201"
    fi
    
    # Error Handling Tests
    print_header "Error Handling Tests"
    run_test "Not Found" "GET" "/api/nonexistent" "" "false" "404"
    run_test "Unauthorized Access" "GET" "/api/portfolio" "" "false" "401"
    
    # Rate Limiting Tests
    print_header "Rate Limiting Tests"
    print_test "Rate Limiting Test"
    echo "Making 10 rapid requests to test rate limiting..."
    
    local rate_limit_hit=false
    for i in {1..10}; do
        local result=$(make_request "GET" "/health" "" "false" "200")
        local status_code="${result%%|*}"
        
        if [ "$status_code" = "429" ]; then
            rate_limit_hit=true
            break
        fi
        sleep 0.1
    done
    
    if [ "$rate_limit_hit" = true ]; then
        print_success "Rate limiting is working"
    else
        print_warning "Rate limiting not triggered (may need more requests)"
    fi
    echo
}

# Generate test report
generate_report() {
    print_header "Test Results Summary"
    echo "Total Tests: $TOTAL_TESTS"
    echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
    
    local success_rate=0
    if [ $TOTAL_TESTS -gt 0 ]; then
        success_rate=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))
    fi
    
    echo "Success Rate: $success_rate%"
    echo
    
    # Generate JSON report
    local json_results=$(IFS=','; echo "${test_results[*]}")
    cat > "$TEST_RESULTS_FILE" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "summary": {
    "total": $TOTAL_TESTS,
    "passed": $PASSED_TESTS,
    "failed": $FAILED_TESTS,
    "success_rate": $success_rate
  },
  "tests": {
    $json_results
  }
}
EOF
    
    echo "Detailed results saved to: $TEST_RESULTS_FILE"
    echo "Test log saved to: $LOG_FILE"
    
    if [ $FAILED_TESTS -gt 0 ]; then
        exit 1
    fi
}

# Main execution
echo "Starting DevDeck API Tests..."
echo

run_api_tests
generate_report

print_success "API testing completed!"
EOF

chmod +x "$TESTS_DIR/test-api.sh"
print_success "API testing script created"

# 3. Create Postman collection
print_status "Creating Postman collection..."
cat > "$DOCS_DIR/DevDeck-API.postman_collection.json" << 'EOF'
{
  "info": {
    "name": "DevDeck API",
    "description": "Complete API collection for DevDeck - Developer Portfolio Platform",
    "version": "1.0.0",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{jwt_token}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000",
      "type": "string"
    },
    {
      "key": "jwt_token",
      "value": "",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "Health Check",
      "item": [
        {
          "name": "Get Health Status",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/health",
              "host": ["{{base_url}}"],
              "path": ["health"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Authentication",
      "item": [
        {
          "name": "GitHub OAuth Login",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/auth/github",
              "host": ["{{base_url}}"],
              "path": ["auth", "github"]
            }
          },
          "response": []
        },
        {
          "name": "Get Current User",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/auth/me",
              "host": ["{{base_url}}"],
              "path": ["auth", "me"]
            }
          },
          "response": []
        },
        {
          "name": "Logout",
          "request": {
            "method": "POST",
            "header": [],
            "url": {
              "raw": "{{base_url}}/auth/logout",
              "host": ["{{base_url}}"],
              "path": ["auth", "logout"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "User Management",
      "item": [
        {
          "name": "Get User Profile",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/api/users/profile",
              "host": ["{{base_url}}"],
              "path": ["api", "users", "profile"]
            }
          },
          "response": []
        },
        {
          "name": "Update User Profile",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"John Doe\",\n  \"bio\": \"Full-stack developer passionate about React and Node.js\",\n  \"location\": \"San Francisco, CA\",\n  \"website\": \"https://johndoe.dev\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/users/profile",
              "host": ["{{base_url}}"],
              "path": ["api", "users", "profile"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Portfolio Management",
      "item": [
        {
          "name": "Get User Portfolios",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/api/portfolio?page=1&limit=10",
              "host": ["{{base_url}}"],
              "path": ["api", "portfolio"],
              "query": [
                {
                  "key": "page",
                  "value": "1"
                },
                {
                  "key": "limit",
                  "value": "10"
                }
              ]
            }
          },
          "response": []
        },
        {
          "name": "Create Portfolio",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"title\": \"My New Portfolio\",\n  \"description\": \"A showcase of my latest work\",\n  \"isPublic\": true,\n  \"theme\": \"modern\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/portfolio",
              "host": ["{{base_url}}"],
              "path": ["api", "portfolio"]
            }
          },
          "response": []
        },
        {
          "name": "Get Portfolio by ID",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/api/portfolio/:id",
              "host": ["{{base_url}}"],
              "path": ["api", "portfolio", ":id"],
              "variable": [
                {
                  "key": "id",
                  "value": "portfolio_id"
                }
              ]
            }
          },
          "response": []
        },
        {
          "name": "Update Portfolio",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"title\": \"Updated Portfolio Title\",\n  \"description\": \"Updated description\",\n  \"isPublic\": false\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/portfolio/:id",
              "host": ["{{base_url}}"],
              "path": ["api", "portfolio", ":id"],
              "variable": [
                {
                  "key": "id",
                  "value": "portfolio_id"
                }
              ]
            }
          },
          "response": []
        },
        {
          "name": "Delete Portfolio",
          "request": {
            "method": "DELETE",
            "header": [],
            "url": {
              "raw": "{{base_url}}/api/portfolio/:id",
              "host": ["{{base_url}}"],
              "path": ["api", "portfolio", ":id"],
              "variable": [
                {
                  "key": "id",
                  "value": "portfolio_id"
                }
              ]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Public Portfolio",
      "item": [
        {
          "name": "Get Public Portfolio by Slug",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/api/portfolio/public/:slug",
              "host": ["{{base_url}}"],
              "path": ["api", "portfolio", "public", ":slug"],
              "variable": [
                {
                  "key": "slug",
                  "value": "portfolio-slug"
                }
              ]
            }
          },
          "response": []
        },
        {
          "name": "Get User Public Portfolios",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/api/portfolio/public/user/:username",
              "host": ["{{base_url}}"],
              "path": ["api", "portfolio", "public", "user", ":username"],
              "variable": [
                {
                  "key": "username",
                  "value": "johndoe"
                }
              ]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Project Management",
      "item": [
        {
          "name": "Get Projects",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/api/projects?portfolioId=:portfolioId",
              "host": ["{{base_url}}"],
              "path": ["api", "projects"],
              "query": [
                {
                  "key": "portfolioId",
                  "value": ":portfolioId"
                }
              ]
            }
          },
          "response": []
        },
        {
          "name": "Create Project",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"portfolioId\": \"portfolio_id\",\n  \"title\": \"My Project\",\n  \"description\": \"Project description\",\n  \"technologies\": [\"React\", \"Node.js\"],\n  \"githubUrl\": \"https://github.com/user/repo\",\n  \"liveUrl\": \"https://project.com\",\n  \"featured\": true,\n  \"status\": \"completed\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/projects",
              "host": ["{{base_url}}"],
              "path": ["api", "projects"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Analytics",
      "item": [
        {
          "name": "Get Portfolio Analytics",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/api/analytics/portfolio/:id?startDate=2024-01-01&endDate=2024-01-31",
              "host": ["{{base_url}}"],
              "path": ["api", "analytics", "portfolio", ":id"],
              "query": [
                {
                  "key": "startDate",
                  "value": "2024-01-01"
                },
                {
                  "key": "endDate",
                  "value": "2024-01-31"
                }
              ],
              "variable": [
                {
                  "key": "id",
                  "value": "portfolio_id"
                }
              ]
            }
          },
          "response": []
        },
        {
          "name": "Track Portfolio View",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"portfolioId\": \"portfolio_id\",\n  \"event\": \"view\",\n  \"source\": \"direct\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/analytics/track",
              "host": ["{{base_url}}"],
              "path": ["api", "analytics", "track"]
            }
          },
          "response": []
        }
      ]
    }
  ]
}
EOF

print_success "Postman collection created"

# 4. Create OpenAPI specification
print_status "Creating OpenAPI specification..."
cat > "$DOCS_DIR/openapi.yaml" << 'EOF'
openapi: 3.0.3
info:
  title: DevDeck API
  description: |
    DevDeck is a developer portfolio platform that allows developers to create, 
    customize, and share their professional portfolios.
    
    ## Authentication
    
    DevDeck uses GitHub OAuth for authentication and JWT tokens for API access.
    
    ## Rate Limiting
    
    - General API: 100 requests per 15 minutes per IP
    - Authentication: 5 requests per 15 minutes per IP
    - Analytics tracking: 1000 requests per hour per IP
  version: 1.0.0
  contact:
    name: DevDeck Support
    url: https://github.com/your-org/devdeck
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://your-backend.railway.app
    description: Production server
  - url: http://localhost:5000
    description: Development server

security:
  - BearerAuth: []

paths:
  /health:
    get:
      tags:
        - Health
      summary: Get application health status
      description: Returns the health status of the application and its services
      security: []
      responses:
        '200':
          description: Health status
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HealthResponse'

  /auth/github:
    get:
      tags:
        - Authentication
      summary: GitHub OAuth login
      description: Redirects to GitHub OAuth for authentication
      security: []
      responses:
        '302':
          description: Redirect to GitHub OAuth

  /auth/me:
    get:
      tags:
        - Authentication
      summary: Get current user
      description: Returns the currently authenticated user's information
      responses:
        '200':
          description: Current user information
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserResponse'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /api/users/profile:
    get:
      tags:
        - Users
      summary: Get user profile
      description: Get the current user's profile information
      responses:
        '200':
          description: User profile
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserResponse'
        '401':
          $ref: '#/components/responses/Unauthorized'
    
    put:
      tags:
        - Users
      summary: Update user profile
      description: Update the current user's profile information
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateUserRequest'
      responses:
        '200':
          description: Profile updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /api/portfolio:
    get:
      tags:
        - Portfolios
      summary: Get user portfolios
      description: Get all portfolios for the current user
      parameters:
        - $ref: '#/components/parameters/Page'
        - $ref: '#/components/parameters/Limit'
        - $ref: '#/components/parameters/Sort'
        - $ref: '#/components/parameters/Order'
      responses:
        '200':
          description: List of portfolios
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PortfolioListResponse'
        '401':
          $ref: '#/components/responses/Unauthorized'
    
    post:
      tags:
        - Portfolios
      summary: Create portfolio
      description: Create a new portfolio
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreatePortfolioRequest'
      responses:
        '201':
          description: Portfolio created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PortfolioResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /api/portfolio/{id}:
    get:
      tags:
        - Portfolios
      summary: Get portfolio by ID
      description: Get a specific portfolio by its ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
          description: Portfolio ID
      responses:
        '200':
          description: Portfolio details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PortfolioResponse'
        '404':
          $ref: '#/components/responses/NotFound'
    
    put:
      tags:
        - Portfolios
      summary: Update portfolio
      description: Update a specific portfolio
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
          description: Portfolio ID
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdatePortfolioRequest'
      responses:
        '200':
          description: Portfolio updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PortfolioResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'
    
    delete:
      tags:
        - Portfolios
      summary: Delete portfolio
      description: Delete a specific portfolio
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
          description: Portfolio ID
      responses:
        '200':
          description: Portfolio deleted successfully
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  parameters:
    Page:
      name: page
      in: query
      description: Page number (1-based)
      schema:
        type: integer
        minimum: 1
        default: 1
    
    Limit:
      name: limit
      in: query
      description: Number of items per page
      schema:
        type: integer
        minimum: 1
        maximum: 100
        default: 10
    
    Sort:
      name: sort
      in: query
      description: Sort field
      schema:
        type: string
        default: createdAt
    
    Order:
      name: order
      in: query
      description: Sort order
      schema:
        type: string
        enum: [asc, desc]
        default: desc

  schemas:
    HealthResponse:
      type: object
      properties:
        status:
          type: string
          example: healthy
        timestamp:
          type: string
          format: date-time
        uptime:
          type: number
        services:
          type: object
          properties:
            database:
              type: object
              properties:
                status:
                  type: string
                host:
                  type: string
                name:
                  type: string
            cache:
              type: object
              properties:
                status:
                  type: string
        version:
          type: string

    User:
      type: object
      properties:
        id:
          type: string
        githubId:
          type: number
        username:
          type: string
        email:
          type: string
          format: email
        name:
          type: string
        avatar:
          type: string
          format: uri
        bio:
          type: string
        location:
          type: string
        website:
          type: string
          format: uri
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    Portfolio:
      type: object
      properties:
        id:
          type: string
        title:
          type: string
        slug:
          type: string
        description:
          type: string
        isPublic:
          type: boolean
        theme:
          type: string
        customDomain:
          type: string
          nullable: true
        views:
          type: number
        content:
          type: object
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    UserResponse:
      type: object
      properties:
        success:
          type: boolean
        data:
          $ref: '#/components/schemas/User'

    PortfolioResponse:
      type: object
      properties:
        success:
          type: boolean
        data:
          $ref: '#/components/schemas/Portfolio'

    PortfolioListResponse:
      type: object
      properties:
        success:
          type: boolean
        data:
          type: object
          properties:
            portfolios:
              type: array
              items:
                $ref: '#/components/schemas/Portfolio'
            pagination:
              $ref: '#/components/schemas/Pagination'

    Pagination:
      type: object
      properties:
        page:
          type: integer
        limit:
          type: integer
        total:
          type: integer
        pages:
          type: integer
        hasNext:
          type: boolean
        hasPrev:
          type: boolean

    UpdateUserRequest:
      type: object
      properties:
        name:
          type: string
        bio:
          type: string
        location:
          type: string
        website:
          type: string
          format: uri

    CreatePortfolioRequest:
      type: object
      required:
        - title
      properties:
        title:
          type: string
        description:
          type: string
        isPublic:
          type: boolean
          default: true
        theme:
          type: string
          default: modern

    UpdatePortfolioRequest:
      type: object
      properties:
        title:
          type: string
        description:
          type: string
        isPublic:
          type: boolean
        theme:
          type: string
        content:
          type: object

    Error:
      type: object
      properties:
        success:
          type: boolean
          example: false
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string
            details:
              type: object

  responses:
    BadRequest:
      description: Bad request
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    
    Unauthorized:
      description: Unauthorized
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    
    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
EOF

print_success "OpenAPI specification created"

# 5. Create testing documentation
print_status "Creating testing documentation..."
cat > "$TESTS_DIR/README.md" << 'EOF'
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
EOF

print_success "Testing documentation created"

print_header "API Documentation Generation Complete!"
print_success "API documentation and testing tools created:"
echo
print_status "Documentation:"
echo "  📚 API Documentation: $DOCS_DIR/README.md"
echo "  📋 OpenAPI Spec: $DOCS_DIR/openapi.yaml"
echo "  📮 Postman Collection: $DOCS_DIR/DevDeck-API.postman_collection.json"
echo
print_status "Testing Tools:"
echo "  🧪 API Test Script: $TESTS_DIR/test-api.sh"
echo "  📖 Testing Guide: $TESTS_DIR/README.md"
echo
print_status "Next steps:"
echo "  1. Configure test environment:"
echo "     export API_BASE_URL=\"http://localhost:5000\""
echo "     export TEST_JWT_TOKEN=\"your-jwt-token\""
echo
echo "  2. Run API tests:"
echo "     cd $TESTS_DIR"
echo "     ./test-api.sh"
echo
echo "  3. Import Postman collection:"
echo "     File > Import > $DOCS_DIR/DevDeck-API.postman_collection.json"
echo
print_status "Documentation available at: $DOCS_DIR/README.md"
log "API documentation generation completed successfully"