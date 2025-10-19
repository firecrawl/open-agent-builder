#!/bin/bash

# Automated API Route Migration: Clerk → NextAuth
# This script updates all API routes to use NextAuth instead of Clerk

set -e

echo "🔄 Starting API Route Migration..."
echo "================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
UPDATED=0

# Find all TypeScript files in app/api
echo "📁 Scanning app/api directory..."

while IFS= read -r -d '' file; do
  # Check if file contains Clerk imports
  if grep -q "from '@clerk/nextjs/server'" "$file"; then
    echo -e "${YELLOW}Updating:${NC} $file"
    
    # Backup original
    cp "$file" "$file.backup"
    
    # Update imports
    sed -i "s/import { auth } from '@clerk\/nextjs\/server';/import { getAuthUser } from '@\/lib\/auth';/g" "$file"
    
    # Update auth() calls
    sed -i "s/const { userId } = await auth();/const { userId } = await getAuthUser();/g" "$file"
    
    # Update getCurrentUser calls if present
    sed -i "s/import { auth, currentUser } from '@clerk\/nextjs\/server';/import { getAuthUser } from '@\/lib\/auth';/g" "$file"
    sed -i "s/const user = await currentUser();/const { user } = await getAuthUser();/g" "$file"
    
    UPDATED=$((UPDATED + 1))
    echo -e "${GREEN}✓${NC} Updated successfully"
  fi
done < <(find app/api -type f -name "*.ts" -print0)

echo ""
echo "================================"
echo -e "${GREEN}✅ Migration Complete!${NC}"
echo "Files updated: $UPDATED"
echo ""
echo "📋 Next steps:"
echo "  1. Review changes: git diff app/api"
echo "  2. Test each route manually"
echo "  3. Remove backups if satisfied: find app/api -name '*.backup' -delete"
echo ""
echo "⚠️  Note: Some files may need manual adjustments for:"
echo "  - Complex auth logic"
echo "  - User metadata access"
echo "  - Organization/team features"

