"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Dashboard,
    Task,
    Settings as SettingsIcon,
    User as UserIcon,
    ChevronDown as ChevronDownIcon,
    Search as SearchIcon,
    Analytics,
    DocumentAdd,
    ChartBar,
    View,
    Security,
    Notification,
    Integration,
    CloudUpload,
    Folder,
    Calendar as CalendarIcon,
    Help,
    Idea,
    Flash,
    MediaLibrary,
    ModelBuilder,
    Chat,
    TextFill,
    Image as ImageIcon,
    VolumeUp,
    Video as VideoIcon,
    CenterCircle,
    Time,
    Money,
    Locked,
    Group,
    Logout,
    Asleep as Moon,
    Light as Sun,
    Cube
} from "@carbon/icons-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/dashboard/actions";
import { useAuthLoader } from "@/components/AuthLoader";


const softSpringEasing = "cubic-bezier(0.25, 1.1, 0.4, 1)";

/* ----------------------------- Components ----------------------------- */

function BrandBadge() {
    return (
        <div className="relative shrink-0 w-full mb-2">
            <div className="flex items-center p-1 w-full">
                <div className="h-10 w-10 flex items-center justify-center">
                    <img
                        src="/5.png"
                        alt="Logo"
                        className="w-full h-full object-contain scale-[2] origin-center -translate-y-5"
                    />
                </div>
                <div className="px-2 py-1">
                    <div className="font-['Lexend:SemiBold',_sans-serif] text-[18px] text-zinc-50 dark:text-zinc-50 tracking-tight">
                        Rive AI
                    </div>
                </div>
            </div>
        </div>
    );
}

interface SidebarV2Props {
    email: string;
    fullName: string;
    avatarUrl?: string | null;
    conversations: any[];
    recentImages: any[];
    recentSpeech: any[];
    recentVideos: any[];
}

