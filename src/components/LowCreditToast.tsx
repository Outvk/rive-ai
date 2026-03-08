"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface LowCreditToastProps {
    credits: number;
}

export function LowCreditToast({ credits }: LowCreditToastProps) {
    const lastToastRef = useRef<number | null>(null);

    useEffect(() => {
        // Only trigger if credits are low (<= 5) and have changed
        if (credits > 5 || credits === lastToastRef.current) return;

        lastToastRef.current = credits;

        const isExhausted = credits === 0;

        toast.custom((t) => (
            <div className="w-[380px] bg-zinc-950 border border-white/10 rounded-2xl p-5 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isExhausted ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
                        }`}>
                        {isExhausted ? (
                            <ExclamationTriangleIcon className="w-5 h-5" />
                        ) : (
                            <InfoCircledIcon className="w-5 h-5" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-white tracking-tight">
                            {isExhausted ? "Credits Exhausted" : "Low Credits Warning"}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                            {isExhausted
                                ? "You've run out of credits. Top up now to keep generating magic."
                                : `You only have ${credits} ${credits === 1 ? 'credit' : 'credits'} left in your account.`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                    <Button
                        asChild
                        size="sm"
                        className="flex-1 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] uppercase tracking-wider"
                        onClick={() => toast.dismiss(t)}
                    >
                        <Link href="/dashboard/pricing">Top Up Now</Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-4 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 font-bold text-[11px] uppercase tracking-wider"
                        onClick={() => toast.dismiss(t)}
                    >
                        Dismiss
                    </Button>
                </div>
            </div>
        ), {
            duration: 8000,
            position: "bottom-right",
        });
    }, [credits]);

    return null; // This component doesn't render anything itself
}
