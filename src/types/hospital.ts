export type HospitalType = 'hospital' | 'clinic' | 'diagnostic' | 'pharmacy';

export interface Hospital {
  id: string;
  name: string;
  type: HospitalType | null;
  registration_number: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface HospitalStaff {
  id: string;
  hospital_id: string;
  user_id: string;
  role: 'admin' | 'doctor' | 'receptionist' | 'nurse';
  department: string | null;
  employee_id: string | null;
  is_active: boolean;
  joined_at: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  hospital?: Hospital;
  doctor_profile?: DoctorProfile;
}

export interface DoctorProfile {
  id: string;
  user_id: string;
  full_name: string;
  license_number: string | null;
  specialty: string | null;
  qualification: string | null;
  experience_years: number | null;
  consultation_fee: number | null;
  bio: string | null;
  avatar_url: string | null;
  phone: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface DoctorApplication {
  id: string;
  hospital_id: string;
  user_id: string;
  full_name: string;
  license_number: string | null;
  specialty: string | null;
  qualification: string | null;
  experience_years: number | null;
  phone: string | null;
  cover_letter: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  hospital?: Hospital;
}

export type HospitalStaffRole = 'admin' | 'doctor' | 'receptionist' | 'nurse';

export const STAFF_ROLES: { value: HospitalStaffRole; label: string }[] = [
  { value: 'admin', label: 'Administrator' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'nurse', label: 'Nurse' },
];

export const SPECIALTIES = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'Neurology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Surgery',
  'Urology',
  'Other',
];

// Appointment Scheduling Types
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface DoctorAvailability {
  id: string;
  doctor_id: string;
  hospital_id: string | null;
  day_of_week: number; // 0=Sunday, 1=Monday, etc.
  start_time: string; // TIME format "HH:MM:SS"
  end_time: string;
  slot_duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  hospital_id: string | null;
  appointment_date: string; // DATE format "YYYY-MM-DD"
  start_time: string; // TIME format "HH:MM:SS"
  end_time: string;
  status: AppointmentStatus;
  reason: string | null;
  notes: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  doctor_profile?: DoctorProfile;
  patient_profile?: {
    display_name: string | null;
    phone: string | null;
  };
  hospital?: Hospital;
}

export interface DoctorTimeOff {
  id: string;
  doctor_id: string;
  hospital_id: string | null;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_at: string;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export const APPOINTMENT_STATUS_OPTIONS: { value: AppointmentStatus; label: string; color: string }[] = [
  { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-500' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-500' },
  { value: 'completed', label: 'Completed', color: 'bg-gray-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
  { value: 'no_show', label: 'No Show', color: 'bg-orange-500' },
];
