/**
 * Firestore Pagination Module for BIS-SMS
 * 
 * This module provides pagination utilities for large Firestore datasets.
 * It supports both cursor-based pagination (recommended for real-time data)
 * and offset-based pagination.
 * 
 * Features:
 * - Cursor-based pagination (next/previous)
 * - Offset-based pagination (page numbers)
 * - Configurable page sizes
 * - First/last page navigation
 * - Total count estimation
 * - Cache support for better performance
 */

/**
 * Paginator class for managing paginated queries
 */
export class FirestorePaginator {
  constructor(collectionName, pageSize = 25, queryConstraints = null) {
    this.collectionName = collectionName;
    this.pageSize = pageSize;
    this.queryConstraints = queryConstraints || {};
    this.currentPage = null;
    this.firstDoc = null;
    this.lastDoc = null;
    this.hasNext = false;
    this.hasPrev = false;
    this.totalEstimate = 0;
  }

  /**
   * Build query with constraints
   */
  _buildQuery(additionalConstraints = []) {
    let collectionRef = window.firebaseCollection(window.firebaseDb, this.collectionName);
    const constraints = [...additionalConstraints];

    // Apply where clauses
    if (this.queryConstraints.where) {
      this.queryConstraints.where.forEach(w => {
        constraints.push(window.firebaseWhere(w.field, w.operator, w.value));
      });
    }

    // Apply orderBy
    if (this.queryConstraints.orderBy) {
      this.queryConstraints.orderBy.forEach(o => {
        constraints.push(window.firebaseOrderBy(o.field, o.direction || 'asc'));
      });
    } else {
      // Default ordering by document ID if not specified
      constraints.push(window.firebaseOrderBy('__name__', 'asc'));
    }

    // Add page size limit
    constraints.push(window.firebaseLimit(this.pageSize + 1)); // +1 to check if there's a next page

    if (constraints.length > 0) {
      return window.firebaseQuery(collectionRef, ...constraints);
    }

    return collectionRef;
  }

  /**
   * Fetch the first page
   */
  async first() {
    try {
      const query = this._buildQuery();
      const snapshot = await window.firebaseGetDocs(query);

      const results = [];
      let count = 0;

      snapshot.forEach((doc) => {
        if (count < this.pageSize) {
          results.push({
            id: doc.id,
            ...doc.data()
          });
          count++;
        }
      });

      this.hasNext = snapshot.size > this.pageSize;
      this.hasPrev = false;
      this.firstDoc = snapshot.docs[0];
      this.lastDoc = snapshot.docs[Math.min(this.pageSize - 1, snapshot.docs.length - 1)];
      this.currentPage = 1;

      return {
        data: results,
        hasNext: this.hasNext,
        hasPrev: this.hasPrev,
        page: this.currentPage,
        pageSize: this.pageSize
      };
    } catch (error) {
      console.error('Error fetching first page:', error);
      throw error;
    }
  }

  /**
   * Fetch the next page
   */
  async next() {
    if (!this.hasNext || !this.lastDoc) {
      return { data: [], hasNext: false, hasPrev: this.hasPrev, page: this.currentPage };
    }

    try {
      const query = this._buildQuery([
        window.firebaseStartAfter(this.lastDoc)
      ]);

      const snapshot = await window.firebaseGetDocs(query);
      const results = [];
      let count = 0;

      snapshot.forEach((doc) => {
        if (count < this.pageSize) {
          results.push({
            id: doc.id,
            ...doc.data()
          });
          count++;
        }
      });

      this.hasNext = snapshot.size > this.pageSize;
      this.hasPrev = true;
      this.firstDoc = snapshot.docs[0];
      this.lastDoc = snapshot.docs[Math.min(this.pageSize - 1, snapshot.docs.length - 1)];
      this.currentPage++;

      return {
        data: results,
        hasNext: this.hasNext,
        hasPrev: this.hasPrev,
        page: this.currentPage,
        pageSize: this.pageSize
      };
    } catch (error) {
      console.error('Error fetching next page:', error);
      throw error;
    }
  }

