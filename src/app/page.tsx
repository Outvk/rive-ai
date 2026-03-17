"use client"

import React from 'react';
import CardNav from '@/components/CardNav';
import FloatingLines from '@/components/FloatingLines';
import RuixenMoonChat from '@/components/ui/ruixen-moon-chat';
import ClippingText from '@/components/ui/ClippingText';
import GridScroll from '@/components/ui/GridScroll';
import Comparator from '@/components/ui/Comparator';
import VideoRevealText from '@/components/ui/VideoRevealText';
import OnionSkinDepth from '@/components/ui/OnionSkinDepth';
import ToolsRevealText from '@/components/ui/ToolsRevealText';
import HorizontalShowcase from '@/components/ui/HorizontalShowcase';
import GradualBlur from '@/components/ui/GradualBlur';
import { FlickeringFooter } from '@/components/ui/flickering-footer';
import '@/components/ui/OfferButton.css';
import { useAuthLoader } from '@/components/AuthLoader';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const { showLoader } = useAuthLoader();
  const router = useRouter();

  const handleStartClick = () => {
    showLoader("Initializing your creative workspace...");
    setTimeout(() => {
      router.push('/login');
    }, 100);
  };

  const navItems = [
    {
      label: "Product",
      bgColor: "#111111",
      textColor: "#fff",
      links: [
        { label: "Text Generation", href: "/dashboard/text", ariaLabel: "Text Generator" },
        { label: "Image Generation", href: "/dashboard/image-prompt", ariaLabel: "Image Generator" },
        { label: "Text to Speech", href: "/dashboard/text-to-speech", ariaLabel: "Audio Generator" },
      ]
    },
    {
      label: "Developers",
      bgColor: "#1a1625",
      textColor: "#fff",
      links: [
        { label: "API Reference", href: "/dashboard/docs", ariaLabel: "API Reference" },
        { label: "SDKs & Tools", href: "/dashboard/docs", ariaLabel: "SDKs" },
        { label: "Pricing", href: "/dashboard/pricing", ariaLabel: "Pricing Plans" },
      ]
    },
    {
      label: "Company",
      bgColor: "#1e1e24",
      textColor: "#fff",
      links: [
        { label: "About Us", href: "/dashboard", ariaLabel: "About us" },
        { label: "Privacy Policy", href: "/dashboard/privacy", ariaLabel: "Privacy Privacy" },
        { label: "Terms of Service", href: "/dashboard/terms", ariaLabel: "Terms of Service" }
      ]
    }
  ];

  return (
    <div className="bg-[#030303] text-zinc-200 font-sans selection:bg-indigo-500/30 flex flex-col isolate relative w-full pt-20">

      {/* Absolute Background - Stays at the top */}
      <div className="absolute inset-0 z-0 h-screen pointer-events-none ">
        <FloatingLines
          enabledWaves={["middle"]}
          lineCount={12}
          lineDistance={1}
          bendRadius={6}
          bendStrength={-1}
          interactive={true}
          parallax={true}
          parallaxStrength={0.15}
          scrollParallax={false}
          scrollParallaxStrength={0.5}
          animationSpeed={1.5}
          middleWavePosition={{ x: 5.0, y: 0.0, rotate: 0 }}
          linesGradient={["#7405FF", "#15002F", "#C190FF"]}
        />
      </div>
      {/* Custom Interactive Navigation */}
      <CardNav
        items={navItems}
        ease="expo.inOut"
        baseColor="rgba(10, 10, 10, 0.6)"
        menuColor="#fff"
      />

      {/* Main Content Area - AI Chat UI */}
      <main className="flex-1 w-full flex flex-col items-center mt-32 px-4 relative z-10 pointer-events-none">

        {/* Hero Text */}
        <div className="text-center mb-16 max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 pointer-events-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            What will you build today?
          </h1>
          <p className="text-zinc-400 text-lg sm:text-xl">
            Create stunning apps & websites by chatting with AI.
          </p>
        </div>

        <div className="pointer-events-auto w-full flex justify-center">
          <RuixenMoonChat />
        </div>
      </main>



      {/* Dynamic grid reveal effect */}
      <GridScroll />

      {/* CSS Scroll-Driven Comparator */}
      <Comparator />

      {/* Video Reveal Text */}
      <VideoRevealText />

      {/* Interactive 3D Stack */}
      <OnionSkinDepth />

      {/* Tools Reveal Text */}
      <ToolsRevealText />

      {/* Pinned horizontal features showcase */}
      <HorizontalShowcase />

      {/* Scroll-driven text masking effect */}
      <ClippingText />

      {/* CTA Section */}
      <div className="relative z-10 w-full bg-black/60 py-20 px-4 flex flex-col items-center border-t border-white/5">
        <div className="w-full max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to launch?</h2>
          <p className="text-zinc-500 mb-8 max-w-lg mx-auto">
            Join thousands of developers building the future of the web with Rive AI.
          </p>
          <div className="flex justify-center mt-12">
            <div className="btn-container" onClick={handleStartClick}>
              <div className="btn-drawer transition-top">Enjoy</div>
              <div className="btn-drawer transition-bottom">Your journey</div>

              <button className="btn">
                <span className="btn-text">Get Started</span>
              </button>

              {[...Array(4)].map((_, i) => (
                <svg
                  key={i}
                  className="btn-corner"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="-1 1 32 32"
                >
                  <path
                    d="M32,32C14.355,32,0,17.645,0,0h.985c0,17.102,13.913,31.015,31.015,31.015v.985Z"
                  />
                </svg>
              ))}
            </div>
          </div>
        </div>
      </div>

      <FlickeringFooter />

      {/* Modern Gradual Blur Overlay for bottom of viewport */}
      <GradualBlur preset="page-footer" zIndex={50} strength={3} height="3rem" />
    </div>
  );
}
