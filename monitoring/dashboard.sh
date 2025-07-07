#!/bin/bash

# DevDeck Monitoring Dashboard
# Real-time monitoring dashboard in terminal

set -e

# Configuration
MONITOR_DIR="$(dirname "$0")"
REFRESH_INTERVAL="${REFRESH_INTERVAL:-5}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Clear screen function
clear_screen() {
    clear
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                    DevDeck Monitoring Dashboard             ║${NC}"
    echo -e "${PURPLE}║                    $(date '+%Y-%m-%d %H:%M:%S')                    ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo
}

# Display health status
show_health() {
    echo -e "${CYAN}🏥 HEALTH STATUS${NC}"
    echo "────────────────────────────────────────────────────────────────"
    
    # Run health check silently and capture output
    if [ -f "$MONITOR_DIR/health-check.sh" ]; then
        "$MONITOR_DIR/health-check.sh" 2>/dev/null | grep -E "✅|❌|⚠️" || echo "Health check not available"
    else
        echo "Health check script not found"
    fi
    echo
}

# Display performance metrics
show_performance() {
    echo -e "${CYAN}📊 PERFORMANCE METRICS${NC}"
    echo "────────────────────────────────────────────────────────────────"
    
    if [ -f "$MONITOR_DIR/metrics.json" ]; then
        local backend_time=$(jq -r '.backend_response_time' "$MONITOR_DIR/metrics.json" 2>/dev/null || echo "N/A")
        local frontend_time=$(jq -r '.frontend_response_time' "$MONITOR_DIR/metrics.json" 2>/dev/null || echo "N/A")
        local cpu_usage=$(jq -r '.system_metrics.cpu_usage' "$MONITOR_DIR/metrics.json" 2>/dev/null || echo "N/A")
        local disk_usage=$(jq -r '.system_metrics.disk_usage' "$MONITOR_DIR/metrics.json" 2>/dev/null || echo "N/A")
        
        echo "Backend Response Time: ${backend_time}ms"
        echo "Frontend Response Time: ${frontend_time}ms"
        echo "CPU Usage: ${cpu_usage}%"
        echo "Disk Usage: ${disk_usage}%"
    else
        echo "Performance metrics not available"
    fi
    echo
}

# Display recent errors
show_errors() {
    echo -e "${CYAN}🚨 RECENT ERRORS${NC}"
    echo "────────────────────────────────────────────────────────────────"
    
    if [ -f "$MONITOR_DIR/errors.log" ]; then
        tail -5 "$MONITOR_DIR/errors.log" 2>/dev/null || echo "No recent errors"
    else
        echo "Error log not available"
    fi
    echo
}

# Display system info
show_system() {
    echo -e "${CYAN}🖥️  SYSTEM INFO${NC}"
    echo "────────────────────────────────────────────────────────────────"
    echo "Uptime: $(uptime | awk '{print $3,$4}' | sed 's/,//')"
    echo "Load Average: $(uptime | awk -F'load average:' '{print $2}')"
    echo "Memory: $(free -h 2>/dev/null | grep Mem | awk '{print $3"/"$2}' || echo "N/A")"
    echo "Disk: $(df -h / | awk 'NR==2{print $3"/"$2" ("$5" used)"}')"
    echo
}

# Main dashboard loop
echo "Starting DevDeck Monitoring Dashboard..."
echo "Press Ctrl+C to exit"
sleep 2

while true; do
    clear_screen
    show_health
    show_performance
    show_errors
    show_system
    
    echo -e "${PURPLE}Refreshing in ${REFRESH_INTERVAL} seconds... (Ctrl+C to exit)${NC}"
    sleep "$REFRESH_INTERVAL"
done
