import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ClockIcon, ArrowUpIcon, ArrowDownIcon } from '@radix-ui/react-icons'

export default async function TransactionsPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch transactions for the current user, ordered by most recent first
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="max-w-4xl mx-auto space-y-8 fade-in">
            <div>
                <h1 className="text-2xl font-semibold text-zinc-100 mb-1 flex items-center gap-2">
                    <ClockIcon className="w-6 h-6 text-indigo-400" />
                    Transactions History
                </h1>
                <p className="text-sm text-zinc-400">View a log of all credits added and deducted from your account.</p>
            </div>

            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                {transactions && transactions.length > 0 ? (
                    <div className="divide-y divide-white/5">
                        {transactions.map((tx: any) => (
                            <div key={tx.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === 'addition' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-400 border border-white/10'
                                        }`}>
                                        {tx.type === 'addition' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-200">{tx.description}</p>
                                        <p className="text-xs text-zinc-500 mt-1">
                                            {new Date(tx.created_at).toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0 ml-4">
                                    <span className={`text-sm font-bold ${tx.type === 'addition' ? 'text-emerald-400' : 'text-zinc-300'}`}>
                                        {tx.type === 'addition' ? '+' : '-'}{tx.amount}
                                    </span>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Credits</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <ClockIcon className="w-8 h-8 text-zinc-600" />
                        </div>
                        <p className="text-zinc-200 font-medium">No transactions yet</p>
                        <p className="text-zinc-500 text-sm mt-1">Once you use AI tools or buy credits, they will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
