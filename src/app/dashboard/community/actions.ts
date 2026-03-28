'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Admin SDK instance safely scoped to Server-side Actions ONLY for strict persistence
function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

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
  const supabase = await createClient()

  let query = supabase
    .from('community_posts')
    .select(`
      *,
      profiles!user_id (
        full_name,
        avatar_url
      )
    `)

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

  if (!data) return []

  const { data: { user } } = await supabase.auth.getUser()
  const { data: userLikes } = user ? await supabase.from('community_likes').select('post_id').eq('user_id', user.id) : { data: [] }
  const likedPostIds = new Set(userLikes?.map(l => l.post_id) || [])

  // Ensure plain objects and flatten profiles if it's an array (Supabase joins often return arrays)
  const formattedWorks = (data as any[]).map(work => ({
    id: work.id,
    user_id: work.user_id,
    tool_type: work.tool_type as ToolType,
    prompt: work.prompt,
    preview_url: work.preview_url,
    likes_count: work.likes_count || 0,
    comments_count: work.comments_count || 0,
    has_liked: likedPostIds.has(work.id),
    created_at: work.created_at,
    profiles: Array.isArray(work.profiles) ? work.profiles[0] : (work.profiles || { full_name: 'Anonymous User', avatar_url: null })
  }))

  // STRIP CIRCULARITY OR HIDDEN PROTOTYPES (Safety fix for Nesting Error)
  return JSON.parse(JSON.stringify(formattedWorks)) as CommunityWork[]
}

/**
 * Fetch templates with optional filtering
 */
export async function getTemplates(category?: string) {
  const supabase = await createClient()

  let query = supabase.from('ai_templates').select('*')

  if (category && category !== 'All') {
    query = query.eq('category', category)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching templates:', error)
    return []
  }

  return data as Template[]
}

/**
 * Share a new work to the community
 */
export async function shareToCommunity(formData: FormData) {
  const prompt = formData.get('prompt') as string
  const previewUrl = formData.get('previewUrl') as string
  const toolType = formData.get('toolType') as ToolType

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('community_posts').insert({
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

  // Check if already liked
  const { data: existingLike } = await supabase
    .from('community_likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .single()

  let action = 'unliked'
  const adminDb = getAdminClient()

  if (existingLike) {
    // Unlike
    const { error } = await adminDb.from('community_likes').delete().eq('id', existingLike.id)
    if (error) console.error("Admin DB unlike error:", error)
  } else {
    // Like
    const { error } = await adminDb.from('community_likes').insert({
      user_id: user.id,
      post_id: postId
    })
    if (error) console.error("Admin DB like error:", error)
    action = 'liked'
  }

  revalidatePath('/dashboard/community')
  return { success: true, action }
}

/**
 * Increment template usage
 */
export async function useTemplateAction(templateId: string) {
  const supabase = await createClient()
  
  // Directly increment usage_count using RPC or separate update
  // For simplicity, we'll fetch and increment, though RPC is safer for race conditions
  const { data: template } = await supabase
    .from('ai_templates')
    .select('usage_count')
    .eq('id', templateId)
    .single()

  if (template) {
    await supabase
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
  const supabase = await createClient()
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

  const adminDb = getAdminClient()
  const { error } = await adminDb.from('community_comments').insert({
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
  const supabase = await createClient()

  // 1. Fetch raw comments directly
  const { data: comments, error } = await supabase
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

  // 3. Fetch all related profiles directly bypassing inner-join ambiguity
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
