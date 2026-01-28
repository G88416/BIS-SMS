# Firebase Storage Implementation Guide

## Overview
This guide explains the Firebase Storage folder structure and upload functionality implemented in the BIS-SMS system.

## Storage Folder Structure

The Firebase Storage is organized into the following folder hierarchy:

```
/
├── students/{studentId}/
│   └── {timestamp}_{filename}
├── teachers/{teacherId}/
│   └── {timestamp}_{filename}
├── parents/{parentId}/
│   └── {timestamp}_{filename}
├── teacher-portal/{teacherId}/
│   ├── assignments/{assignmentId}/
│   │   └── {timestamp}_{filename}
│   ├── attendance/
│   │   └── {timestamp}_{filename}
│   └── work/
│       └── {timestamp}_{filename}
├── profiles/{userId}/
│   └── {filename}
├── homework/{classId}/{studentId}/
│   └── {filename}
├── assignments/{classId}/
│   └── {filename}
├── reports/{studentId}/
│   └── {filename}
└── ... (other existing folders)
```

## Storage Rules

The storage rules have been configured to ensure proper access control:

### Students Folder
- **Path**: `/students/{studentId}/{fileName}`
- **Read**: All authenticated users
- **Write**: Admins only
- **Allowed Types**: Images and documents
- **Size Limit**: 10MB

### Teachers Folder
- **Path**: `/teachers/{teacherId}/{fileName}`
- **Read**: All authenticated users
- **Write**: Admins and the teacher themselves
- **Allowed Types**: Images and documents
- **Size Limit**: 10MB

### Parents Folder
- **Path**: `/parents/{parentId}/{fileName}`
- **Read**: Admins and the parent themselves
- **Write**: Admins and the parent themselves
- **Allowed Types**: Images and documents
- **Size Limit**: 10MB

### Teacher Portal - Assignments
- **Path**: `/teacher-portal/{teacherId}/assignments/{assignmentId}/{fileName}`
- **Read**: All authenticated users
- **Write**: Admins and the teacher themselves
- **Allowed Types**: Documents, images, and videos
- **Size Limit**: 50MB

### Teacher Portal - Attendance
- **Path**: `/teacher-portal/{teacherId}/attendance/{fileName}`
- **Read**: Admins, the teacher, and other teachers
- **Write**: Admins and the teacher themselves
- **Allowed Types**: Documents, JSON, and CSV files
- **Size Limit**: 10MB

### Teacher Portal - Work Documents
- **Path**: `/teacher-portal/{teacherId}/work/{fileName}`
- **Read**: Admins, the teacher, and other teachers
- **Write**: Admins and the teacher themselves
- **Allowed Types**: Documents, images, and videos
- **Size Limit**: 50MB

## Utility Functions

The following JavaScript utility functions have been added to simplify file uploads:

### Core Upload Function
```javascript
async function uploadToStorage(file, path)
```
- Uploads a file to the specified Firebase Storage path
- Returns the download URL
- Example:
```javascript
const file = document.getElementById('fileInput').files[0];
const url = await uploadToStorage(file, 'students/1/document.pdf');
```

### Student File Upload
```javascript
async function uploadStudentFile(studentId, file)
```
- Uploads a file to the student's folder
- Automatically generates timestamped filename
- Example:
```javascript
const file = document.getElementById('fileInput').files[0];
const url = await uploadStudentFile('123', file);
```

### Teacher File Upload
```javascript
async function uploadTeacherFile(teacherId, file)
```
- Uploads a file to the teacher's folder
- Example:
```javascript
const url = await uploadTeacherFile('1', file);
```

### Parent File Upload
```javascript
async function uploadParentFile(parentId, file)
```
- Uploads a file to the parent's folder
- Example:
```javascript
const url = await uploadParentFile('C331', file);
```

### Assignment File Upload
```javascript
async function uploadAssignmentFile(teacherId, assignmentId, file)
```
- Uploads a file to a specific assignment folder
- Example:
```javascript
const url = await uploadAssignmentFile('1', '1234567890', file);
```

### Attendance Register Upload
```javascript
async function uploadAttendanceRegister(teacherId, file)
```
- Uploads attendance register to teacher's attendance folder
- Example:
```javascript
const jsonFile = new File([jsonData], 'attendance.json', {type: 'application/json'});
const url = await uploadAttendanceRegister('1', jsonFile);
```

### Teacher Work Upload
```javascript
async function uploadTeacherWork(teacherId, file)
```
- Uploads work document to teacher's work folder
- Example:
```javascript
const url = await uploadTeacherWork('1', file);
```

### Get Storage URL
```javascript
async function getStorageURL(path)
```
- Retrieves the download URL for a file at the given path
- Example:
```javascript
const url = await getStorageURL('students/1/document.pdf');
```

## Helper Functions

### File Size Formatting
```javascript
function formatFileSize(bytes)
```
- Converts bytes to human-readable format (KB, MB, GB)
- Example: `formatFileSize(1024)` returns "1 KB"

### File Extension
```javascript
function getFileExtension(filename)
```
- Extracts file extension from filename
- Example: `getFileExtension('document.pdf')` returns "pdf"

