-- Add prompt column to templates
ALTER TABLE public.ai_templates ADD COLUMN IF NOT EXISTS prompt TEXT;

-- Update existing sample templates with high-quality example prompts
UPDATE public.ai_templates SET prompt = 'A high-end cinematic product shot of a luxury glass serum bottle with organic leaf shadows, soft morning light, 8k resolution, photorealistic' WHERE title = 'Luxe Skin Serum Ad';
UPDATE public.ai_templates SET prompt = 'Cinematic drone flythrough of a neon-drenched cyberpunk city at night with floating holographic advertisements and flying cars, Unreal Engine 5 style' WHERE title = 'Future City Flythrough';
UPDATE public.ai_templates SET prompt = 'A deep, authoritative male voice narrating the epic rise and fall of the Roman Empire, clear articulation, professional studio quality' WHERE title = 'The History of Rome';
UPDATE public.ai_templates SET prompt = 'A minimalist low-poly 3d model of a modern home office desk with a laptop, lamp, and small plant, soft lighting, 3D printable' WHERE title = 'Modern Workspace 3D';
UPDATE public.ai_templates SET prompt = 'An upbeat and energetic technology podcast intro jingle with synthesized beats and a clean transition sound' WHERE title = 'Podcast Intro Jingle';
UPDATE public.ai_templates SET prompt = 'A clean corporate motion logo reveal with smooth transitions and professional blue-toned accents' WHERE title = 'Corporate Motion Logo';
UPDATE public.ai_templates SET prompt = 'Macro close-up photography of fresh organic vegetables showing water droplets and detailed textures, vibrant colors, 4k' WHERE title = 'Organic Food Texture';
UPDATE public.ai_templates SET prompt = 'A set of glowing 3D UI nodes and interconnected paths for an AI assistant dashboard, futuristic aesthetic' WHERE title = 'AI Assistant UI Kit';
