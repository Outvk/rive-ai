import { cn } from "@/lib/utils";
import { useState } from "react";

export const Component = () => {
    const [count, setCount] = useState(0);

    return (
        <div className={cn("flex flex-col items-center gap-4 p-4 rounded-lg bg-zinc-900/50 border border-white/10")}>
            <h1 className="text-2xl font-bold mb-2">Component Example</h1>
            <h2 className="text-xl font-semibold text-indigo-400">{count}</h2>
            <div className="flex gap-2">
                <button
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-md transition-colors"
                    onClick={() => setCount((prev) => prev - 1)}
                >
                    -
                </button>
                <button
                    className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-md transition-colors"
                    onClick={() => setCount((prev) => prev + 1)}
                >
                    +
                </button>
            </div>
        </div>
    );
};
