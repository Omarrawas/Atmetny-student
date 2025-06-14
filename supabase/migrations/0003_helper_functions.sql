
-- Function to automatically update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user creation and insert a corresponding profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, name, avatar_url, 
    points, level, progress_to_next_level, 
    badges, rewards, student_goals, branch, 
    university, major, created_at, updated_at, active_subscription
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), -- Use full_name from metadata if available, else email
    NEW.raw_user_meta_data->>'avatar_url', -- Use avatar_url from metadata if available
    0,  -- Default points
    1,  -- Default level
    0,  -- Default progress
    '[]'::JSONB, -- Default empty badges
    '[]'::JSONB, -- Default empty rewards
    '', -- Default empty student_goals
    'undetermined', -- Default branch
    '', -- Default empty university
    '', -- Default empty major
    NOW(), -- Default created_at
    NOW(), -- Default updated_at
    NULL -- Default no active subscription
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Note: The trigger for handle_new_user is in 0002_triggers.sql (AFTER INSERT ON auth.users)

-- Function to check if the current user is an admin based on app_metadata
-- IMPORTANT: Ensure your admin users have `{"app_role": "admin"}` in their User App Metadata in Supabase.
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(auth.jwt()->>'app_metadata')::jsonb->>'app_role' = 'admin';
$$;

-- Grant execute permission to authenticated users for RLS policies
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated;


-- Function to check if the user has an active subscription for a specific subject or a general active subscription
CREATE OR REPLACE FUNCTION public.user_has_active_subject_subscription(subject_id_to_check TEXT)
RETURNS boolean AS $$
DECLARE
    profile_record RECORD;
BEGIN
    -- Ensure there's a logged-in user
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT * INTO profile_record FROM public.profiles WHERE id = auth.uid();
    
    -- If no profile or no active_subscription field, deny access
    IF profile_record IS NULL OR profile_record.active_subscription IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Check if the subscription is active and the end date is in the future
    IF (profile_record.active_subscription->>'status' = 'active' AND 
        (profile_record.active_subscription->>'endDate')::timestamptz > now()) THEN
        
        -- Check if it's a general subscription (subjectId is null or empty string in the subscription details)
        IF (profile_record.active_subscription->>'subjectId' IS NULL OR 
            TRIM(COALESCE(profile_record.active_subscription->>'subjectId','')) = '') THEN
            RETURN TRUE; -- General active subscription grants access
        END IF;
        
        -- Check if it's a specific subscription matching the subject_id_to_check
        IF (profile_record.active_subscription->>'subjectId' = subject_id_to_check) THEN
            RETURN TRUE; -- Specific subject active subscription grants access
        END IF;
    END IF;
    
    RETURN FALSE; -- No active or matching subscription found
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users for RLS policies
GRANT EXECUTE ON FUNCTION public.user_has_active_subject_subscription(TEXT) TO authenticated;

COMMENT ON FUNCTION public.current_user_is_admin IS 'Checks if the current authenticated user has an admin role via app_metadata. Admins need {"app_role": "admin"} in their app_metadata.';
COMMENT ON FUNCTION public.user_has_active_subject_subscription IS 'Checks if the current authenticated user has an active subscription, either general or for the specified subject ID. Relies on profiles.active_subscription field.';
COMMENT ON FUNCTION public.trigger_set_timestamp IS 'Updates the updated_at column to the current timestamp. Used in BEFORE UPDATE triggers.';
COMMENT ON FUNCTION public.handle_new_user IS 'Creates a new user profile in public.profiles upon new user signup in auth.users. Triggered AFTER INSERT on auth.users.';

