"use client";

import * as React from "react";
import { useState, useId, useEffect } from "react";
import { Slot } from "@radix-ui/react-slot";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { loginAction, signupAction } from "@/app/login/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Silk from "@/components/ui/Silk";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}



const labelVariants = cva(
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white/70"
);

const Label = React.forwardRef<
    React.ElementRef<typeof LabelPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
    <LabelPrimitive.Root
        ref={ref}
        className={cn(labelVariants(), className)}
        {...props}
    />
));
Label.displayName = LabelPrimitive.Root.displayName;

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90",
                destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                outline: "border border-white/10 bg-black hover:bg-white/5 hover:text-white",
                secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary-foreground/60 underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-12 rounded-md px-6",
                icon: "h-8 w-8",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
    }
);
Button.displayName = "Button";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-lg border border-white/10 bg-black px-3 py-3 text-sm text-white shadow-sm shadow-black/5 transition-shadow placeholder:text-zinc-600 focus-visible:bg-white/5 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, label, ...props }, ref) => {
        const id = useId();
        const [showPassword, setShowPassword] = useState(false);
        const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
        return (
            <div className="grid w-full items-center gap-2">
                {label && <Label htmlFor={id}>{label}</Label>}
                <div className="relative">
                    <Input id={id} type={showPassword ? "text" : "password"} className={cn("pe-10", className)} ref={ref} {...props} />
                    <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" aria-label={showPassword ? "Hide password" : "Show password"}>
                        {showPassword ? (<EyeOff className="size-4" aria-hidden="true" />) : (<Eye className="size-4" aria-hidden="true" />)}
                    </button>
                </div>
            </div>
        );
    }
);
PasswordInput.displayName = "PasswordInput";

function SignInForm({ isLoading, setIsLoading }: { isLoading: boolean, setIsLoading: (v: boolean) => void }) {
    const router = useRouter();
    const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        const formData = new FormData(event.currentTarget);
        try {
            const res = await loginAction(formData);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Successfully logged in!");
                router.push('/dashboard');
                router.refresh();
            }
        } catch (e) {
            toast.error("An error occurred during sign in.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSignIn} autoComplete="on" className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-1 text-center">
                <h1 className="text-xl font-bold text-white">Sign in to your account</h1>
                <p className="text-balance text-xs text-white/50">Enter your email below to sign in</p>
            </div>
            <div className="grid gap-4">
                <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" placeholder="m@example.com" required autoComplete="email" /></div>
                <PasswordInput name="password" label="Password" required autoComplete="current-password" placeholder="Password" />
                <Button type="submit" variant="outline" className="mt-2" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : "Sign In"}
                </Button>
            </div>
        </form>
    );
}

function SignUpForm({ isLoading, setIsLoading }: { isLoading: boolean, setIsLoading: (v: boolean) => void }) {
    const router = useRouter();
    const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        const formData = new FormData(event.currentTarget);
        try {
            const res = await signupAction(formData);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Account created successfully!");
                router.push('/dashboard');
                router.refresh();
            }
        } catch (e) {
            toast.error("An error occurred during sign up.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSignUp} autoComplete="on" className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-1 text-center">
                <h1 className="text-xl font-bold text-white">Create an account</h1>
                <p className="text-balance text-xs text-white/50">Enter your details below to sign up</p>
            </div>
            <div className="grid gap-4">
                <div className="grid gap-1"><Label htmlFor="full_name">Full Name</Label><Input id="full_name" name="full_name" type="text" placeholder="John Doe" required autoComplete="name" /></div>
                <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" placeholder="m@example.com" required autoComplete="email" /></div>
                <PasswordInput name="password" label="Password" required autoComplete="new-password" placeholder="Password" />
                <Button type="submit" variant="outline" className="mt-2" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : "Sign Up"}
                </Button>
            </div>
        </form>
    );
}

