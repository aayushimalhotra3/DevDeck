#!/bin/bash

# DevDeck Cron Jobs Setup
# Sets up automated monitoring tasks

MONITOR_DIR="$(dirname "$0")"

echo "Setting up DevDeck monitoring cron jobs..."

# Create cron jobs
(crontab -l 2>/dev/null; echo "# DevDeck Monitoring Jobs") | crontab -
(crontab -l 2>/dev/null; echo "*/5 * * * * $MONITOR_DIR/health-check.sh >> $MONITOR_DIR/cron.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "*/10 * * * * $MONITOR_DIR/performance-monitor.sh >> $MONITOR_DIR/cron.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "0 */6 * * * $MONITOR_DIR/aggregate-logs.sh >> $MONITOR_DIR/cron.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "0 2 * * * /Users/aayushimalhotra/Desktop/devdeck/scripts/backup-database.sh >> $MONITOR_DIR/cron.log 2>&1") | crontab -

echo "Cron jobs configured:"
echo "  - Health check: Every 5 minutes"
echo "  - Performance monitor: Every 10 minutes"
echo "  - Log aggregation: Every 6 hours"
echo "  - Database backup: Daily at 2 AM"
echo
echo "To view cron jobs: crontab -l"
echo "To remove cron jobs: crontab -r"
