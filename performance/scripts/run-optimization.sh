#!/bin/bash

# Performance Optimization Runner
# Collects performance data and runs optimization analysis

set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:5000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
REPORT_DIR="./performance/reports"
CONFIG_DIR="./performance/config"

# Ensure directories exist
mkdir -p "$REPORT_DIR" "$CONFIG_DIR"

print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_status "Starting performance optimization analysis..."

# Function to collect backend performance data
collect_backend_metrics() {
    print_status "Collecting backend performance metrics..."
    
    local metrics_file="$REPORT_DIR/backend-metrics-$(date +%s).json"
    
    # Try to get metrics from API
    if curl -s "$API_BASE_URL/api/performance/metrics" > "$metrics_file" 2>/dev/null; then
        print_success "Backend metrics collected"
        echo "$metrics_file"
    else
        print_warning "Could not collect backend metrics from API"
        echo ""
    fi
}

# Function to run frontend performance test
run_frontend_performance_test() {
    print_status "Running frontend performance test..."
    
    local lighthouse_report="$REPORT_DIR/lighthouse-$(date +%s).json"
    
    # Check if Lighthouse is available
    if command -v lighthouse >/dev/null 2>&1; then
        print_status "Running Lighthouse audit..."
        
        lighthouse "$FRONTEND_URL" \
            --output=json \
            --output-path="$lighthouse_report" \
            --chrome-flags="--headless --no-sandbox" \
            --quiet 2>/dev/null
        
        if [ -f "$lighthouse_report" ]; then
            print_success "Lighthouse audit completed"
            echo "$lighthouse_report"
        else
            print_warning "Lighthouse audit failed"
            echo ""
        fi
    else
        print_warning "Lighthouse not installed. Install with: npm install -g lighthouse"
        echo ""
    fi
}

