'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { verifyChargilyCheckout } from '@/app/dashboard/credits/actions'

interface Props {
    paymentStatus?: string | string[]
    checkoutId?: string | string[]
}

export function RefreshOnSuccess({ paymentStatus, checkoutId }: Props) {
    const router = useRouter()
    const [hasRefreshed, setHasRefreshed] = useState(false)

    useEffect(() => {
        if (paymentStatus === 'success' && checkoutId && !hasRefreshed) {
            
            const processCheckout = async () => {
                // Manually verify checkout via Server Action (works for localhost)
                await verifyChargilyCheckout(checkoutId as string)
                
                // Allow a tiny delay for DB propagation, then refresh layout
                setTimeout(() => {
                    router.refresh()
                    setHasRefreshed(true)
                }, 1000)
            }

            processCheckout()
        }
    }, [paymentStatus, checkoutId, hasRefreshed, router])

    return null
}
