# BIS-SMS Login Credentials

This document contains the login credentials for all user types in the Bophelong Independent School Management System (BIS-SMS).

## System Access

The system can be accessed through two entry points:
- **Main Login Page**: `index.html` - Unified login for all user types
- **Admin Dashboard**: `admin.html` - Direct access to portals after login

---

## Login Credentials by User Type

### 1. Administrator

**Purpose**: Full system access to manage students, teachers, classes, attendance, grades, finance, and reports.

**Login Details**:
- **Username**: `admin`
- **Password**: `admin123`

**Access**: From the main login page (`index.html`), select "Administrator" as user type.

---

### 2. Teacher

**Purpose**: Access to teacher portal for classroom management, grade entry, and attendance tracking.

**Login Details**:
- **Teacher ID**: Any teacher ID (e.g., `1` or `2`)
- **Password**: `teacher123`

**Demo Teacher IDs**:
- ID `1`: Mr. Johnson (Math)
- ID `2`: Ms. Lee (Science)

**Access**: From the main login page (`index.html`), select "Teacher" as user type, or access the teacher portal directly in the admin dashboard.

**Note**: The system accepts any teacher ID with the password "teacher123" for demonstration purposes.

---

### 3. Student

**Purpose**: Access to student portal to view grades, attendance, enrolled classes, and fee statements.

**Login Details**:
- **Student ID**: Any student ID (e.g., `1` or `2`)
- **Password**: `student123`

**Demo Student IDs**:
- ID `1`: John Doe (Grade 10)
- ID `2`: Sarah Smith (Grade 11)

**Access**: From the main login page (`index.html`), select "Student" as user type, or access the student portal directly in the admin dashboard.

**Note**: The system accepts any student ID with the password "student123" for demonstration purposes.

---

### 4. Parent/Guardian

**Purpose**: Access to parent portal to monitor child's academic progress, attendance, fees, and communicate with teachers.

**Login Details**:
- **Student ID** (Your Child): Any student ID (e.g., `1` or `2`)
- **Parent Access Code**: `parent123`

**Demo Access**:
- Use Student ID `1` to monitor John Doe's progress
- Use Student ID `2` to monitor Sarah Smith's progress

**Access**: From the main login page (`index.html`), select "Parent/Guardian" as user type, or access the parent portal directly in the admin dashboard.

**Note**: Parents log in using their child's student ID along with the parent access code "parent123".

---

## Quick Reference Table

| User Type | Username/ID | Password/Code | Notes |
|-----------|-------------|---------------|-------|
| **Administrator** | `admin` | `admin123` | Full system access |
| **Teacher** | `1`, `2`, or any teacher ID | `teacher123` | Teacher portal access |
| **Student** | `1`, `2`, or any student ID | `student123` | Student portal access |
| **Parent/Guardian** | `1`, `2`, or any student ID | `parent123` | Parent portal access (uses child's ID) |

---

## Portal Features by User Type

### Administrator Portal
- Dashboard with system statistics
- Student management (add, edit, delete, search, export)
- Teacher management
- Class management
- Attendance tracking
- Advanced grades entry and reporting
- Finance and fee management
- System reports and analytics
- Messaging system
- Settings

### Teacher Portal
- View assigned classes
- Enter and manage grades
- Take attendance
- View class reports
- Access to student information for assigned classes

### Student Portal
- View personal information and grades
- Check attendance records
- View enrolled classes and schedules
- Access fee statement and balance
- Academic performance statistics

### Parent Portal
- Monitor child's academic progress
- View attendance records
- Check fee statements and payment history
- Contact teachers directly
- Overview of child's performance

---

## Security Notes

⚠️ **Important**: These are demo credentials for testing and development purposes. In a production environment, you should:

1. Change all default passwords immediately
2. Implement proper password encryption
3. Add multi-factor authentication
4. Use individual unique credentials for each user
5. Implement password complexity requirements
6. Add password reset functionality
7. Enable session management and timeout
8. Implement proper role-based access control (RBAC)

---

## Troubleshooting

### Invalid Credentials Error
- Double-check you've entered the correct username/ID and password
- Ensure you've selected the correct user type from the dropdown
- Passwords are case-sensitive

### Portal Not Loading
- Clear browser cache and cookies
- Ensure JavaScript is enabled in your browser
- Check browser console for errors (F12)

### Data Not Showing
- The system uses browser localStorage for data persistence
- First-time users will see sample data (2 students, 2 teachers)
- Add more data through the administrator portal

---

## Support

For additional assistance or to report issues, please contact the system administrator or refer to the repository documentation.
