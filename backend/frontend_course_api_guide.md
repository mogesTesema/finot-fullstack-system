# Frontend Integration Guide: Course App API
**Target Audience:** Frontend Engineers
**Date:** April 2026

This document outlines how to interact with the newly refactored `course` application from the frontend. The backend handles complex role-based access control (RBAC), meaning the API will automatically filter data based on who is logged in.

---

## 1. Core Concepts & Terminology

Before fetching data, it's important to understand the hierarchy of the new models:

1. **Curriculum (`Course`)**: The static blueprint (e.g., "Intro to Theology").
2. **Semester Course (`SemesterCourse`)**: An active instance of a Curriculum for a specific year and semester (e.g., "Intro to Theology - 2026 Semester 1"). Teachers are assigned here.
3. **Enrollment (`CourseEnrollment`)**: Links a Student to a Semester Course.
4. **Session (`CourseSession`)**: A specific date/day the Semester Course meets (e.g., "Sunday, Sept 5th").
5. **Attendance (`AttendanceRecord`)**: Tracks if a student was PRESENT, ABSENT, or EXCUSED for a specific Session.
6. **Material (`CourseMaterial`)**: PDFs or links uploaded by a Teacher for a Semester Course.

---

## 2. API Endpoints Overview

The base URL for all course endpoints is: `/api/course/`

| Resource | Endpoint | Description |
| :--- | :--- | :--- |
| **Curriculums** | `GET /api/course/curriculums/` | Returns the static course blueprints. |
| **Semester Courses** | `GET /api/course/semester-courses/` | Returns the active courses for the semester. |
| **Enrollments** | `GET /api/course/enrollments/` | Returns the student's enrollments. |
| **Sessions** | `GET /api/course/sessions/` | Returns scheduled class dates. |
| **Attendance** | `GET /api/course/attendance/` | Returns roll call data. |
| **Materials** | `GET /api/course/materials/` | Returns uploaded files and links. |

---

## 3. Role-Based Views & Frontend UI Flows

The backend automatically filters what data is returned based on the user's role (`STUDENT`, `TEACHER`, `SUPER_ADMIN`). You do **not** need to pass user IDs in your GET requests to filter data.

### A. The Student Flow
When a user with the `STUDENT` role logs in:
* `GET /api/course/semester-courses/`: Returns **only** the courses they are officially enrolled in.
* `GET /api/course/materials/`: Returns **only** the materials for their enrolled courses.
* `GET /api/course/attendance/`: Returns their personal attendance history.

**UI Recommendation**: Build a "My Courses" dashboard. A single fetch to `/api/course/semester-courses/` will give you their active schedule.

### B. The Teacher Flow
When a user with the `TEACHER` role logs in:
* `GET /api/course/semester-courses/`: Returns **only** the courses where they are assigned as a teacher.
* `GET /api/course/enrollments/`: Returns the list of students enrolled in their assigned courses (crucial for building the attendance roster grid).
* `GET /api/course/sessions/`: Returns the sessions for their classes.
* `POST /api/course/materials/`: Allows them to upload files for their assigned courses.

**UI Recommendation**: Build a "Teacher Dashboard". Allow them to select one of their `SemesterCourses`, create `CourseSessions`, and upload `CourseMaterials`.

### C. Creating a Course Session
**Endpoint:** `POST /api/course/sessions/`
**Use Case:** A teacher schedules a new class session for their course.
**Payload:**
```json
{
  "semester_course": "123e4567-e89b-12d3-a456-426614174000",
  "date": "2026-05-06",
  "topic": "Optional topic string",
  "teacher_name": "Optional teacher name"
}
```
**Important:** 
- The `date` field is strictly required and must be formatted as `YYYY-MM-DD`. Do not send `sessionDate`, `datetime`, or omit this field, as the backend will immediately return a `400 Bad Request`.
- The `semester_course` must be a valid UUID. If you pass an invalid format (like `null`, `undefined` or a raw string), the backend will return `400 Bad Request`.

---

## 4. Bulk Operations (Important for UI)

To prevent the frontend from sending hundreds of individual requests, the backend provides two powerful bulk endpoints.

### 1. Bulk Enroll Students (Admin Only)
**Endpoint:** `POST /api/course/enrollments/bulk-enroll/<semester_course_id>/`
**Use Case:** An admin wants to enroll an entire batch of students (e.g., all Year 1 students) into a course instantly.
**Payload:**
```json
{
  "batch_year": 1
}
```
**Response:** `{"message": "Bulk enrollment completed.", "requested_students": 100, "new_enrollments": 100}`

### 2. Bulk Mark Attendance (Teacher Only)
**Endpoint:** `POST /api/course/attendance/bulk-mark/<session_id>/`
**Use Case:** A teacher has an attendance grid/spreadsheet on their screen and hits "Submit" to save the whole class at once.
**Payload:**
```json
{
  "records": [
    { "student_id": "uuid-of-student-1", "status": "PRESENT" },
    { "student_id": "uuid-of-student-2", "status": "ABSENT" },
    { "student_id": "uuid-of-student-3", "status": "EXCUSED" }
  ]
}
```
**UI Recommendation**: For a specific `CourseSession`, fetch all enrolled students, display them in a list with a dropdown/toggle for status, and send the array to this endpoint on save.

---

## 5. Security & Error Handling

* **403 Forbidden**: If a Teacher tries to create a session or mark attendance for a course they are not assigned to, the backend will reject it. Handle these gracefully in the UI.
* **400 Bad Request (Validation Errors)**: The backend enforces strict data integrity. You will receive a `400` response if:
  * Bulk payloads are malformed or missing required fields.
  * A Teacher submits attendance for a student who is **not enrolled** in the course (returns `{"error": "Some students are not enrolled...", "invalid_student_ids": [...]}`).
  * A duplicate `CourseSession` is created on the same date.
  * A duplicate `AttendanceRecord` is submitted for the same student in the same session.

## 6. Swagger / OpenAPI Testing
All detailed payload schemas and exact field types are available in the Swagger UI. Visit `/api/docs/swagger/` on your local development server to test the endpoints interactively.
