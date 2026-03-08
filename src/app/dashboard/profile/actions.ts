'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfileSettings(formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: 'Not authenticated' }
    }

    const fullName = formData.get('fullName') as string
    const avatarFile = formData.get('avatar') as File | null

    if (!fullName || fullName.trim().length < 2) {
        return { error: 'Name must be at least 2 characters long' }
    }

    let avatarUrl = undefined

    if (avatarFile && avatarFile.size > 0) {
        // Upload to Supabase Storage
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${user.id}-${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile)

        if (uploadError) {
            console.error('Avatar upload error:', uploadError)
            return { error: 'Failed to upload avatar' }
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)

        avatarUrl = publicUrl
    }

    const updateData: any = {
        full_name: fullName.trim(),
        updated_at: new Date().toISOString(),
    }

    if (avatarUrl) {
        updateData.avatar_url = avatarUrl
    }

    const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

    if (updateError) {
        console.error('Update profile error:', updateError)
        return { error: 'Failed to update profile' }
    }

    revalidatePath('/', 'layout')

    return { success: true }
}
