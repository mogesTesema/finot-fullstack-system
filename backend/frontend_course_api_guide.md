# Frontend Integration Guide: Course & Materials API
**Target Audience:** Frontend Engineers
**Last Updated:** May 2026

This document outlines how to interact with the `course` and `resources` applications from the frontend. The backend handles complex role-based access control (RBAC), meaning the API will automatically filter data based on who is logged in.

---

## 1. Core Concepts & Terminology

Before fetching data, it's important to understand the hierarchy of the new models:

1. **Curriculum (`Course`)**: The static blueprint (e.g., "Intro to Theology").
2. **Semester Course (`SemesterCourse`)**: An active instance of a Curriculum for a specific year and semester (e.g., "Intro to Theology - 2026 Semester 1"). Teachers are assigned here.
3. **Enrollment (`CourseEnrollment`)**: Links a Student to a Semester Course.
4. **Session (`CourseSession`)**: A specific date/day the Semester Course meets (e.g., "Sunday, Sept 5th").
5. **Attendance (`AttendanceRecord`)**: Tracks if a student was PRESENT, ABSENT, or EXCUSED for a specific Session.
6. **Material (`Material`)**: PDFs, links, or files. Materials are now managed in a **unified `resources` app** and can be scoped to a Course, a Service Group, or the entire university (General).

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
| **Materials** | `GET /api/resources/materials/` | Returns uploaded files and links (Course, Service, General). |

---

## 3. Role-Based Views & Frontend UI Flows

The backend automatically filters what data is returned based on the user's role (`STUDENT`, `COURSE_COORDINATOR`, `SERVICE_ADMIN`, `SUPER_ADMIN`). You do **not** need to pass user IDs in your GET requests to filter data.

### A. The Student Flow
When a user with the `STUDENT` role logs in:
* `GET /api/course/semester-courses/`: Returns **only** the courses they are officially enrolled in.
* `GET /api/resources/materials/`: Returns a **combined list** of:
  - Course materials for their enrolled courses
  - Service group materials for their active service group
  - General materials available to all students
* `GET /api/resources/materials/?type=COURSE`: Returns only course-related materials.
* `GET /api/course/attendance/`: Returns their personal attendance history.

**UI Recommendation**: Build a "My Courses" dashboard. A single fetch to `/api/course/semester-courses/` will give you their active schedule.

### B. The Coordinator Flow
When a user with the `COURSE_COORDINATOR` role logs in:
* `GET /api/course/semester-courses/`: Returns **all** semester courses across all batches.
* `GET /api/course/enrollments/`: Returns the list of students enrolled in courses (crucial for building the attendance roster grid).
* `GET /api/course/sessions/`: Returns the sessions for all classes.
* `POST /api/resources/materials/`: Allows them to upload course materials (use `material_type: "COURSE"`).

**UI Recommendation**: Build a "Coordinator Dashboard". Allow them to select a `SemesterCourse`, create `CourseSessions`, and upload materials via `/api/resources/materials/`.

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

## 5. Unified Materials API (NEW)

> **⚠️ BREAKING CHANGE**: The old `GET /api/course/materials/` endpoint has been **removed**. All materials are now served from `/api/resources/materials/`.

Materials are now a standalone system supporting three scopes:

| Type | Scope | Who Creates | Who Sees |
| :--- | :--- | :--- | :--- |
| `COURSE` | Tied to a static Curriculum | SuperAdmin, CourseCoordinator | Students enrolled in that course |
| `SERVICE` | Tied to a Service Group | SuperAdmin, ServiceAdmin of that group | Members of that service group |
| `GENERAL` | University-wide | SuperAdmin only | All active students |

### Filtering
```
GET /api/resources/materials/                          # All materials visible to you
GET /api/resources/materials/?type=COURSE              # Only course materials
GET /api/resources/materials/?type=SERVICE              # Only service group materials
GET /api/resources/materials/?type=GENERAL              # Only general materials
GET /api/resources/materials/?course=<uuid>             # Materials for a specific curriculum
GET /api/resources/materials/?service_group=<id>        # Materials for a specific service group
```

### Creating a Material
**Course Material:**
```json
{
  "title": "Chapter 1 Notes",
  "material_type": "COURSE",
  "course": "<course-curriculum-uuid>",
  "file": "<uploaded-file>",
  "url": null
}
```

**Service Group Material:**
```json
{
  "title": "Choir Practice Schedule",
  "material_type": "SERVICE",
  "service_group": 3,
  "url": "https://drive.google.com/..."
}
```

**General Material:**
```json
{
  "title": "University Prayer Guide 2026",
  "material_type": "GENERAL",
  "file": "<uploaded-file>"
}
```

**Important:**
- You must provide at least a `file` or a `url` (or both). Submitting neither returns `400`.
- Setting `course` for a `SERVICE` material (or vice-versa) returns `400`.

---

## 6. Security & Error Handling

* **403 Forbidden**: If a Coordinator tries to create a session or mark attendance for a course they are not assigned to, the backend will reject it. Handle these gracefully in the UI.
* **400 Bad Request (Validation Errors)**: The backend enforces strict data integrity. You will receive a `400` response if:
  * Bulk payloads are malformed or missing required fields.
  * A Coordinator submits attendance for a student who is **not enrolled** in the course (returns `{"error": "Some students are not enrolled...", "invalid_student_ids": [...]}`).
  * A duplicate `CourseSession` is created on the same date.
  * A duplicate `AttendanceRecord` is submitted for the same student in the same session.
  * Material cross-field validation fails (e.g., COURSE material without a `course` FK).

## 7. Swagger / OpenAPI Testing
All detailed payload schemas and exact field types are available in the Swagger UI. Visit `/api/docs/swagger/` on your local development server to test the endpoints interactively.
