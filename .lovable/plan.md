

# Streamlined Hospital Registration Plan

## Overview

This plan enhances the hospital registration experience by making it more accessible and user-friendly. The goal is to reduce friction so hospitals can register quickly while maintaining the ability to add detailed information later.

## Current State

The system already has:
- **Quick Register Dialog**: 2-field form (Name + City) - recently added
- **Full Registration Page**: 10-field single-page form
- **Hospital Settings**: Full editing capability after registration

**Current Issue**: The Quick Register button only works for logged-in users. Logged-out users are redirected to `/auth` without context about what they were trying to do.

## Proposed Improvements

### 1. Improved Auth Flow with Intent Preservation

When a logged-out user clicks "Quick Register", preserve their intent so after login they return to the registration flow.

```text
User Flow:
+------------------+     +----------------+     +------------------+
| Click Quick Reg  | --> | Login/Signup   | --> | Quick Register   |
| (logged out)     |     | with redirect  |     | Dialog Opens     |
+------------------+     +----------------+     +------------------+
```

**Changes:**
- Pass `?redirect=/hospitals&action=quick-register` to auth page
- After successful login, detect the action parameter and auto-open the Quick Register dialog

### 2. Enhanced Quick Register Dialog

Improve the dialog with better UX:
- Add a hospital type selector (Hospital, Clinic, Diagnostic Center, Pharmacy)
- Add inline validation with helpful error messages
- Show a "Complete profile later" reminder
- Add loading states with skeleton animations

### 3. Post-Registration Onboarding Banner

After quick registration, show a completion banner on the Hospital Dashboard:

```text
+--------------------------------------------------+
|  Complete Your Hospital Profile                  |
|  Add contact info, address, and more to help     |
|  doctors and patients find you.                  |
|  [Complete Profile]                              |
+--------------------------------------------------+
```

**Changes:**
- Calculate profile completion percentage based on filled fields
- Show banner when completion is below 50%
- Link directly to Settings page

### 4. Registration Entry Points

Add multiple access points for registration:

| Location | Entry Point |
|----------|-------------|
| Homepage Hero | "Register Your Hospital" CTA |
| Navigation Menu | "For Hospitals" dropdown item |
| Hospitals Page | Quick Register + Full Registration buttons (existing) |

---

## Technical Implementation

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/hospital/HospitalsPage.tsx` | Add redirect params for auth, handle return action |
| `src/pages/AuthPage.tsx` | Handle redirect after login with action parameter |
| `src/components/hospital/QuickRegisterDialog.tsx` | Add hospital type, improve validation |
| `src/pages/hospital/HospitalDashboard.tsx` | Add profile completion banner |
| `src/components/Navigation.tsx` | Add "For Hospitals" menu item |

### New Components

| Component | Purpose |
|-----------|---------|
| `ProfileCompletionBanner.tsx` | Shows completion status and prompts to fill missing fields |

### Database Changes

None required. The existing `hospitals` table already supports all fields, and the Quick Register flow uses only the required fields (name, city).

---

## Implementation Steps

### Step 1: Auth Redirect with Intent

Update `HospitalsPage.tsx` to pass action parameter:
```typescript
<Link to="/auth?redirect=/hospitals&action=quick-register">
  Quick Register
</Link>
```

Update `AuthPage.tsx` to read and store the action in session storage, then redirect back.

### Step 2: Auto-Open Dialog on Return

In `HospitalsPage.tsx`, check for the action parameter and auto-open the Quick Register dialog:
```typescript
const [searchParams] = useSearchParams();
const [dialogOpen, setDialogOpen] = useState(
  searchParams.get('action') === 'quick-register'
);
```

### Step 3: Add Hospital Type

Update `QuickRegisterDialog.tsx` to include a type selector:
```typescript
const HOSPITAL_TYPES = [
  { value: 'hospital', label: 'Hospital' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'diagnostic', label: 'Diagnostic Center' },
  { value: 'pharmacy', label: 'Pharmacy' },
];
```

This requires adding a `type` column to the hospitals table.

### Step 4: Profile Completion Banner

Create a banner component that calculates completion:
```typescript
const completedFields = [
  hospital.name,
  hospital.city,
  hospital.phone,
  hospital.email,
  hospital.address,
].filter(Boolean).length;

const completionPercent = (completedFields / 5) * 100;
```

### Step 5: Navigation Update

Add a "For Hospitals" item to the main navigation that links to `/hospitals`.

---

## Summary

This plan improves hospital registration by:

1. Preserving user intent through the login flow
2. Adding hospital type selection for better categorization
3. Showing a profile completion prompt after quick registration
4. Adding more entry points throughout the app

The changes are minimal but significantly improve the user experience for hospital administrators registering their facilities.

