import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
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
import { Mastercard, GoldCard } from '@/components/BillingCards'

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
        icon: Zap,
        popular: false,
    },
    {
        name: 'Pro',
        price: '$12',
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
        icon: Crown,
        popular: true,
    },
    {
        name: 'Ultra',
        price: '$39',
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
        icon: Star,
        popular: false,
    },
]

const transactions = [
    { label: 'Credits Purchased', amount: '+200', date: 'Mar 5, 2026', type: 'credit' },
    { label: 'Image Generation', amount: '-12', date: 'Mar 4, 2026', type: 'debit' },
    { label: 'Text to Speech', amount: '-8', date: 'Mar 3, 2026', type: 'debit' },
    { label: 'Welcome Bonus', amount: '+50', date: 'Mar 1, 2026', type: 'credit' },
]

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
    const maxCredits = 500
    const creditPct = Math.min((credits / maxCredits) * 100, 100)
    const circumference = 2 * Math.PI * 52
    const strokeDashoffset = circumference - (creditPct / 100) * circumference

    return (
        <div className="max-w-6xl mx-auto space-y-16 fade-in pb-24 px-4">

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
                <div
                    style={{
                        background:
                            'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.06) 100%)',
                        border: '1px solid rgba(99,102,241,0.2)',
                        borderRadius: '20px',
                        padding: '2rem',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* Glow */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '-40px',
                            right: '-40px',
                            width: '200px',
                            height: '200px',
                            borderRadius: '50%',
                            background:
                                'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
                            pointerEvents: 'none',
                        }}
                    />

                    <div className="flex items-start gap-6 relative z-10">
                        {/* Ring */}
                        <div style={{ flexShrink: 0, width: 110, height: 110, position: 'relative' }}>
                            <svg
                                width="110"
                                height="110"
                                viewBox="0 0 120 120"
                                style={{ transform: 'rotate(-90deg)' }}
                            >
                                <defs>
                                    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#a855f7" />
                                    </linearGradient>
                                </defs>
                                <circle
                                    cx="60" cy="60" r="52"
                                    fill="none"
                                    stroke="rgba(99,102,241,0.12)"
                                    strokeWidth="10"
                                />
                                <circle
                                    cx="60" cy="60" r="52"
                                    fill="none"
                                    stroke="url(#ringGrad)"
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    style={{
                                        filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.8))',
                                        transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,.2,.2,1)',
                                    }}
                                />
                            </svg>
                            {/* Center text */}
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 2,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: '1.6rem',
                                        fontWeight: 800,
                                        color: 'white',
                                        lineHeight: 1,
                                    }}
                                >
                                    {credits}
                                </span>
                                <span
                                    style={{
                                        fontSize: '0.6rem',
                                        color: '#a855f7',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                        fontWeight: 600,
                                    }}
                                >
                                    credits
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-1">
                                Available Balance
                            </p>
                            <p className="text-zinc-300 text-sm leading-relaxed mb-5">
                                Credits power every generation — text, images, audio & video.
                                Purchase more and never miss a moment of creativity.
                            </p>

                            <div className="flex items-center gap-3 flex-wrap">
                                <button
                                    style={{
                                        background:
                                            'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                        color: 'white',
                                        padding: '0.6rem 1.4rem',
                                        borderRadius: '12px',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        border: 'none',
                                        cursor: 'pointer',
                                        boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        transition: 'all 0.2s ease',
                                    }}
                                    className="hover:opacity-90 hover:-translate-y-0.5"
                                >
                                    <Gift className="w-3.5 h-3.5" />
                                    Purchase Credits
                                </button>
                                <button
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        color: '#a1a1aa',
                                        padding: '0.6rem 1.2rem',
                                        borderRadius: '12px',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        transition: 'all 0.2s ease',
                                    }}
                                    className="hover:bg-white/10 hover:text-white"
                                >
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    History
                                </button>
                            </div>
                        </div>
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
                    }}
                >
                    <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">
                        Your Cards
                    </p>
                    <div className="flex flex-wrap gap-4 items-center justify-center py-2">
                        <div className="transition-transform duration-500 hover:scale-105 hover:-rotate-2">
                            <Mastercard />
                        </div>
                        <div className="transition-transform duration-500 hover:scale-105 hover:rotate-2">
                            <GoldCard />
                        </div>
                    </div>
                    <p className="text-center text-xs text-zinc-600">
                        Hover cards to flip &amp; see details
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
                    <span
                        style={{
                            background:
                                'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(168,85,247,0.1))',
                            border: '1px solid rgba(99,102,241,0.25)',
                            color: '#a855f7',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '4px 12px',
                            borderRadius: '100px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                        }}
                    >
                        Save 20% annually
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {plans.map((plan) => {
                        const Icon = plan.icon
                        return (
                            <div
                                key={plan.name}
                                style={{
                                    borderRadius: '20px',
                                    padding: plan.popular ? '2px' : '1px',
                                    background: plan.popular
                                        ? 'linear-gradient(135deg, #6366f1, #a855f7)'
                                        : 'rgba(255,255,255,0.06)',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    boxShadow: plan.popular
                                        ? '0 0 40px rgba(99,102,241,0.2)'
                                        : 'none',
                                    position: 'relative',
                                }}
                                className="hover:-translate-y-1.5"
                            >
                                {plan.popular && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '-12px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            background:
                                                'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                            color: 'white',
                                            fontSize: '0.6rem',
                                            fontWeight: 700,
                                            padding: '4px 14px',
                                            borderRadius: '100px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            boxShadow: '0 4px 16px rgba(99,102,241,0.5)',
                                            whiteSpace: 'nowrap',
                                            zIndex: 10,
                                        }}
                                    >
                                        ✦ Most Popular
                                    </div>
                                )}

                                <div
                                    style={{
                                        background: plan.popular
                                            ? 'linear-gradient(170deg,#13112a 0%,#1a1035 100%)'
                                            : '#0d0d14',
                                        borderRadius: '18px',
                                        padding: '1.8rem',
                                        height: '100%',
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {plan.popular && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                background:
                                                    'radial-gradient(ellipse at 30% 10%,rgba(99,102,241,0.12) 0%,transparent 60%)',
                                                pointerEvents: 'none',
                                            }}
                                        />
                                    )}

                                    <div
                                        style={{
                                            width: 38,
                                            height: 38,
                                            borderRadius: 12,
                                            background: plan.popular
                                                ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                                                : 'rgba(255,255,255,0.06)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: '1.2rem',
                                        }}
                                    >
                                        <Icon
                                            className="w-4 h-4"
                                            style={{
                                                color: plan.popular
                                                    ? 'white'
                                                    : plan.name === 'Ultra'
                                                        ? '#f59e0b'
                                                        : '#71717a',
                                            }}
                                        />
                                    </div>

                                    <div className="mb-1">
                                        <span className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">
                                            {plan.name}
                                        </span>
                                    </div>

                                    <div className="flex items-baseline gap-1 mb-1">
                                        <span
                                            style={{
                                                fontSize: '2.2rem',
                                                fontWeight: 800,
                                                color: plan.popular ? '#a78bfa' : 'white',
                                                lineHeight: 1,
                                            }}
                                        >
                                            {plan.price}
                                        </span>
                                        <span className="text-zinc-500 text-sm">
                                            {plan.priceDetail}
                                        </span>
                                    </div>

                                    <p className="text-zinc-500 text-xs leading-relaxed mb-5">
                                        {plan.description}
                                    </p>

                                    <ul className="space-y-2.5 mb-6">
                                        {plan.features.map((f) => (
                                            <li
                                                key={f}
                                                className="flex items-center gap-2.5 text-xs text-zinc-300"
                                            >
                                                <span
                                                    style={{
                                                        width: 16,
                                                        height: 16,
                                                        borderRadius: '50%',
                                                        background: plan.popular
                                                            ? 'rgba(99,102,241,0.2)'
                                                            : 'rgba(255,255,255,0.05)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <Check
                                                        className="w-2.5 h-2.5"
                                                        style={{
                                                            color: plan.popular
                                                                ? '#8b5cf6'
                                                                : '#52525b',
                                                        }}
                                                    />
                                                </span>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        style={{
                                            width: '100%',
                                            padding: '0.7rem',
                                            borderRadius: 12,
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            border: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 6,
                                            transition: 'all 0.2s ease',
                                            ...(plan.ctaStyle === 'primary'
                                                ? {
                                                    background:
                                                        'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                                    color: 'white',
                                                    boxShadow:
                                                        '0 8px 24px rgba(99,102,241,0.3)',
                                                }
                                                : plan.ctaStyle === 'gold'
                                                    ? {
                                                        background:
                                                            'linear-gradient(135deg,#d97706,#f59e0b)',
                                                        color: '#1a0a00',
                                                        boxShadow:
                                                            '0 8px 24px rgba(217,119,6,0.25)',
                                                    }
                                                    : {
                                                        background:
                                                            'rgba(255,255,255,0.05)',
                                                        color: '#71717a',
                                                        border: '1px solid rgba(255,255,255,0.08)',
                                                    }),
                                        }}
                                    >
                                        {plan.cta}
                                        {plan.ctaStyle !== 'ghost' && (
                                            <ArrowUpRight className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
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
                    {transactions.map((tx, i) => (
                        <div
                            key={i}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem 1.25rem',
                                borderBottom:
                                    i < transactions.length - 1
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
