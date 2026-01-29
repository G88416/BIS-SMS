# Quick Reference: Firestore Advanced Features

This is a quick reference guide for developers using the advanced Firestore features in BIS-SMS.

## 🚀 Quick Start

### Load All Modules
```html
<script type="module" src="./firestore-realtime.js"></script>
<script type="module" src="./firestore-pagination.js"></script>
<script type="module" src="./firestore-audit.js"></script>
<script type="module" src="./firestore-backup.js"></script>
```

## 🔄 Real-time Sync

### Subscribe to a Collection
```javascript
const unsubscribe = window.FirestoreRealtime.subscribeToStudents(
  (result) => {
    console.log('Data:', result.data);
    console.log('Added:', result.changes.added);
    console.log('Modified:', result.changes.modified);
    console.log('Removed:', result.changes.removed);
  },
  (error) => console.error(error),
  { grade: '10', limit: 50 }
);

// Clean up
unsubscribe();
```

### Subscribe to a Document
```javascript
const unsubscribe = window.FirestoreRealtime.subscribeToDocument(
  'students',
  'student123',
  (doc) => console.log('Document:', doc)
);
```

### Monitor Connection
```javascript
const cleanup = window.FirestoreRealtime.monitorRealtimeConnection(
  (status) => console.log('Online:', status.online)
);
```

## 📄 Pagination

### Create and Use Paginator
```javascript
const paginator = window.FirestorePagination.createStudentsPaginator(25, {
  grade: '10',
  orderBy: 'name'
});

// First page
const page1 = await paginator.first();
console.log(page1.data, page1.hasNext, page1.page);

// Next page
if (page1.hasNext) {
  const page2 = await paginator.next();
}

// Previous page
if (page2.hasPrev) {
  const page1Again = await paginator.previous();
}

// Get total count (expensive!)
const total = await paginator.getTotalCount();
```

### Quick Offset Pagination
```javascript
const result = await window.FirestorePagination.paginateWithOffset(
  'students',
  2, // page number
  25, // page size
  { orderBy: [{ field: 'name', direction: 'asc' }] }
);
```

## 📝 Audit Logging

### Automatic Logging (Recommended)
```javascript
// Create with automatic audit log
const docRef = await window.FirestoreAudit.AuditedFirestoreOperation.create(
  'students',
  { name: 'John Doe', grade: '10' }
);

// Update with automatic audit log
await window.FirestoreAudit.AuditedFirestoreOperation.update(
  'students',
  'student123',
  { grade: '11' }
);

// Delete with automatic audit log
await window.FirestoreAudit.AuditedFirestoreOperation.delete(
  'students',
  'student123'
);
```

### Manual Logging
```javascript
// Log create
await window.FirestoreAudit.logCreate('students', 'student123', data);

// Log update
await window.FirestoreAudit.logUpdate('students', 'student123', oldData, newData);

// Log delete
await window.FirestoreAudit.logDelete('students', 'student123', data);

// Log custom action
await window.FirestoreAudit.logCustomAction('EXPORT', 'reports', { format: 'PDF' });
```

### Query Audit Logs
```javascript
// Recent logs
const logs = await window.FirestoreAudit.getRecentAuditLogs(50);

// By user
const userLogs = await window.FirestoreAudit.getAuditLogsByUser('user123');

// By action
const createLogs = await window.FirestoreAudit.getAuditLogsByAction('CREATE');

// By resource
const studentLogs = await window.FirestoreAudit.getAuditLogsByResource('students');

// Statistics
const stats = await window.FirestoreAudit.getAuditStatistics();
console.log(`Total: ${stats.totalLogs}, Failures: ${stats.failures}`);
```

## 💾 Backup & Restore

### Create Backup
```javascript
// Backup all collections
const backup = await window.FirestoreBackup.backupDatabase(
  window.FirestoreBackup.BACKUP_PRESETS.ALL,
  {
    backupType: 'manual',
    description: 'Pre-deployment backup'
  }
);

// Export to file (downloads automatically)
window.FirestoreBackup.exportBackupToJSON(backup);
```

### Backup Single Collection
```javascript
const backup = await window.FirestoreBackup.backupCollection('students');
window.FirestoreBackup.exportBackupToJSON(backup);
```

### Restore from File
```javascript
// Get file from input
const file = document.getElementById('fileInput').files[0];

// Import
const backupData = await window.FirestoreBackup.importBackupFromJSON(file);

// Validate
const validation = window.FirestoreBackup.validateBackup(backupData);
if (!validation.valid) {
  console.error('Invalid:', validation.errors);
  return;
}

// Restore
const results = await window.FirestoreBackup.restoreDatabase(backupData, {
  clearExisting: true, // WARNING: Deletes existing data
  merge: false
});

console.log('Restore results:', results);
```

### List Backups
```javascript
const backups = await window.FirestoreBackup.listBackups(20);
backups.forEach(b => {
  console.log(`${b.description} - ${new Date(b.timestamp).toLocaleString()}`);
});
```

## 📚 Backup Presets

