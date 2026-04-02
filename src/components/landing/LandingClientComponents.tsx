"use client"

import React from 'react';
import CardNav from '@/components/CardNav';
import { useAuthLoader } from '@/components/AuthLoader';
import { useRouter } from 'next/navigation';
import '@/components/ui/OfferButton.css';

interface LandingClientWrapperProps {
  navItems: any[];
}

export default function LandingClientWrapper({ navItems }: LandingClientWrapperProps) {
  const { showLoader } = useAuthLoader();
  const router = useRouter();

  const handleStartClick = () => {
    showLoader("Initializing your creative workspace...");
    setTimeout(() => {
      router.push('/login');
    }, 100);
  };

  return (
    <>
      <CardNav
        items={navItems}
        ease="expo.inOut"
        baseColor="rgba(10, 10, 10, 0.75)"
        menuColor="#fff"
      />
      
      {/* This invisible overlay allows us to keep the handleStartClick accessible globally if needed, 
          but primarily handles the bottom CTA button click */}
      <style jsx global>{`
        .cta-trigger {
          cursor: pointer;
        }
      `}</style>
      
      {/* We'll use a portal or state-based approach if we need to trigger this from the server component,
          but for now, we'll just wrap the button in the server component with a client-side click handler 
          via a small wrapper. */}
    </>
  );
}

export function StartJourneyButton() {
  const { showLoader } = useAuthLoader();
  const router = useRouter();

  const handleStartClick = () => {
    showLoader("Initializing your creative workspace...");
    setTimeout(() => {
      router.push('/login');
    }, 100);
  };

  return (
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
  );
}
