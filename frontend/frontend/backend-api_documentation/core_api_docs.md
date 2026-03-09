# Core & Authentication API Documentation

This section details the customized authentication flows and user management endpoints, specifically tailored for the **Student/User Identity System**.

## 1. User Registration (Sign Up)
*   **Endpoint:** `/auth/users/`
*   **Method:** `POST`
*   **Purpose:** Registers a new user with strictly required identity fields.
*   **Required Fields:**
    *   `username` (Unique)
    *   `email` (Unique)
    *   `password`
    *   `first_name`
    *   `middle_name` (Custom)
    *   `last_name`
    *   `gender` (M/F)
*   **Validation:** 
    *   Fails if any required field is missing.
    *   Fails if `password` is too weak.
    *   We disabled `USER_CREATE_PASSWORD_RETYPE` to simplify the flow, so `re_password` is NOT required.
*   **Response (201 Created):**
    ```json
    {
        "id": 1,
        "username": "moges123",
        "email": "moges@example.com",
        "first_name": "Moges",
        "middle_name": "Tadesse",
        "last_name": "Kebede",
        "gender": "M"
    }
    ```

## 2. Get Current User (My Profile)
*   **Endpoint:** `/auth/users/me/`
*   **Method:** `GET`
*   **Purpose:** Retrieve the full identity information of the currently logged-in user.
*   **Security:** Requires valid JWT Token in header (`Authorization: JWT <access_token>`).
*   **Customization:** We redefined the serializer to ensure `middle_name` and `gender` are returned in the response (Djoser defaults hide them).
*   **Response:**
    ```json
    {
        "id": 1,
        "username": "moges123",
        "email": "moges@example.com",
        "first_name": "Moges",
        "middle_name": "Tadesse",
        "last_name": "Kebede",
        "gender": "M"
    }
    ```

## 3. Restricted Operations (Security)

### A. Update User Identity
*   **Endpoint:** `/auth/users/me/`
*   **Method:** `PUT` / `PATCH`
*   **Status:** **BLOCKED (403 Forbidden)**
*   **Reasoning:** User identity (Name, Gender) is fundamental and should not be casually changed by the user after registration.
*   **Implementation:** We applied `IsAuthenticatedAndReadOnly` permission to this endpoint.

### B. Delete Account
*   **Endpoint:** `/auth/users/me/`
*   **Method:** `DELETE`
*   **Status:** **BLOCKED (403 Forbidden)** (For Students)
*   **Reasoning:** Prevents accidental account deletion.
*   **Implementation:** We overrode the `user_delete` permission setting in Djoser to `IsAdminUser`. Only a super-admin can delete a user via the API.

## 4. Student Application Profile
*   **Endpoint:** `/api/student/profiles/me/`
*   **Overview:** While `/auth/users/` handles **Identity** (Who you are), this endpoint handles **Application Data** (Where you live, what year you are in, etc.).
*   **Read-Only Identity Fields:** 
    *   The profile endpoint displays `first_name`, `middle_name`, `last_name`, and `gender` for convenience.
    *   **Crucial:** These fields are marked `read_only=True`. Sending new values for them to this endpoint will be **ignored**. You cannot update your name via the profile endpoint.
