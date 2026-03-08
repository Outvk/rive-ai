-- Note: Since you already have the 'ai_generations' table,
-- just ensure it has these columns and logic.

-- 1. Ensure columns exist for image generation
ALTER TABLE public.ai_generations ADD COLUMN IF NOT EXISTS tool_type text;
ALTER TABLE public.ai_generations ADD COLUMN IF NOT EXISTS metadata jsonb default '{}'::jsonb;

-- 2. Safely create policies (PostgreSQL way)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'ai_generations' AND policyname = 'Users can view own generations'
    ) THEN
        CREATE POLICY "Users can view own generations"
        ON public.ai_generations FOR SELECT
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'ai_generations' AND policyname = 'Users can insert own generations'
    ) THEN
        CREATE POLICY "Users can insert own generations"
        ON public.ai_generations FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- 3. Optimization: Index for tool_type
CREATE INDEX IF NOT EXISTS ai_generations_tool_type_idx ON public.ai_generations (tool_type);

-- 4. Multi-Tool Logic
-- 'tool_type' will be 'voice' for your existing data
-- 'tool_type' will be 'image' for the new generator
-- Our code is already set up to filter by 'image' automatically.
