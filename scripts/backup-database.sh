#!/bin/bash

# DevDeck Database Backup Script
# Automated backup solution for MongoDB with rotation and cloud storage

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[BACKUP]${NC} $1"
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

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_ROOT/backups"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="devdeck_backup_$DATE"
LOG_FILE="$BACKUP_DIR/backup.log"

# Load environment variables
if [ -f "$PROJECT_ROOT/.env" ]; then
    source "$PROJECT_ROOT/.env"
fi

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Error handling
handle_error() {
    print_error "Backup failed: $1"
    log "ERROR: Backup failed: $1"
    exit 1
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

print_status "Starting DevDeck database backup..."
log "Starting backup process"

# Check if MongoDB URI is available
if [ -z "$MONGODB_URI" ]; then
    handle_error "MONGODB_URI environment variable not set"
fi

# Check if mongodump is available
if ! command -v mongodump &> /dev/null; then
    print_warning "mongodump not found. Installing MongoDB tools..."
    
    # Install MongoDB tools based on OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install mongodb/brew/mongodb-database-tools
        else
            handle_error "Homebrew not found. Please install MongoDB tools manually."
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y mongodb-database-tools
        elif command -v yum &> /dev/null; then
            sudo yum install -y mongodb-database-tools
        else
            handle_error "Package manager not found. Please install MongoDB tools manually."
        fi
    else
        handle_error "Unsupported operating system. Please install MongoDB tools manually."
    fi
fi

# Create backup
print_status "Creating database backup..."
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
mkdir -p "$BACKUP_PATH"

# Perform MongoDB dump
if mongodump --uri="$MONGODB_URI" --out="$BACKUP_PATH" --gzip; then
    print_success "Database backup created successfully!"
    log "Database backup created: $BACKUP_PATH"
else
    handle_error "Failed to create database backup"
fi

# Create metadata file
cat > "$BACKUP_PATH/metadata.json" << EOF
{
  "backup_date": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "backup_name": "$BACKUP_NAME",
  "database_uri": "${MONGODB_URI%/*}/***",
  "backup_size": "$(du -sh "$BACKUP_PATH" | cut -f1)",
  "backup_type": "full",
  "script_version": "1.0.0"
}
EOF

# Compress backup
print_status "Compressing backup..."
cd "$BACKUP_DIR"
if tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"; then
    print_success "Backup compressed successfully!"
    rm -rf "$BACKUP_NAME"
    COMPRESSED_BACKUP="$BACKUP_DIR/${BACKUP_NAME}.tar.gz"
    log "Backup compressed: $COMPRESSED_BACKUP"
else
    handle_error "Failed to compress backup"
fi

# Upload to cloud storage (if configured)
if [ ! -z "$AWS_ACCESS_KEY_ID" ] && [ ! -z "$AWS_SECRET_ACCESS_KEY" ] && [ ! -z "$AWS_S3_BACKUP_BUCKET" ]; then
    print_status "Uploading backup to AWS S3..."
    
    # Check if AWS CLI is available
    if ! command -v aws &> /dev/null; then
        print_warning "AWS CLI not found. Installing..."
        pip3 install awscli || handle_error "Failed to install AWS CLI"
    fi
    
    # Configure AWS credentials
    export AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID"
    export AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY"
    export AWS_DEFAULT_REGION="${AWS_REGION:-us-east-1}"
    
    # Upload to S3
    S3_KEY="devdeck-backups/$(date +"%Y/%m/%d")/${BACKUP_NAME}.tar.gz"
    if aws s3 cp "$COMPRESSED_BACKUP" "s3://$AWS_S3_BACKUP_BUCKET/$S3_KEY"; then
        print_success "Backup uploaded to S3: s3://$AWS_S3_BACKUP_BUCKET/$S3_KEY"
        log "Backup uploaded to S3: $S3_KEY"
    else
        print_warning "Failed to upload backup to S3"
        log "WARNING: Failed to upload backup to S3"
    fi
fi

# Backup rotation (keep last 7 local backups)
print_status "Performing backup rotation..."
cd "$BACKUP_DIR"
BACKUP_COUNT=$(ls -1 devdeck_backup_*.tar.gz 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt 7 ]; then
    BACKUPS_TO_DELETE=$((BACKUP_COUNT - 7))
    print_status "Removing $BACKUPS_TO_DELETE old backup(s)..."
    ls -1t devdeck_backup_*.tar.gz | tail -n "$BACKUPS_TO_DELETE" | xargs rm -f
    print_success "Old backups removed"
    log "Removed $BACKUPS_TO_DELETE old backups"
fi

# Generate backup report
BACKUP_SIZE=$(du -sh "$COMPRESSED_BACKUP" | cut -f1)
print_status "Backup completed successfully!"
print_success "Backup file: $COMPRESSED_BACKUP"
print_success "Backup size: $BACKUP_SIZE"
print_success "Backup date: $(date)"

log "Backup completed successfully: $COMPRESSED_BACKUP ($BACKUP_SIZE)"

# Optional: Send notification (if configured)
if [ ! -z "$BACKUP_NOTIFICATION_WEBHOOK" ]; then
    print_status "Sending backup notification..."
    curl -X POST "$BACKUP_NOTIFICATION_WEBHOOK" \
        -H "Content-Type: application/json" \
        -d "{
            \"text\": \"DevDeck backup completed successfully!\",
            \"attachments\": [{
                \"color\": \"good\",
                \"fields\": [
                    {\"title\": \"Backup Name\", \"value\": \"$BACKUP_NAME\", \"short\": true},
                    {\"title\": \"Size\", \"value\": \"$BACKUP_SIZE\", \"short\": true},
                    {\"title\": \"Date\", \"value\": \"$(date)\", \"short\": false}
                ]
            }]
        }" &> /dev/null || print_warning "Failed to send notification"
fi

print_success "Backup process completed!"
echo
print_status "Backup summary:"
echo "  📁 Location: $COMPRESSED_BACKUP"
echo "  📊 Size: $BACKUP_SIZE"
echo "  📅 Date: $(date)"
echo "  📝 Log: $LOG_FILE"

if [ ! -z "$AWS_S3_BACKUP_BUCKET" ]; then
    echo "  ☁️  Cloud: s3://$AWS_S3_BACKUP_BUCKET/$S3_KEY"
fi

echo
print_status "To restore from this backup:"
echo "  1. Extract: tar -xzf $COMPRESSED_BACKUP"
echo "  2. Restore: mongorestore --uri=\"your_mongodb_uri\" --gzip extracted_folder/"