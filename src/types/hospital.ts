export interface Hospital {
  id: string;
  name: string;
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
