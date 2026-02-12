#!/bin/bash

###############################################################################
# Firebase Rules Deployment Script for BIS-SMS
# 
# This script automates the deployment of Firebase security rules with
# proper validation and error handling.
#
# Usage:
#   ./deploy-firebase-rules.sh [options]
#
# Options:
#   --dry-run    Validate rules without deploying
#   --verify     Run verification script first
#   --help       Show this help message
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo ""
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Firebase Rules Deployment Script - BIS-SMS                  ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

show_help() {
    echo "Firebase Rules Deployment Script"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --dry-run    Validate rules syntax without deploying"
    echo "  --verify     Run local code verification first"
    echo "  --help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Deploy rules normally"
    echo "  $0 --verify           # Verify code then deploy"
    echo "  $0 --dry-run          # Test deployment without actually deploying"
    exit 0
}

# Parse arguments
DRY_RUN=false
RUN_VERIFY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --verify)
            RUN_VERIFY=true
            shift
            ;;
        --help)
            show_help
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

print_header

# Step 1: Check if Firebase CLI is installed
print_info "Checking Firebase CLI installation..."
if ! command -v firebase &> /dev/null; then
    print_error "Firebase CLI is not installed!"
    echo ""
    echo "Install it with:"
    echo "  npm install -g firebase-tools"
    exit 1
fi
print_success "Firebase CLI is installed ($(firebase --version))"

# Step 2: Check if user is logged in
print_info "Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    print_error "Not authenticated with Firebase!"
    echo ""
    echo "Please log in with:"
    echo "  firebase login"
    exit 1
fi
print_success "Authenticated with Firebase"

# Step 3: Verify project is configured
print_info "Checking Firebase project configuration..."
if [ ! -f .firebaserc ]; then
    print_error ".firebaserc not found!"
    echo ""
    echo "Initialize Firebase with:"
    echo "  firebase init"
    exit 1
fi

PROJECT_ID=$(firebase use 2>&1 | grep -oP '(?<=\().*?(?=\))' || echo "unknown")
print_success "Using Firebase project: $PROJECT_ID"

# Step 4: Run verification script if requested
if [ "$RUN_VERIFY" = true ]; then
    print_info "Running local verification script..."
    if [ -f verify-deployment.js ]; then
        if node verify-deployment.js; then
            print_success "Local verification passed"
        else
            print_error "Local verification failed!"
            echo ""
            echo "Please fix the issues reported above before deploying."
            exit 1
        fi
    else
        print_warning "verify-deployment.js not found, skipping verification"
    fi
fi

# Step 5: Check if firestore.rules exists
print_info "Checking for firestore.rules file..."
if [ ! -f firestore.rules ]; then
    print_error "firestore.rules file not found!"
    exit 1
fi
print_success "firestore.rules file found"

# Step 6: Validate rules syntax (dry-run)
print_info "Validating Firestore rules syntax..."
if firebase deploy --only firestore:rules --dry-run 2>&1 | grep -q "Error"; then
    print_error "Rules validation failed!"
    echo ""
    echo "There are syntax errors in your firestore.rules file."
    echo "Please fix them and try again."
    exit 1
fi
print_success "Rules syntax is valid"

# Step 7: Deploy (or exit if dry-run)
if [ "$DRY_RUN" = true ]; then
    print_info "Dry-run mode: Skipping actual deployment"
    echo ""
    print_success "Validation completed successfully!"
    echo ""
    print_info "To deploy for real, run without --dry-run flag"
    exit 0
fi

# Step 8: Actual deployment
echo ""
print_info "Deploying Firestore rules to $PROJECT_ID..."
echo ""

if firebase deploy --only firestore:rules; then
    echo ""
    print_success "Rules deployed successfully!"
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    print_success "DEPLOYMENT COMPLETE!"
    echo ""
    echo "Next steps:"
    echo ""
    echo "1. Verify deployment in Firebase Console:"
    echo "   https://console.firebase.google.com/project/$PROJECT_ID/firestore/rules"
    echo ""
    echo "2. Test user creation:"
    echo "   - Log in as admin"
    echo "   - Try creating a new test user"
    echo "   - Verify success"
    echo ""
    echo "3. Check Firestore Console:"
    echo "   - Verify user profile document is created"
    echo "   - Confirm the 'Published' timestamp is current"
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    exit 0
else
    echo ""
    print_error "Deployment failed!"
    echo ""
    echo "Common issues:"
    echo "- Insufficient permissions in Firebase project"
    echo "- Network connectivity issues"
    echo "- Wrong project selected"
    echo ""
    echo "Try:"
    echo "  firebase projects:list    # Check available projects"
    echo "  firebase use <project-id> # Switch to correct project"
    echo "  firebase login            # Re-authenticate if needed"
    exit 1
fi
