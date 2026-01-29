/**
 * Firestore Real-time Sync Module for BIS-SMS
 * 
 * This module provides real-time data synchronization using Firestore's onSnapshot()
 * functionality. It allows components to subscribe to live updates from Firestore
 * collections and automatically receive changes.
 * 
 * Features:
 * - Real-time data sync with onSnapshot()
 * - Automatic reconnection on network issues
 * - Subscription management
 * - Error handling and recovery
 * - Memory leak prevention
 */

// Store active subscriptions to prevent memory leaks
const activeSubscriptions = new Map();

/**
 * Subscribe to real-time updates for a collection
 * @param {string} collectionName - Name of the Firestore collection
 * @param {Function} onUpdate - Callback function called when data changes
 * @param {Function} onError - Optional callback for error handling
 * @param {Object} queryConstraints - Optional query constraints (where, orderBy, limit)
 * @returns {Function} Unsubscribe function to stop listening
 */
export function subscribeToCollection(collectionName, onUpdate, onError = null, queryConstraints = null) {
  try {
    if (!window.firebaseDb) {
      throw new Error('Firebase not initialized');
    }

    let collectionRef = window.firebaseCollection(window.firebaseDb, collectionName);
    
    // Apply query constraints if provided
    if (queryConstraints) {
      const constraints = [];
      
      if (queryConstraints.where) {
        queryConstraints.where.forEach(w => {
          constraints.push(window.firebaseWhere(w.field, w.operator, w.value));
        });
      }
      
      if (queryConstraints.orderBy) {
        queryConstraints.orderBy.forEach(o => {
          constraints.push(window.firebaseOrderBy(o.field, o.direction || 'asc'));
        });
      }
      
      if (queryConstraints.limit) {
        constraints.push(window.firebaseLimit(queryConstraints.limit));
      }
      
      if (constraints.length > 0) {
        collectionRef = window.firebaseQuery(collectionRef, ...constraints);
      }
    }

    // Create the real-time listener
    const unsubscribe = window.firebaseOnSnapshot(
      collectionRef,
      (snapshot) => {
        const data = [];
        const changes = {
          added: [],
          modified: [],
          removed: []
        };
        
        snapshot.forEach((doc) => {
          data.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        // Track individual document changes
        snapshot.docChanges().forEach((change) => {
          const docData = {
            id: change.doc.id,
            ...change.doc.data()
          };
          
          if (change.type === 'added') {
            changes.added.push(docData);
          } else if (change.type === 'modified') {
            changes.modified.push(docData);
          } else if (change.type === 'removed') {
            changes.removed.push(docData);
          }
        });
        
        // Call the update callback with full data and changes
        onUpdate({
          data,
          changes,
          timestamp: new Date()
        });
      },
      (error) => {
        console.error(`Error in real-time subscription for ${collectionName}:`, error);
        if (onError) {
          onError(error);
        } else {
          // Default error handling
          if (error.code === 'permission-denied') {
            console.error('Permission denied. Check Firestore security rules.');
          } else if (error.code === 'unavailable') {
            console.warn('Network unavailable. Subscription will resume when connection is restored.');
          }
        }
      }
    );

    // Store subscription for management
    const subscriptionId = `${collectionName}_${Date.now()}`;
    activeSubscriptions.set(subscriptionId, {
      unsubscribe,
      collection: collectionName,
      timestamp: Date.now()
    });

    // Return enhanced unsubscribe function
    return () => {
      unsubscribe();
      activeSubscriptions.delete(subscriptionId);
      console.log(`Unsubscribed from ${collectionName}`);
    };

  } catch (error) {
    console.error('Error setting up real-time subscription:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time updates for a single document
 * @param {string} collectionName - Name of the Firestore collection
 * @param {string} documentId - ID of the document
 * @param {Function} onUpdate - Callback function called when document changes
 * @param {Function} onError - Optional callback for error handling
 * @returns {Function} Unsubscribe function to stop listening
 */
export function subscribeToDocument(collectionName, documentId, onUpdate, onError = null) {
  try {
    if (!window.firebaseDb) {
      throw new Error('Firebase not initialized');
    }

    const docRef = window.firebaseDoc(window.firebaseDb, collectionName, documentId);

    const unsubscribe = window.firebaseOnSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          onUpdate({
            id: doc.id,
            ...doc.data(),
            exists: true,
            timestamp: new Date()
          });
        } else {
          onUpdate({
            id: documentId,
            exists: false,
            timestamp: new Date()
          });
        }
      },
      (error) => {
        console.error(`Error in document subscription for ${collectionName}/${documentId}:`, error);
        if (onError) {
          onError(error);
        }
      }
    );

    const subscriptionId = `${collectionName}/${documentId}_${Date.now()}`;
    activeSubscriptions.set(subscriptionId, {
      unsubscribe,
      collection: collectionName,
      document: documentId,
      timestamp: Date.now()
    });

    return () => {
      unsubscribe();
      activeSubscriptions.delete(subscriptionId);
      console.log(`Unsubscribed from ${collectionName}/${documentId}`);
    };

  } catch (error) {
    console.error('Error setting up document subscription:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time updates for students
 */
export function subscribeToStudents(onUpdate, onError = null, options = {}) {
  const constraints = {};
  
  if (options.grade) {
    constraints.where = [{ field: 'grade', operator: '==', value: options.grade }];
  }
  
  if (options.orderBy) {
    constraints.orderBy = [{ field: options.orderBy, direction: options.direction || 'asc' }];
  }
  
  if (options.limit) {
    constraints.limit = options.limit;
  }
  
  return subscribeToCollection('students', onUpdate, onError, constraints);
}

/**
 * Subscribe to real-time updates for attendance
 */
export function subscribeToAttendance(classId, date, onUpdate, onError = null) {
  const constraints = {
    where: [
      { field: 'classId', operator: '==', value: classId },
      { field: 'date', operator: '==', value: date }
    ]
  };
  
  return subscribeToCollection('attendance', onUpdate, onError, constraints);
}

/**
 * Subscribe to real-time updates for announcements
 */
export function subscribeToAnnouncements(onUpdate, onError = null, limit = 10) {
  const constraints = {
    orderBy: [{ field: 'date', direction: 'desc' }],
    limit
  };
  
  return subscribeToCollection('announcements', onUpdate, onError, constraints);
}

/**
 * Subscribe to real-time updates for grades
 */
export function subscribeToGrades(classId, term, onUpdate, onError = null) {
  const constraints = {
    where: [
      { field: 'classId', operator: '==', value: classId },
      { field: 'term', operator: '==', value: term }
    ]
  };
  
  return subscribeToCollection('grades', onUpdate, onError, constraints);
}

/**
 * Subscribe to real-time updates for messages
 */
export function subscribeToMessages(userId, onUpdate, onError = null) {
  const constraints = {
    where: [
      { field: 'recipientId', operator: '==', value: userId }
    ],
    orderBy: [{ field: 'timestamp', direction: 'desc' }],
    limit: 50
  };
  
  return subscribeToCollection('messages', onUpdate, onError, constraints);
}

/**
 * Unsubscribe from all active subscriptions
 */
export function unsubscribeAll() {
  console.log(`Unsubscribing from ${activeSubscriptions.size} active subscriptions`);
  
  activeSubscriptions.forEach((subscription, id) => {
    subscription.unsubscribe();
  });
  
  activeSubscriptions.clear();
  console.log('All subscriptions cleared');
}

/**
 * Get count of active subscriptions
 */
export function getActiveSubscriptionsCount() {
  return activeSubscriptions.size;
}

/**
 * Get list of active subscriptions
 */
export function getActiveSubscriptions() {
  const subscriptions = [];
  activeSubscriptions.forEach((sub, id) => {
    subscriptions.push({
      id,
      collection: sub.collection,
      document: sub.document || null,
      timestamp: sub.timestamp
    });
  });
  return subscriptions;
}

/**
 * Monitor connection status and handle reconnection
 */
export function monitorRealtimeConnection(onStatusChange) {
  let isOnline = navigator.onLine;
  
  const updateStatus = () => {
    const newStatus = navigator.onLine;
    if (newStatus !== isOnline) {
      isOnline = newStatus;
      onStatusChange({
        online: isOnline,
        timestamp: new Date(),
        activeSubscriptions: activeSubscriptions.size
      });
      
      if (isOnline) {
        console.log('✓ Connection restored. Real-time subscriptions will resume.');
      } else {
        console.warn('⚠ Connection lost. Real-time subscriptions paused.');
      }
    }
  };
  
  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', updateStatus);
    window.removeEventListener('offline', updateStatus);
  };
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.FirestoreRealtime = {
    subscribeToCollection,
    subscribeToDocument,
    subscribeToStudents,
    subscribeToAttendance,
    subscribeToAnnouncements,
    subscribeToGrades,
    subscribeToMessages,
    unsubscribeAll,
    getActiveSubscriptionsCount,
    getActiveSubscriptions,
    monitorRealtimeConnection
  };
  
  console.log('✓ Firestore Real-time module initialized');
}

/**
 * USAGE EXAMPLES:
 * 
 * 1. Subscribe to students:
 *    const unsubscribe = window.FirestoreRealtime.subscribeToStudents(
 *      (result) => {
 *        console.log('Students updated:', result.data);
 *        console.log('Changes:', result.changes);
 *      },
 *      (error) => console.error('Error:', error),
 *      { grade: '10', orderBy: 'name', limit: 50 }
 *    );
 * 
 * 2. Subscribe to a single document:
 *    const unsubscribe = window.FirestoreRealtime.subscribeToDocument(
 *      'students',
 *      'student123',
 *      (doc) => console.log('Student updated:', doc)
 *    );
 * 
 * 3. Subscribe to announcements:
 *    const unsubscribe = window.FirestoreRealtime.subscribeToAnnouncements(
 *      (result) => updateUI(result.data),
 *      null,
 *      10
 *    );
 * 
 * 4. Clean up when done:
 *    unsubscribe(); // Unsubscribe from specific listener
 *    // OR
 *    window.FirestoreRealtime.unsubscribeAll(); // Unsubscribe from all
 * 
 * 5. Monitor connection:
 *    const cleanup = window.FirestoreRealtime.monitorRealtimeConnection(
 *      (status) => console.log('Connection:', status)
 *    );
 */
