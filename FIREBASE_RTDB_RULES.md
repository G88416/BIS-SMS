# Firebase Realtime Database Rules Documentation

## Overview

This document describes the Firebase Realtime Database security rules implemented for the BIS-SMS (Bophelong Independent School Management System).

## File Location

- **database.rules.json** - Firebase Realtime Database security rules

## Configuration

The database rules are configured in `firebase.json`:

```json
{
  "database": {
    "rules": "database.rules.json"
  }
}
```

## Security Model

The security rules implement a **role-based access control (RBAC)** system with four user roles:

### User Roles

1. **Admin** - Full access to all data and management functions
2. **Teacher** - Access to class-related data, grades, and attendance for their classes
3. **Student** - Access to their own data and class information
4. **Parent** - Access to their children's data

### Authentication Requirement

- All database access requires authentication (`auth != null`)
- By default, all reads and writes are denied unless explicitly allowed

## Collection Security Rules

### Core Collections

#### Users (`/users/$userId`)
- **Read**: All authenticated users
- **Write**: Admins or the user themselves

#### Students (`/students/$studentId`)
- **Read**: 
  - Admins
  - Teachers
  - The student themselves
  - Parents of the student (if student ID is in their `childrenIds`)
- **Write**: Admins only
- **Validation**: Must have `id` and `name` fields

#### Teachers (`/teachers/$teacherId`)
- **Read**: All authenticated users
- **Write**: Admins only

#### Classes (`/classes/$classId`)
- **Read**: All authenticated users
- **Write**: Admins only

### Academic Collections

#### Attendance (`/attendance/$classId`)
- **Read**:
  - Admins
  - Teacher of the class
  - Students enrolled in the class
  - Parents of students in the class
- **Write**: Admins or teacher of the class

#### Grades (`/grades/$classId`)
- **Read**: Same as Attendance
- **Write**: Admins or teacher of the class

#### Grades Data (`/gradesData/$studentId`)
- **Read**:
  - Admins
  - All teachers
  - The student themselves
  - Parents of the student
- **Write**: Admins or teachers

#### Subjects (`/subjects/$classId`)
- **Read**: All authenticated users
- **Write**: Admins or teacher of the class

#### Homework (`/homework/$classId`)
- **Read**: Same as Attendance (admins, teacher, students, parents)
- **Write**: Admins or teacher of the class

#### Assignments (`/assignments/$assignmentId`)
- **Read**: All authenticated users
- **Write**: Admins or teachers

#### Assignment Submissions (`/assignmentSubmissions/$submissionId`)
- **Read**: All authenticated users
- **Write**:
  - Admins
  - Teachers
  - Student who owns the submission (on create or update)

#### Lesson Plans (`/lessonPlans/$planId`)
- **Read**: All authenticated users
- **Write**: Admins or teachers

### Communication Collections

#### Messages (`/messages/$messageId`)
- **Read**:
  - Sender of the message
  - Recipient of the message
  - Admins
- **Write**:
  - Admins
  - Sender (can create and update their own messages)

#### Choptso Messages (`/choptsoMessages/$messageId`)
- **Read**:
  - Broadcast messages: All authenticated users
  - Private messages: Sender, participants, or admins
- **Write**:
  - Admins
  - Sender (can create messages they send)
  - Participants (can update existing messages)

