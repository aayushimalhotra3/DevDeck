#!/bin/bash

# SEO Automation Script
# Handles scheduled SEO tasks, monitoring, and optimization

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SEO_DIR="$SCRIPT_DIR/.."
REPORTS_DIR="$SEO_DIR/reports"
LOGS_DIR="$SEO_DIR/logs"
CONFIG_FILE="$SEO_DIR/config/seo-config.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOGS_DIR/seo.log"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOGS_DIR/seo.log"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOGS_DIR/seo.log"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOGS_DIR/seo.log"
}

# Ensure directories exist
mkdir -p "$LOGS_DIR" "$REPORTS_DIR"

# Function to generate sitemap and robots.txt
generate_seo_files() {
    log_info "Generating SEO files..."
    
    if node "$SCRIPT_DIR/generate-sitemap.js"; then
        log_success "SEO files generated successfully"
    else
        log_error "Failed to generate SEO files"
        return 1
    fi
}

# Function to run SEO analysis
run_seo_analysis() {
    log_info "Running SEO analysis..."
    
    if node "$SCRIPT_DIR/analyze-seo.js"; then
        log_success "SEO analysis completed"
    else
        log_error "SEO analysis failed"
        return 1
    fi
}

# Function to run SEO monitoring
run_seo_monitoring() {
    log_info "Running SEO monitoring..."
    
    if node "$SCRIPT_DIR/monitor-seo.js"; then
        log_success "SEO monitoring completed"
    else
        log_error "SEO monitoring failed"
        return 1
    fi
}

# Function to optimize images for SEO
optimize_images() {
    log_info "Optimizing images for SEO..."
    
    local project_root="$(dirname "$SEO_DIR")"
    local images_dir="$project_root/public/images"
    
    if [[ -d "$images_dir" ]]; then
        # Find and optimize images
        find "$images_dir" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) | while read -r image; do
            # Check if image has alt text in usage (simplified check)
            local basename=$(basename "$image")
            local usage_count=$(find "$project_root" -name "*.tsx" -o -name "*.jsx" -o -name "*.html" | xargs grep -l "$basename" | wc -l)
            
            if [[ $usage_count -eq 0 ]]; then
                log_warning "Unused image found: $basename"
            fi
        done
        
        log_success "Image optimization check completed"
    else
        log_warning "Images directory not found: $images_dir"
    fi
}

# Function to check internal links
check_internal_links() {
    log_info "Checking internal links..."
    
    local project_root="$(dirname "$SEO_DIR")"
    local broken_links=0
    
    # This is a simplified check - in production, use a proper link checker
    find "$project_root" -name "*.tsx" -o -name "*.jsx" -o -name "*.html" | while read -r file; do
        # Extract internal links (simplified regex)
        grep -oE 'href="/[^"]*"' "$file" 2>/dev/null | while read -r link; do
            local path=$(echo "$link" | sed 's/href="\(.*\)"/\1/')
            # Check if corresponding file/route exists (simplified)
            if [[ "$path" == "/"* ]] && [[ ! "$path" =~ ^/(api|_next|static) ]]; then
                # This would need more sophisticated route checking in a real implementation
                echo "Found internal link: $path in $file"
            fi
        done
    done
    
    log_success "Internal links check completed"
}

# Function to validate structured data
validate_structured_data() {
    log_info "Validating structured data..."
    
    local project_root="$(dirname "$SEO_DIR")"
    local validation_errors=0
    
    # Find files with JSON-LD structured data
    find "$project_root" -name "*.tsx" -o -name "*.jsx" -o -name "*.html" | xargs grep -l "application/ld+json" | while read -r file; do
        log_info "Found structured data in: $file"
        
        # Extract and validate JSON-LD (simplified)
        grep -oP '(?<=<script type="application/ld\+json">).*?(?=</script>)' "$file" 2>/dev/null | while read -r json; do
            if echo "$json" | jq . >/dev/null 2>&1; then
                log_success "Valid JSON-LD found in $file"
            else
                log_error "Invalid JSON-LD found in $file"
                ((validation_errors++))
            fi
        done
    done
    
    if [[ $validation_errors -eq 0 ]]; then
        log_success "Structured data validation completed"
    else
        log_warning "$validation_errors structured data validation errors found"
    fi
}

# Function to cleanup old reports
cleanup_old_reports() {
    log_info "Cleaning up old SEO reports..."
    
    # Keep reports for 30 days
    find "$REPORTS_DIR" -name "*.json" -type f -mtime +30 -delete 2>/dev/null || true
    
    # Keep logs for 14 days
    find "$LOGS_DIR" -name "*.log" -type f -mtime +14 -delete 2>/dev/null || true
    
    log_success "Cleanup completed"
}

# Function to backup SEO data
backup_seo_data() {
    log_info "Creating SEO data backup..."
    
    local backup_dir="$SEO_DIR/backups"
    local backup_file="$backup_dir/seo-backup-$(date +%Y%m%d).tar.gz"
    
    mkdir -p "$backup_dir"
    
    # Create backup of reports and configuration
    tar -czf "$backup_file" -C "$SEO_DIR" reports config 2>/dev/null || {
        log_error "Failed to create SEO backup"
        return 1
    }
    
    # Keep backups for 30 days
    find "$backup_dir" -name "seo-backup-*.tar.gz" -type f -mtime +30 -delete 2>/dev/null || true
    
    log_success "SEO backup created: $backup_file"
}

