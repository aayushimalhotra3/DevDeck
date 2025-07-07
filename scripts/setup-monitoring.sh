#!/bin/bash

# DevDeck Monitoring Setup Script
# Sets up comprehensive monitoring, health checks, and alerting

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
    echo -e "${BLUE}[MONITOR]${NC} $1"
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
    echo -e "${PURPLE}[SETUP]${NC} $1"
}

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MONITORING_DIR="$PROJECT_ROOT/monitoring"
LOG_FILE="$MONITORING_DIR/setup.log"

# Create monitoring directory
mkdir -p "$MONITORING_DIR"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

print_header "Setting up DevDeck Monitoring System"
log "Starting monitoring setup"

# 1. Create health check script
print_status "Creating health check script..."
cat > "$MONITORING_DIR/health-check.sh" << 'EOF'
#!/bin/bash

# DevDeck Health Check Script
# Monitors application health and sends alerts

set -e

# Configuration
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
BACKEND_URL="${BACKEND_URL:-http://localhost:5000}"
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
EOF

chmod +x "$MONITORING_DIR/health-check.sh"
print_success "Health check script created"

# 2. Create performance monitoring script
print_status "Creating performance monitoring script..."
cat > "$MONITORING_DIR/performance-monitor.sh" << 'EOF'
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
EOF

echo "=== Performance Monitor Complete ==="

chmod +x "$MONITORING_DIR/performance-monitor.sh"
print_success "Performance monitoring script created"

# 3. Create log aggregation script
print_status "Creating log aggregation script..."
cat > "$MONITORING_DIR/aggregate-logs.sh" << 'EOF'
#!/bin/bash

# DevDeck Log Aggregation Script
# Collects and analyzes application logs

set -e

# Configuration
LOG_DIR="$(dirname "$0")"
APP_LOG_DIR="${APP_LOG_DIR:-/var/log/devdeck}"
AGGREGATED_LOG="$LOG_DIR/aggregated.log"
ERROR_LOG="$LOG_DIR/errors.log"
SUMMARY_LOG="$LOG_DIR/summary.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=== DevDeck Log Aggregation - $(date) ==="

# Aggregate logs from various sources
echo -e "${BLUE}📋 Aggregating logs...${NC}"

# Clear previous aggregated logs
> "$AGGREGATED_LOG"
> "$ERROR_LOG"
> "$SUMMARY_LOG"

# Collect Railway logs (if available)
if command -v railway &> /dev/null; then
    echo "Collecting Railway logs..." >> "$AGGREGATED_LOG"
    railway logs --tail 100 >> "$AGGREGATED_LOG" 2>/dev/null || echo "Railway logs not available" >> "$AGGREGATED_LOG"
fi

# Collect Vercel logs (if available)
if command -v vercel &> /dev/null; then
    echo "Collecting Vercel logs..." >> "$AGGREGATED_LOG"
    # Note: Vercel logs are typically viewed through dashboard
    echo "Vercel logs available through dashboard" >> "$AGGREGATED_LOG"
fi

# Extract errors
echo -e "${BLUE}🔍 Extracting errors...${NC}"
grep -i "error\|exception\|failed\|critical" "$AGGREGATED_LOG" > "$ERROR_LOG" 2>/dev/null || echo "No errors found" > "$ERROR_LOG"

# Generate summary
echo -e "${BLUE}📊 Generating summary...${NC}"
cat > "$SUMMARY_LOG" << SUMMARY
=== DevDeck Log Summary - $(date) ===

Total log entries: $(wc -l < "$AGGREGATED_LOG" 2>/dev/null || echo "0")
Error entries: $(wc -l < "$ERROR_LOG" 2>/dev/null || echo "0")

Top error patterns:
$(grep -o "Error: [^\n]*" "$ERROR_LOG" 2>/dev/null | sort | uniq -c | sort -nr | head -5 || echo "No error patterns found")

Recent errors (last 10):
$(tail -10 "$ERROR_LOG" 2>/dev/null || echo "No recent errors")

=== End Summary ===
SUMMARY

# Display summary
cat "$SUMMARY_LOG"

echo "=== Log Aggregation Complete ==="
echo "📁 Aggregated log: $AGGREGATED_LOG"
echo "🚨 Error log: $ERROR_LOG"
echo "📊 Summary: $SUMMARY_LOG"
EOF

chmod +x "$MONITORING_DIR/aggregate-logs.sh"
print_success "Log aggregation script created"

# 4. Create monitoring dashboard script
print_status "Creating monitoring dashboard script..."
cat > "$MONITORING_DIR/dashboard.sh" << 'EOF'
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
EOF

chmod +x "$MONITORING_DIR/dashboard.sh"
print_success "Monitoring dashboard created"

# 5. Create cron job setup
print_status "Creating cron job configuration..."
cat > "$MONITORING_DIR/setup-cron.sh" << EOF
#!/bin/bash

