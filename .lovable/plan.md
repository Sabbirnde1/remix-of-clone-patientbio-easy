
# Doctor Portal MVP Plan

## Overview

Based on the PDF prototype analysis, you want a **standalone Doctor Dashboard** where doctors can:
- Register and manage their professional profile
- View and manage patients who share access with them
- Issue digital prescriptions
- Generate their own QR code for patients to connect
- Work independently OR as part of a hospital

This is a **separate pipeline** from the hospital system - doctors can exist as independent practitioners.

---

## Current State vs. Target State

### What Exists Now
- `doctor_profiles` table with basic info
- Hospital-based doctor workflow (doctors join hospitals)
- `useDoctorProfile` hook with CRUD operations
- Doctor patient access via `doctor_patient_access` table
- Prescription system via `prescriptions` table

### What's Missing
- Dedicated Doctor Auth page (`/doctors/login`)
- Standalone Doctor Dashboard (`/doctor`)
- Doctor Profile management page
- Doctor QR Code page
- Doctor-specific sidebar navigation
- Auto-assign "doctor" role on profile creation

---

## Implementation Plan

### Phase 1: Doctor Authentication Pipeline

#### 1.1 Doctor Auth Page
Create `/doctors/login` - a dedicated authentication page for doctors

**File:** `src/pages/doctor/DoctorAuthPage.tsx`

Features:
- Login/Signup/Forgot Password views
- Branded for "Doctor Portal"
- Post-login redirect logic:
  - If doctor profile exists: go to `/doctor`
  - If no profile: go to `/doctor/onboarding`

#### 1.2 Doctor Onboarding Page
Create `/doctor/onboarding` - profile setup for new doctors

**File:** `src/pages/doctor/DoctorOnboardingPage.tsx`

Fields from PDF:
- Doctor Name
- BMDC/License Number
- Specialty
- Consultation Fee
- Years of Experience
- Phone
- Birthday

On submit:
- Create doctor_profile record
- Add "doctor" role to user_roles table
- Redirect to `/doctor`

---

### Phase 2: Doctor Dashboard Layout

#### 2.1 Doctor Layout Component
**File:** `src/pages/doctor/DoctorLayout.tsx`

- Sidebar navigation
- Header with doctor name
- Protected route (requires doctor role)

#### 2.2 Doctor Sidebar
**File:** `src/components/doctor/DoctorSidebar.tsx`

Navigation items from PDF:
- Personal Info (Profile)
- My Patients
- Prescriptions
- Own QR Code
- Notifications (future)
- Settings

---

### Phase 3: Doctor Dashboard Pages

#### 3.1 Doctor Home/Profile Page
**File:** `src/pages/doctor/DoctorDashboard.tsx`

Display (based on PDF Page 6):
- Doctor Basic Information card
- Doctor ID (first 8 chars of UUID)
- Name, Email, Birthday
- BMDC Number, Specialty
- Consultation Fee, Experience
- Edit profile button

#### 3.2 Doctor Profile Edit Page
**File:** `src/pages/doctor/DoctorProfilePage.tsx`

Form to edit:
- Full Name
- License Number
- Specialty (dropdown)
- Qualification
- Experience Years
- Consultation Fee
- Phone
- Bio

#### 3.3 Doctor Patients Page
**File:** `src/pages/doctor/DoctorPatientsPage.tsx`

Features:
- List patients who shared access
- Search patients by name
- Add patient by Patient ID
- View patient details
- Create prescription

#### 3.4 Doctor Prescriptions Page
**File:** `src/pages/doctor/DoctorPrescriptionsPage.tsx`

Features:
- List all prescriptions issued
- Search by diagnosis/medication
- View/Print prescription
- Filter by date

#### 3.5 Doctor QR Code Page
**File:** `src/pages/doctor/DoctorQRCodePage.tsx`

Features (based on PDF Page 13):
- Generate QR code with Doctor ID
- Format: `patientbio:doctor:ABCD1234`
- Download as PNG
- Share functionality
- Patients can scan to connect

---

### Phase 4: Database Updates

#### 4.1 Auto-assign Doctor Role
When a doctor profile is created, automatically add "doctor" role to `user_roles` table.

This can be done via:
- Edge function triggered on profile creation
- Or in the `useCreateDoctorProfile` mutation

#### 4.2 Add Email to Doctor Profiles (Optional)
The `doctor_profiles` table already has most fields from the PDF. May need to add:
- `email` field (can derive from auth.users)
- `date_of_birth` field

---

### Phase 5: Route Configuration

Update `App.tsx` to add new routes:

