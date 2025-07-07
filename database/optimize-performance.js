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
