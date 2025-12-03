-- Add admin policy for updating profiles (verification)
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));