```text
/doctors/login      -> DoctorAuthPage (public)
/doctor             -> DoctorLayout (protected)
  /doctor           -> DoctorDashboard (index)
  /doctor/profile   -> DoctorProfilePage
  /doctor/patients  -> DoctorPatientsPage
  /doctor/prescriptions -> DoctorPrescriptionsPage
  /doctor/qr-code   -> DoctorQRCodePage
/doctor/onboarding  -> DoctorOnboardingPage (protected, no sidebar)
```

---

## Technical Specifications

### Doctor Auth Page Redirect Logic

```typescript
useEffect(() => {
  if (user && !loading) {
    // Check if user has doctor profile
    const checkProfile = async () => {
      const { data: profile } = await supabase
        .from("doctor_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      
      if (profile) {
        navigate("/doctor");
      } else {
        navigate("/doctor/onboarding");
      }
    };
    checkProfile();
  }
}, [user, loading]);
```

### Doctor Sidebar Navigation Items

```typescript
const navItems = [
  { title: "Dashboard", url: "/doctor", icon: LayoutDashboard },
  { title: "Profile", url: "/doctor/profile", icon: User },
  { title: "My Patients", url: "/doctor/patients", icon: Users },
  { title: "Prescriptions", url: "/doctor/prescriptions", icon: Pill },
  { title: "My QR Code", url: "/doctor/qr-code", icon: QrCode },
];
```

### Doctor QR Code Format

```typescript
const doctorId = user?.id?.substring(0, 8).toUpperCase();
const qrValue = `patientbio:doctor:${doctorId}`;
```

### Doctor Layout Protection

```typescript
// DoctorLayout.tsx
const { data: isDoctor } = useIsDoctor();
const { data: doctorProfile } = useDoctorProfile();

if (!user) return <Navigate to="/doctors/login" />;
if (!doctorProfile) return <Navigate to="/doctor/onboarding" />;
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/doctor/DoctorAuthPage.tsx` | Doctor login/signup |
| `src/pages/doctor/DoctorOnboardingPage.tsx` | New doctor profile setup |
| `src/pages/doctor/DoctorLayout.tsx` | Dashboard layout with sidebar |
| `src/pages/doctor/DoctorDashboard.tsx` | Doctor home with profile summary |
| `src/pages/doctor/DoctorProfilePage.tsx` | Edit doctor profile |
| `src/pages/doctor/DoctorPatientsPage.tsx` | View/manage patients |
| `src/pages/doctor/DoctorPrescriptionsPage.tsx` | View issued prescriptions |
| `src/pages/doctor/DoctorQRCodePage.tsx` | Doctor QR code page |
| `src/components/doctor/DoctorSidebar.tsx` | Sidebar navigation |

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add doctor routes |
| `src/hooks/useDoctorProfile.ts` | Add auto-role assignment |
| `src/types/hospital.ts` | Add `date_of_birth` to DoctorProfile if needed |

---

## Implementation Order

```text
Step 1: Auth & Onboarding
+------------------------------------------+
| 1. DoctorAuthPage.tsx                    |
| 2. DoctorOnboardingPage.tsx              |
| 3. Update useDoctorProfile for role      |
+------------------------------------------+

Step 2: Layout & Navigation
+------------------------------------------+
| 4. DoctorSidebar.tsx                     |
| 5. DoctorLayout.tsx                      |
| 6. Add routes to App.tsx                 |
+------------------------------------------+

Step 3: Dashboard Pages
+------------------------------------------+
| 7. DoctorDashboard.tsx (profile view)    |
| 8. DoctorProfilePage.tsx (edit form)     |
| 9. DoctorPatientsPage.tsx               |
| 10. DoctorPrescriptionsPage.tsx         |
| 11. DoctorQRCodePage.tsx                |
+------------------------------------------+

Step 4: Integration
+------------------------------------------+
| 12. Test complete flow                   |
| 13. Link from main nav/homepage          |
+------------------------------------------+
```

---

## Patient Connection Flow

When a patient scans a doctor's QR code:

1. QR contains: `patientbio:doctor:ABCD1234`
2. Patient's app parses the Doctor ID
3. Edge function looks up doctor by ID prefix
4. Creates entry in `doctor_patient_access`:
   - `doctor_id`: Full doctor UUID
   - `patient_id`: Scanning patient's UUID
   - `is_active`: true
5. Doctor now sees patient in their list

This allows doctors to grow their patient base outside of hospitals.

---

## Summary

This plan creates a **complete standalone Doctor Portal** that:
- Allows doctors to register and build their profile
- Gives patients a way to connect via QR code
- Enables prescription management
- Works alongside (but independent of) the hospital system

The implementation reuses existing database tables and hooks while creating a dedicated UI pipeline for doctors.
