-- Add is_admin column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create an index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);

-- We don't have the UUID for trafegocomkrisan@gmail.com yet, but we can set it via a trigger or manually.
-- For now, let's create a policy that allows admins to see everything.

-- Update existing policies to respect admin status
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE is_admin = true));

-- Repeat for other tables if necessary, or use a function.
