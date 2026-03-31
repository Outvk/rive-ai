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
        .select('id, full_name, credits, role, avatar_url')
        .eq('id', user.id)
        .single()

    // Sync Google Profile Data (Avatar & Name)
    const googleAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
    const googleName = user?.user_metadata?.full_name || user?.user_metadata?.name;

    let currentProfile = profile;
    
    console.log('Avatar Debug:', { 
        hasGoogleAvatar: !!googleAvatar,
        googleAvatarUrl: googleAvatar,
        currentProfileAvatar: currentProfile?.avatar_url,
        userId: user.id
    });

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
            .select('id, full_name, credits, role, avatar_url')
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
            .select('id, full_name, credits, role, avatar_url')
            .single()

        if (!updateError) {
            console.log('Avatar successfully synced to DB');
            currentProfile = updatedProfile;
        } else {
            console.error('Avatar DB sync error:', updateError);
        }
    }

    const credits = currentProfile?.credits ?? 10



    return (
        <SidebarProvider>
            <div className="flex h-screen bg-background text-foreground font-sans selection:bg-purple-500/30">

                <DynamicSidebar
                    email={user.email || ''}
                    fullName={currentProfile?.full_name || 'User'}
                    avatarUrl={currentProfile?.avatar_url}
                    conversations={[]}
                    recentImages={[]}
                    recentSpeech={[]}
                    recentVideos={[]}
                />

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto relative flex flex-col">
                    <TopNavbar
                        credits={credits}
                        userEmail={user.email || ''}
                        userInitial={currentProfile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        avatarUrl={currentProfile?.avatar_url}
                        userId={user.id}
                        fullName={currentProfile?.full_name || 'User'}
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
