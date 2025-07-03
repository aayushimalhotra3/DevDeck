#!/bin/bash

# DevDeck Production Deployment Script
# This script orchestrates the complete production deployment process

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

print_header() {
    echo -e "${PURPLE}[DEPLOY]${NC} $1"
}

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_ROOT/deployment.log"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Error handling
handle_error() {
    print_error "Deployment failed at step: $1"
    log "ERROR: Deployment failed at step: $1"
    exit 1
}

# Cleanup function
cleanup() {
    print_status "Cleaning up temporary files..."
    # Add cleanup commands here if needed
}

# Set up error handling
trap 'handle_error "$BASH_COMMAND"' ERR
trap cleanup EXIT

# Start deployment
print_header "Starting DevDeck Production Deployment"
log "Starting production deployment"

# Check if we're in the correct directory
cd "$PROJECT_ROOT"
if [ ! -f "package.json" ]; then
    handle_error "package.json not found. Please run this script from the project root."
fi

# Pre-deployment checks
print_header "Running Pre-deployment Checks"

# Check Git status
print_status "Checking Git status..."
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. It's recommended to commit all changes before deployment."
    read -p "Do you want to continue? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        handle_error "Deployment cancelled due to uncommitted changes."
    fi
fi

# Check if on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    print_warning "You're not on the main/master branch (current: $CURRENT_BRANCH)."
    read -p "Do you want to continue? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        handle_error "Deployment cancelled. Please switch to main/master branch."
    fi
fi

# Pull latest changes
print_status "Pulling latest changes..."
git pull origin "$CURRENT_BRANCH"

# Install dependencies
print_status "Installing dependencies..."
npm install

# Run tests
print_status "Running test suite..."
npm test

if [ $? -ne 0 ]; then
    print_warning "Tests failed. Do you want to continue with deployment?"
    read -p "Continue? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        handle_error "Deployment cancelled due to test failures."
    fi
fi

# Build application
print_status "Building application..."
npm run build

# Check required CLI tools
print_header "Checking Required Tools"

CLI_TOOLS=("vercel" "railway")
MISSING_TOOLS=()

for tool in "${CLI_TOOLS[@]}"; do
    if ! command -v "$tool" &> /dev/null; then
        MISSING_TOOLS+=("$tool")
    fi
done

if [ ${#MISSING_TOOLS[@]} -ne 0 ]; then
    print_warning "Missing CLI tools. Installing..."
    for tool in "${MISSING_TOOLS[@]}"; do
        case $tool in
            "vercel")
                npm install -g vercel
                ;;
            "railway")
                npm install -g @railway/cli
                ;;
        esac
    done
fi

# Check authentication
print_status "Checking authentication..."

if ! vercel whoami &> /dev/null; then
    print_warning "Not logged in to Vercel. Please log in:"
    vercel login
fi

if ! railway whoami &> /dev/null; then
    print_warning "Not logged in to Railway. Please log in:"
    railway login
fi

# Deployment options
print_header "Deployment Options"
echo "1. Deploy both frontend and backend"
echo "2. Deploy frontend only (Vercel)"
echo "3. Deploy backend only (Railway)"
echo "4. Cancel deployment"

read -p "Choose deployment option (1-4): " -n 1 -r
echo

case $REPLY in
    1)
        DEPLOY_FRONTEND=true
        DEPLOY_BACKEND=true
        ;;
    2)
        DEPLOY_FRONTEND=true
        DEPLOY_BACKEND=false
        ;;
    3)
        DEPLOY_FRONTEND=false
        DEPLOY_BACKEND=true
        ;;
    4)
        print_status "Deployment cancelled by user."
        exit 0
        ;;
    *)
        handle_error "Invalid option selected."
        ;;
esac

