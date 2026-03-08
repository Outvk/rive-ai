'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addCredits(amount: number) {
    const supabase = await createClient()

    // Call the Postgres function we created earlier
    const { data, error } = await supabase.rpc('add_credits', {
        add_amount: amount,
        reason: 'Purchased UI Simulation'
    })

    if (error) {
        console.error("SUPABASE RPC ERROR (add_credits):", error)
        return { error: error.message || "Unknown Supabase Error" }
    }

    revalidatePath('/dashboard', 'layout')
    return { success: true }
}

export async function checkAndDeductCredits(toolName: string, amount: number = 1): Promise<{ success?: boolean; error?: string }> {
    const supabase = await createClient()

    // Call the Postgres function we created earlier
    const { data: success, error } = await supabase.rpc('deduct_credits', {
        charge_amount: amount,
        tool_name: toolName
    })

    if (error) {
        return { error: error.message }
    }

    if (!success) {
        return { error: "Insufficient credits. Please top up your account." }
    }

    revalidatePath('/dashboard', 'layout')
    return { success: true }
}

export async function deleteTransactions(ids: string[]) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('transactions')
        .delete()
        .in('id', ids)

    if (error) {
        console.error("DELETE TRANSACTIONS ERROR:", error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/credits')
    return { success: true }
}
