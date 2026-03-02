'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction, signupAction } from './actions'
import { toast } from 'sonner'

export default function AuthPage() {
    const router = useRouter()
    const [isLogin, setIsLogin] = useState(true)
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)

        try {
            if (isLogin) {
                const res = await loginAction(formData)
                if (res.error) {
                    toast.error(res.error)
                } else {
                    toast.success("Successfully logged in!")
                    router.push('/dashboard')
                    router.refresh()
                }
            } else {
                const res = await signupAction(formData)
                if (res.error) {
                    toast.error(res.error)
                } else {
                    toast.success("Account created successfully!")
                    router.push('/dashboard')
                    router.refresh()
                }
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-zinc-950 font-sans">

            {/* Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md bg-zinc-900/40 backdrop-blur-2xl border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10">

                <div className="text-center mb-8">
                    <div className="inline-flex h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 items-center justify-center shadow-lg shadow-purple-500/20 mb-4">
                        <span className="text-white text-xl font-bold leading-none">R</span>
                    </div>
                    <h1 className="text-2xl font-semibold text-zinc-100 mb-2">
                        {isLogin ? 'Welcome back' : 'Create an account'}
                    </h1>
                    <p className="text-zinc-400 text-sm">
                        {isLogin ? 'Enter your details to sign in to your account' : 'Sign up to start generating AI content'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className={`transition-all duration-300 overflow-hidden ${isLogin ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100'}`}>
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5" htmlFor="full_name">
                            Full Name
                        </label>
                        <input
                            id="full_name"
                            name="full_name"
                            placeholder="Jane Doe"
                            className="w-full bg-zinc-950/50 border border-white/10 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-zinc-600"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="you@example.com"
                            className="w-full bg-zinc-950/50 border border-white/10 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-zinc-600"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full bg-zinc-950/50 border border-white/10 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-zinc-600"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-zinc-100 hover:bg-white text-zinc-900 font-medium rounded-lg px-4 py-2.5 transition-all mt-6 shadow-[0_0_15px_rgba(255,255,255,0.1)] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-zinc-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            isLogin ? 'Sign In' : 'Sign Up'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-zinc-400">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                        {isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                </div>

            </div>
        </div>
    )
}
