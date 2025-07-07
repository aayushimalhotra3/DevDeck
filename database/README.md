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
