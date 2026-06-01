
-- 1. Tighten exercise_history policies to owner-only
DROP POLICY IF EXISTS "Users can view their own history" ON public.exercise_history;
DROP POLICY IF EXISTS "Users can insert their own history" ON public.exercise_history;

CREATE POLICY "Users can view their own history"
ON public.exercise_history FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can insert their own history"
ON public.exercise_history FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 2. Prevent privilege escalation on profiles (is_admin / is_premium)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND is_admin IS NOT DISTINCT FROM (SELECT p.is_admin FROM public.profiles p WHERE p.user_id = auth.uid())
  AND is_premium IS NOT DISTINCT FROM (SELECT p.is_premium FROM public.profiles p WHERE p.user_id = auth.uid())
);

-- 3. Explicitly block client-side writes on payment_events (only service role via supabaseAdmin)
CREATE POLICY "Block client inserts on payment_events"
ON public.payment_events AS RESTRICTIVE FOR INSERT TO authenticated, anon
WITH CHECK (false);

CREATE POLICY "Block client updates on payment_events"
ON public.payment_events AS RESTRICTIVE FOR UPDATE TO authenticated, anon
USING (false);

CREATE POLICY "Block client deletes on payment_events"
ON public.payment_events AS RESTRICTIVE FOR DELETE TO authenticated, anon
USING (false);

-- 4. Explicitly block client-side writes on subscriptions
CREATE POLICY "Block client inserts on subscriptions"
ON public.subscriptions AS RESTRICTIVE FOR INSERT TO authenticated, anon
WITH CHECK (false);

CREATE POLICY "Block client updates on subscriptions"
ON public.subscriptions AS RESTRICTIVE FOR UPDATE TO authenticated, anon
USING (false);

CREATE POLICY "Block client deletes on subscriptions"
ON public.subscriptions AS RESTRICTIVE FOR DELETE TO authenticated, anon
USING (false);

-- 5. Fix mutable search_path on update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;
