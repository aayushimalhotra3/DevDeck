#!/bin/bash

# Automated feedback collection and processing
# Run this script periodically to process feedback and generate reports

set -e

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:5000}"
ADMIN_TOKEN="${ADMIN_TOKEN}"
WEBHOOK_URL="${FEEDBACK_WEBHOOK_URL}"
EMAIL_ALERTS="${FEEDBACK_EMAIL_ALERTS:-true}"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "feedback-automation.log"
}

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
    log "INFO: $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    log "WARN: $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    log "ERROR: $1"
}

# Check for required environment variables
if [ -z "$ADMIN_TOKEN" ]; then
    print_error "ADMIN_TOKEN environment variable is required"
    exit 1
fi

print_status "Starting feedback automation process..."

# Function to get feedback analytics
get_feedback_analytics() {
    local range="${1:-7d}"
    
    curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
         "$API_BASE_URL/api/feedback/analytics?range=$range" \
         -o "feedback-analytics-$range.json"
    
    if [ $? -eq 0 ]; then
        print_status "Fetched feedback analytics for $range"
        return 0
    else
        print_error "Failed to fetch feedback analytics for $range"
        return 1
    fi
}

# Function to check for low ratings
check_low_ratings() {
    local analytics_file="feedback-analytics-7d.json"
    
    if [ ! -f "$analytics_file" ]; then
        print_warning "Analytics file not found: $analytics_file"
        return 1
    fi
    
    # Extract recent low ratings (1-2 stars)
    local low_ratings=$(jq -r '.recentFeedback[] | select(.rating <= 2) | "Rating: \(.rating)/5, Category: \(.category), Message: \(.message)"' "$analytics_file")
    
    if [ -n "$low_ratings" ]; then
        print_warning "Found low ratings in the last 7 days:"
        echo "$low_ratings"
        
        # Send alert if webhook is configured
        if [ -n "$WEBHOOK_URL" ]; then
            send_low_rating_alert "$low_ratings"
        fi
        
        return 0
    else
        print_status "No low ratings found in the last 7 days"
        return 1
    fi
}

# Function to send low rating alert
send_low_rating_alert() {
    local ratings="$1"
    
    local payload=$(jq -n \
        --arg text "🚨 Low Rating Alert - DevDeck Feedback" \
        --arg ratings "$ratings" \
        '{
            "text": $text,
            "attachments": [{
                "color": "danger",
                "title": "Low Ratings Detected",
                "text": $ratings,
                "footer": "DevDeck Feedback System",
                "ts": now
            }]
        }')
    
    curl -X POST "$WEBHOOK_URL" \
         -H "Content-Type: application/json" \
         -d "$payload" \
         --silent
    
    if [ $? -eq 0 ]; then
        print_status "Low rating alert sent successfully"
    else
        print_error "Failed to send low rating alert"
    fi
}

# Function to generate weekly report
generate_weekly_report() {
    local analytics_file="feedback-analytics-7d.json"
    
    if [ ! -f "$analytics_file" ]; then
        print_error "Analytics file not found: $analytics_file"
        return 1
    fi
    
    local report_date=$(date '+%Y-%m-%d')
    local report_file="weekly-feedback-report-$report_date.md"
    
    # Extract key metrics
    local total_feedback=$(jq -r '.totalFeedback' "$analytics_file")
    local avg_rating=$(jq -r '.averageRating' "$analytics_file")
    local nps_score=$(jq -r '.npsScore' "$analytics_file")
    local response_rate=$(jq -r '.responseRate' "$analytics_file")
    
    # Generate report
    cat > "$report_file" << EOF
# Weekly Feedback Report - $report_date

## Summary
- **Total Feedback**: $total_feedback
- **Average Rating**: $avg_rating/5
- **NPS Score**: $nps_score
- **Response Rate**: $response_rate%

## Rating Distribution
$(jq -r '.ratingDistribution[] | "- \(.rating) stars: \(.count) responses"' "$analytics_file")

## Category Breakdown
$(jq -r '.categoryBreakdown[] | "- \(.category | ascii_upcase): \(.count) (\(.percentage)%)"' "$analytics_file")

## Recent Feedback Highlights
$(jq -r '.recentFeedback[0:5][] | "### Rating: \(.rating)/5 - \(.category | ascii_upcase)\n\(.message)\n"' "$analytics_file")

## Action Items
$(if [ "$(echo "$avg_rating < 4" | bc -l)" = "1" ]; then echo "- 🔴 Average rating below 4.0 - investigate common issues"; fi)
$(if [ "$(echo "$nps_score < 0" | bc -l)" = "1" ]; then echo "- 🔴 Negative NPS score - urgent attention needed"; fi)
$(if [ "$(echo "$response_rate < 20" | bc -l)" = "1" ]; then echo "- 🟡 Low response rate - consider improving feedback collection"; fi)

---
*Generated on $report_date by DevDeck Feedback Automation*
