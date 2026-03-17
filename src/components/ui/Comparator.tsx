"use client";

import React, { useEffect, useRef, useState } from "react";
import "./Comparator.css";

interface Stage {
  label: string;
  title: string;
  subtitle: string;
  image: string;
  mobileImage?: string;
}

const defaultStages: Stage[] = [
  {
    label: "Stage 1",
    title: "Beach Origin",
    subtitle: "— Turquoise Shoreline",
    image: "https://lessrain.com/dev/images-2025/scroll/1024/lr-scroll-img-01-1024x683.webp",
    mobileImage: "https://lessrain.com/dev/images-2025/scroll/820/lr-scroll-img-01-820x984.webp",
  },
  {
    label: "Stage 2",
    title: "Beach Evolution",
    subtitle: "— Surreal Egg-Shaped",
    image: "https://lessrain.com/dev/images-2025/scroll/1024/lr-scroll-img-02-1024x683.webp",
    mobileImage: "https://lessrain.com/dev/images-2025/scroll/820/lr-scroll-img-02-820x984.webp",
  },
  {
    label: "Stage 3",
    title: "Beach Final",
    subtitle: "— Full Circle",
    image: "https://lessrain.com/dev/images-2025/scroll/1024/lr-scroll-img-01-1024x683.webp",
    mobileImage: "https://lessrain.com/dev/images-2025/scroll/820/lr-scroll-img-01-820x984.webp",
  },
];

export default function Comparator() {
  const sectionRef = useRef<HTMLElement>(null);
  const comparatorRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState(0);
  
  // Velocity and Smoothing state
  const velocityRef = useRef(0);
  const targetScrollRef = useRef<number | null>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    const comparator = comparatorRef.current;
    const pctElement = pctRef.current;
    if (!section || !comparator || !pctElement) return;

    // 1. Update Offsets for CSS animations
    const updateOffsets = () => {
      const offset = section.offsetTop;
      section.style.setProperty("--comparator-offset", `${offset}px`);
    };

    // 2. Velocity-based Wheel Smoothing
    const ease = 0.12;
    const friction = 0.92;
    const scrollEase = 0.08;

    const onWheel = (e: WheelEvent) => {
      // Only capture wheel if we're near the section or want global smoothing
      // For simplicity, we'll keep it global like the original demo
      e.preventDefault();
      targetScrollRef.current = null;
      velocityRef.current += e.deltaY;
    };

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".comparator-wrapper")) {
        targetScrollRef.current = null;
      }
    };

    const frame = () => {
      // Target scroll handling (click to jump)
      if (targetScrollRef.current !== null) {
        const current = window.scrollY;
        const delta = targetScrollRef.current - current;
        if (Math.abs(delta) > 1) {
          window.scrollBy(0, delta * scrollEase);
        } else {
          targetScrollRef.current = null;
        }
      }

      // Velocity handling
      velocityRef.current *= friction;
      if (Math.abs(velocityRef.current) > 0.2) {
        window.scrollBy(0, velocityRef.current * ease);
      }

      // Update Percentage Text from CSS Property
      const computed = getComputedStyle(comparator);
      const progress = parseFloat(computed.getPropertyValue("--scroll-progress")) || 0;
      pctElement.textContent = `${Math.round(progress).toString().padStart(2, "0")}%`;

      // Update Active Stage Indicator
      const currentStage = Math.round((progress / 100) * (defaultStages.length - 1));
      setActiveStage(currentStage);

      requestAnimationFrame(frame);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("resize", updateOffsets, { passive: true });
    
    updateOffsets();
    const rafId = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("resize", updateOffsets);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const scrollToStage = (stageIndex: number) => {
    if (!sectionRef.current) return;
    
    const offset = sectionRef.current.offsetTop;
    const style = getComputedStyle(sectionRef.current);
    const durationStr = style.getPropertyValue("--comparator-duration").trim() || "400vh";
    const durationPx = (parseFloat(durationStr) * window.innerHeight) / 100;
    
    const stageDuration = durationPx / (defaultStages.length - 1);
    targetScrollRef.current = offset + stageDuration * stageIndex;
  };

  return (
    <main className="comparator-section" ref={sectionRef}>
      <section className="scroll-section">
        <div className="comparator-container">
          <div className="support-message hidden supports-[not_(animation-timeline:scroll())]:block absolute top-4 left-1/2 -translate-x-1/2 z-[100] bg-[#1f1408] text-[#b9ae8d] rounded-lg p-4 font-semibold shadow-2xl border border-white/10 max-w-md text-center">
            Your browser doesn't support the advanced CSS features required for this interactive layout. Please use the latest Chrome or Edge.
          </div>

          <div className="comparator-wrapper">
            <div className="comparator" ref={comparatorRef}>
              <div className="comparison-percentage" ref={pctRef}>00%</div>
              
              <div className="image-layers">
                {defaultStages.map((stage, idx) => {
                  const isLast = idx === defaultStages.length - 1;
                  const layerStart = idx / (defaultStages.length - 1);
                  const layerEnd = (idx + 1) / (defaultStages.length - 1);
                  
                  return (
                    <div 
                      key={idx} 
                      className={`image-layer ${!isLast ? 'animated' : ''}`}
                      style={{
                        zIndex: defaultStages.length - idx,
                        // @ts-ignore - custom properties
                        '--animation-range-start': !isLast ? `calc(var(--comparator-offset) + (var(--comparator-duration) * ${layerStart}))` : undefined,
                        '--animation-range-end': !isLast ? `calc(var(--comparator-offset) + (var(--comparator-duration) * ${layerEnd}))` : undefined,
                      } as React.CSSProperties}
                    >
                      <picture>
                        {stage.mobileImage && <source media="(max-width: 48em)" srcSet={stage.mobileImage} />}
                        <img 
                          src={stage.image} 
                          decoding="async" 
                          fetchPriority={idx === 0 ? "high" : "low" as any} 
                          alt={stage.label} 
                        />
                      </picture>
                      <div className="comparator-overlay">
                        <span className="label">{stage.label}</span>
                        <div className="image-text">
                          <h2>{stage.title}</h2>
                          <h3>{stage.subtitle}</h3>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="divider-lines">
                {defaultStages.slice(0, -1).map((_, idx) => {
                  const layerStart = idx / (defaultStages.length - 1);
                  const layerEnd = (idx + 1) / (defaultStages.length - 1);
                  
                  return (
                    <div 
                      key={idx} 
                      className="divider-line"
                      style={{
                        zIndex: 20 - idx,
                        // @ts-ignore
                        '--animation-range-start': `calc(var(--comparator-offset) + (var(--comparator-duration) * ${layerStart}))`,
                        '--animation-range-end': `calc(var(--comparator-offset) + (var(--comparator-duration) * ${layerEnd}))`,
                      } as React.CSSProperties}
                    />
                  );
                })}
              </div>

              <div className="stage-nav">
                {defaultStages.map((_, idx) => (
                  <button
                    key={idx}
                    className={`stage-indicator ${activeStage === idx ? "active" : ""}`}
                    aria-label={`Go to stage ${idx + 1}`}
                    onClick={() => scrollToStage(idx)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
