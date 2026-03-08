"use client"

import { DataTable } from "./data-table"
import { columns, Transaction } from "./columns"
import { deleteTransactions } from "./actions"
import { toast } from "sonner"

interface TransactionClientProps {
    data: Transaction[]
}

export function TransactionClient({ data }: TransactionClientProps) {
    const handleDeleteBatch = async (ids: string[]) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete ${ids.length} transactions?`)
        if (!confirmDelete) return

        const res = await deleteTransactions(ids)
        if (res.success) {
            toast.success(`${ids.length} transactions deleted successfully`)
        } else {
            toast.error("An error occurred while deleting transactions")
        }
    }

    return (
        <DataTable
            columns={columns}
            data={data}
            onDeleteBatch={handleDeleteBatch}
        />
    )
}
