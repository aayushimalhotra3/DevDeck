# SSL Certificate and Domain Configuration Guide

This guide covers SSL certificate setup and domain configuration for DevDeck in production environments.

## Overview

DevDeck supports multiple deployment platforms, each with different SSL and domain configuration approaches:

- **Render**: Automatic SSL certificates with custom domains
- **Vercel**: Automatic SSL with custom domains and edge optimization
- **Railway**: Automatic SSL with custom domains
- **Traditional VPS**: Manual SSL setup with Let's Encrypt or commercial certificates

## Current Production Setup

### Frontend (Vercel)
- **Current URL**: `https://devdeck-rho.vercel.app`
- **SSL Status**: ✅ Automatic SSL via Vercel
- **Custom Domain**: Not configured

### Backend (Render)
- **Current URL**: `https://devdeck-1.onrender.com`
- **SSL Status**: ✅ Automatic SSL via Render
- **Custom Domain**: Not configured

## Setting Up Custom Domains

### 1. Frontend Domain Setup (Vercel)

#### Step 1: Add Custom Domain in Vercel
1. Go to your Vercel dashboard
2. Select your DevDeck project
3. Navigate to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter your domain (e.g., `devdeck.com` or `www.devdeck.com`)

#### Step 2: Configure DNS Records
Add these DNS records in your domain registrar:

```dns
# For root domain (devdeck.com)
Type: A
Name: @
Value: 76.76.19.19

# For www subdomain
Type: CNAME
Name: www
Value: cname.vercel-dns.com

# Alternative: Use CNAME for root (if supported)
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

#### Step 3: Update Environment Variables
Update your environment variables to use the new domain:

```bash
# In Vercel environment variables
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

### 2. Backend Domain Setup (Render)

#### Step 1: Add Custom Domain in Render
1. Go to your Render dashboard
2. Select your DevDeck backend service
3. Navigate to **Settings** → **Custom Domains**
4. Click **Add Custom Domain**
5. Enter your API subdomain (e.g., `api.devdeck.com`)

#### Step 2: Configure DNS Records
Add this DNS record in your domain registrar:

```dns
# For API subdomain
Type: CNAME
Name: api
Value: your-service-name.onrender.com
```

#### Step 3: Update Backend Configuration
Update your backend environment variables:

```bash
# In Render environment variables
FRONTEND_URL=https://your-domain.com
NEXTAUTH_URL=https://your-domain.com
```

## SSL Certificate Management

### Automatic SSL (Recommended)

Both Vercel and Render provide automatic SSL certificates:

- **Vercel**: Uses Let's Encrypt certificates, automatically renewed
- **Render**: Uses Let's Encrypt certificates, automatically renewed
- **Railway**: Uses Let's Encrypt certificates, automatically renewed

### Manual SSL Setup (VPS Deployment)

If deploying to a traditional VPS, use Let's Encrypt with Certbot:

#### Install Certbot
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
```

#### Obtain SSL Certificate
```bash
# For Nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# For Apache
sudo certbot --apache -d your-domain.com -d www.your-domain.com

# Standalone (if no web server running)
sudo certbot certonly --standalone -d your-domain.com
```

#### Auto-renewal Setup
```bash
# Test renewal
sudo certbot renew --dry-run

# Add to crontab for automatic renewal
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## Security Headers Configuration

### Nginx Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.github.com;" always;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## Domain Verification

### DNS Propagation Check
```bash
# Check DNS propagation
nslookup your-domain.com
dig your-domain.com

# Check from different locations
dig @8.8.8.8 your-domain.com
dig @1.1.1.1 your-domain.com
```

### SSL Certificate Verification
```bash
# Check SSL certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Check certificate expiration
echo | openssl s_client -servername your-domain.com -connect your-domain.com:443 2>/dev/null | openssl x509 -noout -dates
```

## Monitoring SSL Certificates

### Automated Monitoring Script
```bash
#!/bin/bash
# ssl-monitor.sh

DOMAIN="your-domain.com"
ALERT_DAYS=30

# Get certificate expiration date
EXP_DATE=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
EXP_TIMESTAMP=$(date -d "$EXP_DATE" +%s)
CURRENT_TIMESTAMP=$(date +%s)
DAYS_UNTIL_EXPIRY=$(( (EXP_TIMESTAMP - CURRENT_TIMESTAMP) / 86400 ))

if [ $DAYS_UNTIL_EXPIRY -lt $ALERT_DAYS ]; then
    echo "WARNING: SSL certificate for $DOMAIN expires in $DAYS_UNTIL_EXPIRY days"
    # Send alert (email, Slack, etc.)
else
    echo "SSL certificate for $DOMAIN is valid for $DAYS_UNTIL_EXPIRY more days"
fi
```

## Troubleshooting

### Common Issues

#### 1. DNS Not Propagating
- **Solution**: Wait 24-48 hours for full propagation
- **Check**: Use online DNS propagation checkers
- **Alternative**: Clear local DNS cache

#### 2. SSL Certificate Not Working
- **Check**: Verify DNS records point to correct servers
- **Solution**: Re-issue certificate after DNS is correct
- **Verify**: Use SSL checker tools online

#### 3. Mixed Content Warnings
- **Cause**: Loading HTTP resources on HTTPS pages
- **Solution**: Update all URLs to use HTTPS
- **Check**: Browser developer tools console

#### 4. CORS Issues After Domain Change
- **Solution**: Update CORS configuration in backend
- **Update**: `FRONTEND_URL` environment variable
- **Verify**: Check browser network tab for CORS errors

### Testing Commands

```bash
# Test SSL configuration
curl -I https://your-domain.com

# Test API connectivity
curl https://api.your-domain.com/health

# Test with specific SSL version
curl --tlsv1.2 https://your-domain.com

# Check security headers
curl -I https://your-domain.com | grep -E "(Strict-Transport|X-Frame|X-Content)"
```

## Best Practices

### 1. SSL Configuration
- Use TLS 1.2 or higher
- Disable weak ciphers
- Enable HSTS (HTTP Strict Transport Security)
- Use strong SSL certificates (2048-bit or higher)

### 2. Domain Management
- Use subdomains for different services (api.domain.com, admin.domain.com)
- Implement proper redirects (www to non-www or vice versa)
- Set up monitoring for domain and SSL expiration

### 3. Security Headers
- Implement Content Security Policy (CSP)
- Use X-Frame-Options to prevent clickjacking
- Enable X-Content-Type-Options
- Set appropriate Referrer-Policy

### 4. Monitoring
- Set up SSL certificate expiration alerts
- Monitor domain DNS health
- Use uptime monitoring services
- Implement automated SSL renewal

## Environment-Specific Configurations

### Development
```bash
NEXTAUTH_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

### Staging
```bash
NEXTAUTH_URL=https://staging.your-domain.com
FRONTEND_URL=https://staging.your-domain.com
BACKEND_URL=https://api-staging.your-domain.com
```

### Production
```bash
NEXTAUTH_URL=https://your-domain.com
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://api.your-domain.com
```

## Additional Resources

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Vercel Custom Domains](https://vercel.com/docs/concepts/projects/custom-domains)
- [Render Custom Domains](https://render.com/docs/custom-domains)
- [SSL Labs SSL Test](https://www.ssllabs.com/ssltest/)
- [DNS Propagation Checker](https://www.whatsmydns.net/)