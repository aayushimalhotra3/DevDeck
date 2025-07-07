#!/bin/bash

# Analytics Automation Script
# Handles scheduled report generation, data cleanup, and alerting

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANALYTICS_DIR="$SCRIPT_DIR/../analytics"
REPORTS_DIR="$ANALYTICS_DIR/reports"
LOGS_DIR="$ANALYTICS_DIR/logs"
CONFIG_FILE="$ANALYTICS_DIR/config/analytics.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOGS_DIR/analytics.log"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOGS_DIR/analytics.log"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOGS_DIR/analytics.log"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOGS_DIR/analytics.log"
}

# Ensure directories exist
mkdir -p "$LOGS_DIR"

# Function to generate reports
generate_reports() {
    local report_type="$1"
    
    log_info "Generating $report_type analytics report..."
    
    if node "$SCRIPT_DIR/generate-analytics-reports.js" "$report_type"; then
        log_success "$report_type report generated successfully"
        
        # Check for alerts in the report
        check_report_alerts "$report_type"
    else
        log_error "Failed to generate $report_type report"
        send_alert "Report Generation Failed" "Failed to generate $report_type analytics report"
        return 1
    fi
}

# Function to check report alerts
check_report_alerts() {
    local report_type="$1"
    local report_file="$REPORTS_DIR/latest-$report_type-report.json"
    
    if [[ -f "$report_file" ]]; then
        # Check for high bounce rate
        local bounce_rate=$(jq -r '.data.overview.bounceRate // 0' "$report_file")
        if (( $(echo "$bounce_rate > 0.7" | bc -l) )); then
            send_alert "High Bounce Rate Alert" "Bounce rate is ${bounce_rate}% (>70%)"
        fi
        
        # Check for low conversion rate
        local total_conversions=$(jq -r '.summary.totalConversions // 0' "$report_file")
        local total_sessions=$(jq -r '.data.overview.totalSessions // 1' "$report_file")
        local conversion_rate=$(echo "scale=4; $total_conversions / $total_sessions" | bc)
        
        if (( $(echo "$conversion_rate < 0.02" | bc -l) )); then
            send_alert "Low Conversion Rate Alert" "Conversion rate is ${conversion_rate}% (<2%)"
        fi
        
        # Check for performance issues
        local performance_score=$(jq -r '.summary.performanceScore // 100' "$report_file")
        if (( $(echo "$performance_score < 70" | bc -l) )); then
            send_alert "Performance Alert" "Performance score is $performance_score (<70)"
        fi
        
        # Check for error rate
        local error_rate=$(jq -r '.data.performance.errorRates.errorRate // 0' "$report_file")
        if (( $(echo "$error_rate > 0.01" | bc -l) )); then
            send_alert "High Error Rate Alert" "Error rate is ${error_rate}% (>1%)"
        fi
    fi
}

# Function to send alerts
send_alert() {
    local title="$1"
    local message="$2"
    
    log_warning "ALERT: $title - $message"
    
    # Send webhook notification if configured
    if [[ -n "$ANALYTICS_WEBHOOK_URL" ]]; then
        curl -X POST "$ANALYTICS_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{
                \"title\": \"$title\",
                \"message\": \"$message\",
                \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
                \"source\": \"DevDeck Analytics\"
            }" 2>/dev/null || log_error "Failed to send webhook alert"
    fi
    
    # Send email if configured
    if [[ -n "$ANALYTICS_EMAIL" ]] && command -v mail >/dev/null 2>&1; then
        echo "$message" | mail -s "DevDeck Analytics Alert: $title" "$ANALYTICS_EMAIL" || log_error "Failed to send email alert"
    fi
}

# Function to cleanup old reports
cleanup_old_reports() {
    log_info "Cleaning up old reports..."
    
    # Keep reports for 90 days
    find "$REPORTS_DIR" -name "*.json" -type f -mtime +90 -delete 2>/dev/null || true
    
    # Keep logs for 30 days
    find "$LOGS_DIR" -name "*.log" -type f -mtime +30 -delete 2>/dev/null || true
    
    log_success "Cleanup completed"
}

# Function to backup analytics data
backup_analytics_data() {
    log_info "Creating analytics data backup..."
    
    local backup_dir="$ANALYTICS_DIR/backups"
    local backup_file="$backup_dir/analytics-backup-$(date +%Y%m%d).tar.gz"
    
    mkdir -p "$backup_dir"
    
    # Create backup of reports and configuration
    tar -czf "$backup_file" -C "$ANALYTICS_DIR" reports config 2>/dev/null || {
        log_error "Failed to create analytics backup"
        return 1
    }
    
    # Keep backups for 30 days
    find "$backup_dir" -name "analytics-backup-*.tar.gz" -type f -mtime +30 -delete 2>/dev/null || true
    
    log_success "Analytics backup created: $backup_file"
}

