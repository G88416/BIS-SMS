/**
 * Firestore Audit Logging Module for BIS-SMS
 * 
 * This module provides comprehensive audit logging for tracking user actions,
 * data changes, and system events in the application.
 * 
 * Features:
 * - Automatic logging of CRUD operations
 * - User action tracking
 * - Change history tracking
 * - Query audit logs by user, action, date
 * - Secure audit log storage
 * - Performance optimized
 */

/**
 * Audit log entry structure:
 * {
 *   id: string,
 *   timestamp: timestamp,
 *   userId: string,
 *   userEmail: string,
 *   userName: string,
 *   userRole: string,
 *   action: string (CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT, etc.),
 *   resource: string (collection name),
 *   resourceId: string (document ID),
 *   changes: object (before/after for updates),
 *   metadata: object (IP, user agent, etc.),
 *   status: string (SUCCESS, FAILURE),
 *   errorMessage: string (if status is FAILURE)
 * }
 */

const AUDIT_COLLECTION = 'auditLogs';

/**
 * Create an audit log entry
 * @param {Object} logData - Audit log data
 * @returns {Promise<string>} Document ID of created log
 */
export async function createAuditLog(logData) {
  try {
    if (!window.firebaseDb || !window.firebaseAuth.currentUser) {
      console.warn('Cannot create audit log: Firebase not initialized or user not authenticated');
      return null;
    }

    const currentUser = window.firebaseAuth.currentUser;
    
    // Get user role from Firestore users collection
    let userRole = 'unknown';
    try {
      const userDoc = await window.firebaseGetDoc(
        window.firebaseDoc(window.firebaseDb, 'users', currentUser.uid)
      );
      if (userDoc.exists()) {
        userRole = userDoc.data().role || 'unknown';
      }
    } catch (error) {
      console.warn('Could not fetch user role for audit log:', error);
    }

    const auditEntry = {
      timestamp: window.firebaseServerTimestamp(),
      userId: currentUser.uid,
      userEmail: currentUser.email || 'unknown',
      userName: currentUser.displayName || currentUser.email || 'Unknown User',
      userRole: userRole,
      action: logData.action,
      resource: logData.resource || null,
      resourceId: logData.resourceId || null,
      changes: logData.changes || null,
      metadata: {
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        ...logData.metadata
      },
      status: logData.status || 'SUCCESS',
      errorMessage: logData.errorMessage || null
    };

    const docRef = await window.firebaseAddDoc(
      window.firebaseCollection(window.firebaseDb, AUDIT_COLLECTION),
      auditEntry
    );

    return docRef.id;
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw - audit logging should not break the main operation
    return null;
  }
}

/**
 * Log a CREATE operation
 */
export async function logCreate(resource, resourceId, data) {
  return createAuditLog({
    action: 'CREATE',
    resource,
    resourceId,
    changes: { after: data },
    status: 'SUCCESS'
  });
}

/**
 * Log an UPDATE operation
 */
export async function logUpdate(resource, resourceId, beforeData, afterData) {
  return createAuditLog({
    action: 'UPDATE',
    resource,
    resourceId,
    changes: { before: beforeData, after: afterData },
    status: 'SUCCESS'
  });
}

/**
 * Log a DELETE operation
 */
export async function logDelete(resource, resourceId, data) {
  return createAuditLog({
    action: 'DELETE',
    resource,
    resourceId,
    changes: { before: data },
    status: 'SUCCESS'
  });
}

/**
 * Log a READ operation (use sparingly for performance)
 */
export async function logRead(resource, resourceId = null) {
  return createAuditLog({
    action: 'READ',
    resource,
    resourceId,
    status: 'SUCCESS'
  });
}

/**
 * Log a user login
 */
export async function logLogin(method = 'email') {
  return createAuditLog({
    action: 'LOGIN',
    resource: 'authentication',
    metadata: { method },
    status: 'SUCCESS'
  });
}

/**
 * Log a user logout
 */
export async function logLogout() {
  return createAuditLog({
    action: 'LOGOUT',
    resource: 'authentication',
    status: 'SUCCESS'
  });
}

/**
 * Log a failed operation
 */
export async function logFailure(action, resource, errorMessage, resourceId = null) {
  return createAuditLog({
    action,
    resource,
    resourceId,
    status: 'FAILURE',
    errorMessage
  });
}

