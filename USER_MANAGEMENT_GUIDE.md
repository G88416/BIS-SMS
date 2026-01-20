# User Management Guide

## Overview
This guide explains how to use the new User Management feature to create login credentials for students, teachers, and parents.

## Accessing User Management

1. Log in as an administrator using:
   - Username: `admin`
   - Password: `admin123`

2. Click on **"User Management"** in the left sidebar (below Messages)

## Creating New Users

### Step 1: Open the Add User Modal
Click the **"Add New User"** button at the top of the User Management section.

### Step 2: Select User Type
Choose the type of user you want to create:
- **Administrator** - Full system access
- **Teacher** - Teacher portal access
- **Student** - Student portal access  
- **Parent/Guardian** - Parent portal access

### Step 3: Fill in Required Information

#### For Teachers:
1. **User ID**: Enter a unique numeric ID (e.g., 3, 4, 5)
2. **Full Name**: Teacher's full name
3. **Email**: Auto-generated as `teacher{ID}@bis.local`
4. **Password**: Minimum 6 characters
5. **Confirm Password**: Re-enter password
6. **Subject/Specialization**: Optional (e.g., Mathematics)
7. **Qualification**: Optional (e.g., B.Ed, M.Sc)

#### For Students:
1. **User ID**: Enter a unique numeric ID (e.g., 3, 4, 5)
2. **Full Name**: Student's full name
3. **Email**: Auto-generated as `student{ID}@bis.local`
4. **Password**: Minimum 6 characters
5. **Confirm Password**: Re-enter password
6. **Grade Level**: Optional (e.g., 10, 11, 12)
7. **Parent/Guardian Name**: Optional
8. **Contact Number**: Optional

#### For Parents:
1. **User ID**: Enter the child's ID (e.g., C331, C332)
2. **Full Name**: Parent/Guardian's full name
3. **Email**: Auto-generated as `parent.{childid}@bis.local`
4. **Password**: Minimum 6 characters
5. **Confirm Password**: Re-enter password

#### For Administrators:
1. **Email**: Auto-set to `admin@bis.local`
2. **Password**: Minimum 6 characters
3. **Confirm Password**: Re-enter password

### Step 4: Create the User
Click the **"Create User"** button. You'll see a success message with the login credentials.

## What Happens When You Create a User

1. **Firebase Authentication Account**: A new user account is created in Firebase Authentication
2. **Firestore User Document**: A user document is created with role information
3. **Local Data Integration**: The user is added to the application's local data (for students and teachers)

## Viewing Existing Users

Use the tabs at the top of the User Management section to view users by type:
- **Administrators** - View admin accounts
- **Teachers** - View all teacher accounts with IDs, emails, and names
- **Students** - View all student accounts with IDs, emails, and names
- **Parents** - View all parent accounts linked to students

Click **"Refresh List"** to reload the user lists.

## User Login Instructions

Once a user is created, provide them with their login credentials:

1. Go to the login page (`index.html`)
2. Select their **User Type** from the dropdown
3. Enter their **Username/ID**:
   - Teachers: their numeric ID (e.g., 3)
   - Students: their numeric ID (e.g., 3)
   - Parents: their child's ID (e.g., C331)
   - Admin: `admin`
4. Enter their **Password**
5. Click **Login**

## Email Format Reference

| User Type | Email Format | Example |
|-----------|-------------|---------|
| Admin | `admin@bis.local` | `admin@bis.local` |
| Teacher | `teacher{ID}@bis.local` | `teacher3@bis.local` |
| Student | `student{ID}@bis.local` | `student3@bis.local` |
| Parent | `parent.{childid}@bis.local` | `parent.c331@bis.local` |

## Security Notes

⚠️ **Important Security Practices:**

1. **Use Strong Passwords**: Minimum 6 characters, but longer is better
2. **Change Default Passwords**: Have users change their password after first login
3. **Keep Credentials Secure**: Don't share credentials via insecure channels
4. **Regular Audits**: Periodically review user accounts and remove inactive ones
5. **Firebase Console**: Monitor user creation in the Firebase Authentication console

## Troubleshooting

### "Email already in use" Error
- This email address already has an account in Firebase
- Use a different ID or delete the existing user first

### "Weak password" Error
- Password must be at least 6 characters
- Try a longer, more complex password

### "Invalid email format" Error
- Check that the User ID is valid
- For teachers/students: use numeric IDs only
- For parents: use alphanumeric child IDs (e.g., C331)

### Users Not Appearing in List
- Click the "Refresh List" button
- The list shows users from local data (students/teachers arrays)
- To see all Firebase users, use the Firebase Authentication console

## Firebase Console Access

For advanced user management:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `bis-management-system-d77f4`
3. Navigate to **Authentication** → **Users**
4. Here you can:
   - View all users
   - Delete users
   - Reset passwords
   - Disable accounts

## Next Steps

After creating users:
1. Share login credentials securely with the users
2. Have them log in and verify access
3. Users should change their password after first login
4. Monitor Firebase Console for any authentication issues
5. Regularly backup user data

## Support

For issues or questions about user management:
- Check the Firebase Authentication console for error details
- Review the browser console for JavaScript errors
- Verify Firebase Security Rules are properly deployed
- Contact the system administrator
