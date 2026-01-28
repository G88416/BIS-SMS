# Firestore Queries Guide for BIS-SMS

This guide explains how to use the Firestore queries module (`firestore-queries.js`) in the BIS-SMS application.

## Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [Dashboard Queries](#dashboard-queries)
4. [Students Queries](#students-queries)
5. [Teachers Queries](#teachers-queries)
6. [Classes Queries](#classes-queries)
7. [Attendance Queries](#attendance-queries)
8. [Grades Queries](#grades-queries)
9. [Finance Queries](#finance-queries)
10. [Reports Queries](#reports-queries)
11. [Utility Queries](#utility-queries)
12. [Error Handling](#error-handling)
13. [Integration Examples](#integration-examples)

## Overview

The `firestore-queries.js` module provides a comprehensive set of functions for querying Firestore data across all major features of the BIS-SMS system. All functions are asynchronous and return Promises.

## Setup

### 1. Include the module in your HTML

Add the module to your HTML file as a type="module" script:

```html
<script type="module" src="firestore-queries.js"></script>
```

### 2. Import functions in your code

```javascript
import { 
  getDashboardStats,
  getAllStudents,
  getAllTeachers,
  // ... other functions
} from './firestore-queries.js';
```

### 3. Ensure Firebase is initialized

The module requires Firebase to be initialized with Firestore enabled. Make sure Firebase is initialized before calling any query functions.

## Dashboard Queries

### getDashboardStats()

Retrieves comprehensive dashboard statistics including student count, fees, and expenses.

```javascript
// Example usage
async function loadDashboard() {
  try {
    const stats = await getDashboardStats();
    
    document.getElementById('total-students').textContent = stats.totalStudents;
    document.getElementById('outstanding-fees').textContent = 
      'R' + stats.totalBalance.toLocaleString();
    document.getElementById('collection-rate').textContent = 
      stats.collectionRate + '%';
    document.getElementById('net-surplus').textContent = 
      'R' + stats.netSurplus.toLocaleString();
  } catch (error) {
    console.error('Failed to load dashboard:', error);
    // Handle error appropriately
  }
}
```

**Returns:**
```javascript
{
  totalStudents: Number,
  totalDue: Number,
  totalPaid: Number,
  totalBalance: Number,
  totalExpenses: Number,
  collectionRate: Number,
  netSurplus: Number
}
```

### getRecentActivities(limit)

Gets recent activities/announcements for the dashboard.

```javascript
const activities = await getRecentActivities(10);
// Returns array of recent announcements
```

## Students Queries

### getAllStudents()

Fetches all students ordered by name.

```javascript
const students = await getAllStudents();
// Returns: Array of student objects
```

### getStudentsByGrade(grade)

Filters students by grade.

```javascript
const grade10Students = await getStudentsByGrade('10');
```

### getStudentById(studentId)

Gets a single student by their ID.

```javascript
const student = await getStudentById('student123');
```

### searchStudents(searchTerm)

Searches students by name or ID.

```javascript
const results = await searchStudents('john');
// Returns students matching the search term
```

## Teachers Queries

### getAllTeachers()

Fetches all teachers ordered by name.

```javascript
const teachers = await getAllTeachers();
```

### getTeachersBySubject(subject)

Filters teachers by subject.

```javascript
const mathTeachers = await getTeachersBySubject('Math');
```

### getTeachersByStatus(status)

Filters teachers by status (Active, Inactive, etc.).

```javascript
const activeTeachers = await getTeachersByStatus('Active');
```

### searchTeachers(searchTerm)

Searches teachers by name or subject.

```javascript
const results = await searchTeachers('johnson');
```

## Classes Queries

### getAllClasses()

Fetches all classes ordered by grade and name.

```javascript
const classes = await getAllClasses();
```

### getClassesByGrade(grade)

Filters classes by grade.

```javascript
const grade10Classes = await getClassesByGrade('10');
```

### getClassesByTeacher(teacherId)

Gets all classes taught by a specific teacher.

```javascript
const teacherClasses = await getClassesByTeacher('teacher123');
```

### getClassWithStudents(classId)

Gets class details including enrolled students.

```javascript
const classData = await getClassWithStudents('class123');
// Returns class with populated students array
```

## Attendance Queries

### getAttendanceByClassAndDate(classId, date)

Gets attendance for a specific class on a specific date.

```javascript
const attendance = await getAttendanceByClassAndDate('class123', '2026-01-20');
// Returns: { classId, date, records: {...} }
```

### getAttendanceByClassAndDateRange(classId, startDate, endDate)

Gets attendance records within a date range.

```javascript
const startDate = new Date('2026-01-01');
const endDate = new Date('2026-01-31');
const records = await getAttendanceByClassAndDateRange('class123', startDate, endDate);
```

### getStudentAttendanceSummary(studentId)

Gets attendance summary for a specific student across all classes.

```javascript
const summary = await getStudentAttendanceSummary('student123');
// Returns: { totalPresent, totalAbsent, totalLate, totalDays, attendanceRate }
```

## Grades Queries

### getGradesByClassAndTerm(classId, term)

Gets grades for a class in a specific term.

```javascript
const grades = await getGradesByClassAndTerm('class123', 'Term 1 2026');
// Returns: { classId, term, grades: {...} }
```

### getGradesByStudent(studentId)

Gets all grade records for a student.

```javascript
const studentGrades = await getGradesByStudent('student123');
```

### getClassGradeStatistics(classId, term)

Calculates grade statistics for a class.

```javascript
const stats = await getClassGradeStatistics('class123', 'Term 1 2026');
// Returns: { totalStudents, subjectAverages, topPerformers, failingStudents }
```

### getClassSubjects(classId)

Gets the subjects configured for a class.

```javascript
const subjects = await getClassSubjects('class123');
// Returns: Array of subjects with weights
```

## Finance Queries

### getAllFees()

Gets all fee records.

```javascript
const fees = await getAllFees();
```

### getStudentFees(studentId)

Gets fee details for a specific student.

```javascript
const fees = await getStudentFees('student123');
// Returns: { studentId, items: [], discounts: [], payments: [] }
```

### getStudentsWithOutstandingFees(minimumBalance)

Gets students with outstanding fees above a threshold.

```javascript
const debtors = await getStudentsWithOutstandingFees(100);
// Returns students with balance > 100
```

### getAllExpenses()

Gets all expense records ordered by date.

```javascript
const expenses = await getAllExpenses();
```

### getExpensesByDateRange(startDate, endDate)

Gets expenses within a date range.

```javascript
const expenses = await getExpensesByDateRange(
  new Date('2026-01-01'), 
  new Date('2026-01-31')
);
```

### getExpensesByCategory(category)

Filters expenses by category.

```javascript
const salaryExpenses = await getExpensesByCategory('Salaries');
```

### getFinancialSummary(startDate, endDate)

Generates a comprehensive financial summary.

```javascript
const summary = await getFinancialSummary(
  new Date('2026-01-01'), 
  new Date('2026-01-31')
);
// Returns: { income: {...}, expenses: {...}, netSurplus }
```

## Reports Queries

### generateFinancialReport(startDate, endDate)

Generates a comprehensive financial report.

```javascript
const report = await generateFinancialReport(
  new Date('2026-01-01'), 
  new Date('2026-01-31')
);
```

### generateAttendanceReport(classId, startDate, endDate)

Generates an attendance report for a class.

```javascript
const report = await generateAttendanceReport(
  'class123',
  new Date('2026-01-01'), 
  new Date('2026-01-31')
);
```

### generateGradesReport(classId, term)

Generates a grades report for a class.

```javascript
const report = await generateGradesReport('class123', 'Term 1 2026');
```

### generateSchoolReport()

Generates an overall school report.

```javascript
const report = await generateSchoolReport();
// Returns comprehensive school statistics
```

## Utility Queries

### getAnnouncements(limit)

Gets announcements with optional limit.

```javascript
const announcements = await getAnnouncements(5);
// Returns 5 most recent announcements
```

### getUpcomingEvents(limit)

Gets upcoming events with optional limit.

```javascript
const events = await getUpcomingEvents(10);
// Returns 10 upcoming events
```

## Error Handling

All query functions include error handling and will throw errors that should be caught:

```javascript
async function loadData() {
  try {
    const students = await getAllStudents();
    // Process students
  } catch (error) {
    console.error('Error loading students:', error);
    // Show error message to user
    showErrorMessage('Failed to load students. Please try again.');
  }
}
```

## Integration Examples

### Example 1: Loading Dashboard

```javascript
async function initializeDashboard() {
  try {
    // Show loading indicator
    showLoadingSpinner();
    
    // Fetch dashboard data
    const stats = await getDashboardStats();
    const activities = await getRecentActivities(5);
    
    // Update UI
    updateDashboardStats(stats);
    displayRecentActivities(activities);
    
    // Hide loading indicator
    hideLoadingSpinner();
  } catch (error) {
    console.error('Dashboard initialization failed:', error);
    showErrorMessage('Failed to load dashboard');
  }
}
```

### Example 2: Filtering Students

```javascript
async function filterStudentsByGrade() {
  const selectedGrade = document.getElementById('grade-filter').value;
  
  try {
    let students;
    if (selectedGrade === 'all') {
      students = await getAllStudents();
    } else {
      students = await getStudentsByGrade(selectedGrade);
    }
    
    renderStudentsTable(students);
  } catch (error) {
    console.error('Error filtering students:', error);
    showErrorMessage('Failed to filter students');
  }
}
```

### Example 3: Generating Reports

```javascript
async function generateMonthlyFinancialReport() {
  const year = 2026;
  const month = 0; // January
  
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0); // Last day of month
  
  try {
    showLoadingSpinner();
    
    const report = await generateFinancialReport(startDate, endDate);
    
    displayFinancialReport(report);
    
    hideLoadingSpinner();
  } catch (error) {
    console.error('Report generation failed:', error);
    showErrorMessage('Failed to generate report');
  }
}
```

### Example 4: Real-time Updates with onSnapshot

While the query functions use `getDocs` for one-time reads, you can also use `onSnapshot` for real-time updates:

```javascript
function listenToStudents() {
  const studentsQuery = window.firebaseQuery(
    window.firebaseCollection(window.firebaseDb, 'students'),
    window.firebaseOrderBy('name')
  );
  
  const unsubscribe = window.firebaseOnSnapshot(studentsQuery, (snapshot) => {
    const students = [];
    snapshot.forEach((doc) => {
      students.push({ id: doc.id, ...doc.data() });
    });
    
    renderStudentsTable(students);
  }, (error) => {
    console.error('Error listening to students:', error);
  });
  
  // Return unsubscribe function to stop listening
  return unsubscribe;
}
```

### Example 5: Batch Operations

```javascript
async function loadClassDetailedView(classId) {
  try {
    // Load multiple related data points in parallel
    const [classData, attendance, grades, subjects] = await Promise.all([
      getClassWithStudents(classId),
      getAttendanceByClassAndDate(classId, new Date().toISOString().split('T')[0]),
      getGradesByClassAndTerm(classId, 'Term 1 2026'),
      getClassSubjects(classId)
    ]);
    
    // Update UI with all data
    displayClassDetails(classData);
    displayAttendance(attendance);
    displayGrades(grades);
    displaySubjects(subjects);
  } catch (error) {
    console.error('Error loading class view:', error);
    showErrorMessage('Failed to load class details');
  }
}
```

## Performance Considerations

1. **Batch Queries**: Use `Promise.all()` to execute multiple independent queries in parallel
2. **Caching**: Consider caching frequently accessed data in memory
3. **Pagination**: For large datasets, implement pagination (not currently in this module)
4. **Indexes**: Ensure Firestore indexes are configured for compound queries (see `firestore.indexes.json`)
5. **Real-time vs One-time**: Use `onSnapshot` for data that needs real-time updates, `getDocs` for one-time reads

## Security

All queries respect the Firestore security rules defined in `firestore.rules`. Ensure:

1. Users are authenticated before querying
2. Security rules enforce proper access control
3. Sensitive data is protected at the database level

## Next Steps

1. Integrate these queries into your existing application code
2. Replace localStorage calls with Firestore queries
3. Add loading states and error handling in the UI
4. Test thoroughly with real data
5. Monitor query performance in the Firebase Console
