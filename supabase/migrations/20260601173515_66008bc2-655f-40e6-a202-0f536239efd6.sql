-- Add premium status to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Create a table to track payment events (webhooks)
CREATE TABLE IF NOT EXISTS public.payment_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT UNIQUE, -- Stripe Session ID or Charge ID
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  amount_total INTEGER,
  currency TEXT,
  status TEXT,
  raw_payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Grant permissions
GRANT SELECT, INSERT ON public.payment_events TO service_role;
GRANT SELECT ON public.payment_events TO authenticated;

-- Enable RLS
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own payment events
CREATE POLICY "Users can view their own payment events" 
ON public.payment_events 
FOR SELECT 
USING (auth.uid() = user_id);
