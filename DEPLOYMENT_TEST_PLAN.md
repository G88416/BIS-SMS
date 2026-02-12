# Firebase Rules Deployment Test Plan

## Overview
This document provides a comprehensive test plan to verify that the Firebase security rules deployment fixes the "Missing or insufficient permissions" issue.

## Pre-Deployment Tests

### 1. Local Code Verification
**Script:** `node verify-deployment.js`

**Expected Output:**
```
✅ LOCAL CODE VERIFICATION PASSED
```

**Checks:**
- ✅ firestore.rules file exists
- ✅ User self-creation rule is present
- ✅ Secondary Firebase app is configured
- ✅ Improved error handling present
- ✅ firebase.json is configured

### 2. Rules Syntax Validation
**Command:** `firebase deploy --only firestore:rules --dry-run`

**Expected Output:**
```
✔  Deploy complete!
```

**Checks:**
- ✅ No syntax errors in firestore.rules
- ✅ All rule functions are properly defined
- ✅ No undefined variables or functions

## Deployment Tests

### 3. Automated Deployment Test
**Command:** `./deploy-firebase-rules.sh --verify`

**Expected Steps:**
1. ✅ Firebase CLI is installed
2. ✅ Authenticated with Firebase
3. ✅ Correct project selected
4. ✅ Local verification passes
5. ✅ Rules syntax validation passes
6. ✅ Rules deployed successfully

**Success Criteria:**
- Deployment completes without errors
- Console shows "✅ Rules deployed successfully!"
- Firebase Console shows updated timestamp

### 4. Manual Deployment Test
**Command:** `firebase deploy --only firestore:rules`

**Expected Output:**
```
=== Deploying to 'bis-management-system-d77f4'...

i  deploying firestore
i  firestore: checking firestore.rules for compilation errors...
✔  firestore: rules file firestore.rules compiled successfully
i  firestore: uploading rules firestore.rules...
✔  firestore: released rules firestore.rules to cloud.firestore

✔  Deploy complete!
```

**Success Criteria:**
- No compilation errors
- Rules uploaded successfully
- Deploy completes successfully

## Post-Deployment Verification

### 5. Firebase Console Verification
**URL:** https://console.firebase.google.com/project/bis-management-system-d77f4/firestore/rules

**Checks:**
- [ ] Rules tab shows recent "Published" timestamp (within last few minutes)
- [ ] Rules content matches local firestore.rules file
- [ ] User creation rule is present:
  ```javascript
  allow create: if isAdmin() || 
                   (isAuthenticated() && 
                    isOwner(userId) && 
                    !exists(/databases/$(database)/documents/users/$(userId)));
  ```

### 6. Application Testing

#### Test Case 1: Admin User Creation (New User)
**Steps:**
1. Open application in browser
2. Log in as admin (admin@bis.local)
3. Navigate to User Management section
4. Click "Add User" or "Create New User"
5. Fill in user details:
   - Email: test-user-001@example.com
   - Password: TestPass123!
   - Role: student
   - Name: Test User 001
6. Click "Save" or "Create User"

**Expected Results:**
- ✅ Success message appears
- ✅ User created in Firebase Authentication
- ✅ User profile document created in Firestore
- ✅ Admin remains logged in (not signed out)
- ✅ No "Missing or insufficient permissions" error

**Verification:**
```
Firebase Console → Authentication → Users
→ Should see test-user-001@example.com

Firebase Console → Firestore → users collection
→ Should see document with UID matching the user
→ Document should contain: email, role, userId, createdAt
```

#### Test Case 2: Admin User Creation (Multiple Users)
**Steps:**
1. As admin, create 3 users in succession:
   - test-teacher@example.com (role: teacher)
   - test-student@example.com (role: student)
   - test-parent@example.com (role: parent)

**Expected Results:**
- ✅ All 3 users created successfully
- ✅ All 3 profiles exist in Firestore
- ✅ Admin remains logged in throughout
- ✅ No permission errors

#### Test Case 3: New User Login
**Steps:**
1. Log out as admin
2. Log in as newly created user (test-user-001@example.com)
3. Verify redirect to appropriate portal

**Expected Results:**
- ✅ Login successful
- ✅ User redirected to student portal
- ✅ Can view profile and data
- ✅ No permission errors

#### Test Case 4: Security - User Cannot Create Other Profiles
**Steps:**
1. Log in as test-user-001@example.com
2. Open browser console (F12)
3. Try to create profile for different user:
   ```javascript
   // This should fail
   firebase.firestore().collection('users').doc('different-user-id').set({
     email: 'hacker@example.com',
     role: 'admin',
     userId: 'different-user-id'
   });
   ```

**Expected Results:**
- ✅ Operation fails with permission denied error
- ✅ Cannot create profile for different UID
- ✅ Security rules working correctly

#### Test Case 5: Security - User Cannot Overwrite Existing Profile
**Steps:**
1. Log in as test-user-001@example.com
2. Open browser console (F12)
3. Try to create their own profile again:
   ```javascript
   // This should fail because profile already exists
   const user = firebase.auth().currentUser;
   firebase.firestore().collection('users').doc(user.uid).set({
     email: 'changed@example.com',
     role: 'admin',
     userId: user.uid
   });
   ```

**Expected Results:**
- ✅ Operation fails with permission denied error
- ✅ Cannot overwrite existing profile during "create"
- ✅ Security rules prevent profile hijacking

#### Test Case 6: Existing User Profile Update
**Steps:**
1. Log in as test-user-001@example.com
2. Navigate to profile settings
3. Update profile information (name, phone, etc.)
4. Save changes

