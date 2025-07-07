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
