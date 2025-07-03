#!/bin/bash

# DevDeck Production API Testing Script
# Comprehensive testing suite for production API endpoints
# Features: Authentication testing, CRUD operations, performance testing, security checks

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PRODUCTION_URL="${PRODUCTION_URL:-https://devdeck-1.onrender.com}"
TEST_EMAIL="${TEST_EMAIL:-test@example.com}"
TEST_PASSWORD="${TEST_PASSWORD:-TestPassword123!}"
TEST_RESULTS_FILE="logs/production-api-test-results.json"
PERFORMANCE_LOG="logs/api-performance.log"
MAX_RESPONSE_TIME=5000 # 5 seconds
TEST_TIMEOUT=30

# Create logs directory
mkdir -p logs

# Global variables
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
AUTH_TOKEN=""
TEST_USER_ID=""
START_TIME=$(date +%s)

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $1" >> "$PERFORMANCE_LOG"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED_TESTS++))
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED_TESTS++))
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_performance() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [PERF] $1" >> "$PERFORMANCE_LOG"
}

# HTTP request function with performance tracking
make_request() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local expected_status="$4"
    local description="$5"
    local headers="$6"
    
    ((TOTAL_TESTS++))
    
    local url="$PRODUCTION_URL$endpoint"
    local start_time=$(date +%s%3N)
    
    # Build curl command
    local curl_cmd="curl -s -w '%{http_code}:%{time_total}:%{time_connect}:%{time_starttransfer}' --max-time $TEST_TIMEOUT"
    
    if [[ -n "$headers" ]]; then
        curl_cmd="$curl_cmd $headers"
    fi
    
    if [[ -n "$data" ]]; then
        curl_cmd="$curl_cmd -H 'Content-Type: application/json' -d '$data'"
    fi
    
    curl_cmd="$curl_cmd -X $method '$url'"
    
    # Execute request
    local response=$(eval "$curl_cmd" 2>/dev/null)
    local curl_exit_code=$?
    local end_time=$(date +%s%3N)
    
    if [[ $curl_exit_code -ne 0 ]]; then
        log_error "$description - Request failed (curl exit code: $curl_exit_code)"
        return 1
    fi
    
    # Parse response
    local response_body=$(echo "$response" | sed '$d')
    local metrics=$(echo "$response" | tail -1)
    
    IFS=':' read -r status_code total_time connect_time ttfb <<< "$metrics"
    
    local response_time_ms=$(echo "$total_time * 1000" | bc -l | cut -d'.' -f1)
    
    # Log performance metrics
    log_performance "$method $endpoint: ${response_time_ms}ms (status: $status_code)"
    
    # Check status code
    if [[ "$status_code" == "$expected_status" ]]; then
        if [[ $response_time_ms -gt $MAX_RESPONSE_TIME ]]; then
            log_warning "$description - SLOW RESPONSE: ${response_time_ms}ms (expected < ${MAX_RESPONSE_TIME}ms)"
        else
            log_success "$description (${response_time_ms}ms)"
        fi
        
        # Store response for potential use in subsequent tests
        echo "$response_body" > "/tmp/last_api_response.json"
        return 0
    else
        log_error "$description - Expected status $expected_status, got $status_code"
        if [[ -n "$response_body" ]]; then
            echo "Response: $response_body" | head -c 200
        fi
        return 1
    fi
}

