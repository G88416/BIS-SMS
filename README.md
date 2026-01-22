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

### Docker-based (Production)
- Docker and Docker Compose installed
- Port 3000 available (or configure custom port)

## Project Structure

```
BIS-SMS/
├── index.html              # Main login page
├── admin.html              # Admin dashboard and portals
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

## Security Note

⚠️ This system uses demo credentials for testing purposes. In a production environment, implement proper authentication, password encryption, and security measures.

## Support

For questions or issues, please refer to the [LOGIN_CREDENTIALS.md](LOGIN_CREDENTIALS.md) file or open an issue in the repository.

## License

This project is part of the Bophelong Independent School system.
