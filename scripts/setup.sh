#!/bin/bash

# DevDeck Development Setup Script
# This script helps you set up the development environment quickly

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        REQUIRED_VERSION="18.0.0"
        
        if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
            print_success "Node.js version $NODE_VERSION is compatible"
            return 0
        else
            print_error "Node.js version $NODE_VERSION is not compatible. Required: >= $REQUIRED_VERSION"
            return 1
        fi
    else
        print_error "Node.js is not installed"
        return 1
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    
    # Install backend dependencies
    print_status "Installing backend dependencies..."
    cd backend && npm install && cd ..
    
    print_success "All dependencies installed successfully!"
}

# Function to setup environment files
setup_env_files() {
    print_status "Setting up environment files..."
    
    # Copy root .env.example to .env if it doesn't exist
    if [ ! -f ".env" ]; then
        cp .env.example .env
        print_success "Created .env file from .env.example"
    else
        print_warning ".env file already exists, skipping..."
    fi
    
    # Copy backend .env.example to .env if it doesn't exist
    if [ ! -f "backend/.env" ]; then
        cp backend/.env.example backend/.env
        print_success "Created backend/.env file"
    else
        print_warning "backend/.env file already exists, skipping..."
    fi
    
    # Copy frontend .env.local.example to .env.local if it doesn't exist
    if [ ! -f "frontend/.env.local" ]; then
        if [ -f "frontend/.env.local.example" ]; then
            cp frontend/.env.local.example frontend/.env.local
            print_success "Created frontend/.env.local file"
        else
            # Create a basic .env.local file
            cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5000
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id_here
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
EOF
            print_success "Created frontend/.env.local file"
        fi
    else
        print_warning "frontend/.env.local file already exists, skipping..."
    fi
}

# Function to check MongoDB
check_mongodb() {
    print_status "Checking MongoDB..."
    
    if command_exists mongod; then
        print_success "MongoDB is installed"
        
        # Check if MongoDB is running
        if pgrep -x "mongod" > /dev/null; then
            print_success "MongoDB is running"
        else
            print_warning "MongoDB is not running. You can start it with: brew services start mongodb-community"
        fi
    else
        print_warning "MongoDB is not installed locally"
        print_status "You can install it with: brew install mongodb-community"
        print_status "Or use MongoDB Atlas (cloud) by updating MONGODB_URI in .env files"
    fi
}

# Function to generate secrets
generate_secrets() {
    print_status "Generating secure secrets..."
    
    # Generate JWT secret
    JWT_SECRET=$(openssl rand -base64 64 | tr -d "\n")
    
    # Generate NextAuth secret
    NEXTAUTH_SECRET=$(openssl rand -base64 32 | tr -d "\n")
    
    # Generate session secret
    SESSION_SECRET=$(openssl rand -base64 32 | tr -d "\n")
    
    # Update .env file
    if [ -f ".env" ]; then
        sed -i.bak "s/your_super_secret_jwt_key_here_make_it_long_and_random/$JWT_SECRET/g" .env
        sed -i.bak "s/your_nextauth_secret_here_also_make_it_random/$NEXTAUTH_SECRET/g" .env
        sed -i.bak "s/your_session_secret_here/$SESSION_SECRET/g" .env
        rm .env.bak
    fi
    
    # Update backend/.env file
    if [ -f "backend/.env" ]; then
        sed -i.bak "s/your-super-secret-jwt-key/$JWT_SECRET/g" backend/.env
        sed -i.bak "s/your-session-secret/$SESSION_SECRET/g" backend/.env
        rm backend/.env.bak
    fi
    
    # Update frontend/.env.local file
    if [ -f "frontend/.env.local" ]; then
        sed -i.bak "s/your_nextauth_secret_here/$NEXTAUTH_SECRET/g" frontend/.env.local
        rm frontend/.env.local.bak
    fi
    
    print_success "Secure secrets generated and updated in environment files"
}

# Function to display next steps
show_next_steps() {
    echo ""
    print_success "Setup completed successfully! 🎉"
    echo ""
    print_status "Next steps:"
    echo "  1. Update your GitHub OAuth credentials in .env files:"
    echo "     - GITHUB_CLIENT_ID"
    echo "     - GITHUB_CLIENT_SECRET"
    echo "  2. Update MONGODB_URI if using MongoDB Atlas"
    echo "  3. Start the development servers:"
    echo "     npm run dev"
    echo ""
    print_status "GitHub OAuth Setup:"
    echo "  1. Go to https://github.com/settings/developers"
    echo "  2. Create a new OAuth App with:"
    echo "     - Homepage URL: http://localhost:3000"
    echo "     - Callback URL: http://localhost:3000/auth/callback"
    echo "  3. Copy Client ID and Secret to your .env files"
    echo ""
    print_status "MongoDB Setup:"
    echo "  Local: brew install mongodb-community && brew services start mongodb-community"
    echo "  Cloud: Use MongoDB Atlas and update MONGODB_URI"
    echo ""
}

# Main setup function
main() {
    echo "🚀 DevDeck Development Setup"
    echo "=============================="
    echo ""
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    
    if ! check_node_version; then
        print_error "Please install Node.js >= 18.0.0 and try again"
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
    echo ""
    
    # Install dependencies
    install_dependencies
    echo ""
    
    # Setup environment files
    setup_env_files
    echo ""
    
    # Generate secrets
    if command_exists openssl; then
        generate_secrets
        echo ""
    else
        print_warning "OpenSSL not found. Please manually update secrets in .env files"
        echo ""
    fi
    
    # Check MongoDB
    check_mongodb
    echo ""
    
    # Show next steps
    show_next_steps
}

# Run main function
main "$@"