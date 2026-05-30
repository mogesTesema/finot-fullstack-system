# Service App API Documentation

This document outlines the API endpoints, data structures, and logic for the **Service (Ageglot) Management System**.

## 1. Service Groups (Ministries)
*   **Endpoint:** `/api/service/groups/`
*   **Methods:** `GET` (Read Only)
*   **Purpose:** Allows students to browse the list of available service groups (e.g., Choir, Finance, Charity) so they can decide what to join.
*   **Data Flow:** Server -> Client (List of ServiceGroup objects).
*   **Backend Response:**
    ```json
    [
        {
            "id": 1,
            "name": "Choir",
            "description": "Singing and praise ministry.",
            "admin_name": "Deacon Abebe"
        }
    ]
    ```

## 2. Service Selections (Student Choices)
*   **Endpoint:** `/api/service/selections/`
*   **Methods:**
    *   `POST` (Submit Choices)
    *   `GET` (View Submitted Choices)
*   **Purpose:** This is the core "Selection" logic. Students submit exactly **3** ranked choices (Priority 1, 2, 3).
*   **Deep Reasoning / Logic:**
    *   **One-Time Rule:** This selection is a one-time application. The endpoint enforces that a student cannot submit multiple times.
    *   **No Status Endpoint:** We deliberately do not provide a "Check Application Status" endpoint here. Acceptance into a ministry is handled via Email notifications or the Admin Dashboard. The system creates a static record of preferences, and the Admin manually creates the Membership later.
*   **Frontend Request (POST Payload):**
    ```json
    {
        "selections": [
            { "service_group": 1, "priority": 1, "reason": "My passion" },
            { "service_group": 3, "priority": 2, "reason": "Want to learn" },
            { "service_group": 5, "priority": 3, "reason": "Available time" }
        ]
    }
    ```
*   **Backend Response (201 Created):** Returns the created object list.

## 3. Families (Mentorship Groups)

### A. My Family
*   **Endpoint:** `/api/service/families/my-family/`
*   **Methods:** `GET` (Student Only)
*   **Purpose:** Returns the *specific* family the logged-in student belongs to, including contact info (name/phone) for the family parents and a list of siblings.
*   **Response:**
    ```json
    {
        "id": 10,
        "name": "St. George Family",
        "father": {
            "name": "Moges",
            "phone": "0911223344"
        },
        "mother": {
            "name": "Sara",
            "phone": "0922334455"
        },
        "religious_father": "Abba Tesfa",
        "member_count": 45,
        "siblings": [
            { "id": 101, "name": "Chala", "email": "chala@example.com" }
        ]
    }
    ```

### B. Family Members
*   **Endpoint:** `/api/service/families/{id}/members/`
*   **Methods:** `GET`
*   **Purpose:** Lists all students inside a specific family.
*   **Response:**
    ```json
    [
        { "id": 101, "name": "Student A", "email": "a@test.com" },
        ...
    ]
    ```

## 4. Events
*   **Endpoint:** `/api/service/events/`
*   **Methods:** `GET` (Ordered by start date)
*   **Purpose:** A notice board for system-wide service events. Events are created by Admins via the Django Admin panel.
*   **Response:**
    ```json
    [
        {
            "id": 5,
            "title": "Annual Conference",
            "description": "Gathering for all students.",
            "start_date": "2026-05-20T08:00:00Z",
            "end_date": "2026-05-22T17:00:00Z",
            "photo": "http://.../media/events/conf.jpg",
            "status": "UPCOMING",
            "created_by_name": "Admin User"
        }
    ]
    ```

## 5. Attendance

### A. List My History
*   **Endpoint:** `/api/service/attendance/my-history/`
*   **Methods:** `GET` (Read Only)
*   **Purpose:** Allows a student to see their personal attendance record.
*   **Response:**
    ```json
    [
        {
            "id": 50,
            "event": 5,
            "event_title": "Annual Conference",
            "event_date": "2026-05-20T08:00:00Z",
            "status": "PRESENT",
            "remark": "Arrived on time"
        }
    ]
    ```

### B. Mark Attendance (Admin Only)
*   **Endpoint:** `/api/service/attendance/mark/`
*   **Methods:** `POST`
*   **Purpose:** Bulk mark attendance for an event.
*   **Request Body:**
    ```json
    {
      "event_id": 101,
      "attendances": [
          { "student_id": 5, "status": "PRESENT" },
          { "student_id": 8, "status": "LATE" }
      ]
    }
    ```