### File Icon
```javascript
function getFileIcon(filename)
```
- Returns appropriate Font Awesome icon class based on file type
- Example: `getFileIcon('document.pdf')` returns "fa-file-pdf text-danger"

## Implemented Features

### 1. Assignment Creation with File Attachments
Teachers can now upload files when creating assignments:
- Navigate to Teacher Portal → Assignment Management
- Click "Create New Assignment"
- Fill in assignment details
- Attach files using the file input
- Files are uploaded to `/teacher-portal/{teacherId}/assignments/{assignmentId}/`
- Attachments are displayed with file icons, names, and sizes

### 2. Attendance Register Export to Cloud
Teachers can export attendance records to Firebase Storage:
- Navigate to Teacher Portal → Attendance Management
- Select class and date
- Mark attendance
- Click "Save to Cloud Storage"
- Attendance data is saved as JSON file to `/teacher-portal/{teacherId}/attendance/`
- File includes complete metadata (class, date, student records)

### 3. Teacher Work Document Upload
Teachers can upload teaching materials and resources:
- Navigate to Teacher Portal → Resource Sharing
- Click "Upload New Resource"
- Fill in resource details
- Upload file
- Files are stored in `/teacher-portal/{teacherId}/work/`
- Resources are organized by category
- Display includes file size, type, and download counts

## Usage Examples

### Example 1: Upload Student Document (Admin)
```javascript
// Get file from input
const fileInput = document.getElementById('studentDocInput');
const file = fileInput.files[0];
const studentId = '123';

// Upload file
try {
  const downloadURL = await uploadStudentFile(studentId, file);
  console.log('File uploaded successfully:', downloadURL);
  
  // Store URL in database or display to user
  alert('Document uploaded successfully!');
} catch (error) {
  console.error('Upload failed:', error);
  alert('Failed to upload document');
}
```

### Example 2: Create Assignment with Multiple Files (Teacher)
```javascript
// This is handled automatically by the createAssignment() function
// when files are selected in the assignment modal
async function createAssignment() {
  const fileInput = document.getElementById('assignment-files');
  const files = fileInput.files;
  
  const attachments = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const url = await uploadAssignmentFile(teacherId, assignmentId, file);
    attachments.push({
      name: file.name,
      url: url,
      size: file.size,
      type: file.type
    });
  }
  
  // Store attachments with assignment data
  assignment.attachments = attachments;
}
```

### Example 3: Export Attendance Register
```javascript
// This is handled by the exportAttendanceToCloud() function
async function exportAttendanceToCloud() {
  // Create attendance report object
  const report = {
    className: 'Grade 10A',
    date: '2026-01-28',
    teacherId: '1',
    attendance: [...]
  };
  
  // Convert to JSON file
  const jsonData = JSON.stringify(report, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const file = new File([blob], 'attendance_Grade10A_2026-01-28.json');
  
  // Upload to cloud
  const url = await uploadAttendanceRegister(teacherId, file);
  alert('Attendance saved to cloud: ' + url);
}
```

## Security Considerations

1. **Authentication Required**: All uploads require user authentication
2. **Role-Based Access**: Storage rules enforce role-based access control
3. **File Type Validation**: Only allowed file types can be uploaded
4. **Size Limits**: Files are limited to prevent abuse (10MB or 50MB depending on type)
5. **Path Restrictions**: Users can only upload to authorized paths

## Testing

To test the Firebase Storage functionality:

1. **Test Assignment Upload**:
   - Log in as a teacher
   - Create a new assignment
   - Attach one or more files (PDF, images, etc.)
   - Verify files appear in assignment listing
   - Click on file links to download

2. **Test Attendance Export**:
   - Log in as a teacher
   - Navigate to Attendance Management
   - Select a class and date
   - Mark attendance
   - Click "Save to Cloud Storage"
   - Verify success message

3. **Test Resource Upload**:
   - Log in as a teacher
   - Navigate to Resource Sharing
   - Upload a new resource
   - Verify file appears in resource list
   - Click "View" to download

## Troubleshooting

### Upload Fails
- Check internet connection
- Verify Firebase Storage is properly configured
- Check file size (must be under limits)
- Verify file type is allowed
- Check browser console for error messages

### Download URL Not Working
- Verify file was uploaded successfully
- Check Firebase Storage rules
- Ensure user has read permissions
- Check if file exists in Firebase Console

### Permission Denied
- Verify user is logged in
- Check user role and permissions
- Verify storage rules match user role
- Check userId matches in path and auth

## Future Enhancements

Potential future improvements:
1. Add file preview before upload
2. Implement drag-and-drop upload
3. Add batch file upload capability
4. Implement file search and filtering
5. Add file versioning
6. Implement file deletion with confirmation
7. Add thumbnail generation for images
8. Implement progress bars for large uploads
9. Add file compression before upload
10. Implement virus scanning integration

## Support

For issues or questions:
- Check Firebase Console for storage activity
- Review browser console for JavaScript errors
- Verify Firebase configuration in index.html
- Check storage.rules for access control issues
