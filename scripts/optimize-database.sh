#!/bin/bash

# DevDeck Database Optimization Script
# Configures MongoDB indexes and performance optimizations

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[DB-OPT]${NC} $1"
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

print_header() {
    echo -e "${PURPLE}[OPTIMIZE]${NC} $1"
}

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DB_CONFIG_DIR="$PROJECT_ROOT/database"
LOG_FILE="$DB_CONFIG_DIR/optimization.log"

# Create database config directory
mkdir -p "$DB_CONFIG_DIR"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

print_header "DevDeck Database Optimization"
log "Starting database optimization setup"

# Check if MongoDB is available
if ! command -v mongosh &> /dev/null && ! command -v mongo &> /dev/null; then
    print_warning "MongoDB CLI not found. Creating optimization scripts for manual execution."
    MONGO_CLI=""
else
    if command -v mongosh &> /dev/null; then
        MONGO_CLI="mongosh"
    else
        MONGO_CLI="mongo"
    fi
    print_success "Found MongoDB CLI: $MONGO_CLI"
fi

# 1. Create index configuration script
print_status "Creating index configuration script..."
cat > "$DB_CONFIG_DIR/create-indexes.js" << 'EOF'
// DevDeck MongoDB Index Configuration
// Run with: mongosh <connection_string> create-indexes.js

print("=== DevDeck Database Index Creation ===");
print("Starting index creation at: " + new Date());

// Switch to the correct database
use("devdeck");

// Users Collection Indexes
print("\n📊 Creating Users collection indexes...");
try {
    // Primary indexes for user authentication and lookup
    db.users.createIndex({ "githubId": 1 }, { unique: true, background: true });
    db.users.createIndex({ "email": 1 }, { unique: true, sparse: true, background: true });
    db.users.createIndex({ "username": 1 }, { unique: true, background: true });
    
    // Performance indexes
    db.users.createIndex({ "createdAt": -1 }, { background: true });
    db.users.createIndex({ "lastLogin": -1 }, { background: true });
    db.users.createIndex({ "isActive": 1 }, { background: true });
    
    // Compound indexes for common queries
    db.users.createIndex({ "isActive": 1, "createdAt": -1 }, { background: true });
    
    print("✅ Users indexes created successfully");
} catch (error) {
    print("❌ Error creating Users indexes: " + error);
}

// Portfolios Collection Indexes
print("\n📊 Creating Portfolios collection indexes...");
try {
    // Primary indexes
    db.portfolios.createIndex({ "userId": 1 }, { background: true });
    db.portfolios.createIndex({ "slug": 1 }, { unique: true, background: true });
    
    // Performance indexes
    db.portfolios.createIndex({ "isPublic": 1 }, { background: true });
    db.portfolios.createIndex({ "createdAt": -1 }, { background: true });
    db.portfolios.createIndex({ "updatedAt": -1 }, { background: true });
    db.portfolios.createIndex({ "views": -1 }, { background: true });
    
    // Compound indexes for common queries
    db.portfolios.createIndex({ "userId": 1, "isPublic": 1 }, { background: true });
    db.portfolios.createIndex({ "isPublic": 1, "createdAt": -1 }, { background: true });
    db.portfolios.createIndex({ "isPublic": 1, "views": -1 }, { background: true });
    
    // Text search index for portfolio content
    db.portfolios.createIndex({
        "title": "text",
        "description": "text",
        "content.bio": "text",
        "content.skills": "text"
    }, {
        background: true,
        name: "portfolio_text_search"
    });
    
    print("✅ Portfolios indexes created successfully");
} catch (error) {
    print("❌ Error creating Portfolios indexes: " + error);
}

// Projects Collection Indexes
print("\n📊 Creating Projects collection indexes...");
try {
    // Primary indexes
    db.projects.createIndex({ "portfolioId": 1 }, { background: true });
    db.projects.createIndex({ "userId": 1 }, { background: true });
    
    // Performance indexes
    db.projects.createIndex({ "createdAt": -1 }, { background: true });
    db.projects.createIndex({ "updatedAt": -1 }, { background: true });
    db.projects.createIndex({ "featured": 1 }, { background: true });
    db.projects.createIndex({ "status": 1 }, { background: true });
    
    // Compound indexes
    db.projects.createIndex({ "portfolioId": 1, "featured": 1 }, { background: true });
    db.projects.createIndex({ "userId": 1, "status": 1 }, { background: true });
    db.projects.createIndex({ "portfolioId": 1, "createdAt": -1 }, { background: true });
    
    // Text search for projects
    db.projects.createIndex({
        "title": "text",
        "description": "text",
        "technologies": "text"
    }, {
        background: true,
        name: "project_text_search"
    });
    
    print("✅ Projects indexes created successfully");
} catch (error) {
    print("❌ Error creating Projects indexes: " + error);
}