# DevDeck Cron Jobs Setup
# Sets up automated monitoring tasks

MONITOR_DIR="\$(dirname "\$0")"

echo "Setting up DevDeck monitoring cron jobs..."

# Create cron jobs
(crontab -l 2>/dev/null; echo "# DevDeck Monitoring Jobs") | crontab -
(crontab -l 2>/dev/null; echo "*/5 * * * * \$MONITOR_DIR/health-check.sh >> \$MONITOR_DIR/cron.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "*/10 * * * * \$MONITOR_DIR/performance-monitor.sh >> \$MONITOR_DIR/cron.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "0 */6 * * * \$MONITOR_DIR/aggregate-logs.sh >> \$MONITOR_DIR/cron.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "0 2 * * * $PROJECT_ROOT/scripts/backup-database.sh >> \$MONITOR_DIR/cron.log 2>&1") | crontab -

echo "Cron jobs configured:"
echo "  - Health check: Every 5 minutes"
echo "  - Performance monitor: Every 10 minutes"
echo "  - Log aggregation: Every 6 hours"
echo "  - Database backup: Daily at 2 AM"
echo
echo "To view cron jobs: crontab -l"
echo "To remove cron jobs: crontab -r"
EOF

chmod +x "$MONITORING_DIR/setup-cron.sh"
print_success "Cron job setup script created"

# 6. Create monitoring configuration file
print_status "Creating monitoring configuration..."
cat > "$MONITORING_DIR/config.env" << EOF
# DevDeck Monitoring Configuration
# Copy and customize these variables

# Application URLs
FRONTEND_URL=https://your-frontend.vercel.app
BACKEND_URL=https://your-backend.railway.app

# Monitoring Settings
CHECK_INTERVAL=300
REFRESH_INTERVAL=5
MAX_RETRIES=3
TIMEOUT=30

# Alert Configuration
ALERT_WEBHOOK=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
BACKUP_NOTIFICATION_WEBHOOK=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Log Settings
LOG_LEVEL=info
LOG_RETENTION_DAYS=30

# Performance Thresholds
MAX_RESPONSE_TIME=5000
MAX_CPU_USAGE=80
MAX_MEMORY_USAGE=80
MAX_DISK_USAGE=90
EOF

print_success "Monitoring configuration created"

# 7. Create README for monitoring
print_status "Creating monitoring documentation..."
cat > "$MONITORING_DIR/README.md" << 'EOF'
# DevDeck Monitoring System

This directory contains comprehensive monitoring tools for DevDeck.

## Scripts

### Health Monitoring
- `health-check.sh` - Checks application health and sends alerts
- `performance-monitor.sh` - Monitors response times and system metrics
- `dashboard.sh` - Real-time monitoring dashboard

### Log Management
- `aggregate-logs.sh` - Collects and analyzes logs from various sources

### Automation
- `setup-cron.sh` - Sets up automated monitoring tasks

## Configuration

1. Copy `config.env` and customize the variables:
   ```bash
   cp config.env .env
   # Edit .env with your settings
   ```

2. Set up cron jobs for automated monitoring:
   ```bash
   ./setup-cron.sh
   ```

## Usage

### Manual Health Check
```bash
./health-check.sh
```

### Performance Monitoring
```bash
./performance-monitor.sh
```

### Real-time Dashboard
```bash
./dashboard.sh
```

### Log Analysis
```bash
./aggregate-logs.sh
```

## Alerts

Configure Slack webhooks in `config.env` to receive alerts for:
- Application downtime
- Database connection issues
- Performance degradation
- Error spikes

## Files Generated

- `health-check.log` - Health check history
- `performance.log` - Performance metrics history
- `metrics.json` - Latest performance metrics
- `aggregated.log` - Aggregated application logs
- `errors.log` - Extracted error logs
- `summary.log` - Log analysis summary
- `cron.log` - Automated task logs

## Troubleshooting

1. **Health checks failing**: Check application URLs in config
2. **No metrics**: Ensure applications are running and accessible
3. **Cron jobs not running**: Check cron service and permissions
4. **Alerts not sending**: Verify webhook URLs and network connectivity
EOF

print_success "Monitoring documentation created"

print_header "Monitoring Setup Complete!"
print_success "Monitoring system installed in: $MONITORING_DIR"
echo
print_status "Next steps:"
echo "  1. Configure monitoring settings:"
echo "     cd $MONITORING_DIR"
echo "     cp config.env .env"
echo "     # Edit .env with your settings"
echo
echo "  2. Set up automated monitoring:"
echo "     ./setup-cron.sh"
echo
echo "  3. Start real-time dashboard:"
echo "     ./dashboard.sh"
echo
echo "  4. Test health checks:"
echo "     ./health-check.sh"
echo
print_status "Documentation: $MONITORING_DIR/README.md"
log "Monitoring setup completed successfully"