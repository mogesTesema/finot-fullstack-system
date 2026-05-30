# Code Review Report: Frontend Pagination & Rate Limit Sync

**Date:** April 22, 2026  
**Scope:** Review of frontend updates bridging backend global pagination and rate limiting (`api.real.ts`, `axios.ts`, `types/index.ts`, `QuestionList.tsx`).

## Executive Summary
The update successfully bridges the breaking backend changes (global pagination and rate limits) with the frontend using the `unwrapResults` adapter and a well-placed Axios interceptor. 

However, evaluating the code against industry standards for React, TypeScript, and UX reveals several areas that need improvement to ensure long-term maintainability, strict type safety, and a premium user experience.

---

## 1. React Lifecycle & Hooks (Potential Bugs)

* **`useEffect` Exhaustive Dependencies (`QuestionList.tsx`):**
  You are calling `fetchQuestions()` inside a `useEffect`, but `fetchQuestions` is defined outside the effect and is not wrapped in a `useCallback`. This violates the `react-hooks/exhaustive-deps` lint rule. If `fetchQuestions` ever references state variables directly in the future, it will cause stale closures.
  * **Fix:** Move the `fetchQuestions` function *inside* the `useEffect`, or wrap it in a `useCallback` hook with its own dependencies.

* **Double Fetching on Mount (`QuestionList.tsx`):**
  The debounce `useEffect` for `searchTerm` runs on the initial mount, setting `debouncedSearch` and triggering a re-render. This will likely cause the `fetchQuestions` effect to run twice when the component first mounts.

## 2. User Experience (UX) Bottlenecks

* **Full-Page Loading Spinners for Minor Actions (`QuestionList.tsx`):**
  When a user deletes a question, deletes an answer, or posts an answer, you call `fetchQuestions()`. Because `fetchQuestions` immediately calls `setLoading(true)`, the **entire list disappears** and is replaced by a spinner, then reappears a second later. 
  * **Fix:** This is a jarring UX. You should either implement Optimistic UI updates (updating the local state immediately) or do a "background refresh" without setting the main `loading` state to `true`. Introduce a separate `isMutating` state to disable buttons instead.

## 3. TypeScript & Type Safety Violations

* **Overuse of `any`:**
  There are several instances of `any` in `api.real.ts` (e.g., `userData: any`, `profileData: any`, `postQuestion: async (question: any)`). This defeats the purpose of using TypeScript. These payloads should be strictly typed using interfaces.

* **Unsafe Error Handling (`QuestionList.tsx`):**
  ```typescript
  } catch (error: any) {
    if (error?.response?.status === 404 && currentPage > 1) { ... }
  ```
  Using `any` on errors is generally discouraged in modern TypeScript. Furthermore, checking `error?.response` assumes the error is an Axios Error. If a native JavaScript error is thrown (e.g., a TypeError in parsing), this check could fail unpredictably. 
  * **Fix:** Use `if (axios.isAxiosError(error))` to safely narrow the error type before accessing `.response`.

## 4. Architectural Fragility

* **Hardcoded Pagination Sync (`QuestionList.tsx`):**
  You hardcoded `const BACKEND_PAGE_SIZE = 20;` to calculate `totalPages`. If a backend developer changes `PAGE_SIZE = 50` in Django's `settings.py`, the frontend will silently break and display the wrong number of pages.
  * **Fix:** A more robust approach is to rely on the `next` and `previous` URLs provided by the DRF paginated response, rather than manually calculating page numbers. If numeric pagination is strictly required, consider exposing the backend `PAGE_SIZE` via a configuration endpoint.

* **Silent Failures in API Wrapper (`api.real.ts`):**
  ```typescript
  function unwrapResults<T>(data: PaginatedResponse<T> | T[]): T[] {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && 'results' in data) return data.results;
    return []; // <--- Danger
  }
  ```
  If an API request succeeds but the backend returns an unexpected object (e.g., `{ detail: "No content" }`), this helper silently swallows the issue and returns an empty array `[]`. The UI will just show an empty list, hiding the bug from the developer. 
  * **Fix:** Throw a custom error if the response shape does not match an Array or a Paginated Response.

## 5. Good Things to Keep! (Positives)

* **429 Rate Limit Interceptor (`axios.ts`):** 
  Catching the `429` globally in the Axios interceptor and using `toast.error` with a specific `id` (to prevent toast spamming) is a highly professional, scalable solution.

* **Backward Compatibility (`api.real.ts`):** 
  Creating the `unwrapResults` helper rather than rewriting every single dashboard component (`DashboardDonations`, `DashboardEvents`, etc.) was a smart, pragmatic decision to fix the crash quickly.
