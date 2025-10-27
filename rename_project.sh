#!/bin/bash

# This script replaces the placeholder project name with the new project name provided by the user.

# Check if the new project name is provided.
if [ -z "$1" ]; then
  echo "Usage: ./setup.sh <new-project-name>"
  exit 1
fi

# The placeholder project name.
PLACEHOLDER="gemini-ai-classroom-assistant"

# The new project name.
NEW_PROJECT_NAME="$1"

# The files that need to be updated.
FILES=(
  ".firebaserc"
  "admin/scripts/reset_app.js"
  "cors.json"
  "functions/config.js"
)

# Replace the placeholder with the new project name in all the files.
for FILE in "${FILES[@]}"; do
  sed -i "s/$PLACEHOLDER/$NEW_PROJECT_NAME/g" "$FILE"
  echo "Updated $FILE"
done

echo "Project name updated successfully!"
