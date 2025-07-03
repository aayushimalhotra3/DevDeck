#!/bin/bash

# DevDeck Deployment Verification Script
# This script helps verify and troubleshoot production deployment issues

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_URL="https://devdeck-rho.vercel.app"
BACKEND_URL="https://devdeck-1.onrender.com"
MONGODB_URI="mongodb+srv://aayushim33:aayushim33@devdeck-cluster.rtc1ooo.mongodb.net/?retryWrites=true&w=majority&appName=devdeck-cluster"

echo "=========================================="
echo "    DevDeck Deployment Verification"
echo "=========================================="
echo ""

# Function to print status
print_status() {
    local status="$1"
    local message="$2"
    
    case "$status" in
        "PASS")
            echo -e "${GREEN}✅ PASS${NC}: $message"
            ;;
        "FAIL")
            echo -e "${RED}❌ FAIL${NC}: $message"
            ;;
        "WARN")
            echo -e "${YELLOW}⚠️  WARN${NC}: $message"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  INFO${NC}: $message"
            ;;
    esac
}

# Check if required tools are available
echo "Checking required tools..."
for tool in curl jq node npm; do
    if command -v "$tool" >/dev/null 2>&1; then
        print_status "PASS" "$tool is available"
    else
        print_status "FAIL" "$tool is not installed"
    fi
done
echo ""

# Check environment file
echo "Checking environment configuration..."
if [[ -f "backend/.env" ]]; then
    print_status "PASS" "Backend .env file exists"
    
    # Check for required variables
    required_vars=("GITHUB_CLIENT_ID" "GITHUB_CLIENT_SECRET" "NEXTAUTH_SECRET" "MONGODB_URI" "JWT_SECRET")
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" "backend/.env"; then
            print_status "PASS" "$var is set in .env"
        else
            print_status "FAIL" "$var is missing from .env"
        fi
    done
else
    print_status "FAIL" "Backend .env file not found"
fi
echo ""

# Check package.json and dependencies
echo "Checking project configuration..."
if [[ -f "backend/package.json" ]]; then
    print_status "PASS" "Backend package.json exists"
    
    # Check for start script
    if grep -q '"start"' "backend/package.json"; then
        print_status "PASS" "Start script defined in package.json"
    else
        print_status "FAIL" "Start script missing in package.json"
    fi
else
    print_status "FAIL" "Backend package.json not found"
fi

if [[ -f "frontend/package.json" ]]; then
    print_status "PASS" "Frontend package.json exists"
else
    print_status "FAIL" "Frontend package.json not found"
fi
echo ""

# Test MongoDB connectivity
echo "Testing database connectivity..."
if command -v mongosh >/dev/null 2>&1; then
    print_status "INFO" "Testing MongoDB connection..."
    
    # Test connection with timeout
    timeout 10s mongosh "$MONGODB_URI" --eval "db.adminCommand('ping')" >/dev/null 2>&1
    if [[ $? -eq 0 ]]; then
        print_status "PASS" "MongoDB connection successful"
    else
        print_status "FAIL" "MongoDB connection failed"
        print_status "INFO" "Check network access in MongoDB Atlas"
        print_status "INFO" "Verify connection string and credentials"
    fi
else
    print_status "WARN" "mongosh not available, skipping database test"
fi
echo ""

# Test service endpoints
echo "Testing service endpoints..."

# Test frontend
print_status "INFO" "Testing frontend at $FRONTEND_URL"
frontend_response=$(curl -s -w "%{http_code}" --max-time 10 "$FRONTEND_URL" -o /dev/null 2>/dev/null)
if [[ "$frontend_response" == "200" ]]; then
    print_status "PASS" "Frontend is accessible"
else
    print_status "FAIL" "Frontend returned HTTP $frontend_response"
fi

# Test backend
print_status "INFO" "Testing backend at $BACKEND_URL"
backend_response=$(curl -s -w "%{http_code}" --max-time 10 "$BACKEND_URL/health" -o /dev/null 2>/dev/null)
if [[ "$backend_response" == "200" ]]; then
    print_status "PASS" "Backend health endpoint is accessible"
elif [[ "$backend_response" == "502" ]]; then
    print_status "FAIL" "Backend returning 502 Bad Gateway (service down)"
    print_status "INFO" "Check Render deployment logs"
    print_status "INFO" "Verify environment variables on Render"
    print_status "INFO" "Check if service is running"
elif [[ "$backend_response" == "404" ]]; then
    print_status "FAIL" "Backend health endpoint not found"
    print_status "INFO" "Check if /health route is implemented"
else
    print_status "FAIL" "Backend returned HTTP $backend_response"
fi
echo ""

# Check CORS configuration
echo "Testing CORS configuration..."
cors_response=$(curl -s -H "Origin: $FRONTEND_URL" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: Content-Type" -X OPTIONS "$BACKEND_URL/api/user/profile" -w "%{http_code}" -o /dev/null 2>/dev/null)
if [[ "$cors_response" == "200" || "$cors_response" == "204" ]]; then
    print_status "PASS" "CORS preflight request successful"
else
    print_status "WARN" "CORS configuration may need attention (HTTP $cors_response)"
fi
echo ""

# Summary and recommendations
echo "=========================================="
echo "DEPLOYMENT VERIFICATION SUMMARY"
echo "=========================================="
echo ""
echo "Frontend Status: $FRONTEND_URL"
if [[ "$frontend_response" == "200" ]]; then
    echo -e "  ${GREEN}✅ OPERATIONAL${NC}"
else
    echo -e "  ${RED}❌ ISSUES DETECTED${NC}"
fi
echo ""
echo "Backend Status: $BACKEND_URL"
if [[ "$backend_response" == "200" ]]; then
    echo -e "  ${GREEN}✅ OPERATIONAL${NC}"
else
    echo -e "  ${RED}❌ ISSUES DETECTED${NC}"
    echo ""
    echo "BACKEND TROUBLESHOOTING STEPS:"
    echo "1. Check Render service dashboard"
    echo "2. Review deployment logs for errors"
    echo "3. Verify environment variables are set"
    echo "4. Ensure MongoDB Atlas network access allows Render IPs"
    echo "5. Check if service is properly starting"
    echo "6. Verify build and start commands"
fi
echo ""
echo "For detailed monitoring, run:"
echo "  ./scripts/production-monitor.sh check"
echo ""
echo "For API testing, run:"
echo "  PRODUCTION_URL=$BACKEND_URL ./scripts/test-production-api.sh"
echo "=========================================="