# Recent Development Log (March 2026)

## Features & Improvements
* **Dashboard & Navigation**: Fixed broken UI links across dashboards (Donate, Profile, Edit History, Home). Adjusted super-status routing so only valid roles appear on the frontend, leaving superadmin purely for Django Admin.
* **Service & Ageglot Management**: Fixed service admin visibility. Admins can now fully manage their groups (CRUD operations on Events).
* **Event System**: Added Cloudinary image upload to event creation. Event images now render elegantly in both the Admin Manager and Student Event Feeds.
* **Attendance Tracking**: Fixed an issue with empty event dropdowns in the attendance manager and corrected API payloads (`student` -> `student_id`).
* **Donations & Receipts**: 
  * Implemented a "Weekly Donation Reminder" popup that automatically checks if the user has donated this week.
  * Enhanced the `/donation/success` page to render a full, printable receipt (Amount, Date, Tx Ref, Donor Name) with a native browser "Download / Print" button.
* **Q&A System**: Added an "Ask Question" button directly into the student dashboard. Added interactive toast notifications for all Q&A actions (Ask, Reply, Edit, Delete).
* **Notifications**: 
  * Unread notification count now accurately displays in the navbar bell icon.
  * Clicking notifications now marks them as read.
  * Dropdown closes automatically when clicking outside.
  * Handled Firebase notification permission denials gracefully.
* **Email Templates**: Replaced broken localhost logo links with a permanently hosted Cloudinary Finot Logo URL in all HTML email templates.

# Finot Backend System

This repository contains the backend for **Finot**, a spiritual management system for university students. It is built on Django and Django Rest Framework.

## 📚 Documentation

The system documentation is organized for both backend and frontend developers.

**Start Here:**
👉 **[System Architecture & Frontend Guide](documentation/SYSTEM_ARCHITECTURE_AND_FLOW.md)**  
*(Read this first to understand the User Flows, UX implications, and State Management logic)*

### API Reference (by Module)

*   **[Core & Authentication](documentation/core_api_docs.md)** (Login, Signup, JWT)
*   **[Student Profiles](documentation/student_api_docs.md)** (User Data, Academic Info)
*   **[Service & Ministry](documentation/service_api_docs.md)** (Family, Events, Attendance)
*   **[Donations](documentation/donation_api_docs.md)** (Chapa Integration)
*   **[Q&A](documentation/qa_api_docs.md)** (Anonymous Questions)

## 🚀 Quick Start

1.  **Environment Setup:**
    ```bash
    python -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    ```

2.  **Database Migration:**
    ```bash
    python manage.py migrate
    ```

3.  **Run Server:**
    ```bash
    python manage.py runserver
    ```

## 🔑 Key Features
*   **Role-Based Access:** Admins manage data, Students participate.
*   **Family Structure:** Students are automatically grouped into "Families".
*   **Bulk Operations:** Efficient tools for marking attendance.
*   **Payment Integration:** Secure donation processing via Chapa.

---
*Built with ❤️ for HIRUY Hackathon 2026*
