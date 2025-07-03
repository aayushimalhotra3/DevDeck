#!/bin/bash

# DevDeck Railway Deployment Script
# This script automates the deployment of the backend to Railway

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
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

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Starting DevDeck Railway deployment..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    print_warning "Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if user is logged in to Railway
print_status "Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    print_warning "Not logged in to Railway. Please log in:"
    railway login
fi

# Check if project is linked
if [ ! -f "railway.json" ] && [ ! -d ".railway" ]; then
    print_warning "Project not linked to Railway. Please link your project:"
    print_status "Available options:"
    echo "  1. Link existing project: railway link"
    echo "  2. Create new project: railway init"
    
    read -p "Do you want to create a new project? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        railway init
    else
        print_status "Please run 'railway link' to link an existing project."
        railway link
    fi
fi

# Install dependencies
print_status "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies. Please fix the errors and try again."
    exit 1
fi

# Run tests before deployment
print_status "Running tests..."
npm test

if [ $? -ne 0 ]; then
    print_warning "Tests failed. Do you want to continue with deployment? (y/n)"
    read -p "Continue? " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelled due to test failures."
        exit 1
    fi
fi

# Check environment variables
print_status "Checking required environment variables..."

REQUIRED_VARS=(
    "GITHUB_CLIENT_ID"
    "GITHUB_CLIENT_SECRET"
    "JWT_SECRET"
    "MONGODB_URI"
    "FRONTEND_URL"
    "NODE_ENV"
    "TRUST_PROXY"
)

OPTIONAL_VARS=(
    "SENTRY_DSN"
    "REDIS_URL"
    "LOG_LEVEL"
    "RATE_LIMIT_MAX_REQUESTS"
)

MISSING_VARS=()
MISSING_OPTIONAL=()

for var in "${REQUIRED_VARS[@]}"; do
    if ! railway variables get "$var" &> /dev/null; then
        MISSING_VARS+=("$var")
    fi
done

for var in "${OPTIONAL_VARS[@]}"; do
    if ! railway variables get "$var" &> /dev/null; then
        MISSING_OPTIONAL+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    print_warning "Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    
    print_status "Please set these variables using:"
    echo "  railway variables set VARIABLE_NAME 'value'"
    
    read -p "Do you want to continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelled. Please set required environment variables."
        exit 1
    fi
fi

if [ ${#MISSING_OPTIONAL[@]} -ne 0 ]; then
    print_warning "Missing optional environment variables (recommended for production):"
    for var in "${MISSING_OPTIONAL[@]}"; do
        echo "  - $var"
    done
fi

# Deploy to Railway
print_status "Deploying to Railway..."
railway up

if [ $? -eq 0 ]; then
    print_success "Deployment completed successfully!"
    
    # Get deployment information
    print_status "Getting deployment information..."
    DEPLOYMENT_URL=$(railway status --json | jq -r '.deployments[0].url' 2>/dev/null || echo "")
    
    if [ ! -z "$DEPLOYMENT_URL" ] && [ "$DEPLOYMENT_URL" != "null" ]; then
        print_success "Your API is live at: $DEPLOYMENT_URL"
    else
        print_status "Getting deployment URL..."
        railway status
    fi
    
    print_status "Post-deployment checklist:"
    echo "  1. Test API endpoints"
    echo "  2. Verify database connection"
    echo "  3. Check application logs: railway logs"
    echo "  4. Update frontend NEXT_PUBLIC_API_URL if needed"
    echo "  5. Test GitHub OAuth integration"
    
else
    print_error "Deployment failed. Please check the error messages above."
    print_status "You can check logs with: railway logs"
    exit 1
fi

# Enhanced deployment health checks
read -p "Do you want to run comprehensive health checks? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Running comprehensive health checks..."
    
    # Wait for deployment to be ready
    print_status "Waiting for deployment to stabilize..."
    sleep 15
    
    if [ ! -z "$DEPLOYMENT_URL" ] && [ "$DEPLOYMENT_URL" != "null" ]; then
        # Test health endpoint
        print_status "Testing health endpoint..."
        if curl -f -s "$DEPLOYMENT_URL/health" | jq -e '.status == "healthy"' &> /dev/null; then
            print_success "✅ Health check passed!"
        else
            print_warning "⚠️  Health check failed. Checking detailed status..."
            curl -s "$DEPLOYMENT_URL/health" | jq '.' || echo "Health endpoint not responding"
        fi
        
        # Test database connectivity
        print_status "Testing database connectivity..."
        DB_STATUS=$(curl -s "$DEPLOYMENT_URL/health" | jq -r '.services.database.status' 2>/dev/null || echo "unknown")
        if [ "$DB_STATUS" = "connected" ]; then
            print_success "✅ Database connection verified!"
        else
            print_warning "⚠️  Database connection issue: $DB_STATUS"
        fi
        
        # Test API endpoints
        print_status "Testing core API endpoints..."
        if curl -f -s "$DEPLOYMENT_URL/api/portfolio/public/test" &> /dev/null; then
            print_success "✅ API endpoints responding!"
        else
            print_warning "⚠️  Some API endpoints may not be responding"
        fi
        
    else
        print_warning "Could not determine deployment URL for health check."
        print_status "Attempting to get URL from Railway status..."
        railway status
    fi
fi

# Show logs
read -p "Do you want to view recent logs? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Showing recent logs..."
    railway logs --tail 50
fi

print_success "Railway deployment process completed!"
print_status "Useful Railway commands:"
echo "  - View logs: railway logs"
echo "  - Check status: railway status"
echo "  - Open dashboard: railway open"
echo "  - Set variables: railway variables set KEY value"
echo "  - Connect to database: railway connect"