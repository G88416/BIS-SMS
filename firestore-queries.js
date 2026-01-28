/**
 * Firestore Queries Module for BIS-SMS
 * 
 * This module contains all Firestore query functions organized by feature area.
 * Each function returns a Promise that resolves to the query result.
 * 
 * Usage:
 * Import the functions you need and call them with the appropriate parameters.
 * All functions assume that Firebase has been initialized and firebaseDb is available.
 */

/**
 * ========================================
 * DASHBOARD QUERIES
 * ========================================
 */

/**
 * Get dashboard statistics
 * @returns {Promise<Object>} Dashboard stats including student count, fees, expenses
 */
export async function getDashboardStats() {
  try {
    // Get total students count
    const studentsSnapshot = await window.firebaseGetDocs(
      window.firebaseCollection(window.firebaseDb, 'students')
    );
    const totalStudents = studentsSnapshot.size;

    // Get all fees data for financial calculations
    const feesSnapshot = await window.firebaseGetDocs(
      window.firebaseCollection(window.firebaseDb, 'fees')
    );
    
    let totalDue = 0;
    let totalPaid = 0;
    let totalBalance = 0;
    
    feesSnapshot.forEach((doc) => {
      const fee = doc.data();
      const itemsTotal = (fee.items || []).reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
      const discountsTotal = (fee.discounts || []).reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
      const netDue = itemsTotal - discountsTotal;
      const paidTotal = (fee.payments || []).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
      const balance = netDue - paidTotal;
      
      totalDue += netDue;
      totalPaid += paidTotal;
      totalBalance += balance;
    });

    // Get total expenses
    const expensesSnapshot = await window.firebaseGetDocs(
      window.firebaseCollection(window.firebaseDb, 'expenses')
    );
    
    const totalExpenses = expensesSnapshot.docs.reduce((sum, doc) => {
      return sum + (parseFloat(doc.data().amount) || 0);
    }, 0);

    const collectionRate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;
    const netSurplus = totalPaid - totalExpenses;

    return {
      totalStudents,
      totalDue,
      totalPaid,
      totalBalance,
      totalExpenses,
      collectionRate,
      netSurplus
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

/**
 * Get recent activities for dashboard
 * @param {number} limit - Number of activities to fetch
 * @returns {Promise<Array>} Array of recent activities
 */
export async function getRecentActivities(limit = 10) {
  try {
    // Get recent announcements
    const announcementsQuery = window.firebaseQuery(
      window.firebaseCollection(window.firebaseDb, 'announcements'),
      window.firebaseOrderBy('date', 'desc')
    );
    
    const announcementsSnapshot = await window.firebaseGetDocs(announcementsQuery);
    const activities = [];
    
    announcementsSnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        type: 'announcement',
        ...doc.data()
      });
    });

    // Sort by date and limit
    return activities.sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateB - dateA;
    }).slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
}

/**
 * ========================================
 * STUDENTS QUERIES
 * ========================================
 */

/**
 * Get all students
 * @returns {Promise<Array>} Array of all students
 */