// Analytics Collection Indexes
print("\n📊 Creating Analytics collection indexes...");
try {
    // Primary indexes
    db.analytics.createIndex({ "portfolioId": 1 }, { background: true });
    db.analytics.createIndex({ "userId": 1 }, { background: true });
    
    // Time-based indexes for analytics queries
    db.analytics.createIndex({ "timestamp": -1 }, { background: true });
    db.analytics.createIndex({ "date": -1 }, { background: true });
    
    // Event tracking indexes
    db.analytics.createIndex({ "event": 1 }, { background: true });
    db.analytics.createIndex({ "source": 1 }, { background: true });
    
    // Compound indexes for analytics queries
    db.analytics.createIndex({ "portfolioId": 1, "timestamp": -1 }, { background: true });
    db.analytics.createIndex({ "userId": 1, "date": -1 }, { background: true });
    db.analytics.createIndex({ "event": 1, "timestamp": -1 }, { background: true });
    
    // TTL index for automatic cleanup (keep analytics for 2 years)
    db.analytics.createIndex({ "timestamp": 1 }, { 
        expireAfterSeconds: 63072000, // 2 years
        background: true 
    });
    
    print("✅ Analytics indexes created successfully");
} catch (error) {
    print("❌ Error creating Analytics indexes: " + error);
}

// Sessions Collection Indexes (if using database sessions)
print("\n📊 Creating Sessions collection indexes...");
try {
    db.sessions.createIndex({ "userId": 1 }, { background: true });
    db.sessions.createIndex({ "sessionId": 1 }, { unique: true, background: true });
    
    // TTL index for automatic session cleanup (30 days)
    db.sessions.createIndex({ "expiresAt": 1 }, { 
        expireAfterSeconds: 0,
        background: true 
    });
    
    print("✅ Sessions indexes created successfully");
} catch (error) {
    print("❌ Error creating Sessions indexes: " + error);
}

// Display index information
print("\n📋 Index Summary:");
print("Users collection indexes: " + db.users.getIndexes().length);
print("Portfolios collection indexes: " + db.portfolios.getIndexes().length);
print("Projects collection indexes: " + db.projects.getIndexes().length);
print("Analytics collection indexes: " + db.analytics.getIndexes().length);
print("Sessions collection indexes: " + db.sessions.getIndexes().length);

print("\n=== Index Creation Complete ===");
print("Completed at: " + new Date());
EOF

print_success "Index configuration script created"

# 2. Create database optimization script
print_status "Creating database optimization script..."
cat > "$DB_CONFIG_DIR/optimize-performance.js" << 'EOF'
// DevDeck MongoDB Performance Optimization
// Run with: mongosh <connection_string> optimize-performance.js

print("=== DevDeck Database Performance Optimization ===");
print("Starting optimization at: " + new Date());

// Switch to the correct database
use("devdeck");

// 1. Analyze collection statistics
print("\n📊 Collection Statistics:");
const collections = ["users", "portfolios", "projects", "analytics", "sessions"];

