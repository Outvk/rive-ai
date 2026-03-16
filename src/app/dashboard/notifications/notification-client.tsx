'use client'

import React, { useState, useMemo } from 'react'
import { 
    Check, 
    Trash2, 
    Search, 
    Filter, 
    MoreHorizontal, 
    CheckCircle2, 
    Info, 
    AlertTriangle, 
    ShieldCheck, 
    CheckSquare, 
    Square,
    Eye,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Bell
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { deleteNotifications, markNotificationsAsRead, clearAllNotifications } from './actions'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'security'
  is_read: boolean
  created_at: string
}

export function NotificationClient({ initialData, userId }: { initialData: Notification[], userId: string }) {
    const [data, setData] = useState<Notification[]>(initialData)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<string>('all')
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [currentPage, setCurrentPage] = useState(1)
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const itemsPerPage = 10

    const filterOptions = [
        { value: 'all', label: 'All Types', icon: <Bell className="w-3.5 h-3.5" /> },
        { value: 'success', label: 'Updates', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> },
        { value: 'security', label: 'Security', icon: <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> },
        { value: 'info', label: 'System', icon: <Info className="w-3.5 h-3.5 text-blue-400" /> },
        { value: 'warning', label: 'Warnings', icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> },
    ]

    // Filtering & Searching
    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchesSearch = 
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.message.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesFilter = filterType === 'all' || item.type === filterType
            return matchesSearch && matchesFilter
        })
    }, [data, searchQuery, filterType])

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const toggleSelectAll = () => {
        if (selectedIds.size === paginatedData.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(paginatedData.map(i => i.id)))
        }
    }

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        setSelectedIds(next)
    }

    const handleDeleteSelected = async () => {
        const ids = Array.from(selectedIds)
        const res = await deleteNotifications(ids)
        if (res.success) {
            if (res.count && res.count > 0) {
                setData(prev => prev.filter(item => !selectedIds.has(item.id)))
                setSelectedIds(new Set())
                toast.success(`Deleted ${res.count} notifications`)
            } else {
                toast.error('Failed to delete from database. Resetting UI...')
                window.location.reload()
            }
        } else {
            toast.error(res.error || 'Failed to delete')
        }
    }

    const handleMarkAsReadSelected = async () => {
        const ids = Array.from(selectedIds)
        const res = await markNotificationsAsRead(ids)
        if (res.success) {
            setData(prev => prev.map(item => 
                selectedIds.has(item.id) ? { ...item, is_read: true } : item
            ))
            setSelectedIds(new Set())
            toast.success(`Marked ${ids.length} as read`)
        } else {
            toast.error(res.error || 'Failed to mark as read')
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400" />
            case 'security': return <ShieldCheck className="w-4 h-4 text-indigo-400" />
            default: return <Info className="w-4 h-4 text-blue-400" />
        }
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-950/40 p-4 rounded-2xl border border-white/5 backdrop-blur-md relative z-20">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search alerts..."
                            className="w-full bg-zinc-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center gap-2 bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all min-w-[140px] justify-between group"
                        >
                            <span className="flex items-center gap-2">
                                {filterOptions.find(o => o.value === filterType)?.icon}
                                {filterOptions.find(o => o.value === filterType)?.label}
                            </span>
                            <ChevronDown className={cn("w-3.5 h-3.5 text-zinc-500 transition-transform duration-200", isFilterOpen && "rotate-180")} />
                        </button>

                        {isFilterOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                                <div className="absolute top-full left-0 mt-2 w-48 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-left">
                                    {filterOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => {
                                                setFilterType(opt.value)
                                                setIsFilterOpen(false)
                                            }}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-2 text-xs font-medium transition-colors hover:bg-white/5",
                                                filterType === opt.value ? "text-violet-400 bg-violet-400/5" : "text-zinc-400 hover:text-white"
                                            )}
                                        >
                                            <span className="shrink-0">{opt.icon}</span>
                                            {opt.label}
                                            {filterType === opt.value && <Check className="w-3 h-3 ml-auto text-violet-400" />}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {selectedIds.size > 0 ? (
                        <>
                            <button
                                onClick={handleMarkAsReadSelected}
                                className="flex items-center gap-2 px-4 py-2 bg-violet-600/10 text-violet-400 hover:bg-violet-600/20 rounded-xl text-xs font-bold transition-all border border-violet-500/20 whitespace-nowrap"
                            >
                                <Eye className="w-3.5 h-3.5" /> Mark Read
                            </button>
                            <button
                                onClick={handleDeleteSelected}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600/10 text-red-500 hover:bg-red-600/20 rounded-xl text-xs font-bold transition-all border border-red-500/20 whitespace-nowrap"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                            <div className="w-[1px] h-6 bg-white/10 mx-2" />
                            <button
                                onClick={() => setSelectedIds(new Set())}
                                className="text-xs text-zinc-500 hover:text-white uppercase font-bold tracking-widest px-2 transition-colors whitespace-nowrap"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={async () => {
                                const res = await clearAllNotifications()
                                if (res.success) {
                                    setData([])
                                    toast.success('Activity history cleared')
                                } else {
                                    toast.error(res.error)
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition-all border border-white/5 whitespace-nowrap"
                        >
                            Clear History
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-zinc-950/40 rounded-2xl border border-white/5 overflow-hidden backdrop-blur-md">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/[0.02] border-b border-white/5">
                            <th className="p-4 w-12 text-center">
                                <button onClick={toggleSelectAll} className="p-1 rounded bg-zinc-900 border border-white/10 hover:border-violet-500/50 transition-colors">
                                    {selectedIds.size === paginatedData.length && paginatedData.length > 0 ? (
                                        <CheckSquare className="w-4 h-4 text-violet-400" />
                                    ) : (
                                        <Square className="w-4 h-4 text-zinc-600" />
                                    )}
                                </button>
                            </th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Notification</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Category</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Date</th>
                            <th className="p-4 w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {paginatedData.length > 0 ? (
                            paginatedData.map((notif) => (
                                <tr 
                                    key={notif.id} 
                                    className={cn(
                                        "transition-colors hover:bg-white/[0.01] group cursor-default",
                                        !notif.is_read && "bg-violet-500/[0.02]"
                                    )}
                                >
                                    <td className="p-4 text-center">
                                        <button 
                                            onClick={() => toggleSelect(notif.id)} 
                                            className={cn(
                                                "p-1 rounded bg-zinc-900 border transition-colors",
                                                selectedIds.has(notif.id) ? "border-violet-500/50" : "border-white/10 hover:border-white/20"
                                            )}
                                        >
                                            {selectedIds.has(notif.id) ? (
                                                <CheckSquare className="w-4 h-4 text-violet-400" />
                                            ) : (
                                                <Square className="w-4 h-4 text-zinc-700" />
                                            )}
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        {!notif.is_read && (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-500/10 text-[10px] font-bold text-violet-400 uppercase border border-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.1)]">
                                                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
                                                New
                                            </span>
                                        )}
                                        {notif.is_read && (
                                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-2">Read</span>
                                        )}
                                    </td>
                                    <td className="p-4 max-w-md">
                                        <div className="space-y-0.5">
                                            <p className={cn("text-sm font-semibold text-zinc-200", !notif.is_read && "text-white")}>
                                                {notif.title}
                                            </p>
                                            <p className="text-xs text-zinc-500 line-clamp-1 group-hover:line-clamp-none transition-all">
                                                {notif.message}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {getTypeIcon(notif.type)}
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{notif.type}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-[11px] font-mono text-zinc-500">
                                        {format(new Date(notif.created_at), 'MMM dd, HH:mm')}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={async () => {
                                                const res = await deleteNotifications([notif.id])
                                                if (res.success) {
                                                    if (res.count && res.count > 0) {
                                                        setData(prev => prev.filter(i => i.id !== notif.id))
                                                        toast.success('Deleted successfully')
                                                    } else {
                                                        toast.error('Failed to delete from database.')
                                                        window.location.reload()
                                                    }
                                                }
                                            }}
                                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="p-20 text-center">
                                    <div className="flex flex-col items-center justify-center opacity-40">
                                        <Search className="w-10 h-10 text-zinc-700 mb-3" />
                                        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">No activity history</p>
                                        <p className="text-xs text-zinc-600 mt-1">Try adjusting your search or filters.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-2">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} records
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className="p-2 rounded-xl bg-zinc-900 border border-white/5 text-zinc-500 hover:text-white disabled:opacity-30 transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-bold text-zinc-400 px-2">{currentPage} / {totalPages}</span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className="p-2 rounded-xl bg-zinc-900 border border-white/5 text-zinc-500 hover:text-white disabled:opacity-30 transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
