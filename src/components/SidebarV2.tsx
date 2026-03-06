"use client";

import React, { useState, useEffect } from "react";
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
    Logout
} from "@carbon/icons-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/dashboard/actions";

/** ======================= Local SVG paths (inline) ======================= */
const svgPaths = {
    p36880f80: "M0.32 0C0.20799 0 0.151984 0 0.109202 0.0217987C0.0715695 0.0409734 0.0409734 0.0715695 0.0217987 0.109202C0 0.151984 0 0.20799 0 0.32V6.68C0 6.79201 0 6.84801 0.0217987 6.8908C0.0409734 6.92843 0.0715695 6.95902 0.109202 0.9782C0.151984 7 0.207989 7 0.32 7L3.68 7C3.79201 7 3.84802 7 3.8908 6.9782C3.92843 6.95903 3.95903 6.92843 3.9782 6.8908C4 6.84801 4 6.79201 4 6.68V4.32C4 4.20799 4 4.15198 4.0218 4.1092C4.04097 4.07157 4.07157 4.04097 4.1092 4.0218C4.15198 4 4.20799 4 4.32 4L19.68 4C19.792 4 19.848 4 19.8908 4.0218C19.9284 4.04097 19.959 4.07157 19.9782 4.1092C20 4.15198 20 4.20799 20 4.32V6.68C20 6.79201 20 6.84802 20.0218 6.8908C20.041 6.92843 20.0716 6.95903 20.1092 6.9782C20.152 7 20.208 7 20.32 7L23.68 7C23.792 7 23.848 7 23.8908 6.9782C23.9284 6.95903 23.959 6.92843 23.9782 6.8908C24 6.84802 24 6.79201 24 6.68V0.32C24 0.20799 24 0.151984 23.9782 0.109202C23.959 0.0715695 23.9284 0.0409734 23.8908 0.0217987C23.848 0 23.792 0 23.68 0H0.32Z",
    p355df480: "M0.32 16C0.20799 16 0.151984 16 0.109202 15.9782C0.0715695 15.959 0.0409734 15.9284 0.0217987 15.8908C0 15.848 0 15.792 0 15.68V9.32C0 9.20799 0 9.15198 0.0217987 9.1092C0.0409734 9.07157 0.0715695 9.04097 0.0217987 9.02180C0.151984 9 0.207989 9 0.32 9H3.68C3.79201 9 3.84802 9 3.8908 9.0218C3.92843 9.04097 3.95903 9.07157 3.9782 9.1092C4 9.15198 4 9.20799 4 9.32V11.68C4 11.792 4 11.848 4.0218 11.8908C4.04097 11.9284 4.07157 11.959 4.1092 11.9782C4.15198 12 4.20799 12 4.32 12L19.68 12C19.792 12 19.848 12 19.8908 11.9782C19.9284 11.959 19.959 11.9284 19.9782 11.8908C20 11.848 20 11.792 20 11.68V9.32C20 9.20799 20 9.15199 20.0218 9.1092C20.041 9.07157 20.0716 9.04098 20.1092 9.0218C20.152 9 20.208 9 20.32 9H23.68C23.792 9 23.848 9 23.8908 9.0218C23.9284 9.04098 23.959 9.07157 23.9782 9.1092C24 9.15199 24 9.20799 24 9.32V15.68C24 15.792 24 15.848 23.9782 15.8908C23.959 15.9284 23.9284 15.959 23.8908 15.9782C23.848 16 23.792 16 23.68 16H0.32Z",
    pfa0d600: "M6.32 10C6.20799 10 6.15198 10 6.1092 9.9782C6.07157 9.95903 6.04097 9.92843 6.0218 9.8908C6 9.84802 6 9.79201 6 9.68C6 6.32 6 6.20799 6.0218 6.1092C6.04097 6.07157 6.07157 6.04097 6.1092 6.0218C6.15198 6 6.20799 6 6.32 6L17.68 6C17.792 6 17.848 6 17.8908 6.0218C17.9284 6.04097 17.959 6.07157 17.9782 6.1092C18 6.15198 18 6.20799 18 6.32V9.68C18 9.79201 18 9.84802 17.9782 9.8908C17.959 9.92843 17.9284 9.95903 17.8908 9.9782C17.848 10 17.792 10 17.68 10H6.32Z",
};

const softSpringEasing = "cubic-bezier(0.25, 1.1, 0.4, 1)";

/* ----------------------------- Components ----------------------------- */

function InterfacesLogoSquare() {
    return (
        <div className="aspect-[24/24] grow min-h-px min-w-px overflow-clip relative shrink-0 scale-110">
            <div className="absolute aspect-[24/16] left-0 right-0 top-1/2 -translate-y-1/2">
                <svg className="block size-full" fill="none" viewBox="0 0 24 16">
                    <g>
                        <path d={svgPaths.p36880f80} fill="#818cf8" />
                        <path d={svgPaths.p355df480} fill="#818cf8" />
                        <path d={svgPaths.pfa0d600} fill="#818cf8" />
                    </g>
                </svg>
            </div>
        </div>
    );
}

