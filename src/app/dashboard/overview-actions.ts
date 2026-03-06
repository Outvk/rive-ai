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

    // Get date 30 days ago
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString()

    const { data: generations, error: genError } = await supabase
        .from('ai_generations')
        .select('created_at, tool_type')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgoStr)
        .order('created_at', { ascending: true })

    if (genError) {
        console.error('Failed to fetch analytics:', genError)
        return {
            trendData: [],
            totals: { text: 0, image: 0, audio: 0, video: 0, credits: 0 },
            totalGenerations: 0
        }
    }

    const trendMap = new Map<string, ChatDataPoint>()
    const totals = { text: 0, image: 0, audio: 0, video: 0, credits: 0 }
    let totalGenerations = 0

    // Initialize 30 days of empty data
    for (let i = 29; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        // Format as YYYY-MM-DD
        const dateStr = d.toISOString().split('T')[0]
        trendMap.set(dateStr, { date: dateStr, text: 0, image: 0, audio: 0, video: 0, credits: 0 })
    }

    if (generations) {
        generations.forEach((gen) => {
            const dateStr = gen.created_at.split('T')[0]
            if (trendMap.has(dateStr)) {
                const pt = trendMap.get(dateStr)!
                if (gen.tool_type === 'text') { pt.text++; totals.text++; pt.credits += 10; totals.credits += 10; }
                else if (gen.tool_type === 'image') { pt.image++; totals.image++; pt.credits += 10; totals.credits += 10; }
                else if (gen.tool_type === 'audio' || gen.tool_type === 'speech') { pt.audio++; totals.audio++; pt.credits += 10; totals.credits += 10; }
                else if (gen.tool_type === 'video') { pt.video++; totals.video++; pt.credits += 20; totals.credits += 20; }
                totalGenerations++
            }
        })
    }

    return {
        trendData: Array.from(trendMap.values()),
        totals,
        totalGenerations
    }
}
