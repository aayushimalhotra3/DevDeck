#!/bin/bash

# DevDeck Database Optimization Runner
# Executes MongoDB optimization scripts

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DB_CONFIG_DIR="$(dirname "$0")"
LOG_FILE="$DB_CONFIG_DIR/optimization.log"

# Load environment variables
if [ -f "$DB_CONFIG_DIR/../.env" ]; then
    source "$DB_CONFIG_DIR/../.env"
elif [ -f "$DB_CONFIG_DIR/../.env.production" ]; then
    source "$DB_CONFIG_DIR/../.env.production"
fi

# MongoDB connection string
MONGODB_URI="${MONGODB_URI:-mongodb://localhost:27017/devdeck}"

# Check for MongoDB CLI
if command -v mongosh &> /dev/null; then
    MONGO_CLI="mongosh"
elif command -v mongo &> /dev/null; then
    MONGO_CLI="mongo"
else
    echo -e "${RED}Error: MongoDB CLI not found. Please install mongosh or mongo.${NC}"
    exit 1
fi

echo -e "${BLUE}DevDeck Database Optimization${NC}"
echo "Using MongoDB CLI: $MONGO_CLI"
echo "Connection: $MONGODB_URI"
echo

# Function to run MongoDB script
run_mongo_script() {
    local script_name="$1"
    local description="$2"
    
    echo -e "${BLUE}Running $description...${NC}"
    
    if [ -f "$DB_CONFIG_DIR/$script_name" ]; then
        if $MONGO_CLI "$MONGODB_URI" "$DB_CONFIG_DIR/$script_name" >> "$LOG_FILE" 2>&1; then
            echo -e "${GREEN}✅ $description completed successfully${NC}"
        else
            echo -e "${RED}❌ $description failed. Check $LOG_FILE for details.${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Script $script_name not found${NC}"
        return 1
    fi
}

# Menu for optimization tasks
echo "Select optimization task:"
echo "1. Create/Update Indexes"
echo "2. Performance Analysis"
echo "3. Index Maintenance"
echo "4. Run All Optimizations"
echo "5. Exit"
echo
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        run_mongo_script "create-indexes.js" "Index Creation"
        ;;
    2)
        run_mongo_script "optimize-performance.js" "Performance Analysis"
        ;;
    3)
        run_mongo_script "maintain-indexes.js" "Index Maintenance"
        ;;
    4)
        echo -e "${BLUE}Running all optimizations...${NC}"
        run_mongo_script "create-indexes.js" "Index Creation"
        run_mongo_script "optimize-performance.js" "Performance Analysis"
        run_mongo_script "maintain-indexes.js" "Index Maintenance"
        echo -e "${GREEN}🎉 All optimizations completed!${NC}"
        ;;
    5)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo
echo -e "${BLUE}Optimization log: $LOG_FILE${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Monitor query performance with explain()"
echo "  2. Set up regular index maintenance"
echo "  3. Consider MongoDB Atlas for advanced optimization"
