import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ClockIcon } from '@radix-ui/react-icons'
import { TransactionClient } from './transaction-client'

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
        <div className="max-w-6xl mx-auto space-y-8 fade-in pb-20">
            <div>
                <h1 className="text-2xl font-semibold text-zinc-100 mb-1 flex items-center gap-2">
                    <ClockIcon className="w-6 h-6 text-indigo-400" />
                    Transactions History
                </h1>
                <p className="text-sm text-zinc-400">Manage and audit your credit transactions with advanced filtering and batch actions.</p>
            </div>

            <TransactionClient data={transactions || []} />
        </div>
    )
}
