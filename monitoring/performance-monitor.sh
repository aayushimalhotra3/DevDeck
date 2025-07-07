#!/bin/bash

# DevDeck Performance Monitoring Script
# Monitors application performance metrics

set -e

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:5000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
LOG_FILE="$(dirname "$0")/performance.log"
METRICS_FILE="$(dirname "$0")/metrics.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Measure response time
measure_response_time() {
    local url="$1"
    local name="$2"
    
    local start_time=$(date +%s%N)
    if curl -f -s --max-time 30 "$url" > /dev/null 2>&1; then
        local end_time=$(date +%s%N)
        local response_time=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
        
        echo -e "${GREEN}✅ $name: ${response_time}ms${NC}"
        log "$name response time: ${response_time}ms"
        echo "$response_time"
    else
        echo -e "${RED}❌ $name: Failed${NC}"
        log "$name: Request failed"
        echo "-1"
    fi
}

# Get system metrics
get_system_metrics() {
    local cpu_usage=$(top -l 1 | grep "CPU usage" | awk '{print $3}' | sed 's/%//' 2>/dev/null || echo "0")
    local memory_usage=$(vm_stat | grep "Pages active" | awk '{print $3}' | sed 's/\.//' 2>/dev/null || echo "0")
    local disk_usage=$(df -h / | awk 'NR==2{print $5}' | sed 's/%//' 2>/dev/null || echo "0")
    
    echo "CPU: ${cpu_usage}%, Memory: ${memory_usage}, Disk: ${disk_usage}%"
    log "System metrics - CPU: ${cpu_usage}%, Memory: ${memory_usage}, Disk: ${disk_usage}%"
}

# Main monitoring
echo "=== DevDeck Performance Monitor - $(date) ==="

# Measure response times
echo -e "${BLUE}📊 Response Times:${NC}"
backend_time=$(measure_response_time "$BACKEND_URL/health" "Backend Health")
frontend_time=$(measure_response_time "$FRONTEND_URL" "Frontend")

# Get system metrics
echo -e "${BLUE}🖥️  System Metrics:${NC}"
get_system_metrics

# Create metrics JSON
cat > "$METRICS_FILE" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "backend_response_time": $backend_time,
  "frontend_response_time": $frontend_time,
  "system_metrics": {
    "cpu_usage": "$(top -l 1 | grep "CPU usage" | awk '{print $3}' | sed 's/%//' 2>/dev/null || echo "0")",
    "memory_usage": "$(vm_stat | grep "Pages active" | awk '{print $3}' | sed 's/\.//' 2>/dev/null || echo "0")",
    "disk_usage": "$(df -h / | awk 'NR==2{print $5}' | sed 's/%//' 2>/dev/null || echo "0")"
  }
}
