# BIS-SMS Login Credentials

This document contains the login credentials for all user types in the Bophelong Independent School Management System (BIS-SMS).

## System Access

The system is accessed through a single unified application:
- **Main Application**: `index.html` - Combined login page and dashboard with all portals (Firebase Authentication enabled)
  - Shows login page initially
  - After successful login, displays the appropriate dashboard/portal
  - No page redirects - everything happens on the same page

---

## Important: Firebase Authentication Required

This system now uses **Firebase Authentication** for secure user login. All users must be created in Firebase Authentication with the following email format:

- **Admin**: `admin@bis.local`
- **Teachers**: `teacher{ID}@bis.local` (e.g., `teacher1@bis.local`, `teacher2@bis.local`)
- **Students**: `student{ID}@bis.local` (e.g., `student1@bis.local`, `student2@bis.local`)
- **Parents**: `parent.{childid}@bis.local` (e.g., `parent.c331@bis.local`)

---

## Login Credentials by User Type

### 1. Administrator

**Purpose**: Full system access to manage students, teachers, classes, attendance, grades, finance, and reports.

**Login Details**:
- **Username**: `admin`
- **Password**: `admin123`
- **Firebase Email**: `admin@bis.local`

**Access**: From the main login page (`index.html`), select "Administrator" as user type.

---

### 2. Teacher

**Purpose**: Access to teacher portal for classroom management, grade entry, and attendance tracking.

**Login Details**:
- **Teacher ID**: Any teacher ID (e.g., `1` or `2`)
- **Password**: `teacher123`
- **Firebase Email Format**: `teacher{ID}@bis.local`

**Demo Teacher IDs**:
- ID `1`: Mr. Johnson (Math) - Email: `teacher1@bis.local`
- ID `2`: Ms. Lee (Science) - Email: `teacher2@bis.local`

**Access**: From the main login page (`index.html`), select "Teacher" as user type, or access the teacher portal directly in the admin dashboard.

**Note**: The system accepts any teacher ID with the password "teacher123" for demonstration purposes. The user must exist in Firebase Authentication.

---

### 3. Student

**Purpose**: Access to student portal to view grades, attendance, enrolled classes, and fee statements.

**Login Details**:
- **Student ID**: Any student ID (e.g., `1` or `2`)
- **Password**: `student123`
- **Firebase Email Format**: `student{ID}@bis.local`

**Demo Student IDs**:
- ID `1`: John Doe (Grade 10) - Email: `student1@bis.local`
- ID `2`: Sarah Smith (Grade 11) - Email: `student2@bis.local`

**Access**: From the main login page (`index.html`), select "Student" as user type, or access the student portal directly in the admin dashboard.

**Note**: The system accepts any student ID with the password "student123" for demonstration purposes. The user must exist in Firebase Authentication.

---

### 4. Parent/Guardian

**Purpose**: Access to parent portal to monitor child's academic progress, attendance, fees, and communicate with teachers.

**Login Details**:
- **Child ID**: `C331` (case-insensitive)
- **Parent Access Code**: `parent321`
- **Firebase Email**: `parent.c331@bis.local`

**Access**: From the main login page (`index.html`), select "Parent/Guardian" as user type, or access the parent portal directly in the admin dashboard.

**Note**: Parents log in using the specific child ID "C331" along with the parent access code "parent321". The child ID is case-insensitive (C331, c331, or any mixed case will work).

---

## Quick Reference Table

| User Type | Username/ID | Password/Code | Firebase Email | Notes |
|-----------|-------------|---------------|----------------|-------|
| **Administrator** | `admin` | `admin123` | `admin@bis.local` | Full system access |
| **Teacher** | `1`, `2`, or any teacher ID | `teacher123` | `teacher{ID}@bis.local` | Teacher portal access |
| **Student** | `1`, `2`, or any student ID | `student123` | `student{ID}@bis.local` | Student portal access |
| **Parent/Guardian** | `C331` (case-insensitive) | `parent321` | `parent.c331@bis.local` | Parent portal access |

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

## Security Features

### Authentication & Authorization
✅ **Firebase Authentication**: All login attempts are verified through Firebase Authentication services  
✅ **Email-based Verification**: User roles are derived from the authenticated email to prevent tampering  
✅ **Firestore Role Verification**: Google Sign-In users have their roles verified against Firestore database  
✅ **Role Validation**: The system validates that the authenticated user matches the selected user type  
✅ **Session Protection**: Protected pages redirect to login if the user is not authenticated  
✅ **Secure Logout**: Properly clears Firebase session and application session storage  
✅ **No Hardcoded Roles**: Google OAuth users no longer receive hardcoded 'parent' role - roles are verified in Firestore  

