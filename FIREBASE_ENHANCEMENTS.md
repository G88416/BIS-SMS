# Firebase Authentication & Integration Enhancements

## Overview

This document details the comprehensive enhancements made to Firebase authentication and integration in the BIS-SMS application. These improvements significantly enhance security, user experience, and application functionality.

## Table of Contents

1. [Authentication Enhancements](#authentication-enhancements)
2. [Session Management](#session-management)
3. [Firebase Integration Utilities](#firebase-integration-utilities)
4. [Profile Management](#profile-management)
5. [Analytics Tracking](#analytics-tracking)
6. [Usage Guide](#usage-guide)
7. [Security Features](#security-features)

---

## Authentication Enhancements

### 1. Password Reset Functionality

**Location**: `index.html` (Login Page)

#### Features:
- "Forgot Password?" link on login page
- Modal dialog for password reset requests
- Email-based password reset using Firebase Auth
- Input validation and sanitization
- User-type specific email generation
- Success/error feedback with auto-close

#### Usage:
```javascript
// Users can click "Forgot Password?" link
// Enter their user type and username/ID
// System sends password reset email to registered email
```

#### Implementation Details:
- Uses Firebase `sendPasswordResetEmail()` function
- Maps user type + ID to email format (e.g., `teacher1@bis.local`)
- Handles common errors:
  - User not found
  - Invalid email format
  - Too many requests (rate limiting)

---

### 2. Google OAuth Sign-In

**Location**: `index.html` (Login Page)

#### Features:
- "Sign in with Google" button with branded styling
- Popup-based authentication flow
- Automatic role assignment (defaults to parent)
- Stores Google profile data (displayName, photoURL)
- Graceful error handling for blocked/cancelled popups

#### Usage:
```javascript
// Click "Sign in with Google" button
// Google popup appears for account selection
// Upon success, redirects to parent portal with Google profile
```

#### Implementation Details:
```javascript
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

window.signInWithGoogle = function() {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      // Store user data and redirect
    })
    .catch(handleError);
};
```

#### Supported Error Codes:
- `auth/popup-closed-by-user`: User cancelled sign-in
- `auth/popup-blocked`: Browser blocked popup
- Network errors and other auth failures

---

### 3. Email Verification

**Location**: `profile-settings.html`

#### Features:
- Check email verification status on profile page
- Send verification email button
- Visual status indicator (✓ Verified / ✗ Not Verified)
- One-click verification email sending
- Prevents multiple sends (button disabled after sending)

#### Usage:
```javascript
// Navigate to Profile Settings
// If email not verified, "Send Verification Email" button appears
// Click button to receive verification email
// Click link in email to verify account
```

---

### 4. Password Change

**Location**: `profile-settings.html`

#### Features:
- Secure password change form
- Requires current password for verification
- Password confirmation field
- Minimum length validation (6 characters)
- Re-authentication before password update
- Clear success/error feedback

#### Security Features:
- Requires re-authentication with current password
- Validates password strength
- Confirms new password matches
- Clears form after successful change

#### Implementation:
```javascript
// Re-authenticate user
const credential = EmailAuthProvider.credential(email, currentPassword);
await reauthenticateWithCredential(auth.currentUser, credential);

// Update password
await updatePassword(auth.currentUser, newPassword);
```

---

## Session Management

### Automatic Session Timeout

**Location**: `index.html` and `admin.html`

#### Configuration:
- **Timeout Duration**: 30 minutes of inactivity
- **Activity Tracking**: Monitors mouse, keyboard, scroll, and touch events
- **Auto-logout**: Signs out user and clears session after timeout
- **User Notification**: Shows alert before redirecting to login

#### Implementation:
```javascript
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
let sessionTimeoutId = null;

function resetSessionTimeout() {
  if (sessionTimeoutId) {
    clearTimeout(sessionTimeoutId);
  }
  
  sessionTimeoutId = setTimeout(() => {
    if (auth.currentUser) {
      signOut(auth).then(() => {
        sessionStorage.clear();
        alert('Your session has expired due to inactivity.');
        window.location.href = 'index.html';
      });
    }
  }, SESSION_TIMEOUT);
}

// Track activity
const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
activityEvents.forEach(event => {
  document.addEventListener(event, resetSessionTimeout, true);
});
```

#### Benefits:
- **Security**: Prevents unauthorized access on shared computers
- **Compliance**: Meets security requirements for automatic logout
- **User Experience**: Resets timer on any user activity
- **Flexibility**: Can be adjusted per requirements

---

## Firebase Integration Utilities

### File: `firebase-utils.js`

This utility module provides enhanced Firebase integration with error handling, caching, and offline support.

### Key Features:

#### 1. Enhanced Error Handling
```javascript
import { handleFirebaseError } from './firebase-utils.js';

try {
  await someFirestoreOperation();
} catch (error) {
  const userMessage = handleFirebaseError(error, 'Student Save');
  alert(userMessage);
}
```

**Provides user-friendly messages for:**
- Permission errors
- Network failures
- Authentication issues
- Firestore operation errors
- Storage errors

#### 2. Safe Firestore Operations

**Write with Retry:**
```javascript
import { safeFirestoreWrite } from './firebase-utils.js';

await safeFirestoreWrite(async () => {
  await setDoc(doc(db, 'students', id), data);
}, 3); // 3 retries with exponential backoff
```

**Read with Caching:**
```javascript
import { safeFirestoreRead } from './firebase-utils.js';

const students = await safeFirestoreRead(
  () => getDocs(collection(db, 'students')),
  'all-students', // cache key
  true // use cache
);
```

#### 3. Offline Support
```javascript
import { enableOfflineSupport } from './firebase-utils.js';

// Enable IndexedDB persistence for offline data access
await enableOfflineSupport();
```

**Features:**
- Automatic data sync when online
- Local cache for offline access
- Handles multi-tab scenarios
- Graceful degradation if not supported

#### 4. File Upload with Progress
```javascript
import { uploadFileWithProgress } from './firebase-utils.js';

const downloadURL = await uploadFileWithProgress(
  file,
  `documents/${fileName}`,
  (progress, snapshot) => {
    console.log(`Upload: ${progress}% complete`);
    updateProgressBar(progress);
  }
);
```

#### 5. Batch Operations
```javascript
import { batchWrite } from './firebase-utils.js';

await batchWrite([
  { type: 'set', collection: 'students', id: '1', data: { name: 'John' } },
  { type: 'update', collection: 'students', id: '2', data: { grade: 'A' } },
  { type: 'delete', collection: 'students', id: '3' }
]);
```

#### 6. Connection Monitoring
```javascript
import { monitorConnectionStatus } from './firebase-utils.js';

const cleanup = monitorConnectionStatus((isOnline) => {
  console.log(`Status: ${isOnline ? 'Online' : 'Offline'}`);
  updateUI(isOnline);
});

// Later: cleanup to remove listeners
cleanup();
```

---

## Profile Management

### File: `profile-settings.html`

A dedicated page for users to manage their account settings.

### Features:

#### 1. Account Information Display
- Email address
- Email verification status (badge)
- Last sign-in timestamp
- Display name

#### 2. Profile Update
- Update display name
- Save profile changes
- Instant feedback on success/failure

#### 3. Password Change
- Secure password change form
- Current password verification
- New password confirmation
- Minimum length validation
- Re-authentication required

#### 4. Email Verification
- Send verification email
- Visual status indicator
- One-click verification

#### 5. Security Tips
- Best practices for account security
- Password guidelines
- Safety recommendations

### Access:
Add a link in your navigation:
```html
<a href="profile-settings.html">⚙️ Profile Settings</a>
```

---

## Analytics Tracking

### Enhanced Event Tracking

**Location**: `admin.html`

#### Functions Available:

1. **Track Custom Events**
```javascript
window.trackEvent('student_added', {
  grade: '10',
  section: 'A',
  method: 'manual'
});
```

2. **Track Page Views**
```javascript
window.trackPageView('Student Management');
```

3. **Track User Actions**
```javascript
window.trackUserAction(
  'export', // action
  'reports', // category
  'grade_report', // label
  1 // value
);
```

#### Auto-tracked Parameters:
- `user_type`: admin/teacher/student/parent
- `user_id`: Current user's ID
- `timestamp`: ISO timestamp
- `page_location`: Current URL
- `page_path`: URL path with hash

#### Example Implementation:
```javascript
// Track when a student is added
function addStudent(data) {
  // Add student logic...
  
  // Track event
  window.trackEvent('student_added', {
    grade: data.grade,
    method: 'form'
  });
}

// Track when a report is generated
function generateReport(type) {
  // Generate report...
  
  window.trackUserAction('generate', 'reports', type, 1);
}
```

---

## Usage Guide

### For Developers

#### 1. Initialize Firebase Utils (Recommended)
```javascript
// In admin.html or any page using Firebase
import { initializeFirebaseUtils } from './firebase-utils.js';

// After Firebase initialization
await initializeFirebaseUtils();
```

#### 2. Use Safe Operations
```javascript
// Instead of direct Firestore calls
try {
  const data = await getDocs(collection(db, 'students'));
} catch (error) {
  console.error(error);
}

// Use safe wrappers
const data = await window.FirebaseUtils.safeFirestoreRead(
  () => getDocs(collection(db, 'students')),
  'students-list'
);
```

#### 3. Track Important Events
```javascript
// Add tracking to key user actions
function exportStudents() {
  // Export logic...
  
  window.trackUserAction('export', 'students', 'csv', students.length);
}
```

#### 4. Handle Errors Gracefully
```javascript
try {
  await saveData();
} catch (error) {
  const message = window.FirebaseUtils.handleFirebaseError(error, 'Save');
  showErrorToUser(message);
}
```

### For End Users

#### Logging In
1. **Email/Password**: Enter credentials and click Login
2. **Google Sign-In**: Click "Sign in with Google" button
3. **Forgot Password**: Click "Forgot Password?" to reset

#### Managing Profile
1. Access Profile Settings from navigation menu
2. Update display name as needed
3. Change password regularly (requires current password)
4. Verify email if not already verified

#### Session Security
- System auto-logs out after 30 minutes of inactivity
- Activity resets timeout automatically
- Always log out when using shared computers

---

## Security Features

### Implemented Security Measures:

1. **Session Timeout**: 30-minute inactivity auto-logout
2. **Password Reset**: Secure email-based password recovery
3. **Email Verification**: Optional email verification for accounts
4. **Re-authentication**: Required for sensitive operations (password change)
5. **Input Sanitization**: All inputs validated and sanitized
6. **Error Handling**: Generic error messages prevent information disclosure
7. **Rate Limiting**: Firebase handles auth attempt rate limiting
8. **Offline Support**: Secure local caching with encryption
9. **Session Storage**: Temporary storage cleared on logout

### Best Practices:

#### For Administrators:
- Enable email verification for all new accounts
- Review Firebase security rules regularly
- Monitor authentication logs in Firebase Console
- Set up alerts for suspicious activity
- Regularly update Firebase SDK versions

#### For Users:
- Use strong, unique passwords (minimum 6 characters)
- Verify email address immediately after registration
- Change password regularly
- Log out from shared computers
- Don't share credentials with anyone

### Firebase Console Security Settings:

1. **Email/Password Sign-In**: Enabled
2. **Google OAuth**: Enabled (configure in Firebase Console)
3. **Email Verification**: Optional (can be enforced)
4. **Password Strength**: Firebase default (6+ characters)
5. **Rate Limiting**: Automatic (100 requests per 15 minutes)

---

## Configuration

### Firebase Config

Current configuration in `index.html` and `admin.html`:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBsUOSF5eENLCq_4fH9lLx_WIVUa6QDeBE",
  authDomain: "bis-management-system-d77f4.firebaseapp.com",
  projectId: "bis-management-system-d77f4",
  storageBucket: "bis-management-system-d77f4.firebasestorage.app",
  messagingSenderId: "724917351295",
  appId: "1:724917351295:web:d87a2da7979babda08e04a",
  measurementId: "G-NQKBSS701Y"
};
```

### Session Timeout Configuration

To change session timeout duration:
```javascript
// Default: 30 minutes
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Change to 1 hour
const SESSION_TIMEOUT = 60 * 60 * 1000;

// Change to 15 minutes
const SESSION_TIMEOUT = 15 * 60 * 1000;
```

### Cache Duration Configuration

To change cache duration in `firebase-utils.js`:
```javascript
// Default: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// Change as needed
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
```

---

## Troubleshooting

### Common Issues:

#### 1. Google Sign-In Not Working
- **Check**: Google OAuth is enabled in Firebase Console
- **Check**: Authorized domains include your hosting domain
- **Check**: Pop-ups are not blocked in browser
- **Solution**: Add your domain to Firebase Console → Authentication → Sign-in method → Authorized domains

#### 2. Password Reset Email Not Received
- **Check**: Email is correctly registered
- **Check**: Spam/junk folder
- **Check**: Email template configured in Firebase Console
- **Solution**: Use valid email addresses during development

#### 3. Session Timeout Not Working
- **Check**: JavaScript console for errors
- **Check**: Browser doesn't block timeouts
- **Debug**: Add console.log in resetSessionTimeout() function

#### 4. Offline Support Not Enabling
- **Issue**: Multi-tab warning
- **Solution**: Close other tabs or accept degraded offline support
- **Note**: Offline persistence only works in one tab at a time

#### 5. Analytics Events Not Showing
- **Check**: Analytics is properly initialized
- **Check**: Measurement ID is correct
- **Wait**: Events can take 24-48 hours to appear in Firebase Console
- **Debug**: Check browser console for analytics errors

---

## Future Enhancements

### Planned Features:

1. **Multi-Factor Authentication (MFA)**
   - SMS-based verification
   - Authenticator app support
   - Backup codes

2. **Custom Claims for Roles**
   - Move role checking from Firestore to Auth tokens
   - Improve performance and security
   - Requires Cloud Functions

3. **Firebase App Check**
   - Prevent unauthorized API access
   - Requires reCAPTCHA configuration

4. **Social Login Extensions**
   - Microsoft/Azure AD for enterprise
   - Facebook login
   - Apple Sign-In

5. **Advanced Analytics**
   - Custom dashboards
   - User behavior tracking
   - Performance monitoring

6. **Improved Offline Support**
   - Better conflict resolution
   - Selective sync
   - Background sync

---

## Support

For questions or issues related to Firebase integration:

1. Check this documentation first
2. Review [FIREBASE_INTEGRATION.md](FIREBASE_INTEGRATION.md)
3. Check [SECURITY_FIXES.md](SECURITY_FIXES.md)
4. Consult [Firebase Documentation](https://firebase.google.com/docs)
5. Open an issue in the repository

---

## Version History

### v2.0.0 (Current)
- ✅ Added password reset functionality
- ✅ Added Google OAuth sign-in
- ✅ Implemented session timeout (30 minutes)
- ✅ Created Firebase utilities module
- ✅ Added profile settings page
- ✅ Implemented email verification
- ✅ Added password change functionality
- ✅ Enhanced analytics tracking
- ✅ Added offline support
- ✅ Improved error handling

### v1.1.0
- ✅ Basic Firebase Authentication (email/password)
- ✅ Firestore integration
- ✅ Firebase Storage integration
- ✅ Security rules implementation
- ✅ Basic session management

---

## License

This project is part of the Bophelong Independent School system.

---

**Last Updated**: January 2026
**Author**: BIS Development Team
