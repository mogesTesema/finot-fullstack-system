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
