#!/bin/bash

# Main Performance Optimization Runner
# Orchestrates all performance optimization tasks

set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

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

# Configuration
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PERF_DIR="$BASE_DIR/performance"
REPORTS_DIR="$PREF_DIR/reports"
CONFIG_DIR="$PERF_DIR/config"
OPTIMIZERS_DIR="$PERF_DIR/optimizers"
MONITORS_DIR="$PERF_DIR/monitors"

# Options
RUN_FRONTEND_ANALYSIS=${1:-true}
RUN_BACKEND_ANALYSIS=${2:-true}
RUN_BUNDLE_ANALYSIS=${3:-true}
RUN_IMAGE_OPTIMIZATION=${4:-false}
RUN_CACHE_OPTIMIZATION=${5:-true}
GENERATE_REPORT=${6:-true}

echo "🚀 Starting DevDeck Performance Optimization"
echo "================================================"
echo

print_status "Configuration:"
echo "  Frontend Analysis: $RUN_FRONTEND_ANALYSIS"
echo "  Backend Analysis: $RUN_BACKEND_ANALYSIS"
echo "  Bundle Analysis: $RUN_BUNDLE_ANALYSIS"
echo "  Image Optimization: $RUN_IMAGE_OPTIMIZATION"
echo "  Cache Optimization: $RUN_CACHE_OPTIMIZATION"
echo "  Generate Report: $GENERATE_REPORT"
echo

# Create timestamp for this run
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RUN_DIR="$REPORTS_DIR/run_$TIMESTAMP"
mkdir -p "$RUN_DIR"

print_status "Created run directory: $RUN_DIR"

# Initialize results
RESULTS_FILE="$RUN_DIR/optimization_results.json"
cat > "$RESULTS_FILE" << JSONEOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "runId": "$TIMESTAMP",
  "configuration": {
    "frontendAnalysis": $RUN_FRONTEND_ANALYSIS,
    "backendAnalysis": $RUN_BACKEND_ANALYSIS,
    "bundleAnalysis": $RUN_BUNDLE_ANALYSIS,
    "imageOptimization": $RUN_IMAGE_OPTIMIZATION,
    "cacheOptimization": $RUN_CACHE_OPTIMIZATION
  },
  "results": {},
  "recommendations": [],
  "summary": {}
}
JSONEOF

# Function to update results
update_results() {
    local section="$1"
    local data="$2"
    
    # Use jq to update the results file if available, otherwise use basic approach
    if command -v jq >/dev/null 2>&1; then
        echo "$data" | jq ".results.$section = ." "$RESULTS_FILE" > "$RESULTS_FILE.tmp" && mv "$RESULTS_FILE.tmp" "$RESULTS_FILE"
    else
        print_warning "jq not available, using basic JSON handling"
    fi
}

# Frontend Performance Analysis
if [ "$RUN_FRONTEND_ANALYSIS" = "true" ]; then
    print_status "Running frontend performance analysis..."
    
    if [ -f "$MONITORS_DIR/frontend-performance.js" ]; then
        cd "$BASE_DIR"
        
        # Run Lighthouse audit if available
        if command -v lighthouse >/dev/null 2>&1; then
            print_status "Running Lighthouse audit..."
            lighthouse http://localhost:3000 --output=json --output-path="$RUN_DIR/lighthouse.json" --quiet || true
            
            if [ -f "$RUN_DIR/lighthouse.json" ]; then
                print_success "Lighthouse audit completed"
            else
                print_warning "Lighthouse audit failed or server not running"
            fi
        else
            print_warning "Lighthouse not installed, skipping audit"
        fi
        
        # Analyze frontend metrics
        node "$MONITORS_DIR/frontend-performance.js" > "$RUN_DIR/frontend_analysis.json" 2>/dev/null || {
            print_warning "Frontend analysis failed, creating placeholder"
            echo '{"status": "failed", "reason": "analysis_error"}' > "$RUN_DIR/frontend_analysis.json"
        }
        
        print_success "Frontend analysis completed"
    else
        print_warning "Frontend performance monitor not found"
    fi
fi

# Backend Performance Analysis
if [ "$RUN_BACKEND_ANALYSIS" = "true" ]; then
    print_status "Running backend performance analysis..."
    
    if [ -f "$MONITORS_DIR/backend-performance.js" ]; then
        # Check if backend is running
        if curl -s http://localhost:5000/health >/dev/null 2>&1; then
            node "$MONITORS_DIR/backend-performance.js" > "$RUN_DIR/backend_analysis.json" 2>/dev/null || {
                print_warning "Backend analysis failed"
                echo '{"status": "failed", "reason": "analysis_error"}' > "$RUN_DIR/backend_analysis.json"
            }
            print_success "Backend analysis completed"
        else
            print_warning "Backend server not running, skipping analysis"
            echo '{"status": "skipped", "reason": "server_not_running"}' > "$RUN_DIR/backend_analysis.json"
        fi
    else
        print_warning "Backend performance monitor not found"
    fi
fi

