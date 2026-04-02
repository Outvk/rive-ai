import { createClient } from '@/utils/supabase/server'
import { getChargilyClient } from '@/utils/chargily'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
    CreditCard,
    Zap,
    Crown,
    Check,
    Sparkles,
    TrendingUp,
    ArrowUpRight,
    Star,
    Gift,
} from 'lucide-react'
import { BillingCards3D } from '@/components/BillingCards3D'
import { PlanSelector } from './plan-selector'
import { RefreshOnSuccess } from '@/components/RefreshOnSuccess'

export const metadata = {
    title: 'Billing & Subscriptions - Rive AI',
    description: 'Manage your Rive AI billing and subscriptions.',
}

const plans = [
    {
        name: 'Starter',
        price: 'Free',
        priceDetail: 'forever',
        description: 'Everything you need to get started with AI generation.',
        credits: 50,
        features: [
            '50 AI credits / month',
            'Text generation',
            'Basic image generation',
            'Standard support',
        ],
        cta: 'Current Plan',
        ctaStyle: 'ghost',
        iconName: 'zap' as const,
        popular: false,
    },
    {
        name: 'Pro',
        price: '2500 DZD',
        priceDetail: '/ month',
        description: 'Unlock premium features and high-volume generation.',
        credits: 500,
        features: [
            '500 AI credits / month',
            'Priority text generation',
            'HD image & video generation',
            'Text-to-Speech (ElevenLabs)',
            'Priority support',
            'Advanced analytics',
        ],
        cta: 'Upgrade to Pro',
        ctaStyle: 'primary',
        iconName: 'crown' as const,
        popular: true,
    },
    {
        name: 'Ultra',
        price: '8000 DZD',
        priceDetail: '/ month',
        description: 'For power users who need unlimited creative flow.',
        credits: 2500,
        features: [
            '2,500 AI credits / month',
            'All Pro features',
            'Batch generation',
            'API access',
            'Custom voice cloning',
            'Dedicated account manager',
        ],
        cta: 'Go Ultra',
        ctaStyle: 'gold',
        iconName: 'star' as const,
        popular: false,
    },
]

