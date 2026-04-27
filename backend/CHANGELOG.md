# Changelog

All notable changes to the Finot backend will be documented in this file.

## [April 2026] - Architecture & Security Refactoring
### Event-Driven Notification System
* Decoupled notifications into a standalone Django app (`notifications`) using a **Domain Signals → Dispatcher → Channel Registry** architecture.
* Business logic (e.g., donations, events) now fires generic signals (`payment_completed`, `event_published`) with zero knowledge of how notifications are delivered.
* Implemented an extensible Channel Registry with `EmailChannel`, `PushChannel`, `InAppChannel`, and a stub for future `SMSChannel`.
* Resolved severe N+1 database queries and API rate-limiting flaws by utilizing Firebase `send_multicast` with chunked token batches.
* Moved dispatch operations into background threads (`transaction.on_commit` + threading) to ensure instantaneous API responses, with proper database connection pool cleanup.

### Security & Concurrency Audit
* Resolved race conditions in asynchronous Chapa webhooks and payment verifications using `select_for_update` row-level locks and `transaction.atomic()`.
* Secured webhook signature validations against timing attacks using `hmac.compare_digest`.

### Performance Enhancements
* Audited and eliminated N+1 database queries across `QuestionViewSet`, `AgeglotSelectionViewSet`, `ServiceAttendanceViewSet`, and `MyDonationHistoryViewSet` using `select_related()` and `Prefetch()`.

---

## [March 2026] - Feature Enhancements
### Dashboard & Navigation
* Fixed broken UI links across dashboards (Donate, Profile, Edit History, Home). 
* Adjusted super-status routing so only valid roles appear on the frontend, leaving superadmin purely for Django Admin.

### Service & Ageglot Management
* Fixed service admin visibility. Admins can now fully manage their groups (CRUD operations on Events).
* Added Cloudinary image upload to event creation. Event images now render elegantly in both the Admin Manager and Student Event Feeds.

### Attendance Tracking
* Fixed an issue with empty event dropdowns in the attendance manager and corrected API payloads (`student` -> `student_id`).

### Donations & Receipts
* Implemented a "Weekly Donation Reminder" popup that automatically checks if the user has donated this week.
* Enhanced the `/donation/success` page to render a full, printable receipt (Amount, Date, Tx Ref, Donor Name) with a native browser "Download / Print" button.

### Q&A System
* Added an "Ask Question" button directly into the student dashboard. 
* Added interactive toast notifications for all Q&A actions (Ask, Reply, Edit, Delete).

### Notifications
* Unread notification count now accurately displays in the navbar bell icon.
* Clicking notifications now marks them as read.
* Dropdown closes automatically when clicking outside.
* Handled Firebase notification permission denials gracefully.

### Email Templates
* Replaced broken localhost logo links with a permanently hosted Cloudinary Finot Logo URL in all HTML email templates.
