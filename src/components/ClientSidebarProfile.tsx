'use client'

import { ExitIcon } from '@radix-ui/react-icons'
import { logoutAction } from '@/app/dashboard/actions'

export function ClientSidebarProfile({
    email,
    fullName,
}: {
    email: string,
    fullName: string,
}) {
    return (
        <div className="p-4 border-t border-white/5 bg-black/20">
            {/* User Info */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-zinc-300">
                        {email.charAt(0).toUpperCase()}
                    </span>
                </div>
                <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium text-zinc-200 truncate">
                        {fullName}
                    </span>
                    <span className="text-xs text-zinc-500 truncate">
                        {email}
                    </span>
                </div>
            </div>

            {/* Logout */}
            <form action={logoutAction} className="w-full">
                <button type="submit" className="flex w-full items-center justify-center gap-2 px-3 py-2 rounded-md hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-all text-xs font-semibold uppercase tracking-wider border border-transparent hover:border-red-500/20">
                    <ExitIcon className="w-3.5 h-3.5" />
                    Sign Out
                </button>
            </form>
        </div>
    )
}
