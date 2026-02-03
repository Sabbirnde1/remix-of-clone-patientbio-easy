

# Patient Dashboard Implementation Plan (Based on Prototype)

This plan implements a patient-facing dashboard inspired by the mobile prototype screenshots, adapted for a responsive web application. The dashboard will serve as the central hub for authenticated patients to manage their health data.

## Overview

Based on the prototype analysis, the Patient Dashboard includes a sidebar navigation and multiple functional sections. For the MVP, we'll focus on the core patient features that align with the prototype's structure.

```text
+------------------+------------------------------------------------+
|                  |                                                |
|   User Sidebar   |              Main Content Area                 |
|   (Collapsible)  |                                                |
|                  |   Welcome Section                              |
|   - Dashboard    |   +----------------------------------------+   |
|   - Basic Info   |   | Patient Basic Information              |   |
|   - Health Data  |   | Name, Email, ID, Location, etc.        |   |
|   - Prescriptions|   +----------------------------------------+   |
|   - Upload       |   | Personal Health Data                   |   |
|   - Share Data   |   | Height, Blood Group, Allergies, etc.   |   |
|   - My Doctors   |   +----------------------------------------+   |
|   - My QR Code   |                                                |
|                  |   Quick Actions / Summary Cards                |
+------------------+------------------------------------------------+
```

## Features from Prototype (MVP Scope)

### 1. Patient Basic Information (Read-Only View)
- Display patient profile: Name, Email, Patient ID, Birthday, Gender, Age, Location
- Clean card layout matching prototype aesthetic
- Edit functionality in dedicated profile page

### 2. Personal Health Data Section
- Form/display for health information:
  - Height, Blood Group
  - Previous Diseases, Medicine/Drugs
  - Bad Habits, Chronic Diseases
  - Health Allergies, Birth Defects
- Editable form with Submit button

### 3. Prescription Management
- Disease category tabs (like CANCER, COVID-19, DIABETES in prototype)
- View uploaded prescription files as image gallery
- Previous/Next navigation for multiple files

### 4. Upload File
- Select disease category dropdown
- File upload with preview
- Support for prescription images

### 5. Share Data (via QR Code)
- Generate unique patient QR code
- Share prescription button
- Patient ID display for sharing

### 6. My Doctors / My Pathologists (Future)
- List of connected healthcare providers
- View prescriptions from each provider

---

## Technical Implementation

### Database Schema

**1. Create user_profiles table:**