export function SidebarV2({
    email,
    fullName,
    avatarUrl,
    conversations,
    recentImages,
    recentSpeech,
    recentVideos
}: SidebarV2Props) {
    const { theme, setTheme } = useTheme();
    const { showLoader } = useAuthLoader();
    const pathname = usePathname();
    const router = useRouter();
    const [activeRail, setActiveRail] = useState("home");

    const handleLogout = async () => {
        showLoader("Signing out of your session...");
        await logoutAction();
    };
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [mounted, setMounted] = useState(false);
    const logoVideoRef = useRef<HTMLVideoElement>(null);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Determine active rail based on pathname initially
    useEffect(() => {
        if (pathname === "/dashboard") setActiveRail("home");
        else if (pathname.startsWith("/dashboard/text") ||
            pathname.startsWith("/dashboard/image") ||
            pathname.startsWith("/dashboard/video") ||
            pathname.startsWith("/dashboard/enhance")) setActiveRail("tools");
        else if (pathname.startsWith("/dashboard/credits") || 
                 pathname.startsWith("/dashboard/billing") || 
                 pathname.startsWith("/dashboard/pricing")) setActiveRail("account");
        else if (pathname.startsWith("/dashboard/privacy") ||
            pathname.startsWith("/dashboard/security") ||
            pathname.startsWith("/dashboard/terms")) setActiveRail("legal");
        else if (pathname.startsWith("/dashboard/profile") ||
            pathname.startsWith("/dashboard/support") ||
            pathname.startsWith("/dashboard/api")) setActiveRail("settings");
    }, [pathname]);

    const toggleExpanded = (itemKey: string) => {
        setExpandedItems((prev) => {
            const next = new Set(prev);
            if (next.has(itemKey)) next.delete(itemKey);
            else next.add(itemKey);
            return next;
        });
    };

    const navRailItems = [
        {
            id: "home",
            icon: <Dashboard size={20} />,
            label: "Dashboard",
            href: "/dashboard",
            activeClass: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
        },
        {
            id: "tools",
            icon: <Flash size={20} />,
            label: "AI Tools",
            href: "/dashboard/text",
            activeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
        },
        {
            id: "account",
            icon: <Money size={20} />,
            label: "Account",
            href: "/dashboard/credits",
            activeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
        },
        {
            id: "legal",
            icon: <Security size={20} />,
            label: "Legal",
            href: "/dashboard/privacy",
            activeClass: "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
        },
        {
            id: "settings",
            icon: <SettingsIcon size={20} />,
            label: "Settings",
            href: "/dashboard/profile",
            activeClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
        },
    ];

    const getSubContent = () => {
        switch (activeRail) {
            case "home":
                return {
                    title: "Dashboard",
                    sections: [
                        {
                            title: "Overview",
                            items: [
                                { icon: <View size={16} />, label: "General Insights", href: "/dashboard" },
                                { icon: <ChartBar size={16} />, label: "Usage Stats", href: "/dashboard" },
                            ]
                        }
                    ]
                };
            case "tools":
                return {
                    title: "AI Workflows",
                    sections: [
                        {
                            title: "Generators",
                            items: [
                                { icon: <Chat size={16} />, label: "Text Generator", href: "/dashboard/text" },
                                { icon: <ImageIcon size={16} />, label: "Prompt to Image", href: "/dashboard/image-prompt" },
                                { icon: <ModelBuilder size={16} />, label: "AI Enhance", href: "/dashboard/enhance" },
                                { icon: <VolumeUp size={16} />, label: "Audio Editor", href: "/dashboard/text-to-speech" },
                                { icon: <VideoIcon size={16} />, label: "Video Generator", href: "/dashboard/video" },
                                { icon: <Cube size={16} />, label: "3D Generator", href: "/dashboard/3d" },
                            ]
                        }
                    ]
                };
            case "account":
                return {
                    title: "Account",
                    sections: [
                        {
                            title: "Credits",
                            items: [
                                { icon: <Time size={16} />, label: "History Log", href: "/dashboard/credits" },
                            ]
                        },
                        {
                            title: "Plan & Billing",
                            items: [
                                { icon: <View size={16} />, label: "Pricing Plans", href: "/dashboard/pricing" },
                                { icon: <Money size={16} />, label: "Billing", href: "/dashboard/billing" },
                            ]
                        }
                    ]
                };
            case "legal":
                return {
                    title: "Legal Policy",
                    sections: [
                        {
                            title: "Documents",
                            items: [
                                { icon: <Locked size={16} />, label: "Privacy Policy", href: "/dashboard/privacy" },
                                { icon: <Security size={16} />, label: "Security & Safety", href: "/dashboard/security" },
                                { icon: <DocumentAdd size={16} />, label: "Terms of Service", href: "/dashboard/terms" },
                            ]
                        }
                    ]
                };
            case "settings":
                return {
                    title: "System Settings",
                    sections: [
                        {
                            title: "User Profile",
                            items: [
                                { icon: <UserIcon size={16} />, label: "Profile Edit", href: "/dashboard/profile" },
                                { icon: <Help size={16} />, label: "Support & Help", href: "/dashboard/support" },
                            ]
                        },
                        {
                            title: "Developers",
                            items: [
                                { icon: <Integration size={16} />, label: "API Keys", href: "/dashboard/api" },
                                { icon: <DocumentAdd size={16} />, label: "API Documentation", href: "/dashboard/docs" },
                            ]
                        }
                    ]
                };
            default:
                return { title: "", sections: [] };
        }
    };

    const subContent = getSubContent();

    if (!mounted) return <div className="flex h-screen bg-white dark:bg-black" />;

    return (
        <div className="flex flex-row h-screen bg-white dark:bg-black overflow-hidden select-none border-r border-zinc-200 dark:border-white/5">
            {/* ── RAIL NAVIGATION ── */}
            <aside className="w-16 flex flex-col items-center py-6 gap-3 border-r border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950/20">
                <div className="mb-6 mt-1">
                    <div className="h-5 w-8 flex items-center justify-center z-10">
                        
                        <video
                            ref={logoVideoRef}
                            src="/logovd.mp4"
                            muted
                            playsInline
                            className="w-full h-full object-contain scale-[2.2] origin-center -translate-y-1 cursor-pointer"
                            onMouseEnter={() => logoVideoRef.current?.play()}
                            onMouseLeave={() => {
                                if (logoVideoRef.current) {
                                    logoVideoRef.current.pause();
                                    logoVideoRef.current.currentTime = 0;
                                }
                            }}
                        />
                    </div>
                </div>

                {navRailItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            setActiveRail(item.id);
                            if (item.href) router.push(item.href);
                            setIsCollapsed(false);
                        }}
                        className={cn(
                            "group relative p-2.5 rounded-xl transition-all duration-300 border border-transparent",
                            activeRail === item.id
                                ? item.activeClass
                                : "text-zinc-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-white/5"
                        )}
                    >
                        {item.icon}

                        {/* Tooltip */}
                        <div className="absolute left-full ml-4 px-2 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-200 text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 pointer-events-none z-[100] shadow-xl whitespace-nowrap">
                            {item.label}
                            {/* Arrow */}
                            <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-white dark:bg-zinc-900 border-l border-b border-zinc-200 dark:border-white/10 rotate-45"></div>
                        </div>
                    </button>
                ))}

                <div className="mt-auto flex flex-col gap-3 items-center">
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="group relative p-2.5 rounded-xl text-zinc-400 dark:text-zinc-500 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-400/5 transition-all"
                    >
                        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                        {/* Tooltip */}
                        <div className="absolute left-full ml-4 px-2 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-amber-500 dark:text-amber-400 text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 pointer-events-none z-[100] shadow-xl whitespace-nowrap">
                            Switch to {theme === "dark" ? "Light" : "Dark"} Mode
                            <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-white dark:bg-zinc-900 border-l border-b border-zinc-200 dark:border-white/10 rotate-45"></div>
                        </div>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="group relative p-2.5 rounded-xl text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/5 transition-all"
                    >
                        <Logout size={20} />
                        {/* Tooltip */}
                        <div className="absolute left-full ml-4 px-2 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 pointer-events-none z-[100] shadow-xl whitespace-nowrap">
                            Sign Out
                            <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-white dark:bg-zinc-900 border-l border-b border-zinc-200 dark:border-white/10 rotate-45"></div>
                        </div>
                    </button>
                    <div className="size-8 rounded-full overflow-hidden border border-zinc-200 dark:border-white/10 shadow-sm">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="avatar" className="size-full object-cover" />
                        ) : (
                            <div className="size-full bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                                {fullName.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* ── DETAIL SIDEBAR ── */}
            <aside
                className={cn(
                    "flex flex-col gap-4 bg-white dark:bg-black p-4 transition-all duration-500 ease-[cubic-bezier(0.25,1.1,0.4,1)]",
                    isCollapsed ? "w-0 p-0 opacity-0 overflow-hidden" : "w-64"
                )}
            >
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest px-2">
                        {subContent.title}
                    </h2>
                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-400 dark:text-zinc-500 transition-colors"
                    >
                        <ChevronDownIcon size={16} className="rotate-90" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar">
                    {subContent.sections.map((section, idx) => (
                        <div key={idx} className="space-y-1">
                            <p className="px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-2">
                                {section.title}
                            </p>
                            {section.items.map((item: any, iIdx: number) => {
                                const itemKey = `${section.title}-${iIdx}`;
                                const isExpanded = expandedItems.has(itemKey);
                                const isActive = pathname === item.href;

                                return (
                                    <div key={iIdx} className="space-y-1">
                                        <div
                                            onClick={() => {
                                                if (item.hasDropdown) toggleExpanded(itemKey);
                                                else if (item.href) router.push(item.href);
                                            }}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all group",
                                                isActive ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-100" : "hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                                            )}
                                        >
                                            <div className={cn("transition-colors", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300")}>
                                                {item.icon}
                                            </div>
                                            <span className="text-sm font-medium flex-1 truncate">{item.label}</span>
                                            {item.hasDropdown && (
                                                <ChevronDownIcon
                                                    size={14}
                                                    className={cn("transition-transform duration-300", isExpanded ? "rotate-180" : "")}
                                                />
                                            )}
                                        </div>

                                        {isExpanded && item.children && (
                                            <div className="ml-9 space-y-1 border-l border-zinc-100 dark:border-white/5 pl-2">
                                                {item.children.map((child: any, cIdx: number) => (
                                                    <Link
                                                        key={cIdx}
                                                        href={child.href || "#"}
                                                        className="block px-2 py-1.5 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors truncate"
                                                    >
                                                        {child.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </aside>

            {/* ── EXPAND TOGGLE (When collapsed) ── */}
            {isCollapsed && (
                <div className="absolute left-16 top-6 z-[9999]">
                    <button
                        onClick={() => setIsCollapsed(false)}
                        className="p-2 bg-[#6B0BE4] text-white rounded-r-lg shadow-lg hover:bg-[#C195FF] transition-all animate-in slide-in-from-left-4"
                    >
                        <ChevronDownIcon size={16} className="-rotate-90" />
                    </button>
                </div>
            )}
        </div>
    );
}
