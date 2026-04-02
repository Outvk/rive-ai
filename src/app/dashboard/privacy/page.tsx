import { LockClosedIcon } from '@radix-ui/react-icons'
import { ShieldCheckIcon, EyeIcon, FileTextIcon, BellIcon, DatabaseIcon, ServerIcon, KeyIcon, DownloadIcon, UserXIcon } from 'lucide-react'

export const metadata = {
    title: 'Privacy Policy - Rive AI',
    description: 'Understand how we protect and manage your data.',
}

export default function PrivacyPolicyPage() {
    return (
        <div className="max-w-5xl mx-auto pb-24 px-4 sm:px-6 lg:px-8 mt-4 space-y-16 fade-in custom-scrollbar">
            
            {/* Header / Hero */}
            <div className="text-center space-y-6 relative pt-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-zinc-900/50 border border-white/5 shadow-xl mb-4 text-indigo-400 ring-1 ring-indigo-500/20">
                    <LockClosedIcon className="w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-500 tracking-tight">
                    Privacy & Data Policy
                </h1>
                <p className="text-lg text-zinc-400 max-w-2xl mx-auto font-medium">
                    We believe your data belongs to you. This policy outlines exactly how we handle, protect, and manage your information at Rive AI.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 mt-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold tracking-widest uppercase text-indigo-300">
                    Last Updated: March 18, 2026
                </div>
            </div>

            {/* Core Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <div className="p-6 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-indigo-500/30 transition-all duration-500 hover:bg-zinc-800/50 group">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                        <ShieldCheckIcon className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-100 mb-2">Bank-Grade Security</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">Your data is encrypted at rest and in transit using military-grade encryption.</p>
                </div>
                <div className="p-6 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-violet-500/30 transition-all duration-500 hover:bg-zinc-800/50 group">
                    <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                        <EyeIcon className="w-6 h-6 text-violet-400" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-100 mb-2">Absolute Privacy</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">We never sell your data to third parties. Your prompts and generated content remain strictly yours.</p>
                </div>
                <div className="p-6 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-emerald-500/30 transition-all duration-500 hover:bg-zinc-800/50 group">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                        <DatabaseIcon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-100 mb-2">Data Sovereignty</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">You retain full rights to delete, export, or modify your generated assets at any given time.</p>
                </div>
            </div>

            {/* Detailed Sections */}
            <div className="space-y-8">
                
                {/* Information We Collect */}
                <div className="p-8 md:p-10 rounded-[2rem] bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 backdrop-blur-md border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors duration-500">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] group-hover:bg-blue-500/10 transition-colors duration-700" />
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-zinc-800/80 rounded-2xl border border-white/10 shadow-lg">
                            <ServerIcon className="w-6 h-6 text-zinc-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">1. Information We Collect</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="space-y-6 text-zinc-400 text-sm leading-relaxed">
                            <p>To provide our advanced AI generation services, we need to collect specific operational data. We practice data minimization, meaning we only collect what is absolutely strictly necessary to keep our services running flawlessly.</p>
                            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-sm hover:bg-zinc-900/50 transition-colors">
                                <h4 className="text-white font-semibold mb-2">Account Data</h4>
                                <p>Your name, email address, password hash, and basic profile preferences provided during onboarding.</p>
                            </div>
                        </div>
                        <div className="space-y-6 text-zinc-400 text-sm leading-relaxed">
                            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-sm hover:bg-zinc-900/50 transition-colors">
                                <h4 className="text-white font-semibold mb-2">Usage Data</h4>
                                <p>Your generation prompts, settings, and output files. This allows you to access your history and fine-tune past creations.</p>
                            </div>
                            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-sm hover:bg-zinc-900/50 transition-colors">
                                <h4 className="text-white font-semibold mb-2">Technical Telemetry</h4>
                                <p>Non-identifiable telemetry such as error logs, browser type, and latency metrics to ensure high network performance.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Security & AI Training */}
                <div className="p-8 md:p-10 rounded-[2rem] bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 backdrop-blur-md border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors duration-500">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] group-hover:bg-indigo-500/10 transition-colors duration-700" />
                    <div className="flex items-center gap-4 mb-8 relative z-10">
                        <div className="p-3 bg-zinc-800/80 rounded-2xl border border-white/10 shadow-lg">
                            <KeyIcon className="w-6 h-6 text-zinc-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">2. Security & AI Training</h2>
                    </div>
                    <div className="space-y-6 text-zinc-400 text-sm leading-relaxed relative z-10">
                        <p className="text-base text-zinc-300 font-medium">Your private generations are strictly yours. They are not used to train our base foundation models without explicit opt-in.</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                            <div className="p-5 rounded-2xl border border-white/5 bg-black/40 hover:bg-white/5 transition-colors">
                                <div className="text-indigo-400 font-bold mb-2">Encrypted Transit</div>
                                <p>All communication between your browser and our AI computing nodes is encrypted via TLS 1.3.</p>
                            </div>
                            <div className="p-5 rounded-2xl border border-white/5 bg-black/40 hover:bg-white/5 transition-colors">
                                <div className="text-indigo-400 font-bold mb-2">Secure Storage</div>
                                <p>Databases are hosted on secure enterprise clusters with strict IAM (Identity and Access Management) rules.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Your Rights */}
                <div className="p-8 md:p-10 rounded-[2rem] bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 backdrop-blur-md border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors duration-500">
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] group-hover:bg-emerald-500/10 transition-colors duration-700" />
                    <div className="flex items-center gap-4 mb-8 relative z-10">
                        <div className="p-3 bg-zinc-800/80 rounded-2xl border border-white/10 shadow-lg">
                            <ShieldCheckIcon className="w-6 h-6 text-zinc-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">3. Your Data Rights</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                        <div className="flex gap-4 p-5 rounded-2xl bg-black/40 border border-white/5 hover:border-emerald-500/30 transition-all duration-300">
                            <DownloadIcon className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-white mb-1">Right to Access</h4>
                                <p className="text-sm text-zinc-400">Export a complete archive of your account data, prompt history, and asset generations at any time.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-5 rounded-2xl bg-black/40 border border-white/5 hover:border-rose-500/30 transition-all duration-300">
                            <UserXIcon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-white mb-1">Right to Erasure</h4>
                                <p className="text-sm text-zinc-400">Delete your account permanently. We will wipe all associated data from our active databases immediately.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer Contact */}
            <div className="text-center p-10 mt-8 mb-8 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay"></div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3 relative z-10 tracking-tight">Have questions about your privacy?</h3>
                <p className="text-indigo-200/80 text-sm mb-8 max-w-lg mx-auto relative z-10 leading-relaxed">Our dedicated Data Protection Officer is ready to assist you with any inquiries regarding our policy or your data rights.</p>
                <button className="relative z-10 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all text-white font-semibold text-sm shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] active:scale-95">
                    Contact Privacy Team
                </button>
            </div>
        </div>
    )
}