/**
 * Log a custom action
 */
export async function logCustomAction(action, resource, metadata = {}) {
  return createAuditLog({
    action,
    resource,
    metadata,
    status: 'SUCCESS'
  });
}

/**
 * Query audit logs by user
 */
export async function getAuditLogsByUser(userId, limit = 100) {
  try {
    const q = window.firebaseQuery(
      window.firebaseCollection(window.firebaseDb, AUDIT_COLLECTION),
      window.firebaseWhere('userId', '==', userId),
      window.firebaseOrderBy('timestamp', 'desc'),
      window.firebaseLimit(limit)
    );

    const snapshot = await window.firebaseGetDocs(q);
    const logs = [];

    snapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return logs;
  } catch (error) {
    console.error('Error fetching audit logs by user:', error);
    throw error;
  }
}

/**
 * Query audit logs by action
 */
export async function getAuditLogsByAction(action, limit = 100) {
  try {
    const q = window.firebaseQuery(
      window.firebaseCollection(window.firebaseDb, AUDIT_COLLECTION),
      window.firebaseWhere('action', '==', action),
      window.firebaseOrderBy('timestamp', 'desc'),
      window.firebaseLimit(limit)
    );

    const snapshot = await window.firebaseGetDocs(q);
    const logs = [];

    snapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return logs;
  } catch (error) {
    console.error('Error fetching audit logs by action:', error);
    throw error;
  }
}

/**
 * Query audit logs by resource
 */
export async function getAuditLogsByResource(resource, resourceId = null, limit = 100) {
  try {
    let q;
    
    if (resourceId) {
      q = window.firebaseQuery(
        window.firebaseCollection(window.firebaseDb, AUDIT_COLLECTION),
        window.firebaseWhere('resource', '==', resource),
        window.firebaseWhere('resourceId', '==', resourceId),
        window.firebaseOrderBy('timestamp', 'desc'),
        window.firebaseLimit(limit)
      );
    } else {
      q = window.firebaseQuery(
        window.firebaseCollection(window.firebaseDb, AUDIT_COLLECTION),
        window.firebaseWhere('resource', '==', resource),
        window.firebaseOrderBy('timestamp', 'desc'),
        window.firebaseLimit(limit)
      );
    }

    const snapshot = await window.firebaseGetDocs(q);
    const logs = [];

    snapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return logs;
  } catch (error) {
    console.error('Error fetching audit logs by resource:', error);
    throw error;
  }
}

/**
 * Query audit logs by date range
 */
export async function getAuditLogsByDateRange(startDate, endDate, limit = 100) {
  try {
    const q = window.firebaseQuery(
      window.firebaseCollection(window.firebaseDb, AUDIT_COLLECTION),
      window.firebaseWhere('timestamp', '>=', startDate),
      window.firebaseWhere('timestamp', '<=', endDate),
      window.firebaseOrderBy('timestamp', 'desc'),
      window.firebaseLimit(limit)
    );

    const snapshot = await window.firebaseGetDocs(q);
    const logs = [];

    snapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return logs;
  } catch (error) {
    console.error('Error fetching audit logs by date range:', error);
    throw error;
  }
}

/**
 * Get recent audit logs
 */
export async function getRecentAuditLogs(limit = 50) {
  try {
    const q = window.firebaseQuery(
      window.firebaseCollection(window.firebaseDb, AUDIT_COLLECTION),
      window.firebaseOrderBy('timestamp', 'desc'),
      window.firebaseLimit(limit)
    );

    const snapshot = await window.firebaseGetDocs(q);
    const logs = [];

    snapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return logs;
  } catch (error) {
    console.error('Error fetching recent audit logs:', error);
    throw error;
  }
}

/**
 * Get audit statistics
 */
