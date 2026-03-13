# Student API Documentation

This document outlines the API endpoints for the Student module, which manages student profiles including academic, personal, and church-related information.

## Base URL
`/api/student/`

---

## 1. Get My Profile

**Endpoint:** `/profiles/me/`
**Method:** `GET`
**Access:** Authenticated Users Only
**Description:** Retrieves the profile of the currently logged-in student. If a profile does not exist, it tries to create one.

### Success Response (200 OK)
```json
{
  "id": "a1b2c3d4-...",
  "user": 5,
  "user_email": "student@example.com",
  "first_name": "Abebe",
  "middle_name": "Kebede",
  "last_name": "Balcha",
  "gender": "M",
  "profile_image": "http://res.cloudinary.com/.../image.jpg",
  "batch_year": 3,
  "department": "Software Engineering",
  "telegram_username": "@abebe",
  "personal_phone": "0911223344",
  "emergency_name": "Kebede Balcha",
  "emergency_phone": "0922334455",
  "emergency_relation": "Father",
  "home_address": "Addis Ababa, Bole",
  "previous_church": "Bole Medhanealem",
  "activity_serving": "Deacon",
  "dorm_block": 14,
  "dorm_room": 102,
  "confession_father": "Melake Selam Abba ...",
  "status": "IN_CAMPUS",
  "created_at": "2026-03-01T10:00:00Z",
  "updated_at": "2026-03-05T12:00:00Z"
}
```

### Error Response (401 Unauthorized)
```json
{
  "detail": "Authentication credentials were not provided."
}
```

---

## 2. Update My Profile

**Endpoint:** `/profiles/me/`
**Method:** `PUT` or `PATCH`
**Access:** Authenticated Users Only
**Description:** Updates the profile of the currently logged-in student. You can send partial updates (only the fields you want to change).

### Request Body (JSON)
*All fields are optional.*

```json
{
  "batch_year": 4,
  "department": "Computer Science",
  "telegram_username": "@new_username",
  "personal_phone": "0911000000",
  "emergency_name": "New Emergency Contact",
  "emergency_phone": "0922000000",
  "emergency_relation": "Mother",
  "home_address": "New Address",
  "previous_church": "New Church",
  "activity_serving": "Choir",
  "dorm_block": 15,
  "dorm_room": 200,
  "confession_father": "Abba ...",
  "profile_image": "(Binary file upload or null to remove)"
}
```

**Note:** Core identity fields like `first_name`, `last_name`, `email`, and `gender` cannot be updated here. They are managed via the Authentication endpoints.

### Success Response (200 OK)
Returns the updated profile object (same structure as GET).

---

## 3. Create Profile (Manual)

**Endpoint:** `/profiles/`
**Method:** `POST`
**Access:** Authenticated Users Only (Optional)
**Description:** Manually create a profile. Primarily used by admins or if the "Get My Profile" automation fails.

### Request Body
Same as Update Profile, plus:
*   `user`: integer (Admin only) - defaults to current user.

---

## 4. List Profiles (Admin/Staff Only)

**Endpoint:** `/profiles/`
**Method:** `GET`
**Access:** Staff/Admin Only
**Description:** Retrieves a list of all student profiles in the system.

*   **For Regular Students:** This endpoint returns only their own profile (essentially a list of 1).
*   **For Staff/Admins:** Returns all profiles.

### Success Response (200 OK)
```json
[
  {
    "id": "...",
    "first_name": "Student 1",
    "department": "SE",
    ...
  },
  {
    "id": "...",
    "first_name": "Student 2",
    "department": "CS",
    ...
  }
]
```

---

## 4. Delete Profile (Admin Only)

**Endpoint:** `/profiles/<uuid:id>/`
**Method:** `DELETE`
**Access:** Staff/Admin Only
**Description:** Permanently deletes a student profile.

### Success Response (204 No Content)
Empty response indicating successful deletion.

### Error Response (403 Forbidden)
```json
{
  "detail": "You cannot delete your profile."
}
```
*Occurs if a regular student tries to delete a profile.*
