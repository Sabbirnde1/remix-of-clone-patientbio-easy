

# Improved Patient Registration System

## The Better Approach

Instead of creating duplicate "guest" accounts, hospitals should leverage the existing Patient ID system that patients already have. Here's the optimal flow:

```text
+------------------------------------------+
|          RECOMMENDED APPROACH            |
+------------------------------------------+
| 1. Patient shows QR code or shares ID    |
| 2. Doctor scans QR / enters Patient ID   |
| 3. System finds existing patient record  |
| 4. Doctor gets instant access to patient |
| 5. Can view health data & prescribe      |
+------------------------------------------+
```

---

## How It Works

### Patient Side (Already Exists)
- Patients have a unique Patient ID (first 8 chars of their UUID)
- They can generate a QR code encoding `patientbio:ABCD1234`
- They can share their ID verbally or via the Share feature

### Hospital Side (To Build)

1. **Scan QR Code** - Doctor scans patient's QR code using device camera
2. **Manual ID Entry** - Doctor types the 8-character Patient ID
3. **Patient Lookup** - System finds the patient in the database
4. **Instant Access** - Doctor is immediately granted access to view/prescribe

---

## Key Benefits

| Benefit | Description |
|---------|-------------|
| No Duplicates | Uses existing patient accounts, no guest records |
| Privacy | Patient ID doesn't expose personal info |
| Faster | Scan QR = instant access, no form filling |
| Better Data | Access real health history, not empty profiles |
| Patient Control | Patients knowingly share their ID for access |

---

## Technical Implementation

### Phase 1: Patient Lookup by ID

**New Edge Function:** `lookup-patient-by-id`

Takes the 8-character Patient ID and:
1. Finds the user_profile where `user_id` starts with that ID
2. Returns basic info (name, gender, age) - no sensitive data yet
3. Returns the full `user_id` for granting access

```typescript
// Request
{ "patient_code": "ABCD1234" }

// Response
{
  "found": true,
  "patient_id": "abcd1234-full-uuid-here",
  "display_name": "John Doe",
  "gender": "Male",
  "age": 35
}
```

### Phase 2: Grant Doctor Access

**New Mutation:** `useGrantPatientAccess`

When doctor confirms the patient:
1. Insert into `doctor_patient_access` table
2. Set `is_active = true`
3. Open patient details dialog immediately

### Phase 3: QR Code Scanner (Optional Enhancement)

Add camera-based QR scanning for faster registration:
1. Doctor clicks "Scan QR Code" button
2. Camera opens to scan patient's QR
3. Automatically extracts Patient ID
4. Looks up and grants access in one flow

---

## UI Flow

### New "Add Patient" Dialog

```text
+-----------------------------------------------+
|          Add Patient to Your List             |
+-----------------------------------------------+
|                                               |
|  How would you like to add a patient?         |
|                                               |
|  [📸 Scan QR Code]    [🔢 Enter Patient ID]  |
|                                               |
+-----------------------------------------------+
|                                               |
|  Patient ID: [________] [Search]             |
|                                               |
|  ✓ Patient Found:                            |
|  +-----------------------------------------+ |
|  | John Doe                                 | |
|  | Male, 35 years old                      | |
|  | [Add to My Patients]                    | |
|  +-----------------------------------------+ |
|                                               |
+-----------------------------------------------+
```

---

## Database Changes

**No new tables needed!** We'll use existing:
- `user_profiles` - Already has patient data
- `doctor_patient_access` - Already handles doctor-patient relationships

**Optional Cleanup:**
- The `is_guest_patient` and `registered_by_hospital_id` columns can remain for edge cases (true walk-in emergencies where patient has no account)

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/hospital/AddPatientDialog.tsx` | New unified add patient modal |
| `supabase/functions/lookup-patient-by-id/index.ts` | Patient ID lookup API |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/hospital/DoctorPatientsPage.tsx` | Replace "Register Patient" with "Add Patient" |
| `src/hooks/useDoctorPatients.ts` | Add lookup + grant access mutations |

---

## Edge Cases

### Patient Not Found
If ID doesn't match any patient:
- Show helpful message: "No patient found with this ID"
- Offer fallback: "Patient not registered yet? They can sign up at [link]"
- Optional: Keep quick register for true emergencies

### Patient Already in Doctor's List
- Show message: "This patient is already in your list"
- Button to open their records directly

### Inactive Access
If previously revoked access:
- Reactivate the existing record instead of creating new

---

## Implementation Order

```text
Step 1: Edge Function
+------------------------------------------+
| Create lookup-patient-by-id function     |
| - Accept 8-char patient code             |
| - Search user_profiles by UUID prefix    |
| - Return patient info or not found       |
+------------------------------------------+

Step 2: Add Patient Hook
+------------------------------------------+
| Add useAddPatientByCode hook             |
| - Call lookup edge function              |
| - Grant access on confirmation           |
| - Invalidate doctor-patients query       |
+------------------------------------------+

Step 3: Add Patient Dialog
+------------------------------------------+
| Create AddPatientDialog component        |
| - Input field for Patient ID             |
| - Search results display                 |
| - Confirm add button                     |
+------------------------------------------+

Step 4: Update Patients Page
+------------------------------------------+
| Replace quick register with Add Patient  |
| - Keep as fallback for emergencies       |
+------------------------------------------+

Optional Step 5: QR Scanner
+------------------------------------------+
| Add camera QR scanning capability        |
| - Use web camera API or library          |
| - Parse patientbio: format               |
+------------------------------------------+
```

---

## Summary

This approach is better because:

1. **Uses existing accounts** - No duplicate patient records
2. **Patient-controlled** - Patients share their ID intentionally
3. **Real data** - Access actual health history, allergies, medications
4. **Faster workflow** - Scan QR or type 8 chars vs. filling a form
5. **Privacy-first** - Patient ID reveals nothing until doctor has access

The system will:
- Let doctors add patients by scanning QR or entering Patient ID
- Instantly grant access to view health data and prescribe
- Keep the quick register as a fallback for true emergencies

