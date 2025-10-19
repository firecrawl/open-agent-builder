#!/bin/bash

# Automated Component Migration: Clerk → NextAuth
# This script updates React components to use NextAuth instead of Clerk

set -e

echo "🔄 Starting Component Migration..."
echo "================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Counters
UPDATED=0
MANUAL=0

echo "📁 Scanning components directory..."

# Find files using Clerk
FILES=$(grep -rl "useUser\|@clerk/nextjs" components/ app/ 2>/dev/null || true)

if [ -z "$FILES" ]; then
  echo -e "${GREEN}No files found with Clerk imports!${NC}"
  exit 0
fi

for file in $FILES; do
  # Skip node_modules
  if [[ "$file" == *"node_modules"* ]]; then
    continue
  fi
  
  # Check if file uses Clerk
  if grep -q "@clerk/nextjs\|useUser" "$file"; then
    echo -e "${YELLOW}Updating:${NC} $file"
    
    # Backup original
    cp "$file" "$file.backup"
    
    # Update imports
    sed -i "s/import { useUser } from '@clerk\/nextjs';/import { useSession } from 'next-auth\/react';/g" "$file"
    sed -i "s/import { useAuth } from '@clerk\/nextjs';/import { useSession } from 'next-auth\/react';/g" "$file"
    sed -i "s/import { SignInButton, SignOutButton, UserButton } from '@clerk\/nextjs';/import { signIn, signOut } from 'next-auth\/react';/g" "$file"
    
    # Update hook usage
    sed -i "s/const { user, isLoaded } = useUser();/const { data: session, status } = useSession();/g" "$file"
    sed -i "s/const { userId, isLoaded } = useAuth();/const { data: session, status } = useSession();/g" "$file"
    
    # Update loading checks
    sed -i "s/if (!isLoaded)/if (status === 'loading')/g" "$file"
    sed -i "s/if (!user)/if (status === 'unauthenticated' || !session?.user)/g" "$file"
    sed -i "s/if (!userId)/if (status === 'unauthenticated' || !session?.user?.id)/g" "$file"
    
    UPDATED=$((UPDATED + 1))
    
    # Check if file has user property access that needs manual update
    if grep -q "user\.firstName\|user\.emailAddresses\|user\.imageUrl" "$file" 2>/dev/null; then
      echo -e "${RED}  ⚠️  Manual review needed for user property access${NC}"
      MANUAL=$((MANUAL + 1))
    else
      echo -e "${GREEN}  ✓${NC} Updated successfully"
    fi
  fi
done

echo ""
echo "================================"
echo -e "${GREEN}✅ Migration Complete!${NC}"
echo "Files updated: $UPDATED"
echo "Files needing manual review: $MANUAL"
echo ""
echo "🔍 Property Mapping Reference:"
echo "  user.id               → session.user.id"
echo "  user.firstName        → session.user.name"
echo "  user.emailAddresses   → session.user.email"
echo "  user.imageUrl         → session.user.image"
echo "  isLoaded              → status !== 'loading'"
echo "  !user                 → status === 'unauthenticated'"
echo ""
echo "📋 Next steps:"
echo "  1. Review changes: git diff components/ app/"
echo "  2. Manually update user property access"
echo "  3. Test each component"
echo "  4. Remove backups: find . -name '*.backup' -delete"
echo ""
echo "⚠️  Files needing manual review:"
if [ $MANUAL -gt 0 ]; then
  grep -l "user\.firstName\|user\.emailAddresses\|user\.imageUrl" components/**/*.tsx app/**/*.tsx 2>/dev/null | head -n 10 || true
fi

