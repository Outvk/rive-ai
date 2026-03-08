"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the TextGeneratorForm with SSR disabled
const TextGeneratorForm = dynamic(
    () => import("./TextGeneratorForm").then((mod) => mod.TextGeneratorForm),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-full w-full items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    <p className="text-sm font-medium text-zinc-400">Loading Ruixen Intelligence...</p>
                </div>
            </div>
        )
    }
);

export default TextGeneratorForm;
