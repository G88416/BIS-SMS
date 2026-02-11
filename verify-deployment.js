#!/usr/bin/env node

/**
 * Deployment Verification Script for BIS-SMS
 * 
 * This script helps verify that Firebase security rules are properly deployed
 * and provides guidance on fixing the "Missing or insufficient permissions" error.
 * 
 * Usage:
 *   node verify-deployment.js
 */

const fs = require('fs');
const path = require('path');

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║  BIS-SMS Deployment Verification Tool                        ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

let hasErrors = false;

// Check if firestore.rules exists
console.log('📋 Checking Firestore Security Rules...');
const rulesPath = path.join(__dirname, 'firestore.rules');

if (!fs.existsSync(rulesPath)) {
  console.error('❌ ERROR: firestore.rules file not found!');
  hasErrors = true;
} else {
  console.log('✅ firestore.rules file found');
  
  // Read and verify the rules contain the fix
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');
  
  // Check for the user creation fix
  const hasUserCreateFix = rulesContent.includes('isOwner(userId)') && 
                           rulesContent.includes('!exists(/databases/$(database)/documents/users/$(userId))');
  
  if (hasUserCreateFix) {
    console.log('✅ User self-creation rule is present in firestore.rules');
  } else {
    console.error('❌ ERROR: User self-creation rule NOT FOUND in firestore.rules');
    console.error('   Expected rule: allow create: if isAdmin() || (isAuthenticated() && isOwner(userId) && !exists(...))');
    hasErrors = true;
  }
}

// Check if admin.html has secondary auth
console.log('\n📋 Checking Secondary Auth Implementation...');
const adminPath = path.join(__dirname, 'admin.html');

if (!fs.existsSync(adminPath)) {
  console.error('❌ ERROR: admin.html file not found!');
  hasErrors = true;
} else {
  console.log('✅ admin.html file found');
  
  const adminContent = fs.readFileSync(adminPath, 'utf8');
  
  // Check for secondary app
  const hasSecondaryApp = adminContent.includes('SecondaryApp') && 
                         adminContent.includes('secondaryAuth');
  
  if (hasSecondaryApp) {
    console.log('✅ Secondary Firebase app is configured in admin.html');
  } else {
    console.error('❌ ERROR: Secondary Firebase app NOT FOUND in admin.html');
    console.error('   The admin.html should initialize a secondary Firebase app for user creation');
    hasErrors = true;
  }
  
  // Check for improved error handling
  const hasImprovedErrors = adminContent.includes('permission-denied') || 
                           adminContent.includes('insufficient permissions');
  
  if (hasImprovedErrors) {
    console.log('✅ Improved error handling is present in admin.html');
  } else {
    console.warn('⚠️  WARNING: Enhanced error handling might not be present');
    console.warn('   Consider adding specific handling for permission-denied errors');
  }
}

// Check if firebase.json exists
console.log('\n📋 Checking Firebase Configuration...');
const firebaseConfigPath = path.join(__dirname, 'firebase.json');

if (!fs.existsSync(firebaseConfigPath)) {
  console.warn('⚠️  WARNING: firebase.json not found');
  console.warn('   You may need to initialize Firebase in this project');
} else {
  console.log('✅ firebase.json file found');
  
  const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
  
  if (firebaseConfig.firestore && firebaseConfig.firestore.rules) {
    console.log('✅ Firestore rules are configured in firebase.json');
    console.log(`   Rules file: ${firebaseConfig.firestore.rules}`);
  } else {
    console.warn('⚠️  WARNING: Firestore rules not configured in firebase.json');
  }
}

// Final summary
console.log('\n' + '═'.repeat(65));
console.log('📊 VERIFICATION SUMMARY');
console.log('═'.repeat(65));

if (hasErrors) {
  console.log('\n❌ VERIFICATION FAILED');
  console.log('\nYour codebase has issues that need to be fixed before deployment.');
  console.log('Please review the errors above and fix them.');
  process.exit(1);
} else {
  console.log('\n✅ LOCAL CODE VERIFICATION PASSED');
  console.log('\nYour local codebase appears to be correctly configured.');
  console.log('\n🚀 NEXT STEPS TO FIX "Missing or insufficient permissions":');
  console.log('\n1️⃣  Deploy Firestore Security Rules:');
  console.log('   → Run: firebase deploy --only firestore:rules');
  console.log('\n2️⃣  Test User Creation:');
  console.log('   → Log in as admin');
  console.log('   → Try creating a new test user');
  console.log('   → Verify the user profile is created in Firestore');
  console.log('\n3️⃣  Verify Rules in Firebase Console:');
  console.log('   → Go to Firebase Console → Firestore Database → Rules');
  console.log('   → Confirm the rules match your local firestore.rules file');
  console.log('   → Check the "Published" timestamp to ensure rules are current');
  console.log('\n📚 For more information, see:');
  console.log('   - DEPLOYMENT_GUIDE.md');
  console.log('   - FIX_PROFILE_CREATION_ISSUE.md');
  console.log('   - PROFILE_CREATION_FIX_SUMMARY.md');
  console.log('\n' + '═'.repeat(65));
  console.log('Need help? Check the documentation files listed above! 📖');
  console.log('═'.repeat(65) + '\n');
  process.exit(0);
}
