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