function BrandBadge() {
    return (
        <div className="relative shrink-0 w-full mb-2">
            <div className="flex items-center p-1 w-full">
                <div className="h-10 w-8 flex items-center justify-center pl-2">
                    <InterfacesLogoSquare />
                </div>
                <div className="px-2 py-1">
                    <div className="font-['Lexend:SemiBold',_sans-serif] text-[18px] text-zinc-50 tracking-tight">
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
    const pathname = usePathname();
    const router = useRouter();
    const [activeRail, setActiveRail] = useState("home");
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    // Determine active rail based on pathname initially
    useEffect(() => {
        if (pathname === "/dashboard") setActiveRail("home");
        else if (pathname.startsWith("/dashboard/text") ||
            pathname.startsWith("/dashboard/image") ||
            pathname.startsWith("/dashboard/video")) setActiveRail("tools");
        else if (pathname.startsWith("/dashboard/credits")) setActiveRail("account");
        else if (pathname.startsWith("/dashboard/privacy") ||
            pathname.startsWith("/dashboard/terms")) setActiveRail("legal");
        else if (pathname.startsWith("/dashboard/profile") ||
            pathname.startsWith("/dashboard/billing") ||
            pathname.startsWith("/dashboard/pricing")) setActiveRail("settings");
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
                                { icon: <Chat size={16} />, label: "Text Generator", href: "/dashboard/text", hasDropdown: conversations.length > 0, children: conversations.map(c => ({ label: c.title || "Untitled", href: `/dashboard/text?id=${c.id}` })) },
                                { icon: <ImageIcon size={16} />, label: "Prompt to Image", href: "/dashboard/image-prompt", hasDropdown: recentImages.length > 0, children: recentImages.map(img => ({ label: img.prompt || "Generated Image", href: "/dashboard/image-prompt" })) },
                                { icon: <VolumeUp size={16} />, label: "Text to Speech", href: "/dashboard/text-to-speech", hasDropdown: recentSpeech.length > 0, children: recentSpeech.map(s => ({ label: s.prompt || "Speech", href: "/dashboard/text-to-speech" })) },
                                { icon: <VideoIcon size={16} />, label: "Video Generator", href: "/dashboard/video", hasDropdown: recentVideos.length > 0, children: recentVideos.map(v => ({ label: v.prompt || "Video", href: "/dashboard/video" })) },
                            ]
                        }
                    ]
                };
            case "account":
                return {
                    title: "Transactions",
                    sections: [
                        {
                            title: "Credits",
                            items: [
                                { icon: <Time size={16} />, label: "History Log", href: "/dashboard/credits" },
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
                                { icon: <Money size={16} />, label: "Billing", href: "/dashboard/billing" },
                                { icon: <View size={16} />, label: "Pricing Plans", href: "/dashboard/pricing" },
                            ]
                        }
                    ]
                };
            default:
                return { title: "", sections: [] };
        }
    };

    const subContent = getSubContent();

    return (
        <div className="flex flex-row h-screen bg-black overflow-hidden select-none border-r border-white/5">
            {/* ── RAIL NAVIGATION ── */}
            <aside className="w-16 flex flex-col items-center py-6 gap-3 border-r border-white/5 bg-zinc-950/20">
                <div className="mb-4">
                    <InterfacesLogoSquare />
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
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                        )}
                    >
                        {item.icon}

                        {/* Tooltip */}
                        <div className="absolute left-full ml-4 px-2 py-1.5 bg-zinc-900 border border-white/10 text-zinc-200 text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 pointer-events-none z-[100] shadow-xl whitespace-nowrap">
                            {item.label}
                            {/* Arrow */}
                            <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-zinc-900 border-l border-b border-white/10 rotate-45"></div>
                        </div>
                    </button>
                ))}

                <div className="mt-auto flex flex-col gap-3 items-center">
                    <button
                        onClick={() => logoutAction()}
                        className="group relative p-2.5 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-400/5 transition-all"
                    >
                        <Logout size={20} />
                        {/* Tooltip */}
                        <div className="absolute left-full ml-4 px-2 py-1.5 bg-zinc-900 border border-white/10 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 pointer-events-none z-[100] shadow-xl whitespace-nowrap">
                            Sign Out
                            <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-zinc-900 border-l border-b border-white/10 rotate-45"></div>
                        </div>
                    </button>
                    <div className="size-8 rounded-full overflow-hidden border border-white/10">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="avatar" className="size-full object-cover" />
                        ) : (
                            <div className="size-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">
                                {fullName.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* ── DETAIL SIDEBAR ── */}
            <aside
                className={cn(
                    "flex flex-col gap-4 bg-black p-4 transition-all duration-500 ease-[cubic-bezier(0.25,1.1,0.4,1)]",
                    isCollapsed ? "w-0 p-0 opacity-0 overflow-hidden" : "w-64"
                )}
            >
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest px-2">
                        {subContent.title}
                    </h2>
                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 transition-colors"
                    >
                        <ChevronDownIcon size={16} className="rotate-90" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar">
                    {subContent.sections.map((section, idx) => (
                        <div key={idx} className="space-y-1">
                            <p className="px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">
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
                                                isActive ? "bg-indigo-500/10 text-indigo-100" : "hover:bg-white/5 text-zinc-400 hover:text-zinc-200"
                                            )}
                                        >
                                            <div className={cn("transition-colors", isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300")}>
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
                                            <div className="ml-9 space-y-1 border-l border-white/5 pl-2">
                                                {item.children.map((child: any, cIdx: number) => (
                                                    <Link
                                                        key={cIdx}
                                                        href={child.href || "#"}
                                                        className="block px-2 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors truncate"
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
                        className="p-2 bg-indigo-500 text-white rounded-r-lg shadow-lg hover:bg-indigo-600 transition-all animate-in slide-in-from-left-4"
                    >
                        <ChevronDownIcon size={16} className="-rotate-90" />
                    </button>
                </div>
            )}
        </div>
    );
}
