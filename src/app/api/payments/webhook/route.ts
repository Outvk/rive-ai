import { createAdminClient } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

/**
 * Webhook handler for Chargily Pay V2 events.
 */
export async function POST(req: Request) {
    try {
        const payload = await req.text()
        const signature = req.headers.get('signature') || req.headers.get('x-chargily-signature')
        const secretKey = process.env.CHARGILY_API_KEY

        if (!secretKey) {
            console.error('CHARGILY_API_KEY is missing')
            return NextResponse.json({ error: 'Config error' }, { status: 500 })
        }

        if (!signature) {
            console.error('Webhook received without signature')
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
        }

        // 1. Verify the signature for security
        const hmac = crypto.createHmac('sha256', secretKey)
        const expectedSignature = hmac.update(payload).digest('hex')

        if (signature !== expectedSignature) {
            console.error('Invalid signature on Chargily webhook event')
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        const event = JSON.parse(payload)
        const { type, data: checkout } = event

        // 2. Handle successful payment event
        if (type === 'checkout.paid') {
            const userId = checkout.metadata?.userId
            const creditsToPush = parseInt(checkout.metadata?.credits || '0')
            const planId = checkout.metadata?.planId

            if (!userId || !creditsToPush) {
                console.error('Missing expected metadata in Chargily payment:', checkout.id)
                return NextResponse.json({ error: 'Incomplete metadata' }, { status: 400 })
            }

            // Using Admin Client to bypass RLS since this is a secure server-to-server call
            const supabaseAdmin = createAdminClient()

            // Update user credits via a secure RPC (Postgres function)
            const { error: rpcError } = await supabaseAdmin.rpc('add_credits_admin', {
                target_user_id: userId,
                add_amount: creditsToPush,
                reason: `Payment Confirmed - ${planId} Plan`
            })

            if (rpcError) {
                console.error('DB RPC Error (add_credits_admin):', rpcError)
                throw new Error('Database operation failed')
            }

            // Successfully record a notification so user sees the update in their dashboard
            await supabaseAdmin.from('notifications').insert({
                user_id: userId,
                title: 'Credits Added! 🪙',
                message: `Payment successful. ${creditsToPush} credits have been added for the ${planId} plan.`,
                type: 'success'
            })

            console.log(`Payment confirmed: User ${userId} received ${creditsToPush} credits.`)
            
            // Purge the cache for the dashboard and billing pages to show new credits immediately
            revalidatePath('/dashboard', 'layout')
            revalidatePath('/dashboard/billing')
        }

        // Always return 200 OK to Chargily so they know the event was received
        return NextResponse.json({ received: true })

    } catch (error: any) {
        console.error('Webhook processing exception:', error)
        return NextResponse.json(
            { error: 'Internal processing error' },
            { status: 500 }
        )
    }
}

