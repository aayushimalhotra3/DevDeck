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