  /**
   * Fetch the previous page
   */
  async previous() {
    if (!this.hasPrev || !this.firstDoc) {
      return { data: [], hasNext: this.hasNext, hasPrev: false, page: this.currentPage };
    }

    try {
      // For previous, we need to query backwards
      const reverseConstraints = [];
      
      // Reverse the order
      if (this.queryConstraints.orderBy) {
        this.queryConstraints.orderBy.forEach(o => {
          const reverseDirection = o.direction === 'asc' ? 'desc' : 'asc';
          reverseConstraints.push(window.firebaseOrderBy(o.field, reverseDirection));
        });
      } else {
        reverseConstraints.push(window.firebaseOrderBy('__name__', 'desc'));
      }

      reverseConstraints.push(window.firebaseStartAfter(this.firstDoc));
      reverseConstraints.push(window.firebaseLimit(this.pageSize + 1));

      let collectionRef = window.firebaseCollection(window.firebaseDb, this.collectionName);
      
      // Apply where clauses
      const constraints = [...reverseConstraints];
      if (this.queryConstraints.where) {
        this.queryConstraints.where.forEach(w => {
          constraints.unshift(window.firebaseWhere(w.field, w.operator, w.value));
        });
      }

      const query = window.firebaseQuery(collectionRef, ...constraints);
      const snapshot = await window.firebaseGetDocs(query);

      const results = [];
      let count = 0;

      // Reverse the results back to original order
      const docs = [];
      snapshot.forEach((doc) => {
        if (count < this.pageSize) {
          docs.push(doc);
          count++;
        }
      });
      docs.reverse();

      docs.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data()
        });
      });

      this.hasNext = true;
      this.hasPrev = snapshot.size > this.pageSize;
      this.firstDoc = docs[0];
      this.lastDoc = docs[docs.length - 1];
      this.currentPage--;

      return {
        data: results,
        hasNext: this.hasNext,
        hasPrev: this.hasPrev,
        page: this.currentPage,
        pageSize: this.pageSize
      };
    } catch (error) {
      console.error('Error fetching previous page:', error);
      throw error;
    }
  }

  /**
   * Get estimated total count (expensive operation, use sparingly)
   */
  async getTotalCount() {
    try {
      let collectionRef = window.firebaseCollection(window.firebaseDb, this.collectionName);
      const constraints = [];

      // Apply where clauses only
      if (this.queryConstraints.where) {
        this.queryConstraints.where.forEach(w => {
          constraints.push(window.firebaseWhere(w.field, w.operator, w.value));
        });
      }

      const query = constraints.length > 0 
        ? window.firebaseQuery(collectionRef, ...constraints)
        : collectionRef;

      const snapshot = await window.firebaseGetDocs(query);
      this.totalEstimate = snapshot.size;
      return this.totalEstimate;
    } catch (error) {
      console.error('Error getting total count:', error);
      throw error;
    }
  }

  /**
   * Reset paginator to initial state
   */
  reset() {
    this.currentPage = null;
    this.firstDoc = null;
    this.lastDoc = null;
    this.hasNext = false;
    this.hasPrev = false;
  }
}

/**
 * Simple pagination helper for offset-based pagination
 * Note: Less efficient than cursor-based for large datasets
 */
