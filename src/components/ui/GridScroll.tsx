"use client";

import React, { useEffect, useRef } from 'react';
import { animate, scroll, cubicBezier } from 'framer-motion';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import './GridScroll.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(MotionPathPlugin);
}

export default function GridScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstSectionRef = useRef<HTMLElement>(null);
  const scalerImageRef = useRef<HTMLImageElement>(null);
  const layersRef = useRef<(HTMLDivElement | null)[]>([]);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const footerWordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const coreRef = useRef<SVGCircleElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    if (!scalerImageRef.current || !firstSectionRef.current) return;

    const image = scalerImageRef.current;
    const firstSection = firstSectionRef.current;
    const layers = layersRef.current.filter(Boolean) as HTMLDivElement[];
    const words = wordRefs.current.filter(Boolean) as HTMLSpanElement[];
    const footerWords = footerWordRefs.current.filter(Boolean) as HTMLSpanElement[];

    // Reveal title word by word on scroll
    words.forEach((word, index) => {
      const start = 95 - (index * 5); // Stagger start
      const end = 80 - (index * 5);   // Stagger end
      
      scroll(
        (animate as any)(word, 
          {
            opacity: [0, 1],
            y: [30, 0],
            filter: ['blur(4px)', 'blur(0px)']
          }, {
          easing: cubicBezier(0.23, 1, 0.32, 1)
        }),
        {
          target: word,
          offset: [`start ${start}%`, `start ${end}%`]
        }
      );
    });

    // Reveal footer title word by word on scroll
    footerWords.forEach((word, index) => {
      const start = 95 - (index * 3); // Stagger start
      const end = 80 - (index * 3);   // Stagger end
      
      scroll(
        (animate as any)(word, 
          {
            opacity: [0, 1],
            y: [20, 0],
            filter: ['blur(4px)', 'blur(0px)']
          }, {
          easing: cubicBezier(0.23, 1, 0.32, 1)
        }),
        {
          target: word,
          offset: [`start ${start}%`, `start ${end}%`]
        }
      );
    });

    // Measure natural size
    const naturalWidth = image.offsetWidth;
    const naturalHeight = image.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Shrink center image from fullscreen to natural size
    scroll(
      animate(image, {
        width: [viewportWidth, naturalWidth],
        height: [viewportHeight, naturalHeight]
      }, {
        // @ts-ignore
        width: { easing: cubicBezier(0.65, 0, 0.35, 1) },
        // @ts-ignore
        height: { easing: cubicBezier(0.42, 0, 0.58, 1) }
      }),
      {
        target: firstSection,
        offset: ['start start', '80% end']
      }
    );

    const scaleEasings = [
      cubicBezier(0.42, 0, 0.58, 1),
      cubicBezier(0.76, 0, 0.24, 1),
      cubicBezier(0.87, 0, 0.13, 1)
    ];

    layers.forEach((layer, index) => {
      const endOffset = `${1 - (index * 0.05)} end` as any;
      
      // Fade in layers
      scroll(
        animate(layer, {
          // @ts-ignore
          opacity: [0, 0, 1]
        }, {
          offset: [0, 0.55, 1],
          easing: cubicBezier(0.61, 1, 0.88, 1)
        }),
        {
          target: firstSection,
          offset: ['start start', endOffset]
        }
      );
      
      // Scale up layers from center
      scroll(
        animate(layer, {
          // @ts-ignore
          scale: [0, 0, 1]
        }, {
          offset: [0, 0.3, 1],
          easing: scaleEasings[index] || scaleEasings[0]
        }),
        {
          target: firstSection,
          offset: ['start start', endOffset]
        }
      );
    });

    // GSAP MotionPath Animation for a single sparkle per path copy
    const sparkleGroups = containerRef.current?.querySelectorAll(".gs-sparkle-group") || [];
    sparkleGroups.forEach((group, groupIdx) => {
      const sparkle = group.querySelector<SVGGElement>(".gs-sparkle");
      const path = pathRefs.current[groupIdx];
      
      if (!path || !sparkle) return;

      gsap.to(sparkle, {
        duration: 5 + groupIdx, // Varied durations
        repeat: -1,
        ease: "none",
        motionPath: {
          path: path,
          alignOrigin: [0.5, 0.5]
        }
      });

      // Individual pulsing for the single sparkle core
      const core = sparkle.querySelector(".gs-sparkle-core");
      if (core) {
        gsap.to(core, {
          r: 7,
          opacity: 0.8,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      }
    });

    // Sparkle Animation Entrance (GSAP for immediate feel, Scroll for rotation)
    sparkleGroups.forEach((group, i) => {
      const svg = group.querySelector("svg");
      const path = pathRefs.current[i];
      if (!svg || !path) return;

      // Reset styles for GSAP entrance
      gsap.set(svg, { opacity: 0, scale: 0 });
      
      const length = path.getTotalLength() || 1000;
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

      // Entrance sequence
      gsap.to(svg, {
        opacity: 0.8,
        scale: 1,
        duration: 1.5,
        delay: 2 + i * 0.2,
        ease: "power2.out"
      });

      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 2,
        delay: 2.3 + i * 0.2,
        ease: "power1.inOut"
      });

      // Keep rotation tied to scroll
      scroll(
        (animate as any)(svg, {
          rotate: [0, 360 * (i % 2 === 0 ? 1 : -1)]
        }, {
          easing: "linear"
        }),
        {
          target: containerRef.current || undefined,
          offset: ["start start", "end end"]
        }
      );
    });

  }, []);

  return (
    <div className="gs-content-wrap" ref={containerRef}>
      <header className="gs-header">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between w-full relative">
          <h1 className="gs-fluid">
            <br />
            <span className="inline-block mr-4" ref={(el) => { wordRefs.current[0] = el; }}>Or</span><br />
            <span className="inline-block mr-4" ref={(el) => { wordRefs.current[1] = el; }}>let's</span>
            <span className="inline-block mr-4" ref={(el) => { wordRefs.current[2] = el; }}>Create</span><br />
            <span className="inline-block mr-4" ref={(el) => { wordRefs.current[3] = el; }}>An</span>
            <span className="inline-block" ref={(el) => { wordRefs.current[4] = el; }}>Image</span>
          </h1>

          {/* Multiple SVG Motion Path Animation Copies */}
          {[
            { right: "-100px", bottom: "80px", scale: 1, rotate: 0 },
            { right: "120px", bottom: "160px", scale: 0.5, rotate: 15 },
         
            { right: "10px", bottom: "290px", scale: 0.6, rotate: -15 }
          ].map((cfg, idx) => (
            <div 
              key={idx} 
              className="hidden md:block absolute opacity-60 gs-sparkle-group" 
              style={{ 
                right: cfg.right, 
                bottom: cfg.bottom, 
                transform: `scale(${cfg.scale}) rotate(${cfg.rotate}deg)` 
              }}
            >
              <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  ref={(el) => { pathRefs.current[idx] = el; }}
                  d="M200,50 C200,130 220,150 300,150 C220,150 200,170 200,250 C200,170 180,150 100,150 C180,150 200,130 200,50 Z" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeDasharray="6 6"
                  className="opacity-40"
                />
                
                <g className="gs-sparkle">
                  {/* Outer glow aura for the logo */}
                  <circle 
                    cx="0" cy="0" r="30" 
                    fill="url(#sparkleGradient)" 
                    opacity="0.4"
                    className="pointer-events-none"
                  />
                  {/* Rive Logo Path Follower */}
                  <g transform="translate(-15, -15) scale(0.15)">
                    <path 
                      fill="#fff" 
                      className="gs-sparkle-core filter drop-shadow-[0_0_8px_#7405FF]"
                      d="M136.52,50.54c22.86,3.8,29.23,37.73,8.95,50.12l-12.05,4.73c8.89,1.7,18.38,10.42,21.76,18.73.83,2.04,3.12,10.22,3.12,11.84v21.82h-37.33c-.3-3.8.51-8.07-.07-11.78-1.5-9.53-16.18-15.39-24.26-10.74-3.67,2.11-20.75,22.52-22.33,22.52h-24.27v-36.79c0-1.15,14.6-13.55,16.09-16.38.45-2.56-16.09-16.03-16.09-17.29v-36.79h86.49Z"
                    />
                  </g>
                </g>
                
                <defs>
                  <radialGradient id="sparkleGradient">
                    <stop offset="0%" stopColor="#C190FF" />
                    <stop offset="100%" stopColor="#C190FF" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
          ))}
        </div>
      </header>
      
      <main>
        <section className="gs-main-section" ref={firstSectionRef}>
          <div className="gs-content">
            <div className="gs-grid">
              {/* Layer 1: Outer edges (6 images) */}
              <div className="gs-layer" ref={(el) => { layersRef.current[0] = el; }}>
                <div>
                  <img src="https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=800&auto=format&fit=crop&q=60" alt="" />
                </div>
                <div>
                  <img src="https://images.unsplash.com/photo-1556304044-0699e31c6a34?w=800&auto=format&fit=crop&q=60" alt="" />
                </div>
                <div>
                  <img src="https://images.unsplash.com/photo-1590330297626-d7aff25a0431?w=800&auto=format&fit=crop&q=60" alt="" />
                </div>
                <div>
                  <img src="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&auto=format&fit=crop&q=60" alt="" />
                </div>
                <div>
                  <img src="https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800&auto=format&fit=crop&q=60" alt="" />
                </div>
                <div>
                  <img src="https://images.unsplash.com/photo-1565321590372-09331b9dd1eb?w=800&auto=format&fit=crop&q=60" alt="" />
                </div>
              </div>
              
              {/* Layer 2: Inner columns (6 images) */}
              <div className="gs-layer" ref={(el) => { layersRef.current[1] = el; }}>
                <div>
                  <img src="https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?w=800&auto=format&fit=crop&q=60" alt="" />
                </div>
                <div>
                  <img src="https://images.unsplash.com/photo-1637414165749-9b3cd88b8271?w=800&auto=format&fit=crop&q=60" alt="" />
                </div>
                <div>
                  <img src="https://images.unsplash.com/photo-1699911251220-8e0de3b5ce88?w=800&auto=format&fit=crop&q=60" alt="" />
                </div>
                <div>
                  <img src="https://images.unsplash.com/photo-1667483629944-6414ad0648c5?w=800&auto=format&fit=crop&q=60" alt="" />
                </div>
                <div>
                  <img src="https://plus.unsplash.com/premium_photo-1706078438060-d76ced26d8d5?w=800&auto=format&fit=crop&q=60" alt="" />
                </div>
                <div>
                  <img src="https://images.unsplash.com/photo-1525385444278-b7968e7e28dc?w=800&auto=format&fit=crop&q=60" alt="" />
                </div>
              </div>
              
              {/* Layer 3: Center column top and bottom (2 images) */}
              <div className="gs-layer" ref={(el) => { layersRef.current[2] = el; }}>
                <div>
                  <img src="https://images.unsplash.com/reserve/LJIZlzHgQ7WPSh5KVTCB_Typewriter.jpg?w=800&auto=format&fit=crop&q=60" alt="" />
                </div>
                <div>
                  <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=60" alt="" />
                </div>
              </div>
              
              {/* Center scaler image */}
              <div className="gs-scaler">
                <img 
                    ref={scalerImageRef}
                    src="https://assets.codepen.io/605876/model-shades.jpg?format=auto&quality=100" 
                    alt="Center Model" 
                />
              </div>
            </div>
          </div>
        </section>
        
        <section className="gs-fin-section">
          <h2 className="gs-fluid text-zinc-500">
            <span className="inline-block mr-4" ref={(el) => { footerWordRefs.current[0] = el; }}>Or</span>
            <span className="inline-block mr-4" ref={(el) => { footerWordRefs.current[1] = el; }}>You</span>
            <span className="inline-block mr-4" ref={(el) => { footerWordRefs.current[2] = el; }}>Wanna</span>
            <br />
            <span className="inline-block mr-4" ref={(el) => { footerWordRefs.current[3] = el; }}>Enhance</span>
            <br />
            <span className="inline-block mr-4" ref={(el) => { footerWordRefs.current[4] = el; }}>It</span>
            <span className="inline-block" ref={(el) => { footerWordRefs.current[5] = el; }}>?</span>
          </h2>
        </section>
      </main>
    </div>
  );
}
