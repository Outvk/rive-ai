"use client";

import { AuthUI } from "@/components/ui/auth-fuse";

export default function AuthPage() {
    return (
        <AuthUI
            signInContent={{
                quote: {
                    text: "Welcome back to Rive AI. Your creative studio awaits.",
                    author: "Rive AI"
                }
            }}
            signUpContent={{
                quote: {
                    text: "Join the future of creativity. Start your free trial today.",
                    author: "Rive AI"
                }
            }}
        />
    );
}
