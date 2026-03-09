# Question & Answer (Q&A) API Documentation

This module facilitates an anonymous question-and-answer system where students can ask questions and authorized personnel (e.g., counselors) can answer them. All content is moderated before being made public.

## Base URL
`/api/qa/`

## 1. Questions

### List Approved Questions
**Endpoint:** `/questions/`
**Method:** `GET`
**Access:** Public

Returns a list of all **Approved** questions.

**Query Parameters (Filtering & Sorting):**
*   `category`: Filter by category (e.g., `?category=Spiritual`)
*   `search`: Search text in question body or display name (e.g., `?search=prayer`)
*   `ordering`: Sort results (default is recent first). Options: `created_at`, `-created_at`, `category`, `user`.

**Example:** `/api/qa/questions/?category=Spiritual&ordering=-created_at`

### Create a Question
**Endpoint:** `/questions/`
**Method:** `POST`
**Access:** Public (Authenticated or Anonymous)

Submits a new question. The question will have `is_approved=False` by default and will not appear in the public list until approved by an Admin.

**Request Body:**
```json
{
  "display_name": "Curious Student",
  "category": "Spiritual",
  "question_body": "How do I start daily prayer?"
}
```

---

## 2. Answers

### List Approved Answers
**Endpoint:** `/answers/`
**Method:** `GET`
**Access:** Public

Returns a list of all **Approved** answers.

**Query Parameters:**
*   `question`: Get answers for a specific question ID (e.g., `?question=uuid-string`)
*   `responder`: Get answers by a specific counselor/user ID (e.g., `?responder=5`)
*   `category`: Get answers for questions of a specific category (e.g., `?category=Family`)
*   `ordering`: Sort by date, etc.

### Submit an Answer
**Endpoint:** `/answers/`
**Method:** `POST`
**Access:** Public (Usually restricted to Counselors in frontend logic)

Submits an answer to a question. Defaults to `is_approved=False`.

**Request Body:**
```json
{
  "question": "uuid-of-question",
  "display_name": "Father John",
  "answer_body": "Start with small steps..."
}
```

---

## 3. User Contributions

### My Contributions
**Endpoint:** `/questions/my-contributions/`
**Method:** `GET`
**Access:** Authenticated Users Only

Returns a combined list of **all** questions and answers submitted by the current user, regardless of approval status (Pending or Approved).

**Response Structure:**
```json
{
  "questions": [ ...list of my questions... ],
  "answers": [ ...list of my answers... ]
}
```

## Moderation (Admin Panel)

*   **Approval Workflow:** Admins must log in to the Django Admin panel to view "Pending" items and set `is_approved=True`.
*   **Bulk Actions:** Admins can select multiple items and approve them at once.
