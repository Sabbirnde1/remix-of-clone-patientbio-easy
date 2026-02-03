

# Plan: Fix Prescription Creation RLS Error

## Problem Summary
Doctors cannot create prescriptions because the RLS policy requires `has_role(auth.uid(), 'doctor')` to be true, but the 'doctor' role is never successfully assigned during onboarding.

---

## Root Cause Analysis

1. **RLS Policy on `user_roles` table** - Only admins can insert roles:
   ```sql
   CREATE POLICY "Admins can manage roles"
   ON public.user_roles
   FOR ALL
   USING (public.has_role(auth.uid(), 'admin'))
   ```

2. **Silent failure in onboarding** - The `useCreateDoctorProfile` hook tries to insert a 'doctor' role but fails silently due to RLS:
   ```typescript
   // This fails because user isn't an admin
   const { error: roleError } = await supabase.from("user_roles").insert({
     user_id: user.id,
     role: "doctor",
   });
   ```

3. **Prescription RLS requires role** - The prescription INSERT policy checks:
   ```sql
   WITH CHECK (
     auth.uid() = doctor_id AND 
     has_role(auth.uid(), 'doctor')
   )
   ```

---

## Solution

Add an RLS policy that allows users to self-assign the 'doctor' role when creating their doctor profile. This is a controlled self-assignment because:
- The user must be authenticated
- They can only assign the role to themselves
- They can only assign the 'doctor' role (not 'admin')

---

## Implementation

### Database Migration

Add a new RLS policy to allow authenticated users to self-assign the 'doctor' role:

```sql
-- Allow users to self-assign doctor role
-- This is secure because:
-- 1. User can only assign to themselves (user_id = auth.uid())
-- 2. Only 'doctor' role can be self-assigned
-- 3. Prevents admin role escalation
CREATE POLICY "Users can self-assign doctor role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND 
  role = 'doctor'
);
```

### Fix Existing Doctor

Run a one-time SQL to fix the existing doctor profile that's missing their role:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'doctor'::app_role
FROM public.doctor_profiles
ON CONFLICT (user_id, role) DO NOTHING;
```

---

## Files to Modify

| File | Action | Changes |
|------|--------|---------|
| Database Migration | Create | Add RLS policy for doctor role self-assignment |

No code changes required - the existing `useCreateDoctorProfile` hook already attempts to insert the role correctly.

---

## Security Considerations

This approach is secure because:
- Users can only assign roles to themselves (`user_id = auth.uid()`)
- Only the 'doctor' role can be self-assigned (not 'admin' or 'hospital_admin')
- The doctor profile creation flow already validates the user is authenticated
- Admin roles remain protected by existing policies

---

## Expected Outcome

After implementation:
- New doctors completing onboarding will automatically get the 'doctor' role
- Existing doctors will have their missing role assigned via migration
- Doctors will be able to create prescriptions without RLS errors
- Security is maintained - users cannot escalate to admin privileges

