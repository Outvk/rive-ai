'use client'

import { InfoCircledIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons'

export function LowCreditBanner({ credits }: { credits: number }) {
    if (credits > 5) return null

    if (credits === 0) {
        return (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-6 flex items-start gap-3 backdrop-blur-md">
                <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-semibold text-sm">Credits Exhausted</h4>
                    <p className="text-sm opacity-80 mt-1">You have run out of AI generation credits. Please top up your account to continue using the tools.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl p-4 mb-6 flex items-start gap-3 backdrop-blur-md">
            <InfoCircledIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
                <h4 className="font-semibold text-sm">Low Credits Warning</h4>
                <p className="text-sm opacity-80 mt-1">You only have {credits} {credits === 1 ? 'credit' : 'credits'} remaining. Consider topping up soon.</p>
            </div>
        </div>
    )
}
