import StickyTabs from '@/components/ui/sticky-section-tabs'
import { LockClosedIcon } from '@radix-ui/react-icons'
import { ShieldCheckIcon, EyeIcon, FileTextIcon, BellIcon } from 'lucide-react'

export const metadata = {
    title: 'Privacy Policy - Rive AI',
    description: 'Understand how we protect and manage your data.',
}

export default function PrivacyPolicyPage() {
    return (
        <div className="max-w-5xl mx-auto fade-in pb-20">
            {/* Page Header */}
            <div className="mb-12">
                <h1 className="text-2xl font-semibold text-zinc-100 mb-1 flex items-center gap-2">
                    <LockClosedIcon className="w-6 h-6 text-indigo-400" />
                    Privacy Policy
                </h1>
                <p className="text-sm text-zinc-400">
                    Last updated: March 5, 2026. Your privacy is our top priority.
                </p>
            </div>

            <div className="relative rounded-2xl border border-white/5 bg-zinc-900/40 overflow-visible backdrop-blur-xl">
                <StickyTabs mainNavHeight="4rem">
                    <StickyTabs.Item title="1. Information We Collect" id="collect">
                        <div className="space-y-6">
                            <p>
                                We collect various types of information to provide and improve our AI services:
                            </p>
                            <ul className="list-disc pl-5 space-y-3">
                                <li><strong>Account Data:</strong> Email address, name, and profile information provided during registration.</li>
                                <li><strong>Usage Data:</strong> Information on how you interact with our AI tools, including prompt history and generation preferences.</li>
                                <li><strong>Technical Data:</strong> IP address, browser type, and device information for security and performance optimization.</li>
                            </ul>
                            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex gap-4">
                                <EyeIcon className="w-5 h-5 text-indigo-400 shrink-0 mt-1" />
                                <p className="text-sm">We do not sell your personal data to third parties. Your prompts are used solely to generate the content you request.</p>
                            </div>
                        </div>
                    </StickyTabs.Item>

                    <StickyTabs.Item title="2. How We Use Data" id="usage">
                        <div className="space-y-6">
                            <p>Your data enables us to deliver a personalized and efficient experience:</p>
                            <ul className="list-disc pl-5 space-y-3">
                                <li>Providing the AI generation services (Text, Image, Audio, Video).</li>
                                <li>Managing your account and processing credit transactions.</li>
                                <li>Improving our machine learning models and tool performance.</li>
                                <li>Communicating essential service updates and security alerts.</li>
                            </ul>
                        </div>
                    </StickyTabs.Item>

                    <StickyTabs.Item title="3. Data Security" id="security">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                                <ShieldCheckIcon className="w-8 h-8 text-emerald-400" />
                                <h3 className="text-lg font-medium text-white">Advanced Protection</h3>
                            </div>
                            <p>
                                We implement industry-standard security measures to protect your information:
                            </p>
                            <ul className="list-disc pl-5 space-y-3">
                                <li>End-to-end encryption for sensitive data transfers.</li>
                                <li>Regular security audits and vulnerability assessments.</li>
                                <li>Strict access controls for our internal systems.</li>
                            </ul>
                            <p className="italic text-sm">While we strive for perfection, no method of transmission over the internet is 100% secure.</p>
                        </div>
                    </StickyTabs.Item>

                    <StickyTabs.Item title="4. Your Rights" id="rights">
                        <div className="space-y-6">
                            <p>You have full control over your personal information:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                                    <h4 className="font-semibold text-white mb-1">Access & Export</h4>
                                    <p className="text-sm">Request a copy of the data we hold about you at any time.</p>
                                </div>
                                <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                                    <h4 className="font-semibold text-white mb-1">Rectification</h4>
                                    <p className="text-sm">Update your profile information directly from your settings.</p>
                                </div>
                                <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                                    <h4 className="font-semibold text-white mb-1">Erasure</h4>
                                    <p className="text-sm">Request the permanent deletion of your account and all associated data.</p>
                                </div>
                                <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                                    <h4 className="font-semibold text-white mb-1">Withdrawal</h4>
                                    <p className="text-sm">Opt-out of optional data processing or marketing communications.</p>
                                </div>
                            </div>
                        </div>
                    </StickyTabs.Item>

                    <StickyTabs.Item title="5. Updates to Policy" id="updates">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                                <BellIcon className="w-6 h-6 text-indigo-400" />
                                <div>
                                    <h4 className="font-medium text-white">Stay Informed</h4>
                                    <p className="text-sm opacity-80 mt-1">We may update this policy periodically. We will notify you of any significant changes via email or system notification.</p>
                                </div>
                            </div>
                            <p>If you have questions regarding this policy, please contact us at <span className="text-indigo-400 underline cursor-pointer">privacy@rive-ai.com</span>.</p>
                        </div>
                    </StickyTabs.Item>
                </StickyTabs>
            </div>
        </div>
    )
}
