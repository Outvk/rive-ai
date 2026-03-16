'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
    Shield,
    Lock,
    ShieldAlert,
    Fingerprint,
    EyeOff,
    Key,
    CheckCircle2,
    Globe,
    Zap,
    AlertCircle
} from 'lucide-react'
import { cn } from "@/lib/utils"

export default function SecurityPage() {
    return (
        <div className="min-h-screen bg-black text-white p-6 lg:p-12 overflow-y-auto custom-scrollbar">
            {/* Ambient Security Glows */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[20%] right-[-5%] w-[35%] h-[35%] bg-indigo-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] left-[-5%] w-[35%] h-[35%] bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-6xl mx-auto space-y-20">
                {/* Header Section */}
                <header className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em]"
                    >
                        <Shield className="w-3.5 h-3.5" />
                        Enterprise Grade Security
                    </motion.div>
                    <div className="space-y-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-6xl lg:text-7xl font-black tracking-tighter"
                        >
                            The Rive <span className="text-zinc-600">Vault.</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-zinc-400 text-xl max-w-3xl font-light leading-relaxed"
                        >
                            Your data integrity is our highest priority. We employ multi-layered security protocols to ensure your information remains private, secure, and under your control.
                        </motion.p>
                    </div>
                </header>

                {/* Core Security Metrics */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        icon={<Lock className="w-5 h-5" />}
                        label="ENCRYPTION"
                        value="AES-256"
                        subValue="At rest & in transit"
                        color="indigo"
                        delay={0.2}
                    />
                    <MetricCard
                        icon={<Globe className="w-5 h-5" />}
                        label="NETWORK"
                        value="SSL/TLS 1.3"
                        subValue="End-to-end security"
                        color="blue"
                        delay={0.3}
                    />
                    <MetricCard
                        icon={<CheckCircle2 className="w-5 h-5" />}
                        label="AVAILABILITY"
                        value="99.99%"
                        subValue="Uptime guarantee"
                        color="emerald"
                        delay={0.4}
                    />
                    <MetricCard
                        icon={<ShieldAlert className="w-5 h-5" />}
                        label="MONITORING"
                        value="24/7"
                        subValue="Threat detection"
                        color="purple"
                        delay={0.5}
                    />
                </section>

                {/* Detailed Security Pillars */}
                <section className="space-y-12">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-3xl font-bold tracking-tight">Safety Framework</h2>
                        <div className="h-1 w-20 bg-indigo-500 rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <SecurityPillar
                            title="Data Privacy & Isolation"
                            description="All user data is logically isolated. Your conversations and uploaded documents are stored in dedicated encrypted volumes, ensuring no cross-contamination or unauthorized access."
                            icon={<Fingerprint className="w-6 h-6" />}
                            features={["Multi-tenant isolation", "End-to-end encryption", "Zero-access architecture"]}
                            delay={0.6}
                        />
                        <SecurityPillar
                            title="AI Safety & Guardrails"
                            description="We implement strict moderation layers to prevent harmful content generation. Our AI models are continuously audited for bias and safety compliance."
                            icon={<EyeOff className="w-6 h-6" />}
                            features={["Real-time filtering", "Model audit logs", "PII redaction"]}
                            delay={0.7}
                        />
                        <SecurityPillar
                            title="Identity & Access"
                            description="Industry-standard authentication via Supabase and OAuth 2.0. We support multi-factor authentication and session monitoring for all accounts."
                            icon={<Key className="w-6 h-6" />}
                            features={["JWT-based auth", "MFA/2FA support", "Secure session tokens"]}
                            delay={0.8}
                        />
                        <SecurityPillar
                            title="Compliance & Governance"
                            description="Rive adheres to global data protection regulations. We maintain internal policies aligned with SOC2 and GDPR standards."
                            icon={<Shield className="w-6 h-6" />}
                            features={["GDPR ready", "SOC2 compliance track", "Internal data audits"]}
                            delay={0.9}
                        />
                    </div>
                </section>

                {/* Infrastructure Trust Section */}
                <section className="pt-10">
                    <div className="p-12 rounded-[3rem] bg-zinc-900/10 border border-white/5 backdrop-blur-3xl relative overflow-hidden group hover:border-white/10 transition-all duration-700">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/[0.03] rounded-full blur-[120px] pointer-events-none group-hover:bg-indigo-500/[0.05] transition-all" />

                        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                            <div className="lg:w-1/2 space-y-6">
                                <h3 className="text-4xl font-bold tracking-tight leading-none italic">Hardened Infrastructure.</h3>
                                <p className="text-zinc-500 text-lg font-light leading-relaxed">
                                    Our platform is hosted on world-class cloud providers (AWS/Vercel) with restricted physical access and continuous security auditing.
                                </p>
                                <div className="flex flex-wrap gap-4 pt-4">
                                    <Badge label="SSL Certified" />
                                    <Badge label="AES Encrypted" />
                                    <Badge label="DDoS Protected" />
                                    <Badge label="ISO Aligned" />
                                </div>
                            </div>

                            <div className="lg:w-1/2 w-full space-y-4">
                                <StatusRow label="API Security" value="Hardened" icon={<Zap className="w-4 h-4 text-amber-500" />} />
                                <StatusRow label="Database" value="Isolated" icon={<Lock className="w-4 h-4 text-indigo-500" />} />
                                <StatusRow label="Backups" value="Redundant" icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />} />
                                <StatusRow label="Safety Audit" value="Daily" icon={<AlertCircle className="w-4 h-4 text-purple-500" />} />
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="text-center pt-20 pb-10">
                    <p className="text-zinc-600 text-xs font-medium uppercase tracking-[0.3em]">Built for Trust. Designed for Safety.</p>
                </footer>
            </div>
        </div>
    )
}