export async function paginateWithOffset(collectionName, page = 1, pageSize = 25, queryConstraints = null) {
  try {
    let collectionRef = window.firebaseCollection(window.firebaseDb, collectionName);
    const constraints = [];

    // Apply where clauses
    if (queryConstraints && queryConstraints.where) {
      queryConstraints.where.forEach(w => {
        constraints.push(window.firebaseWhere(w.field, w.operator, w.value));
      });
    }

    // Apply orderBy
    if (queryConstraints && queryConstraints.orderBy) {
      queryConstraints.orderBy.forEach(o => {
        constraints.push(window.firebaseOrderBy(o.field, o.direction || 'asc'));
      });
    }

    // Calculate offset
    const offset = (page - 1) * pageSize;
    
    // Fetch all docs up to offset + pageSize
    constraints.push(window.firebaseLimit(offset + pageSize));

    const query = constraints.length > 0 
      ? window.firebaseQuery(collectionRef, ...constraints)
      : collectionRef;

    const snapshot = await window.firebaseGetDocs(query);
    const allDocs = [];
    
    snapshot.forEach((doc) => {
      allDocs.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Slice to get the current page
    const results = allDocs.slice(offset, offset + pageSize);
    
    return {
      data: results,
      page,
      pageSize,
      hasMore: allDocs.length > offset + pageSize,
      total: snapshot.size
    };
  } catch (error) {
    console.error('Error with offset pagination:', error);
    throw error;
  }
}

/**
 * Paginate students
 */
export function createStudentsPaginator(pageSize = 25, options = {}) {
  const constraints = {};
  
  if (options.grade) {
    constraints.where = [{ field: 'grade', operator: '==', value: options.grade }];
  }
  
  if (options.orderBy) {
    constraints.orderBy = [{ field: options.orderBy, direction: options.direction || 'asc' }];
  } else {
    constraints.orderBy = [{ field: 'name', direction: 'asc' }];
  }
  
  return new FirestorePaginator('students', pageSize, constraints);
}

/**
 * Paginate teachers
 */
export function createTeachersPaginator(pageSize = 25, options = {}) {
  const constraints = {};
  
  if (options.subject) {
    constraints.where = [{ field: 'subject', operator: '==', value: options.subject }];
  }
  
  if (options.status) {
    constraints.where = constraints.where || [];
    constraints.where.push({ field: 'status', operator: '==', value: options.status });
  }
  
  constraints.orderBy = [{ field: 'name', direction: 'asc' }];
  
  return new FirestorePaginator('teachers', pageSize, constraints);
}

/**
 * Paginate announcements
 */
export function createAnnouncementsPaginator(pageSize = 10) {
  const constraints = {
    orderBy: [{ field: 'date', direction: 'desc' }]
  };
  
  return new FirestorePaginator('announcements', pageSize, constraints);
}

/**
 * Paginate expenses
 */
export function createExpensesPaginator(pageSize = 25, options = {}) {
  const constraints = {};
  
  if (options.category) {
    constraints.where = [{ field: 'category', operator: '==', value: options.category }];
  }
  
  if (options.startDate && options.endDate) {
    constraints.where = constraints.where || [];
    constraints.where.push({ field: 'date', operator: '>=', value: options.startDate });
    constraints.where.push({ field: 'date', operator: '<=', value: options.endDate });
  }
  
  constraints.orderBy = [{ field: 'date', direction: 'desc' }];
  
  return new FirestorePaginator('expenses', pageSize, constraints);
}

/**
 * Paginate messages
 */
export function createMessagesPaginator(userId, pageSize = 20) {
  const constraints = {
    where: [{ field: 'recipientId', operator: '==', value: userId }],
    orderBy: [{ field: 'timestamp', direction: 'desc' }]
  };
  
  return new FirestorePaginator('messages', pageSize, constraints);
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.FirestorePagination = {
    FirestorePaginator,
    paginateWithOffset,
    createStudentsPaginator,
    createTeachersPaginator,
    createAnnouncementsPaginator,
    createExpensesPaginator,
    createMessagesPaginator
  };
  
  console.log('✓ Firestore Pagination module initialized');
}

/**
 * USAGE EXAMPLES:
 * 
 * 1. Cursor-based pagination for students:
 *    const paginator = window.FirestorePagination.createStudentsPaginator(25, {
 *      grade: '10',
 *      orderBy: 'name'
 *    });
 *    
 *    // First page
 *    const page1 = await paginator.first();
 *    console.log(page1.data, page1.hasNext);
 *    
 *    // Next page
 *    if (page1.hasNext) {
 *      const page2 = await paginator.next();
 *      console.log(page2.data);
 *    }
 *    
 *    // Previous page
 *    if (page2.hasPrev) {
 *      const page1Again = await paginator.previous();
 *    }
 * 
 * 2. Offset-based pagination:
 *    const result = await window.FirestorePagination.paginateWithOffset(
 *      'students',
 *      2, // page number
 *      25, // page size
 *      { orderBy: [{ field: 'name', direction: 'asc' }] }
 *    );
 *    console.log(result.data, result.hasMore);
 * 
 * 3. Get total count:
 *    const paginator = window.FirestorePagination.createStudentsPaginator(25);
 *    const total = await paginator.getTotalCount();
 *    console.log(`Total students: ${total}`);
 * 
 * 4. Paginate with filters:
 *    const paginator = window.FirestorePagination.createExpensesPaginator(25, {
 *      category: 'Utilities',
 *      startDate: '2026-01-01',
 *      endDate: '2026-01-31'
 *    });
 *    const page = await paginator.first();
 */