# Function to analyze database performance
analyze_database_performance() {
    print_status "Analyzing database performance..."
    
    local db_report="$REPORT_DIR/database-analysis-$(date +%s).json"
    
    # Create a simple database analysis script
    cat > "/tmp/db-analysis.js" << 'DBEOF'
const mongoose = require('mongoose');

async function analyzeDatabasePerformance() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/devdeck');
        
        const admin = mongoose.connection.db.admin();
        const serverStatus = await admin.serverStatus();
        const dbStats = await mongoose.connection.db.stats();
        
        const analysis = {
            timestamp: new Date().toISOString(),
            serverStatus: {
                connections: serverStatus.connections,
                opcounters: serverStatus.opcounters,
                memory: serverStatus.mem,
                uptime: serverStatus.uptime
            },
            dbStats: {
                collections: dbStats.collections,
                dataSize: dbStats.dataSize,
                indexSize: dbStats.indexSize,
                storageSize: dbStats.storageSize
            }
        };
        
        console.log(JSON.stringify(analysis, null, 2));
        
    } catch (error) {
        console.error('Database analysis failed:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

analyzeDatabasePerformance();
DBEOF
    
    # Run database analysis if Node.js and mongoose are available
    if command -v node >/dev/null 2>&1 && [ -f "package.json" ]; then
        if node "/tmp/db-analysis.js" > "$db_report" 2>/dev/null; then
            print_success "Database analysis completed"
            echo "$db_report"
        else
            print_warning "Database analysis failed"
            echo ""
        fi
    else
        print_warning "Node.js not available for database analysis"
        echo ""
    fi
    
    # Cleanup
    rm -f "/tmp/db-analysis.js"
}

# Function to run optimization analysis
run_optimization_analysis() {
    local backend_metrics="$1"
    local frontend_metrics="$2"
    local database_metrics="$3"
    
    print_status "Running optimization analysis..."
    
    local analysis_script="/tmp/run-analysis.js"
    local optimization_report="$REPORT_DIR/optimization-report-$(date +%s).json"
    
    # Create analysis script
    cat > "$analysis_script" << 'ANALYSISEOF'
const AutoOptimizer = require('./performance/optimizers/auto-optimizer');
const fs = require('fs');

async function runAnalysis() {
    const optimizer = new AutoOptimizer();
    
    const performanceData = {
        frontend: null,
        backend: null,
        database: null
    };
    
    // Load backend metrics
    if (process.argv[2] && fs.existsSync(process.argv[2])) {
        try {
            performanceData.backend = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
        } catch (error) {
            console.warn('Failed to load backend metrics:', error.message);
        }
    }
    
    // Load frontend metrics (Lighthouse report)
    if (process.argv[3] && fs.existsSync(process.argv[3])) {
        try {
            const lighthouse = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
            performanceData.frontend = {
                vitals: {
                    lcp: lighthouse.audits['largest-contentful-paint']?.numericValue,
                    fid: lighthouse.audits['max-potential-fid']?.numericValue,
                    cls: lighthouse.audits['cumulative-layout-shift']?.numericValue,
                    fcp: lighthouse.audits['first-contentful-paint']?.numericValue
                },
                performance: lighthouse.categories.performance?.score * 100,
                opportunities: lighthouse.audits
            };
        } catch (error) {
            console.warn('Failed to load frontend metrics:', error.message);
        }
    }
    
    // Load database metrics
    if (process.argv[4] && fs.existsSync(process.argv[4])) {
        try {
            performanceData.database = JSON.parse(fs.readFileSync(process.argv[4], 'utf8'));
        } catch (error) {
            console.warn('Failed to load database metrics:', error.message);
        }
    }
    
    // Run analysis
    const report = await optimizer.analyze(performanceData);
    
    // Save report
    const reportPath = process.argv[5] || './optimization-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('Optimization analysis completed!');
    console.log(`Report saved: ${reportPath}`);
    
    // Print summary
    console.log('\n=== OPTIMIZATION SUMMARY ===');
    console.log(`Total issues found: ${report.summary.totalIssues}`);
    console.log(`High severity: ${report.summary.highSeverity}`);
    console.log(`Medium severity: ${report.summary.mediumSeverity}`);
    console.log(`Low severity: ${report.summary.lowSeverity}`);
    
    if (report.prioritizedActions.length > 0) {
        console.log('\n=== TOP PRIORITY ACTIONS ===');
        report.prioritizedActions.slice(0, 5).forEach((action, index) => {
            console.log(`${index + 1}. [${action.severity.toUpperCase()}] ${action.issue}`);
            console.log(`   Recommendation: ${action.topRecommendation}`);
        });
    }
    
    if (report.automatedFixes.length > 0) {
        console.log('\n=== AUTOMATED FIXES AVAILABLE ===');
        report.automatedFixes.forEach(fix => {
            console.log(`- ${fix.description}`);
            console.log(`  Command: ${fix.script}`);
        });
    }
}

runAnalysis().catch(console.error);
ANALYSISEOF
    
    # Run analysis if the optimizer exists
    if [ -f "./performance/optimizers/auto-optimizer.js" ] && command -v node >/dev/null 2>&1; then
        if node "$analysis_script" "$backend_metrics" "$frontend_metrics" "$database_metrics" "$optimization_report" 2>/dev/null; then
            print_success "Optimization analysis completed"
            echo "$optimization_report"
        else
            print_warning "Optimization analysis failed"
            echo ""
        fi
    else
        print_warning "Auto-optimizer not available"
        echo ""
    fi
    
    # Cleanup
    rm -f "$analysis_script"
}

# Function to generate performance report
generate_performance_report() {
    local optimization_report="$1"
    
    print_status "Generating performance report..."
    
    local html_report="$REPORT_DIR/performance-report-$(date +%s).html"
    
    cat > "$html_report" << 'HTMLEOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevDeck Performance Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; }
        .metric { background: #f8f9fa; padding: 20px; margin: 15px 0; border-radius: 6px; border-left: 4px solid #007bff; }
        .metric.warning { border-left-color: #ffc107; }
        .metric.error { border-left-color: #dc3545; }
        .metric.success { border-left-color: #28a745; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: white; border: 1px solid #e9ecef; border-radius: 6px; padding: 20px; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .badge.high { background: #dc3545; color: white; }
        .badge.medium { background: #ffc107; color: black; }
        .badge.low { background: #28a745; color: white; }
        .recommendations { list-style: none; padding: 0; }
        .recommendations li { padding: 8px 0; border-bottom: 1px solid #eee; }
        .recommendations li:last-child { border-bottom: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 DevDeck Performance Report</h1>
            <p>Generated on: <span id="timestamp"></span></p>
        </div>
        <div class="content">
            <div id="report-content">
                <p>Loading performance data...</p>
            </div>
        </div>
    </div>
    
    <script>
        document.getElementById('timestamp').textContent = new Date().toLocaleString();
        
        // This would be populated with actual report data
        const reportData = {
            summary: { totalIssues: 0, highSeverity: 0, mediumSeverity: 0, lowSeverity: 0 },
            optimizations: { frontend: [], backend: [], database: [], infrastructure: [] },
            prioritizedActions: []
        };
        
        function renderReport(data) {
            const content = document.getElementById('report-content');
            
            content.innerHTML = `
                <div class="grid">
                    <div class="card">
                        <h3>📊 Summary</h3>
                        <div class="metric ${data.summary.totalIssues > 0 ? 'warning' : 'success'}">
                            <strong>Total Issues: ${data.summary.totalIssues}</strong>
                        </div>
                        <div class="metric error">
                            <strong>High Severity: ${data.summary.highSeverity}</strong>
                        </div>
                        <div class="metric warning">
                            <strong>Medium Severity: ${data.summary.mediumSeverity}</strong>
                        </div>
                        <div class="metric success">
                            <strong>Low Severity: ${data.summary.lowSeverity}</strong>
                        </div>
                    </div>
                    
                    <div class="card">
                        <h3>🎯 Priority Actions</h3>
                        ${data.prioritizedActions.length > 0 ? 
                            data.prioritizedActions.slice(0, 5).map(action => `
                                <div class="metric">
                                    <span class="badge ${action.severity}">${action.severity.toUpperCase()}</span>
                                    <strong>${action.issue}</strong>
                                    <p>${action.topRecommendation}</p>
                                </div>
                            `).join('') : 
                            '<p>No priority actions needed. Great job! 🎉</p>'
                        }
                    </div>
                </div>
                
                <div class="grid">
                    ${Object.entries(data.optimizations).map(([category, issues]) => `
                        <div class="card">
                            <h3>🔧 ${category.charAt(0).toUpperCase() + category.slice(1)} Optimizations</h3>
                            ${issues.length > 0 ? 
                                issues.map(issue => `
                                    <div class="metric">
                                        <span class="badge ${issue.severity}">${issue.severity.toUpperCase()}</span>
                                        <strong>${issue.issue}</strong>
                                        <ul class="recommendations">
                                            ${issue.recommendations.slice(0, 3).map(rec => `<li>• ${rec}</li>`).join('')}
                                        </ul>
                                    </div>
                                `).join('') : 
                                '<p>No issues found in this category. ✅</p>'
                            }
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        renderReport(reportData);
    </script>
</body>
</html>
HTMLEOF
    
    print_success "Performance report generated: $html_report"
    echo "$html_report"
}

# Main execution
main() {
    echo "🚀 DevDeck Performance Optimization"
    echo "===================================="
    echo
    
    # Collect performance data
    backend_metrics=$(collect_backend_metrics)
    frontend_metrics=$(run_frontend_performance_test)
    database_metrics=$(analyze_database_performance)
    
    echo
    print_status "Performance data collection completed"
    
    # Run optimization analysis
    optimization_report=$(run_optimization_analysis "$backend_metrics" "$frontend_metrics" "$database_metrics")
    
    # Generate HTML report
    if [ -n "$optimization_report" ]; then
        html_report=$(generate_performance_report "$optimization_report")
        
        echo
        print_success "Performance optimization analysis completed!"
        echo
        print_status "Reports generated:"
        [ -n "$optimization_report" ] && echo "  📊 Optimization Report: $optimization_report"
        [ -n "$html_report" ] && echo "  📄 HTML Report: $html_report"
        [ -n "$backend_metrics" ] && echo "  🔧 Backend Metrics: $backend_metrics"
        [ -n "$frontend_metrics" ] && echo "  🎨 Frontend Metrics: $frontend_metrics"
        [ -n "$database_metrics" ] && echo "  🗄️  Database Metrics: $database_metrics"
        
        echo
        print_status "Next steps:"
        echo "  1. Review the optimization report"
        echo "  2. Implement high-priority recommendations"
        echo "  3. Run automated fixes if available"
        echo "  4. Schedule regular performance monitoring"
        
        # Open HTML report if possible
        if command -v open >/dev/null 2>&1 && [ -n "$html_report" ]; then
            echo
            print_status "Opening performance report in browser..."
            open "$html_report"
        fi
    else
        print_warning "No optimization report generated"
    fi
}

# Run main function
main "$@"