function MetricCard({ icon, label, value, subValue, color, delay }: any) {
    const colorStyles: any = {
        indigo: "text-indigo-400 bg-indigo-500/5 border-indigo-500/10",
        blue: "text-blue-400 bg-blue-500/5 border-blue-500/10",
        emerald: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10",
        purple: "text-purple-400 bg-purple-500/5 border-purple-500/10"
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="p-8 rounded-[2rem] bg-zinc-900/20 border border-white/5 backdrop-blur-xl flex flex-col gap-6 relative overflow-hidden group hover:bg-zinc-900/30 hover:border-white/10 transition-all shadow-2xl"
        >
            <div className={cn("p-3 rounded-2xl border w-fit group-hover:scale-110 transition-transform duration-500", colorStyles[color])}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-bold text-zinc-600 tracking-[0.2em] mb-1">{label}</p>
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-xs text-zinc-500 mt-1 font-light">{subValue}</p>
            </div>
        </motion.div>
    )
}

function SecurityPillar({ title, description, icon, features, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="p-10 rounded-[2.5rem] bg-gradient-to-br from-zinc-900/40 to-black border border-white/5 backdrop-blur-3xl hover:border-white/20 transition-all group"
        >
            <div className="flex items-center gap-6 mb-8">
                <div className="p-4 rounded-2xl bg-zinc-800/50 border border-white/10 group-hover:rotate-[360deg] transition-all duration-[1500ms]">
                    {icon}
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-white">{title}</h3>
            </div>
            <p className="text-zinc-500 leading-relaxed font-light mb-8 h-20 overflow-hidden line-clamp-3">
                {description}
            </p>
            <div className="flex flex-col gap-3">
                {features.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3">
                        <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                        <span className="text-xs font-medium text-zinc-400 tracking-wide">{feature}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}

function Badge({ label }: { label: string }) {
    return (
        <span className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:bg-white/[0.07] hover:text-white transition-all cursor-default">
            {label}
        </span>
    )
}

function StatusRow({ label, value, icon }: any) {
    return (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] transition-all group">
            <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <span className="text-sm font-medium text-zinc-300">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-xs font-bold text-emerald-400 tracking-tighter uppercase">{value}</span>
            </div>
        </div>
    )
}
