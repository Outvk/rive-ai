import { createClient } from '@/utils/supabase/server'
import { createSecondaryAdminClient } from '@/utils/supabase/secondary'
import { redirect } from 'next/navigation'
import { Bell } from 'lucide-react'
import { NotificationClient } from './notification-client'

export default async function NotificationsPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch notifications for the current user
    const secondary = createSecondaryAdminClient()
    const { data: notifications } = await secondary
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="max-w-6xl mx-auto space-y-8 fade-in pb-20">
            <div>
                <h1 className="text-2xl font-semibold text-zinc-100 mb-1 flex items-center gap-2">
                    <Bell className="w-6 h-6 text-violet-400" />
                    Activity Center
                </h1>
                <p className="text-sm text-zinc-400">Manage all your system alerts, security updates, and transaction logs in one place.</p>
            </div>

            <NotificationClient initialData={notifications || []} userId={user.id} />
        </div>
    )
}
