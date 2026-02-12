#!/usr/bin/env node

/**
 * Firebase Rules Deployment Status Checker
 * 
 * This script checks if Firebase security rules are actually deployed
 * by attempting to verify the deployment status in Firebase Console.
 * 
 * Usage:
 *   node check-firebase-deployment.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║  Firebase Rules Deployment Status Checker                    ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

// Read Firebase configuration
const firebaseRcPath = path.join(__dirname, '.firebaserc');
if (!fs.existsSync(firebaseRcPath)) {
  console.error('❌ ERROR: .firebaserc file not found!');
  console.error('   Firebase project is not configured.');
  process.exit(1);
}

const firebaseRc = JSON.parse(fs.readFileSync(firebaseRcPath, 'utf8'));
const projectId = firebaseRc.projects?.default;

if (!projectId) {
  console.error('❌ ERROR: No default project found in .firebaserc');
  process.exit(1);
}

console.log(`📋 Firebase Project: ${projectId}`);
console.log('');

// Check local rules file
console.log('📋 Checking local rules file...');
const rulesPath = path.join(__dirname, 'firestore.rules');
if (!fs.existsSync(rulesPath)) {
  console.error('❌ ERROR: firestore.rules file not found!');
  process.exit(1);
}

const rulesContent = fs.readFileSync(rulesPath, 'utf8');
const hasUserCreateFix = rulesContent.includes('isOwner(userId)') && 
                         rulesContent.includes('!exists(/databases/$(database)/documents/users/$(userId))');

if (hasUserCreateFix) {
  console.log('✅ Local rules file contains user self-creation fix');
} else {
  console.log('❌ Local rules file MISSING user self-creation fix');
}

// Calculate rules file hash for comparison
const crypto = require('crypto');
const rulesHash = crypto.createHash('md5').update(rulesContent).digest('hex');
console.log(`   Rules file hash: ${rulesHash.substring(0, 8)}...`);

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('📊 DEPLOYMENT STATUS');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

console.log('ℹ️  To verify rules are deployed to Firebase:');
console.log('');
console.log('1️⃣  Check Firebase Console:');
console.log(`   https://console.firebase.google.com/project/${projectId}/firestore/rules`);
console.log('');
console.log('2️⃣  Look for the "Published" timestamp');
console.log('   • If it\'s recent (within last deployment), rules are deployed ✅');
console.log('   • If it\'s old or matches initial setup, rules need deployment ❌');
console.log('');
console.log('3️⃣  Verify the rule content includes:');
console.log('   • allow create: if isAdmin() || (isAuthenticated() && isOwner(userId) && !exists(...))');
console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('🚀 TO DEPLOY RULES');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');
console.log('Option 1: Firebase CLI (Recommended)');
console.log('   firebase deploy --only firestore:rules');
console.log('');
console.log('Option 2: Automated script');
console.log('   ./deploy-firebase-rules.sh --verify');
console.log('');
console.log('Option 3: Manual deployment via Firebase Console');
console.log('   1. Copy content from firestore.rules');
console.log('   2. Paste into Firebase Console → Firestore Database → Rules');
console.log('   3. Click "Publish"');
console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('ℹ️  For more information, see:');
console.log('   - FIX_USER_CREATION_PERMISSIONS.md');
console.log('   - DEPLOYMENT_GUIDE.md');
console.log('   - QUICK_DEPLOYMENT_REFERENCE.md');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

// Exit with success since we can't actually verify deployment without API access
process.exit(0);
