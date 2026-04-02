"use client";

import React, { useEffect, useRef } from 'react';
import { animate, scroll, cubicBezier } from 'framer-motion';
import './VideoRevealText.css';

export default function VideoRevealText() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const words = wordRefs.current.filter(Boolean) as HTMLSpanElement[];

    // Reveal title word by word on scroll
    words.forEach((word, index) => {
      // Stagger start and end offsets
      const startTrigger = 95 - (index * 4);
      const endTrigger = 75 - (index * 4);
      
      scroll(
        (animate as any)(word, 
          {
            opacity: [0, 1],
            y: [40, 0],
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
    <div className="video-reveal-container" ref={containerRef}>
      <h1 className="video-reveal-text">
        <span className="inline-block mr-6" ref={(el) => { wordRefs.current[0] = el; }}>Or</span><br />
        <span className="inline-block mr-6" ref={(el) => { wordRefs.current[1] = el; }}>u wanna</span>
        <span className="inline-block mr-6" ref={(el) => { wordRefs.current[2] = el; }}>generate</span><br />
        <span className="inline-block mr-6" ref={(el) => { wordRefs.current[3] = el; }}>a video</span>
        <span className="inline-block" ref={(el) => { wordRefs.current[4] = el; }}>?</span>
      </h1>
    </div>
  );
}
