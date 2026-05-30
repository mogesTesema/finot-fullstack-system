# AI Memory: Functional State & Engineering Guardrails

**Project area:** Service + Dashboard + Profile integration  
**Date:** March 2026  
**Audience:** Any new AI/developer continuing work in this repo

---

## 1) What functionality is currently implemented

### Service navigation and entry points
- Users can access **Services Hub** from dashboard and sidebar.
- Users can access **Service Selection** directly from dashboard and services hub.
- Service routes are protected under authenticated roles (`student`, `service_admin`, `super_admin`).

### Service pages
- **Services Hub** with tabbed sections:
  - Service Groups
  - My Family
  - Attendance
- **Service Groups List**:
  - Loads groups from API
  - Shows selection CTA if user has not submitted
  - Opens detail page per group
- **Service Group Detail**:
  - Loads group by id
  - Shows detail content and selection action
- **Service Selection (Preference Form)**:
  - Requires 3 unique ranked choices
  - Supports submit and update flow
  - Handles selection-window closed and already-approved states
- **Family**:
  - Loads current user family
  - Handles no-family assigned state
  - Shows parents + members table
- **Attendance**:
  - Loads current user attendance history
  - Displays status and remarks

### Profile and dashboard reliability
- `StudentDashboard` type issues fixed (event/notification typing, image fallback event typing).
- `EditProfile` typing and normalization fixed for current auth/profile shape.
- Sidebar typing fixed (`props`, optional badge checks, icon type).

---

## 2) Where functionality lives (source map)

### Frontend pages/components
- `src/routes/AppRoutes.tsx`
  - All protected service routes and services hub route
- `src/components/navigation/Sidebar.tsx`
  - Sidebar typed navigation and services entry
- `src/pages/dashboard/StudentDashboard.tsx`
  - Direct shortcuts: Open Services + Service Selection
- `src/pages/service/ServicesPage.tsx`
  - Services hub and tab container
- `src/pages/service/ServiceGroupList.tsx`
- `src/pages/service/ServiceGroupDetail.tsx`
- `src/pages/service/PreferenceForm.tsx`
- `src/pages/service/FamilyPage.tsx`
- `src/pages/service/AttendancePage.tsx`

### Frontend API client
- `src/lib/api.ts` -> re-exports from `src/lib/api.real.ts`
- `src/lib/api.real.ts`
  - Service endpoints (`groups`, `selections`, `families`, `attendance`)
  - `deleteSelection(selectionId)` is implemented and required by update flow

### Shared frontend types
- `src/types/index.ts`
  - `ServiceGroup`, `ServiceSelection`
  - `Family`, `FamilyMember`, `FamilyContact`, nested profile subset
  - `AuthUser`, `AuthUserProfile`

### Backend (service app)
- `backend/service/views.py`
  - `ServiceGroupViewSet`
  - `AgeglotSelectionViewSet`
  - `FamilyViewSet`
  - `ServiceAttendanceViewSet`
- `backend/service/urls.py`
  - Router definitions for `groups`, `selections`, `families`, `attendance`, `events`

---

## 3) Backend contract assumptions currently used by frontend

### Selection endpoints
- `GET /api/service/selections/` returns current user selections.
- `POST /api/service/selections/` expects bulk payload:
  - `{ selections: [{ service_group, priority, skills?, reason? }, ...] }`
- `DELETE /api/service/selections/{id}/` is used for update flow (delete old, then submit new).

### Family endpoints
- `GET /api/service/families/my-family/`
- `GET /api/service/families/{id}/members/`
- Frontend assumes nested user profile data may appear under `profile`.

### Attendance endpoint
- `GET /api/service/attendance/`

### Group endpoints
- `GET /api/service/groups/`
- `GET /api/service/groups/{id}/`

---

## 4) Engineering actions already taken (technical)

- Added missing service route wiring and stabilized route tree.
- Added direct discoverability for service selection from UI entry points.
- Implemented missing API client method `deleteSelection` to unblock update flow.
- Synced several frontend pages to strict TypeScript where IntelliSense errors existed.
- Added/corrected service image assets under `frontend/public/images/...` to avoid broken image loops.
- Removed accidental root-level artifact files that were not part of application code.

