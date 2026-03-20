"use client";

import React, { useEffect, useRef, useState } from "react";
import { Pane } from "tweakpane";
import "./OnionSkinDepth.css";

const TOTAL_DUPLICATES = 10;
const TOTAL_LAYERS = TOTAL_DUPLICATES + 1;
const STORAGE_KEY = "onion-stack-tweakpane";

const EASES: Record<string, (t: number) => number> = {
  linear: (t) => t,
  easeInSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine: (t) => Math.sin((t * Math.PI) / 2),
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => 1 - (1 - t) * (1 - t),
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easedValue = (start: number, end: number, t: number, easeName: string) => {
  const ease = EASES[easeName] || EASES.linear;
  return lerp(start, end, ease(clamp(t, 0, 1)));
};

export default function OnionSkinDepth() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const mouseNormRef = useRef(0.5);

  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

  const [params] = useState({
    imageUrl: "vd.svg.webp",
    backgroundColor: "#030303",
    perspective: 800,
    sceneRotateX: 0,
    sceneRotateY: 0,
    duplicates: 7,
    spacing: 60,
    axis: "x",
    direction: "posToNeg",
    focusEnabled: true,
    focusSpread: 0.5,
    opacityStart: 0.5,
    opacityMiddle: 1,
    opacityEnd: 0.2,
    opacityEase: "easeOutSine",
    scaleStart: 1,
    scaleEnd: 1,
    scaleEase: "easeOutQuad",
    translateXStart: -100,
    translateXEnd: 200,
    translateXEase: "linear",
    translateYStart: -50,
    translateYEnd: -30,
    translateYEase: "easeOutSine",
    translateZStart: -550,
    translateZEnd: 200,
    translateZEase: "linear",
    rotateXStart: 0,
    rotateXEnd: 0,
    rotateXEase: "linear",
    rotateYStart: 0,
    rotateYEnd: 0,
    rotateYEase: "linear",
    rotateZStart: 0,
    rotateZEnd: 0,
    rotateZEase: "linear",
    grayscaleStart: 0,
    grayscaleMiddle: 0,
    grayscaleEnd: 0,
    grayscaleEase: "easeOutSine",
    brightnessStart: 100,
    brightnessMiddle: 100,
    brightnessEnd: 100,
    brightnessEase: "easeInCubic",
    contrastStart: 100,
    contrastMiddle: 100,
    contrastEnd: 100,
    contrastEase: "linear",
    saturationStart: 50,
    saturationMiddle: 100,
    saturationEnd: 50,
    saturationEase: "easeInCubic",
    blurStart: 10,
    blurMiddle: 0,
    blurEnd: 3,
    blurEase: "easeInCubic",
    blendMode: "normal",
    borderWidth: 0.5,
    borderColor: "#7405FF",
    borderStyle: "dashed",
    borderRadius: 20,
  });

  useEffect(() => {
    if (!stackRef.current || !sceneRef.current || !paneRef.current || !containerRef.current) return;

    const stack = stackRef.current;
    const scene = sceneRef.current;
    const container = containerRef.current;
    const paneContainer = paneRef.current;

    // Create planes
    const planes: HTMLDivElement[] = [];
    stack.innerHTML = "";
    for (let i = 0; i < TOTAL_LAYERS; i++) {
      const plane = document.createElement("div");
      plane.className = "onion-plane";
      const frame = document.createElement("figure");
      frame.className = "onion-plane-frame";
      const img = document.createElement("img");
      img.className = "onion-plane-img";
      img.src = params.imageUrl;
      frame.appendChild(img);
      plane.appendChild(frame);
      stack.appendChild(plane);
      planes.push(plane);
    }

    const updatePlanes = () => {
      const layers = clamp(params.duplicates + 1, 1, TOTAL_LAYERS);
      container.style.backgroundColor = params.backgroundColor;
      scene.style.perspective = `${params.perspective}px`;
      stack.style.transform = `rotateX(${params.sceneRotateX}deg) rotateY(${params.sceneRotateY}deg)`;

      const directionSign = params.direction === "negToPos" ? 1 : -1;

      planes.forEach((plane, i) => {
        if (i >= layers) {
          plane.style.display = "none";
          return;
        }
        plane.style.display = "block";

        const t = layers <= 1 ? 0 : i / (layers - 1);

        let opacity;
        if (t < 0.5) {
          opacity = easedValue(params.opacityStart, params.opacityMiddle, t / 0.5, params.opacityEase);
        } else {
          opacity = easedValue(params.opacityMiddle, params.opacityEnd, (t - 0.5) / 0.5, params.opacityEase);
        }

        const scale = easedValue(params.scaleStart, params.scaleEnd, t, params.scaleEase);
        let tx = easedValue(params.translateXStart, params.translateXEnd, t, params.translateXEase);
        let ty = easedValue(params.translateYStart, params.translateYEnd, t, params.translateYEase);
        let tz = easedValue(params.translateZStart, params.translateZEnd, t, params.translateZEase);

        const stackOffset = params.spacing * i * directionSign;
        if (params.axis === "x") tx += stackOffset;
        if (params.axis === "y") ty += stackOffset;
        if (params.axis === "z") tz += stackOffset;

        const rx = easedValue(params.rotateXStart, params.rotateXEnd, t, params.rotateXEase);
        const ry = easedValue(params.rotateYStart, params.rotateYEnd, t, params.rotateYEase);
        const rz = easedValue(params.rotateZStart, params.rotateZEnd, t, params.rotateZEase);

        let grayscale = t < 0.5 ? easedValue(params.grayscaleStart, params.grayscaleMiddle, t / 0.5, params.grayscaleEase) : easedValue(params.grayscaleMiddle, params.grayscaleEnd, (t - 0.5) / 0.5, params.grayscaleEase);
        let brightness = t < 0.5 ? easedValue(params.brightnessStart, params.brightnessMiddle, t / 0.5, params.brightnessEase) : easedValue(params.brightnessMiddle, params.brightnessEnd, (t - 0.5) / 0.5, params.brightnessEase);
        let contrast = t < 0.5 ? easedValue(params.contrastStart, params.contrastMiddle, t / 0.5, params.contrastEase) : easedValue(params.contrastMiddle, params.contrastEnd, (t - 0.5) / 0.5, params.contrastEase);
        let saturation = t < 0.5 ? easedValue(params.saturationStart, params.saturationMiddle, t / 0.5, params.saturationEase) : easedValue(params.saturationMiddle, params.saturationEnd, (t - 0.5) / 0.5, params.saturationEase);
        let blur = t < 0.5 ? easedValue(params.blurStart, params.blurMiddle, t / 0.5, params.blurEase) : easedValue(params.blurMiddle, params.blurEnd, (t - 0.5) / 0.5, params.blurEase);

        if (params.focusEnabled) {
          const focusIndex = mouseNormRef.current * (layers - 1);
          const dist = Math.abs(i - focusIndex);
          const spreadLayers = params.focusSpread * (layers - 1);
          const focus = clamp(1 - dist / spreadLayers, 0, 1);
          const fade = focus * focus;
          opacity = lerp(0.05, 1, fade);
          blur = lerp(12, 0, focus);
          grayscale = 0;
          brightness = 100;
          contrast = 100;
          saturation = 100;
        }

        plane.style.opacity = opacity.toString();
        plane.style.mixBlendMode = params.blendMode;
        plane.style.transform = `translate3d(${tx}px,${ty}px,${tz}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale})`;
        plane.style.filter = `grayscale(${grayscale}%) brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;

        const frameEl = plane.querySelector(".onion-plane-frame") as HTMLElement;
        if (frameEl) {
          frameEl.style.borderWidth = `${params.borderWidth}px`;
          frameEl.style.borderColor = params.borderColor;
          frameEl.style.borderStyle = params.borderStyle;
          frameEl.style.borderRadius = `${params.borderRadius}px`;
        }
      });
    };

    const pane: any = new Pane({ container: paneContainer, title: "Onion Skin Depth" });
    const easeOptions = { Linear: "linear", "Ease In Sine": "easeInSine", "Ease Out Sine": "easeOutSine", "Ease In Quad": "easeInQuad", "Ease Out Quad": "easeOutQuad", "Ease In Cubic": "easeInCubic", "Ease Out Cubic": "easeOutCubic" };
    
    // Config Pane
    const sceneFolder = pane.addFolder({ title: "Scene" });
    sceneFolder.addBinding(params, "perspective", { min: 200, max: 2000 });
    sceneFolder.addBinding(params, "sceneRotateX", { min: -60, max: 60 });
    sceneFolder.addBinding(params, "sceneRotateY", { min: -60, max: 60 });
    sceneFolder.addBinding(params, "duplicates", { min: 0, max: TOTAL_DUPLICATES, step: 1 });
    sceneFolder.addBinding(params, "spacing", { min: 0, max: 200 });

    const dirFolder = pane.addFolder({ title: "Direction" });
    dirFolder.addBinding(params, "axis", { options: { X: "x", Y: "y", Z: "z" } });
    dirFolder.addBinding(params, "direction", { options: { "- → +": "negToPos", "+ → -": "posToNeg" } });

    const opacityFolder = pane.addFolder({ title: "Opacity" });
    opacityFolder.addBinding(params, "opacityStart", { min: 0, max: 1 });
    opacityFolder.addBinding(params, "opacityMiddle", { min: 0, max: 1 });
    opacityFolder.addBinding(params, "opacityEnd", { min: 0, max: 1 });
    opacityFolder.addBinding(params, "opacityEase", { options: easeOptions });

    const filterFolder = pane.addFolder({ title: "Filters" });
    filterFolder.addBinding(params, "blurStart", { min: 0, max: 20 });
    filterFolder.addBinding(params, "blurMiddle", { min: 0, max: 20 });
    filterFolder.addBinding(params, "blurEnd", { min: 0, max: 20 });
    
    const focusFolder = pane.addFolder({ title: "Focus" });
    focusFolder.addBinding(params, "focusEnabled", { label: "hover focus" });
    focusFolder.addBinding(params, "focusSpread", { min: 0.05, max: 0.6 });

    pane.on("change", updatePlanes);

    const onMouseMove = (e: MouseEvent) => {
      const rect = scene.getBoundingClientRect();
      let norm = 0.5;
      if (params.axis === "x") {
        norm = clamp((e.clientX - rect.left) / rect.width, 0, 1);
      } else {
        norm = clamp((e.clientY - rect.top) / rect.height, 0, 1);
      }
      if (params.direction === "posToNeg") norm = 1 - norm;
      mouseNormRef.current = norm;
      updatePlanes();
    };

    window.addEventListener("mousemove", onMouseMove);
    updatePlanes();

    // Reveal animations for text
    const textElements = [
      { ref: eyebrowRef, y: 30 },
      { ref: titleRef, y: 50 },
      { ref: descRef, y: 30 }
    ];

    const { scroll, animate, cubicBezier } = require('framer-motion');

    textElements.forEach((item, index) => {
      if (!item.ref.current) return;
      scroll(
        (animate as any)(item.ref.current, 
          { 
            opacity: [0, 1], 
            y: [item.y, 0],
            filter: ['blur(10px)', 'blur(0px)']
          }, 
          { easing: cubicBezier(0.23, 1, 0.32, 1) }
        ),
        {
          target: item.ref.current,
          offset: ['start 95%', 'start 70%']
        }
      );
    });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      pane.dispose();
    };
  }, [params]);

  return (
    <div className="onion-skin-container" ref={containerRef}>
      <section className="onion-hero">
        <div className="onion-hero-copy">
          <p className="onion-eyebrow" ref={eyebrowRef}>Dynamic Motion Engine</p>
          <h1 className="onion-title" ref={titleRef}>
            GENERATE<br />
            VIDEO<br />
            DEPTH
          </h1>
          <p className="onion-description" ref={descRef}>
            Breathe life into static frames with AI-powered temporal synthesis. 
            Layered motion planes allow for precise control over cinematic depth and physical movement.
          </p>
        </div>

        <div className="onion-hero-stage">
          <div className="onion-scene" ref={sceneRef}>
            <div className="onion-stack" ref={stackRef} aria-label="Layered 3D image stack"></div>
          </div>
        </div>
      </section>

   

      <div className="onion-pane-container" ref={paneRef}></div>
    </div>
  );
}
