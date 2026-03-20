// Mark this as a server-side action file for profile management.
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Action to update the user's personal settings, avatar, and notification preferences.
export async function updateProfileSettings(formData: FormData) {
    const supabase = await createClient()

    // Validate if the user is currently authenticated.
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: 'Not authenticated' }
    }

    // Extract all settings from the form (full name, image files, preferences, etc.).
    const fullName = formData.get('fullName') as string
    const avatarFile = formData.get('avatar') as File | null
    const color1 = formData.get('color1') as string
    const color2 = formData.get('color2') as string
    const color3 = formData.get('color3') as string
    const cardBgFile = formData.get('card_bg') as File | null
    const removeCardBg = formData.get('remove_card_bg') === 'true'

    const notifEmail = formData.get('notif_email') === 'true'
    const notifUpdates = formData.get('notif_updates') === 'true'
    const notifSecurity = formData.get('notif_security') === 'true'
    const notifMarketing = formData.get('notif_marketing') === 'true'

    let avatarUrl = undefined
    let cardBgUrl: string | null | undefined = undefined

    // Logic to handle the removal of a custom card background.
    if (removeCardBg) {
        cardBgUrl = null
    }

    // Logic for uploading a new avatar image to Supabase Storage.
    if (avatarFile && avatarFile.size > 0) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${user.id}-avatar-${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        // Upload the physical file to the 'avatars' storage bucket.
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile)

        if (uploadError) {
            console.error('Avatar upload error:', uploadError)
            return { error: 'Failed to upload avatar' }
        }

        // Retrieve the publicly accessible URL for the uploaded avatar.
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)

        avatarUrl = publicUrl
    }

    // Logic for uploading a custom card background image.
    if (cardBgFile && cardBgFile.size > 0) {
        const fileExt = cardBgFile.name.split('.').pop()
        const fileName = `${user.id}-cardbg-${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('avatars') 
            .upload(filePath, cardBgFile)

        if (uploadError) {
            console.error('Card background upload error:', uploadError)
            return { error: 'Failed to upload background' }
        }

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)

        cardBgUrl = publicUrl
    }

    // Prepare the structured data for updating the user's record in the 'profiles' database table.
    const updateData: any = {
        updated_at: new Date().toISOString(),
        notif_email: notifEmail,
        notif_updates: notifUpdates,
        notif_security: notifSecurity,
        notif_marketing: notifMarketing,
    }

    // Only include fields that were actually provided in the update.
    if (fullName) updateData.full_name = fullName.trim()
    if (avatarUrl) updateData.avatar_url = avatarUrl
    if (notifEmail !== undefined) updateData.notif_email = notifEmail
    if (notifUpdates !== undefined) updateData.notif_updates = notifUpdates
    if (notifSecurity !== undefined) updateData.notif_security = notifSecurity
    if (notifMarketing !== undefined) updateData.notif_marketing = notifMarketing
    if (color1) updateData.color1 = color1
    if (color2) updateData.color2 = color2
    if (color3) updateData.color3 = color3
    if (cardBgUrl !== undefined) updateData.card_bg_url = cardBgUrl

    // Update the database record using the user's ID as a filter.
    const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

    if (updateError) {
        console.error('Update profile error:', updateError)
        return { error: 'Failed to update profile' }
    }

    // Purge the cache and force a re-render of the dashboard to show new settings immediately.
    revalidatePath('/', 'layout')

    // Automatically generate an in-app notification confirming the update.
    const { error: notifError } = await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Profile Updated',
        message: 'Your account settings and notification preferences have been synchronized successfully.',
        type: 'success'
    })

    if (notifError) {
        console.error('Notification insert error:', notifError)
    }

    return { success: true }
}

// Action to trigger a password reset email from the settings page.
export async function requestPasswordReset(email: string) {
    const supabase = await createClient()
    
    // Send a secure link to the user's confirmed email address.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/profile?reset=true`,
    })

    if (error) {
        return { error: error.message }
    }

    // Log a notification to the user's dashboard.
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        await supabase.from('notifications').insert({
            user_id: user.id,
            title: 'Reset Link Sent',
            message: 'A password reset link has been sent to your email address.',
            type: 'info'
        })
    }

    return { success: true }
}

// Action to update the user's password securely.
export async function updateUserPassword(password: string) {
    const supabase = await createClient()
    
    // Communicate the new password to the Supabase Auth system.
    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        return { error: error.message }
    }

    // Record a security alert in the user's notification history.
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        const { error: notifError } = await supabase.from('notifications').insert({
            user_id: user.id,
            title: 'Security Alert',
            message: 'Your password has been changed successfully.',
            type: 'security'
        })
        if (notifError) console.error('Notification insert error (password):', notifError)
    }

    return { success: true }
}

