# IVY LMS API Reference

Complete reference for the IVY LMS REST API endpoints.

---

## Base URL

```
Development: http://localhost:3000/api
Production: https://ivy-lms.vercel.app/
```

---

## Authentication

Most endpoints require authentication via JWT token in HTTP-only cookie. The token is automatically included in requests.

### Public Endpoints
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/google`
- `GET /api/auth/me` (optional authentication)

---

## Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Authentication Endpoints

### POST /api/auth/login

Authenticate user and set JWT cookie.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STUDENT",
    "avatarUrl": "https://..."
  }
}
```

**Error Codes:**
- `401` - Invalid credentials
- `403` - Account locked
- `429` - Too many attempts

---

### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STUDENT"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "id": "uuid",
    "email": "newuser@example.com"
  }
}
```

---

### POST /api/auth/logout

Logout user and clear JWT cookie.

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

---

### GET /api/auth/me

Get current authenticated user.

**Response (200):**
```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STUDENT",
    "avatarUrl": "https://...",
    "studentProfile": { ... }
  }
}
```

---

### POST /api/auth/google

Authenticate or register via Google OAuth.

**Request Body:**
```json
{
  "email": "user@gmail.com",
  "firstName": "John",
  "lastName": "Doe",
  "avatarUrl": "https://...",
  "role": "STUDENT"
}
```

---

## Student Endpoints

### GET /api/student/dashboard

Get student dashboard data.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "enrollments": [...],
    "upcomingAssignments": [...],
    "recentGrades": [...]
  }
}
```

---

### GET /api/student/assignments

List all assignments for the student.

**Query Parameters:**
- `status` - Filter by status (PENDING, SUBMITTED, GRADED)
- `skill` - Filter by IELTS skill

**Response (200):**
```json
{
  "success": true,
  "data": {
    "assignments": [...],
    "total": 10
  }
}
```

---

### GET /api/student/assignments/[id]

Get assignment details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Writing Task 2",
    "type": "WRITING_TASK2",
    "instructions": "...",
    "dueDate": "2024-01-20T23:59:00.000Z",
    "submission": { ... }
  }
}
```

---

### POST /api/student/assignments/[id]/submit

Submit assignment.

**Request Body:**
```json
{
  "content": "Essay text content...",
  "attachments": [
    { "url": "https://...", "type": "AUDIO" }
  ]
}
```

---

### POST /api/student/assignments/[id]/ai-grade

Request AI grading for writing assignment.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "score": 7.5,
    "feedback": "Detailed feedback...",
    "corrections": [...]
  }
}
```

---

### POST /api/student/assignments/[id]/request-regrade

Request teacher regrade after AI grading.

**Response (200):**
```json
{
  "success": true,
  "message": "Regrade requested successfully"
}
```

---

## Teacher Endpoints

### GET /api/teacher/dashboard

Get teacher dashboard data.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "courses": [...],
    "pendingGrading": [...],
    "recentSubmissions": [...]
  }
}
```

---

### GET /api/teacher/assignments

List assignments created by teacher.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "assignments": [...]
  }
}
```

---

### POST /api/teacher/assignments

Create a new assignment.

**Request Body:**
```json
{
  "title": "Writing Task 2",
  "type": "WRITING_TASK2",
  "instructions": "Write an essay...",
  "courseId": "uuid",
  "dueDate": "2024-01-20T23:59:00.000Z",
  "maxScore": 9.0,
  "rubric": { ... }
}
```

---

### GET /api/teacher/submissions

List submissions for grading.

**Query Parameters:**
- `status` - Filter by status
- `assignmentId` - Filter by assignment

**Response (200):**
```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "id": "uuid",
        "student": { ... },
        "assignment": { ... },
        "content": "...",
        "status": "SUBMITTED",
        "submittedAt": "2024-01-15T10:00:00.000Z"
      }
    ]
  }
}
```

---

### POST /api/teacher/submissions/[id]/grade

Grade a submission.

**Request Body:**
```json
{
  "score": 7.5,
  "feedback": "Good work on...",
  "rubricScores": [
    { "criterion": "Task Response", "score": 8 }
  ]
}
```

---

## Admin Endpoints

### GET /api/admin/users

List all users.

**Query Parameters:**
- `role` - Filter by role
- `status` - Filter by status

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "total": 50
  }
}
```

---

### POST /api/admin/users

Create new user.

**Request Body:**
```json
{
  "email": "new@example.com",
  "firstName": "New",
  "lastName": "User",
  "role": "TEACHER",
  "password": "temp123"
}
```

---

### GET /api/admin/courses

List all courses.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "courses": [...]
  }
}
```

---

### POST /api/admin/courses

Create new course.

**Request Body:**
```json
{
  "name": "IELTS Preparation",
  "description": "Complete IELTS course",
  "level": "INTERMEDIATE",
  "teacherId": "uuid"
}
```

---

## Course Endpoints

### GET /api/courses

List all available courses.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "courses": [...]
  }
}
```

---

### GET /api/courses/[id]

Get course details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "IELTS Preparation",
    "description": "...",
    "teacher": { ... },
    "lessons": [...],
    "enrollments": [...]
  }
}
```

---

## Notification Endpoints

### GET /api/notifications

Get user notifications.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "ASSIGNMENT",
        "title": "New Assignment",
        "message": "...",
        "isRead": false,
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ]
  }
}
```

---

### PUT /api/notifications/[id]/read

Mark notification as read.

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

## Upload Endpoints

### POST /api/upload

Upload file to Cloudinary.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with `file` field

**Response (200):**
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "..."
  }
}
```

---

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## Rate Limiting

API endpoints have rate limiting applied:
- Authentication: 5 requests per minute
- General API: 100 requests per minute
