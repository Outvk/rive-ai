/*
  COMMUNITY & TEMPLATES SCHEMA
  Run this SQL in your Supabase SQL Editor to set up the backend.
*/

-- 1. Community Posts Table
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tool_type TEXT NOT NULL, -- 'Image', 'Video', 'Text', 'Audio', '3D'
    prompt TEXT NOT NULL,
    preview_url TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Community Likes Table (for unique likes)
CREATE TABLE IF NOT EXISTS public.community_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- 3. AI Templates Table
CREATE TABLE IF NOT EXISTS public.ai_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tool_type TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Marketing', 'Social Media', etc.
    difficulty TEXT DEFAULT 'Beginner', -- 'Beginner' or 'Pro'
    usage_count INTEGER DEFAULT 0,
    preview_url TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RLS POLICIES (Row Level Security)
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_templates ENABLE ROW LEVEL SECURITY;

-- Posts: Everyone can see, only owner can delete, authenticated can insert
CREATE POLICY "Public can view community posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can share work" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.community_posts FOR DELETE USING (auth.uid() = user_id);

-- Likes: Authenticated can manage own likes
CREATE POLICY "Anyone can see like counts" ON public.community_likes FOR SELECT USING (true);
CREATE POLICY "Users can like/unlike" ON public.community_likes FOR ALL USING (auth.uid() = user_id);

-- Templates: Everyone can view, only admins can manage (simulated)
CREATE POLICY "Anyone can view templates" ON public.ai_templates FOR SELECT USING (true);

-- 5. FUNCTION: Update likes count automatically
CREATE OR REPLACE FUNCTION public.handle_update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.community_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_likes_count
AFTER INSERT OR DELETE ON public.community_likes
FOR EACH ROW EXECUTE FUNCTION public.handle_update_likes_count();