# Authentication tests
test_authentication() {
    log_info "Testing Authentication Endpoints"
    
    # Test registration (should fail with existing email or succeed with new)
    make_request "POST" "/auth/register" \
        "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"name\":\"Test User\"}" \
        "201" "User Registration"
    
    # Test login
    if make_request "POST" "/auth/login" \
        "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
        "200" "User Login"; then
        
        # Extract token from response
        if [[ -f "/tmp/last_api_response.json" ]]; then
            AUTH_TOKEN=$(cat "/tmp/last_api_response.json" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
            if [[ -n "$AUTH_TOKEN" ]]; then
                log_success "Authentication token extracted"
            else
                log_error "Failed to extract authentication token"
            fi
        fi
    fi
    
    # Test invalid login
    make_request "POST" "/auth/login" \
        "{\"email\":\"invalid@example.com\",\"password\":\"wrongpassword\"}" \
        "401" "Invalid Login Attempt"
    
    # Test password reset request
    make_request "POST" "/auth/forgot-password" \
        "{\"email\":\"$TEST_EMAIL\"}" \
        "200" "Password Reset Request"
}

# User profile tests
test_user_endpoints() {
    log_info "Testing User Endpoints"
    
    if [[ -z "$AUTH_TOKEN" ]]; then
        log_error "No authentication token available for user tests"
        return 1
    fi
    
    local auth_header="-H 'Authorization: Bearer $AUTH_TOKEN'"
    
    # Get user profile
    if make_request "GET" "/api/user/profile" "" "200" "Get User Profile" "$auth_header"; then
        # Extract user ID for other tests
        if [[ -f "/tmp/last_api_response.json" ]]; then
            TEST_USER_ID=$(cat "/tmp/last_api_response.json" | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
        fi
    fi
    
    # Update user profile
    make_request "PUT" "/api/user/profile" \
        "{\"name\":\"Updated Test User\",\"bio\":\"Test bio for API testing\"}" \
        "200" "Update User Profile" "$auth_header"
    
    # Test unauthorized access
    make_request "GET" "/api/user/profile" "" "401" "Unauthorized Profile Access"
}

# Portfolio tests
test_portfolio_endpoints() {
    log_info "Testing Portfolio Endpoints"
    
    if [[ -z "$AUTH_TOKEN" ]]; then
        log_error "No authentication token available for portfolio tests"
        return 1
    fi
    
    local auth_header="-H 'Authorization: Bearer $AUTH_TOKEN'"
    
    # Get user portfolio
    make_request "GET" "/api/portfolio" "" "200" "Get User Portfolio" "$auth_header"
    
    # Update portfolio
    local portfolio_data='{
        "personalInfo": {
            "name": "Test Developer",
            "title": "Full Stack Developer",
            "bio": "Passionate developer with expertise in modern web technologies",
            "location": "Test City, TC",
            "email": "'$TEST_EMAIL'",
            "phone": "+1-555-0123",
            "website": "https://testdev.example.com"
        },
        "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
        "experience": [{
            "company": "Test Company",
            "position": "Software Developer",
            "duration": "2022 - Present",
            "description": "Developing and maintaining web applications"
        }],
        "projects": [{
            "name": "Test Project",
            "description": "A sample project for testing",
            "technologies": ["React", "Node.js"],
            "githubUrl": "https://github.com/test/project",
            "liveUrl": "https://testproject.example.com"
        }]
    }'
    
    make_request "PUT" "/api/portfolio" "$portfolio_data" "200" "Update Portfolio" "$auth_header"
    
    # Test public portfolio access (if user ID is available)
    if [[ -n "$TEST_USER_ID" ]]; then
        make_request "GET" "/api/portfolio/public/$TEST_USER_ID" "" "200" "Get Public Portfolio"
    fi
}

# GitHub integration tests
test_github_endpoints() {
    log_info "Testing GitHub Integration Endpoints"
    
    if [[ -z "$AUTH_TOKEN" ]]; then
        log_error "No authentication token available for GitHub tests"
        return 1
    fi
    
    local auth_header="-H 'Authorization: Bearer $AUTH_TOKEN'"
    
    # Test GitHub repositories endpoint (may require GitHub token)
    make_request "GET" "/api/github/repos" "" "200" "Get GitHub Repositories" "$auth_header"
    
    # Test GitHub user info
    make_request "GET" "/api/github/user" "" "200" "Get GitHub User Info" "$auth_header"
}

# Export functionality tests
test_export_endpoints() {
    log_info "Testing Export Endpoints"
    
    if [[ -z "$AUTH_TOKEN" ]]; then
        log_error "No authentication token available for export tests"
        return 1
    fi
    
    local auth_header="-H 'Authorization: Bearer $AUTH_TOKEN'"
    
    # Test PDF export
    make_request "POST" "/api/export/pdf" \
        "{\"template\":\"modern\",\"includeProjects\":true}" \
        "200" "Export Portfolio as PDF" "$auth_header"
    
    # Test JSON export
    make_request "GET" "/api/export/json" "" "200" "Export Portfolio as JSON" "$auth_header"
}

# AI features tests (if available)
test_ai_endpoints() {
    log_info "Testing AI Endpoints"
    
    if [[ -z "$AUTH_TOKEN" ]]; then
        log_error "No authentication token available for AI tests"
        return 1
    fi
    
    local auth_header="-H 'Authorization: Bearer $AUTH_TOKEN'"
    
    # Test AI suggestions
    make_request "POST" "/api/ai/suggestions" \
        "{\"type\":\"skills\",\"context\":\"web development\"}" \
        "200" "Get AI Suggestions" "$auth_header"
    
    # Test AI content generation
    make_request "POST" "/api/ai/generate" \
        "{\"type\":\"bio\",\"keywords\":[\"developer\",\"javascript\"]}" \
        "200" "Generate AI Content" "$auth_header"
}

# Security tests
test_security() {
    log_info "Testing Security Features"
    
    # Test rate limiting
    log_info "Testing rate limiting (making multiple rapid requests)"
    for i in {1..10}; do
        make_request "GET" "/health" "" "200" "Rate Limit Test $i" "" >/dev/null 2>&1
        sleep 0.1
    done
    
    # The 11th request might be rate limited
    make_request "GET" "/health" "" "429" "Rate Limit Enforcement" ""
    
    # Test CORS headers
    local cors_response=$(curl -s -I -H "Origin: https://malicious-site.com" "$PRODUCTION_URL/health" --max-time 10 2>/dev/null)
    if echo "$cors_response" | grep -q "Access-Control-Allow-Origin"; then
        log_warning "CORS headers present - verify configuration"
    else
        log_success "CORS properly configured"
    fi
    
    # Test security headers
    local security_headers=$(curl -s -I "$PRODUCTION_URL/health" --max-time 10 2>/dev/null)
    
    if echo "$security_headers" | grep -q "X-Frame-Options"; then
        log_success "X-Frame-Options header present"
    else
        log_error "X-Frame-Options header missing"
    fi
    
    if echo "$security_headers" | grep -q "X-Content-Type-Options"; then
        log_success "X-Content-Type-Options header present"
    else
        log_error "X-Content-Type-Options header missing"
    fi
    
    if echo "$security_headers" | grep -q "Strict-Transport-Security"; then
        log_success "HSTS header present"
    else
        log_warning "HSTS header missing (recommended for HTTPS)"
    fi
}

# Performance tests
test_performance() {
    log_info "Running Performance Tests"
    
    local endpoints=(
        "GET:/health"
        "GET:/api/portfolio/public"
        "POST:/auth/login"
    )
    
    for endpoint in "${endpoints[@]}"; do
        IFS=':' read -r method path <<< "$endpoint"
        
        log_info "Performance testing $method $path"
        
        local total_time=0
        local successful_requests=0
        local test_iterations=5
        
        for i in $(seq 1 $test_iterations); do
            local start_time=$(date +%s%3N)
            
            local response=$(curl -s -w "%{http_code}:%{time_total}" --max-time 10 "$PRODUCTION_URL$path" 2>/dev/null)
            
            if [[ $? -eq 0 ]]; then
                local response_time=$(echo "$response" | cut -d':' -f2)
                local response_time_ms=$(echo "$response_time * 1000" | bc -l | cut -d'.' -f1)
                total_time=$((total_time + response_time_ms))
                ((successful_requests++))
            fi
            
            sleep 0.5
        done
        
        if [[ $successful_requests -gt 0 ]]; then
            local avg_time=$((total_time / successful_requests))
            log_performance "$method $path: Average ${avg_time}ms over $successful_requests requests"
            
            if [[ $avg_time -lt 1000 ]]; then
                log_success "$method $path - Good performance: ${avg_time}ms average"
            elif [[ $avg_time -lt 3000 ]]; then
                log_warning "$method $path - Acceptable performance: ${avg_time}ms average"
            else
                log_error "$method $path - Poor performance: ${avg_time}ms average"
            fi
        else
            log_error "$method $path - All requests failed"
        fi
    done
}

# Generate test report
generate_report() {
    local end_time=$(date +%s)
    local duration=$((end_time - START_TIME))
    
    log_info "Generating test report"
    
    local report='{
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
        "production_url": "'$PRODUCTION_URL'",
        "duration_seconds": '$duration',
        "total_tests": '$TOTAL_TESTS',
        "passed_tests": '$PASSED_TESTS',
        "failed_tests": '$FAILED_TESTS',
        "success_rate": "'$(echo "scale=2; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc -l)'%",
        "status": "'$(if [[ $FAILED_TESTS -eq 0 ]]; then echo "PASS"; else echo "FAIL"; fi)'"
    }'
    
    echo "$report" > "$TEST_RESULTS_FILE"
    
    echo ""
    echo "=========================================="
    echo "           TEST SUMMARY"
    echo "=========================================="
    echo -e "Production URL: ${CYAN}$PRODUCTION_URL${NC}"
    echo -e "Total Tests: ${BLUE}$TOTAL_TESTS${NC}"
    echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
    echo -e "Success Rate: ${PURPLE}$(echo "scale=2; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc -l)%${NC}"
    echo -e "Duration: ${YELLOW}${duration}s${NC}"
    echo ""
    
    if [[ $FAILED_TESTS -eq 0 ]]; then
        echo -e "${GREEN}✅ All tests passed!${NC}"
    else
        echo -e "${RED}❌ Some tests failed. Check logs for details.${NC}"
    fi
    
    echo ""
    echo "Detailed logs: $PERFORMANCE_LOG"
    echo "Test results: $TEST_RESULTS_FILE"
}

