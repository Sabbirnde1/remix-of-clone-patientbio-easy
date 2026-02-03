
# Fix: Patient Lists Not Showing in Doctor and Patient Portals

## Problem Analysis

### Issue 1: Doctor Portal - "My Patients" Empty
**Root Cause:** The `user_profiles` table lacks an RLS policy that allows doctors to read profiles of patients who have granted them access.

**Current RLS on `user_profiles`:**
- Users can view their own profile
- Hospital staff can view registered patients

**Missing:** Doctors should be able to view profiles of patients they have active access to via `doctor_patient_access`.

### Issue 2: Patient Portal - "Doctors with Portal Access" Empty  
**Root Cause:** The `doctor_profiles` table requires `is_verified = true` for non-owners to view profiles, but the test doctor has `is_verified = false`.

**Current RLS on `doctor_profiles`:**
```sql
(is_verified = true) OR (user_id = auth.uid())
```

**Problem:** Patients connected to an unverified doctor cannot see that doctor's profile.

---

## Solution

### Database Migration

Add two new RLS policies:

1. **On `user_profiles`:** Allow doctors to view profiles of patients who have granted them active access
2. **On `doctor_profiles`:** Allow patients to view profiles of doctors who have active access to their records

```sql
-- Policy 1: Doctors can view their connected patients' profiles
CREATE POLICY "Doctors can view connected patients profiles"
  ON user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM doctor_patient_access dpa
      WHERE dpa.doctor_id = auth.uid()
        AND dpa.patient_id = user_profiles.user_id
        AND dpa.is_active = true
    )
  );

-- Policy 2: Patients can view their connected doctors' profiles
CREATE POLICY "Patients can view connected doctors profiles"
  ON doctor_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM doctor_patient_access dpa
      WHERE dpa.patient_id = auth.uid()
        AND dpa.doctor_id = doctor_profiles.user_id
        AND dpa.is_active = true
    )
  );
```

---

## Implementation Steps

| Step | Action | Details |
|------|--------|---------|
| 1 | Add RLS policy on `user_profiles` | Allow doctors to read their connected patients |
| 2 | Add RLS policy on `doctor_profiles` | Allow patients to read their connected doctors |
| 3 | No code changes needed | Existing hooks will work once RLS is fixed |

---

## Data Flow After Fix

```text
Doctor Portal - My Patients Flow:
+------------------+     +------------------------+     +----------------+
| Doctor auth.uid()|---->| doctor_patient_access  |---->| user_profiles  |
| SELECT patients  |     | WHERE doctor_id = uid  |     | WHERE user_id  |
|                  |     | AND is_active = true   |     | = patient_id   |
+------------------+     +------------------------+     +----------------+

Patient Portal - Doctors with Portal Access Flow:
+------------------+     +------------------------+     +-----------------+
| Patient auth.uid()|---->| doctor_patient_access  |---->| doctor_profiles |
| SELECT doctors   |     | WHERE patient_id = uid |     | WHERE user_id   |
|                  |     | AND is_active = true   |     | = doctor_id     |
+------------------+     +------------------------+     +-----------------+
```

---

## Expected Result

After migration:
- **Doctor Portal:** Dr. Sumanto Kumar Gain will see "Sabbir Hossain" in My Patients list
- **Patient Portal:** Sabbir Hossain will see "Dr. Sumanto Kumar Gain" in Doctors with Portal Access

No code changes required - the existing hooks (`useDoctorPatients`, `usePatientDoctorAccess`) will automatically work once the RLS policies allow the queries to return data.
