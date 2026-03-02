'use client'

import { useState } from 'react'
import { Cross2Icon, PlusIcon } from '@radix-ui/react-icons'
import { addCredits } from '@/app/dashboard/credits/actions'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export function BuyCreditsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [loadingAmount, setLoadingAmount] = useState<number | null>(null)

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
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="w-full max-w-lg bg-zinc-900 border border-white/10 p-6 rounded-2xl shadow-2xl relative z-10 overflow-hidden"
                    >
                        {/* Glow */}
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

                            <div className="border border-white/10 bg-zinc-950/50 rounded-xl p-5 hover:border-indigo-500/50 transition-colors group">
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

                            <div className="border border-purple-500/30 bg-purple-500/5 rounded-xl p-5 relative overflow-hidden group hover:border-purple-500/60 transition-colors">
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
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
