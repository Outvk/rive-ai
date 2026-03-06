"use client";

import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

const HalideLanding: React.FC = () => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const layersRef = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Mouse Parallax Logic
        const handleMouseMove = (e: MouseEvent) => {
            const x = (window.innerWidth / 2 - e.clientX) / 25;
            const y = (window.innerHeight / 2 - e.clientY) / 25;

            // Rotate the 3D Canvas
            canvas.style.transform = `rotateX(${55 + y / 2}deg) rotateZ(${-25 + x / 2}deg)`;

            // Apply depth shift to layers
            layersRef.current.forEach((layer, index) => {
                if (!layer) return;
                const depth = (index + 1) * 15;
                const moveX = x * (index + 1) * 0.2;
                const moveY = y * (index + 1) * 0.2;
                layer.style.transform = `translateZ(${depth}px) translate(${moveX}px, ${moveY}px)`;
            });
        };

        // Entrance Animation
        canvas.style.opacity = '0';
        canvas.style.transform = 'rotateX(90deg) rotateZ(0deg) scale(0.8)';

        const timeout = setTimeout(() => {
            if (canvas) {
                canvas.style.transition = 'all 2.5s cubic-bezier(0.16, 1, 0.3, 1)';
                canvas.style.opacity = '1';
                canvas.style.transform = 'rotateX(55deg) rotateZ(-25deg) scale(1)';
            }
        }, 300);

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(timeout);
        };
    }, []);

    return (
        <>
            <style>{`
        :root {
          --bg: #0a0a0a;
          --silver: #e0e0e0;
          --accent: #ff7520ff; /* Indigo to match Rive */
          --grain-opacity: 0.15;
        }

        .halide-body {
          background-color: var(--bg);
          color: var(--silver);
          /* Use theme font */
          overflow: hidden;
          height: 480px; /* Fit perfectly in dashboard */
          width: 100%;
          border-radius: 24px;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        .halide-grain {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none;
          z-index: 100;
          opacity: var(--grain-opacity);
          border-radius: 24px;
        }

        .viewport {
          perspective: 2000px;
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          border-radius: 24px;
        }

        .canvas-3d {
          position: relative;
          width: 600px; height: 350px;
          transform-style: preserve-3d;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .layer {
          position: absolute;
          inset: -100px; /* Reduced from -200px to make content appear smaller/sharper */
          border: 1px solid rgba(224, 224, 224, 0.1);
          background-size: cover;
          background-position: center;
          transition: transform 0.5s ease;
          border-radius: 12px;
        }

        /* Using the provided riveAi.png image */
        .layer-1 { background-image: url('/riveAi.png'); filter: grayscale(0.5) contrast(1.2) brightness(0.7); }
        .layer-2 { background-image: url('/riveAi.png'); filter: grayscale(0.3) contrast(1.1) brightness(0.9); opacity: 0.6; mix-blend-mode: screen; }
        .layer-3 { background-image: url('/riveAi.png'); filter: grayscale(0.2) contrast(1.3) brightness(1); opacity: 0.4; mix-blend-mode: overlay; }

        .contours {
          position: absolute;
          width: 200%; height: 200%;
          top: -50%; left: -50%;
          background-image: repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 40px, rgba(255,255,255,0.05) 41px, transparent 42px);
          transform: translateZ(120px);
          pointer-events: none;
        }

        .interface-grid {
          position: absolute;
          inset: 0;
          padding: 3rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: auto 1fr auto;
          z-index: 10;
          pointer-events: none;
        }

        .hero-title {
          grid-column: 1 / -1;
          align-self: center;
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          font-weight: 700;
          line-height: 1;
          letter-spacing: -0.04em;
          mix-blend-mode: difference;
        }

        .hero-subtitle {
          grid-column: 1 / -1;
          align-self: center;
          font-size: 1rem;
          margin-top: -3rem;
          color: var(--silver);
          mix-blend-mode: difference;
          max-width: 400px;
        }

        .cta-button {
          pointer-events: auto;
          background: var(--silver);
          color: var(--bg);
          padding: 0.75rem 1.5rem;
          text-decoration: none;
          font-weight: 700;
          clip-path: polygon(0 0, 100% 0, 100% 70%, 85% 100%, 0 100%);
          transition: 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .cta-button:hover { background: var(--accent); color: white; transform: translateY(-3px); }

        .scroll-hint {
          position: absolute;
          bottom: 2rem; left: 50%;
          width: 1px; height: 60px;
          background: linear-gradient(to bottom, var(--silver), transparent);
          animation: flow 2s infinite ease-in-out;
          opacity: 0.5;
        }

        @keyframes flow {
          0%, 100% { transform: scaleY(0); transform-origin: top; }
          50% { transform: scaleY(1); transform-origin: top; }
          51% { transform: scaleY(1); transform-origin: bottom; }
        }
      `}</style>

            <div className="halide-body">
                {/* SVG Filter for Grain */}
                <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                    <filter id="grain">
                        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" />
                        <feColorMatrix type="saturate" values="0" />
                    </filter>
                </svg>

                <div className="halide-grain" style={{ filter: 'url(#grain)' }}></div>

                <div className="interface-grid">
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.6)' }}>RIVE_AI_STUDIO</div>
                    <div style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--accent)', fontSize: '0.7rem' }}>
                        <div>v2.0.4 ACTIVE</div>
                        <div>SYS. LAT: OK</div>
                    </div>

                    <h1 className="hero-title">
                        WELCOME BACK,<br />
                        <span style={{ color: 'var(--accent)' }}>LET'S CREATE.</span>
                    </h1>

                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                            <p>[ AI TOOLS ARCHITECTURE ]</p>
                            <p>FOUR POWERFUL AI TOOLS AT YOUR FINGERTIPS</p>
                        </div>
                        <a href="#tools" className="cta-button">
                            MONITOR USAGE <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                <div className="viewport">
                    <div className="canvas-3d" ref={canvasRef}>
                        <div className="layer layer-1" ref={(el) => { if (el) layersRef.current[0] = el; }}></div>
                        <div className="layer layer-2" ref={(el) => { if (el) layersRef.current[1] = el; }}></div>
                        <div className="layer layer-3" ref={(el) => { if (el) layersRef.current[2] = el; }}></div>
                        <div className="contours"></div>
                    </div>
                </div>

                <div className="scroll-hint"></div>
            </div>
        </>
    );
};

export default HalideLanding;
