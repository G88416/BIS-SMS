# Firestore Automated Backup Configuration Guide

This guide explains how to set up automated backups for Firestore data in the BIS-SMS system.

## Overview

Firestore backups can be configured in two ways:
1. **Client-side backups** (for development/testing) - Using the `firestore-backup.js` module
2. **Server-side automated backups** (for production) - Using Firebase/GCP scheduled exports

## Production: Automated Server-Side Backups

For production environments, use Firebase's built-in backup capabilities through Google Cloud Platform.

### Prerequisites

- Firebase Blaze Plan (pay-as-you-go)
- Google Cloud Project with Firestore enabled
- Google Cloud Storage bucket for backup storage
- Appropriate IAM permissions

### Setup Steps

#### 1. Create a Cloud Storage Bucket

```bash
# Using gcloud CLI
gsutil mb -l us-central1 gs://bis-sms-backups

# Or use the Google Cloud Console
# https://console.cloud.google.com/storage
```

#### 2. Enable Firestore Export/Import API

```bash
gcloud services enable firestore.googleapis.com
```

#### 3. Set up Scheduled Exports using Cloud Scheduler

**Option A: Using Google Cloud Console**

1. Go to Cloud Scheduler: https://console.cloud.google.com/cloudscheduler
2. Click "Create Job"
3. Configure the job:
   - Name: `firestore-daily-backup`
   - Frequency: `0 2 * * *` (daily at 2 AM)
   - Timezone: Your preferred timezone
   - Target: HTTP
   - URL: `https://firestore.googleapis.com/v1/projects/YOUR_PROJECT_ID/databases/(default):exportDocuments`
   - HTTP Method: POST
   - Body:
     ```json
     {
       "outputUriPrefix": "gs://bis-sms-backups/firestore-exports",
       "collectionIds": []
     }
     ```
   - Auth header: Add OIDC token with service account

**Option B: Using gcloud CLI**

```bash
# Create a Cloud Function to trigger exports
gcloud functions deploy firestoreExport \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point firestoreExport

# Create a Cloud Scheduler job
gcloud scheduler jobs create http firestore-daily-backup \
  --schedule="0 2 * * *" \
  --uri="https://REGION-PROJECT_ID.cloudfunctions.net/firestoreExport" \
  --http-method=POST
```

#### 4. Sample Cloud Function for Scheduled Backups

Create a file `functions/index.js`:

```javascript
const functions = require('firebase-functions');
const firestore = require('@google-cloud/firestore');
const client = new firestore.v1.FirestoreAdminClient();

exports.scheduledFirestoreExport = functions.pubsub
  .schedule('0 2 * * *') // Daily at 2 AM
  .timeZone('America/New_York')
  .onRun(async (context) => {
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    const databaseName = client.databasePath(projectId, '(default)');
    const bucket = 'gs://bis-sms-backups/firestore-exports';

    try {
      const responses = await client.exportDocuments({
        name: databaseName,
        outputUriPrefix: bucket,
        // Leave collectionIds empty to export all collections
        collectionIds: []
      });

      const response = responses[0];
      console.log(`Operation Name: ${response['name']}`);
      console.log('Backup successful');
      
      return response;
    } catch (error) {
      console.error('Backup failed:', error);
      throw error;
    }
  });
```

Deploy the function:
```bash
firebase deploy --only functions:scheduledFirestoreExport
```

### Backup Retention Policy

Set up lifecycle rules for your backup bucket to automatically delete old backups:

```bash
# Create lifecycle.json
cat > lifecycle.json << EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {"age": 90}
      }
    ]
  }
}
EOF

# Apply lifecycle policy
gsutil lifecycle set lifecycle.json gs://bis-sms-backups
```

### Monitoring Backups

1. **View backup operations**: https://console.cloud.google.com/firestore/operations
2. **Check Cloud Scheduler**: https://console.cloud.google.com/cloudscheduler
3. **Monitor Cloud Storage**: https://console.cloud.google.com/storage

### Restoring from Server-Side Backups

```bash
# List available backups
gsutil ls -r gs://bis-sms-backups/firestore-exports/

# Restore from a specific backup
gcloud firestore import gs://bis-sms-backups/firestore-exports/[BACKUP_FOLDER]

# Or import to a different project
gcloud firestore import gs://bis-sms-backups/firestore-exports/[BACKUP_FOLDER] \
  --project=YOUR_PROJECT_ID
```

## Development: Client-Side Backups

For development and testing, use the client-side backup module.

### Manual Backup

```javascript
// Backup all collections
const backup = await window.FirestoreBackup.backupDatabase(
  window.FirestoreBackup.BACKUP_PRESETS.ALL,
  { 
    backupType: 'manual',
    description: 'Manual backup before testing'
  }
);

// Export to JSON file
window.FirestoreBackup.exportBackupToJSON(backup);
```

