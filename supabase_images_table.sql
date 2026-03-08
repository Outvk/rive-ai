-- 1. DROP AND REFRESH (Ensure no schema cache issues)
DROP TABLE IF EXISTS public.ai_images CASCADE;

-- 2. CREATE THE DEDICATED TABLE
CREATE TABLE public.ai_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  prompt text NOT NULL,
  image_url text NOT NULL, -- The base64 string or storage URL
  settings jsonb DEFAULT '{}'::jsonb, -- Store aspect ratio, style, etc.
  cost integer DEFAULT 10
);

-- 3. ENABLE RLS
ALTER TABLE public.ai_images ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES
CREATE POLICY "Users can view own images" 
  ON public.ai_images FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own images" 
  ON public.ai_images FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 5. GRANTS (Fixes visibility / schema cache issues)
GRANT ALL ON public.ai_images TO authenticated;
GRANT ALL ON public.ai_images TO service_role;

-- 6. INDEX
CREATE INDEX ai_images_user_id_idx ON public.ai_images (user_id);
