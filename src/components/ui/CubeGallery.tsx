'use client'

import React, { useEffect, useRef, useState } from 'react'
import './CubeGallery.css'

const IMAGE_SRCS = [
    "/vk-1.jpg",
    "/vk-2.jpg",
    "/vk-3.jpg",
    "https://assets.codepen.io/573855/demo-monsters-04.webp",
    "https://assets.codepen.io/573855/demo-monsters-05.webp",
    "https://assets.codepen.io/573855/demo-monsters-06.webp"
]

const FACE_NAMES = [
    "SECURITY",
    "INTUITIVE",
    "VALUE",
    "TOOLS",
    "FUTURE",
    "SPEED"
]

const STOPS = [
    { rx: 90, ry: 0 },
    { rx: 0, ry: 0 },
    { rx: 0, ry: -90 },
    { rx: 0, ry: -180 },
    { rx: 0, ry: -270 },
    { rx: -90, ry: -360 }
]

const N = STOPS.length

export default function CubeGallery() {
    const rootRef = useRef<HTMLDivElement>(null)
    const cubeRef = useRef<HTMLDivElement>(null)
    const progFillRef = useRef<HTMLDivElement>(null)
    const sectionRefs = useRef<(HTMLElement | null)[]>([])

    const [theme, setTheme] = useState<'dark' | 'light'>('dark')
    const [progress, setProgress] = useState(0)
    const [activeFace, setActiveFace] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            if (!rootRef.current) return

            const rect = rootRef.current.getBoundingClientRect()
            const totalHeight = rootRef.current.offsetHeight - window.innerHeight
            const scrollStart = rootRef.current.offsetTop
            const currentScroll = window.scrollY - scrollStart

            let s = currentScroll / totalHeight
            s = Math.max(0, Math.min(1, s))

            const easeIO = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)

            // Update Cube Rotation
            const t = s * (N - 1)
            const i = Math.min(Math.floor(t), N - 2)
            const f = easeIO(t - i)
            const a = STOPS[i]
            const b = STOPS[i + 1]
            const rx = a.rx + (b.rx - a.rx) * f
            const ry = a.ry + (b.ry - a.ry) * f

            if (cubeRef.current) {
                cubeRef.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`
            }

            setProgress(Math.round(s * 100))
            setActiveFace(Math.min(N - 1, Math.floor(s * N)))
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll()

        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')

    const scrollToSection = (index: number) => {
        if (!rootRef.current) return
        const totalHeight = rootRef.current.offsetHeight - window.innerHeight
        const targetScroll = rootRef.current.offsetTop + (index / (N - 1)) * totalHeight
        window.scrollTo({ top: targetScroll, behavior: 'smooth' })
    }

    return (
        <div ref={rootRef} className="cube-gallery-root" data-theme={theme}>
            {/* Sticky layer for the Cube */}
            <div id="scene">
                <div id="cube" ref={cubeRef}>
                    {IMAGE_SRCS.map((src, i) => (
                        <div key={i} className="face" data-face={["top", "front", "right", "back", "left", "bottom"][i]}>
                            <img src={src} alt={FACE_NAMES[i]} />
                            <span className="face-ph">{FACE_NAMES[i]}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Persistent HUD layer */}
            <div className="gallery-ui">
                <div id="hud">
                    <div id="hud_pct">{String(progress).padStart(3, '0')}%</div>
                    <div className="scene-label">{FACE_NAMES[activeFace]}</div>
                </div>

                <div id="scene_strip">
                    {[0, 1, 2, 3, 4, 5].map(i => (
                        <div
                            key={i}
                            className={`scene-dot ${activeFace === i ? 'active' : ''}`}
                            onClick={() => scrollToSection(i)}
                        ></div>
                    ))}
                </div>

                <div id="face_caption">
                    <div id="face_caption_num">{String(activeFace + 1).padStart(2, '0')}</div>
                    <div id="face_caption_name">{FACE_NAMES[activeFace]}</div>
                </div>

                <button id="theme_toggle" onClick={toggleTheme} aria-label="Toggle light/dark mode">
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
            </div>

            {/* Scrolling Content layer */}
            <div id="scroll_container">
                <section className="cube-gallery-section">
                    <div className="text-card">
                        <div className="tag">01 — Elite Protection</div>
                        <h1>HARDENED<br />SECURITY<br />LAYER</h1>
                        <p className="body-text">
                            Built with enterprise-grade encryption and rigorous safety protocols.
                            Your data stays yours, protected by our uncompromising security architecture.
                        </p>
                        <button className="cta" onClick={() => scrollToSection(1)}>Next Era →</button>
                    </div>
                </section>

                <section className="cube-gallery-section">
                    <div className="text-card right">
                        <div className="tag">02 — Seamless Design</div>
                        <h1>INTUITIVE<br />FLUID<br />CONTROL</h1>
                        <p className="body-text">
                            High-power AI stripped of complexity. Experience a workspace that
                            adapts to your needs with an interface designed for pure creative flow.
                        </p>
                        <button className="cta" onClick={() => scrollToSection(2)}>Smart Move →</button>
                    </div>
                </section>

                <section className="cube-gallery-section">
                    <div className="text-card">
                        <div className="tag">03 — Smart Efficiency</div>
                        <h1>HIGH<br />VALUE<br />ECONOMY</h1>
                        <p className="body-text">
                            The most reliable choice for high-volume production. Get premium
                            results for lower credit prices without sacrificing quality or stability.
                        </p>
                        <button className="cta" onClick={() => scrollToSection(3)}>Peak Power →</button>
                    </div>
                </section>

                <section className="cube-gallery-section">
                    <div className="text-card right">
                        <div className="tag">04 — Advanced Suit</div>
                        <h1>DOMINANT<br />TOOLING<br />SUITE</h1>
                        <p className="body-text">
                            From complex generation to precise editing—access professional-grade
                            tools built for the next generation of digital creators.
                        </p>
                        <button className="cta" onClick={() => scrollToSection(4)}>Future Edge →</button>
                    </div>
                </section>

                <section className="cube-gallery-section">
                    <div className="text-card">
                        <div className="tag">05 — Upcoming Era</div>
                        <h1>AGENTIC<br />WORKFLOWS<br />PATH</h1>
                        <p className="body-text">
                            Coming soon: Fully autonomous AI agents that manage entire processes.
                            Transform your static tasks into dynamic, self-evolving workflows.
                        </p>
                        <button className="cta" onClick={() => scrollToSection(5)}>Instant Speed →</button>
                    </div>
                </section>

                <section className="cube-gallery-section">
                    <div className="text-card right">
                        <div className="tag">06 — Instant Compute</div>
                        <h1>BLISTERING<br />FAST<br />SYSTEM</h1>
                        <p className="body-text">
                            Zero bottlenecks. Engineered for maximum speed, our infrastructure
                            ensures that your vision is realized as fast as you can think of it.
                        </p>
                        <button className="cta" onClick={() => scrollToSection(0)}>Back to Start</button>
                    </div>
                </section>
            </div>
        </div>
    )
}