### Scheduled Client-Side Backups

```javascript
// Schedule daily backups (example - not recommended for production)
function scheduleClientBackup() {
  // Run daily at midnight
  const now = new Date();
  const night = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1, // Next day
    0, 0, 0 // At midnight
  );
  const msToMidnight = night.getTime() - now.getTime();

  setTimeout(async () => {
    try {
      console.log('Starting scheduled backup...');
      const backup = await window.FirestoreBackup.backupDatabase(
        window.FirestoreBackup.BACKUP_PRESETS.ALL,
        { 
          backupType: 'scheduled',
          description: 'Automated daily backup'
        }
      );
      
      window.FirestoreBackup.exportBackupToJSON(backup);
      
      // Schedule next backup
      scheduleClientBackup();
    } catch (error) {
      console.error('Scheduled backup failed:', error);
    }
  }, msToMidnight);
}

// Start the scheduler
scheduleClientBackup();
```

### Restore from Client-Side Backup

```html
<!-- Add file input to your HTML -->
<input type="file" id="backupFileInput" accept=".json" />
<button onclick="restoreBackup()">Restore Backup</button>

<script>
async function restoreBackup() {
  const fileInput = document.getElementById('backupFileInput');
  const file = fileInput.files[0];
  
  if (!file) {
    alert('Please select a backup file');
    return;
  }
  
  try {
    // Import backup data
    const backupData = await window.FirestoreBackup.importBackupFromJSON(file);
    
    // Validate backup
    const validation = window.FirestoreBackup.validateBackup(backupData);
    if (!validation.valid) {
      console.error('Validation errors:', validation.errors);
      alert('Invalid backup file: ' + validation.errors.join(', '));
      return;
    }
    
    // Show warnings if any
    if (validation.warnings.length > 0) {
      console.warn('Validation warnings:', validation.warnings);
    }
    
    // Confirm restore
    if (!confirm('This will replace all current data. Continue?')) {
      return;
    }
    
    // Restore database
    const results = await window.FirestoreBackup.restoreDatabase(backupData, {
      clearExisting: true,
      merge: false
    });
    
    console.log('Restore results:', results);
    alert('Backup restored successfully!');
    
    // Reload page to reflect changes
    window.location.reload();
  } catch (error) {
    console.error('Restore failed:', error);
    alert('Restore failed: ' + error.message);
  }
}
</script>
```

## Backup Best Practices

1. **Multiple Backup Locations**: Store backups in multiple locations (Cloud Storage + local)
2. **Regular Testing**: Periodically test restore procedures
3. **Incremental Backups**: For large datasets, consider incremental backups
4. **Security**: Encrypt backup files and restrict access
5. **Monitoring**: Set up alerts for backup failures
6. **Documentation**: Keep track of backup schedules and retention policies
7. **Automation**: Use server-side automation for production

## Backup Collections Priority

### Critical (daily backups):
- `users`
- `students`
- `teachers`
- `classes`
- `fees`
- `grades`

### Important (weekly backups):
- `attendance`
- `expenses`
- `messages`
- `announcements`

### Optional (monthly backups):
- `auditLogs`
- `notifications`
- `callHistory`

## Cost Considerations

### Server-Side Backups (GCP)
- Storage costs: ~$0.026/GB/month (Standard storage)
- Export operation: $0.04 per 100,000 entity reads
- Import operation: $0.12 per 100,000 entity writes

### Example Monthly Cost
For a database with 1M documents (average 1KB each):
- Storage: ~$0.026 for 1GB
- Daily export: ~$12/month (30 exports × $0.40)
- Total: ~$12-15/month

## Security Considerations

1. **IAM Permissions**: Use least-privilege principle
2. **Encryption**: Enable encryption at rest and in transit
3. **Access Control**: Restrict who can trigger/access backups
4. **Audit Logging**: Enable Cloud Audit Logs for backup operations
5. **Backup Validation**: Always validate backups before relying on them

## Troubleshooting

### Backup Failed
- Check IAM permissions
- Verify bucket exists and is accessible
- Check Firestore quotas
- Review Cloud Function logs

### Restore Failed
- Verify backup file integrity
- Check Firestore write quotas
- Ensure sufficient permissions
- Review security rules

## Additional Resources

- [Firestore Export/Import Documentation](https://cloud.google.com/firestore/docs/manage-data/export-import)
- [Cloud Scheduler Documentation](https://cloud.google.com/scheduler/docs)
- [Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [Cloud Storage Documentation](https://cloud.google.com/storage/docs)

## Support

For issues with backup configuration, consult:
1. Firebase Console logs
2. Google Cloud Platform logs
3. This documentation
4. Firebase support team