export async function getAllStudents() {
  try {
    const studentsQuery = window.firebaseQuery(
      window.firebaseCollection(window.firebaseDb, 'students'),
      window.firebaseOrderBy('name')
    );
    
    const snapshot = await window.firebaseGetDocs(studentsQuery);
    const students = [];
    
    snapshot.forEach((doc) => {
      students.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return students;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
}

/**
 * Get students by grade
 * @param {string} grade - Grade to filter by
 * @returns {Promise<Array>} Array of students in the specified grade
 */
export async function getStudentsByGrade(grade) {
  try {
    const studentsQuery = window.firebaseQuery(
      window.firebaseCollection(window.firebaseDb, 'students'),
      window.firebaseWhere('grade', '==', grade),
      window.firebaseOrderBy('name')
    );
    
    const snapshot = await window.firebaseGetDocs(studentsQuery);
    const students = [];
    
    snapshot.forEach((doc) => {
      students.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return students;
  } catch (error) {
    console.error('Error fetching students by grade:', error);
    throw error;
  }
}

/**
 * Get a single student by ID
 * @param {string} studentId - Student ID (document ID)
 * @returns {Promise<Object>} Student data
 */
export async function getStudentById(studentId) {
  try {
    // Use getDoc to fetch a single document by ID
    const { getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const studentDocRef = window.firebaseDoc(window.firebaseDb, 'students', studentId);
    const studentDoc = await getDoc(studentDocRef);
    
    if (!studentDoc.exists()) {
      throw new Error('Student not found');
    }
    
    return {
      id: studentDoc.id,
      ...studentDoc.data()
    };
  } catch (error) {
    console.error('Error fetching student:', error);
    throw error;
  }
}

/**
 * Search students by name
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Array of matching students
 */
export async function searchStudents(searchTerm) {
  try {
    // Note: Firestore doesn't support full-text search natively
    // This is a basic implementation that fetches all students and filters client-side
    const students = await getAllStudents();
    const term = searchTerm.toLowerCase();
    
    return students.filter(student => 
      student.name.toLowerCase().includes(term) ||
      (student.id && student.id.toString().includes(term))
    );
  } catch (error) {
    console.error('Error searching students:', error);
    throw error;
  }
}

/**
 * ========================================
 * TEACHERS QUERIES
 * ========================================
 */

/**
 * Get all teachers
 * @returns {Promise<Array>} Array of all teachers
 */
export async function getAllTeachers() {
  try {
    const teachersQuery = window.firebaseQuery(
      window.firebaseCollection(window.firebaseDb, 'teachers'),
      window.firebaseOrderBy('name')
    );
    
    const snapshot = await window.firebaseGetDocs(teachersQuery);
    const teachers = [];
    
    snapshot.forEach((doc) => {
      teachers.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return teachers;
  } catch (error) {
    console.error('Error fetching teachers:', error);
    throw error;
  }
}

/**
 * Get teachers by subject
 * @param {string} subject - Subject to filter by
 * @returns {Promise<Array>} Array of teachers teaching the specified subject
 */
export async function getTeachersBySubject(subject) {
  try {
    const teachersQuery = window.firebaseQuery(
      window.firebaseCollection(window.firebaseDb, 'teachers'),
      window.firebaseWhere('subject', '==', subject),
      window.firebaseOrderBy('name')
    );
    
    const snapshot = await window.firebaseGetDocs(teachersQuery);
    const teachers = [];
    
    snapshot.forEach((doc) => {
      teachers.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return teachers;
  } catch (error) {
    console.error('Error fetching teachers by subject:', error);
    throw error;
  }
}

/**
 * Get teachers by status
 * @param {string} status - Status to filter by (Active, Inactive, etc.)
 * @returns {Promise<Array>} Array of teachers with the specified status
 */
export async function getTeachersByStatus(status) {
  try {
    const teachersQuery = window.firebaseQuery(
      window.firebaseCollection(window.firebaseDb, 'teachers'),
      window.firebaseWhere('status', '==', status),
      window.firebaseOrderBy('name')
    );
    
    const snapshot = await window.firebaseGetDocs(teachersQuery);
    const teachers = [];
    
    snapshot.forEach((doc) => {
      teachers.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return teachers;
  } catch (error) {
    console.error('Error fetching teachers by status:', error);
    throw error;
  }
}

/**
 * Search teachers by name or subject
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Array of matching teachers
 */
export async function searchTeachers(searchTerm) {
  try {
    const teachers = await getAllTeachers();
    const term = searchTerm.toLowerCase();
    
    return teachers.filter(teacher => 
      teacher.name.toLowerCase().includes(term) ||
      (teacher.subject && teacher.subject.toLowerCase().includes(term))
    );
  } catch (error) {
    console.error('Error searching teachers:', error);
    throw error;
  }
}

/**
 * ========================================
 * CLASSES QUERIES
 * ========================================
 */

/**
 * Get all classes
 * @returns {Promise<Array>} Array of all classes
 */
export async function getAllClasses() {
  try {
    const classesQuery = window.firebaseQuery(
      window.firebaseCollection(window.firebaseDb, 'classes'),
      window.firebaseOrderBy('name')
    );
    
    const snapshot = await window.firebaseGetDocs(classesQuery);
    const classes = [];
    
    snapshot.forEach((doc) => {
      classes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return classes;
  } catch (error) {
    console.error('Error fetching classes:', error);
    throw error;
  }
}

/**
 * Get classes by grade
 * @param {string} grade - Grade to filter by
 * @returns {Promise<Array>} Array of classes in the specified grade
 */
export async function getClassesByGrade(grade) {
  try {
    const classesQuery = window.firebaseQuery(
      window.firebaseCollection(window.firebaseDb, 'classes'),
      window.firebaseWhere('grade', '==', grade),
      window.firebaseOrderBy('name')
    );
    
    const snapshot = await window.firebaseGetDocs(classesQuery);
    const classes = [];
    
    snapshot.forEach((doc) => {
      classes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return classes;
  } catch (error) {
    console.error('Error fetching classes by grade:', error);
    throw error;
  }
}

/**
 * Get classes by teacher
 * @param {string} teacherId - Teacher ID
 * @returns {Promise<Array>} Array of classes taught by the specified teacher
 */
export async function getClassesByTeacher(teacherId) {
  try {
    const classesQuery = window.firebaseQuery(
      window.firebaseCollection(window.firebaseDb, 'classes'),
      window.firebaseWhere('teacherId', '==', teacherId),
      window.firebaseOrderBy('grade'),
      window.firebaseOrderBy('name')
    );
    
    const snapshot = await window.firebaseGetDocs(classesQuery);
    const classes = [];
    
    snapshot.forEach((doc) => {
      classes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return classes;
  } catch (error) {
    console.error('Error fetching classes by teacher:', error);
    throw error;
  }
}

/**
 * Get class with enrolled students
 * @param {string} classId - Class ID (document ID)
 * @returns {Promise<Object>} Class data with student details
 */
export async function getClassWithStudents(classId) {
  try {
    // Use getDoc to fetch a single document by ID
    const { getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const classDocRef = window.firebaseDoc(window.firebaseDb, 'classes', classId);
    const classDoc = await getDoc(classDocRef);
    
    if (!classDoc.exists()) {
      throw new Error('Class not found');
    }
    
    const classData = classDoc.data();
    
    // Fetch enrolled students if studentIds exist
    if (classData.studentIds && classData.studentIds.length > 0) {
      // Fetch students in batches to avoid too many simultaneous requests
      const students = [];
      for (const studentId of classData.studentIds) {
        try {
          const student = await getStudentById(studentId);
          students.push(student);
        } catch (error) {
          console.warn(`Could not fetch student ${studentId}:`, error);
        }
      }
      classData.students = students;
    } else {
      classData.students = [];
    }
    
    return {
      id: classDoc.id,
      ...classData
    };
  } catch (error) {
    console.error('Error fetching class with students:', error);
    throw error;
  }
}

/**
 * ========================================
 * ATTENDANCE QUERIES
 * ========================================
 */

/**
 * Get attendance for a specific class and date
 * @param {string} classId - Class ID (document ID)
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Attendance data
 */
export async function getAttendanceByClassAndDate(classId, date) {
  try {
    const { getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const attendanceDocRef = window.firebaseDoc(window.firebaseDb, 'attendance', classId);
    const attendanceDoc = await getDoc(attendanceDocRef);
    
    if (!attendanceDoc.exists()) {
      return { classId, date, records: {} };
    }
    
    const attendanceData = attendanceDoc.data();
    
    // Return attendance for the specific date
    return {
      classId,
      date,
      records: attendanceData[date] || {}
    };
  } catch (error) {
    console.error('Error fetching attendance:', error);
    throw error;
  }
}

/**
 * Get attendance records for a class within a date range
 * @param {string} classId - Class ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Array of attendance records
 */
export async function getAttendanceByClassAndDateRange(classId, startDate, endDate) {
  try {
    const attendanceQuery = window.firebaseQuery(
      window.firebaseCollection(window.firebaseDb, 'attendance'),
      window.firebaseWhere('classId', '==', classId),
      window.firebaseWhere('date', '>=', window.firebaseTimestamp.fromDate(startDate)),
      window.firebaseWhere('date', '<=', window.firebaseTimestamp.fromDate(endDate)),
      window.firebaseOrderBy('date', 'desc')
    );
    
    const snapshot = await window.firebaseGetDocs(attendanceQuery);
    const attendanceRecords = [];
    
    snapshot.forEach((doc) => {
      attendanceRecords.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return attendanceRecords;
  } catch (error) {
    console.error('Error fetching attendance by date range:', error);
    throw error;
  }
}

/**
 * Get attendance summary for a student
 * @param {string} studentId - Student ID
 * @returns {Promise<Object>} Attendance summary
 */
export async function getStudentAttendanceSummary(studentId) {
  try {
    const { getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    // Get all classes the student is enrolled in
    const classesQuery = window.firebaseQuery(
      window.firebaseCollection(window.firebaseDb, 'classes'),
      window.firebaseWhere('studentIds', 'array-contains', studentId)
    );
    
    const classesSnapshot = await window.firebaseGetDocs(classesQuery);
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalDays = 0;
    
    for (const classDoc of classesSnapshot.docs) {
      const classId = classDoc.id;
      
      // Get attendance records for this class
      const attendanceDocRef = window.firebaseDoc(window.firebaseDb, 'attendance', classId);
      const attendanceDoc = await getDoc(attendanceDocRef);
      
      if (attendanceDoc.exists()) {
        const attendanceData = attendanceDoc.data();
        
        // Iterate through all dates in attendance
        Object.keys(attendanceData).forEach(date => {
          if (attendanceData[date][studentId]) {
            totalDays++;
            const status = attendanceData[date][studentId].status;
            if (status === 'Present') totalPresent++;
            else if (status === 'Absent') totalAbsent++;
            else if (status === 'Late') totalLate++;
          }
        });
      }
    }
    
    const attendanceRate = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;
    
    return {
      studentId,
      totalPresent,
      totalAbsent,
      totalLate,
      totalDays,
      attendanceRate
    };
  } catch (error) {
    console.error('Error fetching student attendance summary:', error);
    throw error;
  }
}

/**
 * ========================================
 * GRADES QUERIES
 * ========================================
 */

/**
 * Get grades for a specific class and term
 * @param {string} classId - Class ID (document ID)
 * @param {string} term - Term (e.g., "Term 1 2026")
 * @returns {Promise<Object>} Grades data
 */
export async function getGradesByClassAndTerm(classId, term) {
  try {
    const { getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const gradesDocRef = window.firebaseDoc(window.firebaseDb, 'gradesData', classId);
    const gradesDoc = await getDoc(gradesDocRef);
    
    if (!gradesDoc.exists()) {
      return { classId, term, grades: {} };
    }
    
    const gradesData = gradesDoc.data();
    
    return {
      classId,
      term,
      grades: gradesData[term] || {}
    };
  } catch (error) {
    console.error('Error fetching grades:', error);
    throw error;
  }
}

/**
 * Get all grades for a student
 * @param {string} studentId - Student ID
 * @returns {Promise<Array>} Array of grade records
 */
export async function getGradesByStudent(studentId) {
  try {
    const gradesQuery = window.firebaseQuery(
      window.firebaseCollection(window.firebaseDb, 'gradesData'),
      window.firebaseWhere('studentId', '==', studentId)
    );
    
    const snapshot = await window.firebaseGetDocs(gradesQuery);
    const grades = [];
    
    snapshot.forEach((doc) => {
      grades.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return grades;
  } catch (error) {
    console.error('Error fetching student grades:', error);
    throw error;
  }
}

/**
 * Get grade statistics for a class
 * @param {string} classId - Class ID
 * @param {string} term - Term
 * @returns {Promise<Object>} Grade statistics
 */
export async function getClassGradeStatistics(classId, term) {
  try {
    const gradesData = await getGradesByClassAndTerm(classId, term);
    const grades = gradesData.grades;
    
    const stats = {
      totalStudents: Object.keys(grades).length,
      subjectAverages: {},
      topPerformers: [],
      failingStudents: []
    };
    
    // Calculate subject averages
    const subjectScores = {};
    
    Object.keys(grades).forEach(studentId => {
      const studentGrades = grades[studentId];
      
      Object.keys(studentGrades).forEach(subject => {
        if (subject !== 'comment') {
          const score = parseFloat(studentGrades[subject]);
          if (!isNaN(score)) {
            if (!subjectScores[subject]) {
              subjectScores[subject] = [];
            }
            subjectScores[subject].push(score);
          }
        }
      });
    });
    
    // Calculate averages
    Object.keys(subjectScores).forEach(subject => {
      const scores = subjectScores[subject];
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      stats.subjectAverages[subject] = Math.round(average * 10) / 10;
    });
    
    return stats;
  } catch (error) {
    console.error('Error calculating grade statistics:', error);
    throw error;
  }
}

/**
 * Get subjects for a class
 * @param {string} classId - Class ID (document ID)
 * @returns {Promise<Array>} Array of subjects with weights
 */
export async function getClassSubjects(classId) {
  try {
    const { getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const subjectsDocRef = window.firebaseDoc(window.firebaseDb, 'subjects', classId);
    const subjectsDoc = await getDoc(subjectsDocRef);
    
    if (!subjectsDoc.exists()) {
      return [];
    }
    
    const subjectsData = subjectsDoc.data();
    return subjectsData.subjects || [];
  } catch (error) {
    console.error('Error fetching class subjects:', error);
    throw error;
  }
}

/**
 * ========================================
 * FINANCE QUERIES
 * ========================================
 */

/**
 * Get all fees records
 * @returns {Promise<Array>} Array of fee records
 */
export async function getAllFees() {
  try {
    const feesSnapshot = await window.firebaseGetDocs(
      window.firebaseCollection(window.firebaseDb, 'fees')
    );
    
    const fees = [];
    feesSnapshot.forEach((doc) => {
      fees.push({
        id: doc.id,
        studentId: doc.id,
        ...doc.data()
      });
    });
    
    return fees;
  } catch (error) {
    console.error('Error fetching fees:', error);
    throw error;
  }
}

/**
 * Get fees for a specific student
 * @param {string} studentId - Student ID (document ID)
 * @returns {Promise<Object>} Fee record with items, discounts, and payments
 */
export async function getStudentFees(studentId) {
  try {
    const { getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const feeDocRef = window.firebaseDoc(window.firebaseDb, 'fees', studentId);
    const feeDoc = await getDoc(feeDocRef);
    
    if (!feeDoc.exists()) {
      return {
        studentId,
        items: [],
        discounts: [],
        payments: []
      };
    }
    
    return {
      studentId,
      ...feeDoc.data()
    };
  } catch (error) {
    console.error('Error fetching student fees:', error);
    throw error;
  }
}

/**
 * Get students with outstanding fees
 * @param {number} minimumBalance - Minimum balance to filter (default: 0)
 * @returns {Promise<Array>} Array of students with outstanding fees
 */
export async function getStudentsWithOutstandingFees(minimumBalance = 0) {
  try {
    const fees = await getAllFees();
    const students = await getAllStudents();
    
    const outstandingStudents = [];
    
    fees.forEach(fee => {
      const itemsTotal = (fee.items || []).reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
      const discountsTotal = (fee.discounts || []).reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
      const netDue = itemsTotal - discountsTotal;
      const paidTotal = (fee.payments || []).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
      const balance = netDue - paidTotal;
      
      if (balance > minimumBalance) {
        const student = students.find(s => s.id === fee.studentId);
        if (student) {
          outstandingStudents.push({
            ...student,
            balance,
            netDue,
            paidTotal
          });
        }
      }
    });
    
    return outstandingStudents.sort((a, b) => b.balance - a.balance);
  } catch (error) {
    console.error('Error fetching students with outstanding fees:', error);
    throw error;
  }
}

/**
 * Get all expenses
 * @returns {Promise<Array>} Array of expense records
 */
export async function getAllExpenses() {
  try {
    const expensesQuery = window.firebaseQuery(
      window.firebaseCollection(window.firebaseDb, 'expenses'),
      window.firebaseOrderBy('date', 'desc')
    );
    
    const snapshot = await window.firebaseGetDocs(expensesQuery);
    const expenses = [];
    
    snapshot.forEach((doc) => {
      expenses.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return expenses;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
}

/**
 * Get expenses within a date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Array of expenses
 */
export async function getExpensesByDateRange(startDate, endDate) {
  try {
    const expensesQuery = window.firebaseQuery(
      window.firebaseCollection(window.firebaseDb, 'expenses'),
      window.firebaseWhere('date', '>=', window.firebaseTimestamp.fromDate(startDate)),
      window.firebaseWhere('date', '<=', window.firebaseTimestamp.fromDate(endDate)),
      window.firebaseOrderBy('date', 'desc')
    );
    
    const snapshot = await window.firebaseGetDocs(expensesQuery);
    const expenses = [];
    
    snapshot.forEach((doc) => {
      expenses.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return expenses;
  } catch (error) {
    console.error('Error fetching expenses by date range:', error);
    throw error;
  }
}

/**
 * Get expenses by category
 * @param {string} category - Expense category
 * @returns {Promise<Array>} Array of expenses
 */
export async function getExpensesByCategory(category) {
  try {
    const expensesQuery = window.firebaseQuery(
      window.firebaseCollection(window.firebaseDb, 'expenses'),
      window.firebaseWhere('category', '==', category),
      window.firebaseOrderBy('date', 'desc')
    );
    
    const snapshot = await window.firebaseGetDocs(expensesQuery);
    const expenses = [];
    
    snapshot.forEach((doc) => {
      expenses.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return expenses;
  } catch (error) {
    console.error('Error fetching expenses by category:', error);
    throw error;
  }
}

/**
 * Get financial summary
 * @param {Date} startDate - Start date (optional)
 * @param {Date} endDate - End date (optional)
 * @returns {Promise<Object>} Financial summary
 */
export async function getFinancialSummary(startDate = null, endDate = null) {
  try {
    let fees, expenses;
    
    if (startDate && endDate) {
      expenses = await getExpensesByDateRange(startDate, endDate);
      fees = await getAllFees(); // Filter fees by date if needed
    } else {
      fees = await getAllFees();
      expenses = await getAllExpenses();
    }
    
    // Calculate totals
    let totalDue = 0;
    let totalPaid = 0;
    let totalBalance = 0;
    
    fees.forEach(fee => {
      const itemsTotal = (fee.items || []).reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
      const discountsTotal = (fee.discounts || []).reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
      const netDue = itemsTotal - discountsTotal;
      const paidTotal = (fee.payments || []).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
      const balance = netDue - paidTotal;
      
      totalDue += netDue;
      totalPaid += paidTotal;
      totalBalance += balance;
    });
    
    const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const collectionRate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;
    const netSurplus = totalPaid - totalExpenses;
    
    return {
      income: {
        totalDue,
        totalPaid,
        totalBalance,
        collectionRate
      },
      expenses: {
        total: totalExpenses,
        byCategory: {}
      },
      netSurplus
    };
  } catch (error) {
    console.error('Error calculating financial summary:', error);
    throw error;
  }
}

/**
 * ========================================
 * REPORTS QUERIES
 * ========================================
 */

/**
 * Generate comprehensive financial report
 * @param {Date} startDate - Start date (optional)
 * @param {Date} endDate - End date (optional)
 * @returns {Promise<Object>} Financial report data
 */
export async function generateFinancialReport(startDate = null, endDate = null) {
  try {
    const summary = await getFinancialSummary(startDate, endDate);
    const outstandingStudents = await getStudentsWithOutstandingFees();
    
    return {
      summary,
      outstandingStudents,
      reportDate: new Date(),
      period: {
        startDate,
        endDate
      }
    };
  } catch (error) {
    console.error('Error generating financial report:', error);
    throw error;
  }
}

/**
 * Generate attendance report for a class
 * @param {string} classId - Class ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Attendance report
 */
export async function generateAttendanceReport(classId, startDate, endDate) {
  try {
    const attendanceRecords = await getAttendanceByClassAndDateRange(classId, startDate, endDate);
    const classData = await getClassWithStudents(classId);
    
    const report = {
      class: classData,
      period: { startDate, endDate },
      records: attendanceRecords,
      summary: {
        totalDays: attendanceRecords.length,
        studentSummaries: []
      }
    };
    
    // Calculate summary for each student
    if (classData.students) {
      for (const student of classData.students) {
        let present = 0;
        let absent = 0;
        let late = 0;
        
        attendanceRecords.forEach(record => {
          if (record[student.id]) {
            const status = record[student.id].status;
            if (status === 'Present') present++;
            else if (status === 'Absent') absent++;
            else if (status === 'Late') late++;
          }
        });
        
        const attendanceRate = attendanceRecords.length > 0 
          ? Math.round((present / attendanceRecords.length) * 100) 
          : 0;
        
        report.summary.studentSummaries.push({
          studentId: student.id,
          studentName: student.name,
          present,
          absent,
          late,
          attendanceRate
        });
      }
    }
    
    return report;
  } catch (error) {
    console.error('Error generating attendance report:', error);
    throw error;
  }
}

/**
 * Generate grades report for a class
 * @param {string} classId - Class ID
 * @param {string} term - Term
 * @returns {Promise<Object>} Grades report
 */
export async function generateGradesReport(classId, term) {
  try {
    const gradesData = await getGradesByClassAndTerm(classId, term);
    const classData = await getClassWithStudents(classId);
    const subjects = await getClassSubjects(classId);
    const statistics = await getClassGradeStatistics(classId, term);
    
    return {
      class: classData,
      term,
      grades: gradesData.grades,
      subjects,
      statistics,
      reportDate: new Date()
    };
  } catch (error) {
    console.error('Error generating grades report:', error);
    throw error;
  }
}

/**
 * Generate overall school report
 * @returns {Promise<Object>} Comprehensive school report
 */
export async function generateSchoolReport() {
  try {
    const dashboardStats = await getDashboardStats();
    const students = await getAllStudents();
    const teachers = await getAllTeachers();
    const classes = await getAllClasses();
    const financialSummary = await getFinancialSummary();
    
    return {
      overview: {
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalClasses: classes.length
      },
      financial: financialSummary,
      reportDate: new Date()
    };
  } catch (error) {
    console.error('Error generating school report:', error);
    throw error;
  }
}

/**
 * ========================================
 * UTILITY FUNCTIONS
 * ========================================
 */

/**
 * Get announcements
 * @param {number} limit - Number of announcements to fetch (optional)
 * @returns {Promise<Array>} Array of announcements
 */
export async function getAnnouncements(limit = null) {
  try {
    let announcementsQuery = window.firebaseQuery(
      window.firebaseCollection(window.firebaseDb, 'announcements'),
      window.firebaseOrderBy('date', 'desc')
    );
    
    const snapshot = await window.firebaseGetDocs(announcementsQuery);
    const announcements = [];
    
    snapshot.forEach((doc) => {
      announcements.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return limit ? announcements.slice(0, limit) : announcements;
  } catch (error) {
    console.error('Error fetching announcements:', error);
    throw error;
  }
}

/**
 * Get upcoming events
 * @param {number} limit - Number of events to fetch (optional)
 * @returns {Promise<Array>} Array of upcoming events
 */
export async function getUpcomingEvents(limit = null) {
  try {
    const now = new Date();
    const eventsQuery = window.firebaseQuery(
      window.firebaseCollection(window.firebaseDb, 'events'),
      window.firebaseWhere('date', '>=', window.firebaseTimestamp.fromDate(now)),
      window.firebaseOrderBy('date', 'asc')
    );
    
    const snapshot = await window.firebaseGetDocs(eventsQuery);
    const events = [];
    
    snapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return limit ? events.slice(0, limit) : events;
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    throw error;
  }
}
