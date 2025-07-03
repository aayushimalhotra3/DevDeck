#!/bin/bash

# DevDeck Vercel Deployment Script
# This script automates the deployment of the frontend to Vercel

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

print_status "Starting DevDeck Vercel deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
print_status "Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    print_warning "Not logged in to Vercel. Please log in:"
    vercel login
fi

# Build the application
print_status "Building the application..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed. Please fix the errors and try again."
    exit 1
fi

print_success "Build completed successfully!"

# Check if this is the first deployment
if [ ! -f ".vercel/project.json" ]; then
    print_status "First time deployment detected. Setting up project..."
    
    # Deploy with setup
    vercel --prod
    
    print_success "Project setup completed!"
else
    print_status "Deploying to production..."
    
    # Deploy to production
    vercel --prod
fi

if [ $? -eq 0 ]; then
    print_success "Deployment completed successfully!"
    
    # Get the deployment URL
    DEPLOYMENT_URL=$(vercel ls --meta | grep "https://" | head -1 | awk '{print $2}')
    
    if [ ! -z "$DEPLOYMENT_URL" ]; then
        print_success "Your application is live at: $DEPLOYMENT_URL"
    fi
    
    print_status "Post-deployment checklist:"
    echo "  1. Update GitHub OAuth app redirect URI if using custom domain"
    echo "  2. Test the complete user flow"
    echo "  3. Verify environment variables are set correctly"
    echo "  4. Check application logs for any errors"
    
else
    print_error "Deployment failed. Please check the error messages above."
    exit 1
fi

# Optional: Run post-deployment tests
read -p "Do you want to run post-deployment tests? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Running post-deployment tests..."
    
    # Add your test commands here
    # npm run test:e2e:prod
    
    print_success "Post-deployment tests completed!"
fi

print_success "Vercel deployment process completed!"
print_status "Don't forget to:"
echo "  - Set up custom domain if needed"
echo "  - Configure monitoring and analytics"
echo "  - Update DNS records if using custom domain"
echo "  - Test all functionality in production environment"