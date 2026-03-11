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
        <form onSubmit={handleSignIn} autoComplete="on" className="flex flex-col gap-8">
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold text-white">Sign in to your account</h1>
                <p className="text-balance text-sm text-white/50">Enter your email below to sign in</p>
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
        <form onSubmit={handleSignUp} autoComplete="on" className="flex flex-col gap-8">
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold text-white">Create an account</h1>
                <p className="text-balance text-sm text-white/50">Enter your details below to sign up</p>
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
        <div className="mx-auto grid w-[350px] gap-2">
            {isSignIn ? <SignInForm isLoading={isLoading} setIsLoading={setIsLoading} /> : <SignUpForm isLoading={isLoading} setIsLoading={setIsLoading} />}
            <div className="text-center text-sm text-white/40">
                {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
                <Button variant="link" className="pl-1 text-white hover:text-white/80 transition-colors" onClick={onToggle} disabled={isLoading}>
                    {isSignIn ? "Sign up" : "Sign in"}
                </Button>
            </div>
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-white/10">
                <span className="relative z-10 bg-black px-2 text-white/30 uppercase text-[10px] font-bold tracking-widest">Or continue with</span>
            </div>
            <Button variant="outline" type="button" className="text-white/80 border-white/10 hover:bg-white/5" onClick={() => console.log("UI: Google button clicked")} disabled={isLoading}>
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google icon" className="mr-2 h-4 w-4 " />
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
        <div className="w-full min-h-screen grid md:grid-cols-2 bg-black bg-[radial-gradient(circle_at_20%_20%,rgba(116,5,255,0.05)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(193,144,255,0.05)_0%,transparent_50%)] dark">
            <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 30px black inset !important;
            -webkit-text-fill-color: white !important;
        }
      `}</style>

            {/* Left Section - Form */}
            <div className="flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm border-r border-white/5">
                <div className="w-full max-w-md">
                    <AuthFormContainer isSignIn={isSignIn} onToggle={toggleForm} isLoading={isLoading} setIsLoading={setIsLoading} />
                </div>
            </div>

            {/* Right Section - Sidebar (Left & Bottom Aligned) */}
            <div className="hidden md:flex flex-col items-start justify-end p-12 relative overflow-hidden bg-black/20">
                {/* Animated Logo - Left-aligned and positioned bottom */}
                <div className="w-full max-w-[95%] mb-0 overflow-hidden flex justify-start">
                    <img
                        src="/Comp-1.gif"
                        alt="Rive AI Animated Logo"
                        className="w-full h-auto max-h-[400px] object-contain block z-10 auth-animated-logo"
                        style={{ position: 'absolute', bottom: '200px', left: '-17px' }}
                    />
                </div>

                <div className="relative w-full max-w-[95%] h-64 group mt-[-30px]">
                    {/* Animated ambient glow around the banner */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-[#7405FF]/10 via-transparent to-[#C190FF]/10 rounded-[2rem] blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-1000" />

                    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-zinc-950/30 backdrop-blur-xl shadow-2xl style={{ position: 'absolute', bottom: '200px', left: '-50px' }}">
                        <Silk
                            speed={5}
                            scale={0.7}
                            noiseIntensity={1.2}
                            rotation={0.4}
                        />

                        {/* Interactive overlay details */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-6 left-10 right-10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-[1px] w-12 bg-white/20" />
                                <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-medium">
                                    System Core / {isSignIn ? "Sequence 01" : "Access 02"}
                                </p>
                            </div>
                            <div className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-mono">
                                LVL-90 // CORE_PROC
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