#### Choptso Conversations (`/choptsoConversations/$conversationId`)
- **Read**: Participants or admins
- **Write**: Participants or admins (can create if they're a participant)

### User Status Collections

#### User Profiles (`/userProfiles/$userId`)
- **Read**: All authenticated users
- **Write**: The user themselves or admins

#### User Status (`/userStatus/$userId`)
- **Read**: All authenticated users
- **Write**: The user themselves or admins
- **Validation**: Status must be one of: `online`, `away`, `busy`, `offline`

#### Choptso Status (`/choptsoStatus/$userId`)
- **Read**: All authenticated users
- **Write**: The user themselves or admins
- **Validation**: Status must be one of: `online`, `away`, `busy`, `offline`

#### Statuses (24-hour stories) (`/statuses/$statusId`)
- **Read**: All authenticated users
- **Write**: Owner of the status or admins
- **Validation**: 
  - Must have: `userId`, `timestamp`, `expiresAt`, `type`
  - Type must be one of: `text`, `image`, `canvas`

### Financial Collections

#### Fees (`/fees/$studentId`)
- **Read**:
  - Admins
  - The student themselves
  - Parents of the student
- **Write**: Admins only

#### Expenses (`/expenses/$expenseId`)
- **Read**: Admins only
- **Write**: Admins only

### School Information Collections

#### Announcements (`/announcements/$announcementId`)
- **Read**: All authenticated users
- **Write**: Admins or teachers

#### Events (`/events/$eventId`)
- **Read**: All authenticated users
- **Write**: Admins or teachers

#### Schedule (`/schedule/$scheduleId`)
- **Read**: All authenticated users
- **Write**: Admins only

#### Exam Timetable (`/examTimetable/$timetableId`)
- **Read**: All authenticated users
- **Write**: Admins or teachers

### Student Records Collections

#### Health Records (`/healthRecords/$studentId`)
- **Read**:
  - Admins
  - The student themselves
  - Parents of the student
- **Write**:
  - Admins
  - Parents of the student

#### Achievements (`/achievements/$studentId`)
- **Read**:
  - Admins
  - Teachers
  - The student themselves
  - Parents of the student
- **Write**: Admins or teachers

### Resource Collections

#### Resources (`/resources/$resourceId`)
- **Read**: All authenticated users
- **Write**: Admins or teachers

#### Resource Downloads (`/resourceDownloads/$downloadId`)
- **Read**: All authenticated users
- **Write**: Admins (or any user can create new downloads)

### System Collections

#### Notifications (`/notifications/$userId`)
- **Read**: The user themselves
- **Write**: Any authenticated user (can create notifications)

#### Call History (`/callHistory/$callId`)
- **Read**:
  - Caller
  - Recipient
  - Admins
- **Write**:
  - Admins
  - Caller (can create calls they initiate)
  - Caller or recipient (can update existing calls)

#### Audit Logs (`/auditLogs/$logId`)
- **Read**: Admins only
- **Write**: Any authenticated user can create logs for themselves
- **Validation**:
  - Must have: `userId`, `timestamp`, `action`, `status`
  - Status must be either: `SUCCESS` or `FAILURE`
  - Logs are write-once (cannot be updated after creation)

#### Backup Metadata (`/backupMetadata/$backupId`)
- **Read**: Admins only
- **Write**: Admins only
- **Validation**: Must have `timestamp`, `backupType`, and `version` fields

## Data Structure Assumptions

The rules assume the following data structure:

### User Document (`/users/$userId`)
```json
{
  "role": "admin|teacher|student|parent",
  "childrenIds": {
    "$studentId": true
  }
}
```

### Class Document (`/classes/$classId`)
```json
{
  "teacherId": "userId",
  "studentIds": {
    "$studentId": true
  }
}
```

## Deployment

To deploy the database rules to Firebase:

```bash
# Deploy only database rules
firebase deploy --only database

# Deploy all Firebase services
firebase deploy
```

## Testing Rules

You can test the database rules locally using the Firebase Emulator Suite:

```bash
# Start the emulator
firebase emulators:start

# Run tests against the emulator
firebase emulators:exec --only database "npm test"
```

## Security Best Practices

1. **Always authenticate**: All rules require authentication
2. **Principle of least privilege**: Users can only access data they need
3. **Role validation**: User roles are validated against the `/users` collection
4. **Data validation**: Critical fields are validated on write operations
5. **Immutable logs**: Audit logs cannot be modified or deleted
6. **Parent-child relationships**: Parents can only access their children's data

## Relationship to Firestore Rules

This project uses both Firebase Realtime Database and Firestore. The security models are aligned:

- **Firestore** (`firestore.rules`): Primary database for most application data
- **Realtime Database** (`database.rules.json`): For real-time features and specific use cases

Both implement the same role-based access control model for consistency.

## Notes

- Rules use `.exists()`, `.val()`, and `.child()` methods for data validation
- Parent-child relationships are validated through the `childrenIds` field in user documents
- Teacher-class relationships are validated through the `teacherId` field in class documents
- Status values are validated using `.matches()` with regex patterns
- Required fields are validated using `.hasChildren()` or `.hasChild()`

## Support

For more information:
- [Firebase Realtime Database Security Rules](https://firebase.google.com/docs/database/security)
- [Firebase Rules Language Reference](https://firebase.google.com/docs/reference/security/database)
- See also: `FIREBASE_RULES.md` for Firestore rules documentation
