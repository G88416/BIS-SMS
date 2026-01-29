/**
 * Integration Helper for Firestore Queries
 * 
 * This file provides wrapper functions that make it easy to integrate
 * the Firestore queries into the existing BIS-SMS application code.
 * 
 * Simply include this file after firestore-queries.js and use the
 * window.FirestoreAPI object to access all query functions.
 */

// Make the query functions available globally via window object
// This allows usage in inline scripts and existing code structure

(async function() {
  // Wait for Firebase to be initialized
  if (typeof window.firebaseDb === 'undefined') {
    console.warn('Firebase not yet initialized. Waiting...');
    await new Promise(resolve => {
      const checkFirebase = setInterval(() => {
        if (typeof window.firebaseDb !== 'undefined') {
          clearInterval(checkFirebase);
          resolve();
        }
      }, 100);
    });
  }

  // Import all query functions
  const {
    // Dashboard
    getDashboardStats,
    getRecentActivities,
    
    // Students
    getAllStudents,
    getStudentsByGrade,
    getStudentById,
    searchStudents,
    
    // Teachers
    getAllTeachers,
    getTeachersBySubject,
    getTeachersByStatus,
    searchTeachers,
    
    // Classes
    getAllClasses,
    getClassesByGrade,
    getClassesByTeacher,
    getClassWithStudents,
    
    // Attendance
    getAttendanceByClassAndDate,
    getAttendanceByClassAndDateRange,
    getStudentAttendanceSummary,
    
    // Grades
    getGradesByClassAndTerm,
    getGradesByStudent,
    getClassGradeStatistics,
    getClassSubjects,
    
    // Finance
    getAllFees,
    getStudentFees,
    getStudentsWithOutstandingFees,
    getAllExpenses,
    getExpensesByDateRange,
    getExpensesByCategory,
    getFinancialSummary,
    
    // Reports
    generateFinancialReport,
    generateAttendanceReport,
    generateGradesReport,
    generateSchoolReport,
    
    // Utilities
    getAnnouncements,
    getUpcomingEvents
  } = await import('./firestore-queries.js');

  // Create a global API object
  window.FirestoreAPI = {
    // Dashboard
    getDashboardStats,
    getRecentActivities,
    
    // Students
    getAllStudents,
    getStudentsByGrade,
    getStudentById,
    searchStudents,
    
    // Teachers
    getAllTeachers,
    getTeachersBySubject,
    getTeachersByStatus,
    searchTeachers,
    
    // Classes
    getAllClasses,
    getClassesByGrade,
    getClassesByTeacher,
    getClassWithStudents,
    
    // Attendance
    getAttendanceByClassAndDate,
    getAttendanceByClassAndDateRange,
    getStudentAttendanceSummary,
    
    // Grades
    getGradesByClassAndTerm,
    getGradesByStudent,
    getClassGradeStatistics,
    getClassSubjects,
    
    // Finance
    getAllFees,
    getStudentFees,
    getStudentsWithOutstandingFees,
    getAllExpenses,
    getExpensesByDateRange,
    getExpensesByCategory,
    getFinancialSummary,
    
    // Reports
    generateFinancialReport,
    generateAttendanceReport,
    generateGradesReport,
    generateSchoolReport,
    
    // Utilities
    getAnnouncements,
    getUpcomingEvents,
    
    // Convenience wrappers for common use cases
    async loadDashboardData() {
      try {
        const stats = await getDashboardStats();
        const activities = await getRecentActivities(5);
        return { stats, activities };
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        throw error;
      }
    },
    
    async loadStudentsData(options = {}) {
      try {
        if (options.search) {
          return await searchStudents(options.search);
        } else if (options.grade) {
          return await getStudentsByGrade(options.grade);
        } else {
          return await getAllStudents();
        }
      } catch (error) {
        console.error('Error loading students:', error);
        throw error;
      }
    },
    
    async loadTeachersData(options = {}) {
      try {
        if (options.search) {
          return await searchTeachers(options.search);
        } else if (options.subject) {
          return await getTeachersBySubject(options.subject);
        } else if (options.status) {
          return await getTeachersByStatus(options.status);
        } else {
          return await getAllTeachers();
        }
      } catch (error) {
        console.error('Error loading teachers:', error);
        throw error;
      }
    },
    
    async loadClassesData(options = {}) {
      try {
        if (options.grade) {
          return await getClassesByGrade(options.grade);
        } else if (options.teacherId) {
          return await getClassesByTeacher(options.teacherId);
        } else {
          return await getAllClasses();
        }
      } catch (error) {
        console.error('Error loading classes:', error);
        throw error;
      }
    },
    
    async loadAttendanceData(classId, date) {
      try {
        if (!classId || !date) {
          throw new Error('Class ID and date are required');
        }
        return await getAttendanceByClassAndDate(classId, date);
      } catch (error) {
        console.error('Error loading attendance:', error);
        throw error;
      }
    },
    
    async loadGradesData(classId, term) {
      try {
        if (!classId || !term) {
          throw new Error('Class ID and term are required');
        }
        return await getGradesByClassAndTerm(classId, term);
      } catch (error) {
        console.error('Error loading grades:', error);
        throw error;
      }
    },
    
    async loadFinanceData() {
      try {
        const [fees, expenses, summary] = await Promise.all([
          getAllFees(),
          getAllExpenses(),
          getFinancialSummary()
        ]);
        return { fees, expenses, summary };
      } catch (error) {
        console.error('Error loading finance data:', error);
        throw error;
      }
    }
  };

  console.log('✅ Firestore API initialized and available at window.FirestoreAPI');
  
  // Load additional modules (real-time, pagination, audit, backup)
  // These modules will be available at:
  // - window.FirestoreRealtime
  // - window.FirestorePagination
  // - window.FirestoreAudit
  // - window.FirestoreBackup
  
  // Dispatch event to notify that API is ready
  window.dispatchEvent(new Event('firestoreApiReady'));
})();

/**
 * USAGE EXAMPLES:
 * 
 * 1. Load Dashboard:
 *    const { stats, activities } = await window.FirestoreAPI.loadDashboardData();
 * 
 * 2. Load Students:
 *    const students = await window.FirestoreAPI.loadStudentsData({ grade: '10' });
 * 
 * 3. Search Students:
 *    const results = await window.FirestoreAPI.loadStudentsData({ search: 'john' });
 * 
 * 4. Load Teachers:
 *    const teachers = await window.FirestoreAPI.loadTeachersData({ status: 'Active' });
 * 
 * 5. Load Classes:
 *    const classes = await window.FirestoreAPI.loadClassesData({ grade: '10' });
 * 
 * 6. Load Attendance:
 *    const attendance = await window.FirestoreAPI.loadAttendanceData('class123', '2026-01-20');
 * 
 * 7. Load Grades:
 *    const grades = await window.FirestoreAPI.loadGradesData('class123', 'Term 1 2026');
 * 
 * 8. Load Finance Data:
 *    const { fees, expenses, summary } = await window.FirestoreAPI.loadFinanceData();
 * 
 * 9. Generate Report:
 *    const report = await window.FirestoreAPI.generateFinancialReport(startDate, endDate);
 * 
 * 10. Get Announcements:
 *     const announcements = await window.FirestoreAPI.getAnnouncements(5);
 */