export default async function BillingPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const paymentStatus = params.payment
    const checkoutId = params.checkout_id as string
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

    // Fetch real transactions
    const { data: dbTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

    const credits = profile?.credits ?? 0
    // Dynamic max credits for the progress ring
    const maxCredits = credits > 500 ? (credits > 2500 ? 5000 : 2500) : 500
    const creditPct = Math.min((credits / maxCredits) * 100, 100)
    const circumference = 2 * Math.PI * 52
    const strokeDashoffset = circumference - (creditPct / 100) * circumference

    // Map DB transactions to UI format
    const displayTransactions = dbTransactions && dbTransactions.length > 0 
        ? dbTransactions.map(tx => ({
            label: tx.label,
            amount: (tx.amount > 0 ? '+' : '') + tx.amount,
            date: new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            type: tx.type
        }))
        : [
            { label: 'Total Credits', amount: String(credits), date: 'Current Balance', type: 'credit' }
        ]

    return (
        <div className="max-w-6xl mx-auto space-y-16 fade-in pb-24 px-4">
            <RefreshOnSuccess paymentStatus={paymentStatus} checkoutId={checkoutId} />

            {/* ─── Status Banners ─── */}
            {paymentStatus === 'success' && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-top duration-500 mb-[-2rem]">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <Check className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h4 className="text-emerald-400 font-bold text-sm">Payment Successful!</h4>
                        <p className="text-emerald-500/70 text-xs">Your credits have been updated. Refresh the page if they don&apos;t appear immediately.</p>
                    </div>
                </div>
            )}

            {paymentStatus === 'failed' && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-top duration-500 mb-[-2rem]">
                    <div className="p-2 bg-rose-500/20 rounded-lg">
                        <Zap className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                        <h4 className="text-rose-400 font-bold text-sm">Payment Cancelled</h4>
                        <p className="text-rose-500/70 text-xs">The transaction was not completed. No credits were deducted.</p>
                    </div>
                </div>
            )}

            {/* ─── Header ─── */}
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Billing & Subscriptions
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    Manage your credits &amp;{' '}
                    <span
                        style={{
                            background:
                                'linear-gradient(90deg,#6366f1,#a855f7,#8b5cf6)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        plans
                    </span>
                </h1>
                <p className="text-zinc-400 text-sm">
                    View your credit balance, upgrade your plan, and review
                    your billing history.
                </p>
            </div>

            {/* ─── Credit Summary Row ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left: Credit Balance */}
                {/* Left: Custom Billing Settings */}
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/60 backdrop-blur-2xl p-8 shadow-2xl flex flex-col">
                    {/* Header */}
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-white tracking-tight mb-1">Custom Billing Settings</h3>
                        <p className="text-zinc-500 text-sm">Manage your billing preferences and settings</p>
                    </div>

                    <div className="space-y-6 flex-1">
                        {/* Primary Fields */}
                        <div className="space-y-4">
                            <div>
                                <input 
                                    type="text" 
                                    defaultValue={profile?.full_name || "user@example.com"} 
                                    placeholder="Enter your full name"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600"
                                />
                                <p className="text-[11px] text-zinc-500 mt-2 ml-1">Invoices will be sent to this email address</p>
                            </div>

                            <div>
                                <input 
                                    type="text" 
                                    defaultValue="EU123456789" 
                                    placeholder="VAT Number"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600"
                                />
                                <p className="text-[11px] text-zinc-500 mt-2 ml-1">For VAT or other tax purposes</p>
                            </div>

                            <div>
                                <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer">
                                    <option className="bg-zinc-900">USD - US Dollar</option>
                                    <option className="bg-zinc-900">EUR - Euro</option>
                                    <option className="bg-zinc-900">GBP - British Pound</option>
                                    <option className="bg-zinc-900">DZD - Algerian Dinar</option>
                                </select>
                            </div>
                        </div>

                        <div className="h-[1px] w-full bg-white/10 my-6" />

                        {/* Toggles */}
                        <div className="space-y-5">
                            <div className="flex items-center justify-between group cursor-pointer">
                                <div>
                                    <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">Auto-Renewal</p>
                                    <p className="text-[11px] text-zinc-500">Automatically renew your subscription</p>
                                </div>
                                <div className="w-10 h-5 bg-indigo-500 rounded-full relative flex items-center px-0.5 shadow-[0_0_10px_rgba(99,102,241,0.4)] transition-all">
                                    <div className="w-4 h-4 bg-white rounded-full translate-x-5 transition-transform" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between group cursor-pointer">
                                <div>
                                    <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">Invoice Emails</p>
                                    <p className="text-[11px] text-zinc-500">Receive emails when invoices are generated</p>
                                </div>
                                <div className="w-10 h-5 bg-indigo-500 rounded-full relative flex items-center px-0.5 shadow-[0_0_10px_rgba(99,102,241,0.4)] transition-all">
                                    <div className="w-4 h-4 bg-white rounded-full translate-x-5 transition-transform" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between group cursor-pointer">
                                <div>
                                    <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">Promotional Emails</p>
                                    <p className="text-[11px] text-zinc-500">Receive occasional updates about new features and offers</p>
                                </div>
                                <div className="w-10 h-5 bg-zinc-800 border border-white/10 rounded-full relative flex items-center px-0.5 transition-all">
                                    <div className="w-4 h-4 bg-zinc-400 rounded-full translate-x-0 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-white/10">
                        <button className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all">
                            Discard Changes
                        </button>
                        <button className="relative group px-5 py-2.5 rounded-xl text-sm font-bold text-white overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)]">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 top-0 left-0 w-full h-full" />
                            <span className="relative z-10">Save Preferences</span>
                        </button>
                    </div>
                </div>

                {/* Right: Card showcase */}
                <div
                    style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '20px',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        overflow: 'hidden',
                    }}
                >
                    <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">
                        Your Cards
                    </p>
                    <BillingCards3D cardholderName={profile?.full_name} />
                    <p className="text-center text-xs text-zinc-600">
                        Hover cards for 3D effect
                    </p>
                </div>
            </div>

            {/* ─── Pricing Plans ─── */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white">Choose your plan</h2>
                        <p className="text-zinc-500 text-sm mt-0.5">Scale up whenever you&apos;re ready</p>
                    </div>
                </div>

                <PlanSelector plans={plans} />
            </div>

            {/* ─── Recent Transactions ─── */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Recent Transactions</h2>
                    <button
                        style={{
                            background: 'transparent',
                            color: '#6366f1',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                        }}
                        className="hover:text-indigo-300 transition-colors"
                    >
                        View all <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div
                    style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '18px',
                        overflow: 'hidden',
                    }}
                >
                    {displayTransactions.map((tx, i) => (
                        <div
                            key={i}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem 1.25rem',
                                borderBottom:
                                    i < displayTransactions.length - 1
                                        ? '1px solid rgba(255,255,255,0.04)'
                                        : 'none',
                                transition: 'background 0.2s ease',
                            }}
                            className="hover:bg-white/[0.02]"
                        >
                            <div
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 10,
                                    background:
                                        tx.type === 'credit'
                                            ? 'rgba(99,102,241,0.12)'
                                            : 'rgba(239,68,68,0.08)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <CreditCard
                                    className="w-4 h-4"
                                    style={{
                                        color:
                                            tx.type === 'credit'
                                                ? '#8b5cf6'
                                                : '#f87171',
                                    }}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-zinc-200 font-medium truncate">
                                    {tx.label}
                                </p>
                                <p className="text-xs text-zinc-600">{tx.date}</p>
                            </div>
                            <span
                                style={{
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    color:
                                        tx.type === 'credit'
                                            ? '#a78bfa'
                                            : '#f87171',
                                }}
                            >
                                {tx.amount}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── Footer note ─── */}
            <p className="text-center text-xs text-zinc-700">
                All purchases are final · Credits never expire ·{' '}
                <span className="text-indigo-600 cursor-pointer hover:underline">
                    Contact support
                </span>
            </p>
        </div>
    )
}
