# Firebase Security Rules Documentation

This document explains the Firebase Security Rules implemented for the BIS-SMS (Bophelong Independent School Management System).

## Overview

The security rules have been implemented for two Firebase services:
1. **Firestore Database** - For storing application data
2. **Firebase Storage** - For storing files and media

## Files Created

- `firestore.rules` - Firestore database security rules
- `storage.rules` - Firebase Storage security rules
- `firebase.json` - Firebase project configuration
- `firestore.indexes.json` - Firestore composite indexes for optimized queries

## Firestore Security Rules

### User Roles

The system supports four user roles:
- **Admin**: Full access to all data and management functions
- **Teacher**: Access to class-related data, grades, attendance
- **Student**: Access to their own data and class information
- **Parent**: Access to their children's data

### Collection Access Control

#### Users Collection
- **Read**: All authenticated users
- **Create**: Admins only
- **Update**: Admins or the user themselves
- **Delete**: Admins only

#### Students Collection
- **Read**: All authenticated users
- **Write**: Admins and teachers

#### Teachers Collection
- **Read**: All authenticated users
- **Write**: Admins only

#### Classes Collection
- **Read**: All authenticated users
- **Write**: Admins only

#### Attendance
- **Read**: Admins, class teacher, students in the class, parents of students
- **Write**: Admins and class teacher

#### Grades
- **Read**: Admins, class teacher, students in the class, parents of students
- **Write**: Admins and class teacher

#### Messages
- **Read**: Sender, recipient, or admins
- **Create**: Authenticated users (must be the sender)
- **Update/Delete**: Admins or message sender

#### Choptso Messages
- **Read**: Admins, sender, recipients, or broadcast message viewers
- **Create**: Authenticated users (must be the sender)
  - Validates emoji and reaction fields
  - Supports broadcast or direct messaging
- **Update**: Admins, message sender, or participants (for reactions/read receipts)
  - Participants can only update: reactions, readBy, deliveredTo, updatedAt
- **Delete**: Admins only

#### Choptso Conversations
- **Read**: Participants or admins
- **Create**: Authenticated users (must be a participant)
- **Update**: Participants or admins
  - Supports typing indicators and status updates
- **Delete**: Admins only

#### Choptso Reactions (subcollection)
- **Read**: All authenticated users
- **Create**: Authenticated users (must be owner of reaction)
  - Validates emoji string (max 10 characters)
- **Update**: Reaction owner or admins
- **Delete**: Reaction owner or admins

#### Choptso User Status
- **Read**: All authenticated users
- **Create/Update**: User themselves or admins
  - Status values: online, away, busy, offline
  - Supports custom emoji status

#### Fees & Payments
- **Read**: Admins, the student, or their parents
- **Write**: Admins only

#### Expenses
- **Read/Write**: Admins only

#### Homework
- **Read**: Admins, class teacher, students enrolled in the class, parents of enrolled students
- **Write**: Admins and teachers

#### Announcements
- **Read**: All authenticated users
- **Write**: Admins and teachers

#### Events
- **Read**: All authenticated users
- **Write**: Admins and teachers

#### Health Records
- **Read**: Admins, the student, or their parents
- **Write**: Admins and parents

#### Achievements
- **Read**: Admins, teachers, the student, or their parents
- **Write**: Admins and teachers

#### Exam Timetable
- **Read**: All authenticated users
- **Write**: Admins and teachers

#### Notifications
- **Read**: Owner only
- **Create**: Any authenticated user
- **Update/Delete**: Owner only

## Firebase Storage Rules

### Storage Structure and Access Control

#### Profile Pictures (`/profiles/{userId}/{fileName}`)
- **Read**: All authenticated users
- **Write**: User themselves or admins
- **Restrictions**: Images only, max 10MB

#### Student Documents (`/students/{studentId}/{fileName}`)
- **Read**: All authenticated users
- **Write**: Admins only
- **Restrictions**: Images or documents, max 10MB

#### Teacher Documents (`/teachers/{teacherId}/{fileName}`)
- **Read**: All authenticated users
- **Write**: Admins or the teacher themselves
- **Restrictions**: Images or documents, max 10MB

#### Homework Submissions (`/homework/{classId}/{studentId}/{fileName}`)
- **Read**: Admins, teachers, or the student who submitted
- **Write**: The student, teachers, or admins
- **Restrictions**: Documents or images, max 10MB

