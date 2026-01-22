# Cloud Sync Testing Guide for Choptso Messaging

This guide provides step-by-step instructions for testing the new cloud storage functionality in the Choptso messaging system.

## Prerequisites

Before testing, ensure you have:
1. Firebase project configured with Firestore and Storage enabled
2. User accounts created in Firebase Auth with `.local` domain emails:
   - Admin: `admin@bis.local`
   - Teacher: `teacher1@bis.local`, `teacher2@bis.local`
   - Parent: `parent.c331@bis.local`
3. Users registered in Firestore `users` collection with proper role attributes
4. Two separate browser instances or incognito windows for multi-user testing

## Test Scenarios

### Test 1: Teacher Portal Contact Loading (Cloud Storage)

**Objective**: Verify teachers can load contacts from Firestore

**Steps**:
1. Log in as a teacher (e.g., teacher1@bis.local / teacher123)
2. Navigate to the Teacher Portal
3. Open the Choptso messaging section
4. Verify "Cloud Sync" indicator is visible in the header
5. Verify contacts list loads with:
   - Other teachers
   - Parents
   - Students
6. Verify no console errors

**Expected Result**: Contacts loaded from Firestore, displayed with names and roles

**Fallback Test**: Disconnect internet, verify contacts load from localStorage as fallback

---

### Test 2: Parent Portal Contact Loading (Cloud Storage)

**Objective**: Verify parents can load contacts from Firestore

**Steps**:
1. Log in as a parent (parent.c331@bis.local / parent321)
2. Navigate to the Parent Portal
3. Open the Choptso messaging section
4. Verify "Cloud Sync" indicator is visible in the header
5. Verify contacts list loads with:
   - Teachers
   - Other parents
6. Verify no console errors

**Expected Result**: Contacts loaded from Firestore, displayed with names

**Fallback Test**: Disconnect internet, verify contacts load from localStorage as fallback

---

### Test 3: Real-time Message Sync (Teacher to Parent)

**Objective**: Verify messages sync in real-time between Teacher and Parent portals

**Setup**: Use two browser windows:
- Window 1: Teacher logged in
- Window 2: Parent logged in

**Steps**:
1. In Teacher window: Select parent contact from list
2. In Teacher window: Send a test message "Hello from Teacher Portal"
3. In Parent window: Select teacher contact from list
4. Verify message appears in Parent window within 1-2 seconds
5. In Parent window: Send reply "Hello from Parent Portal"
6. Verify reply appears in Teacher window within 1-2 seconds

**Expected Result**: Messages sync instantly with no page refresh needed

---

### Test 4: File Attachment Upload (Cloud Storage)

**Objective**: Verify file attachments upload to Firebase Storage

**Steps**:
1. Log in as a teacher
2. Select a parent contact
3. Click attach file button
4. Select a small image file (< 1MB)
5. Verify preview appears
6. Send the message
7. Verify attachment appears in the message
8. Click on attachment link
9. Verify it opens the file from Firebase Storage URL

**Expected Result**: 
- File uploads successfully to `choptso/{userId}/{timestamp}_{filename}`
- Attachment displays correctly in message
- Attachment opens from cloud URL

---

### Test 5: Message Persistence (Multi-Device)

**Objective**: Verify messages persist in cloud and are accessible from different devices

**Steps**:
1. In Browser 1: Log in as teacher1, send message to parent
2. Log out from Browser 1
3. In Browser 2: Log in as teacher1 (same account, different browser)
4. Navigate to Choptso messaging
5. Select the parent contact
6. Verify previous message is visible

**Expected Result**: Messages stored in Firestore are accessible from any device

---

### Test 6: Broadcast Messages

**Objective**: Verify broadcast messages work with cloud storage

**Steps**:
1. Log in as admin
2. Navigate to Choptso messaging
3. Select "Broadcast to All" option
4. Send a broadcast message
5. Log in as teacher in another window
6. Verify broadcast message appears in teacher's Choptso
7. Log in as parent in another window
8. Verify broadcast message appears in parent's Choptso

**Expected Result**: Broadcast messages visible to all users

---

### Test 7: Offline Fallback

**Objective**: Verify system gracefully handles offline state

**Steps**:
1. Log in with internet connection
2. Navigate to Choptso
3. Load some messages
4. Disconnect internet (airplane mode or disable network)
5. Try to send a message
6. Verify fallback to localStorage triggers
7. Reconnect internet
8. Try sending message again
9. Verify message uploads to cloud

**Expected Result**: 
- Console shows error but no crash
- Fallback functions execute
- System recovers when connection restored

---

### Test 8: Message Loading Limit

**Objective**: Verify query limit of 50 messages works correctly

**Setup**: Need conversation with more than 50 messages (can be created via script)

**Steps**:
1. Open conversation with 60+ messages
2. Verify only 50 most recent messages load
3. Check browser network tab to confirm query limit applied

**Expected Result**: Only 50 most recent messages loaded (performance optimization)

---

## Verification Checklist

After completing all tests, verify:

- [ ] All contacts load from Firestore successfully
- [ ] Messages sync in real-time across users
- [ ] File attachments upload to Firebase Storage
- [ ] Messages persist across browser sessions
- [ ] Broadcast messages reach all users
- [ ] Offline fallback works correctly
- [ ] No console errors during normal operation
- [ ] "Cloud Sync" indicators visible in all portals
- [ ] Message query limit prevents loading too many messages
- [ ] Firebase Firestore rules allow proper read/write access

## Troubleshooting

### Common Issues

**Issue**: "Permission Denied" error in console
- **Solution**: Check Firebase Firestore rules, ensure user roles are set correctly

**Issue**: Contacts don't load
- **Solution**: Verify users exist in Firestore `users` collection with proper `role` field

**Issue**: Messages don't sync in real-time
- **Solution**: Check Firestore real-time listener is active, check browser console for errors

**Issue**: Attachments fail to upload
- **Solution**: Check Firebase Storage rules, verify storage bucket is configured

**Issue**: Fallback to localStorage not working
- **Solution**: Verify localStorage data exists, check console for JavaScript errors

## Firebase Console Verification

To verify data is actually being stored in Firestore:

1. Go to Firebase Console (https://console.firebase.google.com)
2. Select project: `bis-management-system-d77f4`
3. Navigate to Firestore Database
4. Check these collections:
   - `users` - Should contain user profiles with roles
   - `choptsoMessages` - Should contain messages with sender, recipient, timestamp
   - `userProfiles` - Should contain user profile pictures
5. Navigate to Storage
6. Check `choptso/{userId}/` folders for uploaded attachments

## Success Criteria

The cloud storage implementation is successful if:
1. ✅ All messages are stored in Firestore (not localStorage)
2. ✅ Real-time sync works between users
3. ✅ File attachments stored in Firebase Storage
4. ✅ Messages accessible from multiple devices
5. ✅ Graceful fallback when offline
6. ✅ No data loss during normal operation
7. ✅ Performance is acceptable (< 2 second load time)

## Notes

- This implementation maintains backward compatibility with localStorage
- Existing localStorage data will continue to work as fallback
- Firebase Security Rules are already configured correctly
- Login credentials use `.local` domain which is correct for Firebase Auth

---

For additional help, refer to:
- [FIREBASE_INTEGRATION.md](FIREBASE_INTEGRATION.md)
- [FIREBASE_RULES.md](FIREBASE_RULES.md)
- [LOGIN_CREDENTIALS.md](LOGIN_CREDENTIALS.md)
