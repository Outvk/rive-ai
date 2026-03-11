'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Key, Plus, Copy, Trash2, Eye, EyeOff, Check,
    Terminal, Zap, Shield, Clock, AlertTriangle,
    ChevronRight, Code2, Braces, BookOpen, ArrowUpRight,
} from 'lucide-react'

type ApiKey = {
    id: string
    name: string
    key: string
    created: string
    lastUsed: string | null
    requests: number
    active: boolean
}

const CODE_TABS = {
    curl: {
        label: 'cURL',
        lang: 'bash',
        code: `# ── Text Generation ──────────────────────────────
curl -X POST https://api.rive.ai/v1/generate \\
  -H "Authorization: Bearer rive_sk_••••••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Write a short poem about the stars",
    "type": "text",
    "max_tokens": 512,
    "temperature": 0.8
  }'

# ── Image Generation ──────────────────────────────
curl -X POST https://api.rive.ai/v1/image \\
  -H "Authorization: Bearer rive_sk_••••••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "A futuristic city at night, neon lights",
    "size": "1024x1024",
    "quality": "hd",
    "n": 1
  }'

# ── Check Usage ───────────────────────────────────
curl https://api.rive.ai/v1/usage \\
  -H "Authorization: Bearer rive_sk_••••••••••••"`,
    },
    node: {
        label: 'Node.js',
        lang: 'js',
        code: `import Rive from '@rive-ai/sdk'

const rive = new Rive({
  apiKey: process.env.RIVE_API_KEY,   // rive_sk_••••••••••••
  timeout: 30_000,
})

// ── Text Generation ──────────────────────────────
async function generateText() {
  const result = await rive.generate({
    prompt: 'Write a short poem about the stars',
    type: 'text',
    maxTokens: 512,
    temperature: 0.8,
  })
  console.log('Text:', result.content)
  console.log('Credits used:', result.creditsUsed)
}

// ── Multi-turn Chat ───────────────────────────────
async function chat() {
  const messages = [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user',   content: 'Explain black holes simply.' },
  ]
  const response = await rive.chat({ messages, model: 'rive-pro' })
  console.log('Reply:', response.message.content)
}

// ── Image Generation ──────────────────────────────
async function generateImage() {
  const img = await rive.image({
    prompt: 'A futuristic city at night, neon lights',
    size: '1024x1024',
    quality: 'hd',
  })
  console.log('Image URL:', img.url)
}

await generateText()
await chat()
await generateImage()`,
    },
    python: {
        label: 'Python',
        lang: 'python',
        code: `import os
from rive_ai import Rive

client = Rive(api_key=os.environ["RIVE_API_KEY"])  # rive_sk_••••


# ── Text Generation ──────────────────────────────
def generate_text():
    result = client.generate(
        prompt="Write a short poem about the stars",
        type="text",
        max_tokens=512,
        temperature=0.8,
    )
    print("Text:", result.content)
    print("Credits used:", result.credits_used)


# ── Multi-turn Chat ───────────────────────────────
def chat():
    response = client.chat(
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user",   "content": "Explain black holes simply."},
        ],
        model="rive-pro",
    )
    print("Reply:", response.message.content)


# ── Image Generation ──────────────────────────────
def generate_image():
    img = client.image(
        prompt="A futuristic city at night, neon lights",
        size="1024x1024",
        quality="hd",
    )
    print("Image URL:", img.url)


# ── Check Usage ───────────────────────────────────
def check_usage():
    usage = client.usage()
    print(f"Credits remaining: {usage.credits_remaining}")
    print(f"Requests this month: {usage.requests_count}")


if __name__ == "__main__":
    generate_text()
    chat()
    generate_image()
    check_usage()`,
    },
}

// ─── Syntax Highlighting ───────────────────────────────────────────────────

type Token = { text: string; color: string }

