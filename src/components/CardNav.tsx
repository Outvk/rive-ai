"use client"

import { useLayoutEffect, useRef, useState, ReactNode } from 'react';
import { gsap } from 'gsap';
import { GoArrowUpRight } from 'react-icons/go';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuthLoader } from '@/components/AuthLoader';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import './CardNav.css';

interface NavLink {
    label: string;
    href: string;
    ariaLabel?: string;
}

interface NavItem {
    label: string;
    bgColor?: string;
    textColor?: string;
    links?: NavLink[];
    videoSrc?: string;
}

interface CardNavProps {
    items: NavItem[];
    className?: string;
    ease?: string;
    baseColor?: string;
    menuColor?: string;
    buttonColor?: string;
}

export default function CardNav({
    items,
    className = '',
    ease = 'power3.out',
    baseColor = '#030303',
    menuColor = '#fff',
    buttonColor = '#fff',
}: CardNavProps) {
    const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const navRef = useRef<HTMLElement>(null);
    const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
    const tlRef = useRef<gsap.core.Timeline | null>(null);
    const lastScrollY = useRef(0);
    const [isVisible, setIsVisible] = useState(true);
    const { showLoader } = useAuthLoader();
    const router = useRouter();

    useLayoutEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                // Scrolling down - hide navbar
                setIsVisible(false);
            } else {
                // Scrolling up - show navbar
                setIsVisible(true);
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLoginClick = (e: React.MouseEvent) => {
        e.preventDefault();
        showLoader("Preparing your creative session...");
        setTimeout(() => {
            router.push('/login');
        }, 100);
    };

    const calculateHeight = () => {
        const navEl = navRef.current;
        if (!navEl) return 260;

        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        if (isMobile) {
            const contentEl = navEl.querySelector('.card-nav-content') as HTMLElement;
            if (contentEl) {
                const wasVisible = contentEl.style.visibility;
                const wasPointerEvents = contentEl.style.pointerEvents;
                const wasPosition = contentEl.style.position;
                const wasHeight = contentEl.style.height;

                contentEl.style.visibility = 'visible';
                contentEl.style.pointerEvents = 'auto';
                contentEl.style.position = 'static';
                contentEl.style.height = 'auto';

                // Trigger reflow
                void contentEl.offsetHeight;

                const topBar = 60;
                const padding = 16;
                const contentHeight = contentEl.scrollHeight;

                contentEl.style.visibility = wasVisible;
                contentEl.style.pointerEvents = wasPointerEvents;
                contentEl.style.position = wasPosition;
                contentEl.style.height = wasHeight;

                return topBar + contentHeight + padding;
            }
        }
        return 260; // Desktop height
    };

    const createTimeline = () => {
        const navEl = navRef.current;
        if (!navEl) return null;

        gsap.set(navEl, { height: 60, });
        gsap.set(cardsRef.current, { y: 50, opacity: 0 });

        const tl = gsap.timeline({ paused: true });

        tl.to(navEl, {
            height: calculateHeight,
            duration: 0.4,
            ease
        });

        tl.to(cardsRef.current, {
            y: 0,
            opacity: 1,
            duration: 0.4,
            ease,
            stagger: 0.08
        }, '-=0.1');

        return tl;
    };

    useLayoutEffect(() => {
        const tl = createTimeline();
        tlRef.current = tl;

        return () => {
            tl?.kill();
            tlRef.current = null;
        };
    }, [ease, items]);

    useLayoutEffect(() => {
        const handleResize = () => {
            if (!tlRef.current) return;

            if (isExpanded) {
                const newHeight = calculateHeight();
                gsap.set(navRef.current, { height: newHeight });

                tlRef.current.kill();
                const newTl = createTimeline();
                if (newTl) {
                    newTl.progress(1);
                    tlRef.current = newTl;
                }
            } else {
                tlRef.current.kill();
                const newTl = createTimeline();
                if (newTl) {
                    tlRef.current = newTl;
                }
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isExpanded]);

    const toggleMenu = () => {
        const tl = tlRef.current;
        if (!tl) return;

        if (!isExpanded) {
            setIsHamburgerOpen(true);
            setIsExpanded(true);
            tl.play(0);
        } else {
            setIsHamburgerOpen(false);
            tl.eventCallback('onReverseComplete', () => setIsExpanded(false));
            tl.reverse();
        }
    };

    const handleLogoToggle = (e: React.MouseEvent) => {
        // Only trigger minimize if it's NOT expanded (or close expanded first)
        if (isExpanded) {
            toggleMenu();
        }
        setIsMinimized(!isMinimized);
    };

    const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget;
        const video = card.querySelector('.nav-card-video');
        if (!video) return;

        const { left, top, width, height } = card.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;

        gsap.to(video, {
            x: x * 20,
            y: y * 20,
            rotationX: -y * 10,
            rotationY: x * 10,
            duration: 0.4,
            ease: 'power2.out'
        });
    };

    const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        const video = e.currentTarget.querySelector('.nav-card-video');
        if (!video) return;

        gsap.to(video, {
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            duration: 0.6,
            ease: 'power2.out'
        });
    };

    const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
        cardsRef.current[i] = el;
    };

    return (
        <div className={cn("card-nav-container", className, (!isVisible && !isExpanded) && "nav-hidden", isMinimized && "minimized")}>
            <nav
                ref={navRef}
                className={cn("card-nav transition-all duration-500", isExpanded && "open", isMinimized && "logo-only")}
            >
                <div className="card-nav-blur" style={{ backgroundColor: baseColor }} />
                <div className="card-nav-top">
                    {/* Left Controls: Hamburger */}
                    <div className={cn("nav-controls-left transition-all duration-500", isMinimized ? "opacity-0 pointer-events-none scale-75 -translate-x-12 duration-0" : "opacity-100")}>
                        <div className="relative">
                            <div className={cn("relative w-20 h-11 rounded-xl overflow-hidden cursor-pointer transition-all duration-500 group flex items-center justify-center", isHamburgerOpen && "open")}
                                onClick={toggleMenu}
                                role="button"
                                aria-label={isExpanded ? 'Close menu' : 'Open menu'}
                                tabIndex={0}
                            >
                                <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-b from-[#7405FF] via-[#15002F] to-[#C190FF]">
                                    <div className="absolute inset-0 bg-[#15002F] rounded-xl opacity-90"></div>
                                </div>
                                <div className="absolute inset-[1px] bg-[#15002F] rounded-xl opacity-95"></div>
                                <div className="absolute inset-[1px] bg-gradient-to-r from-[#15002F] via-[#7405FF] to-[#C190FF] rounded-xl opacity-90 animate-button-gradient"></div>
                                <div className="absolute inset-[1px] bg-gradient-to-b from-[#7405FF]/30 via-transparent to-[#C190FF]/20 rounded-xl opacity-80"></div>
                                <div className="absolute inset-[1px] shadow-[inset_0_0_15px_rgba(116,5,255,0.2)] rounded-xl"></div>

                                <div className={cn("relative flex flex-col items-center justify-center w-7 h-5 transition-transform duration-300", isHamburgerOpen && "scale-90")}>
                                    <div className={cn("absolute w-7 h-0.5 bg-white rounded-full transition-all duration-300", isHamburgerOpen ? "rotate-45" : "-translate-y-1")} />
                                    <div className={cn("absolute w-7 h-0.5 bg-white rounded-full transition-all duration-300", isHamburgerOpen ? "-rotate-45" : "translate-y-1")} />
                                </div>
                                <div className="absolute inset-[1px] opacity-0 transition-opacity duration-300 bg-gradient-to-r from-[#7405FF]/20 via-[#C190FF]/10 to-[#7405FF]/20 group-hover:opacity-100 rounded-xl"></div>
                            </div>
                            <span className="nav-menu-badge text-white">{`{NEW}`}</span>
                        </div>
                    </div>

                    {/* Logo: The Minimizer Toggle */}
                    <button
                        onClick={handleLogoToggle}
                        className="logo-container group md:absolute md:left-1/2 md:-translate-x-1/2 transition-all duration-500 bg-transparent border-none p-0 cursor-pointer"
                        title={isMinimized ? "Show menu" : "Show logo only"}
                    >
                        <img
                            src="/Comp-2.gif"
                            alt="Rive AI Logo"
                            className="object-contain"
                        />
                    </button>

                    {/* Right Controls: Start Building CTA */}
                    <div className={cn("nav-controls-right flex items-center gap-3 transition-all duration-500", isMinimized ? "opacity-0 pointer-events-none scale-75 translate-x-12 duration-0" : "opacity-100")}>
                        <Link 
                            href="/login" 
                            onClick={handleLoginClick}
                            className="relative h-11 px-7 rounded-xl overflow-hidden transition-all duration-500 group flex items-center justify-center border-none"
                        >
                            <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-b from-[#7405FF] via-[#15002F] to-[#C190FF]">
                                <div className="absolute inset-0 bg-[#15002F] rounded-xl opacity-90"></div>
                            </div>
                            <div className="absolute inset-[1px] bg-[#15002F] rounded-xl opacity-95"></div>
                            <div className="absolute inset-[1px] bg-gradient-to-r from-[#15002F] via-[#7405FF] to-[#C190FF] rounded-xl opacity-90 animate-button-gradient"></div>
                            <div className="absolute inset-[1px] bg-gradient-to-b from-[#7405FF]/30 via-transparent to-[#C190FF]/20 rounded-xl opacity-80"></div>
                            <div className="absolute inset-[1px] bg-gradient-to-br from-[#7405FF]/10 via-transparent to-[#C190FF]/10 rounded-xl"></div>
                            <div className="absolute inset-[1px] shadow-[inset_0_0_20px_rgba(116,5,255,0.2)] rounded-xl"></div>
                            <div className="relative flex items-center justify-center gap-2 text-white">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2.5}
                                    stroke="currentColor"
                                    className="w-4 h-4 text-[#E9D5FF] drop-shadow-[0_0_12px_rgba(193,144,255,0.9)]"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                                    />
                                </svg>
                                <span className="text-sm font-semibold tracking-tight">
                                    Start building now
                                </span>
                            </div>
                            <div className="absolute inset-[1px] opacity-0 transition-opacity duration-300 bg-gradient-to-r from-[#7405FF]/20 via-[#C190FF]/10 to-[#7405FF]/20 group-hover:opacity-100 rounded-xl"></div>
                        </Link>
                    </div>
                </div>

                <div className="card-nav-content" aria-hidden={!isExpanded}>
                    {(items || []).slice(0, 3).map((item, idx) => (
                        <div
                            key={`${item.label}-${idx}`}
                            className="nav-card"
                            ref={setCardRef(idx)}
                            style={{ backgroundColor: item.bgColor || 'rgba(255,255,255,0.05)', color: item.textColor || '#fff' }}
                            onMouseMove={handleCardMouseMove}
                            onMouseLeave={handleCardMouseLeave}
                        >
                            <div className="nav-card-label">{item.label}</div>
                            {item.videoSrc && (
                                <div className="nav-card-video">
                                    <video
                                        src={item.videoSrc}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        preload="auto"
                                    />
                                </div>
                            )}
                            <div className="nav-card-links">
                                {item.links?.map((lnk, i) => (
                                    <Link
                                        key={`${lnk.label}-${i}`}
                                        href={lnk.href}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            showLoader(`Opening ${lnk.label}...`);
                                            setTimeout(() => router.push(lnk.href), 100);
                                        }}
                                        className="nav-card-link"
                                        aria-label={lnk.ariaLabel}
                                    >
                                        <GoArrowUpRight className="nav-card-link-icon" aria-hidden="true" />
                                        {lnk.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </nav>
        </div>
    );
}