# Bundle Analysis
if [ "$RUN_BUNDLE_ANALYSIS" = "true" ]; then
    print_status "Running bundle analysis..."
    
    if [ -f "$OPTIMIZERS_DIR/analyze-bundles.js" ]; then
        node "$OPTIMIZERS_DIR/analyze-bundles.js" > "$RUN_DIR/bundle_analysis.json" 2>/dev/null || {
            print_warning "Bundle analysis failed"
            echo '{"status": "failed", "reason": "analysis_error"}' > "$RUN_DIR/bundle_analysis.json"
        }
        print_success "Bundle analysis completed"
    else
        print_warning "Bundle analyzer not found"
    fi
fi

# Image Optimization
if [ "$RUN_IMAGE_OPTIMIZATION" = "true" ]; then
    print_status "Running image optimization..."
    
    if [ -f "$OPTIMIZERS_DIR/optimize-images.sh" ]; then
        bash "$OPTIMIZERS_DIR/optimize-images.sh" ./public/images ./public/images/optimized 80 > "$RUN_DIR/image_optimization.log" 2>&1 || {
            print_warning "Image optimization failed"
        }
        print_success "Image optimization completed"
    else
        print_warning "Image optimizer not found"
    fi
fi

# Cache Optimization
if [ "$RUN_CACHE_OPTIMIZATION" = "true" ]; then
    print_status "Running cache optimization..."
    
    if [ -f "$OPTIMIZERS_DIR/optimize-caching.js" ]; then
        node "$OPTIMIZERS_DIR/optimize-caching.js" > "$RUN_DIR/cache_optimization.json" 2>/dev/null || {
            print_warning "Cache optimization failed"
            echo '{"status": "failed", "reason": "analysis_error"}' > "$RUN_DIR/cache_optimization.json"
        }
        print_success "Cache optimization completed"
    else
        print_warning "Cache optimizer not found"
    fi
fi

# Generate comprehensive report
if [ "$GENERATE_REPORT" = "true" ]; then
    print_status "Generating comprehensive performance report..."
    
    # Run the auto-optimizer to generate recommendations
    if [ -f "$OPTIMIZERS_DIR/auto-optimizer.js" ]; then
        node "$OPTIMIZERS_DIR/auto-optimizer.js" "$RUN_DIR" > "$RUN_DIR/optimization_recommendations.json" 2>/dev/null || {
            print_warning "Auto-optimizer failed"
        }
    fi
    
    # Generate HTML report
    cat > "$RUN_DIR/performance_report.html" << 'HTMLEOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevDeck Performance Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f7fa; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 8px; margin-bottom: 2rem; }
        .card { background: white; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .metric { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #eee; }
        .metric:last-child { border-bottom: none; }
        .status { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: bold; }
        .status.good { background: #d4edda; color: #155724; }
        .status.warning { background: #fff3cd; color: #856404; }
        .status.critical { background: #f8d7da; color: #721c24; }
        .recommendation { padding: 1rem; margin: 0.5rem 0; border-left: 4px solid #667eea; background: #f8f9fa; border-radius: 0 4px 4px 0; }
        .recommendation.high { border-left-color: #dc3545; }
        .recommendation.medium { border-left-color: #ffc107; }
        .recommendation.low { border-left-color: #28a745; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 DevDeck Performance Report</h1>
            <p>Generated on: $(date)</p>
            <p>Run ID: $TIMESTAMP</p>
        </div>
        
        <div class="card">
            <h2>📈 Performance Summary</h2>
            <div id="summary-content">
                <p>This report contains detailed performance analysis and optimization recommendations for DevDeck.</p>
                <p>Review the sections below for specific insights and actionable recommendations.</p>
            </div>
        </div>
        
        <div class="card">
            <h2>📁 Generated Files</h2>
            <ul>
                <li><strong>Frontend Analysis:</strong> frontend_analysis.json</li>
                <li><strong>Backend Analysis:</strong> backend_analysis.json</li>
                <li><strong>Bundle Analysis:</strong> bundle_analysis.json</li>
                <li><strong>Cache Optimization:</strong> cache_optimization.json</li>
                <li><strong>Optimization Recommendations:</strong> optimization_recommendations.json</li>
                <li><strong>Lighthouse Report:</strong> lighthouse.json (if available)</li>
            </ul>
        </div>
        
        <div class="card">
            <h2>🎯 Next Steps</h2>
            <ol>
                <li>Review the generated JSON files for detailed metrics</li>
                <li>Implement the recommended optimizations</li>
                <li>Re-run the performance analysis to measure improvements</li>
                <li>Set up automated monitoring for continuous optimization</li>
            </ol>
        </div>
    </div>
</body>
</html>
HHTMLEOF
    
    print_success "Performance report generated: $RUN_DIR/performance_report.html"
fi

# Summary
echo
print_status "Performance optimization completed!"
echo "================================================"
echo "📁 Results directory: $RUN_DIR"
echo "📊 View report: $RUN_DIR/performance_report.html"
echo "📈 Dashboard: $REPORTS_DIR/dashboard.html"
echo

print_status "Generated files:"
ls -la "$RUN_DIR" | grep -E '\.(json|html|log)$' | awk '{print "  " $9}'

echo
print_success "Performance optimization run completed successfully!"
print_status "Run ID: $TIMESTAMP"
