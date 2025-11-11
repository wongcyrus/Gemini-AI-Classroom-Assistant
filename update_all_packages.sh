#!/bin/bash

# This script updates all npm packages in every sub-project

# Exit immediately if a command exits with a non-zero status.
set -e

# 1. Install npm-check-updates globally
echo "Installing npm-check-updates globally..."
npm i -g npm-check-updates

# 2. Define all project directories with a package.json
# Note: Add any new node project directories to this list.
PROJECT_DIRS=(
    "admin"
    "web-app"
)

# Add all subdirectories of functions that have a package.json
for dir in functions/*/; do
    if [ -f "${dir}package.json" ]; then
        PROJECT_DIRS+=("${dir%/}")
    fi
done


# 3. Loop through each directory and update packages
for dir in "${PROJECT_DIRS[@]}"; do
    echo ""
    echo "-----------------------------------------------------"
    echo "Updating packages in: $dir"
    echo "-----------------------------------------------------"
    
    # Navigate to the directory
    cd "$dir"
    
    # Update package.json with latest versions
    echo "Running: ncu -u"
    ncu -u
    
    # Install the updated packages
    echo "Running: npm install"
    npm install
    
    # Navigate back to the root directory
    cd - > /dev/null
done

echo ""
echo "-----------------------------------------------------"
echo "All packages updated successfully!"
echo "-----------------------------------------------------"
