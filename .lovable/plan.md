

# Doctor Portal MVP - Next Steps

## Current State Summary

The Doctor Portal has been successfully implemented with the following **complete features**:

| Feature | Status | Details |
|---------|--------|---------|
| Doctor Auth Page | Complete | Split-screen design, login/signup/forgot password, Google SSO |
| Doctor Onboarding | Complete | Professional profile setup with BMDC license, specialty, etc. |
| Doctor Dashboard | Complete | Profile summary, quick actions, doctor info display |
| Doctor Profile Page | Complete | Full CRUD for professional information |
| Doctor Patients Page | Complete | List patients, search, add by Patient ID |
| Doctor Prescriptions Page | Complete | View all issued prescriptions with search |
| Doctor QR Code Page | Complete | Generate/download/share QR code for patient connections |
| Navigation Link | Complete | "For Doctors" added to main navigation |

---

## Missing Features for Complete MVP

### Priority 1: Patient-to-Doctor Connection via QR Code
**Status: NOT IMPLEMENTED | Impact: CRITICAL**

Currently, doctors can generate QR codes (`patientbio:doctor:ABCD1234`), but **patients have no way to scan or enter a Doctor ID to connect**. This breaks the core patient acquisition flow.

**Required Implementation:**
1. Create "Connect with Doctor" dialog in Patient Dashboard
2. Allow patients to enter an 8-character Doctor ID
3. Create an edge function `connect-to-doctor` that:
   - Validates the Doctor ID
   - Looks up the doctor in `doctor_profiles`
   - Creates a `doctor_patient_access` record (patient grants access)
4. Add this feature to Patient QR Code page or My Doctors page

---

### Priority 2: Create Prescription Feature
**Status: PARTIAL | Impact: HIGH**

The prescription viewing works, but **doctors cannot create new prescriptions** from the Doctor Portal. The hook exists (`useCreatePrescription`) but no UI is wired up.

**Required Implementation:**
1. Add "Create Prescription" button on DoctorPatientsPage (per patient)
2. Create `CreatePrescriptionDialog` component with:
   - Patient selection (auto-filled if from patient card)
   - Diagnosis field
   - Medications (dynamic add/remove)
   - Instructions and notes
   - Follow-up date picker
3. Wire up to `useCreatePrescription` hook

---

### Priority 3: View Patient Health Data
**Status: NOT IMPLEMENTED | Impact: HIGH**

Doctors can see patient names but cannot view their actual health records. The hook exists (`usePatientHealthData`) but no UI is implemented.

**Required Implementation:**
1. Create `PatientDetailsDialog` or dedicated page
2. Display:
   - Patient profile (name, age, gender, contact)
   - Health data (blood group, allergies, medications, emergency contact)
   - Health records list (with file type icons)
3. Add "View Records" button on patient cards

---

### Priority 4: View Prescription Documents
**Status: NOT IMPLEMENTED | Impact: MEDIUM**

Doctors can see prescription metadata but cannot view or print formatted prescriptions.

**Required Implementation:**
1. Add "View/Print" button on each prescription card
2. Create `PrescriptionViewDialog` with formatted layout:
   - Doctor header (name, license, specialty)
   - Patient info
   - Diagnosis, medications, instructions
   - Follow-up date
3. Add print functionality using CSS print styles

---

### Priority 5: Dashboard Statistics
**Status: NOT IMPLEMENTED | Impact: MEDIUM**

Dashboard shows profile info but lacks practice statistics like total patients, prescriptions issued, or recent activity.

**Required Implementation:**
1. Add summary cards to DoctorDashboard:
   - Total Patients count
   - Total Prescriptions count
   - Patients this month
   - Prescriptions this week
2. Add "Recent Patients" section with last 5 patient accesses

---

## Implementation Plan

```text
Phase 1: Core Patient Flow (High Priority)
+--------------------------------------------------+
| 1. Patient-to-Doctor connection via Doctor ID   |
|    - Create edge function connect-to-doctor     |
|    - Add UI dialog in Patient Dashboard         |
| 2. Create Prescription UI for doctors           |
|    - CreatePrescriptionDialog component         |
|    - Wire to existing useCreatePrescription     |
+--------------------------------------------------+

Phase 2: Data Viewing (Medium Priority)
+--------------------------------------------------+
| 3. Patient Details view for doctors             |
|    - PatientDetailsDialog with health data      |
|    - Health records list with basic info        |
| 4. Prescription View/Print feature              |
|    - PrescriptionViewDialog with formatting     |
|    - Print-friendly CSS                         |
+--------------------------------------------------+

Phase 3: Dashboard Enhancement (Polish)
+--------------------------------------------------+
| 5. Dashboard statistics cards                   |
|    - Patient and prescription counts            |
|    - Recent activity feed                       |
+--------------------------------------------------+
```

---

## Recommended First Step

Start with **Priority 1: Patient-to-Doctor Connection** since it completes the core doctor acquisition loop:

1. Doctor generates QR code with Doctor ID
2. Patient enters Doctor ID in their app
3. Patient grants doctor access to their records
4. Doctor sees patient in their patient list

Without this, doctors have no way to grow their patient base through the standalone portal.

---

## Technical Details

### Edge Function: connect-to-doctor

**Endpoint:** `/functions/v1/connect-to-doctor`

**Request:**
```json
{
  "doctor_code": "ABCD1234"
}
```

**Logic:**
1. Verify patient is authenticated
2. Look up `doctor_profiles` where `user_id` starts with doctor_code
3. Check if access already exists in `doctor_patient_access`
4. Create new access record with patient as grantor
5. Return success with doctor info

**Response:**
```json
{
  "success": true,
  "doctor": {
    "id": "uuid",
    "full_name": "Dr. Smith",
    "specialty": "Cardiology"
  }
}
```

### Patient UI: Add to My Doctors Page

Add a "Connect by Doctor ID" button that opens a dialog:
- Input for 8-character Doctor ID
- Lookup and preview doctor info
- Confirm to grant access
- Success: doctor appears in "Doctors with Portal Access" section

---

## Summary

The Doctor Portal is **80% complete**. The critical missing piece is the **Patient-to-Doctor connection flow** that allows patients to scan a doctor's QR code or enter their ID to grant access. Once this is implemented, the core value proposition works end-to-end.

