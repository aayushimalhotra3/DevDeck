#!/bin/bash

# Test script for production fixes
# This script verifies that all the identified issues have been resolved

set -e

echo "🔧 Testing Production Fixes"
echo "========================="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    local status=$1
    local message=$2
    case $status in
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

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "backend" ]; then
    print_status "FAIL" "Please run this script from the project root directory"
    exit 1
fi

print_status "INFO" "Starting fix verification..."
echo

# Test 1: Check express-slow-down fix
echo "📝 Test 1: Express-Slow-Down Configuration"
if grep -q "delayMs: () => delayMs" backend/src/utils/performance.js; then
    print_status "PASS" "Express-slow-down delayMs fixed"
else
    print_status "FAIL" "Express-slow-down delayMs not fixed"
fi

if grep -q "validate: { delayMs: false }" backend/src/utils/performance.js; then
    print_status "PASS" "Express-slow-down validation disabled"
else
    print_status "FAIL" "Express-slow-down validation not disabled"
fi
echo

# Test 2: Check duplicate index fixes
echo "📝 Test 2: Mongoose Index Configuration"
if ! grep -q "userSchema.index({ username: 1 })" backend/src/models/User.js; then
    print_status "PASS" "Duplicate username index removed"
else
    print_status "FAIL" "Duplicate username index still present"
fi

if ! grep -q "userSchema.index({ email: 1 })" backend/src/models/User.js; then
    print_status "PASS" "Duplicate email index removed"
else
    print_status "FAIL" "Duplicate email index still present"
fi

if ! grep -q "portfolioSchema.index({ userId: 1 })" backend/src/models/Portfolio.js; then
    print_status "PASS" "Duplicate userId index removed"
else
    print_status "FAIL" "Duplicate userId index still present"
fi
echo

# Test 3: Check deprecated MongoDB options
echo "📝 Test 3: MongoDB Connection Options"
if ! grep -q "useNewUrlParser" backend/src/config/database.js; then
    print_status "PASS" "Deprecated useNewUrlParser removed"
else
    print_status "FAIL" "Deprecated useNewUrlParser still present"
fi

if ! grep -q "useUnifiedTopology" backend/src/config/database.js; then
    print_status "PASS" "Deprecated useUnifiedTopology removed"
else
    print_status "FAIL" "Deprecated useUnifiedTopology still present"
fi

if grep -q "maxPoolSize" backend/src/config/database.js; then
    print_status "PASS" "Modern connection pooling configured"
else
    print_status "FAIL" "Modern connection pooling not configured"
fi
echo

# Test 4: Check MongoDB URI format
echo "📝 Test 4: MongoDB Connection String"
if grep -q "mongodb+srv://.*\/devdeck?" backend/.env; then
    print_status "PASS" "Database name added to MongoDB URI"
else
    print_status "WARN" "Database name may be missing from MongoDB URI"
fi
echo

# Test 5: Try to start the server (if Node.js is available)
echo "📝 Test 5: Server Startup Test"
if command -v node >/dev/null 2>&1; then
    print_status "INFO" "Testing server startup..."
    cd backend
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "INFO" "Installing dependencies..."
        npm install --silent
    fi
    
    # Try to start server with timeout
    timeout 10s npm start > startup_test.log 2>&1 &
    SERVER_PID=$!
    
    sleep 5
    
    # Check if server is still running
    if kill -0 $SERVER_PID 2>/dev/null; then
        print_status "PASS" "Server started successfully"
        kill $SERVER_PID 2>/dev/null || true
    else
        print_status "FAIL" "Server failed to start"
        echo "Last few lines of startup log:"
        tail -n 10 startup_test.log 2>/dev/null || echo "No log available"
    fi
    
    # Check for specific warnings in log
    if [ -f "startup_test.log" ]; then
        if grep -q "ExpressSlowDownWarning" startup_test.log; then
            print_status "FAIL" "Express-slow-down warnings still present"
        else
            print_status "PASS" "No express-slow-down warnings"
        fi
        
        if grep -q "Duplicate schema index" startup_test.log; then
            print_status "FAIL" "Duplicate index warnings still present"
        else
            print_status "PASS" "No duplicate index warnings"
        fi
        
        if grep -q "deprecated option" startup_test.log; then
            print_status "FAIL" "Deprecated option warnings still present"
        else
            print_status "PASS" "No deprecated option warnings"
        fi
        
        if grep -q "MongoDB Connected" startup_test.log; then
            print_status "PASS" "MongoDB connection successful"
        elif grep -q "ENOTFOUND" startup_test.log; then
            print_status "WARN" "MongoDB connection failed - check Atlas configuration"
        else
            print_status "WARN" "MongoDB connection status unclear"
        fi
        
        # Clean up log file
        rm -f startup_test.log
    fi
    
    cd ..
else
    print_status "WARN" "Node.js not available - skipping server startup test"
fi
echo

# Summary
echo "📊 Fix Verification Summary"
echo "==========================="
print_status "INFO" "Code fixes have been applied to address:"
echo "   • Express-slow-down deprecation warnings"
echo "   • Mongoose duplicate index warnings"
echo "   • MongoDB deprecated connection options"
echo "   • MongoDB URI format"
echo
print_status "INFO" "Next steps:"
echo "   1. Deploy changes to production"
echo "   2. Verify MongoDB Atlas cluster status"
echo "   3. Check Render deployment logs"
echo "   4. Test API endpoints"
echo
print_status "INFO" "Documentation created: docs/production-issues-fix.md"
echo

# MongoDB Atlas troubleshooting tips
echo "🔍 MongoDB Atlas Troubleshooting Tips"
echo "===================================="
echo "If MongoDB connection still fails:"
echo "1. Check cluster status in MongoDB Atlas dashboard"
echo "2. Verify Network Access whitelist (add 0.0.0.0/0 for testing)"
echo "3. Confirm database user has proper permissions"
echo "4. Test connection string locally with mongosh"
echo "5. Check Render logs for specific error messages"
echo
echo "✅ Fix verification complete!"