"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Book, Code2, Key, Zap, Image as ImageIcon, MessageSquare,
    Link as LinkIcon, ChevronRight, Search, FileText, Blocks, Mic
} from 'lucide-react'

// --- Mock Content Data ---

const DOCS_NAV = [
    {
        title: "Getting Started",
        items: [
            { id: "intro", label: "Introduction", icon: Book },
            { id: "quickstart", label: "Quickstart", icon: Zap },
            { id: "auth", label: "Authentication", icon: Key },
        ]
    },
    {
        title: "Core Endpoints",
        items: [
            { id: "chat", label: "Text & Chat", icon: MessageSquare },
            { id: "image", label: "Image Generation", icon: ImageIcon },
            { id: "audio", label: "Text to Speech", icon: Mic },
            { id: "models", label: "Available Models", icon: Blocks },
        ]
    }
]

const DOCS_CONTENT: Record<string, { title: string, subtitle: string, render: () => React.ReactNode }> = {
    intro: {
        title: "Introduction",
        subtitle: "Welcome to the Rive API documentation.",
        render: () => (
            <div className="space-y-6 text-zinc-300 leading-relaxed max-w-3xl">
                <p>
                    The Rive API provides simple RESTful interfaces to state-of-the-art multimodal AI models.
                    Whether you are building conversational agents, generating high-quality image assets, or converting
                    text to lifelike speech, our API is designed to be deeply integrated into your stack.
                </p>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 mt-8 flex gap-4">
                    <Zap className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                    <div>
                        <h4 className="text-emerald-400 font-bold mb-1">Built for speed</h4>
                        <p className="text-emerald-400/80 text-sm">
                            Our endpoints are globally distributed to ensure edge-like latency,
                            allowing you to serve AI features to your users in real time.
                        </p>
                    </div>
                </div>

                <h3 className="text-2xl font-bold text-white mt-12 mb-4">Base URL</h3>
                <p>All API requests should be prefixed with the following base URL:</p>
                <div className="bg-black/60 border border-zinc-800 rounded-xl p-4 font-mono text-sm text-zinc-300 select-all mt-4">
                    https://api.rive.ai/v1
                </div>
            </div>
        )
    },
    auth: {
        title: "Authentication",
        subtitle: "Secure your API requests using a standard Bearer token.",
        render: () => (
            <div className="space-y-6 text-zinc-300 leading-relaxed max-w-3xl">
                <p>
                    The Rive API uses API keys to authenticate requests. You can view and manage your
                    API keys in the <a href="/dashboard/api" className="text-indigo-400 hover:underline">API Dashboard</a>.
                </p>

                <p>
                    Your API keys carry many privileges, so be sure to keep them secure! Do not share your secret
                    API keys in publicly accessible areas such as GitHub, client-side code, and so forth.
                </p>

                <h3 className="text-2xl font-bold text-white mt-12 mb-4">Bearer Authentication</h3>
                <p>Authentication to the API is performed via HTTP Bearer Auth. Provide your API key as the Bearer token in the <code>Authorization</code> header.</p>

                <div className="bg-[#1e1e1e] border border-zinc-800 rounded-xl mt-6 overflow-hidden">
                    <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="ml-2 text-xs text-zinc-500 font-mono">cURL</span>
                    </div>
                    <div className="p-4 font-mono text-sm overflow-x-auto text-zinc-300">
                        <pre>
                            <span className="text-pink-400">curl</span> https://api.rive.ai/v1/models \
                            <span className="text-cyan-400">-H</span> <span className="text-yellow-300">"Authorization: Bearer rive_sk_your_api_key_here"</span>
                        </pre>
                    </div>
                </div>
            </div>
        )
    },
    chat: {
        title: "Text & Chat Generation",
        subtitle: "Generate natural language responses using advanced LLMs.",
        render: () => (
            <div className="space-y-6 text-zinc-300 leading-relaxed max-w-4xl">
                <p>
                    The chat completions endpoint allows you to stream or batch generate text responses
                    based on a sequence of messages. It supports conversational memory by taking
                    a full array of prior messages as input.
                </p>

                <h3 className="text-2xl font-bold text-white mt-12 mb-6">Create chat completion</h3>
                <div className="flex items-center gap-4 mb-6">
                    <span className="px-3 py-1 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold text-xs uppercase tracking-wider font-mono">
                        POST
                    </span>
                    <code className="text-sm font-mono text-zinc-200">/v1/chat/completions</code>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-6">
                    {/* Params Column */}
                    <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">Body Parameters</h4>

                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <code className="text-indigo-400 font-bold">model</code>
                                    <span className="text-xs text-red-400">required</span>
                                    <span className="text-xs text-zinc-500">string</span>
                                </div>
                                <p className="text-sm text-zinc-400">ID of the model to use. See the model endpoint compatibility table for details on which models work with the Chat API.</p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <code className="text-indigo-400 font-bold">messages</code>
                                    <span className="text-xs text-red-400">required</span>
                                    <span className="text-xs text-zinc-500">array</span>
                                </div>
                                <p className="text-sm text-zinc-400 mb-2">A list of messages comprising the conversation so far.</p>
                                <div className="pl-4 border-l-2 border-zinc-800 space-y-3 mt-3">
                                    <div>
                                        <code className="text-zinc-300 text-sm">role</code> <span className="text-xs text-zinc-500 ml-1">string</span>
                                        <p className="text-xs text-zinc-400 mt-1">The role of the message author. One of <code>system</code>, <code>user</code>, or <code>assistant</code>.</p>
                                    </div>
                                    <div>
                                        <code className="text-zinc-300 text-sm">content</code> <span className="text-xs text-zinc-500 ml-1">string</span>
                                        <p className="text-xs text-zinc-400 mt-1">The contents of the message.</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <code className="text-white font-bold">temperature</code>
                                    <span className="text-xs text-zinc-500">number</span>
                                </div>
                                <p className="text-sm text-zinc-400">What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.</p>
                            </div>
                        </div>
                    </div>

                    {/* Example Column */}
                    <div className="bg-[#1e1e1e] border border-zinc-800 rounded-xl overflow-hidden self-start sticky top-8">
                        <div className="bg-zinc-900/80 px-4 py-2 border-b border-zinc-800">
                            <span className="text-xs text-zinc-400 font-mono">Request Example</span>
                        </div>
                        <div className="p-4 font-mono text-xs overflow-x-auto text-zinc-300 leading-loose">
                            <pre>
                                <span className="text-pink-400">curl</span> https://api.rive.ai/v1/chat/completions \
                                <span className="text-cyan-400">-H</span> <span className="text-yellow-300">"Content-Type: application/json"</span> \
                                <span className="text-cyan-400">-H</span> <span className="text-yellow-300">"Authorization: Bearer rive_sk_••••••"</span> \
                                <span className="text-cyan-400">-d</span> <span className="text-yellow-300">'{'{'}
                                    "model": "rive-pro-max",
                                    "messages": [
                                    {'{'}
                                    "role": "system",
                                    "content": "You are a helpful assistant."
                                    {'}'},
                                    {'{'}
                                    "role": "user",
                                    "content": "Hello!"
                                    {'}'}
                                    ]
                                    {'}'}'</span>
                            </pre>
                        </div>
                        <div className="bg-zinc-900/80 px-4 py-2 border-y border-zinc-800">
                            <span className="text-xs text-emerald-400 font-mono">Response Example</span>
                        </div>
                        <div className="p-4 font-mono text-xs overflow-x-auto text-zinc-300 leading-relaxed">
                            <pre>
                                {`{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "rive-pro-max",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Hello there, how may I assist you today?"
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 9,
    "completion_tokens": 12,
    "total_tokens": 21
  }
}`}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    quickstart: {
        title: "Quickstart",
        subtitle: "Have your first API request running in under 2 minutes.",
        render: () => (
            <div className="space-y-6 text-zinc-300 leading-relaxed max-w-4xl">
                <p>
                    Ready to build? Let's install the official SDK and generate some text. The fastest way
                    to interact with Rive is using our official Node.js SDK.
                </p>

                <h3 className="text-2xl font-bold text-white mt-12 mb-4">1. Install the SDK</h3>
                <p>Install the package using your favorite package manager.</p>
                <div className="bg-[#1e1e1e] border border-zinc-800 rounded-xl overflow-hidden mt-2">
                    <div className="p-4 font-mono text-sm text-zinc-300">
                        <pre>npm install @rive-ai/sdk</pre>
                    </div>
                </div>

                <h3 className="text-2xl font-bold text-white mt-12 mb-4">2. Make your first request</h3>
                <p>Initialize the client using your API key and call the <code>generate</code> method.</p>
                <div className="bg-[#1e1e1e] border border-zinc-800 rounded-xl mt-4 overflow-hidden">
                    <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex items-center gap-2">
                        <span className="text-xs text-zinc-500 font-mono">index.js</span>
                    </div>
                    <div className="p-4 font-mono text-sm overflow-x-auto text-zinc-300">
                        <pre>
                            <span className="text-pink-400">import</span> {`{`} Rive {`}`} <span className="text-pink-400">from</span> <span className="text-emerald-300">'@rive-ai/sdk'</span>;

                            <span className="text-pink-400">const</span> rive = <span className="text-pink-400">new</span> Rive({`{`}
                            apiKey: process.env.RIVE_API_KEY
                            {`}`});

                            <span className="text-pink-400">async function</span> <span className="text-blue-300">main</span>() {`{`}
                            <span className="text-pink-400">const</span> response = <span className="text-pink-400">await</span> rive.text.generate({`{`}
                            model: <span className="text-emerald-300">'rive-pro-max'</span>,
                            prompt: <span className="text-emerald-300">'Why is the sky blue?'</span>
                            {`}`});

                            <span className="text-cyan-400">console</span>.log(response.text);
                            {`}`}

                            main();
                        </pre>
                    </div>
                </div>
            </div>
        )
    },
    image: {
        title: "Image Generation",
        subtitle: "Generate, edit, and manipulate images using simple text prompts.",
        render: () => (
            <div className="space-y-6 text-zinc-300 leading-relaxed max-w-4xl">
                <p>
                    The image generation endpoint allows you to turn natural language prompts into high-quality
                    images. You can specify the number of images to generate, their size, and more.
                </p>

                <h3 className="text-2xl font-bold text-white mt-12 mb-6">Create image</h3>
                <div className="flex items-center gap-4 mb-6">
                    <span className="px-3 py-1 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold text-xs uppercase tracking-wider font-mono">
                        POST
                    </span>
                    <code className="text-sm font-mono text-zinc-200">/v1/images/generations</code>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-6">
                    <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">Body Parameters</h4>

                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <code className="text-indigo-400 font-bold">prompt</code>
                                    <span className="text-xs text-red-400">required</span>
                                    <span className="text-xs text-zinc-500">string</span>
                                </div>
                                <p className="text-sm text-zinc-400">A text description of the desired image. The maximum length is 1000 characters.</p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <code className="text-white font-bold">n</code>
                                    <span className="text-xs text-zinc-500">integer</span>
                                </div>
                                <p className="text-sm text-zinc-400">The number of images to generate. Must be between 1 and 10. Defaults to 1.</p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <code className="text-white font-bold">size</code>
                                    <span className="text-xs text-zinc-500">string</span>
                                </div>
                                <p className="text-sm text-zinc-400">The size of the generated images. Must be one of <code>256x256</code>, <code>512x512</code>, or <code>1024x1024</code>.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1e1e1e] border border-zinc-800 rounded-xl overflow-hidden self-start sticky top-8">
                        <div className="bg-zinc-900/80 px-4 py-2 border-b border-zinc-800">
                            <span className="text-xs text-zinc-400 font-mono">Request Example</span>
                        </div>
                        <div className="p-4 font-mono text-xs overflow-x-auto text-zinc-300 leading-loose">
                            <pre>
                                <span className="text-pink-400">curl</span> https://api.rive.ai/v1/images/generations \
                                <span className="text-cyan-400">-H</span> <span className="text-yellow-300">"Content-Type: application/json"</span> \
                                <span className="text-cyan-400">-H</span> <span className="text-yellow-300">"Authorization: Bearer rive_sk_••••••"</span> \
                                <span className="text-cyan-400">-d</span> <span className="text-yellow-300">'{'{'}
                                    "prompt": "evaluate the landscape",
                                    "n": 1,
                                    "size": "1024x1024"
                                    {'}'}'</span>
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    audio: {
        title: "Text to Speech",
        subtitle: "Generate lifelike spoken audio from text.",
        render: () => (
            <div className="space-y-6 text-zinc-300 leading-relaxed max-w-4xl">
                <p>
                    The text-to-speech built-in integration relies on high-quality voice models. Use it to output
                    raw MP3 or other audio stream formats so you can embed dynamic voice generation into videos or podcasts.
                </p>

                <h3 className="text-2xl font-bold text-white mt-12 mb-6">Create speech stream</h3>
                <div className="flex items-center gap-4 mb-6">
                    <span className="px-3 py-1 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold text-xs uppercase tracking-wider font-mono">
                        POST
                    </span>
                    <code className="text-sm font-mono text-zinc-200">/v1/audio/speech</code>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-6">
                    <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">Body Parameters</h4>

                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <code className="text-indigo-400 font-bold">input</code>
                                    <span className="text-xs text-red-400">required</span>
                                    <span className="text-xs text-zinc-500">string</span>
                                </div>
                                <p className="text-sm text-zinc-400">The text to generate audio for. The maximum length is 4096 characters.</p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <code className="text-indigo-400 font-bold">voice</code>
                                    <span className="text-xs text-red-400">required</span>
                                    <span className="text-xs text-zinc-500">string</span>
                                </div>
                                <p className="text-sm text-zinc-400">The voice to use. Supported options are predefined voice IDs such as <code>alloy</code>, <code>echo</code>, <code>fable</code>, <code>onyx</code>, <code>nova</code>, and <code>shimmer</code>.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1e1e1e] border border-zinc-800 rounded-xl overflow-hidden self-start sticky top-8">
                        <div className="bg-zinc-900/80 px-4 py-2 border-b border-zinc-800">
                            <span className="text-xs text-zinc-400 font-mono">Request Example</span>
                        </div>
                        <div className="p-4 font-mono text-xs overflow-x-auto text-zinc-300 leading-loose">
                            <pre>
                                <span className="text-pink-400">curl</span> https://api.rive.ai/v1/audio/speech \
                                <span className="text-cyan-400">-H</span> <span className="text-yellow-300">"Authorization: Bearer rive_sk_••••••"</span> \
                                <span className="text-cyan-400">-H</span> <span className="text-yellow-300">"Content-Type: application/json"</span> \
                                <span className="text-cyan-400">-d</span> <span className="text-yellow-300">'{'{'}
                                    "model": "tts-1",
                                    "input": "The quick brown fox jumps.",
                                    "voice": "alloy"
                                    {'}'}'</span> \
                                <span className="text-cyan-400">--output</span> speech.mp3
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    models: {
        title: "Available Models",
        subtitle: "List and describe the various models available in the API.",
        render: () => (
            <div className="space-y-6 text-zinc-300 leading-relaxed max-w-4xl">
                <p>
                    Use this endpoint to retrieve a list of currently available models, and obtain basic
                    information about each model such as its owner and permissions.
                </p>

                <h3 className="text-2xl font-bold text-white mt-12 mb-6">List models</h3>
                <div className="flex items-center gap-4 mb-6">
                    <span className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs uppercase tracking-wider font-mono">
                        GET
                    </span>
                    <code className="text-sm font-mono text-zinc-200">/v1/models</code>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-6">
                    <div>
                        <div className="bg-[#1e1e1e] border border-zinc-800 rounded-xl overflow-hidden self-start">
                            <div className="bg-zinc-900/80 px-4 py-2 border-b border-zinc-800">
                                <span className="text-xs text-zinc-400 font-mono">Request Example</span>
                            </div>
                            <div className="p-4 font-mono text-xs overflow-x-auto text-zinc-300 leading-loose">
                                <pre>
                                    <span className="text-pink-400">curl</span> https://api.rive.ai/v1/models \
                                    <span className="text-cyan-400">-H</span> <span className="text-yellow-300">"Authorization: Bearer rive_sk_••••••"</span>
                                </pre>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="bg-[#1e1e1e] border border-zinc-800 rounded-xl overflow-hidden self-start">
                            <div className="bg-zinc-900/80 px-4 py-2 border-b border-zinc-800">
                                <span className="text-xs text-emerald-400 font-mono">Response Example</span>
                            </div>
                            <div className="p-4 font-mono text-xs overflow-x-auto text-zinc-300 leading-loose">
                                <pre>
                                    {`{
  "object": "list",
  "data": [
    {
      "id": "rive-pro-max",
      "object": "model",
      "created": 1686935002,
      "owned_by": "rive"
    },
    {
      "id": "rive-flash",
      "object": "model",
      "created": 1692901427,
      "owned_by": "rive"
    }
  ]
}`}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}


export default function DocsPage() {
    const [activeDoc, setActiveDoc] = useState('intro')
    const [searchQuery, setSearchQuery] = useState('')

    const currentDoc = DOCS_CONTENT[activeDoc] || DOCS_CONTENT['intro']

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-200 font-sans flex flex-col md:flex-row">

            {/* Sidebar Navigation */}
            <aside className="w-full md:w-72 lg:w-80 border-r border-zinc-800/80 bg-[#0a0a0a]/95 backdrop-blur-xl shrink-0 flex flex-col md:sticky md:top-0 md:h-screen z-20 overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
                            <Code2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-white tracking-tight">Rive Docs</span>
                    </div>

                    <div className="relative mb-8">
                        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search docs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:bg-zinc-900 transition-colors"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                            <kbd className="hidden sm:inline-flex items-center justify-center rounded border border-zinc-800 bg-zinc-900 px-1.5 text-[10px] font-medium text-zinc-500">Ctrl</kbd>
                            <kbd className="hidden sm:inline-flex items-center justify-center rounded border border-zinc-800 bg-zinc-900 px-1.5 text-[10px] font-medium text-zinc-500">K</kbd>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {DOCS_NAV.map((section, idx) => (
                            <div key={idx}>
                                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 px-1">
                                    {section.title}
                                </h4>
                                <ul className="space-y-1">
                                    {section.items.map((item) => {
                                        const disabled = !DOCS_CONTENT[item.id]
                                        const active = activeDoc === item.id

                                        return (
                                            <li key={item.id}>
                                                <button
                                                    onClick={() => !disabled && setActiveDoc(item.id)}
                                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${active
                                                        ? 'bg-indigo-500/10 text-indigo-400 font-semibold shadow-[inset_2px_0_0_0_#6366f1]'
                                                        : disabled
                                                            ? 'opacity-40 cursor-not-allowed text-zinc-500'
                                                            : 'hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 cursor-pointer'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <item.icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-zinc-500'}`} />
                                                        {item.label}
                                                    </div>
                                                    {disabled && <span className="text-[9px] uppercase tracking-wider bg-zinc-800/50 px-2 py-0.5 rounded text-zinc-500 font-bold">Soon</span>}
                                                </button>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 relative min-w-0">

                {/* Background Ambient Effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
                <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-emerald-500/3 blur-[120px] rounded-full pointer-events-none -z-10" />

                <div className="max-w-5xl mx-auto px-6 md:px-12 py-10 md:py-20">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeDoc}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <header className="mb-10 lg:mb-16">
                                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">{currentDoc.title}</h1>
                                <p className="text-xl text-zinc-400 max-w-2xl">{currentDoc.subtitle}</p>
                            </header>

                            <div className="prose prose-invert prose-zinc max-w-none">
                                {currentDoc.render()}
                            </div>

                            {/* Standard Footer for Docs */}
                            <div className="mt-20 pt-8 border-t border-zinc-800/80 flex justify-between items-center text-sm text-zinc-500">
                                <span>Was this page helpful?</span>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1.5 rounded-md hover:bg-zinc-900 border border-zinc-800 transition-colors">Yes</button>
                                    <button className="px-3 py-1.5 rounded-md hover:bg-zinc-900 border border-zinc-800 transition-colors">No</button>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    )
}
