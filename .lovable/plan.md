
# Admin Panel Implementation Plan

This plan outlines the implementation of a comprehensive admin panel with role-based access control (RBAC) to manage users, site content, contact form submissions, and team members.

## Overview

The admin panel will be a dedicated section of the application accessible only to users with the "admin" role. It will feature a sidebar navigation for managing different aspects of the site.

```text
+------------------+--------------------------------+
|                  |                                |
|   Admin Sidebar  |        Content Area            |
|                  |                                |
|   - Dashboard    |   (Dynamic based on           |
|   - Users        |    selected section)           |
|   - Team         |                                |
|   - Content      |                                |
|   - Messages     |                                |
|                  |                                |
+------------------+--------------------------------+
```

## Features

### 1. User Management
- View all registered users with email and registration date
- Assign/remove admin role from users
- Deactivate user accounts

### 2. Team Members
- Move existing team management to admin-only (currently any logged-in user can edit)
- Same add/edit/delete functionality but restricted to admins

### 3. Site Content
- Edit homepage statistics (195+ Countries, 100% Patient Owned, 24/7 Instant Access)
- Edit contact information (email, phone, address)
- Manage FAQ questions and answers

### 4. Contact Form Submissions
- Store all contact form submissions in database
- View inbox of all messages with status (new/read/replied)
- Mark messages as read
- Delete messages

---

## Technical Implementation

### Database Changes

**1. Create user roles table (for RBAC):**
```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
```

**2. Create security definer function (prevents RLS recursion):**
```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

**3. Create contact_messages table:**
```sql
CREATE TABLE public.contact_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'new',
    created_at timestamptz DEFAULT now(),
    read_at timestamptz
);
```

**4. Create site_content table:**
```sql
CREATE TABLE public.site_content (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text UNIQUE NOT NULL,
    value jsonb NOT NULL,
    updated_at timestamptz DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id)
);
```

**5. Update team_members RLS policies:**
- Change INSERT/UPDATE/DELETE from "authenticated" to "admin only" using `has_role()`

### New Files to Create

**1. Admin Layout & Pages:**
- `src/pages/admin/AdminLayout.tsx` - Sidebar layout with navigation
- `src/pages/admin/Dashboard.tsx` - Overview with quick stats
- `src/pages/admin/UsersPage.tsx` - User management table
- `src/pages/admin/TeamAdminPage.tsx` - Team management (reuse existing components)
- `src/pages/admin/ContentPage.tsx` - Site content editor
- `src/pages/admin/MessagesPage.tsx` - Contact submissions inbox

**2. Hooks:**
- `src/hooks/useUserRole.ts` - Check if current user is admin
- `src/hooks/useContactMessages.ts` - CRUD for contact messages
- `src/hooks/useSiteContent.ts` - CRUD for site content
- `src/hooks/useAdminUsers.ts` - Manage users and roles

**3. Components:**
- `src/components/admin/AdminSidebar.tsx` - Navigation sidebar
- `src/components/admin/UserTable.tsx` - Users data table
- `src/components/admin/ContentEditor.tsx` - Edit site content
- `src/components/admin/MessageCard.tsx` - Contact message display

### Files to Modify

**1. `src/App.tsx`:**
- Add protected admin routes under `/admin/*`
- Add route guard that checks for admin role

**2. `src/components/Navigation.tsx`:**
- Add "Admin" link for admin users

**3. `src/components/Contact.tsx`:**
- Save form submissions to `contact_messages` table instead of just showing a toast

**4. `src/components/Hero.tsx` and other content components:**
- Fetch dynamic content from `site_content` table
- Fallback to hardcoded values if no content exists

### Security Considerations

1. **Role checking uses security definer function** - Prevents infinite recursion in RLS policies
2. **Admin routes are protected client-side AND server-side** - RLS policies enforce database-level security
3. **Roles stored in separate table** - Not on auth.users or profiles to prevent privilege escalation
4. **Admin-only operations validated at database level** - Even if UI is bypassed, RLS blocks unauthorized actions

---

## Implementation Order

1. **Phase 1: Database Setup**
   - Create roles enum and user_roles table
   - Create has_role() security function
   - Create contact_messages table
   - Create site_content table
   - Update team_members RLS policies

2. **Phase 2: Admin Infrastructure**
   - Create useUserRole hook
   - Create AdminLayout with sidebar
   - Add admin routes to App.tsx
   - Add admin link to Navigation

3. **Phase 3: User Management**
   - Create useAdminUsers hook
   - Build UsersPage with role assignment UI

4. **Phase 4: Contact Messages**
   - Update Contact form to save to database
   - Create useContactMessages hook
   - Build MessagesPage inbox

5. **Phase 5: Site Content**
   - Create useSiteContent hook
   - Build ContentPage editor
   - Update Hero and Contact to use dynamic content

6. **Phase 6: Team (Admin-Only)**
   - Update RLS policies for admin-only access
   - Move team management UI to admin section

---

## First Admin User

After implementation, you will need to manually add yourself as the first admin. This can be done by:
1. Signing up/logging in to get your user ID
2. Running a SQL command in the database:
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('your-user-id-here', 'admin');
   ```

This ensures the admin role cannot be self-assigned through the UI.
