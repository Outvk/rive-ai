'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { updateProfileSettings, requestPasswordReset, updateUserPassword } from '@/app/dashboard/profile/actions'
import { User, Mail, Shield, Bell, Key, Palette, LogOut, CheckCircle2, ChevronRight, Zap, Image as LucideImageIcon, Lock, Fingerprint, RefreshCcw } from 'lucide-react'
import { Grainient } from '@/components/Grainient'

export function ProfileForm({
    initialName,
    email,
    initials,
    avatarUrl: initialAvatarUrl,
    initialColor1,
    initialColor2,
    initialColor3,
    initialCardBg
}: {
    initialName: string,
    email: string,
    initials: string,
    avatarUrl?: string,
    initialColor1?: string,
    initialColor2?: string,
    initialColor3?: string,
    initialCardBg?: string
}) {
    const router = useRouter()
    const [isSaving, setIsSaving] = useState(false)
    const [fullName, setFullName] = useState(initialName)
    const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('general')
    const searchParams = useSearchParams()
    const isResetRedirect = searchParams.get('reset') === 'true'
    
    // Preferences State
    const [color1, setColor1] = useState(initialColor1 || '#FF9FFC')
    const [color2, setColor2] = useState(initialColor2 || '#5227FF')
    const [color3, setColor3] = useState(initialColor3 || '#B19EEF')
    const [cardImagePreview, setCardImagePreview] = useState<string | null>(initialCardBg || null)
    const [cardBgFile, setCardBgFile] = useState<File | null>(null)
    const [shouldRemoveCardBg, setShouldRemoveCardBg] = useState(false)

    // Security State
    const [isResettingPassword, setIsResettingPassword] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [retypePassword, setRetypePassword] = useState('')
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

    const todayDate = new Date().toLocaleDateString('en-GB') // 13/11/2025 style

    const menuItems = [
        { id: 'general', label: 'General Info', icon: User },
        { id: 'preferences', label: 'Preferences', icon: Palette },
        { id: 'security', label: 'Password & Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ]

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    const handleCardBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setCardBgFile(file)
            const url = URL.createObjectURL(file)
            setCardImagePreview(url)
            setShouldRemoveCardBg(false)
        }
    }

    const handleSavePreferences = async () => {
        setIsSaving(true)
        const formData = new FormData()
        formData.append('color1', color1)
        formData.append('color2', color2)
        formData.append('color3', color3)
        if (cardBgFile) {
            formData.append('card_bg', cardBgFile)
        }
        if (shouldRemoveCardBg) {
            formData.append('remove_card_bg', 'true')
        }

        const { error } = await updateProfileSettings(formData)

        if (error) {
            toast.error(error)
            setIsSaving(false)
        } else {
            toast.success('Preferences saved!', {
                icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            })
            router.refresh()
            setIsSaving(false)
            setCardBgFile(null)
            setShouldRemoveCardBg(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSaving(true)
        const formData = new FormData(e.currentTarget)
        if (shouldRemoveCardBg) {
            formData.append('remove_card_bg', 'true')
        }
        const { error } = await updateProfileSettings(formData)

        if (error) {
            toast.error(error)
            setIsSaving(false)
        } else {
            toast.success('Profile updated successfully', {
                icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            })
            router.refresh()
            setIsSaving(false)
            setPreviewUrl(null)
        }
    }

    const handleResetPassword = async () => {
        setIsResettingPassword(true)
        const { error } = await requestPasswordReset(email)
        
        if (error) {
            toast.error(error)
        } else {
            toast.success('Password reset link sent to your email!', {
                description: 'Please check your inbox for instructions.',
                icon: <Mail className="w-5 h-5 text-indigo-400" />
            })
        }
        setIsResettingPassword(false)
    }

    const handleDirectPasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Validation
        if (newPassword !== retypePassword) {
            toast.error('New passwords do not match')
            return
        }

        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!$@%])[A-Za-z\d!$@%]{6,}$/
        if (!passwordRegex.test(newPassword)) {
            toast.error('Password must be at least 6 characters and include letters, numbers, and special characters (!$@%).')
            return
        }

        setIsUpdatingPassword(true)
        const { error } = await updateUserPassword(newPassword)

        if (error) {
            toast.error(error)
        } else {
            toast.success('Password updated successfully!')
            setNewPassword('')
            setRetypePassword('')
            setCurrentPassword('')
        }
        setIsUpdatingPassword(false)
    }

    useEffect(() => {
        setFullName(initialName)
    }, [initialName])

    useEffect(() => {
        setAvatarUrl(initialAvatarUrl)
    }, [initialAvatarUrl])

    // Detect reset redirect
    useEffect(() => {
        if (isResetRedirect) {
            setActiveTab('security')
            toast.info('Please set your new password below.', {
                description: 'You have been redirected from your secure reset link.',
                duration: 6000,
                icon: <Key className="w-5 h-5 text-indigo-400" />
            })
        }
    }, [isResetRedirect])

    return (
        <div className="w-full max-w-5xl mx-auto mt-4 h-[700px] bg-[#09090b] border border-zinc-800/80 rounded-2xl flex overflow-hidden shadow-2xl">
            
            {/* Sidebar Navigation */}
            <div className="w-[280px] bg-[#0c0c0e] border-r border-zinc-800/80 p-5 flex flex-col hidden md:flex">
                <div className="flex items-center gap-4 mb-10 px-2 mt-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 text-white font-bold text-xl uppercase overflow-hidden border-2 border-zinc-800">
                        {previewUrl || avatarUrl ? (
                            <img src={previewUrl || avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            initials
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-zinc-100 truncate w-32">{fullName}</h3>
                        <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-0.5">Pro User</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                                activeTab === item.id 
                                    ? 'bg-zinc-800/80 text-white shadow-sm' 
                                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                            }`}
                        >
                            <item.icon className="w-4 h-4 shrink-0" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto border-t border-zinc-800/50 pt-4">
                    <button className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
                        <LogOut className="w-4 h-4 shrink-0" />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-black overflow-y-auto custom-scrollbar relative">
                {activeTab === 'general' && (
                    <div className="min-h-full animate-in fade-in duration-500 relative">
                        <div className="max-w-2xl p-8 xl:p-10 relative z-10">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                
                                {/* Card with glowing background */}
                                <div className="relative border border-zinc-800/80 rounded-2xl overflow-hidden p-6 md:p-8 shadow-2xl">
                                    <div className="absolute inset-0 z-0 pointer-events-none">
                                        {cardImagePreview ? (
                                            <img src={cardImagePreview} alt="Background" className="w-full h-full object-cover opacity-60" />
                                        ) : (
                                            <Grainient
                                                color1={color1}
                                                color2={color2}
                                                color3={color3}
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
                                        )}
                                    </div>

                                    <div className="relative z-10">
                                        <div className="mb-8">
                                            <h2 className="text-2xl font-bold text-white mb-1">User Information</h2>
                                            <p className="text-sm text-zinc-400">Manage your personal details.</p>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="relative group cursor-pointer">
                                                <div className="w-24 h-24 rounded-full bg-zinc-900 flex items-center justify-center text-3xl font-bold text-zinc-600 uppercase overflow-hidden border border-zinc-700/50 transition duration-300 group-hover:border-violet-500/50 shadow-xl group-hover:shadow-violet-500/20">
                                                    {previewUrl || avatarUrl ? (
                                                        <img src={previewUrl || avatarUrl} alt="Avatar" className="w-full h-full object-cover group-hover:opacity-75 transition" />
                                                    ) : (
                                                        initials
                                                    )}
                                                </div>
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition duration-300">
                                                    <div className="bg-black/60 rounded-full px-3 py-1.5 text-[10px] font-semibold tracking-wider uppercase text-white backdrop-blur-md border border-white/10">
                                                        Change
                                                    </div>
                                                </div>
                                                <input
                                                    type="file"
                                                    name="avatar"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-medium text-white">Profile Picture</h4>
                                                <p className="text-xs text-zinc-400 max-w-sm">Upload a professional photo or avatar. JPG, GIF or PNG. Max size 5MB.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="fullName" className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest pl-1">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <User className="h-4 w-4 text-zinc-500" />
                                            </div>
                                            <input
                                                type="text"
                                                id="fullName"
                                                name="fullName"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                required
                                                minLength={2}
                                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-11 pr-4 py-3.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all font-medium"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest pl-1">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Mail className="h-4 w-4 text-zinc-600" />
                                            </div>
                                            <input
                                                type="email"
                                                defaultValue={email}
                                                disabled
                                                className="w-full bg-zinc-900/20 border border-zinc-800/50 rounded-xl pl-11 pr-4 py-3.5 text-sm text-zinc-500 cursor-not-allowed"
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                                <Shield className="h-4 w-4 text-emerald-500/50" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-48 h-12 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:hover:bg-violet-600 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)] hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                                    >
                                        {isSaving ? 'Saving Changes...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'preferences' && (
                    <div className="max-w-2xl p-8 lg:p-12 animate-in slide-in-from-right-4 duration-500">
                        <div className="mb-10">
                            <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">Personalization</h2>
                            <p className="text-sm text-zinc-500">Customize your Rive interface and profile cards.</p>
                        </div>

                        <div className="space-y-10">
                            {/* Accent Colors */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-violet-500/10 rounded-lg">
                                        <Palette className="w-4 h-4 text-violet-500" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-zinc-200">Card Gradient Colors</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-3 p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl transition-all hover:border-zinc-700/50">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Color 1</label>
                                        <div className="flex items-center gap-2">
                                            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-zinc-700 shrink-0">
                                                <input 
                                                    type="color" 
                                                    value={color1} 
                                                    onChange={(e) => setColor1(e.target.value)}
                                                    className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer border-none p-0"
                                                />
                                            </div>
                                            <input 
                                                type="text"
                                                value={color1}
                                                onChange={(e) => setColor1(e.target.value)}
                                                className="bg-zinc-950/50 border border-zinc-800 rounded-lg px-2 py-2 text-[10px] font-mono text-zinc-200 uppercase w-20 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all"
                                                placeholder="#000000"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3 p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl transition-all hover:border-zinc-700/50">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Color 2</label>
                                        <div className="flex items-center gap-2">
                                            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-zinc-700 shrink-0">
                                                <input 
                                                    type="color" 
                                                    value={color2} 
                                                    onChange={(e) => setColor2(e.target.value)}
                                                    className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer border-none p-0"
                                                />
                                            </div>
                                            <input 
                                                type="text"
                                                value={color2}
                                                onChange={(e) => setColor2(e.target.value)}
                                                className="bg-zinc-950/50 border border-zinc-800 rounded-lg px-2 py-2 text-[10px] font-mono text-zinc-200 uppercase w-20 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all"
                                                placeholder="#000000"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3 p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl transition-all hover:border-zinc-700/50">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Color 3</label>
                                        <div className="flex items-center gap-2">
                                            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-zinc-700 shrink-0">
                                                <input 
                                                    type="color" 
                                                    value={color3} 
                                                    onChange={(e) => setColor3(e.target.value)}
                                                    className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer border-none p-0"
                                                />
                                            </div>
                                            <input 
                                                type="text"
                                                value={color3}
                                                onChange={(e) => setColor3(e.target.value)}
                                                className="bg-zinc-950/50 border border-zinc-800 rounded-lg px-2 py-2 text-[10px] font-mono text-zinc-200 uppercase w-20 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all"
                                                placeholder="#000000"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Background Image */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                                        <LucideImageIcon className="w-4 h-4 text-indigo-500" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-zinc-200">Card Background Image</h3>
                                </div>
                                <div className="relative group overflow-hidden border-2 border-dashed border-zinc-800 rounded-2xl transition-all hover:border-violet-500/30 hover:bg-violet-500/[0.02] active:scale-[0.99]">
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleCardBgChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="p-8 flex flex-col items-center justify-center text-center">
                                        {cardImagePreview ? (
                                            <div className="space-y-4">
                                                <div className="w-32 h-20 rounded-lg overflow-hidden border border-zinc-700 shadow-xl mx-auto">
                                                    <img src={cardImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                                <p className="text-xs text-violet-400 font-medium tracking-wide">Click to replace background</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center mb-4 border border-zinc-800 group-hover:bg-zinc-800 transition-colors">
                                                    <LucideImageIcon className="w-5 h-5 text-zinc-500 group-hover:text-violet-500" />
                                                </div>
                                                <p className="text-sm text-zinc-300 font-medium">Upload Card Image</p>
                                                <p className="text-xs text-zinc-500 mt-1">Recommended: 800x400 PNG or JPG</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-zinc-800/50 flex justify-between items-center">
                            <button
                                onClick={() => {
                                    setColor1('#FF9FFC')
                                    setColor2('#5227FF')
                                    setColor3('#B19EEF')
                                    setCardImagePreview(null)
                                    setShouldRemoveCardBg(true)
                                    setCardBgFile(null)
                                }}
                                className="text-xs font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest"
                            >
                                Reset to Default
                            </button>
                            <button
                                onClick={handleSavePreferences}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="max-w-2xl p-8 lg:p-12 animate-in slide-in-from-right-4 duration-500">
                        {isResetRedirect ? (
                            <>
                                <div className="mb-10">
                                    <h2 className="text-2xl font-bold text-violet-400 mb-1 tracking-tight">Setup New Password</h2>
                                    <p className="text-sm text-zinc-500 leading-relaxed">
                                        Finalize your account recovery. Your new password must contain at least 6 characters, numbers, and special characters (!$@%).
                                    </p>
                                </div>

                                <form onSubmit={handleDirectPasswordUpdate} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest pl-1">
                                            New password
                                        </label>
                                        <input 
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password"
                                            className="w-full bg-zinc-900/50 border border-violet-500/30 rounded-xl px-4 py-3.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all shadow-[0_0_15px_rgba(139,92,246,0.05)]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest pl-1">
                                            Retype new password
                                        </label>
                                        <input 
                                            type="password"
                                            value={retypePassword}
                                            onChange={(e) => setRetypePassword(e.target.value)}
                                            placeholder="Confirm new password"
                                            className="w-full bg-zinc-900/50 border border-violet-500/30 rounded-xl px-4 py-3.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all shadow-[0_0_15px_rgba(139,92,246,0.05)]"
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <button 
                                            type="submit"
                                            disabled={isUpdatingPassword}
                                            className="w-full h-12 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg"
                                        >
                                            {isUpdatingPassword ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                                            Complete Recovery
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <>
                                <div className="mb-10">
                                    <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">Change Password</h2>
                                    <p className="text-sm text-zinc-500 leading-relaxed">
                                        Your password must contain at least 6 characters as well as a combination of numbers, letters and special characters (!$@%).
                                    </p>
                                </div>

                                <form onSubmit={handleDirectPasswordUpdate} className="space-y-6">
                                    {/* Normal Update Form */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest pl-1">
                                            Current password (updated on {todayDate})
                                        </label>
                                        <input 
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all font-medium"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest pl-1">
                                            New password
                                        </label>
                                        <input 
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password"
                                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all font-medium"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest pl-1">
                                            Retype new password
                                        </label>
                                        <input 
                                            type="password"
                                            value={retypePassword}
                                            onChange={(e) => setRetypePassword(e.target.value)}
                                            placeholder="Confirm new password"
                                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all font-medium"
                                        />
                                    </div>

                                    <div className="pt-4 flex flex-col gap-3">
                                        <button 
                                            type="submit"
                                            disabled={isUpdatingPassword}
                                            className="w-full h-12 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                                        >
                                            {isUpdatingPassword ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                                            {isUpdatingPassword ? 'Updating...' : 'Save Changes'}
                                        </button>
                                        
                                        <div className="text-center pt-2">
                                            <p className="text-[10px] text-zinc-600 mb-2 uppercase tracking-tighter">Lost access to current password?</p>
                                            <button 
                                                type="button" 
                                                onClick={handleResetPassword}
                                                disabled={isResettingPassword}
                                                className="px-4 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 text-[11px] font-semibold transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
                                            >
                                                {isResettingPassword ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                                                Send Email Reset Link
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </>
                        )}

                        <div className="mt-10 p-6 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl flex items-center gap-4 opacity-50">
                            <Lock className="w-5 h-5 text-zinc-500" />
                            <div className="text-xs text-zinc-500">
                                <span className="text-zinc-400 font-semibold">Pro Security Active</span>. Your session is protected by Rive Core protocols.
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
                        <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-600 mb-6 border border-zinc-800">
                            <Bell className="w-8 h-8 opacity-50" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">
                            Notifications
                        </h2>
                        <p className="text-zinc-500 max-w-md text-sm">
                            This panel is currently being upgraded for the Rive V2 platform. Full controls will be available in the next release.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
