#!/bin/bash

###############################################################################
# CI/CD Deployment Check for Firebase Rules
# 
# This script is designed to run in CI/CD pipelines to verify that Firebase
# security rules are correctly configured before merging or deploying.
#
# Exit Codes:
#   0 - All checks passed
#   1 - One or more checks failed
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "═══════════════════════════════════════════════════════════════"
echo "  CI/CD: Firebase Rules Deployment Check"
echo "═══════════════════════════════════════════════════════════════"
echo ""

FAILED=0

# Check 1: Verify verify-deployment.js exists
echo "📋 Check 1: Verification script exists..."
if [ -f "verify-deployment.js" ]; then
    echo -e "${GREEN}✅ verify-deployment.js found${NC}"
else
    echo -e "${RED}❌ verify-deployment.js not found${NC}"
    FAILED=1
fi

# Check 2: Run verification script
echo ""
echo "📋 Check 2: Running verification script..."
if node verify-deployment.js > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Local verification passed${NC}"
else
    echo -e "${RED}❌ Local verification failed${NC}"
    echo ""
    echo "Running verification script with output:"
    node verify-deployment.js
    FAILED=1
fi

# Check 3: Verify deployment script exists and is executable
echo ""
echo "📋 Check 3: Deployment script exists..."
if [ -f "deploy-firebase-rules.sh" ]; then
    if [ -x "deploy-firebase-rules.sh" ]; then
        echo -e "${GREEN}✅ deploy-firebase-rules.sh found and executable${NC}"
    else
        echo -e "${YELLOW}⚠️  deploy-firebase-rules.sh found but not executable${NC}"
        echo "   Run: chmod +x deploy-firebase-rules.sh"
    fi
else
    echo -e "${RED}❌ deploy-firebase-rules.sh not found${NC}"
    FAILED=1
fi

# Check 4: Verify firestore.rules syntax
echo ""
echo "📋 Check 4: Checking firestore.rules syntax..."
if [ -f "firestore.rules" ]; then
    # Basic syntax check - look for common issues
    if grep -q "rules_version = '2';" firestore.rules && \
       grep -q "service cloud.firestore" firestore.rules && \
       grep -q "match /databases/{database}/documents" firestore.rules; then
        echo -e "${GREEN}✅ firestore.rules basic structure is valid${NC}"
    else
        echo -e "${RED}❌ firestore.rules structure appears invalid${NC}"
        FAILED=1
    fi
else
    echo -e "${RED}❌ firestore.rules not found${NC}"
    FAILED=1
fi

# Check 5: Verify firebase.json configuration
echo ""
echo "📋 Check 5: Checking firebase.json configuration..."
if [ -f "firebase.json" ]; then
    if grep -q '"firestore"' firebase.json && grep -q '"rules"' firebase.json; then
        echo -e "${GREEN}✅ firebase.json Firestore configuration found${NC}"
    else
        echo -e "${RED}❌ firebase.json missing Firestore configuration${NC}"
        FAILED=1
    fi
else
    echo -e "${RED}❌ firebase.json not found${NC}"
    FAILED=1
fi

# Check 6: Verify user self-creation rule is present
echo ""
echo "📋 Check 6: Verifying user self-creation fix..."
if grep -q "isOwner(userId)" firestore.rules && \
   grep -q '!exists(/databases/$(database)/documents/users/$(userId))' firestore.rules; then
    echo -e "${GREEN}✅ User self-creation rule is present${NC}"
else
    echo -e "${RED}❌ User self-creation rule NOT FOUND${NC}"
    echo "   The fix for 'Missing or insufficient permissions' is not applied"
    FAILED=1
fi

# Check 7: Verify secondary auth in admin.html
echo ""
echo "📋 Check 7: Verifying secondary Firebase app..."
if [ -f "admin.html" ]; then
    if grep -q "SecondaryApp" admin.html && grep -q "secondaryAuth" admin.html; then
        echo -e "${GREEN}✅ Secondary Firebase app is configured${NC}"
    else
        echo -e "${RED}❌ Secondary Firebase app NOT FOUND in admin.html${NC}"
        FAILED=1
    fi
else
    echo -e "${YELLOW}⚠️  admin.html not found (might be expected)${NC}"
fi

# Check 8: Verify documentation exists
echo ""
echo "📋 Check 8: Verifying documentation..."
DOCS=("DEPLOYMENT_GUIDE.md" "FIX_USER_CREATION_PERMISSIONS.md" "QUICK_DEPLOYMENT_REFERENCE.md")
for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✅ $doc found${NC}"
    else
        echo -e "${YELLOW}⚠️  $doc not found${NC}"
    fi
done

# Check 9: Verify .firebaserc exists
echo ""
echo "📋 Check 9: Verifying Firebase project configuration..."
if [ -f ".firebaserc" ]; then
    echo -e "${GREEN}✅ .firebaserc found${NC}"
    if grep -q "bis-management-system-d77f4" .firebaserc; then
        echo -e "${GREEN}✅ Correct Firebase project configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Firebase project ID might be different${NC}"
    fi
else
    echo -e "${RED}❌ .firebaserc not found${NC}"
    FAILED=1
fi

# Summary
echo ""
echo "═══════════════════════════════════════════════════════════════"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED${NC}"
    echo ""
    echo "The Firebase security rules and deployment scripts are correctly"
    echo "configured. The code is ready for deployment."
    echo ""
    echo "To deploy: firebase deploy --only firestore:rules"
    echo "Or use:    ./deploy-firebase-rules.sh --verify"
    echo "═══════════════════════════════════════════════════════════════"
    exit 0
else
    echo -e "${RED}❌ SOME CHECKS FAILED${NC}"
    echo ""
    echo "Please fix the issues above before deploying."
    echo "See DEPLOYMENT_GUIDE.md for more information."
    echo "═══════════════════════════════════════════════════════════════"
    exit 1
fi
