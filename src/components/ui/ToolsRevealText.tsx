"use client";

import React, { useEffect, useRef } from 'react';
import { animate, scroll, cubicBezier } from 'framer-motion';
import './ToolsRevealText.css';

export default function ToolsRevealText() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const words = wordRefs.current.filter(Boolean) as HTMLSpanElement[];

    // Reveal title word by word on scroll
    words.forEach((word, index) => {
      // Stagger start and end offsets to trigger sequentially as we scroll
      const staggerAmount = 4;
      const startTrigger = 95 - (index * staggerAmount);
      const endTrigger = 75 - (index * staggerAmount);
      
      scroll(
        (animate as any)(word, 
          {
            opacity: [0, 1],
            y: [50, 0],
            filter: ['blur(15px)', 'blur(0px)']
          }, {
          easing: cubicBezier(0.23, 1, 0.32, 1)
        }),
        {
          target: word,
          offset: [`start ${startTrigger}%`, `start ${endTrigger}%`]
        }
      );
    });

  }, []);

  return (
    <div className="tools-reveal-container" ref={containerRef}>
      <h1 className="tools-reveal-text">
        <span className="inline-block mr-6" ref={(el) => { wordRefs.current[0] = el; }}>And</span>
        <span className="inline-block mr-6" ref={(el) => { wordRefs.current[1] = el; }}>Many</span><br />
        <span className="inline-block mr-6" ref={(el) => { wordRefs.current[2] = el; }}>tools</span>
        <span className="inline-block mr-6" ref={(el) => { wordRefs.current[3] = el; }}>waiting</span><br />
        <span className="inline-block mr-6" ref={(el) => { wordRefs.current[4] = el; }}>for</span>
        <span className="inline-block mr-6" ref={(el) => { wordRefs.current[5] = el; }}>u</span>
        <span className="inline-block" ref={(el) => { wordRefs.current[6] = el; }}>.</span>
      </h1>
    </div>
  );
}
