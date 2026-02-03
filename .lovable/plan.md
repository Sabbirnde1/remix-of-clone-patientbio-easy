

# Appointment Scheduling Implementation Plan

## Overview

This plan implements a comprehensive appointment scheduling system for the Hospital Dashboard that allows:
- **Patients** to book appointments with hospital doctors
- **Doctors** to manage their availability and view scheduled appointments
- **Hospital admins** to oversee all appointments across the hospital

---

## Database Schema

### New Tables

#### 1. `doctor_availability` - Stores doctor working hours and availability patterns

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| doctor_id | UUID | References auth.users(id) |
| hospital_id | UUID | References hospitals(id) |
| day_of_week | INTEGER | 0=Sunday, 1=Monday, etc. |
| start_time | TIME | Start of availability window |
| end_time | TIME | End of availability window |
| slot_duration_minutes | INTEGER | Default: 30 |
| is_active | BOOLEAN | Whether this schedule is active |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### 2. `appointments` - Stores actual appointments

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| patient_id | UUID | References auth.users(id) |
| doctor_id | UUID | References auth.users(id) |
| hospital_id | UUID | References hospitals(id) |
| appointment_date | DATE | Date of appointment |
| start_time | TIME | Start time |
| end_time | TIME | End time |
| status | appointment_status | ENUM: scheduled, confirmed, completed, cancelled, no_show |
| reason | TEXT | Reason for visit |
| notes | TEXT | Doctor/admin notes |
| cancelled_by | UUID | Who cancelled (if cancelled) |
| cancelled_at | TIMESTAMP | When cancelled |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### 3. `doctor_time_off` - Stores doctor leave/unavailable periods

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| doctor_id | UUID | References auth.users(id) |
| hospital_id | UUID | References hospitals(id) |
| start_date | DATE | Start of time off |
| end_date | DATE | End of time off |
| reason | TEXT | Optional reason |
| created_at | TIMESTAMP | |

---

## User Interface Components

### Hospital Dashboard (Doctors/Admins)

#### 1. Appointments Page (`/hospital/:hospitalId/appointments`)

```text
+-----------------------------------------------+
|  Appointments                    [+ Add Appt] |
+-----------------------------------------------+
|  [Today] [Week] [Month]     [Filter: Doctor ▼]|
+-----------------------------------------------+
|                                               |
|  Calendar View / List View Toggle             |
|                                               |
|  +------------------------------------------+ |
|  | 9:00 AM | Dr. Smith | John Doe | Checkup | |
|  | 9:30 AM | Dr. Smith | Jane Roe | Follow  | |
|  | 10:00AM | Dr. Jones | Bob Lee  | Consult | |
|  +------------------------------------------+ |
+-----------------------------------------------+
```

Features:
- Calendar view with day/week/month toggle
- Filter by doctor (for admins)
- Quick status updates (confirm, complete, cancel)
- Click to view appointment details

#### 2. Doctor Availability Page (`/hospital/:hospitalId/availability`)

```text
+-----------------------------------------------+
|  Manage Availability                          |
+-----------------------------------------------+
|  Weekly Schedule:                             |
|  +------------------------------------------+ |
|  | Monday    | 09:00 - 17:00 | 30 min slots | |
|  | Tuesday   | 09:00 - 17:00 | 30 min slots | |
|  | Wednesday | 09:00 - 13:00 | 30 min slots | |
|  | Thursday  | 09:00 - 17:00 | 30 min slots | |
|  | Friday    | 09:00 - 15:00 | 30 min slots | |
|  +------------------------------------------+ |
+-----------------------------------------------+
|  Time Off:                         [+ Add]    |
|  +------------------------------------------+ |
|  | Feb 14, 2026 | Personal Day              | |
|  | Mar 1-5, 2026| Conference                | |
|  +------------------------------------------+ |
+-----------------------------------------------+
```

### Patient Dashboard

#### 1. Book Appointment Page (`/dashboard/appointments`)

```text
+-----------------------------------------------+
|  Book Appointment                             |
+-----------------------------------------------+
|  Select Hospital:    [Hospital ABC       ▼]  |
|  Select Doctor:      [Dr. Smith - Cardio ▼]  |
|  Select Date:        [Calendar Picker]        |
+-----------------------------------------------+
|  Available Slots for Feb 15, 2026:            |
|  +------------------------------------------+ |
|  | [9:00 AM] [9:30 AM] [10:00 AM] [10:30 AM] ||
|  | [2:00 PM] [2:30 PM] [3:00 PM] [3:30 PM]  ||
|  +------------------------------------------+ |
+-----------------------------------------------+
|  Reason for Visit: [                        ] |
|  [Book Appointment]                           |
+-----------------------------------------------+
```

