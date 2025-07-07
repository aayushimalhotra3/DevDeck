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
