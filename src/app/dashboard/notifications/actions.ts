'use server'

import { createClient } from '@/utils/supabase/server'
import { createSecondaryAdminClient } from '@/utils/supabase/secondary'
import { revalidatePath } from 'next/cache'

export async function deleteNotifications(ids: string[]) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        console.error("DELETE NOTIFICATIONS: No user session found")
        return { error: 'Unauthorized' }
    }

    console.log(`User ${user.id} attempting to delete notifications:`, ids)

    const secondary = createSecondaryAdminClient()

    // Verify they exist and belong to the user first
    const { data: check, error: fetchError } = await secondary
        .from('notifications')
        .select('id, user_id')
        .in('id', ids)
    
    if (fetchError) {
        console.error("Fetch before delete error:", fetchError)
        return { error: fetchError.message }
    }

    console.log(`DB Check: Found ${check?.length || 0}/${ids.length} notifications.`)
    
    // Check ownership manually
    const unauthorizedIds = check?.filter(n => n.user_id !== user.id)
    if (unauthorizedIds && unauthorizedIds.length > 0) {
        console.error("Unauthorized attempt to delete notifications:", unauthorizedIds)
        return { error: 'You do not have permission to delete one or more of these notifications.' }
    }

    // Now delete
    const { error, count } = await secondary
        .from('notifications')
        .delete({ count: 'exact' })
        .in('id', ids)

    if (error) {
        console.error("DELETE NOTIFICATIONS ERROR:", error)
        return { error: error.message }
    }

    console.log(`Successfully deleted ${count} rows.`)
    
    revalidatePath('/dashboard/notifications')
    revalidatePath('/dashboard', 'layout')
    return { success: true, count: count || 0 }
}

export async function markNotificationsAsRead(ids: string[]) {
    const secondary = createSecondaryAdminClient()

    const { error } = await secondary
        .from('notifications')
        .update({ is_read: true })
        .in('id', ids)

    if (error) {
        console.error("MARK AS READ ERROR:", error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/notifications')
    revalidatePath('/dashboard', 'layout')
    return { success: true }
}

export async function clearAllNotifications() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const secondary = createSecondaryAdminClient()

    const { count, error } = await secondary
        .from('notifications')
        .delete({ count: 'exact' })
        .eq('user_id', user.id)

    if (error) {
        console.error("CLEAR ALL NOTIFICATIONS ERROR:", error)
        return { error: error.message }
    }

    console.log(`Successfully cleared ${count} notifications for user ${user.id}.`)

    revalidatePath('/dashboard/notifications')
    revalidatePath('/dashboard', 'layout')
    return { success: true, count: count || 0 }
}
