

# Doctor Portal MVP - Remaining Work

## Current State Summary

The Doctor Portal has made significant progress. Here's what's complete and what's still needed:

### Completed Features

| Feature | Status |
|---------|--------|
| Doctor Auth Page | Done - Split-screen design with login/signup/forgot password |
| Doctor Onboarding | Done - Professional profile setup |
| Doctor Dashboard | Done - Profile summary and quick actions |
| Doctor Profile Page | Done - Full CRUD for professional info |
| Doctor Patients Page | Done - List patients, search, add by Patient ID |
| Doctor Prescriptions Page | Done - View all issued prescriptions |
| Doctor QR Code Page | Done - Generate/download/share QR code |
| Patient-to-Doctor Connection | Done - Patients can connect via Doctor ID |
| Navigation Link | Done - "For Doctors" in main nav |

---

## Remaining MVP Features (Priority Order)

### Priority 1: Create Prescription UI for Doctors
**Impact: HIGH | Effort: MEDIUM**

Doctors can VIEW prescriptions but cannot CREATE new ones from the Doctor Portal. The database and hooks exist (`useCreatePrescription`) but no UI is wired up.

**Implementation:**
1. Create `CreatePrescriptionDialog` component
   - Patient selector (from connected patients list)
   - Diagnosis field
   - Dynamic medications list (add/remove medications)
   - Each medication: name, dosage, frequency, duration, instructions
   - General instructions and notes fields
   - Follow-up date picker
2. Add "Create Prescription" button on `DoctorPatientsPage` patient cards
3. Wire to existing `useCreatePrescription` hook

---

### Priority 2: View Patient Health Data
**Impact: HIGH | Effort: MEDIUM**

Doctors can see patient names in their list but cannot view their actual health records. The hook exists (`usePatientHealthData`) but no UI displays this data.

**Implementation:**
1. Create `DoctorPatientDetailsDialog` component
2. Display when clicking on a patient card:
   - Patient profile (name, age, gender, contact)
   - Health data (blood group, allergies, medications, emergency contact)
   - Health records list (title, category, date, file type)
3. Add "View Records" button on patient cards in `DoctorPatientsPage`
4. Use existing `get-patient-data-for-doctor` edge function

---

### Priority 3: Prescription View/Print Feature
**Impact: MEDIUM | Effort: LOW**

Doctors can see prescription summaries but cannot view formatted prescriptions or print them for patients.

**Implementation:**
1. Create `PrescriptionViewDialog` component with professional layout:
   - Doctor header (name, license, specialty, contact)
   - Patient information
   - Diagnosis section
   - Medications table with full details
   - Instructions and follow-up date
   - QR code linking to digital verification
2. Add print functionality using CSS print media queries
3. Add "View/Print" button on prescription cards in `DoctorPrescriptionsPage`

---

### Priority 4: Dashboard Statistics
**Impact: MEDIUM | Effort: LOW**

Dashboard shows profile info but lacks practice metrics.

**Implementation:**
1. Add summary cards to `DoctorDashboard`:
   - Total Patients count
   - Total Prescriptions count
   - Active Prescriptions this week
2. Add "Recent Patients" section showing last 5 accessed patients
3. Use existing hooks (`useDoctorPatients`, `useDoctorPrescriptions`)

---

## Implementation Plan

```text
Phase 1: Core Doctor Actions (High Priority)
+--------------------------------------------------+
| 1. CreatePrescriptionDialog component            |
|    - Medication form with add/remove             |
|    - Wire to useCreatePrescription hook          |
|    - Add button to patient cards                 |
|                                                  |
| 2. DoctorPatientDetailsDialog component          |
|    - Display health data and records             |
|    - Add "View Records" to patient cards         |
+--------------------------------------------------+

Phase 2: Professional Output (Medium Priority)
+--------------------------------------------------+
| 3. PrescriptionViewDialog component              |
|    - Professional formatted layout               |
|    - Print-friendly CSS                          |
|    - Add to prescriptions page                   |
+--------------------------------------------------+

Phase 3: Dashboard Enhancement (Polish)
+--------------------------------------------------+
| 4. Dashboard statistics cards                    |
|    - Patient and prescription counts             |
|    - Recent patient activity                     |
+--------------------------------------------------+
```

---

## Technical Details

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/doctor/CreatePrescriptionDialog.tsx` | Form for creating prescriptions |
| `src/components/doctor/DoctorPatientDetailsDialog.tsx` | View patient health data |
| `src/components/doctor/PrescriptionViewDialog.tsx` | Formatted prescription with print |

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/doctor/DoctorPatientsPage.tsx` | Add View Records and Create Prescription buttons |
| `src/pages/doctor/DoctorPrescriptionsPage.tsx` | Add View/Print button |
| `src/pages/doctor/DoctorDashboard.tsx` | Add statistics cards and recent activity |

### Existing Infrastructure to Leverage

- `useCreatePrescription` hook - already handles prescription creation
- `usePatientHealthData` hook - fetches patient data with access verification
- `get-patient-data-for-doctor` edge function - securely retrieves patient data
- `useDoctorPatients` hook - lists connected patients
- `useDoctorPrescriptions` hook - lists doctor's prescriptions

---

## Recommended First Step

Start with **Priority 1: Create Prescription UI** since it enables doctors to perform their core function - issuing prescriptions to patients. The database structure and hooks are already in place, so this is primarily UI work.

This will be followed immediately by **Priority 2: Patient Health Data View** so doctors can see patient information before writing prescriptions.

---

## MVP Completion Estimate

| Priority | Feature | Effort |
|----------|---------|--------|
| 1 | Create Prescription Dialog | 2-3 hours |
| 2 | Patient Details Dialog | 2 hours |
| 3 | Prescription View/Print | 1-2 hours |
| 4 | Dashboard Statistics | 1 hour |
| **Total** | | **6-8 hours** |

After completing these features, the Doctor Portal will have full end-to-end functionality: doctors can connect with patients, view their health data, and issue prescriptions.

