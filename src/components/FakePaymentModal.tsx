'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cross2Icon, CheckIcon, LockClosedIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CreditCard, ShieldCheck, Loader2 } from 'lucide-react'

interface FakePaymentModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    amount: number
    price: string
}

export function FakePaymentModal({ isOpen, onClose, onConfirm, amount, price }: FakePaymentModalProps) {
    const [step, setStep] = useState<'details' | 'processing' | 'success'>('details')

    useEffect(() => {
        if (isOpen) setStep('details')
    }, [isOpen])

    const handlePayment = () => {
        setStep('processing')
        setTimeout(() => {
            setStep('success')
            setTimeout(() => {
                onConfirm()
            }, 2000)
        }, 3000)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                        onClick={step === 'processing' ? undefined : onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden p-8"
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
                                <LockClosedIcon className="text-emerald-500 w-5 h-5" />
                                Secure Checkout
                            </h2>
                            {step !== 'processing' && step !== 'success' && (
                                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition">
                                    <Cross2Icon className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {step === 'details' && (
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div className="bg-white/5 border border-white/5 rounded-3xl p-6 mb-6">
                                    <div className="flex justify-between items-center mb-2 text-sm text-zinc-400">
                                        <span>Items</span>
                                        <span>{amount} Credits</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                        <span className="text-white font-medium">Total</span>
                                        <span className="text-2xl font-bold text-white">{price}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block space-y-2">
                                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Payment Method</span>
                                        <div className="flex items-center gap-4 bg-zinc-900 border border-white/10 p-4 rounded-2xl">
                                            <div className="bg-white/5 p-2 rounded-lg text-zinc-400">
                                                <CreditCard className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-white">•••• •••• •••• 4242</p>
                                                <p className="text-xs text-zinc-500 italic">Simulated payment method</p>
                                            </div>
                                            <div className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded">DEBIT</div>
                                        </div>
                                    </label>

                                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex items-start gap-3">
                                        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                        <div className="text-xs text-zinc-400 leading-relaxed">
                                            This is a secure simulation. No real charges will be applied. Your credits will be added to your account instantly upon confirmation.
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={handlePayment}
                                    className="w-full h-14 bg-white text-black hover:bg-zinc-200 font-black rounded-2xl text-lg shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Confirm & Pay {price}
                                </Button>
                            </motion.div>
                        )}

                        {step === 'processing' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-20 flex flex-col items-center justify-center text-center space-y-6"
                            >
                                <div className="relative">
                                    <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
                                    <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Verifying Transaction</h3>
                                    <p className="text-sm text-zinc-500 mt-2 italic">Securing your credits...</p>
                                </div>
                            </motion.div>
                        )}

                        {step === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-20 flex flex-col items-center justify-center text-center space-y-6"
                            >
                                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                                    <CheckIcon className="w-12 h-12 text-white stroke-[3px]" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-white tracking-tight">Payment Successful!</h3>
                                    <p className="text-sm text-zinc-400">Your {amount} credits are reaching your account.</p>
                                </div>
                            </motion.div>
                        )}

                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 opacity-50">
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <LockClosedIcon className="w-3 h-3" />
                                Encrypted Secure Payment
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