# Function to optimize analytics database
optimize_database() {
    log_info "Optimizing analytics database..."
    
    # Run database optimization script if it exists
    if [[ -f "$SCRIPT_DIR/optimize-analytics-db.js" ]]; then
        if node "$SCRIPT_DIR/optimize-analytics-db.js"; then
            log_success "Database optimization completed"
        else
            log_error "Database optimization failed"
        fi
    fi
}

# Function to generate summary dashboard
generate_dashboard() {
    log_info "Generating analytics dashboard..."
    
    # Create a simple HTML dashboard from latest reports
    local dashboard_file="$ANALYTICS_DIR/dashboard.html"
    
    cat > "$dashboard_file" << 'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevDeck Analytics Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric { display: inline-block; margin: 10px 20px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #2196F3; }
        .metric-label { color: #666; }
        .alert { padding: 10px; margin: 10px 0; border-radius: 4px; }
        .alert-warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; }
        .alert-success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .chart-placeholder { height: 200px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <h1>DevDeck Analytics Dashboard</h1>
        <p>Last updated: <span id="lastUpdated"></span></p>
        
        <div class="card">
            <h2>Key Metrics</h2>
            <div id="keyMetrics">
                <div class="metric">
                    <div class="metric-value" id="totalUsers">-</div>
                    <div class="metric-label">Total Users</div>
                </div>
                <div class="metric">
                    <div class="metric-value" id="totalSessions">-</div>
                    <div class="metric-label">Sessions</div>
                </div>
                <div class="metric">
                    <div class="metric-value" id="totalPageViews">-</div>
                    <div class="metric-label">Page Views</div>
                </div>
                <div class="metric">
                    <div class="metric-value" id="bounceRate">-</div>
                    <div class="metric-label">Bounce Rate</div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h2>Performance Score</h2>
            <div class="metric">
                <div class="metric-value" id="performanceScore">-</div>
                <div class="metric-label">Overall Score</div>
            </div>
        </div>
        
        <div class="card">
            <h2>Alerts & Insights</h2>
            <div id="alerts"></div>
        </div>
        
        <div class="card">
            <h2>Traffic Trends</h2>
            <div class="chart-placeholder">Traffic chart would be displayed here</div>
        </div>
    </div>
    
    <script>
        // Load latest daily report
        fetch('./reports/latest-daily-report.json')
            .then(response => response.json())
            .then(data => {
                document.getElementById('lastUpdated').textContent = new Date(data.metadata.generatedAt).toLocaleString();
                
                // Update key metrics
                document.getElementById('totalUsers').textContent = data.summary.keyMetrics.users.toLocaleString();
                document.getElementById('totalSessions').textContent = data.summary.keyMetrics.sessions.toLocaleString();
                document.getElementById('totalPageViews').textContent = data.summary.keyMetrics.pageViews.toLocaleString();
                document.getElementById('bounceRate').textContent = data.summary.keyMetrics.bounceRate + '%';
                document.getElementById('performanceScore').textContent = data.summary.performanceScore;
                
                // Update alerts
                const alertsContainer = document.getElementById('alerts');
                if (data.insights && data.insights.length > 0) {
                    data.insights.forEach(insight => {
                        const alertDiv = document.createElement('div');
                        alertDiv.className = `alert alert-${insight.type === 'warning' ? 'warning' : 'success'}`;
                        alertDiv.innerHTML = `<strong>${insight.category.toUpperCase()}:</strong> ${insight.message}`;
                        alertsContainer.appendChild(alertDiv);
                    });
                } else {
                    alertsContainer.innerHTML = '<div class="alert alert-success">No alerts - everything looks good!</div>';
                }
            })
            .catch(error => {
                console.error('Error loading analytics data:', error);
                document.getElementById('alerts').innerHTML = '<div class="alert alert-warning">Unable to load analytics data</div>';
            });
    </script>
</body>
</html>
HTML
    
    log_success "Analytics dashboard generated: $dashboard_file"
}

# Main execution
case "${1:-help}" in
    "daily")
        generate_reports "daily"
        ;;
    "weekly")
        generate_reports "weekly"
        cleanup_old_reports
        backup_analytics_data
        ;;
    "monthly")
        generate_reports "monthly"
        optimize_database
        ;;
    "cleanup")
        cleanup_old_reports
        ;;
    "backup")
        backup_analytics_data
        ;;
    "dashboard")
        generate_dashboard
        ;;
    "optimize")
        optimize_database
        ;;
    "all")
        generate_reports "daily"
        generate_dashboard
        cleanup_old_reports
        ;;
    "help")
        echo "Usage: $0 {daily|weekly|monthly|cleanup|backup|dashboard|optimize|all|help}"
        echo ""
        echo "Commands:"
        echo "  daily     - Generate daily analytics report"
        echo "  weekly    - Generate weekly report + cleanup"
        echo "  monthly   - Generate monthly report + optimize DB"
        echo "  cleanup   - Clean up old reports and logs"
        echo "  backup    - Create analytics data backup"
        echo "  dashboard - Generate HTML dashboard"
        echo "  optimize  - Optimize analytics database"
        echo "  all       - Generate daily report + dashboard + cleanup"
        echo "  help      - Show this help message"
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
