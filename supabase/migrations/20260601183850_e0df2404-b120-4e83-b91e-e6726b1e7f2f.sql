-- Create funnel_events table
CREATE TABLE IF NOT EXISTS public.funnel_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT,
    user_id UUID REFERENCES auth.users(id),
    event_name TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Grants
GRANT SELECT, INSERT ON public.funnel_events TO anon;
GRANT SELECT, INSERT ON public.funnel_events TO authenticated;
GRANT ALL ON public.funnel_events TO service_role;

-- RLS
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert events" 
ON public.funnel_events FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all events" 
ON public.funnel_events FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
    )
);

-- Indexes for analytics
CREATE INDEX idx_funnel_events_name ON public.funnel_events(event_name);
CREATE INDEX idx_funnel_events_session ON public.funnel_events(session_id);
CREATE INDEX idx_funnel_events_user ON public.funnel_events(user_id);
CREATE INDEX idx_funnel_events_created_at ON public.funnel_events(created_at);

-- Add last_sign_in_at to profiles if it doesn't exist (helpful for user management)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'last_sign_in_at') THEN
        ALTER TABLE public.profiles ADD COLUMN last_sign_in_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;
