# Firestore Queries Quick Reference

Quick reference for all available Firestore query functions in BIS-SMS.

## Dashboard

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `getDashboardStats()` | - | `Object` | Get comprehensive dashboard statistics |
| `getRecentActivities(limit)` | `limit: Number` | `Array` | Get recent activities/announcements |

## Students

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `getAllStudents()` | - | `Array<Student>` | Get all students ordered by name |
| `getStudentsByGrade(grade)` | `grade: String` | `Array<Student>` | Filter students by grade |
| `getStudentById(studentId)` | `studentId: String` | `Student` | Get single student by ID |
| `searchStudents(searchTerm)` | `searchTerm: String` | `Array<Student>` | Search students by name or ID |

## Teachers

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `getAllTeachers()` | - | `Array<Teacher>` | Get all teachers ordered by name |
| `getTeachersBySubject(subject)` | `subject: String` | `Array<Teacher>` | Filter teachers by subject |
| `getTeachersByStatus(status)` | `status: String` | `Array<Teacher>` | Filter teachers by status |
| `searchTeachers(searchTerm)` | `searchTerm: String` | `Array<Teacher>` | Search teachers by name/subject |

## Classes

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `getAllClasses()` | - | `Array<Class>` | Get all classes ordered by grade/name |
| `getClassesByGrade(grade)` | `grade: String` | `Array<Class>` | Filter classes by grade |
| `getClassesByTeacher(teacherId)` | `teacherId: String` | `Array<Class>` | Get classes by teacher |
| `getClassWithStudents(classId)` | `classId: String` | `Class` | Get class with enrolled students |

## Attendance

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `getAttendanceByClassAndDate(classId, date)` | `classId: String`<br>`date: String` | `Object` | Get attendance for class on date |
| `getAttendanceByClassAndDateRange(classId, startDate, endDate)` | `classId: String`<br>`startDate: Date`<br>`endDate: Date` | `Array` | Get attendance in date range |
| `getStudentAttendanceSummary(studentId)` | `studentId: String` | `Object` | Get student attendance summary |

## Grades

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `getGradesByClassAndTerm(classId, term)` | `classId: String`<br>`term: String` | `Object` | Get grades for class and term |
| `getGradesByStudent(studentId)` | `studentId: String` | `Array` | Get all grades for student |
| `getClassGradeStatistics(classId, term)` | `classId: String`<br>`term: String` | `Object` | Calculate grade statistics |
| `getClassSubjects(classId)` | `classId: String` | `Array` | Get subjects for class |

## Finance

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `getAllFees()` | - | `Array<Fee>` | Get all fee records |
| `getStudentFees(studentId)` | `studentId: String` | `Object` | Get fees for student |
| `getStudentsWithOutstandingFees(minimumBalance)` | `minimumBalance: Number` | `Array` | Get students with outstanding fees |
| `getAllExpenses()` | - | `Array<Expense>` | Get all expenses ordered by date |
| `getExpensesByDateRange(startDate, endDate)` | `startDate: Date`<br>`endDate: Date` | `Array<Expense>` | Get expenses in date range |
| `getExpensesByCategory(category)` | `category: String` | `Array<Expense>` | Filter expenses by category |
| `getFinancialSummary(startDate, endDate)` | `startDate: Date`<br>`endDate: Date` | `Object` | Get comprehensive financial summary |

## Reports

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `generateFinancialReport(startDate, endDate)` | `startDate: Date`<br>`endDate: Date` | `Object` | Generate financial report |
| `generateAttendanceReport(classId, startDate, endDate)` | `classId: String`<br>`startDate: Date`<br>`endDate: Date` | `Object` | Generate attendance report |
| `generateGradesReport(classId, term)` | `classId: String`<br>`term: String` | `Object` | Generate grades report |
| `generateSchoolReport()` | - | `Object` | Generate overall school report |

## Utilities

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `getAnnouncements(limit)` | `limit: Number` | `Array` | Get announcements with optional limit |
| `getUpcomingEvents(limit)` | `limit: Number` | `Array` | Get upcoming events with optional limit |

## Convenience Wrappers (via FirestoreAPI)

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `loadDashboardData()` | - | `Object` | Load stats and activities |
| `loadStudentsData(options)` | `options: Object` | `Array` | Load students with filters |
| `loadTeachersData(options)` | `options: Object` | `Array` | Load teachers with filters |
| `loadClassesData(options)` | `options: Object` | `Array` | Load classes with filters |
| `loadAttendanceData(classId, date)` | `classId: String`<br>`date: String` | `Object` | Load attendance data |
| `loadGradesData(classId, term)` | `classId: String`<br>`term: String` | `Object` | Load grades data |
| `loadFinanceData()` | - | `Object` | Load all finance data |

## Quick Start Examples

### Load Dashboard
```javascript
const { stats, activities } = await window.FirestoreAPI.loadDashboardData();
```

### Search Students
```javascript
const students = await window.FirestoreAPI.searchStudents('john');
```

### Filter Classes by Grade
```javascript
const classes = await window.FirestoreAPI.loadClassesData({ grade: '10' });
```

### Get Attendance
```javascript
const attendance = await window.FirestoreAPI.loadAttendanceData('class123', '2026-01-20');
```

### Generate Report
```javascript
const report = await window.FirestoreAPI.generateFinancialReport(
  new Date('2026-01-01'),
  new Date('2026-01-31')
);
```

## Error Handling

All functions should be called with try-catch:

```javascript
try {
  const data = await window.FirestoreAPI.getAllStudents();
  // Use data
} catch (error) {
  console.error('Error:', error);
  // Handle error
}
```

## Common Options Objects

### loadStudentsData options
```javascript
{
  search: 'search term',  // Search by name or ID
  grade: '10'            // Filter by grade
}
```

### loadTeachersData options
```javascript
{
  search: 'search term',  // Search by name or subject
  subject: 'Math',       // Filter by subject
  status: 'Active'       // Filter by status
}
```

### loadClassesData options
```javascript
{
  grade: '10',          // Filter by grade
  teacherId: 'teacher1' // Filter by teacher
}
```

## Data Structure References

### Student Object
```javascript
{
  id: String,
  name: String,
  grade: String,
  parent: String,
  contact: String,
  classIds: Array<String>
}
```

### Teacher Object
```javascript
{
  id: String,
  name: String,
  subject: String,
  qualification: String,
  status: String
}
```

### Class Object
```javascript
{
  id: String,
  name: String,
  grade: String,
  teacherId: String,
  studentIds: Array<String>,
  capacity: Number,
  schedule: String
}
```

### Fee Object
```javascript
{
  studentId: String,
  items: Array<{description, amount}>,
  discounts: Array<{description, amount}>,
  payments: Array<{date, amount, method}>
}
```

### Attendance Object
```javascript
{
  classId: String,
  date: String,
  records: {
    [studentId]: {
      status: 'Present'|'Absent'|'Late',
      notes: String
    }
  }
}
```

## Need More Details?

See the full documentation in `FIRESTORE_QUERIES_GUIDE.md`
