'use client'

import React, { useEffect, useState } from 'react'
import { X, ImageIcon, Video, Type, Mic2, Box, Sparkles, Loader2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getUserGenerations, shareToCommunity, ToolType } from './actions'

interface ShareWorkModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ShareWorkModal({ isOpen, onClose, onSuccess }: ShareWorkModalProps) {
  const [generations, setGenerations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadHistory()
    }
  }, [isOpen])

  const loadHistory = async () => {
    setIsLoading(true)
    try {
      const data = await getUserGenerations()
      setGenerations(data)
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    const selected = generations.find(g => g.id === selectedId)
    if (!selected) return

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('prompt', selected.prompt)
      formData.append('previewUrl', selected.result)
      formData.append('toolType', selected.tool_type)

      const res = await shareToCommunity(formData)
      if (res.success) {
        onSuccess()
        onClose()
      } else {
        alert(res.error || "Failed to share")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Share Your Creation</h2>
            <p className="text-sm text-zinc-500">Choose a work from your history to share with the community</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-zinc-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              <p className="text-sm text-zinc-600">Retrieving your masterpieces...</p>
            </div>
          ) : generations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-zinc-700" />
                </div>
                <div>
                    <h3 className="font-bold text-zinc-400">No works yet</h3>
                    <p className="text-sm text-zinc-600 max-w-[240px] mt-1">Start generating content with our AI tools to share it here.</p>
                </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {generations.map((gen) => (
                <div 
                  key={gen.id}
                  onClick={() => setSelectedId(gen.id)}
                  className={cn(
                    "group relative rounded-2xl overflow-hidden border transition-all cursor-pointer",
                    selectedId === gen.id 
                      ? "border-purple-500 ring-2 ring-purple-500/20" 
                      : "border-white/5 hover:border-white/20 bg-zinc-900/40"
                  )}
                >
                  <div className="aspect-video relative overflow-hidden bg-black flex items-center justify-center">
                    {gen.tool_type === 'Image' ? (
                        <img 
                            src={gen.result.startsWith('data:') ? gen.result : `data:image/png;base64,${gen.result}`} 
                            alt="thumb" 
                            className="w-full h-full object-cover" 
                        />
                    ) : gen.tool_type === 'Video' ? (
                        <div className="flex flex-col items-center gap-2">
                             <video src={gen.result} className="w-full h-full" />
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Video className="w-8 h-8 text-white/50" />
                             </div>
                        </div>
                    ) : gen.tool_type === 'Audio' ? (
                        <Mic2 className="w-10 h-10 text-zinc-700" />
                    ) : (
                        <Type className="w-10 h-10 text-zinc-700" />
                    )}

                    {/* Badge */}
                    <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/60 backdrop-blur-md text-[8px] font-black uppercase text-white/70 border border-white/5">
                        {gen.tool_type}
                    </div>

                    {/* Selected Indicator */}
                    {selectedId === gen.id && (
                        <div className="absolute inset-0 bg-purple-500/10 flex items-center justify-center">
                             <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/40">
                                <ArrowRight className="w-4 h-4 text-white" />
                             </div>
                        </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] text-zinc-400 line-clamp-2 italic">"{gen.prompt}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-sm font-bold text-zinc-400 transition-colors"
          >
            Cancel
          </button>
          <button 
            disabled={!selectedId || isSubmitting}
            onClick={handleShare}
            className="flex-[2] py-3 px-4 rounded-xl bg-white text-black text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sharing...
              </>
            ) : (
              'Share with Community'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
