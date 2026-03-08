import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { PersonIcon } from '@radix-ui/react-icons'
import { ProfileForm } from '@/components/ProfileForm'

export const metadata = {
    title: 'Profile Settings - Rive AI',
    description: 'Manage your Rive AI profile and settings.',
}

export default async function ProfilePage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const initialName = profile?.full_name || 'User'
    const initials = initialName.charAt(0).toUpperCase()

    return (
        <div className="max-w-4xl mx-auto space-y-6 fade-in h-full flex flex-col">
            <div>
                <h1 className="text-2xl font-semibold text-zinc-100 mb-1 flex items-center gap-2">
                    <PersonIcon className="w-6 h-6 text-indigo-400" />
                    Profile Settings
                </h1>
                <p className="text-sm text-zinc-400">
                    Manage your account details and preferences.
                </p>
            </div>

            <div className="flex-1 min-h-0 relative">
                {/* Background glow decoration similar to layout */}
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

                <ProfileForm
                    initialName={initialName}
                    email={user.email || ''}
                    initials={initials}
                    avatarUrl={profile?.avatar_url}
                />
            </div>
        </div>
    )
}
