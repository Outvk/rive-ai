import { createClient } from '@/utils/supabase/server'
import { getChargilyClient } from '@/utils/chargily'
import { NextResponse } from 'next/server'

// Pricing configuration in DZD for Chargily integration
const PLAN_PRICING: Record<string, { amount: number; credits: number }> = {
    'Pro': { 
        amount: 2500, // Approximately $12 in local currency
        credits: 500 
    },
    'Ultra': { 
        amount: 8000, // Approximately $39 in local currency
        credits: 2500 
    }
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { planId } = await req.json()
        const plan = PLAN_PRICING[planId as keyof typeof PLAN_PRICING]

        if (!plan) {
            return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 })
        }

        const chargily = getChargilyClient()
        
        // Dynamically determine the base URL for redirects
        const host = req.headers.get('host')
        const protocol = req.headers.get('x-forwarded-proto') || 'http'
        const baseURL = `${protocol}://${host}`

        // 1. Create a Chargily checkout session

        // Note: For production, you'd want to store a pending transaction in your DB first.
        const checkout = await chargily.createCheckout({
            amount: plan.amount,
            currency: 'dzd',
            success_url: `${baseURL}/dashboard/billing?payment=success`,
            failure_url: `${baseURL}/dashboard/billing?payment=failed`,
            webhook_endpoint: `${baseURL}/api/payments/webhook`,
            description: `Rive AI - ${planId} Plan (${plan.credits} credits)`,
            metadata: {
                userId: user.id,
                planId: planId,
                credits: plan.credits
            }
        })

        if (!checkout.checkout_url) {
            throw new Error('Failed to generate checkout URL from Chargily')
        }

        // Return the URL for the frontend to redirect the user
        return NextResponse.json({ url: checkout.checkout_url })

    } catch (error: any) {
        console.error('Checkout creation error:', error)
        return NextResponse.json(
            { error: error?.message || 'Payment processing failed' },
            { status: 500 }
        )
    }
}