#### Assignments (`/assignments/{classId}/{fileName}`)
- **Read**: All authenticated users
- **Write**: Admins or teachers
- **Restrictions**: Documents, images, or videos, max 50MB

#### Health Records (`/health/{studentId}/{fileName}`)
- **Read**: Admins, the student, or their parents
- **Write**: Admins only
- **Restrictions**: Documents or images, max 10MB

#### Announcements (`/announcements/{announcementId}/{fileName}`)
- **Read**: All authenticated users
- **Write**: Admins or teachers
- **Restrictions**: Documents, images, or videos, max 50MB

#### Events (`/events/{eventId}/{fileName}`)
- **Read**: All authenticated users
- **Write**: Admins or teachers
- **Restrictions**: Images or videos, max 50MB

#### Reports (`/reports/{studentId}/{fileName}`)
- **Read**: Admins, teachers, the student, or their parents
- **Write**: Admins or teachers
- **Restrictions**: Documents only, max 10MB

#### Financial Documents (`/finance/{type}/{documentId}/{fileName}`)
- **Read/Write**: Admins only
- **Restrictions**: Documents or images, max 10MB

#### Achievements (`/achievements/{studentId}/{fileName}`)
- **Read**: Admins, teachers, the student, or their parents
- **Write**: Admins or teachers
- **Restrictions**: Documents or images, max 10MB

#### School Assets (`/assets/{assetType}/{fileName}`)
- **Read**: Public (anyone)
- **Write**: Admins only
- **Restrictions**: Images only, max 10MB

#### General Uploads (`/uploads/{userId}/{fileName}`)
- **Read**: User themselves or admins
- **Write**: User themselves
- **Restrictions**: Documents or images, max 10MB

#### Choptso Chat Attachments (`/choptso/{userId}/{fileName}`)
- **Read**: All authenticated users
- **Write**: User themselves
- **Restrictions**: Documents, images, videos, or GIFs, max 10MB

#### Choptso Shared Files (`/choptso-shared/{conversationId}/{fileName}`)
- **Read**: All authenticated users
- **Write**: Any authenticated user
- **Restrictions**: Documents, images, videos, or GIFs, max 10MB

#### Choptso Custom Emojis (`/choptso-emojis/{userId}/{emojiId}`)
- **Read**: All authenticated users
- **Write**: User themselves
- **Restrictions**: Images only, max 1MB

#### Choptso Shared Emojis (`/choptso-emojis-shared/{emojiId}`)
- **Read**: All authenticated users
- **Write**: Admins only
- **Restrictions**: Images only, max 1MB

### File Type Restrictions

