CREATE TABLE public.exercise_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT, -- For anonymous users or guest mode
    item_id TEXT NOT NULL,
    category TEXT NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_exercise_history_user_id ON public.exercise_history(user_id);
CREATE INDEX idx_exercise_history_session_id ON public.exercise_history(session_id);
CREATE INDEX idx_exercise_history_item_id ON public.exercise_history(item_id);
CREATE INDEX idx_exercise_history_used_at ON public.exercise_history(used_at);

-- Grant access
GRANT SELECT, INSERT ON public.exercise_history TO authenticated;
GRANT SELECT, INSERT ON public.exercise_history TO anon;
GRANT ALL ON public.exercise_history TO service_role;

-- RLS
ALTER TABLE public.exercise_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own history" ON public.exercise_history
    FOR SELECT USING (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Users can insert their own history" ON public.exercise_history
    FOR INSERT WITH CHECK (auth.uid() = user_id OR session_id IS NOT NULL);