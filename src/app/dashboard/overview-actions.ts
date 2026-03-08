'use server'

import { createClient } from '@/utils/supabase/server'

export type ChatDataPoint = {
    date: string
    text: number
    image: number
    audio: number
    video: number
    credits: number
}

export type OverviewAnalytics = {
    trendData: ChatDataPoint[]
    totals: { text: number, image: number, audio: number, video: number, credits: number }
    totalGenerations: number
}

export async function fetchOverviewAnalytics(): Promise<OverviewAnalytics> {
    const supabase = await createClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        throw new Error('Not authenticated')
    }

    // 1. Fetch Text Usage (from chat_conversations)
    const { data: conversations } = await supabase
        .from('chat_conversations')
        .select('messages, created_at')
        .eq('user_id', user.id)

    // 2. Fetch Image Usage (from ai_images)
    const { data: images } = await supabase
        .from('ai_images')
        .select('created_at')
        .eq('user_id', user.id)

    // 3. Fetch Other Usage (from ai_generations - usually audio/video)
    const { data: others } = await supabase
        .from('ai_generations')
        .select('created_at, tool_type')
        .eq('user_id', user.id)

    const totals = { text: 0, image: 0, audio: 0, video: 0, credits: 0 }
    const trendMap = new Map<string, ChatDataPoint>()

    // Initialize 30 days
    for (let i = 29; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        trendMap.set(dateStr, { date: dateStr, text: 0, image: 0, audio: 0, video: 0, credits: 0 })
    }

    // Process Texts (Conversations)
    if (conversations) {
        conversations.forEach(conv => {
            const aiMessages = Array.isArray(conv.messages)
                ? conv.messages.filter((m: any) => m.role === 'assistant').length
                : 1; // Fallback to 1 if not array

            totals.text += aiMessages;
            totals.credits += aiMessages * 10;

            const dateStr = (conv.created_at || new Date().toISOString()).split('T')[0];
            if (trendMap.has(dateStr)) {
                const pt = trendMap.get(dateStr)!;
                pt.text += aiMessages;
                pt.credits += aiMessages * 10;
            }
        });
    }

    // Process Images
    if (images) {
        images.forEach(img => {
            totals.image++;
            totals.credits += 10;
            const dateStr = (img.created_at || new Date().toISOString()).split('T')[0];
            if (trendMap.has(dateStr)) {
                const pt = trendMap.get(dateStr)!;
                pt.image++;
                pt.credits += 10;
            }
        });
    }

    // Process Others (Audio/Video)
    if (others) {
        others.forEach(gen => {
            const dateStr = (gen.created_at || new Date().toISOString()).split('T')[0];
            const pt = trendMap.has(dateStr) ? trendMap.get(dateStr) : null;

            if (gen.tool_type === 'audio' || gen.tool_type === 'speech') {
                totals.audio++;
                totals.credits += 10;
                if (pt) { pt.audio++; pt.credits += 10; }
            } else if (gen.tool_type === 'video') {
                totals.video++;
                totals.credits += 20;
                if (pt) { pt.video++; pt.credits += 20; }
            }
        });
    }

    const totalGenerations = totals.text + totals.image + totals.audio + totals.video;

    return {
        trendData: Array.from(trendMap.values()),
        totals,
        totalGenerations
    }
}
