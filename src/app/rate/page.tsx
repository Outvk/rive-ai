"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, MessageSquare, Send, CheckCircle2, QrCode } from 'lucide-react'
import { FaInstagram, FaWhatsapp } from 'react-icons/fa'
import { SiGmail } from 'react-icons/si'
import { cn } from '@/lib/utils'
import { submitFeedback } from './actions'
import Silk from '@/components/ui/Silk'

export default function RatePage() {
    const [rating, setRating] = useState<number>(0)
    const [hover, setHover] = useState<number>(0)
    const [comment, setComment] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (rating === 0) return

        setLoading(true)
        setError(null)

        const result = await submitFeedback(rating, comment)
        
        setLoading(false)
        if (result.success) {
            setSubmitted(true)
        } else {
            setError(result.error || "An unexpected error occurred.")
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Silk speed={0.5} scale={1.2} />
                </div>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/10 p-12 rounded-[2.5rem] text-center relative z-10 overflow-hidden group shadow-2xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-[#7405FF]/10 via-transparent to-transparent opacity-50" />
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-[#7405FF]/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(116,5,255,0.3)]">
                            <CheckCircle2 className="w-10 h-10 text-[#C190FF]" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">Merci beaucoup !</h2>
                        <p className="text-zinc-400 mb-6 leading-relaxed">
                            Votre avis nous permet de construire le futur du web. Nous apprécions votre honnêteté !
                        </p>
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center p-6 font-sans overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Silk speed={0.5} scale={1.2} />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full bg-black/95 backdrop-blur-3xl border border-white/10 p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            >
                <div className="relative z-10">
                    <div className="flex flex-col items-center mb-12">
                        <div className="w-40 h-40 flex items-center justify-center mb-4 drop-shadow-[0_0_20px_rgba(116,5,255,0.3)]">
                            <img src="/Comp-2.gif" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Évaluez votre expérience</h1>
                        <p className="text-zinc-500 text-center max-w-sm">
                            Comment décririez-vous votre impression avec Rive AI jusqu&apos;à présent ?
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-12">
                        <div className="space-y-6">
                            <div className="flex justify-between text-zinc-500 text-xs uppercase tracking-widest px-2">
                                <span>Débutant</span>
                                <span>Élite</span>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
                                {[...Array(10)].map((_, i) => {
                                    const value = i + 1
                                    const isActive = (hover || rating) >= value
                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setRating(value)}
                                            onMouseEnter={() => setHover(value)}
                                            onMouseLeave={() => setHover(0)}
                                            className={cn(
                                                "w-10 h-10 md:w-12 md:h-12 rounded-xl border flex items-center justify-center text-sm md:text-lg font-bold transition-all duration-300 transform",
                                                isActive 
                                                    ? "bg-[#7405FF] border-[#C190FF] text-white shadow-[0_0_20px_rgba(116,5,255,0.4)] scale-110" 
                                                    : "bg-white/5 border-white/10 text-zinc-500 hover:border-white/30"
                                            )}
                                        >
                                            {value}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-white text-sm font-medium flex items-center gap-2 px-1">
                                <MessageSquare className="w-4 h-4 text-[#C190FF]" />
                                Vos impressions
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Dites-nous ce que vous aimez ou ce que nous pouvons améliorer..."
                                className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder-zinc-600 focus:outline-none focus:border-[#7405FF]/50 focus:ring-4 focus:ring-[#7405FF]/10 transition-all resize-none font-sans"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm mb-4">
                                Une erreur est survenue lors de l&apos;envoi de votre avis.
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={rating === 0 || loading}
                            className={cn(
                                "w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all duration-500 relative group overflow-hidden",
                                rating > 0 
                                    ? "bg-gradient-to-r from-[#7405FF] to-[#C190FF] text-white" 
                                    : "bg-white/5 text-zinc-600 cursor-not-allowed"
                            )}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Envoyer mon avis</span>
                                    <Send className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                </>
                            )}
                        </button>
                    </form>
                    <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center">
                        <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase tracking-widest mb-6 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                            <QrCode className="w-3 h-3 text-[#C190FF]" />
                            Partagez la page d&apos;évaluation
                        </div>
                        <div className="bg-white p-2 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:scale-110 transition-transform cursor-pointer">
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                                    typeof window !== 'undefined' 
                                        ? (window.location.hostname === 'localhost' ? 'https://rive-ai.vercel.app/rate' : window.location.href)
                                        : 'https://rive-ai.vercel.app/rate'
                                )}`} 
                                alt="QR Code"
                                className="w-40 h-40"
                            />
                        </div>
                        <p className="text-zinc-600 text-[10px] mt-4 uppercase tracking-[0.2em]">Scannez pour partager l&apos;expérience</p>
                    </div>

                    {/* Social Links Section */}
                    <div className="mt-8 pt-8 border-t border-white/5 w-full">
                        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] text-center mb-6">Contactez-nous</p>
                        <div className="flex justify-center items-center gap-6">
                            <a 
                                href="https://www.instagram.com/out_vk/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-pink-500/50 hover:bg-pink-500/10 transition-all duration-300 group"
                                title="Instagram"
                            >
                                <FaInstagram className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            </a>
                            <a 
                                href="https://wa.me/213555204591" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-green-500/50 hover:bg-green-500/10 transition-all duration-300 group"
                                title="WhatsApp"
                            >
                                <FaWhatsapp className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            </a>
                            <a 
                                href="https://mail.google.com/mail/?view=cm&fs=1&to=chouaibkhezrouni0007@gmail.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-300 group"
                                title="Gmail"
                            >
                                <SiGmail className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            </a>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
