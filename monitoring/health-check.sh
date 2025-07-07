#!/bin/bash

# DevDeck Health Check Script
# Monitors application health and sends alerts

set -e

# Configuration
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
BACKEND_URL="${BACKEND_URL:-http://localhost:5001}"
ALERT_WEBHOOK="${ALERT_WEBHOOK:-}"
CHECK_INTERVAL="${CHECK_INTERVAL:-300}" # 5 minutes
MAX_RETRIES=3
TIMEOUT=30

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging
LOG_FILE="$(dirname "$0")/health-check.log"
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Health check function
check_endpoint() {
    local url="$1"
    local name="$2"
    local retries=0
    
    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -f -s --max-time $TIMEOUT "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $name is healthy${NC}"
            log "SUCCESS: $name health check passed"
            return 0
        fi
        
        retries=$((retries + 1))
        if [ $retries -lt $MAX_RETRIES ]; then
            echo -e "${YELLOW}⚠️  $name check failed, retrying ($retries/$MAX_RETRIES)...${NC}"
            sleep 5
        fi
    done
    
    echo -e "${RED}❌ $name is unhealthy${NC}"
    log "ERROR: $name health check failed after $MAX_RETRIES attempts"
    return 1
}

# Send alert function
send_alert() {
    local message="$1"
    local severity="${2:-warning}"
    
    if [ ! -z "$ALERT_WEBHOOK" ]; then
        local color="warning"
        case $severity in
            "error") color="danger" ;;
            "success") color="good" ;;
        esac
        
        curl -X POST "$ALERT_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "{
                \"text\": \"DevDeck Alert\",
                \"attachments\": [{
                    \"color\": \"$color\",
                    \"text\": \"$message\",
                    \"ts\": $(date +%s)
                }]
            }" &> /dev/null
    fi
}

# Main health check
echo "=== DevDeck Health Check - $(date) ==="

# Check backend health
if check_endpoint "$BACKEND_URL/health" "Backend"; then
    BACKEND_HEALTHY=true
else
    BACKEND_HEALTHY=false
    send_alert "Backend health check failed at $BACKEND_URL" "error"
fi

# Check frontend
if check_endpoint "$FRONTEND_URL" "Frontend"; then
    FRONTEND_HEALTHY=true
else
    FRONTEND_HEALTHY=false
    send_alert "Frontend health check failed at $FRONTEND_URL" "error"
fi

# Check database (via backend health endpoint)
if [ "$BACKEND_HEALTHY" = true ]; then
    DB_STATUS=$(curl -s "$BACKEND_URL/health" | jq -r '.services.database.status' 2>/dev/null || echo "unknown")
    if [ "$DB_STATUS" = "connected" ]; then
        echo -e "${GREEN}✅ Database is connected${NC}"
        log "SUCCESS: Database connection verified"
    else
        echo -e "${RED}❌ Database connection issue: $DB_STATUS${NC}"
        log "ERROR: Database connection issue: $DB_STATUS"
        send_alert "Database connection issue: $DB_STATUS" "error"
    fi
fi

# Overall status
if [ "$BACKEND_HEALTHY" = true ] && [ "$FRONTEND_HEALTHY" = true ]; then
    echo -e "${GREEN}🎉 All systems operational${NC}"
    log "SUCCESS: All systems operational"
else
    echo -e "${RED}🚨 System issues detected${NC}"
    log "ERROR: System issues detected"
fi

echo "=== Health Check Complete ==="
