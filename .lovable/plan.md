

# Doctor Auth Page Redesign

## Overview

Redesign the Doctor authentication page (`/doctors/login`) to match the design pattern used by Patient and Hospital auth pages - featuring a split-screen layout with branding on the left and the auth form on the right.

---

## Current vs. Target Design

### Current Doctor Auth Page
- Simple centered card layout
- Tab-based login/signup switching
- No branding section
- Minimal visual impact

### Target Design (Matching Patient/Hospital)
- Split-screen layout (50/50 on desktop)
- Left side: Doctor-branded gradient with stats and messaging
- Right side: Clean auth form with view switching
- Mobile-responsive (form only on small screens)
- Doctor-specific icons and messaging

---

## Design Specifications

### Left Panel (Desktop Only)
- Gradient background: Teal/green tones (medical theme)
- Icon: Stethoscope in white rounded container
- Portal name: "Doctor Portal"
- Headline: "Your Practice. Your Patients. Connected."
- Subtext: Professional messaging about managing patients and prescriptions
- Stats: Doctors registered, Patients connected, Prescriptions issued

### Right Panel (Form)
- Login view with email/password fields
- Signup view with confirm password
- Forgot password view
- Links to forgot password and switch views
- Bottom link: "Are you a patient? Patient Portal"
- Bottom link: "Are you a hospital? Hospital Portal"

---

## Implementation Details

### File to Modify
`src/pages/doctor/DoctorAuthPage.tsx`

### Changes
1. Replace card-based layout with split-screen design
2. Add left branding panel (hidden on mobile)
3. Match form styling to Patient/Hospital auth pages
4. Use Stethoscope icon for Doctor branding
5. Add Google sign-in option (matching Patient auth)
6. Redirect to `/verify-email` after signup instead of showing toast
7. Add proper Zod validation for email/password
8. Add links to Patient Portal and Hospital Portal

### Visual Theme
- Primary color: Green/Teal gradient for medical profession
- Icon: Stethoscope
- Stats to display:
  - "5K+" Doctors
  - "50K+" Patients Connected  
  - "100K+" Prescriptions

---

## Code Structure

```text
+--------------------------------------------------+
|                   DESKTOP VIEW                    |
+-------------------------+------------------------+
|     LEFT PANEL          |     RIGHT PANEL        |
|                         |                        |
|  [Stethoscope Icon]     |   [Mobile Logo]        |
|  Doctor Portal          |                        |
|                         |   +----------------+   |
|  Your Practice.         |   | Welcome back   |   |
|  Your Patients.         |   | Sign in to...  |   |
|  Connected.             |   |                |   |
|                         |   | [Email]        |   |
|  Manage patients,       |   | [Password]     |   |
|  issue prescriptions... |   | [Forgot?]      |   |
|                         |   | [Sign In]      |   |
|  5K+    50K+   100K+    |   | [Google]       |   |
|  Docs   Patients Rx     |   |                |   |
|                         |   | No account?    |   |
|                         |   +----------------+   |
|                         |                        |
|                         |   Patient/Hospital     |
|                         |   links                |
+-------------------------+------------------------+
```

---

## Features to Include

1. **Login View**
   - Email input with icon
   - Password input with icon
   - Forgot password link
   - Sign in button (gradient)
   - Google sign-in option
   - "Don't have account? Sign up" link

2. **Signup View**
   - Email input
   - Password input
   - Confirm password input
   - Create account button
   - "Already have account? Sign in" link

3. **Forgot Password View**
   - Back arrow to return to login
   - Email input
   - Send reset link button
   - Success message when sent

4. **Portal Links**
   - Link to Patient Portal (`/auth`)
   - Link to Hospital Portal (`/hospitals/login`)

---

## Technical Details

- Use `lovable.auth.signInWithOAuth` for Google sign-in (matching Patient auth)
- Use Zod validation for email and password
- Redirect to `/verify-email` after signup
- Check for existing doctor profile on login and redirect appropriately
- Use consistent icon styling (Mail, Lock icons for inputs)
- Match color scheme: use a teal/green gradient for the doctor theme

---

## Files Changed

| File | Action |
|------|--------|
| `src/pages/doctor/DoctorAuthPage.tsx` | Complete redesign |

---

## Summary

This redesign will make the Doctor Portal authentication page visually consistent with the Patient and Hospital portals, creating a cohesive brand experience across all three user types while maintaining the unique doctor-specific theming and messaging.