# Function to generate SEO dashboard
generate_seo_dashboard() {
    log_info "Generating SEO dashboard..."
    
    local dashboard_file="$SEO_DIR/dashboard.html"
    
    cat > "$dashboard_file" << 'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevDeck SEO Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric { display: inline-block; margin: 10px 20px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #2196F3; }
        .metric-label { color: #666; }
        .score-good { color: #4CAF50; }
        .score-warning { color: #FF9800; }
        .score-poor { color: #F44336; }
        .issue { padding: 10px; margin: 5px 0; border-left: 4px solid #F44336; background: #ffebee; }
        .recommendation { padding: 10px; margin: 5px 0; border-left: 4px solid #2196F3; background: #e3f2fd; }
        .chart-placeholder { height: 200px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <h1>DevDeck SEO Dashboard</h1>
        <p>Last updated: <span id="lastUpdated"></span></p>
        
        <div class="card">
            <h2>SEO Score</h2>
            <div class="metric">
                <div class="metric-value" id="seoScore">-</div>
                <div class="metric-label">Overall Score</div>
            </div>
        </div>
        
        <div class="card">
            <h2>Core Web Vitals</h2>
            <div id="coreWebVitals">
                <div class="metric">
                    <div class="metric-value" id="lcp">-</div>
                    <div class="metric-label">LCP (s)</div>
                </div>
                <div class="metric">
                    <div class="metric-value" id="fid">-</div>
                    <div class="metric-label">FID (ms)</div>
                </div>
                <div class="metric">
                    <div class="metric-value" id="cls">-</div>
                    <div class="metric-label">CLS</div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h2>Issues & Recommendations</h2>
            <div id="issues"></div>
            <div id="recommendations"></div>
        </div>
        
        <div class="card">
            <h2>Search Rankings</h2>
            <div class="chart-placeholder">Ranking trends would be displayed here</div>
        </div>
    </div>
    
    <script>
        // Load latest SEO report
        fetch('./reports/latest-seo-report.json')
            .then(response => response.json())
            .then(data => {
                document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
                
                // Update SEO score
                const score = data.score || 0;
                const scoreElement = document.getElementById('seoScore');
                scoreElement.textContent = score;
                scoreElement.className = `metric-value ${
                    score >= 80 ? 'score-good' : score >= 60 ? 'score-warning' : 'score-poor'
                }`;
                
                // Update issues
                const issuesContainer = document.getElementById('issues');
                if (data.issues && data.issues.length > 0) {
                    data.issues.slice(0, 5).forEach(issue => {
                        const issueDiv = document.createElement('div');
                        issueDiv.className = 'issue';
                        issueDiv.innerHTML = `<strong>Issue:</strong> ${issue}`;
                        issuesContainer.appendChild(issueDiv);
                    });
                } else {
                    issuesContainer.innerHTML = '<div style="color: #4CAF50;">No critical issues found!</div>';
                }
                
                // Update recommendations
                const recommendationsContainer = document.getElementById('recommendations');
                if (data.recommendations && data.recommendations.length > 0) {
                    data.recommendations.slice(0, 3).forEach(rec => {
                        const recDiv = document.createElement('div');
                        recDiv.className = 'recommendation';
                        recDiv.innerHTML = `<strong>Recommendation:</strong> ${rec}`;
                        recommendationsContainer.appendChild(recDiv);
                    });
                }
            })
            .catch(error => {
                console.error('Error loading SEO data:', error);
                document.getElementById('issues').innerHTML = '<div class="issue">Unable to load SEO data</div>';
            });
    </script>
</body>
</html>
HTML
    
    log_success "SEO dashboard generated: $dashboard_file"
}

# Main execution
case "${1:-help}" in
    "generate")
        generate_seo_files
        ;;
    "analyze")
        run_seo_analysis
        ;;
    "monitor")
        run_seo_monitoring
        ;;
    "optimize")
        optimize_images
        check_internal_links
        validate_structured_data
        ;;
    "dashboard")
        generate_seo_dashboard
        ;;
    "cleanup")
        cleanup_old_reports
        ;;
    "backup")
        backup_seo_data
        ;;
    "daily")
        generate_seo_files
        run_seo_monitoring
        generate_seo_dashboard
        ;;
    "weekly")
        run_seo_analysis
        optimize_images
        check_internal_links
        validate_structured_data
        cleanup_old_reports
        ;;
    "monthly")
        backup_seo_data
        ;;
    "all")
        generate_seo_files
        run_seo_analysis
        run_seo_monitoring
        optimize_images
        check_internal_links
        validate_structured_data
        generate_seo_dashboard
        ;;
    "help")
        echo "Usage: $0 {generate|analyze|monitor|optimize|dashboard|cleanup|backup|daily|weekly|monthly|all|help}"
        echo ""
        echo "Commands:"
        echo "  generate  - Generate sitemap and robots.txt"
        echo "  analyze   - Run comprehensive SEO analysis"
        echo "  monitor   - Monitor SEO metrics and Core Web Vitals"
        echo "  optimize  - Run SEO optimization checks"
        echo "  dashboard - Generate SEO dashboard"
        echo "  cleanup   - Clean up old reports and logs"
        echo "  backup    - Create SEO data backup"
        echo "  daily     - Daily SEO tasks (generate + monitor + dashboard)"
        echo "  weekly    - Weekly SEO tasks (analyze + optimize + cleanup)"
        echo "  monthly   - Monthly SEO tasks (backup)"
        echo "  all       - Run all SEO tasks"
        echo "  help      - Show this help message"
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
