<div align="center">
  <h1>Finot Backend System</h1>
  <p>A spiritual management platform and administrative system for university students.</p>
</div>

---

## 📖 About the Project

**Finot** is a comprehensive backend system built with **Django** and **Django Rest Framework (DRF)**. It provides robust APIs for user authentication, student profile management, event scheduling, attendance tracking, secure payment processing (Chapa), and a fully decoupled notification system.

## ✨ Key Features

* **Role-Based Access Control (RBAC):** Admins manage the platform structure, while students securely participate and track their engagement.
* **Family Structure & Ministry:** Automated grouping of students into "Families" with dedicated event tracking and bulk attendance features.
* **Secure Payment Integration:** Webhook-driven donation processing utilizing the Chapa API with row-level database locks for concurrency safety.
* **Q&A System:** An anonymous question-and-answer platform enabling direct communication between students and administrators.
  * **Private Q&A:** Registered students can ask private questions direct to `QACounselor` roles, bypassing public moderation.
  * **Public Q&A:** Anyone can ask/answer public questions, subject to approval by `QAModerator` roles.
* **Multi-Channel Notifications:** An event-driven architecture delivering instantaneous push notifications (FCM), emails (SMTP), and in-app alerts.

---

## 🏗️ Architecture: Event-Driven Notifications

The notification system uses a fully decoupled **Domain Signals → Dispatcher → Channel Registry** pattern. This isolates core business logic from notification delivery failures and allows developers to easily plug in new delivery methods (like SMS) without modifying business app code.

```mermaid
graph TD
    %% Domain Layer
    subgraph Domain Apps
        D[Donation App]
        S[Service App]
    end

    %% Signal Layer
    subgraph Django Signals
        P_SIG((payment_completed))
        E_SIG((event_published))
    end

    %% Notifications App
    subgraph Notifications App
        H[Signal Handlers]
        ND{Notification Dispatcher}
        
        %% Channels
        subgraph Channel Registry
            IC[InApp Channel]
            EC[Email Channel]
            PC[Push Channel]
            SC[SMS Channel <br> <i>(Stub)</i>]
        end
    end

    %% External Systems
    subgraph External Infrastructure
        DB[(PostgreSQL)]
        SMTP[SMTP Server]
        FCM[Firebase Cloud Messaging]
    end

    %% Flow Definitions
    D -- Fires --> P_SIG
    S -- Fires --> E_SIG

    P_SIG -.-> H
    E_SIG -.-> H

    H -- "Defers execution <br> (on_commit + Background Thread)" --> ND

    ND -->|Dispatches| IC
    ND -->|Dispatches| EC
    ND -->|Dispatches| PC
    ND -->|Dispatches| SC

    IC --> DB
    EC --> SMTP
    PC --> FCM
```

### Advantages of this Architecture:
1. **Zero Downtime / Non-Blocking:** All network requests (SMTP, Firebase API) are dispatched in background threads running on `transaction.on_commit`. The frontend API response is instantaneous.
2. **Failure Isolation:** If the Email provider goes down, Push and In-App notifications will still successfully deliver.
3. **Optimized Multi-casting:** Firebase Push notifications are batched into chunks of 500, avoiding N+1 API and database query limits.

---

## 📚 API Documentation

The backend exposes fully auto-generated interactive API documentation using OpenAPI 3.0 (drf-spectacular).

**Interactive Endpoints:**
- **[Swagger UI](/api/docs/swagger/)** — Best for interactive testing.
- **[ReDoc](/api/docs/redoc/)** — Best for reading comprehensive schema details.
- **[Raw OpenAPI Schema](/api/schema/)** — JSON/YAML schema download.

**System Overview:**
👉 **[System Architecture & Frontend Guide](documentation/SYSTEM_ARCHITECTURE_AND_FLOW.md)**  
*(Understanding User Flows, UX implications, and State Management logic)*

**Module References:**
*   **[Core & Authentication](documentation/core_api_docs.md)** (Login, Signup, JWT)
*   **[Student Profiles](documentation/student_api_docs.md)** (User Data, Academic Info)
*   **[Service & Ministry](documentation/service_api_docs.md)** (Family, Events, Attendance)
*   **[Donations](documentation/donation_api_docs.md)** (Chapa Integration)
*   **[Q&A](documentation/qa_api_docs.md)** (Anonymous Questions)

---

## 🚀 Quick Start & Setup

### 1. Environment Setup
Clone the repository and prepare your virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Environment Variables
Ensure your `finot.env` file contains the required secrets:
- `SECRET_KEY`
- Database Credentials (`DATABASE_URL` or standard Django DB vars)
- `CHAPA_SECRET_KEY` & `CHAPA_WEBHOOK_SECRET`
- `FIREBASE_CREDENTIALS_B64` (Base64 encoded Firebase Admin JSON)
- Cloudinary Keys (for media hosting)

### 3. Database Migration
```bash
python manage.py migrate
```

### 4. Run the Server
```bash
python manage.py runserver
```

---

## 📜 Development History
To view the history of architectural updates, bug fixes, and feature additions, please review the **[CHANGELOG.md](CHANGELOG.md)**.

---
<div align="center">
  <i>Built with ❤️ for HIRUY Hackathon 2026</i>
</div>
