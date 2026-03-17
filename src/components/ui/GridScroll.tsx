"use client";

import React, { useEffect, useRef } from 'react';
import { animate, scroll, cubicBezier } from 'framer-motion';
import './GridScroll.css';

export default function GridScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstSectionRef = useRef<HTMLElement>(null);
  const scalerImageRef = useRef<HTMLImageElement>(null);
  const layersRef = useRef<(HTMLDivElement | null)[]>([]);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const footerWordRefs = useRef<(HTMLSpanElement | null)[]>([]);

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

  }, []);

  return (
    <div className="gs-content-wrap" ref={containerRef}>
      <header className="gs-header">
        <h1 className="gs-fluid">
          <br />
          <span className="inline-block mr-4" ref={(el) => { wordRefs.current[0] = el; }}>Or</span><br />
          <span className="inline-block mr-4" ref={(el) => { wordRefs.current[1] = el; }}>let's</span>
          <span className="inline-block mr-4" ref={(el) => { wordRefs.current[2] = el; }}>Create</span><br />
          <span className="inline-block mr-4" ref={(el) => { wordRefs.current[3] = el; }}>An</span>
          <span className="inline-block" ref={(el) => { wordRefs.current[4] = el; }}>Image</span>
        </h1>
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
            <span className="inline-block mr-4" ref={(el) => { footerWordRefs.current[3] = el; }}>Enhance</span>
            <span className="inline-block mr-4" ref={(el) => { footerWordRefs.current[4] = el; }}>It</span>
            <span className="inline-block" ref={(el) => { footerWordRefs.current[5] = el; }}>?</span>
          </h2>
        </section>
      </main>
    </div>
  );
}
