-- 1. Create the 'community_posts' table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL, -- 'Image', 'Video', 'Text', 'Audio', '3D'
  prompt TEXT NOT NULL,
  preview_url TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Ensure foreign key to public.profiles for easy joining (important for PostgREST)
-- We assume a 'profiles' table exists in 'public' schema that has an 'id' matching auth.users(id)
ALTER TABLE public.community_posts 
DROP CONSTRAINT IF EXISTS community_posts_user_id_profiles_fkey,
ADD CONSTRAINT community_posts_user_id_profiles_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id);

-- 3. Create the 'community_likes' table for tracking interactions
CREATE TABLE IF NOT EXISTS public.community_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(post_id, user_id)
);

-- 4. Set up 'ai_templates' table if missing (optional, since it's and existing feature)
CREATE TABLE IF NOT EXISTS public.ai_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  tool_type TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  usage_count INT DEFAULT 0,
  preview_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_templates ENABLE ROW LEVEL SECURITY;

-- 6. Add RLS Policies
-- Community Posts: Anyone can view, only authenticated can create
DROP POLICY IF EXISTS "Public can view community posts" ON public.community_posts;
CREATE POLICY "Public can view community posts" ON public.community_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can share to community" ON public.community_posts;
CREATE POLICY "Users can share to community" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Community Likes: Anyone can view, only authenticated can manage own likes
DROP POLICY IF EXISTS "Public can view community likes" ON public.community_likes;
CREATE POLICY "Public can view community likes" ON public.community_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own likes" ON public.community_likes;
CREATE POLICY "Users can manage own likes" ON public.community_likes FOR ALL USING (auth.uid() = user_id);

-- AI Templates: Anyone can view
DROP POLICY IF EXISTS "Public can view AI templates" ON public.ai_templates;
CREATE POLICY "Public can view AI templates" ON public.ai_templates FOR SELECT USING (true);

-- 7. Add simple trigger to update likes_count on posts (optional but helpful)
CREATE OR REPLACE FUNCTION update_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE community_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_post_like ON public.community_likes;
CREATE TRIGGER on_post_like
AFTER INSERT OR DELETE ON public.community_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes();
