# BIS-SMS - Bophelong Independent School Management System

A comprehensive web-based School Management System for managing students, teachers, classes, attendance, grades, and finances.

## Features

- **Multi-User Portal System**
  - Administrator Dashboard
  - Teacher Portal
  - Student Portal
  - Parent/Guardian Portal

- **Student Management**: Add, edit, search, and export student records
- **Teacher Management**: Manage teaching staff and class assignments
- **Class Management**: Create classes, assign teachers, manage enrollment
- **Attendance Tracking**: Mark attendance, view history, generate reports
- **Advanced Grades System**: Multi-subject grading with weighted assessments and report cards
- **Finance Management**: Track fees, payments, expenses, and generate financial reports
- **Reporting & Analytics**: Comprehensive reports with charts and visualizations

## Getting Started

### Quick Start

1. Open `index.html` in your web browser
2. Select your user type and log in with the credentials below

### Login Credentials

For detailed login information for all user types, see **[LOGIN_CREDENTIALS.md](LOGIN_CREDENTIALS.md)**

**Quick Reference:**
- **Administrator**: Username `admin`, Password `admin123`
- **Teacher**: Any Teacher ID (e.g., `1` or `2`), Password `teacher123`
- **Student**: Any Student ID (e.g., `1` or `2`), Password `student123`
- **Parent**: Child ID `C331`, Access Code `parent321`

> **Note**: The system uses Firebase Authentication with `.local` domain emails (e.g., `admin@bis.local`). See [FAQ.md](FAQ.md) for explanation of why `.local` is used.

## System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Local storage enabled for data persistence

## Project Structure

```
BIS-SMS/
├── index.html                      # Main login page
├── admin.html                      # Admin dashboard and portals
├── parent-portal-module.html       # Parent portal interface
├── README.md                       # Project overview
├── FAQ.md                          # Frequently Asked Questions
├── LOGIN_CREDENTIALS.md            # Login credentials for all user types
├── USER_MANAGEMENT_GUIDE.md        # User creation and management guide
├── CLOUD_STORAGE_FIX_SUMMARY.md    # Cloud storage implementation details
└── (additional documentation files...)
```

## Technologies Used

- HTML5
- CSS3 (Bootstrap 5)
- JavaScript (Vanilla)
- Chart.js for data visualization
- Font Awesome for icons
- Local Storage for data persistence

## Security Note

⚠️ This system uses demo credentials for testing purposes. In a production environment, implement proper authentication, password encryption, and security measures.

## Support

For questions or issues, please refer to the [LOGIN_CREDENTIALS.md](LOGIN_CREDENTIALS.md) file or open an issue in the repository.

## License

This project is part of the Bophelong Independent School system.
