-- Create feedback table
CREATE TABLE IF NOT EXISTS public.app_feedback (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id),
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 10),
    comment text,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.app_feedback ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (or authenticated if preferred)
CREATE POLICY "Anyone can insert feedback" 
    ON public.app_feedback FOR INSERT 
    WITH CHECK (true);

-- Allow users to see their own feedback (optional)
CREATE POLICY "Users can view own feedback"
    ON public.app_feedback FOR SELECT
    USING (auth.uid() = user_id);
