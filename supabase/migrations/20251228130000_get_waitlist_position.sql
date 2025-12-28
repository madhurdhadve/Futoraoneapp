-- Create a secure function to calculate waitlist position
-- This bypasses RLS to count all users while only returning the rank integer
CREATE OR REPLACE FUNCTION get_waitlist_position(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (likely admin), bypassing RLS
AS $$
DECLARE
    v_created_at TIMESTAMP WITH TIME ZONE;
    v_position INTEGER;
BEGIN
    -- Get the user's join time
    SELECT created_at INTO v_created_at 
    FROM public.waitlist 
    WHERE user_id = p_user_id;
    
    -- If user not found, return 0
    IF v_created_at IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Count how many people joined at or before this user
    SELECT COUNT(*) INTO v_position 
    FROM public.waitlist 
    WHERE created_at <= v_created_at;
    
    RETURN v_position;
END;
$$;
