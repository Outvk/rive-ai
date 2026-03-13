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
    const color1 = formData.get('color1') as string
    const color2 = formData.get('color2') as string
    const color3 = formData.get('color3') as string
    const cardBgFile = formData.get('card_bg') as File | null

    let avatarUrl = undefined
    let cardBgUrl = undefined

    if (avatarFile && avatarFile.size > 0) {
        // Upload to Supabase Storage
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${user.id}-avatar-${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile)

        if (uploadError) {
            console.error('Avatar upload error:', uploadError)
            return { error: 'Failed to upload avatar' }
        }

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)

        avatarUrl = publicUrl
    }

    if (cardBgFile && cardBgFile.size > 0) {
        // Upload to Supabase Storage
        const fileExt = cardBgFile.name.split('.').pop()
        const fileName = `${user.id}-cardbg-${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('avatars') // Reusing avatars bucket or assuming 'backgrounds' exists. Let's stick to 'avatars' for simplicity if no other bucket
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

    const updateData: any = {
        updated_at: new Date().toISOString(),
    }

    if (fullName) updateData.full_name = fullName.trim()
    if (avatarUrl) updateData.avatar_url = avatarUrl
    if (color1) updateData.color1 = color1
    if (color2) updateData.color2 = color2
    if (color3) updateData.color3 = color3
    if (cardBgUrl) updateData.card_bg_url = cardBgUrl

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