#### 2. My Appointments View

Shows patient's upcoming and past appointments with ability to cancel.

---

## File Structure

### New Files to Create

```text
src/
├── hooks/
│   ├── useAppointments.ts          # CRUD for appointments
│   ├── useDoctorAvailability.ts    # Manage doctor schedules
│   └── useTimeSlots.ts             # Calculate available slots
├── pages/
│   ├── hospital/
│   │   ├── HospitalAppointmentsPage.tsx
│   │   └── DoctorAvailabilityPage.tsx
│   └── dashboard/
│       └── AppointmentsPage.tsx
├── components/
│   ├── appointments/
│   │   ├── AppointmentCalendar.tsx
│   │   ├── AppointmentCard.tsx
│   │   ├── BookAppointmentDialog.tsx
│   │   ├── AvailabilityEditor.tsx
│   │   ├── TimeSlotPicker.tsx
│   │   └── AppointmentDetailsDialog.tsx
│   └── hospital/
│       └── (existing, add sidebar item)
│   └── dashboard/
│       └── (existing, add sidebar item)
```

### Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add new routes for appointments |
| `src/components/hospital/HospitalSidebar.tsx` | Add "Appointments" and "Availability" links |
| `src/components/dashboard/DashboardSidebar.tsx` | Add "Appointments" link |
| `src/types/hospital.ts` | Add appointment type definitions |

---

## Implementation Phases

### Phase 1: Database Setup
1. Create `appointment_status` enum
2. Create `doctor_availability` table with RLS
3. Create `appointments` table with RLS
4. Create `doctor_time_off` table with RLS
5. Add appropriate indexes for performance

### Phase 2: Doctor Availability (Hospital Side)
1. Create `useDoctorAvailability` hook
2. Build `AvailabilityEditor` component
3. Create `DoctorAvailabilityPage`
4. Add sidebar navigation

### Phase 3: Appointment Management (Hospital Side)
1. Create `useAppointments` hook
2. Build `AppointmentCalendar` component
3. Create `HospitalAppointmentsPage`
4. Add status management (confirm, complete, cancel)
5. Add sidebar navigation

### Phase 4: Patient Booking (Patient Side)
1. Create `useTimeSlots` hook to calculate availability
2. Build `TimeSlotPicker` component
3. Build `BookAppointmentDialog`
4. Create patient `AppointmentsPage`
5. Add sidebar navigation

---

## Technical Details

### RLS Policies

#### doctor_availability
- Doctors can manage their own availability
- Hospital staff can view availability for their hospital
- Patients can view availability for booking purposes

#### appointments
- Patients can view/create/cancel their own appointments
- Doctors can view/update appointments where they are the doctor
- Hospital admins can manage all appointments at their hospital

#### doctor_time_off
- Doctors can manage their own time off
- Hospital admins can view time off for their doctors

### Available Slot Calculation Logic

```typescript
function getAvailableSlots(
  doctorId: string,
  hospitalId: string,
  date: Date
): TimeSlot[] {
  // 1. Get doctor's availability for that day of week
  // 2. Exclude time off periods
  // 3. Get existing appointments for that date
  // 4. Calculate available slots based on slot_duration_minutes
  // 5. Return array of available start times
}
```

### Database Migration SQL Preview

```sql
-- Create appointment status enum
CREATE TYPE appointment_status AS ENUM (
  'scheduled',
  'confirmed',
  'completed',
  'cancelled',
  'no_show'
);

-- Create doctor_availability table
CREATE TABLE doctor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  UNIQUE(doctor_id, hospital_id, day_of_week)
);

-- Create appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status appointment_status DEFAULT 'scheduled',
  reason TEXT,
  notes TEXT,
  cancelled_by UUID,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create doctor_time_off table
CREATE TABLE doctor_time_off (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Enable RLS
ALTER TABLE doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_time_off ENABLE ROW LEVEL SECURITY;

-- Add indexes for performance
CREATE INDEX idx_appointments_doctor_date ON appointments(doctor_id, appointment_date);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_availability_doctor ON doctor_availability(doctor_id, hospital_id);
```

---

## Security Considerations

1. **Booking Validation**: Ensure appointment slots are actually available before confirming
2. **Double-booking Prevention**: Use database constraints or transactions
3. **Authorization**: Verify user has access to the hospital before booking
4. **Rate Limiting**: Consider limiting appointment creation frequency

---

## Estimated Effort

| Phase | Time Estimate |
|-------|---------------|
| Phase 1: Database Setup | 1-2 hours |
| Phase 2: Doctor Availability | 3-4 hours |
| Phase 3: Hospital Appointments | 4-5 hours |
| Phase 4: Patient Booking | 3-4 hours |
| **Total** | **11-15 hours** |

