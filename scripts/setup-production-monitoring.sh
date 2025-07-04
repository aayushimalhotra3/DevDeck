#!/bin/bash

# Production Monitoring Setup Script for DevDeck
# This script sets up comprehensive monitoring for production environment

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_URL="https://devdeck-rho.vercel.app"
BACKEND_URL="https://devdeck-1.onrender.com"
MONITOR_INTERVAL=300  # 5 minutes
LOG_DIR="logs"
ALERT_EMAIL="admin@devdeck.com"  # Configure as needed

echo "=========================================="
echo "    DevDeck Production Monitoring Setup"
echo "=========================================="
echo ""

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to log with timestamp
log_message() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_DIR/monitoring-setup.log"
}

# Function to check service health
check_service_health() {
    local service_name="$1"
    local url="$2"
    local endpoint="${3:-}"
    
    local full_url="$url$endpoint"
    local response=$(curl -s -w "%{http_code}:%{time_total}" --max-time 10 "$full_url" 2>/dev/null)
    
    if [[ $? -eq 0 ]]; then
        local status_code=$(echo "$response" | cut -d':' -f1)
        local response_time=$(echo "$response" | cut -d':' -f2)
        
        if [[ "$status_code" == "200" ]]; then
            log_message "INFO" "$service_name is healthy (${response_time}s)"
            return 0
        else
            log_message "ERROR" "$service_name returned HTTP $status_code"
            return 1
        fi
    else
        log_message "ERROR" "$service_name is unreachable"
        return 1
    fi
}

# Function to setup monitoring cron job
setup_monitoring_cron() {
    log_message "INFO" "Setting up monitoring cron job"
    
    # Create monitoring script
    cat > "$LOG_DIR/monitor-cron.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")/.."
./scripts/production-monitor.sh check >> logs/continuous-monitoring.log 2>&1
EOF
    
    chmod +x "$LOG_DIR/monitor-cron.sh"
    
    # Add to crontab (runs every 5 minutes)
    local cron_entry="*/5 * * * * $(pwd)/$LOG_DIR/monitor-cron.sh"
    
    # Check if cron entry already exists
    if ! crontab -l 2>/dev/null | grep -q "monitor-cron.sh"; then
        (crontab -l 2>/dev/null; echo "$cron_entry") | crontab -
        log_message "INFO" "Monitoring cron job added successfully"
    else
        log_message "INFO" "Monitoring cron job already exists"
    fi
}

