import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/DashboardSidebar'
import { LowCreditBanner } from '@/components/LowCreditBanner'
import { TopNavbar } from '@/components/TopNavbar'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch user profile for credits
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Fail-safe: If the profile doesn't exist, create it immediately.
    if (!profile) {
        await supabase.from('profiles').insert({
            id: user.id,
            full_name: user.email?.split('@')[0] || 'User',
            credits: 10,
            role: 'user'
        })
    }

    const credits = profile?.credits ?? 10

    // Fetch last 10 text generations for the sidebar history panel
    const { data: recentGenerations } = await supabase
        .from('ai_generations')
        .select('id, prompt, result, created_at, tool_type')
        .eq('user_id', user.id)
        .eq('tool_type', 'text')
        .order('created_at', { ascending: false })
        .limit(10)

    return (
        <div className="flex h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-purple-500/30">

            <DashboardSidebar
                email={user.email || ''}
                fullName={profile?.full_name || 'User'}
                recentGenerations={recentGenerations ?? []}
            />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative flex flex-col">
                <TopNavbar credits={credits} />

                {/* Subtle Background Glows */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

                <div className="p-10 z-10 w-full max-w-6xl mx-auto flex-1">
                    <LowCreditBanner credits={credits} />
                    {children}
                </div>
            </main>
        </div>
    )
}
