import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CreditCard } from 'lucide-react'
import { Mastercard, GoldCard } from '@/components/BillingCards'

export const metadata = {
    title: 'Billing & Subscriptions - Rive AI',
    description: 'Manage your Rive AI billing and subscriptions.',
}

export default async function BillingPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const credits = profile?.credits ?? 0

    return (
        <div className="max-w-5xl mx-auto space-y-12 fade-in pb-20">
            <div>
                <h1 className="text-2xl font-semibold text-zinc-100 mb-1 flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-indigo-400" />
                    Billing & Subscriptions
                </h1>
                <p className="text-sm text-zinc-400">
                    Manage your credits and view your billing history.
                </p>
            </div>

            <div className="space-y-10 relative">
                {/* Background glow decoration */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

                {/* Section 1: Credits */}
                <div className="flex flex-col md:flex-row items-center gap-10 p-2 group">
                    <div className="transition-transform duration-500 group-hover:scale-105">
                        <Mastercard />
                    </div>
                    <div className="flex-1 bg-zinc-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-xl hover:border-indigo-500/30 transition-colors">
                        <h2 className="text-lg font-medium text-white mb-2">Available Credits</h2>
                        <div className="text-5xl font-bold text-indigo-400 mb-6 tracking-tight">{credits}</div>
                        <p className="text-sm text-zinc-400 mb-8 max-w-sm leading-relaxed">
                            Credits empower your creative flow. Use them to generate high-fidelity text, images, and speech instantly.
                        </p>
                        <button className="bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-3 rounded-2xl text-sm font-semibold shadow-xl shadow-indigo-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0">
                            Purchase Credits
                        </button>
                    </div>
                </div>

                {/* Section 2: Subscription */}
                <div className="flex flex-col md:flex-row-reverse items-center gap-10 p-2 group">
                    <div className="transition-transform duration-500 group-hover:scale-105">
                        <GoldCard />
                    </div>
                    <div className="flex-1 bg-zinc-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-xl hover:border-amber-500/30 transition-colors">
                        <h2 className="text-lg font-medium text-white mb-2">Current Subscription</h2>
                        <div className="text-3xl font-bold text-white mb-2 tracking-tight">Pay As You Go</div>
                        <p className="text-sm text-zinc-400 mb-8 max-w-sm leading-relaxed">
                            Zero monthly fees. Only pay for what you create. Access all premium generators without a recurring subscription.
                        </p>
                        <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-3 rounded-2xl text-sm font-medium border border-white/10 transition-all hover:bg-zinc-700/80">
                            Upgrade Plan
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}