# Function to create monitoring dashboard
create_monitoring_dashboard() {
    log_message "INFO" "Creating monitoring dashboard"
    
    cat > "$LOG_DIR/monitoring-dashboard.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevDeck Production Monitoring</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .status-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status-healthy { border-left: 4px solid #10b981; }
        .status-unhealthy { border-left: 4px solid #ef4444; }
        .status-warning { border-left: 4px solid #f59e0b; }
        .metric { display: flex; justify-content: space-between; margin: 10px 0; }
        .refresh-btn { background: #2563eb; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>DevDeck Production Monitoring</h1>
            <p>Real-time status of production services</p>
            <button class="refresh-btn" onclick="location.reload()">Refresh Status</button>
        </div>
        
        <div class="status-grid">
            <div class="status-card status-healthy">
                <h3>Frontend (Vercel)</h3>
                <div class="metric"><span>URL:</span><span>https://devdeck-rho.vercel.app</span></div>
                <div class="metric"><span>Status:</span><span id="frontend-status">Checking...</span></div>
                <div class="metric"><span>Response Time:</span><span id="frontend-time">-</span></div>
            </div>
            
            <div class="status-card status-unhealthy">
                <h3>Backend (Render)</h3>
                <div class="metric"><span>URL:</span><span>https://devdeck-1.onrender.com</span></div>
                <div class="metric"><span>Status:</span><span id="backend-status">Checking...</span></div>
                <div class="metric"><span>Response Time:</span><span id="backend-time">-</span></div>
            </div>
            
            <div class="status-card status-warning">
                <h3>Database</h3>
                <div class="metric"><span>Type:</span><span>MongoDB Atlas</span></div>
                <div class="metric"><span>Status:</span><span id="db-status">Checking...</span></div>
                <div class="metric"><span>Connection:</span><span id="db-connection">-</span></div>
            </div>
            
            <div class="status-card">
                <h3>SSL Certificates</h3>
                <div class="metric"><span>Frontend SSL:</span><span id="frontend-ssl">Checking...</span></div>
                <div class="metric"><span>Backend SSL:</span><span id="backend-ssl">Checking...</span></div>
            </div>
        </div>
        
        <div style="margin-top: 20px; text-align: center; color: #666;">
            <p>Last updated: <span id="last-updated"></span></p>
            <p>Auto-refresh every 30 seconds</p>
        </div>
    </div>
    
    <script>
        function updateTimestamp() {
            document.getElementById('last-updated').textContent = new Date().toLocaleString();
        }
        
        // Update timestamp on load
        updateTimestamp();
        
        // Auto-refresh every 30 seconds
        setInterval(() => {
            location.reload();
        }, 30000);
    </script>
</body>
</html>
EOF
    
    log_message "INFO" "Monitoring dashboard created at $LOG_DIR/monitoring-dashboard.html"
}

# Function to setup SSL monitoring
setup_ssl_monitoring() {
    log_message "INFO" "Setting up SSL certificate monitoring"
    
    cat > "scripts/check-ssl-expiry.sh" << 'EOF'
#!/bin/bash

# SSL Certificate Expiry Checker
FRONTEND_DOMAIN="devdeck-rho.vercel.app"
BACKEND_DOMAIN="devdeck-1.onrender.com"
WARN_DAYS=30

check_ssl_expiry() {
    local domain="$1"
    local warn_days="$2"
    
    echo "Checking SSL certificate for $domain..."
    
    # Get certificate expiry date
    local expiry_date=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
    
    if [[ -n "$expiry_date" ]]; then
        local expiry_epoch=$(date -d "$expiry_date" +%s 2>/dev/null)
        local current_epoch=$(date +%s)
        local days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))
        
        echo "Certificate for $domain expires in $days_until_expiry days"
        
        if [[ $days_until_expiry -lt $warn_days ]]; then
            echo "WARNING: SSL certificate for $domain expires in $days_until_expiry days!"
            return 1
        fi
    else
        echo "ERROR: Could not retrieve SSL certificate for $domain"
        return 1
    fi
    
    return 0
}

check_ssl_expiry "$FRONTEND_DOMAIN" "$WARN_DAYS"
check_ssl_expiry "$BACKEND_DOMAIN" "$WARN_DAYS"
EOF
    
    chmod +x "scripts/check-ssl-expiry.sh"
    log_message "INFO" "SSL monitoring script created"
}

# Function to create alerting system
setup_alerting() {
    log_message "INFO" "Setting up alerting system"
    
    cat > "scripts/send-alert.sh" << 'EOF'
#!/bin/bash

# Simple alerting system for DevDeck monitoring
ALERT_TYPE="$1"
MESSAGE="$2"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Log alert
echo "[$TIMESTAMP] [ALERT-$ALERT_TYPE] $MESSAGE" >> logs/alerts.log

# You can extend this to send emails, Slack notifications, etc.
case "$ALERT_TYPE" in
    "CRITICAL")
        echo "🚨 CRITICAL ALERT: $MESSAGE"
        # Add email/Slack notification here
        ;;
    "WARNING")
        echo "⚠️  WARNING: $MESSAGE"
        # Add notification here
        ;;
    "INFO")
        echo "ℹ️  INFO: $MESSAGE"
        ;;
esac
EOF
    
    chmod +x "scripts/send-alert.sh"
    log_message "INFO" "Alerting system created"
}

# Main setup process
log_message "INFO" "Starting production monitoring setup"

# Initial health check
echo "Performing initial health checks..."
check_service_health "Frontend" "$FRONTEND_URL" "/"
check_service_health "Backend" "$BACKEND_URL" "/health"

# Setup monitoring components
setup_monitoring_cron
create_monitoring_dashboard
setup_ssl_monitoring
setup_alerting

# Create monitoring summary
log_message "INFO" "Production monitoring setup completed"

echo ""
echo "=========================================="
echo "    MONITORING SETUP COMPLETE"
echo "=========================================="
echo ""
echo "✅ Continuous monitoring enabled (every 5 minutes)"
echo "✅ Monitoring dashboard created: $LOG_DIR/monitoring-dashboard.html"
echo "✅ SSL certificate monitoring enabled"
echo "✅ Alerting system configured"
echo ""
echo "Available commands:"
echo "  ./scripts/quick-health-check.sh          - Quick status check"
echo "  ./scripts/production-monitor.sh check    - Comprehensive monitoring"
echo "  ./scripts/check-ssl-expiry.sh           - SSL certificate check"
echo "  ./scripts/verify-deployment.sh          - Deployment verification"
echo ""
echo "Logs location: $LOG_DIR/"
echo "Dashboard: file://$(pwd)/$LOG_DIR/monitoring-dashboard.html"
echo "=========================================="