function AuthFormContainer({ isSignIn, onToggle, isLoading, setIsLoading }: { isSignIn: boolean; onToggle: () => void; isLoading: boolean; setIsLoading: (v: boolean) => void }) {
    return (
        <div className="mx-auto grid w-[320px] gap-2">
            {isSignIn ? <SignInForm isLoading={isLoading} setIsLoading={setIsLoading} /> : <SignUpForm isLoading={isLoading} setIsLoading={setIsLoading} />}
            <div className="text-center text-xs text-white/40">
                {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
                <Button variant="link" className="h-auto p-0 text-white hover:text-white/80 transition-colors text-xs" onClick={onToggle} disabled={isLoading}>
                    {isSignIn ? "Sign up" : "Sign in"}
                </Button>
            </div>
            <div className="relative text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-white/10">
                <span className="relative z-10 bg-[#09090b] px-2 text-white/30 uppercase text-[9px] font-bold tracking-widest">Or continue with</span>
            </div>
            <Button variant="outline" type="button" size="sm" className="text-white/80 border-white/10 hover:bg-white/5 h-9" onClick={() => console.log("UI: Google button clicked")} disabled={isLoading}>
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google icon" className="mr-2 h-3.5 w-3.5 " />
                Continue with Google
            </Button>
        </div>
    )
}

interface AuthContentProps {
    image?: {
        src: string;
        alt: string;
    };
    quote?: {
        text: string;
        author: string;
    }
}

interface AuthUIProps {
    signInContent?: AuthContentProps;
    signUpContent?: AuthContentProps;
}



export function AuthUI({ signInContent = {}, signUpContent = {} }: AuthUIProps) {
    const [isSignIn, setIsSignIn] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const toggleForm = () => setIsSignIn((prev) => !prev);

    return (
        <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-black dark font-outfit">
            <style>{`
                input[type="password"]::-ms-reveal,
                input[type="password"]::-ms-clear {
                    display: none;
                }
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus, 
                input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 30px #09090b inset !important;
                    -webkit-text-fill-color: white !important;
                }
            `}</style>
            
            {/* Silk Background */}
            <div className="absolute inset-0 z-0">
                <Silk
                    speed={2}
                    scale={0.5}
                    noiseIntensity={1.5}
                    rotation={0.2}
                />
               
            </div>

            {/* Main Auth Card */}
            <div className="relative z-10 w-full max-w-4xl h-[520px] grid md:grid-cols-[1fr_1fr] bg-black/95 backdrop-blur-4xl border border-white/10 rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden m-4 group">
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/10 to-indigo-500/20 rounded-[2rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000 pointer-events-none" />

                {/* Left Section - Form */}
                <div className="relative flex flex-col items-center justify-center p-6 md:p-10 border-r border-white/5 bg-black/20">
                    <div className="w-full max-w-[280px]">
                        <AuthFormContainer isSignIn={isSignIn} onToggle={toggleForm} isLoading={isLoading} setIsLoading={setIsLoading} />
                    </div>
                </div>

                {/* Right Section - Brand/Logo */}
                <div className="relative hidden md:flex flex-col items-center justify-center p-10 bg-black">
                    <div className="relative w-full flex flex-col items-center text-center">
                        {/* Logo Animation */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[210px] w-full max-w-[220px] flex justify-center perspective-1000 z-0">
                            <Link href="/">
                                <img
                                    src="/Comp-1.gif"
                                    alt="Rive AI Animated Logo"
                                    className="w-full h-auto max-h-[420px] object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] cursor-pointer hover:scale-105 transition-transform duration-500"
                                />
                            </Link>
                        </div>

                        {/* Title & Description */}
                        <div className="relative z-10 space-y-2 max-w-[320px] mt-24">
                            <h2 style={{ fontFamily: '"Noto Serif", serif' }} className="text-3xl font-black text-white tracking-tighter">
                                Enjoy yr journey
                            </h2>
                            <p className="text-zinc-400 text-sm font-light leading-relaxed">
                                Join the elite circle of creators using next-generation intelligence to shape the future of digital art, animation, and storytelling.
                            </p>
                            <div className="pt-2 flex items-center justify-center gap-4">
                                <div className="flex flex-col items-center">
                                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest leading-none mb-1">Engines</span>
                                    <span className="text-[10px] font-semibold text-zinc-500">v4.2 Turbo</span>
                                </div>
                                <div className="h-4 w-[1px] bg-white/10" />
                                <div className="flex flex-col items-center">
                                    <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest leading-none mb-1">Status</span>
                                    <span className="text-[10px] font-semibold text-zinc-500">Core Active</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Decorative Bottom Bar */}
                    <div className="absolute bottom-6 left-10 right-10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-[1px] w-6 bg-white/20" />
                            <p className="text-[8px] uppercase tracking-[0.2em] text-white/30 font-medium">
                                System / {isSignIn ? "Login" : "Join"}
                            </p>
                        </div>
                        <div className="text-[8px] uppercase tracking-[0.1em] text-white/20 font-mono">
                            STX-09 // AUTH_MOD
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