---

## 5) Guardrails before changing code (must-read)

1. **Do not break route discoverability**
   - If you move service pages, keep at least one obvious dashboard-level entry to selection.

2. **Do not change payload shape casually**
   - `PreferenceForm` relies on current selection payload and id-based deletion.
   - If backend updates from delete+recreate to PATCH/PUT, update both API client and form flow together.

3. **Preserve nested profile handling**
   - Family screens currently rely on nested `profile` fields being optional.
   - Always keep optional chaining and null-safe rendering.

4. **Avoid blind type edits in auth/profile models**
   - `EditProfile` and dashboard parse `AuthUserProfile` with specific fields.
   - If changing `AuthUserProfile`, update affected pages in same PR.

5. **Keep service images stable**
   - If renaming image files, update mapping logic in group list/detail.
   - Always keep valid fallback image paths.

6. **Run checks before claiming done**
   - Run `npm run build` in `frontend/` after UI/API changes.
   - Check `get_errors` on modified TSX files for IntelliSense regressions.

---

## 6) High-risk areas likely to regress

- `PreferenceForm.tsx` submit/update branch logic
- `api.real.ts` service endpoint parity with backend
- `AppRoutes.tsx` accidental duplicate/removed routes
- Dashboard shortcuts to service selection
- Typing drift between `types/index.ts` and live backend payload

---

## 7) Recommended workflow for upcoming changes

1. Confirm endpoint contracts in backend files first.
2. Update `src/lib/api.real.ts` methods before page edits.
3. Update `src/types/index.ts` to exact backend shape.
4. Update UI pages with strict typing and null-safe rendering.
5. Verify navigation discoverability from dashboard and sidebar.
6. Run build and targeted error scan.

---

## 8) Quick sanity checklist (copy/paste)

- [ ] Services route opens: `/services`
- [ ] Service groups open: `/service-groups`
- [ ] Selection page opens: `/service-groups/select`
- [ ] Selection update works (delete + resubmit)
- [ ] Family page handles no-family case without crash
- [ ] Attendance page renders with empty-state fallback
- [ ] Dashboard contains visible Service Selection shortcut
- [ ] `npm run build` passes

---

## 9) Non-goals for future AI edits

- Do not rework visual theme/colors unless explicitly requested.
- Do not introduce architecture rewrites while fixing small bugs.
- Do not remove stable entry points to service features.

## 10) Recent Additions: Donation Email Notifications
- **Implementation Date**: March 2026
- **Feature Overview**:
  - Implemented synchronous email notifications for successful and failed donations.
  - Notifications intelligently accommodate both authenticated `StudentDonation` users and `NonStudentDonation` guest users.
  - Emails are fully styled using the application's colour scheme (deep blue `#1e3a8a` and warm amber `#fbbf24`), incorporating the actual logo loaded dynamically from the frontend.
- **Where functionality lives (source map):**
  - **`backend/core/emails.py`**:
    - Overhauled `send_html_email` to include a modern wrapper template (HTML shell) displaying top navigation, rounded containers, and footer disclaimers dynamically using `settings.FRONTEND_URL`.
    - Added `notify_donation_success(payment_obj)` and `notify_donation_failure(payment_obj)`.
    - Added `get_donation_details(payment_obj)` helper to cleanly extract `email`, `name`, and `category` from backwards related models.
  - **`backend/donation/views.py`**:
    - Tapped into `VerifyDonationView` to trigger `notify_donation_success` if `chapa.verify_payment(tx_ref)` returns true.
    - Updated `VerifyDonationView` and `InitiateDonationView` to trigger `notify_donation_failure` upon initial Chapa connection failure or final verification failure cleanly.
- **Guardrails for Email system:**
  - Do not alter `payment_obj.nonstudentdonation` or `payment_obj.student_donation` backward relationship access in `emails.py` unless the Django model relationships change.
  - Always ensure `FRONTEND_URL` is included in the environment or set dynamically, else the logo URL injection will fall back to `http://localhost:5173`.
