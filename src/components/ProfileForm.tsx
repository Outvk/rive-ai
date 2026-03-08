'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateProfileSettings } from '@/app/dashboard/profile/actions'

import { Grainient } from '@/components/Grainient'

export function ProfileForm({
    initialName,
    email,
    initials,
    avatarUrl: initialAvatarUrl
}: {
    initialName: string,
    email: string,
    initials: string,
    avatarUrl?: string
}) {
    const router = useRouter()
    const [isSaving, setIsSaving] = useState(false)
    const [fullName, setFullName] = useState(initialName)
    const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSaving(true)
        const formData = new FormData(e.currentTarget)
        const { error } = await updateProfileSettings(formData)

        if (error) {
            toast.error(error)
            setIsSaving(false)
        } else {
            toast.success('Profile updated successfully')
            router.refresh()
            setIsSaving(false)
            setPreviewUrl(null)
        }
    }

    // Effect to update local state if props change (e.g. from router.refresh)
    useEffect(() => {
        setFullName(initialName)
    }, [initialName])

    useEffect(() => {
        setAvatarUrl(initialAvatarUrl)
    }, [initialAvatarUrl])

    return (
        <div className="max-w-2xl mt-8">
            <div className="relative border border-white/5 rounded-2xl p-8 overflow-hidden">
                {/* Grainient Background */}
                <div className="absolute inset-0 z-0">
                    <Grainient
                        color1="#FF9FFC"
                        color2="#5227FF"
                        color3="#B19EEF"
                        timeSpeed={0.25}
                        colorBalance={0}
                        warpStrength={1}
                        warpFrequency={5}
                        warpSpeed={2}
                        warpAmplitude={50}
                        blendAngle={0}
                        blendSoftness={0.05}
                        rotationAmount={500}
                        noiseScale={2}
                        grainAmount={0.1}
                        grainScale={2}
                        grainAnimated={false}
                        contrast={1.5}
                        gamma={1}
                        saturation={1}
                        centerX={0}
                        centerY={0}
                        zoom={0.9}
                    />
                    {/* Add a dark overlay so text is readable */}
                    <div className="absolute inset-0 bg-zinc-350/70 backdrop-blur-3xl" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="relative group">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-900 flex items-center justify-center shadow-lg shadow-purple-500/20 text-2xl font-bold text-white uppercase overflow-hidden border-2 border-white/10">
                                {previewUrl || avatarUrl ? (
                                    <img src={previewUrl || avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    initials
                                )}
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-medium text-zinc-900">{fullName}</h2>
                            <p className="text-sm text-zinc-700 mt-1">{email}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-900 mb-2">
                                Profile Picture
                            </label>
                            <input
                                type="file"
                                name="avatar"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full text-sm text-zinc-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-500/10 file:text-indigo-900 hover:file:bg-indigo-500/20 transition-all cursor-pointer"
                            />
                        </div>

                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-zinc-900 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                minLength={2}
                                className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-900 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                defaultValue={email}
                                disabled
                                className="w-full bg-zinc-950/30 border border-white/5 rounded-xl px-4 py-3 text-zinc-400 cursor-not-allowed"
                                title="Email address cannot be changed"
                            />
                            <p className="text-[10px] text-zinc-900 mt-2">
                                Email associated with your Rive AI account. Contact support to change this.
                            </p>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="bg-zinc-100 hover:bg-white text-zinc-900 px-6 py-2.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/10"
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