#### Supported Image Types
- All image MIME types (image/*)
- GIF files (image/gif) for emoji/reactions

#### Supported Document Types
- PDF (application/pdf)
- Word Documents (.doc, .docx)
- Excel Spreadsheets (.xls, .xlsx)
- Plain Text (.txt)

#### Supported Video Types
- All video MIME types (video/*)

### Size Limits
- **Standard files**: 10MB maximum
- **Large files** (videos, large documents): 50MB maximum
- **Emoji/sticker images**: 1MB maximum

## Choptso Chat Enhancements

### Emoji and Reaction Support

The Choptso chat system has been enhanced to support emoji reactions and custom emoji/stickers:

#### Message Reactions
- **Reaction Collection**: `choptsoMessages/{messageId}/reactions/{reactionId}`
- Users can add emoji reactions to any message they have access to
- Each reaction is stored as a subcollection under the message
- Reaction documents contain: `userId`, `emoji` (string, max 10 chars), `timestamp`
- Users can only modify or delete their own reactions
- All authenticated users can read reactions

#### Message Fields
- **emoji**: String field for emoji content in messages
- **reactions**: Map field for inline reaction counts (optional alternative to subcollection)
- **readBy**: Array field for tracking which users have read the message
- **deliveredTo**: Array field for tracking message delivery status
- **updatedAt**: Timestamp field for when the message was last updated

#### Custom Emoji/Stickers
- **User Emojis**: `choptso-emojis/{userId}/{emojiId}` - Personal emoji/sticker collection
- **Shared Emojis**: `choptso-emojis-shared/{emojiId}` - School-wide emoji/stickers (admin only)
- Maximum size: 1MB per emoji image
- Supports all image formats including GIFs

#### User Status with Emoji
- **Status Collection**: `choptsoStatus/{userId}`
- Users can set their online status (online, away, busy, offline)
- Users can add a custom emoji to their status
- Visible to all authenticated users

#### Typing Indicators
- Supported through the `choptsoConversations` collection
- `typingUsers` field tracks who is currently typing
- Real-time updates for better user experience

### GIF Support
- GIF files are now explicitly supported in Choptso chat attachments
- Perfect for emoji reactions and animated stickers
- Validated through `isGif()` function in storage rules
- Same size limits as other images (10MB for attachments, 1MB for emojis)

## Deployment Instructions

### Prerequisites
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize Firebase in your project (if not already done): `firebase init`

### Deploy Rules

Deploy all rules:
```bash
firebase deploy
```

Deploy only Firestore rules:
```bash
firebase deploy --only firestore:rules
```

Deploy only Storage rules:
```bash
firebase deploy --only storage
```

Deploy only indexes:
```bash
firebase deploy --only firestore:indexes
```

### Testing Rules Locally

You can test Firestore rules locally using the Firebase Emulator Suite:

```bash
firebase emulators:start
```

## Security Best Practices

1. **Authentication Required**: Most operations require authentication
2. **Role-Based Access**: Different user roles have different permissions
3. **Data Isolation**: Users can only access data relevant to their role
4. **File Type Validation**: Only allowed file types can be uploaded
5. **Size Limits**: Prevents storage abuse with file size restrictions
6. **Ownership Validation**: Users can only modify their own data (except admins)

## Performance Considerations

The current implementation uses Firestore document reads (`get()` calls) for role checking and relationship validation. This approach prioritizes security correctness and clarity.

### Performance Optimization Options (for production at scale):

1. **Firebase Auth Custom Claims**: Store user roles in custom claims instead of Firestore documents
   - Eliminates Firestore reads for role checks
   - Faster rule evaluation
   - Requires Cloud Functions to manage claims

2. **Data Denormalization**: Store frequently accessed relationships directly in documents
   - Reduces number of `get()` calls
   - Trade-off: More storage and data consistency challenges

3. **Cloud Functions for Complex Logic**: Move complex authorization to backend
   - Better performance for complex checks
   - More control over authorization flow

4. **Caching**: Firebase automatically caches rule results during a request
   - Multiple calls to the same `get()` path are optimized
   - Cross-request caching not available

### Current Performance Characteristics:

- Each rule evaluation may perform 1-3 Firestore reads
- Firestore has a limit of 10 document reads per rule evaluation
- Current rules stay well within this limit
- Suitable for small to medium deployments (< 1000 concurrent users)

For high-scale deployments, implement custom claims for roles.

## Important Notes

1. **User Role Setup**: Ensure that the `users` collection in Firestore has a `role` field for each user (`admin`, `teacher`, `student`, or `parent`)

2. **Parent-Child Relationship**: Parents need a `childrenIds` array field in their user document containing student IDs they have access to. This relationship should only be managed by administrators to ensure data integrity.

3. **Class-Teacher Relationship**: Classes must have a `teacherId` field linking to the teacher

4. **Class-Student Enrollment**: Classes should have a `studentIds` array field containing all enrolled students for proper access control to class-specific resources (attendance, grades)

5. **Testing**: Always test rules in development environment before deploying to production

6. **Monitoring**: Monitor Firebase Console for unauthorized access attempts

7. **Data Integrity**: The childrenIds array in parent user documents is critical for access control. Only admins should be able to modify user documents to prevent unauthorized access.

## Updating Rules

When updating rules:
1. Test changes locally with Firebase Emulator
2. Deploy to staging environment first
3. Verify functionality
4. Deploy to production
5. Monitor for any access errors

## Support and Troubleshooting

If users experience access denied errors:
1. Verify user authentication status
2. Check user role in Firestore users collection
3. Verify data structure matches rule expectations
4. Check Firebase Console logs for specific rule violations

## Migration from localStorage

The current application uses localStorage for data persistence. To migrate to Firebase:

1. **User Authentication**: Implement Firebase Authentication
2. **Data Migration**: Create scripts to migrate localStorage data to Firestore
3. **Update Application Code**: Replace localStorage calls with Firestore operations
4. **File Uploads**: Implement Firebase Storage for file uploads
5. **Real-time Updates**: Leverage Firestore real-time listeners for live data updates

## Additional Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Security Rules Guide](https://firebase.google.com/docs/storage/security)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