# Main execution
main() {
    echo "=========================================="
    echo "    DevDeck Production API Testing"
    echo "=========================================="
    echo ""
    
    # Validate configuration
    if [[ "$PRODUCTION_URL" == "https://your-app.onrender.com" ]]; then
        log_warning "Using default production URL. Set PRODUCTION_URL environment variable."
    fi
    
    log_info "Testing production API at: $PRODUCTION_URL"
    log_info "Test email: $TEST_EMAIL"
    echo ""
    
    # Run test suites
    test_authentication
    test_user_endpoints
    test_portfolio_endpoints
    test_github_endpoints
    test_export_endpoints
    test_ai_endpoints
    test_security
    test_performance
    
    # Generate final report
    generate_report
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "DevDeck Production API Testing Script"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Environment Variables:"
        echo "  PRODUCTION_URL    Production API URL (default: https://your-app.onrender.com)"
        echo "  TEST_EMAIL        Test user email (default: test@example.com)"
        echo "  TEST_PASSWORD     Test user password (default: TestPassword123!)"
        echo ""
        echo "Examples:"
        echo "  PRODUCTION_URL=https://myapp.onrender.com $0"
        echo "  TEST_EMAIL=mytest@example.com $0"
        exit 0
        ;;
    *)
        main
        ;;
esac