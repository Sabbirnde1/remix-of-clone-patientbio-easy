
# Hospital Management System (HMS) MVP Plan

## Executive Summary

This plan identifies what's already built, what's missing for a functional MVP, and provides a prioritized implementation roadmap to ship a working Hospital Management System.

---

## Current State Analysis

### What's Already Built

| Feature | Status | Notes |
|---------|--------|-------|
| Hospital Registration | Complete | Multi-step wizard, guest-friendly |
| Hospital Login | Complete | Dedicated auth page with redirect |
| Hospital Dashboard | Complete | Stats, profile banner, pending apps |
| Staff Directory | Complete | List staff, search, remove members |
| Doctor Applications | Complete | Apply, review, approve/reject flow |
| Hospital Settings | Complete | Update hospital info |
| Doctor Patients View | Complete | List patients who shared access |
| Patient Details Dialog | Complete | View health data, records |
| Prescription Form | Complete | Create prescriptions with medications |
| Prescriptions List | Complete | View issued prescriptions |

### What's Missing for MVP

| Gap | Priority | Impact |
|-----|----------|--------|
| Quick Patient Registration | Critical | Doctors can't add new patients manually |
| Patient Search | Critical | Can't find patients in the system |
| No way for admin to be a doctor | High | Hospital creator can't prescribe |
| No prescription printing/PDF | Medium | Doctors need printable prescriptions |
| Dashboard is empty for new hospitals | Medium | No actionable guidance |
| No patient count stats | Low | Dashboard stats incomplete |

---

## MVP Implementation Plan

### Phase 1: Core Patient Management (Critical)

#### 1.1 Quick Patient Registration Dialog

Allow doctors to quickly register new patients who walk into the hospital.

**New Component:** `QuickRegisterDialog.tsx`

- Modal form to register a patient on the spot
- Fields: Name, Phone, Date of Birth, Gender
- Creates a user profile entry (without auth account)
- Automatically grants doctor access to view/prescribe
- Opens patient details dialog after creation

**Database Changes:**
- Add `is_guest_patient` boolean to `user_profiles` table (default false)
- Allow creating patient profiles without auth.users reference for walk-in patients

**Hook Changes:**
- Add `useQuickRegisterPatient` mutation in `useDoctorPatients.ts`

#### 1.2 Patient Search

Allow doctors to search for existing patients by name or phone.

