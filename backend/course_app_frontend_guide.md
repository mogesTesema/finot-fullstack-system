# Course App Frontend Developer Guide

This guide outlines how to seamlessly integrate the Finot backend `course` application into the frontend UI. It covers the architectural patterns, the available endpoints, and the step-by-step business workflows for SuperAdmins, Course Coordinators, and Students.

## 1. Architectural Concepts
*   **Course (Curriculum):** A static blueprint (e.g., "Church History 101"). Created by SuperAdmins.
*   **SemesterCourse:** A specific instance of a Course being taught during a specific academic year and semester (e.g., "Church History 101 - 2026 Sem 1"). Managed by `CourseCoordinators`.
*   **CourseSession:** A single day of class for a SemesterCourse.
*   **CourseEnrollment:** The junction linking a `Student` to a `SemesterCourse`.

## 2. API Endpoints Overview
The base URL for all endpoints is `/api/course/`.

| Resource | Endpoint | Permissions | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Curriculums** | `/curriculums/` | Read: All <br> Write: SuperAdmin | Read-only for frontend dropdowns. |
| **Semester Courses** | `/semester-courses/` | Read: All <br> Write: SuperAdmin | Create course offerings. Filter via `?batch_year=`. |
| **Enrollments** | `/enrollments/` | Read: Enrolled/Coord <br> Write: SuperAdmin | Filter via `?semester_course=<uuid>`. <br> Includes `/bulk-enroll/<id>/` action. |
| **Sessions** | `/sessions/` | Read: Enrolled/Coord <br> Write: Coord | Filter via `?semester_course=<uuid>`. <br> Includes `/roster/` action. |
| **Attendance** | `/attendance/` | Read: Enrolled/Coord <br> Write: Coord | Filter via `?session=<uuid>` or `?student=<uuid>`. <br> Includes `/bulk-mark/<session_id>/`. |
| **Materials** | `/api/resources/materials/` | Read: Enrolled/Scope <br> Write: Scope Admin | Upload PDFs/links. Filter via `?type=COURSE&course=<curriculum_uuid>`. |

---

## 3. Core Business Workflows

### Workflow A: Setting up a new Semester Course (SuperAdmin)
At the start of a semester, the administration must schedule classes and enroll students.
1.  **Create the Instance:**
    *   `POST /api/course/semester-courses/`
    *   **Payload:** `{"course": "<curriculum_uuid>", "academic_year": 2026, "semester": 1, "coordinators": ["<user_uuid>"]}`
2.  **Bulk Enroll Students:**
    Instead of adding students one by one, use the automated batch enrollment endpoint.
    *   `POST /api/course/enrollments/bulk-enroll/<semester_course_uuid>/`
    *   **Payload:** `{"batch_year": 3}`
    *   **Result:** The backend instantly finds all active `IN_CAMPUS` students in Batch 3 and enrolls them.

### Workflow B: The Daily Attendance Loop (Course Coordinator)
This is the most frequent action. The frontend UI should combine these steps into a smooth "Take Attendance" screen.
1.  **Create Today's Session:**
    *   `POST /api/course/sessions/`
    *   **Payload:** `{"semester_course": "<uuid>", "date": "2026-05-06", "topic": "Introduction", "teacher_name": "Guest Lecturer Abba XYZ"}`
    *   *Note: `teacher_name` is optional but highly recommended if a guest is teaching.*
2.  **Fetch the Attendance Roster:**
    Instead of manually downloading enrollments and attendance logs to build a table, simply hit the roster endpoint.
    *   `GET /api/course/sessions/<session_uuid>/roster/`
    *   **Response:** A pre-assembled array of students mapped to their current status.
    ```json
    {
      "roster": [
        {"student_id": "uuid", "first_name": "John", "last_name": "Doe", "status": null},
        {"student_id": "uuid", "first_name": "Jane", "last_name": "Doe", "status": "PRESENT"}
      ]
    }
    ```
3.  **Submit Attendance (Bulk Mark):**
    After the coordinator clicks the toggles on the frontend UI, send the *entire* list back to the server in one shot.
    *   `POST /api/course/attendance/bulk-mark/<session_uuid>/`
    *   **Payload:**
    ```json
    {
      "records": [
        {"student_id": "uuid1", "status": "PRESENT"},
        {"student_id": "uuid2", "status": "ABSENT"}
      ]
    }
    ```
    *   **Result:** The backend handles all creation and updating safely.

### Workflow C: Viewing Student History (Students & Admins)
To build a student's personal portal or dashboard:
1.  **Fetch Enrolled Courses:**
    *   `GET /api/course/semester-courses/`
    *   *(The backend automatically restricts the response to courses the logged-in student is enrolled in).*
2.  **Fetch Course Materials:**
    *   `GET /api/resources/materials/?type=COURSE&course=<curriculum_uuid>`
    *   *(Note: The `<curriculum_uuid>` is found in the `course` field of the `SemesterCourse` object fetched in Step 1).*
3.  **Fetch Personal Attendance History:**
    *   `GET /api/course/attendance/?student=<student_uuid>&session__semester_course=<course_uuid>`

---

## 4. Crucial Frontend Development Notes

*   **Strict UUID Validation:** All filtering query parameters (e.g., `?semester_course=123`) must be valid UUID v4 strings. If the frontend passes malformed strings like `?semester_course=null` or `?semester_course=undefined`, the API will return a `400 Bad Request` validation error. Ensure your Javascript sanitizes parameters before making `GET` requests.
*   **Privacy & Security:** The `/roster/` endpoint is strictly locked to users with the `CourseCoordinator` or `SuperAdmin` role. Students attempting to view the class roster will receive a `403 Forbidden` response.
*   **Nested Details:** To save you from making secondary API calls, most `GET` endpoints include nested serialization. For example, a `SemesterCourse` response will automatically include a fully hydrated `course_details` and `coordinators_details` object. Use these instead of making separate fetches!