export async function getAuditStatistics(startDate = null, endDate = null) {
  try {
    let q = window.firebaseCollection(window.firebaseDb, AUDIT_COLLECTION);

    if (startDate && endDate) {
      q = window.firebaseQuery(
        q,
        window.firebaseWhere('timestamp', '>=', startDate),
        window.firebaseWhere('timestamp', '<=', endDate)
      );
    }

    const snapshot = await window.firebaseGetDocs(q);
    
    const stats = {
      totalLogs: snapshot.size,
      byAction: {},
      byUser: {},
      byResource: {},
      byStatus: {},
      failures: 0
    };

    snapshot.forEach((doc) => {
      const log = doc.data();
      
      // Count by action
      stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
      
      // Count by user
      stats.byUser[log.userId] = (stats.byUser[log.userId] || 0) + 1;
      
      // Count by resource
      if (log.resource) {
        stats.byResource[log.resource] = (stats.byResource[log.resource] || 0) + 1;
      }
      
      // Count by status
      stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1;
      
      // Count failures
      if (log.status === 'FAILURE') {
        stats.failures++;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error fetching audit statistics:', error);
    throw error;
  }
}

/**
 * Wrapper for Firestore operations with automatic audit logging
 */
export class AuditedFirestoreOperation {
  /**
   * Create a document with audit logging
   */
  static async create(collection, data) {
    try {
      const docRef = await window.firebaseAddDoc(
        window.firebaseCollection(window.firebaseDb, collection),
        data
      );
      
      await logCreate(collection, docRef.id, data);
      
      return docRef;
    } catch (error) {
      await logFailure('CREATE', collection, error.message);
      throw error;
    }
  }

  /**
   * Update a document with audit logging
   */
  static async update(collection, documentId, data) {
    try {
      const docRef = window.firebaseDoc(window.firebaseDb, collection, documentId);
      
      // Get before state
      const beforeDoc = await window.firebaseGetDoc(docRef);
      const beforeData = beforeDoc.exists() ? beforeDoc.data() : null;
      
      // Update
      await window.firebaseUpdateDoc(docRef, data);
      
      // Get after state
      const afterDoc = await window.firebaseGetDoc(docRef);
      const afterData = afterDoc.exists() ? afterDoc.data() : null;
      
      await logUpdate(collection, documentId, beforeData, afterData);
      
      return docRef;
    } catch (error) {
      await logFailure('UPDATE', collection, error.message, documentId);
      throw error;
    }
  }

  /**
   * Delete a document with audit logging
   */
  static async delete(collection, documentId) {
    try {
      const docRef = window.firebaseDoc(window.firebaseDb, collection, documentId);
      
      // Get before state
      const beforeDoc = await window.firebaseGetDoc(docRef);
      const beforeData = beforeDoc.exists() ? beforeDoc.data() : null;
      
      // Delete
      await window.firebaseDeleteDoc(docRef);
      
      await logDelete(collection, documentId, beforeData);
      
      return docRef;
    } catch (error) {
      await logFailure('DELETE', collection, error.message, documentId);
      throw error;
    }
  }
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.FirestoreAudit = {
    createAuditLog,
    logCreate,
    logUpdate,
    logDelete,
    logRead,
    logLogin,
    logLogout,
    logFailure,
    logCustomAction,
    getAuditLogsByUser,
    getAuditLogsByAction,
    getAuditLogsByResource,
    getAuditLogsByDateRange,
    getRecentAuditLogs,
    getAuditStatistics,
    AuditedFirestoreOperation
  };
  
  console.log('✓ Firestore Audit Logging module initialized');
}

/**
 * USAGE EXAMPLES:
 * 
 * 1. Log a create operation:
 *    await window.FirestoreAudit.logCreate('students', 'student123', {
 *      name: 'John Doe',
 *      grade: '10'
 *    });
 * 
 * 2. Use audited operations (automatic logging):
 *    const docRef = await window.FirestoreAudit.AuditedFirestoreOperation.create(
 *      'students',
 *      { name: 'John Doe', grade: '10' }
 *    );
 * 
 * 3. Query audit logs:
 *    const userLogs = await window.FirestoreAudit.getAuditLogsByUser('user123');
 *    const recentLogs = await window.FirestoreAudit.getRecentAuditLogs(50);
 * 
 * 4. Get audit statistics:
 *    const stats = await window.FirestoreAudit.getAuditStatistics();
 *    console.log(`Total logs: ${stats.totalLogs}`);
 *    console.log(`Failures: ${stats.failures}`);
 * 
 * 5. Log custom actions:
 *    await window.FirestoreAudit.logCustomAction(
 *      'EXPORT_REPORT',
 *      'reports',
 *      { reportType: 'financial', format: 'PDF' }
 *    );
 */
