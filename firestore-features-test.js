/**
 * Simple Test Script for Firestore Advanced Features
 * 
 * This script performs basic validation tests on the modules.
 * Run this in a browser console after loading the modules.
 */

async function runTests() {
  console.log('🧪 Starting Firestore Advanced Features Tests...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  function test(name, fn) {
    try {
      fn();
      console.log(`✅ PASS: ${name}`);
      results.passed++;
      results.tests.push({ name, status: 'PASS' });
    } catch (error) {
      console.error(`❌ FAIL: ${name}`, error);
      results.failed++;
      results.tests.push({ name, status: 'FAIL', error: error.message });
    }
  }
  
  // Test 1: Module Loading
  console.group('📦 Module Loading Tests');
  
  test('FirestoreRealtime module loaded', () => {
    if (!window.FirestoreRealtime) throw new Error('Module not loaded');
  });
  
  test('FirestorePagination module loaded', () => {
    if (!window.FirestorePagination) throw new Error('Module not loaded');
  });
  
  test('FirestoreAudit module loaded', () => {
    if (!window.FirestoreAudit) throw new Error('Module not loaded');
  });
  
  test('FirestoreBackup module loaded', () => {
    if (!window.FirestoreBackup) throw new Error('Module not loaded');
  });
  
  console.groupEnd();
  
  // Test 2: Real-time Sync API
  console.group('🔄 Real-time Sync API Tests');
  
  test('subscribeToCollection function exists', () => {
    if (typeof window.FirestoreRealtime.subscribeToCollection !== 'function') {
      throw new Error('Function not found');
    }
  });
  
  test('subscribeToDocument function exists', () => {
    if (typeof window.FirestoreRealtime.subscribeToDocument !== 'function') {
      throw new Error('Function not found');
    }
  });
  
  test('unsubscribeAll function exists', () => {
    if (typeof window.FirestoreRealtime.unsubscribeAll !== 'function') {
      throw new Error('Function not found');
    }
  });
  
  test('getActiveSubscriptionsCount function exists', () => {
    if (typeof window.FirestoreRealtime.getActiveSubscriptionsCount !== 'function') {
      throw new Error('Function not found');
    }
  });
  
  test('Initial subscription count is 0', () => {
    const count = window.FirestoreRealtime.getActiveSubscriptionsCount();
    if (count !== 0) throw new Error(`Expected 0, got ${count}`);
  });
  
  console.groupEnd();
  
  // Test 3: Pagination API
  console.group('📄 Pagination API Tests');
  
  test('FirestorePaginator class exists', () => {
    if (typeof window.FirestorePagination.FirestorePaginator !== 'function') {
      throw new Error('Class not found');
    }
  });
  
  test('createStudentsPaginator function exists', () => {
    if (typeof window.FirestorePagination.createStudentsPaginator !== 'function') {
      throw new Error('Function not found');
    }
  });
  
  test('Can create a paginator instance', () => {
    const paginator = window.FirestorePagination.createStudentsPaginator(25);
    if (!paginator) throw new Error('Failed to create paginator');
    if (paginator.pageSize !== 25) throw new Error('Page size not set correctly');
  });
  
  test('Paginator has required methods', () => {
    const paginator = window.FirestorePagination.createStudentsPaginator(10);
    const methods = ['first', 'next', 'previous', 'getTotalCount', 'reset'];
    methods.forEach(method => {
      if (typeof paginator[method] !== 'function') {
        throw new Error(`Method ${method} not found`);
      }
    });
  });
  
  console.groupEnd();
  
  // Test 4: Audit Logging API
  console.group('📝 Audit Logging API Tests');
  
  test('createAuditLog function exists', () => {
    if (typeof window.FirestoreAudit.createAuditLog !== 'function') {
      throw new Error('Function not found');
    }
  });
  
  test('AuditedFirestoreOperation class exists', () => {
    if (!window.FirestoreAudit.AuditedFirestoreOperation) {
      throw new Error('Class not found');
    }
  });
  
  test('Audit log helper functions exist', () => {
    const functions = ['logCreate', 'logUpdate', 'logDelete', 'logRead', 'logLogin', 'logLogout'];
    functions.forEach(fn => {
      if (typeof window.FirestoreAudit[fn] !== 'function') {
        throw new Error(`Function ${fn} not found`);
      }
    });
  });
  
  test('Audit query functions exist', () => {
    const functions = [
      'getAuditLogsByUser',
      'getAuditLogsByAction',
      'getAuditLogsByResource',
      'getAuditLogsByDateRange',
      'getRecentAuditLogs',
      'getAuditStatistics'
    ];
    functions.forEach(fn => {
      if (typeof window.FirestoreAudit[fn] !== 'function') {
        throw new Error(`Function ${fn} not found`);
      }
    });
  });
  
  console.groupEnd();
  
  // Test 5: Backup API
  console.group('💾 Backup API Tests');
  
  test('backupCollection function exists', () => {
    if (typeof window.FirestoreBackup.backupCollection !== 'function') {
      throw new Error('Function not found');
    }
  });
  
  test('backupDatabase function exists', () => {
    if (typeof window.FirestoreBackup.backupDatabase !== 'function') {
      throw new Error('Function not found');
    }
  });
  
  test('BACKUP_PRESETS defined', () => {
    if (!window.FirestoreBackup.BACKUP_PRESETS) {
      throw new Error('BACKUP_PRESETS not found');
    }
    const presets = ['CORE', 'ACADEMIC', 'FINANCIAL', 'ALL'];
    presets.forEach(preset => {
      if (!window.FirestoreBackup.BACKUP_PRESETS[preset]) {
        throw new Error(`Preset ${preset} not found`);
      }
    });
  });
  
  test('validateBackup function exists', () => {
    if (typeof window.FirestoreBackup.validateBackup !== 'function') {
      throw new Error('Function not found');
    }
  });
  
  test('Backup validation works', () => {
    const invalidBackup = { metadata: null, collections: null };
    const result = window.FirestoreBackup.validateBackup(invalidBackup);
    if (result.valid) throw new Error('Should have failed validation');
    if (result.errors.length === 0) throw new Error('Should have errors');
  });
  
  test('Valid backup passes validation', () => {
    const validBackup = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        collections: ['students']
      },
      collections: {
        students: []
      }
    };
    const result = window.FirestoreBackup.validateBackup(validBackup);
    if (!result.valid && result.errors.length > 0) {
      throw new Error('Valid backup failed validation: ' + result.errors.join(', '));
    }
  });
  
  console.groupEnd();
  
  // Print Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${results.passed + results.failed}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(50));
  
  if (results.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.tests.filter(t => t.status === 'FAIL').forEach(t => {
      console.log(`  - ${t.name}: ${t.error}`);
    });
  }
  
  return results;
}

// Auto-run if loaded in browser
if (typeof window !== 'undefined') {
  console.log('Test script loaded. Run runTests() to execute tests.');
  window.runFirestoreTests = runTests;
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runTests };
}
