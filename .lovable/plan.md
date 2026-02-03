
# Plan: Show Doctor Info on Patient's Prescription View

## Overview
Patients currently have no way to view digital prescriptions issued by doctors through the Doctor Portal. This plan creates a dedicated section in the patient dashboard to display these prescriptions with the prescribing doctor's name and details.

---

## Current State Analysis

1. **Missing Feature**: The patient dashboard's "Prescriptions" page only shows uploaded health records (file uploads), not digital prescriptions issued by doctors
2. **Existing Hook**: `usePatientPrescriptions` exists but isn't used anywhere and doesn't fetch doctor info
3. **Doctor Info Available**: The `doctor_profiles` table contains doctor details (full_name, specialty, qualification, phone)

---

## Implementation Plan

### 1. Enhance usePatientPrescriptions Hook
**File:** `src/hooks/usePrescriptions.ts`

Add doctor information fetching to the patient prescriptions query:
- Query prescriptions for the current patient
- Fetch doctor profile info using the doctor_id from each prescription
- Map doctor_name and specialty to each prescription

### 2. Create Patient Prescription View Dialog
**File:** `src/components/dashboard/PatientPrescriptionViewDialog.tsx` (new)

A read-only view for patients to see prescription details:
- Doctor info section (name, specialty, qualification, contact)
- Prescription date
- Diagnosis
- Medications table
- Instructions
- Follow-up date
- Status badge (active/completed)
- Print button

### 3. Add Prescriptions Section to Dashboard
**File:** `src/pages/dashboard/PrescriptionsPage.tsx`

Add a new "Digital Prescriptions" section above the health records:
- Show prescriptions issued by doctors via the portal
- Display doctor's name, specialty, date, and medication count
- Click to view full prescription details
- Filter by active/completed status
- Empty state if no digital prescriptions

---

## Technical Details

### Hook Enhancement
```typescript
// Update usePatientPrescriptions to fetch doctor info
export const usePatientPrescriptions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["patient-prescriptions", user?.id],
    queryFn: async (): Promise<Prescription[]> => {
      if (!user?.id) return [];

      const { data: prescriptions, error } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!prescriptions?.length) return [];

      // Fetch doctor profiles
      const doctorIds = [...new Set(prescriptions.map(p => p.doctor_id))];
      const { data: doctors } = await supabase
        .from("doctor_profiles")
        .select("user_id, full_name, specialty, qualification, phone")
        .in("user_id", doctorIds);

      const doctorMap = new Map(
        (doctors || []).map(d => [d.user_id, d])
      );

      return prescriptions.map(p => ({
        ...p,
        medications: parseMedications(p.medications),
        doctor_name: doctorMap.get(p.doctor_id)?.full_name,
        doctor_specialty: doctorMap.get(p.doctor_id)?.specialty,
        doctor_qualification: doctorMap.get(p.doctor_id)?.qualification,
      }));
    },
    enabled: !!user?.id,
  });
};
```

### Interface Update
```typescript
export interface Prescription {
  // ... existing fields
  doctor_name?: string;
  doctor_specialty?: string;
  doctor_qualification?: string;
}
```

### Patient View Dialog
- Similar to PrescriptionViewDialog but read-only (no edit/status toggle)
- Shows doctor header instead of pulling from useDoctorProfile
- Print functionality for patient's records

### UI Layout in PrescriptionsPage
```
+------------------------------------------+
| Digital Prescriptions                     |
| Prescriptions from your healthcare team   |
+------------------------------------------+
| [Active] [Completed]                      |
+------------------------------------------+
| +----------------+  +----------------+    |
| | Dr. Name       |  | Dr. Name       |    |
| | Specialty      |  | Specialty      |    |
| | 3 medications  |  | 2 medications  |    |
| | Jan 15, 2026   |  | Jan 10, 2026   |    |
| | [View Details] |  | [View Details] |    |
| +----------------+  +----------------+    |
+------------------------------------------+
| Health Records (existing section)         |
+------------------------------------------+
```

---

## Files to Create/Modify

| File | Action | Changes |
|------|--------|---------|
| `src/hooks/usePrescriptions.ts` | Modify | Add doctor info fetching to usePatientPrescriptions |
| `src/components/dashboard/PatientPrescriptionViewDialog.tsx` | Create | Read-only prescription view with doctor info |
| `src/pages/dashboard/PrescriptionsPage.tsx` | Modify | Add Digital Prescriptions section with doctor info display |

---

## Database Considerations

The `doctor_profiles` table already has an RLS policy that allows patients to view connected doctors' profiles:
```sql
Policy: "Patients can view connected doctors profiles"
Using Expression: EXISTS (
  SELECT 1 FROM doctor_patient_access dpa
  WHERE dpa.patient_id = auth.uid() 
  AND dpa.doctor_id = doctor_profiles.user_id 
  AND dpa.is_active = true
)
```

However, this only works for connected doctors. For prescriptions, we need doctors who have issued prescriptions (even if not formally connected). Since prescriptions inherently create a relationship, we may need to add an additional RLS policy or fetch doctor info via an edge function.

**Recommended approach**: Use the existing policy since doctors who issue prescriptions typically have an active doctor_patient_access record. If issues arise, we can create a simple edge function to fetch doctor details for prescriptions.

---

## Expected Outcome

After implementation:
- Patients can view all digital prescriptions issued to them by any doctor
- Each prescription shows the prescribing doctor's name, specialty, and qualifications
- Patients can view full prescription details including medications and instructions
- Patients can print prescriptions for their records
- Clear visual distinction between digital prescriptions and uploaded health records