**Changes to `DoctorPatientsPage.tsx`:**
- Add global patient search (not just current doctor's patients)
- Search endpoint to find patients by name/phone
- "Request Access" button for patients not yet connected
- Shows existing patients with access status

**New Edge Function:** `search-patients`
- Takes name/phone as input
- Returns matching user_profiles (limited fields)
- Respects privacy - only basic info until access granted

---

### Phase 2: Role and Access Improvements (High)

#### 2.1 Allow Admin to Self-Assign Doctor Role

Currently hospital admins can't also be doctors. Add a toggle.

**Changes:**
- Add "Enable Doctor Portal" toggle in Settings page
- When enabled, adds `doctor` role to admin's user_roles
- Updates hospital_staff record to include doctor capabilities
- Shows "Doctor Portal" section in sidebar

#### 2.2 Improve Staff Management

Add ability to invite staff directly.

**Changes to `HospitalStaffPage.tsx`:**
- Add "Invite Staff" button
- Dialog to enter email and assign role
- Send invitation (or just add if user exists)

---

### Phase 3: Prescription Enhancements (Medium)

#### 3.1 Prescription View/Print

Add ability to view and print/download prescriptions.

**New Component:** `PrescriptionViewDialog.tsx`
- View full prescription details
- Print-friendly layout
- Download as PDF option (using browser print)

**Changes:**
- Add "View" button to prescription list items
- Open dialog with formatted prescription

#### 3.2 Patient Prescriptions in Patient Portal

Patients should see prescriptions from hospital doctors.

**Changes to `PrescriptionsPage.tsx` (patient dashboard):**
- Query prescriptions where patient_id = current user
- Show doctor name, hospital, medications
- Same display format as doctor view

---

### Phase 4: Dashboard Polish (Low-Medium)

#### 4.1 Improved Empty States

Guide new hospital admins on next steps.

**Changes to `HospitalDashboard.tsx`:**
- Add onboarding checklist for new hospitals
- Checklist items:
  - Complete hospital profile
  - Add your first staff member
  - Register your first patient
- Show quick action cards

#### 4.2 Better Stats

Add patient count and prescription stats.

**Changes:**
- Query doctor_patient_access count for patient stats
- Query prescriptions count for prescription stats
- Show today's prescriptions count

---

## Detailed Technical Specifications

### Database Migration: Guest Patients

```sql
-- Add column to identify guest/walk-in patients
ALTER TABLE user_profiles 
ADD COLUMN is_guest_patient boolean DEFAULT false;

-- Add column to link guest patients to creating hospital
ALTER TABLE user_profiles 
ADD COLUMN registered_by_hospital_id uuid REFERENCES hospitals(id);

-- Policy: Hospital staff can view patients they registered
CREATE POLICY "Hospital staff can view registered patients" 
ON user_profiles
FOR SELECT
USING (
  registered_by_hospital_id IS NOT NULL 
  AND is_hospital_staff(auth.uid(), registered_by_hospital_id)
);
```

### Quick Register Patient Hook

```typescript
// In useDoctorPatients.ts
export const useQuickRegisterPatient = () => {
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({
      hospitalId,
      display_name,
      phone,
      date_of_birth,
      gender
    }) => {
      // 1. Create user_profile as guest patient
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          user_id: crypto.randomUUID(), // Generate UUID for guest
          display_name,
          phone,
          date_of_birth,
          gender,
          is_guest_patient: true,
          registered_by_hospital_id: hospitalId
        })
        .select()
        .single();
      
      if (profileError) throw profileError;
      
      // 2. Grant doctor access
      const { error: accessError } = await supabase
        .from("doctor_patient_access")
        .insert({
          doctor_id: user.id,
          patient_id: profile.user_id,
          is_active: true
        });
      
      if (accessError) throw accessError;
      
      return profile;
    }
  });
};
```

### Search Patients Edge Function

```typescript
// supabase/functions/search-patients/index.ts
Deno.serve(async (req) => {
  const { query, hospital_id } = await req.json();
  
  // Search by name or phone
  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .select("user_id, display_name, phone, gender, date_of_birth")
    .or(`display_name.ilike.%${query}%,phone.ilike.%${query}%`)
    .eq("registered_by_hospital_id", hospital_id)
    .limit(20);
  
  return new Response(JSON.stringify({ patients: data }));
});
```

---

## Implementation Order

```text
Week 1: Core Patient Flow
+------------------------------------------+
| 1. Database migration for guest patients |
| 2. Quick Register Dialog                 |
| 3. Hook for patient registration         |
| 4. Integration with DoctorPatientsPage   |
+------------------------------------------+

Week 2: Search and Access
+------------------------------------------+
| 5. Patient search edge function          |
| 6. Patient search UI                     |
| 7. Request access flow                   |
+------------------------------------------+

Week 3: Roles and Printing
+------------------------------------------+
| 8. Admin doctor role toggle              |
| 9. Prescription view dialog              |
| 10. Print functionality                  |
+------------------------------------------+

Week 4: Polish
+------------------------------------------+
| 11. Dashboard onboarding checklist       |
| 12. Improved stats                       |
| 13. End-to-end testing                   |
+------------------------------------------+
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/hospital/QuickRegisterDialog.tsx` | Quick patient registration modal |
| `src/components/hospital/PatientSearchDialog.tsx` | Search existing patients |
| `src/components/hospital/PrescriptionViewDialog.tsx` | View/print prescription |
| `supabase/functions/search-patients/index.ts` | Patient search API |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/hospital/DoctorPatientsPage.tsx` | Add quick register + search buttons |
| `src/pages/hospital/HospitalDashboard.tsx` | Add onboarding checklist, patient stats |
| `src/pages/hospital/HospitalSettingsPage.tsx` | Add doctor role toggle for admin |
| `src/pages/hospital/DoctorPrescriptionsPage.tsx` | Add view/print action |
| `src/hooks/useDoctorPatients.ts` | Add quick register mutation |
| `src/components/hospital/HospitalSidebar.tsx` | Dynamic doctor portal visibility |

---

## Summary

The Hospital module has a solid foundation with most features already implemented:
- Registration and authentication
- Staff and application management
- Patient viewing and prescription creation

**Critical gaps for MVP:**
1. Doctors cannot add new walk-in patients
2. No patient search capability
3. Hospital admins can't also act as doctors

This plan prioritizes these critical gaps in Week 1-2, with enhancements in Week 3-4. The result will be a fully functional HMS where hospitals can register, manage staff, add patients, and issue prescriptions.
