"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Tab {
    id: string;
    label: string;
    content: React.ReactNode;
}

interface AnimatedTabsProps {
    tabs: Tab[];
    defaultTab?: string;
    className?: string;
}

const AnimatedTabs = ({
    tabs,
    defaultTab,
    className,
}: AnimatedTabsProps) => {
    const [activeTab, setActiveTab] = useState<string>(defaultTab || tabs[0]?.id);

    if (!tabs?.length) return null;

    return (
        <div className={cn("w-full flex flex-col gap-y-4", className)}>
            <div className="flex gap-2 flex-wrap bg-zinc-900/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/5 w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "relative px-4 py-2 text-sm font-medium rounded-xl text-zinc-400 outline-none transition-colors hover:text-white",
                            activeTab === tab.id && "text-white"
                        )}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="active-tab"
                                className="absolute inset-0 bg-white/10 shadow-lg backdrop-blur-md rounded-xl"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10">{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="relative min-h-[400px]">
                <AnimatePresence mode="wait">
                    {tabs.map(
                        (tab) =>
                            activeTab === tab.id && (
                                <motion.div
                                    key={tab.id}
                                    initial={{
                                        opacity: 0,
                                        y: 10,
                                        filter: "blur(4px)",
                                    }}
                                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                                    transition={{
                                        duration: 0.3,
                                        ease: "easeInOut",
                                    }}
                                    className="w-full"
                                >
                                    {tab.content}
                                </motion.div>
                            )
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export { AnimatedTabs };
