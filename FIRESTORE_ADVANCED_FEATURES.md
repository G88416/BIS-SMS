# Firestore Advanced Features - Implementation Guide

This document describes the advanced Firestore features implemented in the BIS-SMS system.

## Overview

The following advanced features have been implemented:

1. **Real-time Sync with onSnapshot()** - Live data synchronization
2. **Enhanced Security Rules** - Role-based access control with audit logging
3. **Pagination** - Efficient handling of large datasets
4. **Audit Logging** - Comprehensive action tracking
5. **Automated Backups** - Data backup and restore capabilities

## Table of Contents

- [Real-time Sync](#real-time-sync)
- [Security Rules](#security-rules)
- [Pagination](#pagination)
- [Audit Logging](#audit-logging)
- [Automated Backups](#automated-backups)
- [Integration](#integration)
- [Examples](#examples)

---

## Real-time Sync

Real-time data synchronization using Firestore's `onSnapshot()` API.

### Module: `firestore-realtime.js`

### Features
- Subscribe to live collection updates
- Subscribe to single document changes
- Track added, modified, and removed documents
- Connection state monitoring
- Automatic cleanup and memory management

### Usage

```javascript
// Subscribe to students collection
const unsubscribe = window.FirestoreRealtime.subscribeToStudents(
  (result) => {
    console.log('Students data:', result.data);
    console.log('Added:', result.changes.added);
    console.log('Modified:', result.changes.modified);
    console.log('Removed:', result.changes.removed);
    
    // Update UI with new data
    updateStudentsTable(result.data);
  },
  (error) => {
    console.error('Subscription error:', error);
  },
  { grade: '10', orderBy: 'name', limit: 50 }
);

// Later, when component unmounts:
unsubscribe();
```

### Available Functions

- `subscribeToCollection(collectionName, onUpdate, onError, queryConstraints)`
- `subscribeToDocument(collectionName, documentId, onUpdate, onError)`
- `subscribeToStudents(onUpdate, onError, options)`
- `subscribeToAttendance(classId, date, onUpdate, onError)`
- `subscribeToAnnouncements(onUpdate, onError, limit)`
- `subscribeToGrades(classId, term, onUpdate, onError)`
- `subscribeToMessages(userId, onUpdate, onError)`
- `unsubscribeAll()`
- `getActiveSubscriptionsCount()`
- `monitorRealtimeConnection(onStatusChange)`

### Best Practices

1. Always unsubscribe when component/page is destroyed
2. Use specific query constraints to minimize data transfer
3. Handle offline scenarios gracefully
4. Implement loading states for initial data

---

## Security Rules

Enhanced Firestore security rules with role-based access control.

### File: `firestore.rules`

### Features
- Role-based access (admin, teacher, student, parent)
- Field-level validation
- Immutable fields protection
- Audit log security
- Backup metadata protection

### New Collections Protected

```javascript
// Audit Logs
match /auditLogs/{logId} {
  allow read: if isAdmin();
  allow create: if isAuthenticated();
  allow update, delete: if false; // Immutable
}

// Backup Metadata
match /backupMetadata/{backupId} {
  allow read: if isAdmin();
  allow create, update, delete: if isAdmin();
}
```

### Security Principles

1. **Least Privilege**: Users can only access data they need
2. **Immutability**: Audit logs cannot be modified
3. **Validation**: All data is validated before writing
4. **Authentication**: All operations require authentication
5. **Audit Trail**: All admin actions are logged

### Testing Security Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Test rules
firebase emulators:start --only firestore

# Or test in Firebase Console
# https://console.firebase.google.com/project/YOUR_PROJECT/firestore/rules
```

---

## Pagination

Efficient pagination for large datasets using cursor-based and offset-based approaches.

### Module: `firestore-pagination.js`

### Features
- Cursor-based pagination (recommended)
- Offset-based pagination
- Configurable page sizes
- First/last/next/previous navigation
- Total count estimation

### Usage

```javascript
// Create a paginator for students
const paginator = window.FirestorePagination.createStudentsPaginator(25, {
  grade: '10',
  orderBy: 'name'
});

// Load first page
const page1 = await paginator.first();
console.log('Data:', page1.data);
console.log('Has next:', page1.hasNext);
console.log('Page:', page1.page);

// Load next page
if (page1.hasNext) {
  const page2 = await paginator.next();
  console.log('Next page:', page2.data);
}

// Go back to previous page
if (page2.hasPrev) {
  const page1Again = await paginator.previous();
}

// Get total count (expensive, use sparingly)
const total = await paginator.getTotalCount();
console.log(`Total students: ${total}`);
```

### Available Paginators

- `createStudentsPaginator(pageSize, options)`
- `createTeachersPaginator(pageSize, options)`
- `createAnnouncementsPaginator(pageSize)`
- `createExpensesPaginator(pageSize, options)`
- `createMessagesPaginator(userId, pageSize)`

### Performance Tips

1. Use cursor-based pagination for better performance
2. Set appropriate page sizes (25-50 items recommended)
3. Avoid using `getTotalCount()` frequently (expensive)
4. Cache paginator instances when possible

---

## Audit Logging

Comprehensive audit logging for tracking user actions and system events.

### Module: `firestore-audit.js`

### Features
- Automatic CRUD operation logging
- User action tracking
- Change history (before/after snapshots)
- Query audit logs by user, action, date, resource
- Failure logging
- Performance optimized

### Usage

```javascript
// Automatic logging with audited operations
const docRef = await window.FirestoreAudit.AuditedFirestoreOperation.create(
  'students',
  {
    name: 'John Doe',
    grade: '10',
    email: 'john@example.com'
  }
);
// This automatically logs the CREATE action

// Or manually log actions
await window.FirestoreAudit.logCreate('students', 'student123', {
  name: 'John Doe',
  grade: '10'
});

// Query audit logs
const userLogs = await window.FirestoreAudit.getAuditLogsByUser('user123');
const recentLogs = await window.FirestoreAudit.getRecentAuditLogs(50);
const stats = await window.FirestoreAudit.getAuditStatistics();

console.log(`Total logs: ${stats.totalLogs}`);
console.log(`Failures: ${stats.failures}`);
console.log('By action:', stats.byAction);
```

### Available Functions

- `logCreate(resource, resourceId, data)`
- `logUpdate(resource, resourceId, beforeData, afterData)`
- `logDelete(resource, resourceId, data)`
- `logRead(resource, resourceId)` - Use sparingly
- `logLogin(method)`
- `logLogout()`
- `logFailure(action, resource, errorMessage, resourceId)`
- `logCustomAction(action, resource, metadata)`
- `getAuditLogsByUser(userId, limit)`
- `getAuditLogsByAction(action, limit)`
- `getAuditLogsByResource(resource, resourceId, limit)`
- `getAuditLogsByDateRange(startDate, endDate, limit)`
- `getRecentAuditLogs(limit)`
- `getAuditStatistics(startDate, endDate)`
- `AuditedFirestoreOperation.create(collection, data)`
- `AuditedFirestoreOperation.update(collection, documentId, data)`
- `AuditedFirestoreOperation.delete(collection, documentId)`

### Audit Log Structure

```javascript
{
  id: 'log123',
  timestamp: Timestamp,
  userId: 'user123',
  userEmail: 'user@example.com',
  userName: 'John Doe',
  userRole: 'admin',
  action: 'CREATE', // CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT, etc.
  resource: 'students',
  resourceId: 'student123',
  changes: {
    before: {...}, // For UPDATE/DELETE
    after: {...}   // For CREATE/UPDATE
  },
  metadata: {
    userAgent: '...',
    timestamp: '...'
  },
  status: 'SUCCESS', // or 'FAILURE'
  errorMessage: null
}
```

### Best Practices

1. Use `AuditedFirestoreOperation` for automatic logging
2. Log all critical operations (CREATE, UPDATE, DELETE)
3. Don't log READ operations excessively (performance impact)
4. Review audit logs regularly for security monitoring
5. Set up alerts for failure patterns

---

## Automated Backups

Comprehensive backup and restore capabilities for Firestore data.

### Module: `firestore-backup.js`

### Features
- Manual and scheduled backups
- Selective collection backup
- Full database backup
- Data export to JSON
- Data restore from backup
- Backup validation
- Backup metadata tracking

### Usage

```javascript
// Backup entire database
const backup = await window.FirestoreBackup.backupDatabase(
  window.FirestoreBackup.BACKUP_PRESETS.ALL,
  {
    backupType: 'manual',
    description: 'Pre-deployment backup'
  }
);

// Export to JSON file (downloads automatically)
window.FirestoreBackup.exportBackupToJSON(backup);

// Restore from file
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];
const backupData = await window.FirestoreBackup.importBackupFromJSON(file);

// Validate backup
const validation = window.FirestoreBackup.validateBackup(backupData);
if (validation.valid) {
  await window.FirestoreBackup.restoreDatabase(backupData, {
    clearExisting: true
  });
}

// List available backups
const backups = await window.FirestoreBackup.listBackups();
console.log('Available backups:', backups);
```

### Backup Presets

```javascript
BACKUP_PRESETS = {
  CORE: ['students', 'teachers', 'classes', 'users'],
  ACADEMIC: ['students', 'teachers', 'classes', 'grades', 'attendance', 'subjects'],
  FINANCIAL: ['fees', 'expenses'],
  ALL: ['students', 'teachers', 'classes', 'users', 'grades', 'attendance',
        'fees', 'expenses', 'announcements', 'events', 'messages',
        'subjects', 'homework', 'assignments', 'lessonPlans']
}
```

### Production Backups

For production environments, use server-side automated backups via Google Cloud Platform. See [AUTOMATED_BACKUP_GUIDE.md](./AUTOMATED_BACKUP_GUIDE.md) for detailed setup instructions.

---

## Integration

### Loading the Modules

Add these script tags to your HTML files after loading Firebase:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"></script>

<!-- BIS-SMS Firestore Modules -->
<script type="module" src="./firebase-utils.js"></script>
<script type="module" src="./firestore-queries.js"></script>
<script type="module" src="./firestore-integration.js"></script>

<!-- New Advanced Features -->
<script type="module" src="./firestore-realtime.js"></script>
<script type="module" src="./firestore-pagination.js"></script>
<script type="module" src="./firestore-audit.js"></script>
<script type="module" src="./firestore-backup.js"></script>
```

### Module Availability

All modules are available globally:

- `window.FirestoreAPI` - Main API (from firestore-integration.js)
- `window.FirestoreRealtime` - Real-time sync functions
- `window.FirestorePagination` - Pagination utilities
- `window.FirestoreAudit` - Audit logging functions
- `window.FirestoreBackup` - Backup and restore functions
- `window.FirebaseUtils` - Utility functions (from firebase-utils.js)

---

## Examples

### Example 1: Real-time Student List with Pagination

```javascript
let currentPaginator = null;
let unsubscribe = null;

async function loadStudentsPage() {
  // Clean up previous subscription
  if (unsubscribe) {
    unsubscribe();
  }
  
  // Create paginator
  if (!currentPaginator) {
    currentPaginator = window.FirestorePagination.createStudentsPaginator(25, {
      orderBy: 'name'
    });
  }
  
  // Load page
  const page = await currentPaginator.first();
  
  // Subscribe to real-time updates for current page documents
  const studentIds = page.data.map(s => s.id);
  unsubscribe = window.FirestoreRealtime.subscribeToCollection(
    'students',
    (result) => {
      // Update UI with real-time changes
      updateStudentsList(result.data);
    },
    null,
    {
      where: [{ field: '__name__', operator: 'in', value: studentIds }]
    }
  );
  
  // Update pagination controls
  document.getElementById('prevBtn').disabled = !page.hasPrev;
  document.getElementById('nextBtn').disabled = !page.hasNext;
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (unsubscribe) unsubscribe();
});
```

### Example 2: Audited Student Creation

```javascript
async function createStudent(studentData) {
  try {
    // Create student with automatic audit logging
    const docRef = await window.FirestoreAudit.AuditedFirestoreOperation.create(
      'students',
      {
        ...studentData,
        createdAt: new Date().toISOString(),
        createdBy: window.firebaseAuth.currentUser.uid
      }
    );
    
    console.log('Student created:', docRef.id);
    
    // Log custom action
    await window.FirestoreAudit.logCustomAction(
      'STUDENT_ENROLLED',
      'students',
      { 
        studentId: docRef.id,
        grade: studentData.grade,
        enrollmentDate: new Date().toISOString()
      }
    );
    
    return docRef;
  } catch (error) {
    console.error('Error creating student:', error);
    throw error;
  }
}
```

### Example 3: Scheduled Backup

```javascript
// Schedule daily backups at 2 AM
function scheduleDailyBackup() {
  const now = new Date();
  const nextBackup = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    2, 0, 0 // 2 AM
  );
  
  const msUntilBackup = nextBackup - now;
  
  setTimeout(async () => {
    try {
      console.log('Starting scheduled backup...');
      
      const backup = await window.FirestoreBackup.backupDatabase(
        window.FirestoreBackup.BACKUP_PRESETS.ALL,
        {
          backupType: 'scheduled',
          description: `Automated backup - ${new Date().toISOString()}`
        }
      );
      
      window.FirestoreBackup.exportBackupToJSON(backup);
      
      // Schedule next backup
      scheduleDailyBackup();
    } catch (error) {
      console.error('Backup failed:', error);
    }
  }, msUntilBackup);
}

// Start scheduler (only for development/testing)
// For production, use GCP scheduled exports
if (window.location.hostname === 'localhost') {
  scheduleDailyBackup();
}
```

---

## Testing

### Manual Testing Checklist

- [ ] Real-time sync updates UI when data changes in another tab
- [ ] Pagination correctly navigates through pages
- [ ] Audit logs are created for CRUD operations
- [ ] Backup exports data correctly
- [ ] Restore imports data correctly
- [ ] Security rules prevent unauthorized access
- [ ] Connection status updates when offline/online
- [ ] Memory leaks prevented (subscriptions cleaned up)

### Performance Testing

1. Test with large datasets (1000+ documents)
2. Monitor network usage with real-time sync
3. Check pagination response times
4. Measure backup/restore times
5. Review audit log query performance

---

## Troubleshooting

### Real-time Sync Not Working

- Check Firebase initialization
- Verify security rules allow read access
- Check console for subscription errors
- Ensure cleanup is not called too early

### Pagination Issues

- Verify query constraints are correct
- Check if collection has documents
- Ensure orderBy field exists on documents
- Create composite index if needed

### Audit Logs Not Created

- Check user authentication
- Verify security rules allow write to auditLogs
- Check console for errors
- Ensure Firebase is initialized

### Backup/Restore Failures

- Check browser permissions for file download
- Verify backup file format is valid
- Ensure sufficient Firestore write quota
- Check security rules for collections

---

## Performance Considerations

1. **Real-time Sync**: Use specific queries to minimize data transfer
2. **Pagination**: Prefer cursor-based over offset-based
3. **Audit Logging**: Don't log READ operations excessively
4. **Backups**: Use server-side backups for production
5. **Indexing**: Create composite indexes for complex queries

---

## Security Considerations

1. All modules respect Firestore security rules
2. Audit logs are immutable (cannot be modified/deleted by users)
3. Backups should be encrypted and stored securely
4. Use production server-side backups with proper IAM permissions
5. Review audit logs regularly for suspicious activity

---

## Support and Documentation

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Security Rules Reference](https://firebase.google.com/docs/firestore/security/rules-structure)
- [Automated Backup Guide](./AUTOMATED_BACKUP_GUIDE.md)
- [BIS-SMS Main README](./README.md)

---

## Version History

- v1.0 (2026-01-29): Initial implementation
  - Real-time sync with onSnapshot()
  - Enhanced security rules
  - Pagination utilities
  - Audit logging
  - Automated backup system
