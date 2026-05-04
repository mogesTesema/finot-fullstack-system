# Backend Updates: Private Counselor Q&A Feature
**Target Audience:** Frontend Engineers
**Date:** April 2026

This document outlines the recent backend architectural changes related to the **Private Q&A feature** and explains how these updates impact frontend data fetching, user flows, and notifications.

---

## 1. Overview: The New `visibility` Concept
The Question model now supports a `visibility` field. Questions can either be `PUBLIC` or `PRIVATE`.
* **PUBLIC**: The standard flow. Requires approval by a `QAModerator` before it appears in the public feed. Can be submitted anonymously.
* **PRIVATE**: A direct channel between a logged-in user and a `QACounselor`. These bypass moderation, are auto-approved, and **never** appear in the public feed.

---

## 2. Changes to Question Submission (POST)
When the frontend submits a new question via `POST /api/qa/questions/`, you must account for the new `visibility` field.

### Payload Updates
* **`visibility` (string, optional)**: Accepts `"PUBLIC"` or `"PRIVATE"`. Defaults to `"PUBLIC"` if omitted.

### Important Rules to Handle in UI
1. **Authentication Requirement**: If a user selects "Private" in your UI, **they must be logged in**. The backend will reject any private question from an anonymous user with a `400 Bad Request`.
2. **Auto-Approval**: Private questions do not require moderation. Once submitted, they go straight to the Counselor Queue.

---

## 3. New API Endpoints & User Flows

The core `/api/qa/questions/` `GET` endpoint remains unchanged and will **only return APPROVED + PUBLIC questions**. To support the new flows, we have introduced several dedicated endpoints:

### A. For Standard Users (Students/Members)
* `GET /api/qa/questions/my-contributions/`
  * **Use case**: A user dashboard to show their activity.
  * **Returns**: BOTH questions and answers submitted by the currently logged-in user, regardless of their approval status or visibility.
  * **Structure**: Returns a JSON object with two arrays: `{"questions": [...], "answers": [...]}`.

* `GET /api/qa/questions/private-inbox/`
  * **Use case**: A dedicated "Private Inbox" screen where users can see conversations they started with counselors.
  * **Returns**: ONLY the logged-in user's `PRIVATE` questions, alongside the counselor's answers.

### B. For QA Counselors (Role: `QACounselor`)
* `GET /api/qa/questions/counselor-queue/`
  * **Use case**: The dashboard for counselors to view incoming private questions.
  * **Returns**: All `PRIVATE` questions. Unanswered questions are sorted to appear first.
  * **Note**: Counselors use the standard `POST /api/qa/answers/` endpoint to reply. Private answers are auto-approved.

### C. For QA Moderators (Role: `QAModerator`)
* `GET /api/qa/questions/moderation-queue/`
  * **Use case**: The moderation dashboard.
  * **Returns**: All unapproved `PUBLIC` questions.
* `POST /api/qa/questions/{id}/approve/`
  * **Use case**: Approves a public question to make it visible on the main feed.
* `POST /api/qa/answers/{id}/approve/`
  * **Use case**: Approves a public answer.

