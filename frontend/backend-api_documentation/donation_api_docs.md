# Donation API Documentation

This document outlines the API endpoints for the Donation module, which integrates with the Chapa payment gateway to handle both student and guest donations.

## Base URL
`/api/donations/`

---

## 1. Initiate Donation

**Endpoint:** `/initiate/`
**Method:** `POST`
**Access:** Public (Authenticated or Anonymous)
**Description:** Initiates a payment transaction. Returns a Chapa checkout URL for the user to complete payment.

### Request Headers
| Header | Value |
| :--- | :--- |
| `Content-Type` | `application/json` |
| `Authorization`| `JWT <token>` (Optional - Required for Student history tracking) |

### Request Body Parameters

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `amount` | Decimal/String | Yes | Amount to donate (e.g., "500.00") |
| `fund_category` | String | Yes | One of: `Weekly Collection`, `Building Fund`, `Charity`, `Other` |
| `first_name` | String | Conditional | **Required if Guest** (Not logged in). |
| `last_name` | String | Conditional | **Required if Guest** (Not logged in). |
| `email` | String | Conditional | **Required if Guest** (Not logged in). |

### Example Request (Guest)
```json
{
  "amount": "1000.00",
  "fund_category": "Building Fund",
  "first_name": "Abebe",
  "last_name": "Balcha",
  "email": "abebe@example.com"
}
```

### Example Request (Authenticated Student)
```json
{
  "amount": "500",
  "fund_category": "Weekly Collection"
}
```

### Success Response (201 Created)
```json
{
  "checkout_url": "https://checkout.chapa.co/checkout/payment/...",
  "tx_ref": "tx-72b3a1d9-..."
}
```

### Error Response (400 Bad Request - Validation)
```json
[
  "First name, last name, and email are required for guest donations."
]
```
*Or generic field errors:*
```json
{
  "amount": ["A valid number is required."],
  "fund_category": ["\"INVALID\" is not a valid choice."]
}
```

### Error Response (503 Service Unavailable)
Occurs if the Chapa payment gateway is unreachable.
```json
{
  "error": "Failed to connect to Payment Gateway..."
}
```

---

## 2. Verify Donation

**Endpoint:** `/verify/<str:tx_ref>/`
**Method:** `GET`
**Access:** Public
**Description:** Verifies the status of a transaction with Chapa using the transaction reference (`tx_ref`). Updates the local database status to `COMPLETED` if successful.

### URL Parameters
*   `tx_ref`: The unique transaction reference returned during initiation (e.g., `tx-72b3a1d9-835b-4462-873b-285600643799`).

### Success Response (200 OK)
```json
{
  "status": "Payment Successful",
  "amount": 1000.00
}
```

### Response - Already Verified (200 OK)
```json
{
  "status": "Payment already verified",
  "amount": 1000.00
}
```

### Failure Response (400 Bad Request)
```json
{
  "status": "Payment Verification Failed",
  "detail": "Transaction not found or pending"
}
```

### Failure Response (404 Not Found)
```json
{
  "error": "Transaction not found"
}
```

---

## 3. Student Donation History

**Endpoint:** `/my-history/`
**Method:** `GET`
**Access:** Authenticated Users Only (Students)
**Description:** Retrieves a list of all donations made by the currently logged-in student. Guest donations are not retrievable via this endpoint.

### Response (200 OK)
```json
[
    {
        "id": 1,
        "fund_category": "BUILDING",
        "donated_at": "2026-03-04T10:30:00Z",
        "payment": {
            "amount": "1000.00",
            "currency": "ETB",
            "status": "COMPLETED",
            "created_at": "2026-03-04T10:29:55Z"
        }
    },
    {
        "id": 2,
        "fund_category": "WEEKLY",
        "donated_at": "2026-02-15T14:20:00Z",
        "payment": {
            "amount": "500.00",
            "currency": "ETB",
            "status": "PENDING",
            "created_at": "2026-02-15T14:19:55Z"
        }
    }
]
```

## Admin Features

The Django Admin panel includes:
*   **Payment Dashboard:** Filter payments by Status (Completed/Pending/Failed), Currency, and Date.
*   **Student Donations:** Search by student name/email and filter by Fund Category.
*   **Guest Donations:** Track donations from non-registered users.
