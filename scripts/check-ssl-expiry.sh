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