*(Note: Ensure your UI hides the Counselor and Moderation queues unless the logged-in user's JWT token contains the respective roles: `QACounselor` or `QAModerator`.)*

---

## 4. Notification System Updates

When a counselor answers a user's private question, the backend now automatically fires a notification to the user who asked the question.

### What the Frontend Needs to Know
* **New Notification Type**: The `notification_type` for these alerts is `"QA"`.
* **Channels Used**: These notifications are dispatched via **In-App Notifications** (saved to the DB for the user's notification bell) and **Firebase Push Notifications** (sent to the user's registered FCM devices).
* **Action Required**: 
  1. In your notification bell dropdown or screen, if a notification has `notification_type === "QA"`, clicking it should route the user to their Private Inbox (`/private-inbox` or equivalent frontend route).
  2. Ensure your Firebase push notification listener on the client is prepared to handle payloads where `type` is `"QA"`. Note that SMS and Email channels are explicitly disabled for Q&A to save costs.

---

## 5. API Documentation
All endpoints, including payload schemas and response structures, have been fully documented using OpenAPI/Swagger. 
* You can view and test the exact contracts by visiting: **`/api/docs/swagger/`** on your local backend server or staging environment.

<br/>

# Backend Updates: Course Management API
**Target Audience:** Frontend Engineers
**Date:** April 2026

This section outlines how to interact with the newly refactored `course` application from the frontend. The backend handles complex role-based access control (RBAC), meaning the API will automatically filter data based on who is logged in.

---

## 1. Core Concepts & Terminology

Before fetching data, it's important to understand the hierarchy of the new models:

1. **Curriculum (`Course`)**: The static blueprint (e.g., "Intro to Theology").
2. **Semester Course (`SemesterCourse`)**: An active instance of a Curriculum for a specific year and semester (e.g., "Intro to Theology - 2026 Semester 1"). Course Coordinators (nominated students) are assigned here.
3. **Enrollment (`CourseEnrollment`)**: Links a Student to a Semester Course.
4. **Session (`CourseSession`)**: A specific date/day the Semester Course meets (e.g., "Sunday, Sept 5th"). Includes `teacher_name` — the guest lecturer for that day.
5. **Attendance (`AttendanceRecord`)**: Tracks if a student was PRESENT, ABSENT, or EXCUSED for a specific Session.
6. **Material (`CourseMaterial`)**: PDFs or links uploaded by a Course Coordinator for a Semester Course.

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

The backend automatically filters what data is returned based on the user's role (`STUDENT`, `COURSE_COORDINATOR`, `SUPER_ADMIN`). You do **not** need to pass user IDs in your GET requests to filter data.

### A. The Student Flow
When a user with the `STUDENT` role logs in:
* `GET /api/course/semester-courses/`: Returns **only** the courses they are officially enrolled in.
* `GET /api/course/materials/`: Returns **only** the materials for their enrolled courses.
* `GET /api/course/attendance/`: Returns their personal attendance history.

**UI Recommendation**: Build a "My Courses" dashboard. A single fetch to `/api/course/semester-courses/` will give you their active schedule.

### B. The Course Coordinator Flow
When a user with the `CourseCoordinator` role logs in, they have **global access** to all course data across all batches:
* `GET /api/course/semester-courses/`: Returns **all** active semester courses in the system. 
  * **New Feature:** You can append `?batch_year=1` to filter the courses for a specific batch.
* `GET /api/course/enrollments/`: Returns all students enrolled in the courses (crucial for building the attendance roster grid).
* `GET /api/course/sessions/`: Returns the sessions for all classes.
* `POST /api/course/sessions/`: Allows creating sessions with an optional `teacher_name` field (the guest lecturer's name for that day).
* `POST /api/course/materials/`: Allows them to upload files for any course.

**UI Recommendation**: Build a "Coordinator Dashboard". Provide a dropdown filter for `batch_year` at the top so they can easily find the `SemesterCourses` they want to manage today, create `CourseSessions` with a guest teacher name, and upload `CourseMaterials`.

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

### 2. Bulk Mark Attendance (Coordinator Only)
**Endpoint:** `POST /api/course/attendance/bulk-mark/<session_id>/`
**Use Case:** A coordinator has an attendance grid/spreadsheet on their screen and hits "Submit" to save the whole class at once.
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

* **403 Forbidden**: If a Coordinator tries to use an endpoint they don't have access to, though they have global access to the Course app now.
* **400 Bad Request (Validation Errors)**: The backend enforces strict data integrity. You will receive a `400` response if:
  * Bulk payloads are malformed or missing required fields.
  * A Coordinator submits attendance for a student who is **not enrolled** in the course (returns `{"error": "Some students are not enrolled...", "invalid_student_ids": [...]}`).
  * A duplicate `CourseSession` is created on the same date.
  * A duplicate `AttendanceRecord` is submitted for the same student in the same session.

<br/>

# Backend Updates: Event Manager Role & Security
**Target Audience:** Frontend Engineers
**Date:** May 2026

This section outlines the introduction of the new `EventManager` role and critical security updates to the Event API that the frontend needs to handle.

---

## 1. New Role: `EventManager`
A new role, `EventManager`, has been added to the system. 
- **Purpose**: To allow dedicated personnel to create and manage *General / Global Events* without needing full `SuperAdmin` privileges.
- **Frontend Check**: You can verify if the logged-in user has this role by checking their `roles` array (or equivalent JWT claim) for the string `"EventManager"`.

---

## 2. Event Creation & Management (Updates)

### Global Events vs. Group Events
When submitting a `POST /api/service/events/` request:
- If the user is an `EventManager` (or `SuperAdmin`/Staff), they can submit the payload **without** a `service_group`. This creates a global event visible to everyone on the platform.
- If the user is a `ServiceAdmin`, the backend will **force** the event to be linked to their managed group, regardless of what the frontend sends.

### Security Patch: Updates and Deletions
A critical security patch was applied to the `PUT`, `PATCH`, and `DELETE` endpoints for `/api/service/events/{id}/`. 
Previously, there were no strict checks on who could edit an event. Now, strict Role-Based Access Control (RBAC) is enforced.

**What the Frontend must handle:**
- **UI Element Hiding**: Ensure that "Edit" and "Delete" buttons on an Event card are **ONLY** rendered if the logged-in user meets one of these criteria:
  1. The user has the `"SuperAdmin"` or `"EventManager"` role.
  2. The user has the `"ServiceAdmin"` role **AND** the event's `service_group` ID matches the group the user manages.
- **Error Handling**: If an unauthorized user attempts an edit/delete, the API will now return a `403 Forbidden` response: `{"detail": "You do not have permission to modify this event."}`. Ensure your UI catches this gracefully and displays an appropriate error toast.

<br/>

# Backend Updates: Q&A Moderation Security & Workflow Fixes
**Target Audience:** Frontend Engineers
**Date:** May 2026

This section details critical bug fixes and security enhancements deployed to the Q&A moderation system. These changes directly affect how the frontend handles pending questions, editing capabilities, and moderator permissions.

---

## 1. Moderation Bypass Fix: Editing Approved Content
**The Update:** A major security patch was applied to prevent users from bypassing moderation by editing their already-approved public questions or answers.
**What the Frontend must handle:**
- If a normal user edits an approved `PUBLIC` question or answer (via `PUT` or `PATCH`), the backend will automatically reset its `is_approved` status to `False`.
- **UI Implication:** After a successful edit, the item will immediately disappear from the main public feed and return to the `moderation_queue`. The frontend should handle this gracefully (e.g., show a toast: "Your edit has been submitted for moderation review" and remove the item from the local public feed state).
- Note: This does not apply to `PRIVATE` questions, as they do not require moderation.

## 2. Fix for "404 Not Found" on Pending Content
**The Update:** Previously, authors would receive a 404 error if they tried to view or edit their own unapproved questions/answers via detail endpoints. The backend `get_queryset` has been rewritten to be context-aware.
**What the Frontend must handle:**
- Authors can now successfully call `GET`, `PUT`, `PATCH`, and `DELETE` on their own pending content using the detail endpoints (e.g., `/api/qa/questions/{id}/`).
- The frontend can confidently provide "Edit" and "Delete" buttons for a user's pending items in their `my-contributions` dashboard.

## 3. Moderator Deletion Capabilities
**The Update:** The `IsAdminOrOwner` permission class was updated to include the `QAModerator` role.
**What the Frontend must handle:**
- QA Moderators are no longer restricted to just "Approving" content. They now have the authority to completely delete inappropriate or spam questions/answers from the system.
- **UI Implication:** In the Moderation Dashboard (`/api/qa/questions/moderation-queue/`), the frontend should now render a "Reject/Delete" button alongside the "Approve" button. This button should trigger a `DELETE /api/qa/questions/{id}/` (or answers) request.

<br/>

# Backend Updates: Course Coordinator Migration (Breaking Change)
**Target Audience:** Frontend Engineers
**Date:** May 2026

This section documents a **breaking API change** to the Course Management system. The `Teacher` role and field have been completely replaced by `CourseCoordinator`.

---

## 1. Why This Changed
The "Teacher" in the previous API was actually a guest lecturer who may not have a Finot account. The person who actually operates the system (creates sessions, takes attendance, uploads materials) is a **nominated student** — now correctly called a **Course Coordinator**.

## 2. Breaking API Changes

### SemesterCourse Response Shape
The `GET /api/course/semester-courses/` response has changed:
```diff
- "teachers": ["uuid-1", "uuid-2"],
- "teachers_details": [{...}, {...}],
+ "coordinators": ["uuid-1", "uuid-2"],
+ "coordinators_details": [{...}, {...}],
```
**Action Required:** Update all frontend references from `teachers` / `teachers_details` to `coordinators` / `coordinators_details`.

### CourseSession Response Shape
The `GET /api/course/sessions/` response now includes a new field:
```json
{
  "id": "uuid",
  "semester_course": "uuid",
  "date": "2026-05-04",
  "topic": "Church History Chapter 3",
  "teacher_name": "Abba Gebremedhin",
  "created_at": "..."
}
```
**Action Required:** When creating/editing a session, the frontend should provide an optional `teacher_name` text field for the guest lecturer's name.

### Role Name Change
```diff
- "Teacher"
+ "CourseCoordinator"
```
**Action Required:** Update all frontend role checks from `"Teacher"` to `"CourseCoordinator"`. This affects sidebar visibility, dashboard routing, and any role-based UI gating.

