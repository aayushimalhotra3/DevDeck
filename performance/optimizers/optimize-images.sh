#!/bin/bash

# Automated Image Optimization Script
# Optimizes images for better performance

set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Configuration
SOURCE_DIR="${1:-./public/images}"
OUTPUT_DIR="${2:-./public/images/optimized}"
QUALITY="${3:-80}"
MAX_WIDTH="${4:-1920}"
MAX_HEIGHT="${5:-1080}"

print_status "Starting image optimization..."
print_status "Source: $SOURCE_DIR"
print_status "Output: $OUTPUT_DIR"
print_status "Quality: $QUALITY%"
print_status "Max dimensions: ${MAX_WIDTH}x${MAX_HEIGHT}"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Statistics
total_files=0
optimized_files=0
total_original_size=0
total_optimized_size=0

# Function to optimize image
optimize_image() {
    local input_file="$1"
    local output_file="$2"
    local file_ext="${input_file##*.}"
    
    case "${file_ext,,}" in
        jpg|jpeg)
            if command -v jpegoptim >/dev/null 2>&1; then
                jpegoptim --max="$QUALITY" --strip-all --overwrite "$input_file"
                cp "$input_file" "$output_file"
            elif command -v convert >/dev/null 2>&1; then
                convert "$input_file" -quality "$QUALITY" -resize "${MAX_WIDTH}x${MAX_HEIGHT}>" "$output_file"
            else
                cp "$input_file" "$output_file"
                print_warning "No JPEG optimizer available, copied original"
            fi
            ;;
        png)
            if command -v optipng >/dev/null 2>&1; then
                optipng -o2 "$input_file"
                cp "$input_file" "$output_file"
            elif command -v convert >/dev/null 2>&1; then
                convert "$input_file" -resize "${MAX_WIDTH}x${MAX_HEIGHT}>" "$output_file"
            else
                cp "$input_file" "$output_file"
                print_warning "No PNG optimizer available, copied original"
            fi
            ;;
        webp)
            if command -v cwebp >/dev/null 2>&1; then
                cwebp -q "$QUALITY" "$input_file" -o "$output_file"
            else
                cp "$input_file" "$output_file"
                print_warning "WebP optimizer not available, copied original"
            fi
            ;;
        svg)
            if command -v svgo >/dev/null 2>&1; then
                svgo "$input_file" -o "$output_file"
            else
                cp "$input_file" "$output_file"
                print_warning "SVG optimizer not available, copied original"
            fi
            ;;
        *)
            cp "$input_file" "$output_file"
            print_warning "Unsupported format: $file_ext"
            ;;
    esac
}

# Process images
if [ -d "$SOURCE_DIR" ]; then
    while IFS= read -r -d '' file; do
        filename=$(basename "$file")
        output_file="$OUTPUT_DIR/$filename"
        
        # Get file sizes
        if [ -f "$file" ]; then
            original_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
            total_original_size=$((total_original_size + original_size))
            total_files=$((total_files + 1))
            
            print_status "Optimizing: $filename"
            optimize_image "$file" "$output_file"
            
            if [ -f "$output_file" ]; then
                optimized_size=$(stat -f%z "$output_file" 2>/dev/null || stat -c%s "$output_file" 2>/dev/null || echo 0)
                total_optimized_size=$((total_optimized_size + optimized_size))
                optimized_files=$((optimized_files + 1))
                
                # Calculate savings
                if [ "$original_size" -gt 0 ]; then
                    savings=$((100 - (optimized_size * 100 / original_size)))
                    print_success "Optimized $filename (${savings}% smaller)"
                fi
            fi
        fi
    done < <(find "$SOURCE_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" -o -iname "*.svg" \) -print0)
else
    print_warning "Source directory not found: $SOURCE_DIR"
    exit 1
fi

# Generate report
print_status "Optimization completed!"
echo
print_status "Summary:"
echo "  📁 Total files processed: $total_files"
echo "  ✅ Successfully optimized: $optimized_files"

if [ "$total_original_size" -gt 0 ] && [ "$total_optimized_size" -gt 0 ]; then
    total_savings=$((100 - (total_optimized_size * 100 / total_original_size)))
    original_mb=$((total_original_size / 1024 / 1024))
    optimized_mb=$((total_optimized_size / 1024 / 1024))
    saved_mb=$((original_mb - optimized_mb))
    
    echo "  📊 Original size: ${original_mb}MB"
    echo "  📉 Optimized size: ${optimized_mb}MB"
    echo "  💾 Space saved: ${saved_mb}MB (${total_savings}%)"
fi

echo
print_status "Optimized images saved to: $OUTPUT_DIR"

# Generate optimization report
report_file="./performance/reports/image-optimization-$(date +%s).json"
cat > "$report_file" << REPORTEOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "source": "$SOURCE_DIR",
  "output": "$OUTPUT_DIR",
  "settings": {
    "quality": $QUALITY,
    "maxWidth": $MAX_WIDTH,
    "maxHeight": $MAX_HEIGHT
  },
  "results": {
    "totalFiles": $total_files,
    "optimizedFiles": $optimized_files,
    "originalSize": $total_original_size,
    "optimizedSize": $total_optimized_size,
    "spaceSaved": $((total_original_size - total_optimized_size)),
    "percentageSaved": $total_savings
  }
}
REPORTEOF

print_success "Optimization report saved: $report_file"
