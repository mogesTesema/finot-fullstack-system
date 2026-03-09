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
