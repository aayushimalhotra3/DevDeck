#!/bin/bash

# DevDeck Production Monitoring Script
# This script provides comprehensive monitoring for production environments
# Features: Health checks, performance monitoring, error tracking, uptime monitoring

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PRODUCTION_URL="${PRODUCTION_URL:-https://devdeck-1.onrender.com}"
BACKEND_URL="${BACKEND_URL:-https://devdeck-1.onrender.com}"
FRONTEND_URL="${FRONTEND_URL:-https://devdeck-rho.vercel.app}"
MONITOR_INTERVAL="${MONITOR_INTERVAL:-300}" # 5 minutes default
LOG_FILE="logs/production-monitor.log"
ALERT_WEBHOOK="${ALERT_WEBHOOK:-}" # Slack/Discord webhook for alerts
MAX_RESPONSE_TIME=5000 # 5 seconds

# Create logs directory if it doesn't exist
mkdir -p logs

# Logging function
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# Send alert function
send_alert() {
    local message="$1"
    local severity="${2:-WARNING}"
    
    log "ALERT" "$severity: $message"
    
    if [[ -n "$ALERT_WEBHOOK" ]]; then
        curl -X POST "$ALERT_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "{\"text\": \"🚨 DevDeck $severity: $message\"}" \
            --silent --max-time 10 || log "ERROR" "Failed to send alert"
    fi
}

# Health check function
check_health() {
    local url="$1"
    local service_name="$2"
    local timeout="${3:-10}"
    
    log "INFO" "Checking $service_name health at $url"
    
    local start_time=$(date +%s%3N)
    local response=$(curl -s -w "%{http_code}:%{time_total}" --max-time "$timeout" "$url/health" 2>/dev/null)
    local end_time=$(date +%s%3N)
    
    if [[ $? -eq 0 ]]; then
        local http_code=$(echo "$response" | cut -d':' -f1)
        local response_time=$(echo "$response" | cut -d':' -f2)
        local response_time_ms=$(echo "$response_time * 1000" | bc -l | cut -d'.' -f1)
        
        if [[ "$http_code" == "200" ]]; then
            if [[ $response_time_ms -gt $MAX_RESPONSE_TIME ]]; then
                log "WARNING" "$service_name is slow: ${response_time_ms}ms"
                send_alert "$service_name response time is ${response_time_ms}ms (threshold: ${MAX_RESPONSE_TIME}ms)" "WARNING"
            else
                log "SUCCESS" "$service_name is healthy (${response_time_ms}ms)"
            fi
            return 0
        else
            log "ERROR" "$service_name returned HTTP $http_code"
            send_alert "$service_name health check failed with HTTP $http_code" "CRITICAL"
            return 1
        fi
    else
        log "ERROR" "$service_name is unreachable"
        send_alert "$service_name is unreachable" "CRITICAL"
        return 1
    fi
}

# API endpoint testing
test_api_endpoints() {
    log "INFO" "Testing critical API endpoints"
    
    local endpoints=(
        "GET:/health:200"
        "GET:/api/user/profile:401"  # Should require auth
        "POST:/auth/login:400"       # Should require body
        "GET:/api/portfolio/public:200"  # Public endpoint
    )
    
    local failed_count=0
    
    for endpoint in "${endpoints[@]}"; do
        IFS=':' read -r method path expected_code <<< "$endpoint"
        
        log "INFO" "Testing $method $path (expecting $expected_code)"
        
        local response=$(curl -s -w "%{http_code}" -X "$method" "$BACKEND_URL$path" --max-time 10 2>/dev/null)
        local actual_code=$(echo "$response" | tail -c 4)
        
        if [[ "$actual_code" == "$expected_code" ]]; then
            log "SUCCESS" "$method $path returned expected $expected_code"
        else
            log "ERROR" "$method $path returned $actual_code, expected $expected_code"
            ((failed_count++))
        fi
    done
    
    if [[ $failed_count -gt 0 ]]; then
        send_alert "$failed_count API endpoints failed testing" "WARNING"
    fi
    
    return $failed_count
}

# Database connectivity check
check_database() {
    log "INFO" "Checking database connectivity"
    
    local response=$(curl -s "$BACKEND_URL/health" --max-time 10 2>/dev/null)
    
    if echo "$response" | grep -q '"database":"connected"'; then
        log "SUCCESS" "Database is connected"
        return 0
    else
        log "ERROR" "Database connection issue detected"
        send_alert "Database connectivity issue detected" "CRITICAL"
        return 1
    fi
}

# SSL certificate check
check_ssl_certificate() {
    local domain=$(echo "$PRODUCTION_URL" | sed 's|https\?://||' | cut -d'/' -f1)
    
    if [[ "$PRODUCTION_URL" == https://* ]]; then
        log "INFO" "Checking SSL certificate for $domain"
        
        local cert_info=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
        
        if [[ $? -eq 0 ]]; then
            local expiry_date=$(echo "$cert_info" | grep "notAfter" | cut -d'=' -f2)
            local expiry_timestamp=$(date -d "$expiry_date" +%s 2>/dev/null)
            local current_timestamp=$(date +%s)
            local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
            
            if [[ $days_until_expiry -lt 30 ]]; then
                log "WARNING" "SSL certificate expires in $days_until_expiry days"
                send_alert "SSL certificate expires in $days_until_expiry days" "WARNING"
            else
                log "SUCCESS" "SSL certificate is valid (expires in $days_until_expiry days)"
            fi
        else
            log "ERROR" "Failed to check SSL certificate"
            send_alert "SSL certificate check failed" "WARNING"
        fi
    else
        log "WARNING" "Production URL is not using HTTPS"
    fi
}

# Performance metrics collection
collect_performance_metrics() {
    log "INFO" "Collecting performance metrics"
    
    local start_time=$(date +%s%3N)
    local response=$(curl -s -w "%{time_total}:%{time_connect}:%{time_starttransfer}" "$BACKEND_URL/health" --max-time 10 2>/dev/null)
    local end_time=$(date +%s%3N)
    
    if [[ $? -eq 0 ]]; then
        IFS=':' read -r total_time connect_time ttfb <<< "$response"
        
        local total_ms=$(echo "$total_time * 1000" | bc -l | cut -d'.' -f1)
        local connect_ms=$(echo "$connect_time * 1000" | bc -l | cut -d'.' -f1)
        local ttfb_ms=$(echo "$ttfb * 1000" | bc -l | cut -d'.' -f1)
        
        log "METRICS" "Response time: ${total_ms}ms, Connect: ${connect_ms}ms, TTFB: ${ttfb_ms}ms"
        
        # Store metrics for trending (you can extend this to send to monitoring services)
        echo "$(date +%s),$total_ms,$connect_ms,$ttfb_ms" >> "logs/performance-metrics.csv"
    else
        log "ERROR" "Failed to collect performance metrics"
    fi
}

# Memory and resource monitoring
monitor_resources() {
    log "INFO" "Monitoring resource usage"
    
    # This would typically monitor the actual server resources
    # For now, we'll check the health endpoint for memory info
    local response=$(curl -s "$BACKEND_URL/health" --max-time 10 2>/dev/null)
    
    if echo "$response" | grep -q '"memory"'; then
        local memory_info=$(echo "$response" | grep -o '"memory":{[^}]*}')
        log "METRICS" "Memory usage: $memory_info"
    fi
}

# Main monitoring function
run_monitoring_cycle() {
    log "INFO" "Starting monitoring cycle"
    
    local overall_status="HEALTHY"
    
    # Health checks
    if ! check_health "$BACKEND_URL" "Backend API"; then
        overall_status="UNHEALTHY"
    fi
    
    if ! check_health "$FRONTEND_URL" "Frontend"; then
        overall_status="DEGRADED"
    fi
    
    # API testing
    test_api_endpoints
    
    # Database check
    if ! check_database; then
        overall_status="UNHEALTHY"
    fi
    
    # SSL certificate check
    check_ssl_certificate
    
    # Performance metrics
    collect_performance_metrics
    
    # Resource monitoring
    monitor_resources
    
    log "INFO" "Monitoring cycle completed - Overall status: $overall_status"
    
    if [[ "$overall_status" == "UNHEALTHY" ]]; then
        send_alert "System is unhealthy - immediate attention required" "CRITICAL"
    elif [[ "$overall_status" == "DEGRADED" ]]; then
        send_alert "System is degraded - some services may be affected" "WARNING"
    fi
}

# Continuous monitoring mode
continuous_monitoring() {
    log "INFO" "Starting continuous monitoring (interval: ${MONITOR_INTERVAL}s)"
    
    while true; do
        run_monitoring_cycle
        log "INFO" "Waiting ${MONITOR_INTERVAL} seconds until next check..."
        sleep "$MONITOR_INTERVAL"
    done
}

# Usage information
show_usage() {
    echo "DevDeck Production Monitoring Script"
    echo ""
    echo "Usage: $0 [OPTIONS] [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  monitor     Run continuous monitoring (default)"
    echo "  check       Run single monitoring cycle"
    echo "  health      Quick health check only"
    echo "  ssl         Check SSL certificate only"
    echo "  api         Test API endpoints only"
    echo ""
    echo "Options:"
    echo "  -u, --url URL          Production URL (default: https://your-app.onrender.com)"
    echo "  -i, --interval SECONDS Monitoring interval (default: 300)"
    echo "  -w, --webhook URL      Alert webhook URL"
    echo "  -h, --help            Show this help"
    echo ""
    echo "Environment Variables:"
    echo "  PRODUCTION_URL    Production application URL"
    echo "  MONITOR_INTERVAL  Monitoring interval in seconds"
    echo "  ALERT_WEBHOOK     Webhook URL for alerts"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -u|--url)
            PRODUCTION_URL="$2"
            BACKEND_URL="$2"
            FRONTEND_URL="$2"
            shift 2
            ;;
        -i|--interval)
            MONITOR_INTERVAL="$2"
            shift 2
            ;;
        -w|--webhook)
            ALERT_WEBHOOK="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        monitor)
            COMMAND="monitor"
            shift
            ;;
        check)
            COMMAND="check"
            shift
            ;;
        health)
            COMMAND="health"
            shift
            ;;
        ssl)
            COMMAND="ssl"
            shift
            ;;
        api)
            COMMAND="api"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Set default command
COMMAND="${COMMAND:-monitor}"

# Validate configuration
if [[ "$PRODUCTION_URL" == "https://your-app.onrender.com" ]]; then
    echo -e "${YELLOW}Warning: Using default production URL. Set PRODUCTION_URL environment variable or use -u option.${NC}"
fi

# Execute command
case "$COMMAND" in
    monitor)
        continuous_monitoring
        ;;
    check)
        run_monitoring_cycle
        ;;
    health)
        check_health "$BACKEND_URL" "Backend API"
        check_health "$FRONTEND_URL" "Frontend"
        ;;
    ssl)
        check_ssl_certificate
        ;;
    api)
        test_api_endpoints
        ;;
    *)
        echo "Unknown command: $COMMAND"
        show_usage
        exit 1
        ;;
esac