### Security Implementation
- **Single-Page Application**: All functionality in `index.html` with dynamic content switching between login and dashboard
- **Container-based Protection**: Login and dashboard containers are toggled based on authentication state
- **onAuthStateChanged Listener**: Monitors authentication state and is integrated in the main application
- **Automatic Sign-Out**: Invalid role/ID combinations trigger automatic sign-out
- **Firestore Access Control**: Google Sign-In users are validated against Firestore user documents
- **Session Management**: Uses sessionStorage for temporary session data
- **Error Handling**: Proper error messages without exposing system details

---

## Security Notes

⚠️ **Important**: These are demo credentials for testing and development purposes. In a production environment, you should:

1. ✅ **Firebase Authentication** - Already implemented
2. Change all default passwords immediately
3. Add multi-factor authentication
4. Use individual unique credentials for each user
5. Implement password complexity requirements in Firebase
6. Add password reset functionality (Firebase provides this)
7. Enable session timeout in Firebase console
8. Implement proper role-based access control (RBAC) with custom claims
9. Configure Firebase Security Rules for Firestore
10. Enable Firebase App Check for additional security

---

## Troubleshooting

### Invalid Credentials Error
- Double-check you've entered the correct username/ID and password
- Ensure you've selected the correct user type from the dropdown
- Passwords are case-sensitive
- **Verify the user exists in Firebase Authentication with the correct email format**

### "Invalid user account format" Error
- This means the authenticated email doesn't match the expected format
- Check Firebase Authentication console to verify the email format

### Portal Not Loading
- Clear browser cache and cookies
- Ensure JavaScript is enabled in your browser
- Check browser console for errors (F12)
- Verify Firebase configuration is correct

### Automatically Redirected to Login
- This is no longer an issue - the application uses a single page
- If logged out, the login screen will appear automatically
- No page redirects - everything happens in `index.html`

### Data Not Showing
- The system uses browser localStorage for data persistence
- First-time users will see sample data (2 students, 2 teachers)
- Add more data through the administrator portal

---

## Setting Up Firebase Users

To add new users to the system:

1. **Go to Firebase Console** (https://console.firebase.google.com)
2. Select your project: `bis-management-system-d77f4`
3. Navigate to **Authentication** → **Users**
4. Click **Add User**
5. Enter the email in the correct format:
   - Admin: `admin@bis.local`
   - Teacher: `teacher{ID}@bis.local`
   - Student: `student{ID}@bis.local`
   - Parent: `parent.{childid}@bis.local`
6. Set the password
7. Click **Add User**

---

## Google Sign-In Authentication

The system now supports **Google Sign-In** as an alternative authentication method with enhanced security through Firestore role verification.

### How It Works

1. **User Authentication**: Users click "Sign in with Google" and authenticate with their Google account
2. **Role Verification**: The system looks up the user's Firebase UID in the Firestore `users` collection
3. **Access Control**: Only users with a valid user document in Firestore are granted access
4. **Role Assignment**: The user's role (admin, teacher, student, parent) is determined from their Firestore document

### Setting Up Google Sign-In Users

To enable a Google account for system access:

1. **Add to Firebase Authentication**:
   - User signs in with Google at least once (this creates their Firebase Auth account)
   - Or manually add them via Firebase Console → Authentication → Add User

2. **Create Firestore User Document**:
   - Navigate to Firebase Console → Firestore Database
   - Go to the `users` collection
   - Create a new document with the user's Firebase UID as the document ID
   - Add the following fields:
     ```
     {
       "role": "teacher",           // Required: admin, teacher, student, or parent
       "userId": "1",               // Required: User's internal ID
       "name": "John Doe",          // Optional: Display name
       "email": "john@example.com"  // Optional: Email address
     }
     ```

### Example Firestore User Document

```json
{
  "role": "teacher",
  "userId": "101",
  "name": "Jane Smith",
  "email": "jane.smith@gmail.com",
  "department": "Mathematics"
}
```

### Security Features

✅ **Firestore Role Verification**: User roles are verified against Firestore database  
✅ **No Hardcoded Roles**: Eliminates the previous security vulnerability where all Google users were assigned 'parent' role  
✅ **Automatic Sign-Out**: Users without valid Firestore documents are automatically signed out  
✅ **Error Handling**: Clear error messages guide users when access is denied  
✅ **Role Validation**: Only valid roles (admin, teacher, student, parent) are accepted  

### Error Messages

Users may see these messages when using Google Sign-In:

- **"Your account does not have a valid role assigned"**: The user document exists but has an invalid role
- **"Your Google account is not registered in the system"**: No user document found in Firestore
- **"Failed to verify your account"**: Firestore lookup error (network or permissions issue)
- **"Pop-up blocked"**: Browser blocked the Google Sign-In popup window
- **"Sign-in cancelled"**: User closed the Google Sign-In popup

---

## Support

For additional assistance or to report issues, please contact the system administrator or refer to the repository documentation.
