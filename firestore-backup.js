/**
 * Firestore Backup and Restore Module for BIS-SMS
 * 
 * This module provides utilities for backing up and restoring Firestore data.
 * It supports manual backups, scheduled backups, and selective restoration.
 * 
 * IMPORTANT: For production use, set up automated backups using Firebase Console
 * or Google Cloud Platform. This module provides client-side backup utilities
 * for development and testing purposes.
 * 
 * Features:
 * - Manual backup creation
 * - Selective collection backup
 * - Data export to JSON
 * - Data restore from backup
 * - Backup metadata tracking
 * - Backup validation
 */

const BACKUP_METADATA_COLLECTION = 'backupMetadata';

/**
 * Create a backup of a Firestore collection
 * @param {string} collectionName - Name of the collection to backup
 * @param {Object} options - Backup options
 * @returns {Promise<Object>} Backup data and metadata
 */
export async function backupCollection(collectionName, options = {}) {
  try {
    if (!window.firebaseDb) {
      throw new Error('Firebase not initialized');
    }

    console.log(`Starting backup of collection: ${collectionName}`);
    
    const snapshot = await window.firebaseGetDocs(
      window.firebaseCollection(window.firebaseDb, collectionName)
    );

    const data = [];
    snapshot.forEach((doc) => {
      data.push({
        id: doc.id,
        ...doc.data()
      });
    });

    const metadata = {
      collection: collectionName,
      timestamp: new Date().toISOString(),
      documentCount: data.length,
      backupType: options.backupType || 'manual',
      createdBy: window.firebaseAuth.currentUser?.uid || 'unknown',
      description: options.description || `Backup of ${collectionName}`,
      version: '1.0'
    };

    console.log(`✓ Backed up ${data.length} documents from ${collectionName}`);

    return {
      metadata,
      data
    };
  } catch (error) {
    console.error(`Error backing up collection ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Create a full database backup
 * @param {Array<string>} collections - List of collections to backup
 * @param {Object} options - Backup options
 * @returns {Promise<Object>} Complete backup data
 */
export async function backupDatabase(collections, options = {}) {
  try {
    console.log('Starting full database backup...');
    
    const backupData = {
      metadata: {
        timestamp: new Date().toISOString(),
        collections: collections,
        backupType: options.backupType || 'full',
        createdBy: window.firebaseAuth.currentUser?.uid || 'unknown',
        description: options.description || 'Full database backup',
        version: '1.0'
      },
      collections: {}
    };

    for (const collectionName of collections) {
      try {
        const collectionBackup = await backupCollection(collectionName, options);
        backupData.collections[collectionName] = collectionBackup.data;
      } catch (error) {
        console.error(`Failed to backup collection ${collectionName}:`, error);
        backupData.collections[collectionName] = {
          error: error.message,
          status: 'failed'
        };
      }
    }

    // Save backup metadata to Firestore
    if (options.saveMetadata !== false) {
      try {
        await saveBackupMetadata(backupData.metadata);
      } catch (error) {
        console.warn('Failed to save backup metadata:', error);
      }
    }

    console.log('✓ Database backup completed');
    return backupData;
  } catch (error) {
    console.error('Error backing up database:', error);
    throw error;
  }
}

/**
 * Save backup metadata to Firestore
 */
async function saveBackupMetadata(metadata) {
  try {
    const docRef = await window.firebaseAddDoc(
      window.firebaseCollection(window.firebaseDb, BACKUP_METADATA_COLLECTION),
      metadata
    );
    console.log(`✓ Backup metadata saved with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error('Error saving backup metadata:', error);
    throw error;
  }
}

/**
 * Export backup data to JSON file
 * @param {Object} backupData - Backup data to export
 * @param {string} filename - Optional filename
 */
export function exportBackupToJSON(backupData, filename = null) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const defaultFilename = `bis-sms-backup-${timestamp}.json`;
    const finalFilename = filename || defaultFilename;

    const jsonData = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`✓ Backup exported to ${finalFilename}`);
  } catch (error) {
    console.error('Error exporting backup:', error);
    throw error;
  }
}