collections.forEach(collName => {
    try {
        const stats = db.getCollection(collName).stats();
        print(`\n${collName}:`);
        print(`  Documents: ${stats.count}`);
        print(`  Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        print(`  Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
        print(`  Indexes: ${stats.nindexes}`);
        print(`  Index Size: ${(stats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`);
    } catch (error) {
        print(`  Collection ${collName} not found or error: ${error}`);
    }
});

// 2. Analyze slow queries (if profiling is enabled)
print("\n🐌 Checking for slow queries...");
try {
    const slowQueries = db.system.profile.find().limit(10).sort({ ts: -1 });
    if (slowQueries.hasNext()) {
        print("Recent slow queries found:");
        slowQueries.forEach(query => {
            print(`  Duration: ${query.millis}ms, Command: ${query.command}`);
        });
    } else {
        print("No slow queries found (profiling may not be enabled)");
    }
} catch (error) {
    print("Profiling not available: " + error);
}

// 3. Check index usage
print("\n📈 Index Usage Analysis:");
collections.forEach(collName => {
    try {
        const coll = db.getCollection(collName);
        const indexes = coll.getIndexes();
        
        print(`\n${collName} indexes:`);
        indexes.forEach(index => {
            print(`  ${index.name}: ${JSON.stringify(index.key)}`);
        });
        
        // Get index stats if available
        try {
            const indexStats = coll.aggregate([{ $indexStats: {} }]).toArray();
            if (indexStats.length > 0) {
                print(`  Index usage stats available for ${indexStats.length} indexes`);
            }
        } catch (e) {
            // Index stats not available in all MongoDB versions
        }
    } catch (error) {
        print(`  Error analyzing ${collName}: ${error}`);
    }
});

// 4. Database-level optimizations
print("\n⚡ Applying database optimizations...");

// Enable profiling for slow queries (>100ms)
try {
    db.setProfilingLevel(1, { slowms: 100 });
    print("✅ Enabled profiling for queries >100ms");
} catch (error) {
    print("❌ Could not enable profiling: " + error);
}

// 5. Compact collections (use with caution in production)
print("\n🗜️  Collection Compaction (Manual Step):");
print("To compact collections and reclaim space, run:");
collections.forEach(collName => {
    print(`  db.runCommand({compact: "${collName}"})`);
});
print("Note: Compaction locks the collection and should be done during maintenance windows");

// 6. Recommendations
print("\n💡 Performance Recommendations:");
print("1. Monitor index usage with db.collection.aggregate([{$indexStats: {}}])");
print("2. Use explain() to analyze query performance");
print("3. Consider sharding for large collections (>100GB)");
print("4. Implement connection pooling in application");
print("5. Use read preferences for read-heavy workloads");
print("6. Monitor memory usage and adjust WiredTiger cache");
print("7. Regular backup and point-in-time recovery setup");
print("8. Consider MongoDB Atlas for managed optimization");

print("\n=== Performance Optimization Complete ===");
print("Completed at: " + new Date());
EOF

print_success "Performance optimization script created"

# 3. Create index maintenance script
print_status "Creating index maintenance script..."
cat > "$DB_CONFIG_DIR/maintain-indexes.js" << 'EOF'
// DevDeck MongoDB Index Maintenance
// Run with: mongosh <connection_string> maintain-indexes.js

print("=== DevDeck Index Maintenance ===");
print("Starting maintenance at: " + new Date());

// Switch to the correct database
use("devdeck");

// Function to analyze index efficiency
function analyzeIndexEfficiency(collectionName) {
    print(`\n🔍 Analyzing ${collectionName} indexes...`);
    
    const coll = db.getCollection(collectionName);
    const indexes = coll.getIndexes();
    
    indexes.forEach(index => {
        if (index.name === "_id_") return; // Skip default _id index
        
        print(`\n  Index: ${index.name}`);
        print(`    Keys: ${JSON.stringify(index.key)}`);
        
        // Check if index is unique
        if (index.unique) {
            print(`    Type: Unique`);
        }
        
        // Check if index is sparse
        if (index.sparse) {
            print(`    Type: Sparse`);
        }
        
        // Check if index has TTL
        if (index.expireAfterSeconds !== undefined) {
            print(`    TTL: ${index.expireAfterSeconds} seconds`);
        }
        
        // Check background creation
        if (index.background) {
            print(`    Created: Background`);
        }
    });
}

// Function to find unused indexes
function findUnusedIndexes(collectionName) {
    print(`\n🔍 Checking for unused indexes in ${collectionName}...`);
    
    try {
        const coll = db.getCollection(collectionName);
        const indexStats = coll.aggregate([{ $indexStats: {} }]).toArray();
        
        indexStats.forEach(stat => {
            if (stat.name === "_id_") return; // Skip default _id index
            
            const usageCount = stat.accesses ? stat.accesses.ops : 0;
            if (usageCount === 0) {
                print(`    ⚠️  Unused index: ${stat.name}`);
                print(`       Consider dropping: db.${collectionName}.dropIndex("${stat.name}")`);
            } else {
                print(`    ✅ Used index: ${stat.name} (${usageCount} operations)`);
            }
        });
    } catch (error) {
        print(`    Index stats not available: ${error}`);
    }
}

// Function to suggest new indexes based on common queries
function suggestIndexes(collectionName) {
    print(`\n💡 Index suggestions for ${collectionName}:`);
    
    switch (collectionName) {
        case "users":
            print("    Consider compound index: { githubId: 1, isActive: 1 }");
            print("    Consider partial index: { email: 1 } where email exists");
            break;
        case "portfolios":
            print("    Consider compound index: { userId: 1, updatedAt: -1 }");
            print("    Consider partial index: { isPublic: 1 } where isPublic = true");
            break;
        case "projects":
            print("    Consider compound index: { portfolioId: 1, status: 1, createdAt: -1 }");
            print("    Consider multikey index on technologies array");
            break;
        case "analytics":
            print("    Consider time-based partitioning for large datasets");
            print("    Consider compound index: { portfolioId: 1, event: 1, timestamp: -1 }");
            break;
    }
}

// Analyze all collections
const collections = ["users", "portfolios", "projects", "analytics", "sessions"];

collections.forEach(collName => {
    try {
        analyzeIndexEfficiency(collName);
        findUnusedIndexes(collName);
        suggestIndexes(collName);
    } catch (error) {
        print(`Error analyzing ${collName}: ${error}`);
    }
});

// Index rebuild recommendations
print("\n🔧 Index Maintenance Commands:");
print("\nTo rebuild all indexes (use during maintenance window):");
collections.forEach(collName => {
    print(`  db.${collName}.reIndex()`);
});

print("\nTo get detailed index information:");
collections.forEach(collName => {
    print(`  db.${collName}.getIndexes()`);
    print(`  db.${collName}.aggregate([{$indexStats: {}}])`);
});

print("\nTo explain query performance:");
print(`  db.portfolios.find({isPublic: true}).explain("executionStats")`);
print(`  db.users.find({githubId: 12345}).explain("executionStats")`);

print("\n=== Index Maintenance Complete ===");
print("Completed at: " + new Date());
EOF

print_success "Index maintenance script created"

# 4. Create database optimization runner script
print_status "Creating optimization runner script..."
cat > "$DB_CONFIG_DIR/run-optimization.sh" << EOF
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
DB_CONFIG_DIR="\$(dirname "\$0")"
LOG_FILE="\$DB_CONFIG_DIR/optimization.log"

# Load environment variables
if [ -f "\$DB_CONFIG_DIR/../.env" ]; then
    source "\$DB_CONFIG_DIR/../.env"
elif [ -f "\$DB_CONFIG_DIR/../.env.production" ]; then
    source "\$DB_CONFIG_DIR/../.env.production"
fi

# MongoDB connection string
MONGODB_URI="\${MONGODB_URI:-mongodb://localhost:27017/devdeck}"

# Check for MongoDB CLI
if command -v mongosh &> /dev/null; then
    MONGO_CLI="mongosh"
elif command -v mongo &> /dev/null; then
    MONGO_CLI="mongo"
else
    echo -e "\${RED}Error: MongoDB CLI not found. Please install mongosh or mongo.\${NC}"
    exit 1
fi

echo -e "\${BLUE}DevDeck Database Optimization\${NC}"
echo "Using MongoDB CLI: \$MONGO_CLI"
echo "Connection: \$MONGODB_URI"
echo

# Function to run MongoDB script
run_mongo_script() {
    local script_name="\$1"
    local description="\$2"
    
    echo -e "\${BLUE}Running \$description...\${NC}"
    
    if [ -f "\$DB_CONFIG_DIR/\$script_name" ]; then
        if \$MONGO_CLI "\$MONGODB_URI" "\$DB_CONFIG_DIR/\$script_name" >> "\$LOG_FILE" 2>&1; then
            echo -e "\${GREEN}✅ \$description completed successfully\${NC}"
        else
            echo -e "\${RED}❌ \$description failed. Check \$LOG_FILE for details.\${NC}"
            return 1
        fi
    else
        echo -e "\${RED}❌ Script \$script_name not found\${NC}"
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

case \$choice in
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
        echo -e "\${BLUE}Running all optimizations...\${NC}"
        run_mongo_script "create-indexes.js" "Index Creation"
        run_mongo_script "optimize-performance.js" "Performance Analysis"
        run_mongo_script "maintain-indexes.js" "Index Maintenance"
        echo -e "\${GREEN}🎉 All optimizations completed!\${NC}"
        ;;
    5)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo -e "\${RED}Invalid choice. Exiting.\${NC}"
        exit 1
        ;;
esac

echo
echo -e "\${BLUE}Optimization log: \$LOG_FILE\${NC}"
echo -e "\${BLUE}Next steps:\${NC}"
echo "  1. Monitor query performance with explain()"
echo "  2. Set up regular index maintenance"
echo "  3. Consider MongoDB Atlas for advanced optimization"
EOF

chmod +x "$DB_CONFIG_DIR/run-optimization.sh"
print_success "Optimization runner script created"

# 5. Create database configuration documentation
print_status "Creating database optimization documentation..."
cat > "$DB_CONFIG_DIR/README.md" << 'EOF'
# DevDeck Database Optimization

This directory contains MongoDB optimization scripts and configurations for DevDeck.

## Scripts

### Index Management
- `create-indexes.js` - Creates optimized indexes for all collections
- `maintain-indexes.js` - Analyzes and maintains existing indexes
- `optimize-performance.js` - Comprehensive performance analysis
- `run-optimization.sh` - Interactive script runner

## Quick Start

1. **Run all optimizations:**
   ```bash
   ./run-optimization.sh
   # Select option 4 for all optimizations
   ```

2. **Create indexes only:**
   ```bash
   mongosh $MONGODB_URI create-indexes.js
   ```

3. **Performance analysis:**
   ```bash
   mongosh $MONGODB_URI optimize-performance.js
   ```

## Index Strategy

### Users Collection
- **Unique indexes:** `githubId`, `email`, `username`
- **Performance indexes:** `createdAt`, `lastLogin`, `isActive`
- **Compound indexes:** `{isActive: 1, createdAt: -1}`

### Portfolios Collection
- **Unique indexes:** `slug`
- **Performance indexes:** `userId`, `isPublic`, `views`, `createdAt`
- **Text search:** `title`, `description`, `bio`, `skills`
- **Compound indexes:** `{userId: 1, isPublic: 1}`, `{isPublic: 1, views: -1}`

### Projects Collection
- **Performance indexes:** `portfolioId`, `userId`, `featured`, `status`
- **Text search:** `title`, `description`, `technologies`
- **Compound indexes:** `{portfolioId: 1, featured: 1}`

### Analytics Collection
- **Performance indexes:** `portfolioId`, `timestamp`, `event`
- **TTL index:** Automatic cleanup after 2 years
- **Compound indexes:** `{portfolioId: 1, timestamp: -1}`

## Performance Monitoring

### Query Analysis
```javascript
// Analyze query performance
db.portfolios.find({isPublic: true}).explain("executionStats")

// Check index usage
db.portfolios.aggregate([{$indexStats: {}}])

// Find slow queries
db.system.profile.find().limit(10).sort({ts: -1})
```

### Index Maintenance
```javascript
// Rebuild indexes
db.portfolios.reIndex()

// Drop unused index
db.portfolios.dropIndex("index_name")

// Get index information
db.portfolios.getIndexes()
```

## Best Practices

1. **Index Creation:**
   - Create indexes in background for production
   - Use compound indexes for multi-field queries
   - Implement partial indexes for conditional data

2. **Query Optimization:**
   - Use `explain()` to analyze query plans
   - Avoid full collection scans
   - Limit result sets with proper pagination

3. **Monitoring:**
   - Enable profiling for slow queries (>100ms)
   - Monitor index usage statistics
   - Regular performance analysis

4. **Maintenance:**
   - Regular index rebuilding during maintenance windows
   - Remove unused indexes
   - Monitor collection growth and sharding needs

## Production Considerations

- **Index Creation:** Always use `background: true` in production
- **Profiling:** Enable with appropriate slow query threshold
- **Compaction:** Schedule during maintenance windows
- **Monitoring:** Set up alerts for performance degradation
- **Backup:** Ensure indexes are included in backup strategy

## Troubleshooting

### Common Issues
1. **Slow Queries:** Check for missing indexes
2. **High Memory Usage:** Analyze index size and usage
3. **Lock Contention:** Use background index creation
4. **Storage Growth:** Implement TTL indexes for temporary data

### Performance Metrics
- Query execution time < 100ms
- Index hit ratio > 95%
- Memory usage < 80% of available
- Storage growth predictable and manageable

## Resources

- [MongoDB Index Documentation](https://docs.mongodb.com/manual/indexes/)
- [Query Optimization](https://docs.mongodb.com/manual/core/query-optimization/)
- [Performance Best Practices](https://docs.mongodb.com/manual/administration/analyzing-mongodb-performance/)
EOF

print_success "Database optimization documentation created"

print_header "Database Optimization Setup Complete!"
print_success "Database optimization tools installed in: $DB_CONFIG_DIR"
echo
print_status "Next steps:"
echo "  1. Run database optimization:"
echo "     cd $DB_CONFIG_DIR"
echo "     ./run-optimization.sh"
echo
echo "  2. Create indexes:"
echo "     mongosh \$MONGODB_URI create-indexes.js"
echo
echo "  3. Analyze performance:"
echo "     mongosh \$MONGODB_URI optimize-performance.js"
echo
print_status "Documentation: $DB_CONFIG_DIR/README.md"
log "Database optimization setup completed successfully"