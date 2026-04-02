'use server'

import { createClient } from '@/utils/supabase/server'
import { createSecondaryAdminClient } from '@/utils/supabase/secondary'
import { revalidatePath } from 'next/cache'

export type ToolType = 'Image' | 'Video' | 'Text' | 'Audio' | '3D'
export type TemplateCategory = 'Marketing' | 'Social Media' | 'Education' | 'Business' | 'Creative'

export interface CommunityWork {
  id: string
  user_id: string
  tool_type: ToolType
  prompt: string
  preview_url: string
  likes_count: number
  comments_count: number
  created_at: string
  has_liked?: boolean
  profiles: {
    full_name: string
    avatar_url: string | null
  }
}

export interface Template {
  id: string
  title: string
  description: string
  tool_type: ToolType
  category: TemplateCategory
  difficulty: 'Beginner' | 'Pro'
  usage_count: number
  preview_url: string
  is_featured: boolean
  prompt: string
  created_at: string
}

/**
 * Fetch all community posts with their creator profiles
 */
export async function getCommunityWorks(toolType?: string, sortBy: string = 'Latest') {
  const supabase = await createClient()           // Main - for auth & profiles
  const secondary = createSecondaryAdminClient()  // Secondary - for posts & likes

  let query = secondary.from('community_posts').select('*')

  if (toolType && toolType !== 'All') {
    query = query.eq('tool_type', toolType)
  }

  // Sorting
  if (sortBy === 'Trending' || sortBy === 'Most Liked') {
    query = query.order('likes_count', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching community works:', error)
    return []
  }

  if (!data || data.length === 0) return []

  // Extract unique user IDs safely for profile resolution
  const userIds = Array.from(new Set(data.map(post => post.user_id)))

  // Fetch all related profiles directly bypassing inner-join ambiguity on MAIN db
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', userIds)

  const profileMap = new Map((profiles || []).map(p => [p.id, p]))

  const { data: { user } } = await supabase.auth.getUser()
  const { data: userLikes } = user ? await secondary.from('community_likes').select('post_id').eq('user_id', user.id) : { data: [] }
  const likedPostIds = new Set(userLikes?.map(l => l.post_id) || [])

  const formattedWorks = (data as any[]).map(work => {
    const prof = profileMap.get(work.user_id)
    return {
      id: work.id,
      user_id: work.user_id,
      tool_type: work.tool_type as ToolType,
      prompt: work.prompt,
      preview_url: work.preview_url,
      likes_count: work.likes_count || 0,
      comments_count: work.comments_count || 0,
      has_liked: likedPostIds.has(work.id),
      created_at: work.created_at,
      profiles: {
        full_name: prof?.full_name || 'Anonymous User',
        avatar_url: prof?.avatar_url || null
      }
    }
  })

  // STRIP CIRCULARITY OR HIDDEN PROTOTYPES (Safety fix for Nesting Error)
  return JSON.parse(JSON.stringify(formattedWorks)) as CommunityWork[]
}

/**
 * Fetch templates with optional filtering
 */
export async function getTemplates(category?: string) {
  const secondary = createSecondaryAdminClient()

  let query = secondary.from('ai_templates').select('*')

  if (category && category !== 'All') {
    query = query.eq('category', category)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  let dbTemplates: Template[] = []
  if (!error && data) {
      dbTemplates = data as Template[]
  }

  const premiumDefaults: Template[] = [
    {
      id: "tpl_1",
      title: "Cinematic Cyberpunk City",
      description: "Generate a breathtaking hyper-realistic image of a futuristic cyberpunk city with neon reflections in the rain.",
      prompt: "Cinematic wide shot of a neon-lit cyberpunk city street at night, heavy rain, reflections on the wet asphalt, volumetric fog, flying cars in the distance, dramatic lighting, photorealistic masterwork, Unreal Engine 5 style",
      category: "Creative",
      tool_type: "Image",
      preview_url: "/templates/cyberpunk.jpg",
      difficulty: "Pro",
      usage_count: 12450,
      is_featured: true,
      created_at: new Date().toISOString()
    },
    {
      id: "tpl_2",
      title: "Next-Gen SaaS Promo Video",
      description: "Create a high-impact promotional video intro for a Next-Gen software product with glowing glassmorphism themes.",
      prompt: "Sleek and slow dolly zoom on a floating glassmorphism UI dashboard, glowing purple and blue neon circuits in the background, professional corporate software intro, 4k 60fps, clean lighting",
      category: "Marketing",
      tool_type: "Video",
      preview_url: "/templates/saas.png",
      difficulty: "Pro",
      usage_count: 8930,
      is_featured: true,
      created_at: new Date().toISOString()
    },
    {
      id: "tpl_3",
      title: "Viral Social Media Hooks",
      description: "A text generation template designed to give you 5 highly engaging, controversial, or attention-grabbing hooks for TikTok/Reels.",
      prompt: "Act as a viral social media strategist. I am creating content about [YOUR TOPIC]. Give me 5 viral hooks that use psychological curiosity gaps to force people to stop scrolling.",
      category: "Social Media",
      tool_type: "Text",
      preview_url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop",
      difficulty: "Pro",
      usage_count: 15200,
      is_featured: false,
      created_at: new Date().toISOString()
    },
    {
      id: "tpl_4",
      title: "Deep Cinematic Voiceover",
      description: "A template ready to be plugged into text-to-speech for an epic movie trailer voiceover.",
      prompt: "In a world where artificial intelligence has transcended human limits, one creator will redefine what it means to imagine. Prepare yourself for the ultimate creative revolution.",
      category: "Creative",
      tool_type: "Audio",
      preview_url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1000&auto=format&fit=crop",
      difficulty: "Pro",
      usage_count: 4120,
      is_featured: false,
      created_at: new Date().toISOString()
    },
    {
      id: "tpl_5",
      title: "Interactive Float Sneaker",
      description: "Generate a futuristic, aerodynamic floating sneaker sneaker concept perfect for AR/VR e-commerce.",
      prompt: "Highly detailed 3D model of a futuristic aerodynamic sneaker floating, metallic magenta details, translucent glowing soles, studio lighting, hyper-realistic PBR textures",
      category: "Business",
      tool_type: "3D",
      preview_url: "/templates/3d sneaker.png",
      difficulty: "Pro",
      usage_count: 3800,
      is_featured: false,
      created_at: new Date().toISOString()
    },
    {
      id: "tpl_6",
      title: "Elite Science Tutor",
      description: "A specialized text prompt that turns Rive AI into an elite university-level physics and math tutor.",
      prompt: "Act as an elite physics and mathematics professor with 40 years of experience. Explain [YOUR TOPIC] using intuitive analogies first, followed by the rigorous mathematical proofs, step-by-step.",
      category: "Education",
      tool_type: "Text",
      preview_url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1000&auto=format&fit=crop",
      difficulty: "Pro",
      usage_count: 5230,
      is_featured: false,
      created_at: new Date().toISOString()
    }
  ]

  const merged = [...dbTemplates, ...premiumDefaults]
  if (category && category !== 'All') {
      return merged.filter(t => t.category === category)
  }

  return merged
}

/**
 * Share a new work to the community
 */
export async function shareToCommunity(formData: FormData) {
  const prompt = formData.get('prompt') as string
  const previewUrl = formData.get('previewUrl') as string
  const toolType = formData.get('toolType') as ToolType

  const supabase = await createClient() // MAIN DB for auth
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const secondary = createSecondaryAdminClient() // SECONDARY DB for posts
  const { error } = await secondary.from('community_posts').insert({
    user_id: user.id,
    prompt,
    preview_url: previewUrl,
    tool_type: toolType
  })

  if (error) {
    console.error('Error sharing work:', error)
    return { error: 'Failed to share work' }
  }

  revalidatePath('/dashboard/community')
  return { success: true }
}

/**
 * Toggle like for a post
 */
export async function toggleLikePost(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const secondary = createSecondaryAdminClient()

  // Check if already liked
  const { data: existingLike } = await secondary
    .from('community_likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .single()

  let action = 'unliked'

  if (existingLike) {
    // Unlike
    const { error } = await secondary.from('community_likes').delete().eq('id', existingLike.id)
    if (error) console.error("Secondary DB unlike error:", error)
  } else {
    // Like
    const { error } = await secondary.from('community_likes').insert({
      user_id: user.id,
      post_id: postId
    })
    if (error) console.error("Secondary DB like error:", error)
    action = 'liked'
  }

  revalidatePath('/dashboard/community')
  return { success: true, action }
}

/**
 * Increment template usage
 */
export async function useTemplateAction(templateId: string) {
  const secondary = createSecondaryAdminClient()
  
  const { data: template } = await secondary
    .from('ai_templates')
    .select('usage_count')
    .eq('id', templateId)
    .single()

  if (template) {
    await secondary
      .from('ai_templates')
      .update({ usage_count: (template.usage_count || 0) + 1 })
      .eq('id', templateId)
  }

  revalidatePath('/dashboard/community')
  return { success: true }
}

/**
 * Fetch user's recent generations to select for sharing
 */
export async function getUserGenerations() {
  const supabase = await createClient() // Generative history remains on MAIN DB
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // Fetch from ai_images (Base64 or URL)
  const { data: images } = await supabase
    .from('ai_images')
    .select('id, prompt, image_url, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch as ToolType format
  const formattedImages = (images || []).map(img => ({
    id: img.id,
    prompt: img.prompt,
    result: img.image_url,
    tool_type: 'Image' as ToolType,
    created_at: img.created_at
  }))

  // Fetch from ai_generations (Other types)
  const { data: others } = await supabase
    .from('ai_generations')
    .select('id, prompt, result, tool_type, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const formattedOthers = (others || []).map(gen => ({
    id: gen.id,
    prompt: gen.prompt,
    result: gen.result,
    tool_type: (() => {
      const tt = gen.tool_type.toLowerCase()
      if (tt === 'speech') return 'Audio' as ToolType
      if (tt === '3d') return '3D' as ToolType
      return (tt.charAt(0).toUpperCase() + tt.slice(1)) as ToolType
    })() as ToolType,
    created_at: gen.created_at
  }))

  const allGenerations = [...formattedImages, ...formattedOthers].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return JSON.parse(JSON.stringify(allGenerations))
}

/**
 * Add a comment to a post
 */
export async function addComment(postId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const secondary = createSecondaryAdminClient()
  const { error } = await secondary.from('community_comments').insert({
    user_id: user.id,
    post_id: postId,
    content: content.trim()
  })

  if (error) {
    console.error('Error adding comment:', error)
    return { error: 'Failed to add comment' }
  }

  revalidatePath('/dashboard/community')
  return { success: true }
}

/**
 * Get comments for a post
 */
export async function getComments(postId: string) {
  const supabase = await createClient() // For auth mapping to MAIN DB profiles
  const secondary = createSecondaryAdminClient() // For actual comments on SECONDARY DB

  // 1. Fetch raw comments directly
  const { data: comments, error } = await secondary
    .from('community_comments')
    .select('id, user_id, content, created_at')
    .eq('post_id', postId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }

  if (!comments || comments.length === 0) return []

  // 2. Extract unique user IDs safely
  const userIds = Array.from(new Set(comments.map(c => c.user_id)))

  // 3. Fetch all related profiles directly bypassing inner-join ambiguity on MAIN DB
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', userIds)

  // 4. Map profiles perfectly back into the comments structure
  const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

  const formatted = comments.map(c => {
    const prof = profileMap.get(c.user_id)
    return {
      id: c.id,
      content: c.content,
      created_at: c.created_at,
      profiles: {
        full_name: prof?.full_name || 'Anonymous User',
        avatar_url: prof?.avatar_url || null
      }
    }
  })

  return JSON.parse(JSON.stringify(formatted))
}