/**
 * Restore a collection from backup data
 * @param {string} collectionName - Name of the collection to restore
 * @param {Array} data - Backup data to restore
 * @param {Object} options - Restore options
 */
export async function restoreCollection(collectionName, data, options = {}) {
  try {
    if (!window.firebaseDb) {
      throw new Error('Firebase not initialized');
    }

    console.log(`Starting restore of collection: ${collectionName}`);

    const { writeBatch } = await import(
      'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
    );

    // Clear existing data if specified
    if (options.clearExisting) {
      console.log(`Clearing existing data in ${collectionName}...`);
      const snapshot = await window.firebaseGetDocs(
        window.firebaseCollection(window.firebaseDb, collectionName)
      );
      
      const deleteBatch = writeBatch(window.firebaseDb);
      snapshot.forEach((doc) => {
        deleteBatch.delete(doc.ref);
      });
      await deleteBatch.commit();
      console.log(`✓ Cleared ${snapshot.size} existing documents`);
    }

    // Restore data in batches (Firestore limit is 500 operations per batch)
    const batchSize = 500;
    let restored = 0;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = writeBatch(window.firebaseDb);
      const chunk = data.slice(i, i + batchSize);

      chunk.forEach((doc) => {
        const docRef = window.firebaseDoc(
          window.firebaseDb,
          collectionName,
          doc.id
        );
        
        // Remove the id field from the data
        const { id, ...docData } = doc;
        
        if (options.merge) {
          batch.set(docRef, docData, { merge: true });
        } else {
          batch.set(docRef, docData);
        }
      });

      await batch.commit();
      restored += chunk.length;
      console.log(`Restored ${restored}/${data.length} documents...`);
    }

    console.log(`✓ Restored ${restored} documents to ${collectionName}`);
    return { restored, collection: collectionName };
  } catch (error) {
    console.error(`Error restoring collection ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Restore full database from backup
 * @param {Object} backupData - Complete backup data
 * @param {Object} options - Restore options
 */
export async function restoreDatabase(backupData, options = {}) {
  try {
    console.log('Starting full database restore...');

    const results = {
      timestamp: new Date().toISOString(),
      collections: {}
    };

    if (!backupData.collections) {
      throw new Error('Invalid backup data: collections not found');
    }

    for (const [collectionName, data] of Object.entries(backupData.collections)) {
      if (data.error) {
        console.warn(`Skipping ${collectionName}: backup has errors`);
        results.collections[collectionName] = {
          status: 'skipped',
          reason: data.error
        };
        continue;
      }

      try {
        const result = await restoreCollection(collectionName, data, options);
        results.collections[collectionName] = {
          status: 'success',
          restored: result.restored
        };
      } catch (error) {
        console.error(`Failed to restore collection ${collectionName}:`, error);
        results.collections[collectionName] = {
          status: 'failed',
          error: error.message
        };
      }
    }

    console.log('✓ Database restore completed');
    return results;
  } catch (error) {
    console.error('Error restoring database:', error);
    throw error;
  }
}

/**
 * Import backup from JSON file
 * @param {File} file - JSON file containing backup data
 * @returns {Promise<Object>} Parsed backup data
 */
export async function importBackupFromJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const backupData = JSON.parse(event.target.result);
        console.log('✓ Backup file loaded successfully');
        resolve(backupData);
      } catch (error) {
        console.error('Error parsing backup file:', error);
        reject(new Error('Invalid backup file format'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading backup file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Validate backup data
 * @param {Object} backupData - Backup data to validate
 * @returns {Object} Validation result
 */
export function validateBackup(backupData) {
  const validation = {
    valid: true,
    errors: [],
    warnings: []
  };

  // Check metadata
  if (!backupData.metadata) {
    validation.valid = false;
    validation.errors.push('Missing backup metadata');
  } else {
    if (!backupData.metadata.timestamp) {
      validation.warnings.push('Missing timestamp in metadata');
    }
    if (!backupData.metadata.version) {
      validation.warnings.push('Missing version in metadata');
    }
  }

  // Check collections
  if (!backupData.collections) {
    validation.valid = false;
    validation.errors.push('Missing collections data');
  } else {
    Object.entries(backupData.collections).forEach(([name, data]) => {
      if (!Array.isArray(data) && !data.error) {
        validation.errors.push(`Invalid data format for collection: ${name}`);
        validation.valid = false;
      }
    });
  }

  return validation;
}

/**
 * Get list of available backups
 */
export async function listBackups(limit = 20) {
  try {
    const q = window.firebaseQuery(
      window.firebaseCollection(window.firebaseDb, BACKUP_METADATA_COLLECTION),
      window.firebaseOrderBy('timestamp', 'desc'),
      window.firebaseLimit(limit)
    );

    const snapshot = await window.firebaseGetDocs(q);
    const backups = [];

    snapshot.forEach((doc) => {
      backups.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return backups;
  } catch (error) {
    console.error('Error listing backups:', error);
    throw error;
  }
}

/**
 * Delete backup metadata
 */
export async function deleteBackupMetadata(backupId) {
  try {
    await window.firebaseDeleteDoc(
      window.firebaseDoc(window.firebaseDb, BACKUP_METADATA_COLLECTION, backupId)
    );
    console.log(`✓ Deleted backup metadata: ${backupId}`);
  } catch (error) {
    console.error('Error deleting backup metadata:', error);
    throw error;
  }
}

// Predefined collection lists for common backup scenarios
export const BACKUP_PRESETS = {
  // Core data
  CORE: ['students', 'teachers', 'classes', 'users'],
  
  // Academic data
  ACADEMIC: ['students', 'teachers', 'classes', 'grades', 'attendance', 'subjects'],
  
  // Financial data
  FINANCIAL: ['fees', 'expenses'],
  
  // All data
  ALL: [
    'students', 'teachers', 'classes', 'users', 'grades', 'attendance',
    'fees', 'expenses', 'announcements', 'events', 'messages',
    'subjects', 'homework', 'assignments', 'lessonPlans'
  ]
};

// Make functions available globally
if (typeof window !== 'undefined') {
  window.FirestoreBackup = {
    backupCollection,
    backupDatabase,
    exportBackupToJSON,
    restoreCollection,
    restoreDatabase,
    importBackupFromJSON,
    validateBackup,
    listBackups,
    deleteBackupMetadata,
    BACKUP_PRESETS
  };
  
  console.log('✓ Firestore Backup module initialized');
}

/**
 * USAGE EXAMPLES:
 * 
 * 1. Backup a single collection:
 *    const backup = await window.FirestoreBackup.backupCollection('students');
 *    window.FirestoreBackup.exportBackupToJSON(backup);
 * 
 * 2. Backup entire database:
 *    const backup = await window.FirestoreBackup.backupDatabase(
 *      window.FirestoreBackup.BACKUP_PRESETS.ALL
 *    );
 *    window.FirestoreBackup.exportBackupToJSON(backup);
 * 
 * 3. Restore from file:
 *    const file = document.getElementById('fileInput').files[0];
 *    const backupData = await window.FirestoreBackup.importBackupFromJSON(file);
 *    const validation = window.FirestoreBackup.validateBackup(backupData);
 *    if (validation.valid) {
 *      await window.FirestoreBackup.restoreDatabase(backupData, {
 *        clearExisting: true
 *      });
 *    }
 * 
 * 4. List available backups:
 *    const backups = await window.FirestoreBackup.listBackups();
 *    console.log('Available backups:', backups);
 * 
 * 5. Scheduled backup (example):
 *    // Run daily at midnight
 *    setInterval(async () => {
 *      const backup = await window.FirestoreBackup.backupDatabase(
 *        window.FirestoreBackup.BACKUP_PRESETS.ALL,
 *        { backupType: 'scheduled', description: 'Daily automated backup' }
 *      );
 *      window.FirestoreBackup.exportBackupToJSON(backup);
 *    }, 24 * 60 * 60 * 1000);
 */
