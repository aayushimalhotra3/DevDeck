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
