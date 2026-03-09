# Finot Frontend Documentation

**Version:** 2.0  
**Last Updated:** March 2026  
**Tech Stack:** React 19, Vite, TailwindCSS, React Query, React Hook Form, Headless UI

---

## 1. Project Overview & Philosophy

**Finot** is a specialized "Spiritual Lifecycle Management System" for university students. Unlike a generic CRUD app, it enforces a strict user journey:

1.  **Identity First:** A user is not a "Student" until they complete a detailed **Student Profile**. No features are accessible until this is done.
2.  **Service Oriented:** The core activity is "Service" (Ageglot). Students *apply* to join service groups (Ministries) via a ranked selection process.
3.  **Community Based:** Every student belongs to a "Family" (Mentorship group) with a Father, Mother, and Siblings.

### Key Architecture Decisions
*   **Feature-First Structure:** Code is organized by *User Goal* (e.g., `features/contributions`), not by technical type.
*   **Strict Gating:** Routes are protected not just by "Is Authenticated" but by "Is Profile Complete".
*   **Decoupled backend:** The Frontend structure does *not* mirror the Django app structure. It mirrors the **User Experience**.

---

## 2. Directory Structure (The Map)

```text
src/
├── assets/                 # Global static files
│   ├── images/             # Logos, Placeholders (Do not delete existing assets!)
│   └── styles/             # Global Tailwind directives
│
├── features/               # THE CORE LOGIC (Mini-Applications)
│   ├── auth/               # Login, Register, Forgot Password flows
│   ├── student-profile/    # The multi-step Profile Wizard
│   ├── service/            # "Ageglot" Selection (Drag-n-Drop) & Family Views
│   ├── events/             # "What's Happening" Feed
│   └── contributions/      # Donation Flow (Chapa) & Q&A Board
│
├── components/             # SHARED UI BLOCKS (Dumb Components)
│   ├── ui/                 # Buttons, Inputs, Spinners, Badges
│   ├── forms/              # Reusable Form Logic (React Hook Form wrappers)
│   ├── navigation/         # Navbar, Sidebar, Footer
│   ├── feedback/           # Toasts, Modal Wrappers, Empty States
│   └── cards/              # Standardized Card Containers
│
├── layouts/                # PAGE WRAPPERS
│   ├── MainLayout.jsx      # The standard wrapper (Navbar + Outlet + Footer)
│   └── DashboardLayout.jsx # Authenticated wrapper (Sidebar + Outlet)
│
├── lib/                    # INFRASTRUCTURE
│   ├── api.js              # Central Axios Instance (Interceptors for 401s)
│   ├── constants.js        # Global config (API_URL key)
│   └── utils.js            # Date formatters, Currency helpers
│
├── pages/                  # ROUTE DESTINATIONS
│   ├── auth/               # Login/Register Pages
│   ├── dashboard/          # The "Home" for students
│   ├── service/            # Ministry Browser, Selection, My Family
│   ├── donation/           # Payment Forms & Success Pages
│   ├── qa/                 # Public & Private Q&A Views
│   └── profile/            # View & Edit Profile
│
└── routes/                 # ROUTING CONFIG
    └── AppRoutes.jsx       # The central Route definition file
```

---

## 3. User Flows & Critical Logic

### A. The "New Student" Entry (The Golden Path)
1.  **Signup:** User creates account (`/auth/register`).
2.  **Login:** Token received & stored.
3.  **Profile Check:** The global `AuthContext` checks `/api/student/profiles/me/`.
    *   *If 404:* Redirect to `/profile/create` (Blocked from Dashboard).
    *   *If 200:* Redirect to `/dashboard`.
4.  **Service Selection:**
    *   Dashboard checks `ServiceConfiguration.is_selection_open`.
    *   If `True` & User has no rank: Show "Apply Now" CTA.
    *   User drags 3 groups into Priority 1, 2, 3 slots.
    *   Submits to `/api/service/selections/` (Bulk POST).

### B. The Donation flow
1.  **Input:** User selects Amount + Fund Category.
2.  **Initiate:** POST to `/api/donations/initiate/`.
3.  **Redirect:** Backend returns `checkout_url`. Frontend usage: `window.location.href = checkout_url`.
4.  **Return:** User returns to `/donation/success?tx_ref=...`. 
    *   *Action:* Frontend validates `tx_ref` status and shows "Thank You".

### C. The Family View
*   Endpoint: `/api/service/families/my-family/`.
*   **Null Safety:** New students have NO family. The UI must handle `404` or `null` gracefully by showing "You have not been assigned a family yet."
*   **Privacy:** Only show Phone Numbers if the backend sends them (it handles the logic).

### D. The Anonymous Q&A Flow
*   **Public Access:** Available at `/anonymous`, no auth required.
*   **Unified UI Component:** The `QuestionList.tsx` is strictly typed and handles rendering questions and nested answers. Users can submit answers safely.
*   **Data Requirement:** Requires backend Question serializer to actively embed its approved nested answers so the frontend correctly renders a thread view.
*   **Reading Experience:** Auto-truncation of long replies (>230 chars) and pops them into a dedicated reading modal for accessibility and focus.
*   **Dashboard Integration:** This same dynamic list mounts safely inside the authenticated Student Dashboard view (`/dashboard/qa`).

---

## 4. API Integration Rules

1.  **No Hardcoded URLs:** Always import `api` from `src/lib/api.js`.
2.  **Image Handling:** Backend images return relative paths (`/media/...`). Always prepend the `API_BASE_URL` before displaying.
3.  **Error Handling:** Use `try/catch` in data fetching. If `error.response.status === 401`, the `api.js` interceptor handles logout automatically.

---

## 5. Development Guidelines for You (The New Developer)

*   **Styling:** Use **Tailwind CSS**. Do not write new `.css` files unless absolutely necessary for animation.
    *   *Good:* `className="bg-primary text-white p-4 rounded-lg"`
    *   *Bad:* `className="my-custom-button"`
*   **State:**
    *   **Server Data:** Use `React Query` hooks (e.g., `useProfile`, `useServiceGroups`).
    *   **Form State:** Use `React Hook Form`. **Do not** use `useState` for complex forms (like the Profile Wizard).
*   **TypeScript Strictness:** Always define API response types in `types/index.ts`. No `any` casting. Verify context values and state match their `.d.ts` counterparts.
*   **Icons:** Use `@heroicons/react` (Outline version for UI, Solid for active states).

---

## 6. What's Next? (Copilot Memory)

*   **Priority 1:** Implement the **Drag-and-Drop** logic for Service Selection (`features/service`).
*   **Priority 2:** Build the **Multi-Step Profile Form** (`features/student-profile`). (Currently, edits are handled via `EditProfile.tsx` page).
*   **Priority 3:** Create the **Dashboard Widgets** (Family, Attendance).
*   **Priority 4:** Replace raw API interactions (`api.real.ts`) with properly cached `react-query` data hooks for Q&A and user sessions.
*,filePath: