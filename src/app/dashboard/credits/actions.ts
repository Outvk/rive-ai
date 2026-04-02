// Manage credit-related transactions and state on the server.
'use server'

import { createClient } from '@/utils/supabase/server'
import { createSecondaryAdminClient } from '@/utils/supabase/secondary'
import { revalidatePath } from 'next/cache'
import { getChargilyClient } from '@/utils/chargily'

// Action to add credits to a user's account (simulating a purchase).
export async function addCredits(amount: number) {
    const supabase = await createClient()

    // Trigger a Postgres function (RPC) to atomically update the user's credit balance.
    const { data, error } = await supabase.rpc('add_credits', {
        add_amount: amount,
        reason: 'Purchased UI Simulation'
    })

    if (error) {
        console.error("SUPABASE RPC ERROR (add_credits):", error)
        return { error: error.message || "Unknown Supabase Error" }
    }

    // Refresh the dashboard data to reflect the new balance.
    revalidatePath('/dashboard', 'layout')

    // Record a success notification for the user.
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        const secondary = createSecondaryAdminClient()
        const { error: notifError } = await secondary.from('notifications').insert({
            user_id: user.id,
            title: 'Credits Added! 🪙',
            message: `Successfully added ${amount} credits to your account. Your creative fuel is ready!`,
            type: 'success'
        })
        if (notifError) console.error('Notification insert error (credits):', notifError)
    }

    return { success: true }
}

// Action to verify if a user has enough credits and deduct them before an AI task starts.
export async function checkAndDeductCredits(toolName: string, amount: number = 1): Promise<{ success?: boolean; error?: string }> {
    const supabase = await createClient()

    // Call the custom 'deduct_credits' Postgres function for atomic safety.
    const { data: success, error } = await supabase.rpc('deduct_credits', {
        charge_amount: amount,
        tool_name: toolName
    })

    if (error) {
        return { error: error.message }
    }

    // Return a clear error message if the balance is too low.
    if (!success) {
        return { error: "Insufficient credits. Please top up your account." }
    }

    // Refresh UI components that display the current credit count.
    revalidatePath('/dashboard', 'layout')
    return { success: true }
}

// Action to delete specific transaction records from the user's history.
export async function deleteTransactions(ids: string[]) {
    const supabase = await createClient()

    // Perform a bulk delete based on the provided array of IDs.
    const { error } = await supabase
        .from('transactions')
        .delete()
        .in('id', ids)

    if (error) {
        console.error("DELETE TRANSACTIONS ERROR:", error)
        return { error: error.message }
    }

    // Re-render the credits page to show the updated history list.
    revalidatePath('/dashboard/credits')
    return { success: true }
}

export async function verifyChargilyCheckout(checkoutId: string) {
    if (!checkoutId) return { success: false }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false }

    const { data: existingTx } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', user.id)
        .ilike('label', `%${checkoutId}%`)
        .single()

    if (!existingTx) {
        try {
            const chargily = getChargilyClient()
            const checkout = await chargily.retrieveCheckout(checkoutId)

            if (checkout.status === 'paid') {
                const creditsToPush = parseInt(checkout.metadata?.credits || '0')
                const planId = checkout.metadata?.planId || 'Plan'

                await supabase.rpc('add_credits', {
                    add_amount: creditsToPush,
                    reason: `Payment Confirmed - ${planId} (ID: ${checkoutId})`
                })

                revalidatePath('/dashboard', 'layout')
                revalidatePath('/dashboard/billing')
                return { success: true }
            }
        } catch (err) {
            console.error('Manual checkout verification error:', err)
        }
    }

    return { success: true }
}

