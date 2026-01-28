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

### Quick Start (Browser)

1. Open `index.html` in your web browser
2. Select your user type and log in with the credentials below

### Quick Start (Node.js Server)

For running the application with the built-in Express server:

```bash
# Install dependencies (required on first run)
npm install

# Start the server
npm start
```

Then access the application at: http://localhost:3000

### Quick Start (Docker)

For production deployment using Docker, see **[README_DOCKER.md](README_DOCKER.md)**

**Quick Docker setup:**
```bash
docker-compose up -d
```
Then access the application at: http://localhost:3000

### Login Credentials

For detailed login information for all user types, see **[LOGIN_CREDENTIALS.md](LOGIN_CREDENTIALS.md)**

**Quick Reference:**
- **Administrator**: Username `admin`, Password `admin123`
- **Teacher**: Any Teacher ID (e.g., `1` or `2`), Password `teacher123`
- **Student**: Any Student ID (e.g., `1` or `2`), Password `student123`
- **Parent**: Child ID `C331`, Access Code `parent321`

## System Requirements

### Browser-based (Local Development)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Local storage enabled for data persistence

### Node.js Server (Development/Production)
- Node.js v14 or higher
- npm (Node Package Manager)
- Port 3000 available (or configure custom port)

### Docker-based (Production)
- Docker and Docker Compose installed
- Port 3000 available (or configure custom port)

## Project Structure

```
BIS-SMS/
├── index.html              # Main application (login page + dashboard with all portals)
├── README.md               # This file
└── LOGIN_CREDENTIALS.md    # Detailed login credentials documentation
```

## Technologies Used

- HTML5
- CSS3 (Bootstrap 5)
- JavaScript (Vanilla)
- Chart.js for data visualization
- Font Awesome for icons
- Local Storage for data persistence
- Node.js & Express (Docker deployment)
- Firebase (Authentication & Hosting)

## Deployment

### GitHub Pages
The app works seamlessly on GitHub Pages with direct file serving.

### Firebase Hosting
Firebase Hosting configuration has been optimized for proper static file serving. See [FIREBASE_HOSTING_FIX.md](FIREBASE_HOSTING_FIX.md) for details.

**Quick Deploy:**
```bash
firebase deploy --only hosting
```

For detailed deployment instructions, see [DEPLOY.md](DEPLOY.md).

## Security Note

⚠️ This system uses demo credentials for testing purposes. In a production environment, implement proper authentication, password encryption, and security measures.

### Recent Security Improvements (v1.1.0)

✅ **Comprehensive security fixes implemented** - See [SECURITY_FIXES.md](SECURITY_FIXES.md) and [FIX_SUMMARY.md](FIX_SUMMARY.md) for details:
- XSS protection (131 instances)
- Safe localStorage operations (89 instances)
- Portal access validation (3 portals)
- Null-safe DOM access (57 instances)
- CSV validation and security (12 instances)
- Cross-tab logout synchronization
- Security headers (Helmet.js)
- Enhanced error handling
- **CodeQL Security Scan: 0 vulnerabilities**

## Support

For questions or issues, please refer to:
- [DEPLOY.md](DEPLOY.md) - Deployment instructions
- [FIREBASE_HOSTING_FIX.md](FIREBASE_HOSTING_FIX.md) - Firebase hosting fix details
- [LOGIN_CREDENTIALS.md](LOGIN_CREDENTIALS.md) - Login information
- [SECURITY_FIXES.md](SECURITY_FIXES.md) - Security improvements
- [FIX_SUMMARY.md](FIX_SUMMARY.md) - Complete fix summary
- Open an issue in the repository

## License

This project is part of the Bophelong Independent School system.
