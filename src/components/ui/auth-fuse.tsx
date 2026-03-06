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

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface TypewriterProps {
    text: string | string[];
    speed?: number;
    cursor?: string;
    loop?: boolean;
    deleteSpeed?: number;
    delay?: number;
    className?: string;
}

export function Typewriter({
    text,
    speed = 100,
    cursor = "|",
    loop = false,
    deleteSpeed = 50,
    delay = 1500,
    className,
}: TypewriterProps) {
    const [displayText, setDisplayText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [textArrayIndex, setTextArrayIndex] = useState(0);

    const textArray = Array.isArray(text) ? text : [text];
    const currentText = textArray[textArrayIndex] || "";

    useEffect(() => {
        if (!currentText) return;

        const timeout = setTimeout(
            () => {
                if (!isDeleting) {
                    if (currentIndex < currentText.length) {
                        setDisplayText((prev) => prev + currentText[currentIndex]);
                        setCurrentIndex((prev) => prev + 1);
                    } else if (loop) {
                        setTimeout(() => setIsDeleting(true), delay);
                    }
                } else {
                    if (displayText.length > 0) {
                        setDisplayText((prev) => prev.slice(0, -1));
                    } else {
                        setIsDeleting(false);
                        setCurrentIndex(0);
                        setTextArrayIndex((prev) => (prev + 1) % textArray.length);
                    }
                }
            },
            isDeleting ? deleteSpeed : speed,
        );

        return () => clearTimeout(timeout);
    }, [
        currentIndex,
        isDeleting,
        currentText,
        loop,
        speed,
        deleteSpeed,
        delay,
        displayText,
        text,
    ]);

    return (
        <span className={className}>
            {displayText}
            <span className="animate-pulse">{cursor}</span>
        </span>
    );
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

const defaultSignInContent = {
    image: {
        src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
        alt: "A beautiful abstract background for sign-in"
    },
    quote: {
        text: "Welcome Back! The journey continues.",
        author: "Rive AI"
    }
};

const defaultSignUpContent = {
    image: {
        src: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574&auto=format&fit=crop",
        alt: "A vibrant, modern space for new beginnings"
    },
    quote: {
        text: "Create an account. A new chapter awaits.",
        author: "Rive AI"
    }
};

export function AuthUI({ signInContent = {}, signUpContent = {} }: AuthUIProps) {
    const [isSignIn, setIsSignIn] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const toggleForm = () => setIsSignIn((prev) => !prev);

    const finalSignInContent = {
        image: { ...defaultSignInContent.image, ...signInContent.image },
        quote: { ...defaultSignInContent.quote, ...signInContent.quote },
    };
    const finalSignUpContent = {
        image: { ...defaultSignUpContent.image, ...signUpContent.image },
        quote: { ...defaultSignUpContent.quote, ...signUpContent.quote },
    };

    const currentContent = isSignIn ? finalSignInContent : finalSignUpContent;

    return (
        <div className="w-full min-h-screen md:grid md:grid-cols-2 bg-black border-r border-white/5 dark">
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
            <div className="flex h-screen items-center justify-center p-6 md:h-auto md:p-0 md:py-12 bg-black">
                <AuthFormContainer isSignIn={isSignIn} onToggle={toggleForm} isLoading={isLoading} setIsLoading={setIsLoading} />
            </div>

            <div className="hidden md:flex flex-col p-4 bg-black">
                <div
                    className="relative flex-1 bg-cover bg-center transition-all duration-700 ease-in-out border border-white/5 rounded-[2.5rem] overflow-hidden group shadow-2xl"
                    style={{ backgroundImage: `url(${currentContent.image.src})` }}
                    key={currentContent.image.src}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />

                    <div className="relative z-10 flex h-full flex-col items-center justify-end p-12 pb-24">
                        <blockquote className="space-y-4 text-center">
                            <p className="text-2xl font-light text-white tracking-wide">
                                “<Typewriter
                                    key={currentContent.quote.text}
                                    text={currentContent.quote.text}
                                    speed={60}
                                    className="text-white"
                                />”
                            </p>
                            <cite className="block text-sm font-medium text-zinc-400 not-italic uppercase tracking-[0.2em]">
                                — {currentContent.quote.author}
                            </cite>
                        </blockquote>
                    </div>

                    {/* Brand Overlay */}
                    <div className="absolute top-12 left-12 z-20 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="text-white text-xl font-bold">R</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">Rive AI</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