```sql
CREATE TABLE public.user_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    display_name text,
    avatar_url text,
    date_of_birth date,
    gender text,
    location text,
    phone text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON public.user_profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.user_profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.user_profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

**2. Create health_data table:**

```sql
CREATE TABLE public.health_data (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    height text,
    blood_group text,
    previous_diseases text,
    current_medications text,
    bad_habits text,
    chronic_diseases text,
    health_allergies text,
    birth_defects text,
    emergency_contact_name text,
    emergency_contact_phone text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.health_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health data"
ON public.health_data FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health data"
ON public.health_data FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health data"
ON public.health_data FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

**3. Create health_records table for prescriptions/documents:**

```sql
CREATE TYPE public.record_category AS ENUM (
    'prescription', 
    'lab_result', 
    'imaging', 
    'vaccination', 
    'other'
);

CREATE TYPE public.disease_category AS ENUM (
    'general',
    'cancer',
    'covid19',
    'diabetes',
    'heart_disease',
    'other'
);

CREATE TABLE public.health_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    description text,
    category record_category DEFAULT 'other',
    disease_category disease_category DEFAULT 'general',
    file_url text NOT NULL,
    file_type text,
    file_size integer,
    uploaded_at timestamptz DEFAULT now(),
    record_date date,
    provider_name text,
    notes text
);

ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own records"
ON public.health_records FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records"
ON public.health_records FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own records"
ON public.health_records FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own records"
ON public.health_records FOR DELETE TO authenticated
USING (auth.uid() = user_id);
```

**4. Create Storage Bucket for health documents:**

Storage bucket `health-records` with RLS policies for user-only access.

### New Files to Create

**1. Dashboard Layout:**
- `src/pages/dashboard/DashboardLayout.tsx` - Main layout with sidebar navigation
- `src/pages/dashboard/DashboardHome.tsx` - Overview/welcome page

**2. Dashboard Pages:**
- `src/pages/dashboard/ProfilePage.tsx` - Patient Basic Information
- `src/pages/dashboard/HealthDataPage.tsx` - Personal Health Data form
- `src/pages/dashboard/PrescriptionsPage.tsx` - View prescriptions by category
- `src/pages/dashboard/UploadPage.tsx` - Upload new health records
- `src/pages/dashboard/ShareDataPage.tsx` - QR code and sharing
- `src/pages/dashboard/MyDoctorsPage.tsx` - Connected providers (placeholder)

**3. Dashboard Components:**
- `src/components/dashboard/DashboardSidebar.tsx` - Navigation sidebar (purple theme like prototype)
- `src/components/dashboard/PatientInfoCard.tsx` - Display basic info
- `src/components/dashboard/HealthDataForm.tsx` - Editable health data
- `src/components/dashboard/RecordGallery.tsx` - Display prescription images
- `src/components/dashboard/CategoryTabs.tsx` - Disease category tabs
- `src/components/dashboard/FileUploader.tsx` - Upload component
- `src/components/dashboard/QRCodeDisplay.tsx` - User's QR code

**4. Hooks:**
- `src/hooks/useUserProfile.ts` - Fetch/update user profile
- `src/hooks/useHealthData.ts` - Fetch/update health data
- `src/hooks/useHealthRecords.ts` - CRUD for health records

### Files to Modify

**1. `src/App.tsx`:**
- Add `/dashboard/*` routes with nested routing
- DashboardLayout as parent route element

**2. `src/components/Navigation.tsx`:**
- Add "Dashboard" link for authenticated users
- Already has this partially implemented

**3. `src/pages/AuthPage.tsx`:**
- Redirect to `/dashboard` after successful login (instead of `/`)

**4. `src/pages/VerifyEmailPage.tsx`:**
- Redirect to `/dashboard` after successful verification

### Component Details

**DashboardSidebar.tsx (matching prototype):**
- Purple/violet header with user avatar and name
- Navigation items with icons:
  - Dashboard (home icon)
  - Patient Basic Information (info icon)
  - Update Personal Health Data (refresh icon)
  - Prescriptions (prescription icon)
  - Upload File (upload icon)
  - Share Data (share icon)
  - Personal Doctor (user-doctor icon)
  - My QR Code (qr-code icon)
- Collapsible on mobile

**PatientInfoCard.tsx:**
- Styled card matching prototype's "Patient Basic Information" section
- Fields: Email, Patient ID, Name, Birthday, Gender, Age, Location
- Non-editable display with "Edit Profile" link

**HealthDataForm.tsx:**
- Form matching "Update Personal Health data" screen
- Input fields for all health data points
- Submit button with loading state
- Success/error toast feedback

**RecordGallery.tsx:**
- Grid/carousel of uploaded prescription images
- Previous/Next navigation
- Click to view full size
- Disease category filter

---

## Implementation Order

### Phase 1: Database & Storage Setup
1. Create user_profiles table with RLS
2. Create health_data table with RLS
3. Create health_records table with RLS
4. Create health-records storage bucket

### Phase 2: Dashboard Infrastructure
1. Create DashboardLayout with sidebar
2. Create DashboardSidebar component
3. Add dashboard routes to App.tsx
4. Create useUserProfile hook
5. Create useHealthData hook

### Phase 3: Core Pages
1. Build DashboardHome (welcome/overview)
2. Build ProfilePage (patient basic info)
3. Build HealthDataPage (update health data form)

### Phase 4: Health Records
1. Create useHealthRecords hook
2. Build UploadPage with file uploader
3. Build PrescriptionsPage with category tabs
4. Build RecordGallery component

### Phase 5: Sharing Features
1. Build ShareDataPage
2. Implement QR code generation
3. Create shareable patient ID display

### Phase 6: Polish & Navigation
1. Update auth redirects to /dashboard
2. Add dashboard link to main Navigation
3. Implement responsive design
4. Add loading states and skeletons

---

## Design Specifications

**Color Scheme (from prototype):**
- Primary: Purple/Violet (#7C3AED or similar) - header bars
- Cards: White with subtle shadows
- Text: Dark gray/black
- Accent buttons: Purple gradient

**Typography:**
- Headers: Bold, larger size
- Labels: Medium weight, muted color
- Values: Regular weight, dark color

**Layout:**
- Sidebar: 280px width on desktop, collapsible on mobile
- Content area: Responsive padding
- Cards: Rounded corners, subtle shadows
- Forms: Full-width inputs with labels above

---

## Security Considerations

1. All tables protected by RLS - users can only access their own data
2. Storage bucket restricted to authenticated users' own folders
3. Dashboard routes protected by auth check in layout
4. Patient ID derived from user UUID (not exposable)
5. QR codes encode limited, non-sensitive sharing info

---

## Future Enhancements (Not in MVP)

- Provider sharing with time-limited access tokens
- Notifications system
- Integration with healthcare providers (doctors, pathologists)
- Document OCR for prescription data extraction
- Emergency access with PIN/biometrics
- Subscription/premium features

