#!/usr/bin/env node

/**
 * Backend Verification Script for DevDeck
 * 
 * This script helps verify that all backend fixes are properly applied
 * and identifies any remaining issues.
 */

const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') })

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logStatus(test, passed, message = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL'
  const color = passed ? 'green' : 'red'
  log(`${status} ${test}${message ? ': ' + message : ''}`, color)
}

function logSection(title) {
  log(`\n${colors.bold}=== ${title} ===${colors.reset}`, 'blue')
}

async function verifyEnvironmentVariables() {
  logSection('Environment Variables Check')
  
  const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET'
  ]
  
  const optionalVars = [
    'FRONTEND_URL',
    'NODE_ENV',
    'PORT'
  ]
  
  let allRequired = true
  
  requiredVars.forEach(varName => {
    const exists = !!process.env[varName]
    logStatus(varName, exists, exists ? 'Set' : 'Missing (Required)')
    if (!exists) allRequired = false
  })
  
  optionalVars.forEach(varName => {
    const exists = !!process.env[varName]
    const value = exists ? process.env[varName] : 'Not set'
    logStatus(varName, true, value)
  })
  
  return allRequired
}

async function verifyMongoDBConnection() {
  logSection('MongoDB Connection Test')
  
  if (!process.env.MONGODB_URI) {
    logStatus('MongoDB URI', false, 'MONGODB_URI not set')
    return false
  }
  
  try {
    log('Attempting to connect to MongoDB...', 'yellow')
    
    const options = {
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    }
    
    await mongoose.connect(process.env.MONGODB_URI, options)
    
    logStatus('MongoDB Connection', true, `Connected to ${mongoose.connection.host}`)
    logStatus('Database Name', true, mongoose.connection.name)
    logStatus('Connection State', true, getConnectionState(mongoose.connection.readyState))
    
    await mongoose.disconnect()
    return true
    
  } catch (error) {
    logStatus('MongoDB Connection', false, error.message)
    
    // Provide specific guidance based on error type
    if (error.message.includes('IP')) {
      log('💡 Tip: Add your IP address to MongoDB Atlas whitelist', 'yellow')
      log('   - Go to MongoDB Atlas → Network Access → Add IP Address', 'yellow')
      log('   - For production, add 0.0.0.0/0 or specific Render IP ranges', 'yellow')
    }
    
    if (error.message.includes('authentication')) {
      log('💡 Tip: Check your MongoDB username and password', 'yellow')
    }
    
    return false
  }
}

function getConnectionState(state) {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }
  return states[state] || 'unknown'
}

async function verifyModelIndexes() {
  logSection('Model Index Configuration Check')
  
  const modelFiles = [
    '../backend/src/models/User.js',
    '../backend/src/models/Portfolio.js',
    '../backend/src/models/Block.js'
  ]
  
  let allGood = true
  
  modelFiles.forEach(modelFile => {
    const fullPath = path.join(__dirname, modelFile)
    
    if (!fs.existsSync(fullPath)) {
      logStatus(path.basename(modelFile), false, 'File not found')
      allGood = false
      return
    }
    
    const content = fs.readFileSync(fullPath, 'utf8')
    
    // Check for duplicate index patterns
    const duplicatePatterns = [
      /userSchema\.index\(\s*{\s*username:\s*1\s*}\s*\)/,
      /userSchema\.index\(\s*{\s*email:\s*1\s*}\s*\)/,
      /userSchema\.index\(\s*{\s*githubId:\s*1\s*}\s*\)/,
      /portfolioSchema\.index\(\s*{\s*userId:\s*1\s*}\s*\)/
    ]
    
    let hasDuplicates = false
    duplicatePatterns.forEach(pattern => {
      if (pattern.test(content)) {
        hasDuplicates = true
      }
    })
    
    logStatus(path.basename(modelFile), !hasDuplicates, 
      hasDuplicates ? 'Contains duplicate indexes' : 'Index configuration OK')
    
    if (hasDuplicates) allGood = false
  })
  
  return allGood
}

async function verifyExpressSlowDownConfig() {
  logSection('Express-slow-down Configuration Check')
  
  const performanceFile = path.join(__dirname, '../backend/src/utils/performance.js')
  
  if (!fs.existsSync(performanceFile)) {
    logStatus('performance.js', false, 'File not found')
    return false
  }
  
  const content = fs.readFileSync(performanceFile, 'utf8')
  
  // Check for correct v2 configuration
  const hasCorrectDelayMs = /delayMs:\s*\(\)\s*=>\s*delayMs/.test(content) || 
                           /delayMs:\s*\([^)]*\)\s*=>/.test(content)
  const hasValidateOption = /validate:\s*{\s*delayMs:\s*false\s*}/.test(content)
  
  logStatus('delayMs function format', hasCorrectDelayMs, 
    hasCorrectDelayMs ? 'Correct v2 format' : 'Needs v2 format update')
  
  logStatus('validate.delayMs option', hasValidateOption, 
    hasValidateOption ? 'Warning suppression enabled' : 'Missing validation option')
  
  return hasCorrectDelayMs && hasValidateOption
}

async function verifyDatabaseConfig() {
  logSection('Database Configuration Check')
  
  const dbConfigFile = path.join(__dirname, '../backend/src/config/database.js')
  
  if (!fs.existsSync(dbConfigFile)) {
    logStatus('database.js', false, 'File not found')
    return false
  }
  
  const content = fs.readFileSync(dbConfigFile, 'utf8')
  
  // Check for deprecated options
  const hasDeprecatedOptions = /useNewUrlParser/.test(content) || 
                              /useUnifiedTopology/.test(content)
  
  logStatus('Deprecated options removed', !hasDeprecatedOptions, 
    hasDeprecatedOptions ? 'Contains deprecated options' : 'Clean configuration')
  
  return !hasDeprecatedOptions
}

async function generateReport() {
  logSection('Verification Report')
  
  log('\n📋 Summary:', 'bold')
  
  const envOk = await verifyEnvironmentVariables()
  const mongoOk = await verifyMongoDBConnection()
  const indexesOk = await verifyModelIndexes()
  const slowDownOk = await verifyExpressSlowDownConfig()
  const dbConfigOk = await verifyDatabaseConfig()
  
  const allChecks = [envOk, mongoOk, indexesOk, slowDownOk, dbConfigOk]
  const passedChecks = allChecks.filter(Boolean).length
  const totalChecks = allChecks.length
  
  log(`\n✅ Passed: ${passedChecks}/${totalChecks} checks`, passedChecks === totalChecks ? 'green' : 'yellow')
  
  if (passedChecks === totalChecks) {
    log('\n🎉 All checks passed! Your backend should be ready for production.', 'green')
  } else {
    log('\n⚠️  Some issues found. Please review the BACKEND_FIXES.md file for solutions.', 'yellow')
  }
  
  log('\n📚 For detailed solutions, see: BACKEND_FIXES.md', 'blue')
}

// Main execution
async function main() {
  log('🔍 DevDeck Backend Verification Script', 'bold')
  log('=====================================\n', 'blue')
  
  try {
    await generateReport()
  } catch (error) {
    log(`\n❌ Verification failed: ${error.message}`, 'red')
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = {
  verifyEnvironmentVariables,
  verifyMongoDBConnection,
  verifyModelIndexes,
  verifyExpressSlowDownConfig,
  verifyDatabaseConfig
}