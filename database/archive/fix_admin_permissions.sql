-- Admin deletion policy for posts
DROP POLICY IF EXISTS "Admins can delete any post" ON public.posts;
CREATE POLICY "Admins can delete any post"
ON public.posts
FOR DELETE
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- Admin deletion policy for comments
DROP POLICY IF EXISTS "Admins can delete any comment" ON public.comments;
CREATE POLICY "Admins can delete any comment"
ON public.comments
FOR DELETE
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);
