/**
 * Firebase Utility Functions
 * Enhanced helpers for Firebase integration with better error handling,
 * offline support, and performance optimizations
 */

// Check if Firebase is initialized
function waitForFirebase() {
  return new Promise((resolve) => {
    if (window.firebaseAuth && window.firebaseDb) {
      resolve();
    } else {
      const checkInterval = setInterval(() => {
        if (window.firebaseAuth && window.firebaseDb) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    }
  });
}

// Enhanced error handler with user-friendly messages
export function handleFirebaseError(error, context = '') {
  console.error(`Firebase Error (${context}):`, error);
  
  const errorMessages = {
    'permission-denied': 'You do not have permission to perform this action.',
    'not-found': 'The requested resource was not found.',
    'already-exists': 'This resource already exists.',
    'failed-precondition': 'The operation was rejected due to system state.',
    'aborted': 'The operation was aborted. Please try again.',
    'out-of-range': 'The operation was attempted past the valid range.',
    'unauthenticated': 'You must be signed in to perform this action.',
    'resource-exhausted': 'Service quota exceeded. Please try again later.',
    'cancelled': 'The operation was cancelled.',
    'data-loss': 'Data loss or corruption occurred.',
    'unknown': 'An unknown error occurred.',
    'invalid-argument': 'Invalid data provided.',
    'deadline-exceeded': 'The operation took too long. Please try again.',
    'unavailable': 'Service temporarily unavailable. Check your connection.',
    
    // Auth errors
    'auth/user-not-found': 'No user found with these credentials.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/popup-blocked': 'Pop-up blocked. Please allow pop-ups for this site.',
    'auth/popup-closed-by-user': 'Sign-in cancelled.',
  };
  
  const errorCode = error.code || 'unknown';
  return errorMessages[errorCode] || error.message || 'An error occurred. Please try again.';
}

// Safe Firestore write with retry logic
export async function safeFirestoreWrite(operation, maxRetries = 3) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      await waitForFirebase();
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on permission errors
      if (error.code === 'permission-denied') {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }
  
  throw lastError;
}

// Safe Firestore read with caching
const readCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100; // Maximum number of cached entries

export async function safeFirestoreRead(operation, cacheKey = null, useCache = true) {
  await waitForFirebase();
  
  // Check cache first
  if (useCache && cacheKey && readCache.has(cacheKey)) {
    const cached = readCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    } else {
      // Remove expired entry
      readCache.delete(cacheKey);
    }
  }
  
  try {
    const data = await operation();
    
    // Cache the result with LRU eviction
    if (useCache && cacheKey) {
      // If cache is full, remove oldest entry
      if (readCache.size >= MAX_CACHE_SIZE) {
        const firstKey = readCache.keys().next().value;
        readCache.delete(firstKey);
      }
      
      readCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
    }
    
    return data;
  } catch (error) {
    console.error('Firestore read error:', error);
    
    // Return cached data if available on error (even if expired)
    if (useCache && cacheKey && readCache.has(cacheKey)) {
      console.warn('Using cached data due to error');
      return readCache.get(cacheKey).data;
    }
    
    throw error;
  }
}

// Clear read cache
export function clearCache(cacheKey = null) {
  if (cacheKey) {
    readCache.delete(cacheKey);
  } else {
    readCache.clear();
  }
}

// Enable offline persistence
export async function enableOfflineSupport() {
  try {
    await waitForFirebase();
    
    const { enableIndexedDbPersistence } = await import(
      'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
    );
    
    await enableIndexedDbPersistence(window.firebaseDb);
    console.log('✓ Offline persistence enabled');
    return true;
  } catch (error) {
    if (error.code === 'failed-precondition') {
      console.warn('Offline persistence failed: Multiple tabs open');
    } else if (error.code === 'unimplemented') {
      console.warn('Offline persistence not supported in this browser');
    } else {
      console.error('Failed to enable offline persistence:', error);
    }
    return false;
  }
}

// Upload file with progress tracking
export async function uploadFileWithProgress(file, path, onProgress = null) {
  await waitForFirebase();
  
  return new Promise((resolve, reject) => {
    try {
      const storageRef = window.firebaseStorageRef(window.firebaseStorage, path);
      
      // Use uploadBytesResumable for progress tracking, not uploadBytes
      import('https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js')
        .then(({ uploadBytesResumable }) => {
          const uploadTask = uploadBytesResumable(storageRef, file);
          
          if (onProgress) {
            uploadTask.on('state_changed',
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress(progress, snapshot);
              },
              (error) => reject(error),
              async () => {
                const downloadURL = await window.firebaseGetDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
              }
            );
          } else {
            uploadTask.then(async (snapshot) => {
              const downloadURL = await window.firebaseGetDownloadURL(snapshot.ref);
              resolve(downloadURL);
            }).catch(reject);
          }
        })
        .catch(reject);
    } catch (error) {
      reject(error);
    }
  });
}

// Batch write helper
export async function batchWrite(operations) {
  await waitForFirebase();
  
  const { writeBatch } = await import(
    'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
  );
  
  const batch = writeBatch(window.firebaseDb);
  
  operations.forEach(op => {
    const docRef = window.firebaseDoc(window.firebaseDb, op.collection, op.id);
    
    if (op.type === 'set') {
      batch.set(docRef, op.data, op.options || {});
    } else if (op.type === 'update') {
      batch.update(docRef, op.data);
    } else if (op.type === 'delete') {
      batch.delete(docRef);
    }
  });
  
  await batch.commit();
}

// Connection status monitoring
export function monitorConnectionStatus(onStatusChange) {
  let isOnline = navigator.onLine;
  
  const updateStatus = () => {
    const newStatus = navigator.onLine;
    if (newStatus !== isOnline) {
      isOnline = newStatus;
      onStatusChange(isOnline);
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

// Initialize all utilities
export async function initializeFirebaseUtils() {
  await waitForFirebase();
  
  // Enable offline support
  await enableOfflineSupport();
  
  // Monitor connection status
  monitorConnectionStatus((isOnline) => {
    console.log(`Connection status: ${isOnline ? 'Online' : 'Offline'}`);
    
    // Show a subtle notification to user
    const statusEl = document.getElementById('connectionStatus');
    if (statusEl) {
      statusEl.textContent = isOnline ? '🟢 Online' : '🔴 Offline';
      statusEl.className = isOnline ? 'online' : 'offline';
    }
  });
  
  console.log('✓ Firebase utilities initialized');
}

// Make utilities available globally
if (typeof window !== 'undefined') {
  window.FirebaseUtils = {
    handleFirebaseError,
    safeFirestoreWrite,
    safeFirestoreRead,
    clearCache,
    enableOfflineSupport,
    uploadFileWithProgress,
    batchWrite,
    monitorConnectionStatus,
    initializeFirebaseUtils
  };
}
