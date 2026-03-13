'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Mail,
    MessageCircle,
    ShieldCheck,
    HelpCircle,
    ChevronDown,
    Search,
    ExternalLink,
    ArrowRight,
    LifeBuoy,
    MessageSquare
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const faqs = [
    {
        question: "How do I upgrade my plan?",
        answer: "You can upgrade your plan at any time in the Pricing section. Select your preferred tier, and your account will be instantly upgraded with new credits and features."
    },
    {
        question: "What happens to my unused credits?",
        answer: "Credits typically roll over for monthly plans unless specified otherwise. Check your billing details for the specific expiration dates of your current credit balance."
    },
    {
        question: "Is my data secure?",
        answer: "Absolutely. We use enterprise-grade encryption for all data storage and transmission. Your documents and conversations are private and never used for training models without your explicit consent."
    },
    {
        question: "Can I cancel my subscription?",
        answer: "Yes, you can cancel at any time from your Billing dashboard. Your premium features will remain active until the end of your current billing cycle."
    },
    {
        question: "How do I use the PDF analysis feature?",
        answer: "Simply drag and drop a PDF into the chat or click the paperclip icon. Rive AI will parse the document and allow you to ask specific questions about its content."
    }
]

export default function SupportPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [openFaq, setOpenFaq] = useState<number | null>(null)

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-black text-white p-6 lg:p-12 overflow-y-auto custom-scrollbar">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-6xl mx-auto space-y-16">
                {/* Header Section */}
                <header className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest"
                    >
                        <LifeBuoy className="w-3 h-3" />
                        Support Center
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl lg:text-6xl font-black tracking-tighter"
                    >
                        How can we <span className="text-zinc-500">help you?</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-400 text-lg max-w-2xl font-light leading-relaxed"
                    >
                        Our mission is to ensure you have the best experience possible. From technical issues to feature requests, our team is here for you.
                    </motion.p>
                </header>

                {/* Contact Cards Grid */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ContactCard
                        icon={<Mail className="w-6 h-6" />}
                        title="Email Support"
                        description="Direct line to our technical support team."
                        actionText="contact@rive.ai"
                        href="mailto:contact@rive.ai"
                        color="indigo"
                        delay={0.3}
                    />
                    <ContactCard
                        icon={<MessageCircle className="w-6 h-6" />}
                        title="Discord Community"
                        description="Join our community of builders and creators."
                        actionText="Join Discord"
                        href="#"
                        color="purple"
                        delay={0.4}
                    />
                    <ContactCard
                        icon={<ShieldCheck className="w-6 h-6" />}
                        title="Priority Support"
                        description="Dedicated support for enterprise users."
                        actionText="Explore Plans"
                        href="/dashboard/pricing"
                        color="amber"
                        delay={0.5}
                    />
                </section>

                {/* FAQ Section */}
                <section className="space-y-8 pt-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
                            <p className="text-zinc-500 text-sm">Quick answers to common inquiries.</p>
                        </div>
                        <div className="relative w-full md:w-80 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                            <Input
                                placeholder="Search questions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-zinc-900/50 border-white/5 pl-10 h-11 rounded-xl focus:ring-indigo-500/20 backdrop-blur-md transition-all font-light"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map((faq, index) => (
                                <FaqItem
                                    key={index}
                                    faq={faq}
                                    isOpen={openFaq === index}
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                />
                            ))
                        ) : (
                            <div className="py-12 text-center text-zinc-500 font-light border border-white/5 border-dashed rounded-3xl">
                                No questions found matching "{searchQuery}"
                            </div>
                        )}
                    </div>
                </section>

                {/* Footer Status Section */}
                <section className="pt-20 border-t border-white/5">
                    <div className="p-8 rounded-[2rem] bg-gradient-to-r from-zinc-900/50 to-black border border-white/5 backdrop-blur-3xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold tracking-tight">System Status: <span className="text-emerald-400">Operational</span></h3>
                                <p className="text-zinc-500 text-sm font-light">All systems are currently running smoothly.</p>
                            </div>
                        </div>
                        <Button variant="outline" className="h-12 px-6 rounded-xl border-white/10 hover:bg-white/5 gap-2 group transition-all">
                            View Status Page <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                        </Button>
                    </div>
                </section>
            </div>
        </div>
    )
}

function ContactCard({ icon, title, description, actionText, href, color, delay }: any) {
    const colors: any = {
        indigo: "from-indigo-500/20 to-indigo-500/5 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10 shadow-indigo-500/5",
        purple: "from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-400 hover:bg-purple-500/10 shadow-purple-500/5",
        amber: "from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400 hover:bg-amber-500/10 shadow-amber-500/5"
    }

    return (
        <motion.a
            href={href}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={cn(
                "p-8 rounded-[2rem] bg-gradient-to-br border backdrop-blur-3xl flex flex-col items-start gap-6 transition-all transform hover:-translate-y-2 group shadow-2xl relative overflow-hidden",
                colors[color]
            )}
        >
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                {icon}
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed font-light">{description}</p>
            </div>
            <div className="mt-4 flex items-center gap-2 font-bold text-sm tracking-wide group-hover:gap-3 transition-all">
                {actionText} <ArrowRight className="w-4 h-4" />
            </div>
        </motion.a>
    )
}

function FaqItem({ faq, isOpen, onClick }: any) {
    return (
        <div className="group border-b border-white/5 last:border-0 transition-all">
            <button
                onClick={onClick}
                className="w-full py-6 flex items-center justify-between text-left group"
            >
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-2 h-2 rounded-full transition-all duration-500",
                        isOpen ? "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "bg-zinc-700 group-hover:bg-zinc-500"
                    )} />
                    <span className={cn(
                        "text-lg font-medium transition-colors duration-300",
                        isOpen ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                    )}>
                        {faq.question}
                    </span>
                </div>
                <ChevronDown className={cn(
                    "w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-all duration-500",
                    isOpen ? "rotate-180 text-indigo-400" : ""
                )} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", damping: 30, stiffness: 200 }}
                        className="overflow-hidden"
                    >
                        <div className="pb-8 pl-6 text-zinc-500 font-light leading-relaxed max-w-3xl">
                            {faq.answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