function tokenizeBashArgs(text: string): Token[] {
    const tokens: Token[] = []
    const re = /(-[XHd]|--\w[\w-]*|\bhttps?:\/\/[^\s'"\\]+|"[^"]*"|'[^']*'|[\{\}\[\]\\]|\S+)/g
    let last = 0, m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
        if (m.index > last) tokens.push({ text: text.slice(last, m.index), color: '#a1a1aa' })
        const t = m[0]
        if (/^-/.test(t)) tokens.push({ text: t, color: '#79c0ff' })
        else if (/^https?:\/\//.test(t)) tokens.push({ text: t, color: '#7ec4a4' })
        else if (t.startsWith('"') || t.startsWith("'")) tokens.push({ text: t, color: '#f1d07a' })
        else if (/^[\{\}\[\]\\]$/.test(t)) tokens.push({ text: t, color: '#c678dd' })
        else tokens.push({ text: t, color: '#d4d4d8' })
        last = m.index + t.length
    }
    if (last < text.length) tokens.push({ text: text.slice(last), color: '#a1a1aa' })
    return tokens
}

function applyRanges(text: string, rules: [RegExp, string][]): Token[] {
    const ranges: { s: number; e: number; color: string }[] = []
    for (const [re, color] of rules) {
        re.lastIndex = 0; let m: RegExpExecArray | null
        while ((m = re.exec(text)) !== null) {
            if (!ranges.some(r => m!.index < r.e && m!.index + m![0].length > r.s))
                ranges.push({ s: m.index, e: m.index + m[0].length, color })
        }
    }
    ranges.sort((a, b) => a.s - b.s)
    const out: Token[] = []; let cur = 0
    for (const r of ranges) {
        if (r.s > cur) out.push({ text: text.slice(cur, r.s), color: '#d4d4d8' })
        out.push({ text: text.slice(r.s, r.e), color: r.color })
        cur = r.e
    }
    if (cur < text.length) out.push({ text: text.slice(cur), color: '#d4d4d8' })
    return out.length ? out : [{ text: text, color: '#d4d4d8' }]
}

function tokenizeLine(line: string, lang: string): Token[] {
    if (lang === 'bash') {
        if (/^\s*#/.test(line)) return [{ text: line, color: '#5c7a5c' }]
        if (/^(curl)\b/.test(line.trimStart())) {
            const idx = line.indexOf('curl')
            return [
                { text: line.slice(0, idx), color: '#a1a1aa' },
                { text: 'curl', color: '#f92672' },
                ...tokenizeBashArgs(line.slice(idx + 4)),
            ]
        }
        return tokenizeBashArgs(line)
    }
    if (lang === 'js') {
        if (/^\s*\/\//.test(line)) return [{ text: line, color: '#5c7a5c' }]
        return applyRanges(line, [
            [/(["'`])(?:(?!\1).|\\.)*\1/g, '#f1d07a'],
            [/\b(import|export|from|const|let|var|async|await|function|return|if|else|new|class|true|false|null|undefined|typeof)\b/g, '#c678dd'],
            [/\b([A-Z][a-zA-Z]+)\b/g, '#e5c07b'],
            [/\b([a-zA-Z_$][\w$]*)\s*(?=\()/g, '#61afef'],
            [/\b\d+(?:_\d+)?\b/g, '#d19a66'],
            [/[=<>!+\-*/%&|^~?:]+/g, '#56b6c2'],
        ])
    }
    if (lang === 'python') {
        if (/^\s*#/.test(line)) return [{ text: line, color: '#5c7a5c' }]
        return applyRanges(line, [
            [/f(?:"[^"]*"|'[^']*')/g, '#e5c07b'],
            [/(["'])(?:(?!\1).|\\.)*\1/g, '#f1d07a'],
            [/\b(import|from|def|class|return|if|elif|else|for|while|with|as|in|not|and|or|True|False|None|print|self|os|__name__|__main__)\b/g, '#c678dd'],
            [/\b([A-Z][a-zA-Z]+)\b/g, '#e5c07b'],
            [/\b([a-zA-Z_][\w]*)\s*(?=\()/g, '#61afef'],
            [/\b\d+\b/g, '#d19a66'],
            [/[=<>!+\-*/%&|^~?:]+/g, '#56b6c2'],
        ])
    }
    return [{ text: line, color: '#d4d4d8' }]
}

function HighlightedCode({ code, lang }: { code: string; lang: string }) {
    const lines = code.split('\n')
    return (
        <div style={{ overflowX: 'auto', fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace", fontSize: '0.72rem', lineHeight: 1.85 }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' }}>
                <tbody>
                    {lines.map((line, i) => (
                        <tr key={i} style={{ transition: 'background 0.1s' }} className="group hover:bg-white/[0.03]">
                            <td style={{ width: 44, textAlign: 'right', paddingRight: '1rem', paddingLeft: '0.75rem', color: '#3a3a48', userSelect: 'none', fontSize: '0.62rem', verticalAlign: 'top', paddingTop: 2 }}>
                                {i + 1}
                            </td>
                            <td style={{ paddingRight: '1.75rem', whiteSpace: 'pre', verticalAlign: 'top' }}>
                                {line === '' ? '\u00a0' : tokenizeLine(line, lang).map((tok, j) => (
                                    <span key={j} style={{ color: tok.color }}>{tok.text}</span>
                                ))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

const ENDPOINTS = [
    { method: 'POST', path: '/v1/generate', desc: 'Generate text, images, or audio from a prompt', badge: 'Core', badgeColor: '#6366f1' },
    { method: 'POST', path: '/v1/chat', desc: 'Multi-turn conversational AI with memory', badge: 'Core', badgeColor: '#6366f1' },
    { method: 'POST', path: '/v1/speech', desc: 'Convert text to natural-sounding audio (ElevenLabs)', badge: 'Audio', badgeColor: '#f59e0b' },
    { method: 'GET', path: '/v1/usage', desc: 'Retrieve credit usage and request analytics', badge: 'Account', badgeColor: '#22d3ee' },
    { method: 'POST', path: '/v1/image', desc: 'Generate high-quality images from text', badge: 'Vision', badgeColor: '#a855f7' },
    { method: 'GET', path: '/v1/keys', desc: 'List and manage your API keys programmatically', badge: 'Keys', badgeColor: '#10b981' },
]

function genKey() {
    const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    return 'rive_sk_' + [12, 4, 4, 12].map(n =>
        Array.from({ length: n }, () => c[Math.floor(Math.random() * c.length)]).join('')
    ).join('-')
}

function mask(key: string) {
    return key.slice(0, 12) + '•'.repeat(18) + key.slice(-4)
}

const METHOD_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    POST: { bg: 'rgba(99,102,241,0.1)', text: '#818cf8', border: 'rgba(99,102,241,0.25)' },
    GET: { bg: 'rgba(34,197,94,0.1)', text: '#4ade80', border: 'rgba(34,197,94,0.25)' },
}

export default function ApiPage() {
    const [keys, setKeys] = useState<ApiKey[]>([
        { id: '1', name: 'Production Key', key: 'rive_sk_prod12345678-abcd-1234-567890abcdef', created: 'Mar 1, 2026', lastUsed: 'Mar 8, 2026', requests: 3841, active: true },
        { id: '2', name: 'Dev / Staging', key: 'rive_sk_dev890abcdef-1234-abcd-ef1234567890', created: 'Feb 20, 2026', lastUsed: 'Mar 6, 2026', requests: 512, active: true },
    ])
    const [visible, setVisible] = useState<Record<string, boolean>>({})
    const [copied, setCopied] = useState<string | null>(null)
    const [creating, setCreating] = useState(false)
    const [name, setName] = useState('')
    const [banner, setBanner] = useState<ApiKey | null>(null)
    const [tab, setTab] = useState<'curl' | 'node' | 'python'>('curl')
    const [codeCopied, setCodeCopied] = useState(false)

    const copy = (id: string, val: string) => {
        navigator.clipboard.writeText(val)
        setCopied(id)
        setTimeout(() => setCopied(null), 2000)
    }

    const copyCode = () => {
        navigator.clipboard.writeText(CODE_TABS[tab].code)
        setCodeCopied(true)
        setTimeout(() => setCodeCopied(false), 2000)
    }

    const create = () => {
        if (!name.trim()) return
        const k: ApiKey = {
            id: Date.now().toString(),
            name: name.trim(),
            key: genKey(),
            created: 'Mar 8, 2026',
            lastUsed: null,
            requests: 0,
            active: true,
        }
        setKeys(p => [k, ...p])
        setBanner(k)
        setVisible(p => ({ ...p, [k.id]: true }))
        setName('')
        setCreating(false)
    }

    const revoke = (id: string) => {
        if (!window.confirm('Permanently revoke this API key?')) return
        setKeys(p => p.filter(k => k.id !== id))
        if (banner?.id === id) setBanner(null)
    }

    const totalReqs = keys.reduce((a, k) => a + k.requests, 0)

    return (
        <div className="relative min-h-full pb-28">

            {/* ── ambient glows ── */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-600/8 blur-[120px]" />
                <div className="absolute top-1/3 -right-40 w-[400px] h-[400px] rounded-full bg-purple-600/6 blur-[100px]" />
                <div className="absolute bottom-0 left-1/3 w-[350px] h-[350px] rounded-full bg-cyan-600/5 blur-[100px]" />
            </div>

            <div className="max-w-5xl mx-auto px-4 space-y-10">

                {/* ══ HEADER ══ */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-2 space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        <Braces className="w-3 h-3" />
                        Developer API
                    </div>
                    <h1 className="text-6xl md:text-5xl font-black tracking-tighter text-white">
                        API Keys &{' '}
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Integration
                        </span>
                    </h1>
                    <p className="text-zinc-400 text-sm max-w-xl leading-relaxed">
                        Manage your secret keys and connect Rive AI to any product, script, or automation.
                    </p>
                </motion.div>

                {/* ══ STAT STRIP ══ */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
                    className="grid grid-cols-3 gap-3"
                >
                    {[
                        { n: keys.length, label: 'Active Keys', icon: Key, color: '#6366f1', glow: '#6366f120' },
                        { n: totalReqs.toLocaleString(), label: 'Total Requests', icon: Zap, color: '#a855f7', glow: '#a855f720' },
                        { n: 'v1.0', label: 'API Version', icon: Shield, color: '#22d3ee', glow: '#22d3ee20' },
                    ].map(({ n, label, icon: Icon, color, glow }, i) => (
                        <div
                            key={i}
                            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18 }}
                            className="flex items-center gap-4 px-5 py-4 group"
                        >
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: glow, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon style={{ width: 17, height: 17, color }} />
                            </div>
                            <div>
                                <p className="text-xl font-black text-white leading-none">{n}</p>
                                <p className="text-[11px] text-zinc-500 font-medium mt-0.5">{label}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* ══ REVEAL BANNER ══ */}
                <AnimatePresence>
                    {banner && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97, y: -8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.97, y: -8 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                            style={{
                                background: 'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(99,102,241,0.06))',
                                border: '1px solid rgba(16,185,129,0.25)',
                                borderRadius: 20,
                                padding: '1.4rem 1.6rem',
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <AlertTriangle className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white">Key created — save it now</p>
                                    <p className="text-xs text-zinc-500 mt-0.5 mb-3">This is the only time it will be shown in full. Store it somewhere safe.</p>
                                    <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '0.7rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                                        <code className="text-xs font-mono text-emerald-400 break-all">{banner.key}</code>
                                        <button onClick={() => copy('banner', banner.key)} className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors flex-shrink-0">
                                            {copied === 'banner' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            {copied === 'banner' ? 'Saved!' : 'Copy'}
                                        </button>
                                    </div>
                                </div>
                                <button onClick={() => setBanner(null)} className="text-zinc-600 hover:text-zinc-300 text-xl leading-none flex-shrink-0">×</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ══ API KEYS PANEL ══ */}
                <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    {/* Panel header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Key className="w-3.5 h-3.5 text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-white">Your Keys</h2>
                                <p className="text-[11px] text-zinc-600">{keys.length} key{keys.length !== 1 ? 's' : ''} active</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setCreating(true)}
                            style={{
                                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                boxShadow: '0 0 24px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
                                borderRadius: 12, padding: '0.55rem 1.1rem', border: 'none', cursor: 'pointer',
                                color: 'white', fontSize: '0.78rem', fontWeight: 700,
                                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s ease',
                            }}
                            className="hover:opacity-90 hover:-translate-y-px"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            New Key
                        </button>
                    </div>

                    {/* Create form */}
                    <AnimatePresence>
                        {creating && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mb-3"
                            >
                                <div style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.07),rgba(139,92,246,0.04))', border: '1px solid rgba(99,102,241,0.18)', borderRadius: 18, padding: '1.4rem 1.5rem' }}>
                                    <p className="text-sm font-bold text-white mb-0.5">Name your key</p>
                                    <p className="text-xs text-zinc-600 mb-4">Descriptive names help you identify where each key is used.</p>
                                    <div className="flex gap-2.5 flex-wrap">
                                        <input
                                            autoFocus type="text"
                                            placeholder="e.g. Production App, CI Pipeline…"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') create(); if (e.key === 'Escape') { setCreating(false); setName('') } }}
                                            style={{ flex: 1, minWidth: 220, background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 11, padding: '0.65rem 1rem', color: 'white', fontSize: '0.84rem', outline: 'none', transition: 'border-color 0.2s' }}
                                            className="placeholder:text-zinc-700 focus:border-indigo-500/50"
                                        />
                                        <button
                                            onClick={create}
                                            disabled={!name.trim()}
                                            style={{ background: name.trim() ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.04)', color: name.trim() ? 'white' : '#3f3f46', padding: '0.65rem 1.3rem', borderRadius: 11, border: 'none', cursor: name.trim() ? 'pointer' : 'not-allowed', fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.2s' }}
                                        >
                                            Generate
                                        </button>
                                        <button onClick={() => { setCreating(false); setName('') }}
                                            style={{ background: 'transparent', color: '#52525b', padding: '0.65rem 1rem', borderRadius: 11, border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s' }}
                                            className="hover:text-zinc-200 hover:border-white/15"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Keys list */}
                    <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden', background: 'rgba(255,255,255,0.015)' }}>
                        {keys.length === 0 ? (
                            <div className="py-20 flex flex-col items-center gap-3">
                                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Key className="w-6 h-6 text-zinc-700" />
                                </div>
                                <p className="text-sm text-zinc-500 font-medium">No API keys yet</p>
                                <p className="text-xs text-zinc-700">Create one to start building.</p>
                            </div>
                        ) : keys.map((k, i) => (
                            <motion.div
                                key={k.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{
                                    borderBottom: i < keys.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                    padding: '1.35rem 1.6rem',
                                    transition: 'background 0.2s',
                                }}
                                className="hover:bg-white/[0.018]"
                            >
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div className="flex-1 min-w-0">
                                        {/* Name row */}
                                        <div className="flex items-center gap-2.5 mb-3">
                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 10px rgba(34,211,238,0.7)', flexShrink: 0, display: 'inline-block' }} />
                                            <span className="text-sm font-bold text-white">{k.name}</span>
                                            <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)', color: '#22d3ee', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                                Active
                                            </span>
                                        </div>

                                        {/* Key display */}
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '0.5rem 0.9rem', maxWidth: '100%' }}>
                                            <code style={{ fontSize: '0.71rem', color: '#71717a', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                                {visible[k.id] ? k.key : mask(k.key)}
                                            </code>
                                            <button onClick={() => setVisible(p => ({ ...p, [k.id]: !p[k.id] }))} className="text-zinc-700 hover:text-zinc-300 transition-colors flex-shrink-0">
                                                {visible[k.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>

                                        {/* Meta */}
                                        <div className="flex items-center gap-5 mt-2.5 flex-wrap">
                                            <span className="flex items-center gap-1.5 text-[11px] text-zinc-600 font-medium">
                                                <Clock className="w-3 h-3" /> Created {k.created}
                                            </span>
                                            <span className="text-[11px] text-zinc-700">
                                                {k.lastUsed ? `Used ${k.lastUsed}` : 'Never used'}
                                            </span>
                                            <span className="text-[11px] text-zinc-700">
                                                {k.requests.toLocaleString()} req
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                                        <button
                                            onClick={() => copy(k.id, k.key)}
                                            style={{
                                                background: copied === k.id ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)',
                                                border: `1px solid ${copied === k.id ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.08)'}`,
                                                color: copied === k.id ? '#34d399' : '#a1a1aa',
                                                padding: '0.45rem 0.95rem',
                                                borderRadius: 10, fontSize: '0.73rem', fontWeight: 600,
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s',
                                            }}
                                            className="hover:bg-white/8 hover:text-white"
                                        >
                                            {copied === k.id
                                                ? <><Check className="w-3.5 h-3.5" /> Copied</>
                                                : <><Copy className="w-3.5 h-3.5" /> Copy</>
                                            }
                                        </button>
                                        <button
                                            onClick={() => revoke(k.id)}
                                            style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.14)', color: '#f87171', padding: '0.45rem 0.7rem', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
                                            className="hover:bg-red-500/15"
                                            title="Revoke"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* ══ FULL-WIDTH: CODE SNIPPET ══ */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
                    <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-4 h-4 text-purple-400" />
                        <h2 className="text-sm font-bold text-white">Quick Start</h2>
                        <span style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: 100, background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', color: '#c084fc', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>SDK Examples</span>
                    </div>
                    <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden', background: '#0d0d14' }}>
                        {/* Tab bar */}
                        <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', padding: '0 0.5rem' }}>
                            {/* Traffic lights */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 0.75rem' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
                            </div>
                            <div style={{ width: 1, background: 'rgba(255,255,255,0.05)', margin: '8px 6px' }} />
                            {(Object.entries(CODE_TABS) as [typeof tab, typeof CODE_TABS[typeof tab]][]).map(([key, val]) => (
                                <button key={key} onClick={() => setTab(key)} style={{
                                    padding: '0.7rem 1.1rem', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                                    background: tab === key ? 'rgba(99,102,241,0.12)' : 'transparent',
                                    border: 'none',
                                    borderBottom: tab === key ? '2px solid #6366f1' : '2px solid transparent',
                                    color: tab === key ? '#818cf8' : '#3f3f46',
                                    transition: 'all 0.2s', letterSpacing: '0.04em',
                                    borderRadius: tab === key ? '6px 6px 0 0' : '0',
                                }} className="hover:text-zinc-300">{val.label}</button>
                            ))}
                            <div style={{ flex: 1 }} />
                            <button onClick={copyCode} style={{ alignSelf: 'center', background: codeCopied ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${codeCopied ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.07)'}`, cursor: 'pointer', color: codeCopied ? '#4ade80' : '#52525b', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.68rem', fontWeight: 600, padding: '0.35rem 0.85rem', borderRadius: 8, margin: '0 0.5rem', transition: 'all 0.2s' }} className="hover:text-zinc-300">
                                {codeCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                {codeCopied ? 'Copied!' : 'Copy code'}
                            </button>
                        </div>
                        {/* Code area */}
                        <AnimatePresence mode="wait">
                            <motion.div key={tab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.13 }}
                                style={{ display: 'flex' }}
                            >
                                {/* Active tab accent line */}
                                <div style={{ width: 3, background: 'linear-gradient(180deg,#6366f1,#a855f7)', flexShrink: 0, borderRadius: '0 0 0 4px', opacity: 0.7 }} />
                                <div style={{ flex: 1, padding: '0.6rem 0', minHeight: 180 }}>
                                    <HighlightedCode code={CODE_TABS[tab].code} lang={CODE_TABS[tab].lang} />
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* ══ ENDPOINTS ══ */}
                <div className="w-full">

                    {/* Endpoints */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
                        <div className="flex items-center w-full gap-2 mb-3">
                            <Terminal className="w-4 h-4 text-cyan-400" />
                            <h2 className="text-sm font-bold text-white">Endpoints</h2>
                        </div>
                        <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden', background: 'rgba(255,255,255,0.015)' }}>
                            {ENDPOINTS.map((ep, i) => {
                                const mc = METHOD_COLORS[ep.method]
                                return (
                                    <div key={i} style={{ borderBottom: i < ENDPOINTS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', padding: '0.9rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.85rem', transition: 'background 0.15s', cursor: 'default' }} className="hover:bg-white/[0.02] group">
                                        <span style={{ fontSize: '0.58rem', fontWeight: 800, padding: '3px 7px', borderRadius: 6, background: mc.bg, color: mc.text, border: `1px solid ${mc.border}`, letterSpacing: '0.07em', flexShrink: 0 }}>
                                            {ep.method}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <code style={{ fontSize: '0.74rem', color: '#d4d4d8', fontFamily: 'monospace' }}>{ep.path}</code>
                                                <span style={{ fontSize: '0.55rem', fontWeight: 700, padding: '1px 6px', borderRadius: 100, background: `${ep.badgeColor}14`, color: ep.badgeColor, border: `1px solid ${ep.badgeColor}28`, letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0 }}>
                                                    {ep.badge}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.68rem', color: '#52525b', marginTop: 2 }}>{ep.desc}</p>
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 text-zinc-800 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                                    </div>
                                )
                            })}
                        </div>
                    </motion.div>
                </div>

                {/* ══ BOTTOM NOTICE ══ */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}
                    style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '1rem 1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}
                >
                    <div className="flex items-center gap-3">
                        <Code2 className="w-4 h-4 text-zinc-700 flex-shrink-0" />
                        <p className="text-xs text-zinc-600 leading-relaxed">
                            Keys have access to your full account. <span className="text-zinc-500 font-semibold">Never commit them to source control.</span>
                        </p>
                    </div>
                    <a href="#" className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 hover:text-indigo-400 transition-colors whitespace-nowrap">
                        Read the docs <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                </motion.div>

            </div>
        </div>
    )
}
