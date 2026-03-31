'use client'

import React, { useState, useEffect } from 'react'
import { Bell, Check, X, BellOff, Info, AlertTriangle, ShieldCheck, Trash2 } from 'lucide-react'
import { createSecondaryClient } from '@/utils/supabase/secondary-client'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { deleteNotifications, clearAllNotifications as serverClearAll, markNotificationsAsRead } from '@/app/dashboard/notifications/actions'
import { toast } from 'sonner'

function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  let interval = Math.floor(seconds / 31536000)
  if (interval > 1) return interval + " years ago"
  interval = Math.floor(seconds / 2592000)
  if (interval > 1) return interval + " months ago"
  interval = Math.floor(seconds / 86400)
  if (interval > 1) return interval + " days ago"
  interval = Math.floor(seconds / 3600)
  if (interval > 1) return interval + " hours ago"
  interval = Math.floor(seconds / 60)
  if (interval > 1) return interval + " mins ago"
  return "just now"
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'security'
  is_read: boolean
  created_at: string
}

export function NotificationBell({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [animateBell, setAnimateBell] = useState(false)
  const [showPulse, setShowPulse] = useState(false)
  const [mounted, setMounted] = useState(false)
  const supabase = createSecondaryClient()

  // 1. Initial Fetch
  const fetchNotifications = React.useCallback(async () => {
    if (!userId) return

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    console.log('NotificationBell - Fetch Result:', { data, error, url: process.env.NEXT_PUBLIC_SUPABASE_SECONDARY_URL })

    if (error) {
      console.error('NotificationBell: Fetch error', error)
    }

    if (data) {
      console.log('NotificationBell: Fetched', data.length, 'notes')
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.is_read).length)
    }
  }, [userId, supabase])

  useEffect(() => {
    setMounted(true)
    if (!userId) {
      console.log('NotificationBell: No userId found')
      return
    }

    console.log('NotificationBell: Initializing for userId', userId)

    fetchNotifications()

    // 2. Realtime Subscription
    const channel = supabase
      .channel(`user-notes-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('NotificationBell: New incoming payload', payload)
          const newNotif = payload.new as Notification
          setNotifications(prev => [newNotif, ...prev].slice(0, 10))
          setUnreadCount(prev => prev + 1)
          
          // Trigger shake & pulse animation
          setAnimateBell(true)
          setShowPulse(true)
          setTimeout(() => {
            setAnimateBell(false)
            setShowPulse(false)
          }, 2000)

          // Optional: Browser Notification API
          if (Notification.permission === 'granted') {
             new Notification(newNotif.title, { body: newNotif.message })
          }
        }
      )
      .subscribe((status) => {
        console.log('NotificationBell: Subscription status', status)
      })

    return () => {
      console.log('NotificationBell: Cleaning up channel')
      supabase.removeChannel(channel)
    }
  }, [userId])

  const markAsRead = async (id: string) => {
    const res = await markNotificationsAsRead([id])
    if (res.success) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
    if (unreadIds.length === 0) return

    const res = await markNotificationsAsRead(unreadIds)
    if (res.success) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    }
  }

  const removeNotification = async (id: string, isRead: boolean) => {
    const res = await deleteNotifications([id])
    if (res.success) {
      if (res.count && res.count > 0) {
        setNotifications(prev => prev.filter(n => n.id !== id))
        if (!isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
        toast.success("Notification deleted.")
      } else {
        toast.error("Failed to delete from database. Resetting UI...")
        // Re-fetch to sync if count was 0
        fetchNotifications()
      }
    } else {
      toast.error(res.error || "Failed to delete.")
    }
  }

  const clearAllNotifications = async () => {
    const res = await serverClearAll()
    if (res.success) {
      if (res.count && res.count > 0) {
        toast.success(`Cleared ${res.count} notifications.`)
        setNotifications([])
        setUnreadCount(0)
      } else {
        toast.error("Failed to clear from database. No records deleted.")
        fetchNotifications()
      }
    } else {
      toast.error(res.error || "Failed to clear notifications.")
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400"><Check className="w-3.5 h-3.5" /></div>
      case 'warning': return <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400"><AlertTriangle className="w-3.5 h-3.5" /></div>
      case 'security': return <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400"><ShieldCheck className="w-3.5 h-3.5" /></div>
      default: return <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400"><Info className="w-3.5 h-3.5" /></div>
    }
  }

  if (!mounted) return null

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        style={{ left: '17px', backgroundColor: '#11111383' }}
        className="relative p-2.5 rounded-full border border-white/5 hover:bg-[#5e3293] transition-all group shadow-inner"
      >
        <svg 
          viewBox="0 0 448 512" 
          className={cn(
            "w-4 h-4 fill-zinc-400 group-hover:fill-white transition-colors group-hover:animate-bell-ring",
            isOpen && "fill-white",
            animateBell && "animate-bell-ring"
          )}
        >
          <path d="M224 0c-17.7 0-32 14.3-32 32V49.9C119.5 61.4 64 124.2 64 200v33.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377c-5.8 7.2-6.9 17.1-2.9 25.4S14.8 416 24 416H424c9.2 0 17.6-5.3 21.6-13.6s2.9-18.2-2.9-25.4l-14.9-18.6C399.5 322.9 384 278.8 384 233.4V200c0-75.8-55.5-138.6-128-150.1V32c0-17.7-14.3-32-32-32zm0 96h8c57.4 0 104 46.6 104 104v33.4c0 47.9 13.9 94.6 39.7 134.6H72.3C98.1 328 112 281.3 112 233.4V200c0-57.4 46.6-104 104-104h8zm64 352H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z"></path>
        </svg>
        
        {/* Animated Expanding Ripple */}
        <AnimatePresence>
          {showPulse && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-purple-500/40 rounded-full"
            />
          )}
        </AnimatePresence>

        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full border-2 border-zinc-900 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
        )}
      </motion.button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 w-80 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">Activity Center</h3>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] text-purple-400 hover:text-purple-300 font-bold transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button 
                    onClick={clearAllNotifications}
                    className="text-[10px] text-red-500 hover:text-red-400 font-bold transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
              {notifications.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={cn(
                        "p-4 transition-all hover:bg-white/[0.02] group flex gap-3",
                        !n.is_read && "bg-purple-500/[0.03]"
                      )}
                    >
                      <div className="shrink-0 pt-0.5">
                        {getTypeIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn("text-xs font-bold text-zinc-200 truncate", !n.is_read && "text-white")}>
                            {n.title}
                          </p>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {!n.is_read && (
                              <button 
                                onClick={() => markAsRead(n.id)}
                                className="w-1.5 h-1.5 bg-purple-500 rounded-full"
                                title="Mark as read"
                              />
                            )}
                            <button 
                              onClick={() => removeNotification(n.id, n.is_read)}
                              className="p-1 rounded hover:bg-white/5 text-zinc-600 hover:text-red-500 transition-colors"
                              title="Delete notification"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-relaxed font-outfit line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[9px] text-zinc-600 font-mono" suppressHydrationWarning>
                          {timeAgo(new Date(n.created_at))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 flex flex-col items-center justify-center text-center opacity-40">
                  <BellOff className="w-10 h-10 text-zinc-600 mb-3" />
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">No activity found</p>
                  <p className="text-[10px] text-zinc-600 mt-1">We'll alert you when there's an update.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-zinc-900/30 border-t border-white/5 flex items-center justify-between">
              <Link
                href="/dashboard/notifications"
                onClick={() => setIsOpen(false)}
                className="text-[10px] text-purple-400 hover:text-purple-300 uppercase font-bold tracking-widest transition-colors flex items-center gap-1.5 ml-2"
              >
                View History
              </Link>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 uppercase font-bold tracking-widest transition-colors flex items-center gap-1.5 mr-2"
              >
                Close <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
