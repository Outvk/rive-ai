import React from 'react';
import FloatingLines from '@/components/FloatingLines';
import RuixenMoonChat from '@/components/ui/ruixen-moon-chat';
import ClippingText from '@/components/ui/ClippingText';
import GridScroll from '@/components/ui/GridScroll';
import Comparator from '@/components/ui/Comparator';
import VideoRevealText from '@/components/ui/VideoRevealText';
import OnionSkinDepth from '@/components/ui/OnionSkinDepth';
import ToolsRevealText from '@/components/ui/ToolsRevealText';
import HorizontalShowcase from '@/components/ui/HorizontalShowcase';
import CubeGallery from '@/components/ui/CubeGallery';
import ShowcaseOutro from '@/components/ui/ShowcaseOutro';
import GradualBlur from '@/components/ui/GradualBlur';
import { FlickeringFooter } from '@/components/ui/flickering-footer';
import '@/components/ui/OfferButton.css';
import LandingClientWrapper, { StartJourneyButton } from '@/components/landing/LandingClientComponents';
import { Metadata } from 'next';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Rive AI',
  description: 'Create stunning apps & websites by chatting with AI. High-performance creative engines for text, images, and 3D assets.',
  url: 'https://rive-ai.vercel.app',
  applicationCategory: 'MultimediaApplication, CreativePlatform, AIApplication',
  operatingSystem: 'All',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'AI Text Generation',
    'AI Image Synthesis',
    'Text-to-Speech Conversion',
    '3D Asset Generation',
    'Instant Video Crafting'
  ],
}

export const metadata: Metadata = {
  title: 'Rive AI - The Future of Digital Creation',
  description: 'Create stunning apps & websites by chatting with AI. High-performance creative engines for text, images, and 3D assets.',
  openGraph: {
    title: 'Rive AI - The Future of Digital Creation',
    description: 'Create stunning apps & websites by chatting with AI.',
    url: 'https://rive-ai.vercel.app',
    siteName: 'Rive AI',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
}

export default function LandingPage() {
  const navItems = [
    {
      label: "Company",
      bgColor: "#000",
      textColor: "#fff",
      videoSrc: "/gif/company.mp4",
      links: [
        { label: "About Us", href: "/dashboard", ariaLabel: "About us" },
        { label: "Privacy Policy", href: "/dashboard/privacy", ariaLabel: "Privacy Privacy" },
        { label: "Terms of Service", href: "/dashboard/terms", ariaLabel: "Terms of Service" }
      ]
    },
    {
      label: "Playground",
      bgColor: "#000",
      textColor: "#fff",
      videoSrc: "/gif/product.mp4",
      links: [
        { label: "Text Generation", href: "/dashboard/text", ariaLabel: "Text Generator" },
        { label: "Image Generation", href: "/dashboard/image-prompt", ariaLabel: "Image Generator" },
        { label: "Text to Speech", href: "/dashboard/text-to-speech", ariaLabel: "Audio Generator" },
      ]
    },
    {
      label: "Developers",
      bgColor: "#000",
      textColor: "#fff",
      videoSrc: "/gif/developpers.mp4",
      links: [
        { label: "API Reference", href: "/dashboard/docs", ariaLabel: "API Reference" },
        { label: "SDKs & Tools", href: "/dashboard/docs", ariaLabel: "SDKs" },
        { label: "Pricing", href: "/dashboard/pricing", ariaLabel: "Pricing Plans" },
      ]
    }
  ];

  return (
    <div className="bg-[#030303] text-zinc-200 font-sans selection:bg-indigo-500/30 flex flex-col isolate relative w-full pt-20">
      {/* JSON-LD Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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

      {/* Custom Interactive Navigation Wrapper */}
      <LandingClientWrapper navItems={navItems} />

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

      {/* 3D Cube Gallery with scroll-driven rotation */}
      <CubeGallery />

      {/* Scroll-driven text masking effect */}
      <ClippingText />

      {/* Outro marketing section */}
      <ShowcaseOutro />

      {/* CTA Section */}
      <div className="relative z-10 w-full bg-black/60 py-20 px-4 flex flex-col items-center border-t border-white/5">
        <div className="w-full max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to launch?</h2>
          <p className="text-zinc-500 mb-8 max-w-lg mx-auto">
            Join thousands of developers building the future of the web with Rive AI.
          </p>
          <div className="flex justify-center mt-12">
             <StartJourneyButton />
          </div>
        </div>
      </div>

      <FlickeringFooter />

      {/* Modern Gradual Blur Overlay for bottom of viewport */}
      <GradualBlur preset="page-footer" zIndex={50} strength={3} height="3rem" />
    </div>
  );
}