```javascript
window.FirestoreBackup.BACKUP_PRESETS = {
  CORE: ['students', 'teachers', 'classes', 'users'],
  ACADEMIC: ['students', 'teachers', 'classes', 'grades', 'attendance', 'subjects'],
  FINANCIAL: ['fees', 'expenses'],
  ALL: [/* All collections */]
}
```

## 🎯 Common Patterns

### Real-time List with Pagination
```javascript
let paginator = window.FirestorePagination.createStudentsPaginator(25);
let unsubscribe = null;

async function loadPage() {
  // Load paginated data
  const page = await paginator.first();
  
  // Subscribe to real-time updates for current page
  const ids = page.data.map(s => s.id);
  unsubscribe = window.FirestoreRealtime.subscribeToCollection(
    'students',
    (result) => updateUI(result.data),
    null,
    { where: [{ field: '__name__', operator: 'in', value: ids }] }
  );
}

// Clean up
function cleanup() {
  if (unsubscribe) unsubscribe();
}
```

### Audited CRUD with Real-time Updates
```javascript
// Subscribe to changes
const unsubscribe = window.FirestoreRealtime.subscribeToStudents(
  (result) => updateStudentsList(result.data)
);

// Create with audit
async function createStudent(data) {
  await window.FirestoreAudit.AuditedFirestoreOperation.create('students', data);
  // Real-time subscription automatically updates UI
}

// Update with audit
async function updateStudent(id, data) {
  await window.FirestoreAudit.AuditedFirestoreOperation.update('students', id, data);
  // Real-time subscription automatically updates UI
}
```

### Scheduled Backup (Client-side)
```javascript
function scheduleDailyBackup() {
  const now = new Date();
  const tomorrow2AM = new Date(now);
  tomorrow2AM.setDate(tomorrow2AM.getDate() + 1);
  tomorrow2AM.setHours(2, 0, 0, 0);
  
  const delay = tomorrow2AM - now;
  
  setTimeout(async () => {
    const backup = await window.FirestoreBackup.backupDatabase(
      window.FirestoreBackup.BACKUP_PRESETS.ALL,
      { backupType: 'scheduled' }
    );
    window.FirestoreBackup.exportBackupToJSON(backup);
    scheduleDailyBackup(); // Schedule next
  }, delay);
}
```

## ⚠️ Important Notes

### Real-time Sync
- Always unsubscribe when component unmounts
- Use specific queries to reduce bandwidth
- Monitor subscription count: `window.FirestoreRealtime.getActiveSubscriptionsCount()`

### Pagination
- Cursor-based is more efficient than offset
- Create indexes for complex queries
- Don't call `getTotalCount()` frequently (expensive)

### Audit Logging
- Don't log READ operations excessively
- Audit logs are immutable (security rule enforced)
- Review logs regularly for security

### Backups
- Client-side backups are for dev/test only
- For production, use GCP scheduled exports (see AUTOMATED_BACKUP_GUIDE.md)
- Always validate backups before restoring
- Test restore procedures regularly

## 🔗 Documentation Links

- [Comprehensive Guide](./FIRESTORE_ADVANCED_FEATURES.md)
- [Backup Configuration](./AUTOMATED_BACKUP_GUIDE.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [Demo Page](./firestore-features-demo.html)
- [Test Suite](./firestore-features-test.js)

## 🛠️ Troubleshooting

### Module Not Loaded
Wait for module initialization:
```javascript
window.addEventListener('load', () => {
  if (window.FirestoreRealtime) {
    // Module ready
  }
});
```

### Permission Denied
Check Firestore security rules in Firebase Console

### Real-time Not Working
1. Check Firebase initialization
2. Verify security rules allow read
3. Check console for errors
4. Ensure cleanup not called too early

### Pagination Issues
1. Verify orderBy field exists on documents
2. Create composite index if needed
3. Check query constraints

### Audit Logs Not Created
1. Check user authentication
2. Verify security rules
3. Check console for errors

### Backup/Restore Failed
1. Verify file format (JSON)
2. Check write quotas
3. Review security rules

## 🎓 Best Practices

1. **Always clean up subscriptions** to prevent memory leaks
2. **Use cursor-based pagination** for better performance
3. **Use automatic audit logging** with `AuditedFirestoreOperation`
4. **Test backups regularly** by restoring to test environment
5. **Monitor connection status** for better UX
6. **Implement loading states** during async operations
7. **Handle errors gracefully** with user-friendly messages
8. **Use production backups** (GCP) for real applications
9. **Review audit logs** regularly for security
10. **Create indexes** for complex queries

## 💡 Tips

- Use the demo page (`firestore-features-demo.html`) to explore features
- Run tests (`firestore-features-test.js`) to verify setup
- Check browser console for helpful messages
- All modules log initialization status
- Use descriptive backup descriptions
- Include metadata in custom audit actions
- Monitor active subscription count

## 📞 Support

If you need help:
1. Check the comprehensive documentation
2. Try the interactive demo
3. Run the test suite
4. Review Firebase Console logs
5. Check security rules in Firebase Console

---

**Version**: 1.0  
**Last Updated**: 2026-01-29
