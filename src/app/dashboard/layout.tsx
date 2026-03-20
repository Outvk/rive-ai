import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { SidebarProvider } from '@/components/SidebarContext'
import { DynamicSidebar } from '@/components/DynamicSidebar'
import { LowCreditToast } from '@/components/LowCreditToast'
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

    // Sync Google Profile Data (Avatar & Name)
    const googleAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
    const googleName = user?.user_metadata?.full_name || user?.user_metadata?.name;

    let currentProfile = profile;

    // Fail-safe: If the profile doesn't exist, create it immediately.
    if (!currentProfile) {
        const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                full_name: googleName || user.email?.split('@')[0] || 'User',
                credits: 10,
                role: 'user',
                avatar_url: googleAvatar || null
            })
            .select('*')
            .single()

        if (!insertError) {
            currentProfile = newProfile;
        }
    } else if (googleAvatar && !currentProfile.avatar_url) {
        // If profile exists but no avatar, sync it from Google automatically
        const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: googleAvatar })
            .eq('id', user.id)
            .select('*')
            .single()

        if (!updateError) {
            currentProfile = updatedProfile;
        }
    }

    const credits = currentProfile?.credits ?? 10

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
            <div className="flex h-screen bg-background text-foreground font-sans selection:bg-purple-500/30">

                <DynamicSidebar
                    email={user.email || ''}
                    fullName={currentProfile?.full_name || 'User'}
                    avatarUrl={currentProfile?.avatar_url}
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
                        userInitial={currentProfile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        avatarUrl={currentProfile?.avatar_url}
                        userId={user.id}
                    />

                    {/* Subtle Background Glows */}
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10 opacity-50 dark:opacity-100"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10 opacity-50 dark:opacity-100"></div>

                    <div className="p-10 z-10 w-full max-w-6xl mx-auto flex-1">
                        <LowCreditToast credits={credits} />
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    )
}
