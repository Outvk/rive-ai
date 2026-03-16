'use client'

import { useState } from 'react'
import { Cross2Icon, PlusIcon } from '@radix-ui/react-icons'
import { addCredits } from '@/app/dashboard/credits/actions'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { useSidebar } from '@/components/SidebarContext'
import * as PricingCard from '@/components/ui/pricing-card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Zap, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FakePaymentModal } from './FakePaymentModal'

export function BuyCreditsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [loadingAmount, setLoadingAmount] = useState<number | null>(null)
    const { sidebarVersion } = useSidebar()

    // Payment State
    const [isPaymentOpen, setIsPaymentOpen] = useState(false)
    const [pendingPackage, setPendingPackage] = useState<{ amount: number, price: string } | null>(null)

    async function handleBuy(amount: number) {
        setLoadingAmount(amount)
        try {
            const res = await addCredits(amount)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success(`Successfully added ${amount} credits to your account!`)
                onClose()
            }
        } catch {
            toast.error('Failed to add credits.')
        } finally {
            setLoadingAmount(null)
            setIsPaymentOpen(false)
            setPendingPackage(null)
        }
    }

    const startPayment = (amount: number, price: string) => {
        if (sidebarVersion === 'v2') {
            setPendingPackage({ amount, price })
            setIsPaymentOpen(true)
        } else {
            handleBuy(amount)
        }
    }

    return (
        <>
            <AnimatePresence>
                {isOpen && !isPaymentOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={onClose}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className={cn(
                                "w-full relative z-10 overflow-hidden",
                                sidebarVersion === 'v2' ? "max-w-3xl" : "max-w-lg bg-zinc-900 border border-white/10 p-6 rounded-2xl shadow-2xl"
                            )}
                        >
                            {sidebarVersion === 'v2' ? (
                                <div className="bg-zinc-950/50 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl relative overflow-hidden">
                                    {/* Glow Decoration */}
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

                                    <div className="flex justify-between items-start mb-10 relative">
                                        <div>
                                            <h2 className="text-2xl font-semibold text-white tracking-tight">Purchase Credits</h2>
                                            <p className="text-sm text-zinc-400 mt-1">Select a package to fuel your creativity.</p>
                                        </div>
                                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition">
                                            <Cross2Icon className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                                        {/* Starter Plan */}
                                        <PricingCard.Card className="max-w-none bg-zinc-900/40 border-none shadow-none">
                                            <PricingCard.Header className="bg-white/[0.03] border-none shadow-none" glassEffect={false}>
                                                <PricingCard.Plan>
                                                    <PricingCard.PlanName>
                                                        <Zap className="text-indigo-400" />
                                                        <span className="text-zinc-300">Starter Pack</span>
                                                    </PricingCard.PlanName>
                                                    <PricingCard.Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">Lite</PricingCard.Badge>
                                                </PricingCard.Plan>
                                                <PricingCard.Price>
                                                    <PricingCard.MainPrice className="text-white">$5</PricingCard.MainPrice>
                                                    <PricingCard.Period className="text-zinc-500">one-time</PricingCard.Period>
                                                </PricingCard.Price>
                                                <Button
                                                    onClick={() => startPayment(10, '$5.00')}
                                                    disabled={loadingAmount !== null}
                                                    className="w-full bg-white text-black hover:bg-zinc-200 font-bold rounded-xl h-11 transition-all"
                                                >
                                                    {loadingAmount === 10 ? 'Processing...' : 'Buy 10 Credits'}
                                                </Button>
                                            </PricingCard.Header>
                                            <PricingCard.Body>
                                                <PricingCard.List>
                                                    <PricingCard.ListItem className="text-zinc-400">
                                                        <CheckCircle2 className="h-4 w-4 text-indigo-400 mt-0.5" />
                                                        <span>10 Generation Credits</span>
                                                    </PricingCard.ListItem>
                                                    <PricingCard.ListItem className="text-zinc-400">
                                                        <CheckCircle2 className="h-4 w-4 text-indigo-400 mt-0.5" />
                                                        <span>All AI Models Included</span>
                                                    </PricingCard.ListItem>
                                                </PricingCard.List>
                                            </PricingCard.Body>
                                        </PricingCard.Card>

                                        {/* Professional Plan */}
                                        <PricingCard.Card className="max-w-none bg-zinc-900/40 border-none shadow-none">
                                            <PricingCard.Header className="bg-indigo-500/[0.03] border-none shadow-none" glassEffect={false}>
                                                <PricingCard.Plan>
                                                    <PricingCard.PlanName>
                                                        <Star className="text-amber-400" />
                                                        <span className="text-zinc-300">Power Pack</span>
                                                    </PricingCard.PlanName>
                                                    <PricingCard.Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] font-black">POPULAR</PricingCard.Badge>
                                                </PricingCard.Plan>
                                                <PricingCard.Price>
                                                    <PricingCard.MainPrice className="text-white">$20</PricingCard.MainPrice>
                                                    <PricingCard.Period className="text-zinc-500">one-time</PricingCard.Period>
                                                    <PricingCard.OriginalPrice className="text-zinc-600 ml-auto">$25</PricingCard.OriginalPrice>
                                                </PricingCard.Price>
                                                <Button
                                                    onClick={() => startPayment(50, '$20.00')}
                                                    disabled={loadingAmount !== null}
                                                    className="w-full bg-indigo-600 text-white hover:bg-indigo-500 font-bold rounded-xl h-11 shadow-lg shadow-indigo-500/30 transition-all"
                                                >
                                                    {loadingAmount === 50 ? 'Processing...' : 'Buy 50 Credits'}
                                                </Button>
                                            </PricingCard.Header>
                                            <PricingCard.Body>
                                                <PricingCard.List>
                                                    <PricingCard.ListItem className="text-zinc-400 text-sm">
                                                        <CheckCircle2 className="h-4 w-4 text-amber-400 mt-0.5" />
                                                        <span>50 Generation Credits</span>
                                                    </PricingCard.ListItem>
                                                    <PricingCard.ListItem className="text-zinc-400 text-sm">
                                                        <CheckCircle2 className="h-4 w-4 text-amber-400 mt-0.5" />
                                                        <span>Priority Processing</span>
                                                    </PricingCard.ListItem>
                                                    <PricingCard.ListItem className="text-zinc-400 text-sm">
                                                        <CheckCircle2 className="h-4 w-4 text-amber-400 mt-0.5" />
                                                        <span>24/7 Premium Support</span>
                                                    </PricingCard.ListItem>
                                                </PricingCard.List>
                                            </PricingCard.Body>
                                        </PricingCard.Card>
                                    </div>

                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mt-10 text-center">
                                        Safe & Secure Checkout • Instant Delivery
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Legacy design (V1) */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-xl font-semibold text-zinc-100">Add Credits</h2>
                                            <p className="text-sm text-zinc-400 mt-1">Purchase more credits to generate AI content.</p>
                                        </div>
                                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition">
                                            <Cross2Icon className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="border-none bg-zinc-950/50 rounded-xl p-5 hover:bg-zinc-900 transition-colors group">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-2xl font-bold text-white">10<span className="text-sm font-normal text-zinc-400 ml-1">credits</span></span>
                                                <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2 py-1 rounded-md font-medium border border-indigo-500/20">Starter</span>
                                            </div>
                                            <div className="text-3xl font-bold text-white mb-6">$5<span className="text-sm font-normal text-zinc-500">.00</span></div>
                                            <button
                                                onClick={() => handleBuy(10)}
                                                disabled={loadingAmount !== null}
                                                className="w-full flex items-center justify-center gap-2 bg-zinc-100 hover:bg-white text-zinc-900 font-medium py-2 rounded-lg transition disabled:opacity-50"
                                            >
                                                {loadingAmount === 10 ? 'Processing...' : <><PlusIcon /> Buy 10 Credits</>}
                                            </button>
                                        </div>

                                        <div className="border-none bg-purple-500/5 rounded-xl p-5 relative overflow-hidden group hover:bg-purple-500/10 transition-colors">
                                            <div className="absolute top-0 right-0 px-2 py-0.5 bg-purple-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-bl-lg">Popular</div>
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-2xl font-bold text-white">50<span className="text-sm font-normal text-zinc-400 ml-1">credits</span></span>
                                            </div>
                                            <div className="text-3xl font-bold text-white mb-6">$20<span className="text-sm font-normal text-zinc-500">.00</span></div>
                                            <button
                                                onClick={() => handleBuy(50)}
                                                disabled={loadingAmount !== null}
                                                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 rounded-lg transition shadow-[0_0_15px_rgba(168,85,247,0.4)] disabled:opacity-50"
                                            >
                                                {loadingAmount === 50 ? 'Processing...' : <><PlusIcon /> Buy 50 Credits</>}
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-xs text-zinc-500 mt-6 text-center">
                                        This is a simulation. No real money will be charged.
                                    </p>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {pendingPackage && (
                <FakePaymentModal
                    isOpen={isPaymentOpen}
                    onClose={() => {
                        setIsPaymentOpen(false)
                        setPendingPackage(null)
                    }}
                    onConfirm={() => handleBuy(pendingPackage.amount)}
                    amount={pendingPackage.amount}
                    price={pendingPackage.price}
                />
            )}
        </>
    )
}
