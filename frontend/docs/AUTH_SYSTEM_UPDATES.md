# Authentication System Updates

This document summarizes the recent features and architectural modifications made to the authentication flow (Login, Registration, and Password Reset) to ensure seamless integration between the React frontend and Django/Djoser backend. 

This guide is intended for future maintainers to understand the implemented features and alignment strategies used.

## 1. New Functionalities Added

### a) Complete Password Reset Flow
*   **Password Reset Confirmation Page (`ResetPasswordConfirmPage.tsx`):** Added a dedicated route (`/password-reset/confirm/:uid/:token`) and UI to handle the final step of the password reset process. 
*   **Djoser Integration:** Hooked the confirmation page with a new API method (`requestPasswordResetConfirm` in `api.real.ts`) that correctly dispatches `{uid, token, new_password, re_new_password}` to the Djoser backend.
*   **Password Visibility Toggles:** Implemented a UX enhancement allowing users to toggle the visibility (eye/eye-slash icons) of their new passwords to prevent typos during reset.

### b) Resend Password Reset Link
*   **Resend Functionality (`ForgotPasswordPage.tsx`):** Added a secondary "Didn't get it? Resend email" button, enabling users to re-trigger the password reset email directly from the same UI without needing to reload the page or re-enter data.

## 2. Key Modifications (Maintainer Notes)

### a) Email-Based Login (Custom Authentication Backend)
*   **Context:** `rest_framework_simplejwt` rigidly expects the payload key `username` for login, while the application intends for users to log in using their `email`.
*   **Modification:** Instead of hacking Djoser's or SimpleJWT's internal serializers, a custom Django Authentication Backend (`EmailAuthenticationBackend` in `backend/core/backends.py`) was introduced.
*   **How it works:** The frontend purposefully sends `{ username: email_value, password: password_value }`. The custom backend receives this and intelligently attempts to fetch the user by checking the database `email` column first, automatically falling back to `username`. This safely bridges SimpleJWT's expectations with the system's email-login requirement without causing downstream disruptions.

### b) Streamlined Registration Payload
*   **Context:** The registration endpoint threw errors because the frontend previously sent a `re_password` field that the backend did not expect.
*   **Modification:** The frontend registration payload (`api.real.ts`) was updated to strictly send `[first_name, middle_name, last_name, email, gender, password]`. 
*   **How it works:** Password confirmation validation (matching password with confirm password) is entirely handled on the client-side (`RegisterPage.tsx`), strictly adhering to the backend Djoser configuration where `USER_CREATE_PASSWORD_RETYPE` is set to `False`. This keeps the API payload lean and avoids arbitrary extra-field rejection by Django Rest Framework.