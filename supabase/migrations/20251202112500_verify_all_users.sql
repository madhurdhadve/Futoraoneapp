-- Set all existing users as verified
UPDATE public.profiles
SET is_verified = TRUE
WHERE is_verified IS NULL OR is_verified = FALSE;

-- Ensure @Madhur is admin and verified
UPDATE public.profiles
SET is_admin = TRUE, is_verified = TRUE
WHERE username ILIKE 'madhur';

-- Log the changes
DO $$
DECLARE
    verified_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO verified_count FROM public.profiles WHERE is_verified = TRUE;
    RAISE NOTICE 'Total verified users: %', verified_count;
END $$;
