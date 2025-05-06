#!/bin/bash

# Create a simple icon using HTML and convert it to PNG
# This is a simple placeholder - you can replace with your own icons later

# Create a basic SVG
cat > temp_icon.svg << EOF
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <rect width="128" height="128" fill="#4a6c6f" rx="20" />
  <circle cx="64" cy="64" r="50" fill="#d0a56e" />
  <text x="64" y="72" font-family="Arial" font-size="40" text-anchor="middle" fill="#333">CC</text>
</svg>
EOF

# Check if ImageMagick is installed
if command -v convert &> /dev/null; then
    # Create icons of different sizes
    convert -background none temp_icon.svg -resize 16x16 icon16.png
    convert -background none temp_icon.svg -resize 48x48 icon48.png
    convert -background none temp_icon.svg -resize 128x128 icon128.png
    
    echo "Icons created successfully."
    
    # Clean up
    rm temp_icon.svg
else
    echo "ImageMagick not found. Please install it or create icons manually."
    echo "SVG template saved as temp_icon.svg"
fi 