**Expected Results:**
- ✅ Profile update successful
- ✅ Changes reflected in Firestore
- ✅ No permission errors

### 7. Browser Cache Test
**Steps:**
1. Deploy rules
2. Test user creation (should work)
3. Close browser completely
4. Open browser again
5. Test user creation again

**Expected Results:**
- ✅ User creation works after browser restart
- ✅ No caching issues
- ✅ Rules applied consistently

### 8. Multiple Browser Test
**Steps:**
1. Test in Chrome
2. Test in Firefox
3. Test in Safari (if available)
4. Test in Edge

**Expected Results:**
- ✅ Works in all browsers
- ✅ Consistent behavior
- ✅ No browser-specific issues

## Regression Tests

### 9. Verify Existing Features Still Work
**Test Cases:**
- [ ] Admin can view all users
- [ ] Admin can update user profiles
- [ ] Admin can delete users
- [ ] Teachers can view their classes
- [ ] Students can view their grades
- [ ] Parents can view their children's data
- [ ] All role-based permissions work correctly

### 10. Performance Test
**Steps:**
1. Create 10 users in quick succession
2. Monitor Firebase Console for errors
3. Check application performance

**Expected Results:**
- ✅ All users created successfully
- ✅ No throttling or rate limiting errors
- ✅ Acceptable performance (< 2 seconds per user)

## Rollback Test

### 11. Rules Rollback Test
**Steps:**
1. In Firebase Console → Firestore → Rules
2. Click "Rules history" tab
3. Select previous version
4. Click "Restore"
5. Test user creation (should fail with old error)
6. Restore latest version again
7. Test user creation (should work)

**Expected Results:**
- ✅ Can successfully rollback rules
- ✅ Can restore latest rules
- ✅ Behavior changes as expected with rule versions

## Edge Cases

### 12. User Created Before Rules Deployment
**Scenario:** User exists in Authentication but not in Firestore

**Steps:**
1. Find user in Authentication without profile
2. Log in as that user
3. Check for graceful error handling

**Options to Fix:**
- Delete user from Authentication and recreate
- Manually create profile in Firestore Console
- Use admin to create profile (if implemented)

### 13. Network Interruption During User Creation
**Steps:**
1. Start user creation
2. Disconnect network before completion
3. Reconnect network
4. Verify cleanup

**Expected Results:**
- ✅ Graceful error handling
- ✅ No orphaned Authentication users
- ✅ Clear error message to user

### 14. Concurrent User Creation
**Steps:**
1. Open 2 browser windows as admin
2. Create users simultaneously from both windows

**Expected Results:**
- ✅ Both users created successfully
- ✅ No race conditions
- ✅ No conflicts

## Documentation Verification

### 15. Documentation Accuracy
**Check:**
- [ ] README.md has deployment instructions
- [ ] DEPLOYMENT_GUIDE.md is accurate and complete
- [ ] QUICK_DEPLOYMENT_REFERENCE.md is up to date
- [ ] FIX_USER_CREATION_PERMISSIONS.md explains issue correctly
- [ ] All code examples in docs work correctly

## Test Results Template

Use this template to record test results:

```
Date: _____________
Tester: _____________
Firebase Project: bis-management-system-d77f4
Environment: Production / Staging / Development

Pre-Deployment Tests:
[ ] Local Code Verification
[ ] Rules Syntax Validation

Deployment Tests:
[ ] Automated Deployment
[ ] Manual Deployment

Post-Deployment Verification:
[ ] Firebase Console Verification
[ ] Test Case 1: Admin User Creation
[ ] Test Case 2: Multiple User Creation
[ ] Test Case 3: New User Login
[ ] Test Case 4: Security - Cannot Create Other Profiles
[ ] Test Case 5: Security - Cannot Overwrite Profile
[ ] Test Case 6: Profile Update
[ ] Test Case 7: Browser Cache
[ ] Test Case 8: Multiple Browsers

Regression Tests:
[ ] Existing Features
[ ] Performance Test

Edge Cases:
[ ] User Before Deployment
[ ] Network Interruption
[ ] Concurrent Creation

Overall Result: PASS / FAIL
Issues Found: _____________
Notes: _____________
```

## Success Criteria Summary

The deployment is considered successful when:

1. ✅ All pre-deployment checks pass
2. ✅ Deployment completes without errors
3. ✅ Admin can create users without permission errors
4. ✅ User profiles are created in Firestore automatically
5. ✅ Admin remains logged in during user creation
6. ✅ New users can log in successfully
7. ✅ Security rules prevent unauthorized profile creation
8. ✅ All existing features continue to work
9. ✅ No regression issues found
10. ✅ Documentation is accurate

## Troubleshooting During Testing

If tests fail:

1. **Check Firebase Console Rules Tab**
   - Verify rules are deployed
   - Check "Published" timestamp

2. **Clear Browser Cache**
   - Hard refresh: Ctrl+Shift+R

3. **Verify Firebase Project**
   - Run: `firebase use`
   - Should show: bis-management-system-d77f4

4. **Check Browser Console**
   - Look for specific error messages
   - Check network tab for failed requests

5. **Re-deploy Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

## Contact & Support

If tests fail consistently:
- Review DEPLOYMENT_GUIDE.md troubleshooting section
- Check Firebase Console logs
- Verify all prerequisites are met
- Contact Firebase support if needed

---

**Document Version:** 1.0  
**Last Updated:** February 2026  
**Maintained By:** BIS-SMS Development Team
