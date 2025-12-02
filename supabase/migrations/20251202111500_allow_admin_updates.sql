-- Allow admins to update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
  );

-- Also allow admins to delete profiles if needed (optional but good for moderation)
CREATE POLICY "Admins can delete any profile"
  ON public.profiles
  FOR DELETE
  USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
  );
