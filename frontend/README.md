# Finot — Gibi Gubae Spiritual Lifecycle Management System

## UI/UX Product & Design Documentation

This document combines the **System Design Brief** and the **UX Product Requirement Document (UX-PRD)** for the **Finot** platform.

It serves as the **single source of truth** for designers, frontend developers, and product contributors working on the user experience and interface of the system.

The document explains:

- Product vision
- UX philosophy
- User journeys
- Required UI screens
- Interaction patterns
- Visual design rules
- Accessibility expectations
- Success metrics

---

# 1. Project Overview

**Finot** is a digital platform designed to support and manage the **spiritual life and community participation of university students** in the Gibi Gubae fellowship.

The system centralizes key fellowship activities into a unified web application:

- Student identity management
- Ministry (service group) participation
- Mentorship family relationships
- Fellowship events
- Financial donations
- Anonymous spiritual counseling

Unlike traditional administrative software, Finot focuses on the **spiritual lifecycle of students** within the fellowship community.

The product experience should feel:

- welcoming  
- supportive  
- calm  
- community-focused  

The platform must **strengthen relationships and spiritual growth**, not simply manage data.

---

# 2. Technology Context

The system is designed as a **modern web application** built using:

Frontend Stack
- React
- Tailwind CSS
- Shadcn UI
- TypeScript

Design Philosophy
- Mobile-first interface
- Component-based architecture
- Modern SaaS-style UI patterns
- Accessible and responsive layouts

---

# 3. Product Vision

Finot aims to build a **unified digital platform** that supports:

- spiritual growth
- community relationships
- organized service participation
- transparent donations
- safe counseling interactions

The system should make students feel:

- connected to their fellowship community  
- supported by mentors and peers  
- actively involved in spiritual activities  

The interface should reflect the **real-life spiritual journey of students on campus**.

---

# 4. Core Product Philosophy

The platform manages a student's **spiritual lifecycle** on campus.

The product experience should communicate three fundamental ideas.

## Identity

Every student must first establish their **identity and profile** before accessing the rest of the platform.

Identity verification ensures accurate participation in:

- service groups
- mentorship families
- events
- donations

---

## Community

Students are part of a **structured spiritual community** consisting of:

- ministries (service groups)
- mentorship families
- fellowship gatherings

The UI should emphasize relationships and connection.

---

## Contribution

Students contribute to the fellowship through:

- service participation
- event attendance
- donations
- community discussion

The interface should visually communicate **growth and involvement**.

---

# 5. Target Users

## Primary User: Students

Students use the platform to:

- register and create profiles
- join ministries
- attend events
- interact with mentorship families
- donate to fellowship causes
- ask anonymous spiritual questions

Students represent the **main user group** of the system.

---

## Secondary User: Administrators

Administrators manage the operational aspects of the platform.

Responsibilities include:

- reviewing ministry applications
- assigning mentorship families
- moderating anonymous questions
- managing events
- recording attendance
- tracking donations

---

# 6. Core UX Principles

The user experience must follow these guiding principles.

### Community First

Interfaces should reinforce a sense of belonging and connection between students.

### Guided Journey

New users should be guided step-by-step through onboarding.

### Simplicity

Avoid unnecessary complexity.

### Clarity

Users should always understand the next action they need to take.

### Trust and Safety

Anonymous features must feel private and secure.

### Transparency

Participation records and financial transactions must be clearly presented.

---

# 7. Key User Journeys

## 7.1 Account Creation and Login

A new user begins by creating an account.

Steps:

1. User registers with basic identity information.
2. User logs in to the system.
3. The system verifies whether a student profile exists.

If no profile exists, the user must complete onboarding before continuing.

---

## 7.2 Profile Completion (Mandatory)

Students must complete a **full personal profile** before accessing other features.

Profile information may include:

- department
- batch year
- dormitory
- contact information

Until this profile is completed:

- the dashboard remains inaccessible
- other platform features are locked

The onboarding experience must be implemented as a **guided multi-step profile wizard**.

---

## 7.3 Student Dashboard

Once onboarding is complete, students enter the **dashboard**, which acts as the main hub of the platform.

The dashboard should display a clear overview of the student's participation in the fellowship.

Information displayed includes:

- profile summary
- ministry participation status
- mentorship family members
- upcoming fellowship events
- attendance or participation activity
- donation access
- anonymous Q&A access

The dashboard should use a **modern modular card layout**.

---

# 8. Service Group Participation

Students participate in ministries such as:

- choir
- charity
- media
- outreach

Students apply by ranking their **top three ministry preferences**.

### Constraints

- Exactly three groups must be selected
- Each group must have a unique priority (1, 2, 3)
- Submission occurs only once

### Recommended UX

Use a **mobile-friendly tap-to-rank interface**.

Examples:

- tap to add to ranked list
- bucket-style ranking

Avoid desktop drag-and-drop interactions because they perform poorly on mobile.

Each ministry card should display:

- ministry name
- short description
- ministry activity focus

Administrators later review selections and assign final placements.

---

# 9. Mentorship Family System

Each student eventually belongs to a **mentorship family group**.

A family consists of:

- Spiritual Father
- Spiritual Mother
- Student siblings