# Deploy backend first (if selected)
if [ "$DEPLOY_BACKEND" = true ]; then
    print_header "Deploying Backend to Railway"
    log "Starting backend deployment"
    
    if [ -f "$SCRIPT_DIR/deploy-railway.sh" ]; then
        chmod +x "$SCRIPT_DIR/deploy-railway.sh"
        "$SCRIPT_DIR/deploy-railway.sh"
    else
        print_status "Railway deployment script not found. Deploying manually..."
        railway up
    fi
    
    print_success "Backend deployment completed!"
    log "Backend deployment completed"
fi

# Deploy frontend (if selected)
if [ "$DEPLOY_FRONTEND" = true ]; then
    print_header "Deploying Frontend to Vercel"
    log "Starting frontend deployment"
    
    if [ -f "$SCRIPT_DIR/deploy-vercel.sh" ]; then
        chmod +x "$SCRIPT_DIR/deploy-vercel.sh"
        "$SCRIPT_DIR/deploy-vercel.sh"
    else
        print_status "Vercel deployment script not found. Deploying manually..."
        vercel --prod
    fi
    
    print_success "Frontend deployment completed!"
    log "Frontend deployment completed"
fi

# Post-deployment checks
print_header "Running Post-deployment Checks"

# Wait for deployments to be ready
print_status "Waiting for deployments to be ready..."
sleep 30

# Get deployment URLs
if [ "$DEPLOY_FRONTEND" = true ]; then
    FRONTEND_URL=$(vercel ls --meta | grep "https://" | head -1 | awk '{print $2}' || echo "")
fi

if [ "$DEPLOY_BACKEND" = true ]; then
    BACKEND_URL=$(railway status --json | jq -r '.deployments[0].url' 2>/dev/null || echo "")
fi

# Health checks
if [ "$DEPLOY_BACKEND" = true ] && [ ! -z "$BACKEND_URL" ] && [ "$BACKEND_URL" != "null" ]; then
    print_status "Running backend health check..."
    if curl -f "$BACKEND_URL/api/health" &> /dev/null; then
        print_success "Backend health check passed!"
    else
        print_warning "Backend health check failed. Please check the logs."
    fi
fi

if [ "$DEPLOY_FRONTEND" = true ] && [ ! -z "$FRONTEND_URL" ]; then
    print_status "Running frontend health check..."
    if curl -f "$FRONTEND_URL" &> /dev/null; then
        print_success "Frontend health check passed!"
    else
        print_warning "Frontend health check failed. Please check the deployment."
    fi
fi

# Deployment summary
print_header "Deployment Summary"
log "Deployment completed successfully"

if [ "$DEPLOY_FRONTEND" = true ] && [ ! -z "$FRONTEND_URL" ]; then
    print_success "Frontend deployed to: $FRONTEND_URL"
fi

if [ "$DEPLOY_BACKEND" = true ] && [ ! -z "$BACKEND_URL" ] && [ "$BACKEND_URL" != "null" ]; then
    print_success "Backend deployed to: $BACKEND_URL"
fi

print_header "Post-deployment Checklist"
echo "□ Test complete user authentication flow"
echo "□ Verify GitHub OAuth integration"
echo "□ Test portfolio creation and publishing"
echo "□ Check all API endpoints"
echo "□ Verify environment variables are correct"
echo "□ Set up monitoring and alerts"
echo "□ Configure custom domains (if applicable)"
echo "□ Update DNS records (if using custom domains)"
echo "□ Test performance and loading times"
echo "□ Verify SSL certificates"

print_success "Production deployment completed successfully!"
print_status "Deployment log saved to: $LOG_FILE"

# Optional: Open deployment URLs
read -p "Do you want to open the deployed applications? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ "$DEPLOY_FRONTEND" = true ] && [ ! -z "$FRONTEND_URL" ]; then
        open "$FRONTEND_URL" 2>/dev/null || echo "Frontend URL: $FRONTEND_URL"
    fi
    if [ "$DEPLOY_BACKEND" = true ] && [ ! -z "$BACKEND_URL" ] && [ "$BACKEND_URL" != "null" ]; then
        open "$BACKEND_URL/api/health" 2>/dev/null || echo "Backend URL: $BACKEND_URL"
    fi
fi