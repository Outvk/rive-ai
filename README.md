# 🌌 Rive AI: The Future of Digital Creation

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-Styling-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![AI Engines](https://img.shields.io/badge/AI_Engines-Llama_|_Flux_|_ElevenLabs-indigo?style=for-the-badge)](/)

**Rive AI** is a premium, high-performance creative ecosystem designed to transform text into professional-grade digital assets. From high-fidelity 3D models to studio-quality audio, Rive AI centralizes the world's most powerful neural engines into a single, seamless, glassmorphic interface.

---

## 🚀 Creative Engines

Rive AI is powered by "Specialized Neural Tools" designed for specific creative workflows:

- **✍️ Text Generator (Llama 3.2):** Craft marketing copy, blog posts, and code with the latest in LLM technology.
- **🎨 Prompt to Image (Flux AI):** Generate stunning, hyper-realistic visuals from simple descriptions.
- **🔊 Text to Speech (ElevenLabs):** Convert scripts into natural, human-like narration with elite voice cloning.
- **📦 3D Generation:** Transform ideas into high-fidelity 3D assets for games, AR, and immersive web experiences.
- **🎥 Instant Video (Building...):** Professional video content generated directly from your prompts.

---

## ✨ Key Features

- **📊 Integrated Analytics:** Track your creative output and usage through a data-rich dashboard.
- **🛡️ Enterprise Security:** Protected by **Cloudflare Turnstile** and Supabase Auth for a secure, bot-free experience.
- **💎 Premium UX:** A "Silk" animated background system, GSAP-driven transitions, and Three.js 3D elements provide a world-class user experience.
- **⚡ Core Infrastructure:** Built on Next.js 15 with Turbopack for lightning-fast responsiveness and SEO optimization.
- **☁️ Supabase Backend:** Secure real-time database, edge functions, and credit management system.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router) |
| **Backend** | Supabase (PostgreSQL, Auth, Storage) |
| **AI SDK** | Vercel AI SDK, Hugging Face, Replicate |
| **Styling** | Tailwind CSS, DaisyUI, Framer Motion |
| **Graphics** | Three.js, React Three Fiber, GSAP |
| **Security** | Cloudflare Turnstile |
| **Fonts** | Outfit, Noto Serif (Google Fonts) |

---

## 🏁 Getting Started

### 1. Prerequisites
- Node.js 18.x or later
- A Supabase Project
- API Keys for AI Providers (Hugging Face, Replicate, ElevenLabs)

### 2. Installation
```bash
git clone https://github.com/your-username/rive-ai.git
cd rive-ai
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root and populate it with your keys:

```env
# AI PROVIDERS
HUGGINGFACE_API_KEY="your_key"
REPLICATE_API_TOKEN="your_key"
ELEVENLABS_API_KEY="your_key"

# SUPABASE
NEXT_PUBLIC_SUPABASE_URL="your_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"

# SECURITY
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY="your_site_key"
CLOUDFLARE_TURNSTILE_SECRET_KEY="your_secret_key"
```

### 4. Launch
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to start your journey.

---

## 📐 Project Structure

- `/src/app`: Next.js App Router (Dashboard, Login, Rate pages).
- `/src/components`: UI library (Custom animations, Auth forms, 3D scenes).
- `/src/utils`: Supabase clients and helper functions.
- `/public`: Static assets (Logo animations, videos).

---

## 🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

*Rive AI — Shaping the future of digital creativity.*