The interface should present this structure clearly using community-style visuals.

Suggested elements:

- mentor profile cards
- avatar clusters for siblings
- optional contact information

### Edge Case

Students may not yet be assigned to a family.

In this case, the UI should display a friendly message explaining that assignment is pending.

---

# 10. Events and Attendance

The fellowship regularly organizes spiritual programs and community gatherings.

Students should browse events through a **scrollable feed of event cards**.

Each event card should display:

- event title
- date badge
- description
- optional thumbnail image
- event time

Avoid traditional calendar grids designed for desktop environments.

Students may also view their **attendance history** in their dashboard.

Administrators manage attendance records.

---

# 11. Donation System

The system supports financial contributions for fellowship activities.

Students and external supporters can donate through a secure payment flow.

### Donation Process

1. User enters donation amount
2. User selects donation category
3. User confirms donation
4. System redirects to secure payment page
5. Payment is processed
6. User returns to the platform
7. Transaction is verified

Students should also have access to **donation history**.

Currency used: **ETB (Ethiopian Birr)**.

Clear success and error messages must be displayed after payment.

---

# 12. Anonymous Question and Counseling System

Students may submit anonymous spiritual questions.

Questions may relate to:

- faith
- personal struggles
- spiritual guidance

Users submit questions using a **nickname instead of their real identity**.

Submitted questions undergo **administrative moderation** before being published.

Approved questions appear in a **community discussion feed** where responses may be posted.

The interface must prioritize:

- privacy
- emotional safety
- respectful interaction

Students should clearly understand that their submissions remain anonymous.

---

# 13. Required Application Screens

The UI/UX design should include the following screens.

## Authentication

- Login page  
- Registration page  

## Onboarding

- Profile creation wizard  
- Profile editing page  

## Student Dashboard

- main dashboard view  
- participation widgets  

## Service System

- ministry list  
- ministry selection ranking interface  

## Community

- mentorship family view  
- events feed  

## Donations

- donation form  
- payment redirect screen  
- donation success screen  
- donation history  

## Anonymous Counseling

- question submission page  
- public question feed  
- discussion thread view  
- user contribution history  

---

# 14. UX Edge Cases

The interface must gracefully handle:

- students without mentorship families
- incomplete ministry selections
- failed payment verification
- anonymous questions awaiting approval
- expired authentication sessions

These states should never cause confusing or broken interfaces.

---

# 15. Design System & Visual Guidelines

To create a warm, modern interface, the following design rules must be applied.

---

## Architecture

The platform must be **mobile-first**.

Mobile navigation should use **bottom tab navigation**.

Desktop navigation should convert to a **sidebar layout**.

---

## Layout

The dashboard should use a **Bento-box card layout**.

Characteristics:

- modular cards
- flexible grid
- clear hierarchy

Avoid large enterprise data tables for student-facing screens.

---

## Component Ecosystem

Base components should resemble modern design systems such as:

- Shadcn UI
- Radix UI

These component systems emphasize accessibility and clean structure.

---

## Shapes and Depth

To create a friendly atmosphere:

- Avoid sharp 90-degree corners
- Use border radius between **12px and 16px**

Depth should be created using:

- soft shadows (`shadow-sm`, `shadow-md`)
- subtle borders (`border-gray-200`)

Avoid heavy black drop shadows.

---

## Color Strategy (60-30-10 Rule)

The color palette should follow the **60-30-10 rule**.

60%  
Off-white background  
`#f8fafc`

30%  
Clean white cards

10%  
Brand accent colors

Primary brand colors:

Deep Blue  
`#1B2E66`

Amber / Yellow  
`#F7DF1E`

Accent colors should be used for:

- primary buttons
- highlights
- badges
- call-to-action elements

---

## Typography

Recommended fonts:

- Inter
- Plus Jakarta Sans
- SF Pro

Typography hierarchy should include:

- bold headers
- muted body text
- clear visual structure

---

# 16. Micro-UX Requirements

The system must include modern interaction patterns such as:

Skeleton loading states  
Toast notifications  
Friendly empty states  
Subtle animations for transitions  

Empty states should include simple illustrations when data is missing.

Examples:

- "No family assigned yet"
- "No events scheduled"

---

# 17. Specialized UI Elements

Certain features should use specific UI patterns.

Mentorship family view should use **Avatar Clusters**.

Attendance history should use **visual indicators such as rings or heatmaps** instead of raw data logs.

---

# 18. Accessibility Requirements

The platform must meet accessibility expectations.

Requirements include:

- strong text contrast
- clear navigation structure
- visible interactive elements
- descriptive error messages
- accessible form validation

The interface should remain readable and usable for all students.

---

# 19. Success Metrics

The product will be considered successful if:

Students complete onboarding without confusion.

Students successfully submit ministry preferences.

Students regularly interact with the dashboard.

Anonymous counseling is used safely and respectfully.

Donation transactions complete smoothly.

Users report a positive experience using the platform.

---

# Conclusion

Finot is designed to be more than a management tool.

It is a **community platform that supports spiritual growth and fellowship participation**.

The interface must always communicate:

- warmth  
- clarity  
- trust  
- belonging  

The final experience should help students feel **connected to their faith community and actively engaged in fellowship life**.
