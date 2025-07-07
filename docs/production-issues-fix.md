# Production Issues Fix Guide

## Overview
This document addresses the critical issues found in the production logs and provides comprehensive solutions.

## Issues Identified

### 1. Express-Slow-Down Deprecation Warnings ✅ FIXED
**Issue**: `delayMs` option behavior changed in express-slow-down v2

**Error Messages**:
```
ExpressSlowDownWarning: The behaviour of the 'delayMs' option was changed in express-slow-down v2
```

**Solution Applied**:
- Updated `createSpeedLimit` function in `backend/src/utils/performance.js`
- Changed `delayMs` from number to function: `delayMs: () => delayMs`
- Added `validate: { delayMs: false }` to disable warnings

### 2. Mongoose Duplicate Schema Index Warnings ✅ FIXED
**Issue**: Duplicate indexes created by both `unique: true` and explicit `schema.index()`

**Error Messages**:
```
[MONGOOSE] Warning: Duplicate schema index on {"username":1} found
[MONGOOSE] Warning: Duplicate schema index on {"email":1} found
[MONGOOSE] Warning: Duplicate schema index on {"githubId":1} found
[MONGOOSE] Warning: Duplicate schema index on {"userId":1} found
```

**Solution Applied**:
- Removed explicit index definitions for fields with `unique: true`
- Updated `backend/src/models/User.js` and `backend/src/models/Portfolio.js`
- Kept only necessary composite indexes

### 3. MongoDB Driver Deprecated Options ✅ FIXED
**Issue**: `useNewUrlParser` and `useUnifiedTopology` deprecated in Node.js Driver v4+

**Error Messages**:
```
[MONGODB DRIVER] Warning: useNewUrlParser is a deprecated option
[MONGODB DRIVER] Warning: useUnifiedTopology is a deprecated option
```

**Solution Applied**:
- Removed deprecated options from `backend/src/config/database.js`
- Added modern connection pool settings:
  - `maxPoolSize: 10`
  - `minPoolSize: 2`
  - `maxIdleTimeMS: 30000`
  - `serverSelectionTimeoutMS: 5000`
  - `socketTimeoutMS: 45000`

### 4. MongoDB Connection Error ⚠️ REQUIRES ATTENTION
**Issue**: DNS resolution failure for MongoDB Atlas cluster

**Error Message**:
```
querySrv ENOTFOUND _mongodb._tcp.devdeck-cluster.rtc1ooo.mongodb.net
```

**Potential Causes**:
1. **Network/DNS Issues**: Render server cannot resolve MongoDB Atlas hostname
2. **MongoDB Atlas Configuration**: Cluster may be paused or misconfigured
3. **Connection String**: Missing database name in URI

**Solution Applied**:
- Added database name to MongoDB URI: `/devdeck`
- Updated connection string format

**Additional Troubleshooting Steps**:

#### Check MongoDB Atlas Status
1. Log into MongoDB Atlas dashboard
2. Verify cluster is running (not paused)
3. Check cluster health and connectivity
4. Ensure IP whitelist includes Render's IP ranges

#### Verify Network Access
1. In MongoDB Atlas, go to Network Access
2. Add `0.0.0.0/0` for testing (restrict later)
3. Ensure no firewall blocking connections

#### Test Connection String
```bash
# Test connection locally
mongosh "mongodb+srv://aayushim33:aayushim33@devdeck-cluster.rtc1ooo.mongodb.net/devdeck"
```

#### Alternative Connection Formats
If SRV record fails, try standard format:
```
MONGODB_URI=mongodb://aayushim33:aayushim33@devdeck-cluster-shard-00-00.rtc1ooo.mongodb.net:27017,devdeck-cluster-shard-00-01.rtc1ooo.mongodb.net:27017,devdeck-cluster-shard-00-02.rtc1ooo.mongodb.net:27017/devdeck?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
```

## Code Changes Summary

### Files Modified:
1. `backend/src/utils/performance.js` - Fixed express-slow-down deprecation
2. `backend/src/models/User.js` - Removed duplicate indexes
3. `backend/src/models/Portfolio.js` - Removed duplicate indexes
4. `backend/src/config/database.js` - Updated connection options
5. `backend/.env` - Added database name to MongoDB URI

### Performance Improvements:
- Better connection pooling with modern MongoDB driver options
- Eliminated duplicate index creation overhead
- Fixed rate limiting middleware for better performance

## Testing the Fixes

### 1. Local Testing
```bash
cd backend
npm start
```

### 2. Check for Warnings
Monitor console output for:
- ✅ No express-slow-down warnings
- ✅ No duplicate index warnings
- ✅ No deprecated option warnings
- ⚠️ MongoDB connection status

### 3. Production Deployment
```bash
# Deploy to Render
git add .
git commit -m "Fix production issues: deprecation warnings and database config"
git push origin main
```

### 4. Monitor Production Logs
```bash
# Check Render logs for:
# - Successful MongoDB connection
# - No warning messages
# - Proper server startup
```

## MongoDB Atlas Troubleshooting Checklist

### Immediate Actions:
- [ ] Verify cluster is running in MongoDB Atlas
- [ ] Check Network Access whitelist
- [ ] Confirm database user permissions
- [ ] Test connection string locally
- [ ] Review Render deployment logs

### Network Configuration:
- [ ] Add Render IP ranges to MongoDB Atlas whitelist
- [ ] Verify DNS resolution from Render servers
- [ ] Check for any firewall restrictions

### Alternative Solutions:
- [ ] Try different MongoDB Atlas regions
- [ ] Use standard connection string instead of SRV
- [ ] Consider MongoDB Atlas M0 cluster limitations
- [ ] Verify authentication credentials

## Prevention Measures

### 1. Dependency Management
- Regularly update dependencies
- Monitor deprecation warnings
- Test in staging before production

### 2. Database Monitoring
- Set up MongoDB Atlas alerts
- Monitor connection pool metrics
- Track query performance

### 3. Error Handling
- Implement robust error handling
- Add retry logic for database connections
- Set up proper logging and monitoring

## Next Steps

1. **Deploy fixes** to production
2. **Monitor logs** for successful startup
3. **Test API endpoints** to ensure functionality
4. **Set up monitoring** for ongoing health checks
5. **Document** any additional configuration needed

## Support Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Mongoose Connection Guide](https://mongoosejs.com/docs/connections.html)
- [Express Rate Limiting](https://express-rate-limit.github.io/)
- [Render Deployment Guide](https://render.com/docs)

---

**Status**: Most issues fixed ✅ | MongoDB connection requires verification ⚠️
**Priority**: High - affects production functionality
**Estimated Resolution Time**: 15-30 minutes for MongoDB Atlas configuration