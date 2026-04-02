"use client";

import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { useAuthLoader } from '@/components/AuthLoader';
import { useRouter } from 'next/navigation';
import './ClippingText.css';

gsap.registerPlugin(ScrollTrigger);

export default function ClippingText() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { showLoader } = useAuthLoader();
  const router = useRouter();

  const handleNavClick = (e: React.MouseEvent, href: string, label: string) => {
    e.preventDefault();
    showLoader(`Transitioning to ${label}...`);
    setTimeout(() => {
      router.push(href);
    }, 100);
  };

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const textElements = gsap.utils.toArray('.clipping-text');

      textElements.forEach((text: any) => {
        gsap.to(text, {
          backgroundSize: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: text,
            start: 'center 80%',
            end: 'center 20%',
            scrub: true,
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="clipping-container" ref={containerRef}>
      <Link href="/login" onClick={(e) => handleNavClick(e, '/login', 'About')} className="w-full no-underline hover:no-underline">
        <h1 className="clipping-text font-bold">ABOUT US<span>WHO WE ARE</span></h1>
      </Link>
      <Link href="/login" onClick={(e) => handleNavClick(e, '/login', 'Contact')} className="w-full no-underline hover:no-underline">
        <h1 className="clipping-text font-bold">CONTACT US<span>GET IN TOUCH</span></h1>
      </Link>
      <Link href="/login" onClick={(e) => handleNavClick(e, '/login', 'Tools')} className="w-full no-underline hover:no-underline">
        <h1 className="clipping-text font-bold">TRY TOOLS<span>START CREATING</span></h1>
      </Link>
      <Link href="/login" onClick={(e) => handleNavClick(e, '/login', 'Dashboard')} className="w-full no-underline hover:no-underline">
        <h1 className="clipping-text font-bold">DASHBOARD<span>YOUR WORKSPACE</span></h1>
      </Link>
      <Link href="/login" onClick={(e) => handleNavClick(e, '/login', 'Docs')} className="w-full no-underline hover:no-underline">
        <h1 className="clipping-text font-bold">DOCS<span>LEARN MORE</span></h1>
      </Link>
    </div>
  );
}
