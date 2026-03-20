'use client'

import { useState } from 'react'
import { Check, ArrowUpRight, Loader2, Zap, Crown, Star } from 'lucide-react'
import { toast } from 'sonner'

// Simple mapping to solve the serialization issue between Server and Client components
const ICON_MAP = {
    'zap': Zap,
    'crown': Crown,
    'star': Star
}

interface Plan {
    name: string;
    price: string;
    priceDetail: string;
    description: string;
    credits: number;
    features: string[];
    cta: string;
    ctaStyle: string;
    iconName: 'zap' | 'crown' | 'star';
    popular: boolean;
}

interface PlanSelectorProps {
    plans: Plan[];
}

export function PlanSelector({ plans }: PlanSelectorProps) {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

    const handleUpgrade = async (planName: string) => {
        if (planName === 'Starter') return;

        setLoadingPlan(planName)
        try {
            const response = await fetch('/api/payments/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId: planName }),
            })

            const data = await response.json()

            if (data.url) {
                // Redirect user to Chargily checkout page
                window.location.href = data.url
            } else {
                toast.error(data.error || 'Failed to initiate payment')
                setLoadingPlan(null)
            }
        } catch (error) {
            console.error('Payment error:', error)
            toast.error('An unexpected error occurred')
            setLoadingPlan(null)
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
                const Icon = ICON_MAP[plan.iconName] || Zap
                const isCurrent = plan.name === 'Starter'
                const isLoading = loadingPlan === plan.name

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
                                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
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
                                                    color: plan.popular ? '#8b5cf6' : '#52525b',
                                                }}
                                            />
                                        </span>
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleUpgrade(plan.name)}
                                disabled={isCurrent || (loadingPlan !== null && !isLoading)}
                                style={{
                                    width: '100%',
                                    padding: '0.7rem',
                                    borderRadius: 12,
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    cursor: isCurrent ? 'default' : 'pointer',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 6,
                                    transition: 'all 0.2s ease',
                                    opacity: isCurrent || (loadingPlan !== null && !isLoading) ? 0.7 : 1,
                                    ...(plan.ctaStyle === 'primary'
                                        ? {
                                            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                            color: 'white',
                                            boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
                                        }
                                        : plan.ctaStyle === 'gold'
                                            ? {
                                                background: 'linear-gradient(135deg,#d97706,#f59e0b)',
                                                color: '#1a0a00',
                                                boxShadow: '0 8px 24px rgba(217,119,6,0.25)',
                                            }
                                            : {
                                                background: 'rgba(255,255,255,0.05)',
                                                color: '#71717a',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                            }),
                                }}
                                className={!isCurrent ? "hover:scale-[1.02] active:scale-[0.98]" : ""}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                                ) : (
                                    <>
                                        {plan.cta}
                                        {!isCurrent && <ArrowUpRight className="w-3.5 h-3.5" />}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
