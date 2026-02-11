# Quick Start Guide - BIS-SMS Portals

## Getting Started in 3 Steps

### Step 1: Set Up Firebase (First Time Only)

If you haven't already, you'll need Firebase credentials. The portals are pre-configured with demo credentials, but for production:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Create a Firestore database
5. Copy your config and update it in each portal HTML file

### Step 2: Create Test Users

Create test users in Firebase Authentication and Firestore:

#### For Student Portal Testing
1. In Firebase Authentication, create a user: `student@test.com` / `password123`
2. In Firestore, create a document in `users` collection:
```json
{
  "uid": "firebase-auth-uid",
  "email": "student@test.com",
  "role": "student",
  "name": "Test Student",
  "studentId": "S12345",
  "grade": "10"
}
```

#### For Teacher Portal Testing
1. In Firebase Authentication, create a user: `teacher@test.com` / `password123`
2. In Firestore, create a document in `users` collection:
```json
{
  "uid": "firebase-auth-uid",
  "email": "teacher@test.com",
  "role": "teacher",
  "name": "Test Teacher",
  "teacherId": "T67890",
  "subject": "Mathematics"
}
```

#### For Parent Portal Testing
1. In Firebase Authentication, create a user: `parent@test.com` / `password123`
2. In Firestore, create a document in `users` collection:
```json
{
  "uid": "firebase-auth-uid",
  "email": "parent@test.com",
  "role": "parent",
  "name": "Test Parent",
  "childId": "S12345",
  "childName": "Test Student"
}
```

### Step 3: Login and Explore

1. Open `index.html` in your browser
2. Select user type from dropdown
3. Enter email and password
4. You'll be redirected to the appropriate portal

---

## Portal URLs

Direct access (requires authentication):
- Student Portal: `student-portal.html`
- Teacher Portal: `teacher-portal.html`
- Parent Portal: `parent-portal.html`
- Admin Dashboard: `admin.html`

---

## Quick Demo (No Setup Required)

All portals include sample data that loads automatically. You can explore features without any backend setup:

1. Open any portal HTML file directly in your browser
2. The authentication check will redirect you to login
3. Click around to see the UI and features
4. Note: Save/submit actions won't work without backend integration

---

## Feature Overview

### Student Portal Features
✅ View grades by subject  
✅ Track assignments (pending, submitted, overdue)  
✅ Check attendance history  
✅ View class schedule  
✅ Read school announcements  
✅ Manage profile information  

### Teacher Portal Features
✅ Manage student lists  
✅ Enter grades with bulk operations  
✅ Mark attendance  
✅ Create and track assignments  
✅ View teaching schedule  
✅ Analyze class performance (charts)  
✅ Upload teaching resources  
✅ Send messages to students/parents  

### Parent Portal Features
✅ Monitor child's grades  
✅ Track attendance  
✅ View homework assignments  
✅ Manage fees and payments  
✅ View class schedule  
✅ Read announcements  
✅ Message teachers  

---

## Common Tasks

### How to Enter Grades (Teacher)
1. Go to "Grade Management" tab
2. Select a class
3. Choose assessment type
4. Enter scores for each student
5. Click "Save Grades"

### How to Mark Attendance (Teacher)
1. Go to "Attendance" tab
2. Select class and date
3. Mark each student's status
4. Or use "Mark All Present/Absent" buttons
5. Click "Save Attendance"

### How to View Child's Progress (Parent)
1. Go to "Grades" tab for academic performance
2. Go to "Attendance" tab to check presence
3. Go to "Homework" tab to monitor assignments
4. Filter by date ranges or status

### How to Submit Assignments (Student)
1. Go to "Assignments" tab
2. View pending assignments
3. Click "Submit" button
4. (Note: File upload requires backend integration)

---

## Troubleshooting

### "Access Denied" Error
- **Cause**: User role doesn't match portal type
- **Solution**: Ensure Firestore user document has correct `role` field

### Portal Redirects to Login
- **Cause**: Not authenticated or session expired
- **Solution**: Login again via `index.html`

### Data Not Loading
- **Cause**: Firebase config incorrect or network issue
- **Solution**: Check browser console for errors, verify Firebase config

### Charts Not Displaying (Teacher Portal)
- **Cause**: Chart.js not loaded
- **Solution**: Check internet connection (Chart.js loads from CDN)

---

## Next Steps

### For Development
1. Connect portals to your backend APIs
2. Replace sample data with real Firestore queries
3. Implement file upload functionality
4. Add real-time notifications
5. Customize styling and branding

### For Production
1. Update Firebase config with production credentials
2. Set up Firestore security rules
3. Enable Firebase App Check
4. Configure custom domain
5. Deploy to Firebase Hosting or your server

---

## Tips & Best Practices

### Security
- Always use HTTPS in production
- Set up Firestore security rules
- Enable Firebase App Check
- Implement rate limiting
- Regular security audits

### Performance
- Use Firestore pagination for large datasets
- Enable offline persistence
- Optimize images and assets
- Use CDN for static resources
- Monitor Firebase usage

### User Experience
- Clear error messages
- Loading indicators for async operations
- Responsive design for mobile users
- Print-friendly layouts
- Keyboard navigation support

---

## Resources

- **Full Documentation**: [PORTALS_DOCUMENTATION.md](PORTALS_DOCUMENTATION.md)
- **Firebase Docs**: https://firebase.google.com/docs
- **Bootstrap 5 Docs**: https://getbootstrap.com/docs/5.3/
- **Chart.js Docs**: https://www.chartjs.org/docs/

---

## Support

Need help?
1. Check [PORTALS_DOCUMENTATION.md](PORTALS_DOCUMENTATION.md) for detailed info
2. Review browser console for error messages
3. Verify Firebase configuration
4. Check Firestore security rules
5. Open an issue in the repository

---

**Happy Learning and Teaching! 🎓📚**
