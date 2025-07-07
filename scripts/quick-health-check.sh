#!/bin/bash

# Quick Health Check Script for DevDeck Production Services
# This script provides a fast overview of service status

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_URL="https://devdeck-rho.vercel.app"
BACKEND_URL="https://devdeck-1.onrender.com"

echo "=========================================="
echo "    DevDeck Production Health Check"
echo "=========================================="
echo ""

# Function to check service
check_service() {
    local name="$1"
    local url="$2"
    local endpoint="${3:-}"
    
    echo -n "Checking $name... "
    
    local full_url="$url$endpoint"
    local response=$(curl -s -w "%{http_code}:%{time_total}" --max-time 10 "$full_url" 2>/dev/null)
    
    if [[ $? -eq 0 ]]; then
        local status_code=$(echo "$response" | cut -d':' -f1)
        local response_time=$(echo "$response" | cut -d':' -f2)
        local response_time_ms=$(echo "$response_time * 1000" | bc -l 2>/dev/null | cut -d'.' -f1)
        
        if [[ "$status_code" == "200" ]]; then
            echo -e "${GREEN}✅ HEALTHY${NC} (${response_time_ms}ms)"
            return 0
        elif [[ "$status_code" == "502" ]]; then
            echo -e "${RED}❌ BAD GATEWAY${NC} (Service Down)"
            return 1
        elif [[ "$status_code" == "404" ]]; then
            echo -e "${YELLOW}⚠️  NOT FOUND${NC} (Endpoint may not exist)"
            return 1
        else
            echo -e "${YELLOW}⚠️  HTTP $status_code${NC} (${response_time_ms}ms)"
            return 1
        fi
    else
        echo -e "${RED}❌ UNREACHABLE${NC}"
        return 1
    fi
}

# Check Frontend
echo "Frontend Services:"
check_service "Frontend Home" "$FRONTEND_URL" "/"
check_service "Frontend API Route" "$FRONTEND_URL" "/api/health"
echo ""

# Check Backend
echo "Backend Services:"
check_service "Backend Health" "$BACKEND_URL" "/health"
check_service "Backend Auth" "$BACKEND_URL" "/auth/login"
check_service "Backend API" "$BACKEND_URL" "/api/user/profile"
echo ""

# Quick SSL Check
echo "SSL Certificate Status:"
for url in "$FRONTEND_URL" "$BACKEND_URL"; do
    domain=$(echo "$url" | sed 's|https\?://||' | cut -d'/' -f1)
    echo -n "$domain... "
    
    if [[ "$url" == https://* ]]; then
        cert_info=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
        
        if [[ $? -eq 0 ]]; then
            echo -e "${GREEN}✅ SSL VALID${NC}"
        else
            echo -e "${RED}❌ SSL ISSUE${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  NO HTTPS${NC}"
    fi
done

echo ""
echo "=========================================="
echo "Summary:"
echo "Frontend: $FRONTEND_URL"
echo "Backend:  $BACKEND_URL"
echo ""
echo "For detailed monitoring, run:"
echo "  ./scripts/production-monitor.sh check"
echo ""
echo "For API testing, run:"
echo "  PRODUCTION_URL=$BACKEND_URL ./scripts/test-production-api.sh"
echo "=========================================="