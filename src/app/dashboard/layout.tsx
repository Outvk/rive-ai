import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { SidebarProvider } from '@/components/SidebarContext'
import { DynamicSidebar } from '@/components/DynamicSidebar'
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

    // Fetch last 10 conversations for the sidebar panel
    const { data: conversations } = await supabase
        .from('chat_conversations')
        .select('id, title, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(10)

    // fetch last 10 image generations for the sidebar when on image tool
    const { data: recentImages } = await supabase
        .from('ai_generations')
        .select('id, prompt, result, created_at, tool_type')
        .eq('user_id', user.id)
        .eq('tool_type', 'image')
        .order('created_at', { ascending: false })
        .limit(10)

    // fetch last 10 speech generations for the sidebar when on text-to-speech tool
    const { data: recentSpeech } = await supabase
        .from('ai_generations')
        .select('id, prompt, result, created_at, tool_type')
        .eq('user_id', user.id)
        .eq('tool_type', 'speech')
        .order('created_at', { ascending: false })
        .limit(10)

    // fetch last 10 video generations for the sidebar when on video tool
    const { data: recentVideos } = await supabase
        .from('ai_generations')
        .select('id, prompt, result, created_at, tool_type')
        .eq('user_id', user.id)
        .eq('tool_type', 'video')
        .order('created_at', { ascending: false })
        .limit(10)

    return (
        <SidebarProvider>
            <div className="flex h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-purple-500/30">

                <DynamicSidebar
                    email={user.email || ''}
                    fullName={profile?.full_name || 'User'}
                    avatarUrl={profile?.avatar_url}
                    conversations={conversations ?? []}
                    recentImages={recentImages ?? []}
                    recentSpeech={recentSpeech ?? []}
                    recentVideos={recentVideos ?? []}
                />

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto relative flex flex-col">
                    <TopNavbar
                        credits={credits}
                        userEmail={user.email || ''}
                        userInitial={profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        avatarUrl={profile?.avatar_url}
                    />

                    {/* Subtle Background Glows */}
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

                    <div className="p-10 z-10 w-full max-w-6xl mx-auto flex-1">
                        <LowCreditBanner credits={credits} />
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    )
}
