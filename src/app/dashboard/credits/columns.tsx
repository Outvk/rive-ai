"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteTransactions } from "./actions"
import { toast } from "sonner"

export type Transaction = {
    id: string
    amount: number
    type: "addition" | "deduction"
    description: string
    created_at: string
}

export const columns: ColumnDef<Transaction>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "type",
        header: "Status",
        cell: ({ row }) => {
            const type = row.getValue("type") as string
            return (
                <div className="flex items-center gap-2">
                    {type === "addition" ? (
                        <ArrowUpCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                        <ArrowDownCircle className="w-4 h-4 text-zinc-500" />
                    )}
                    <span className={`capitalize ${type === "addition" ? "text-emerald-400" : "text-zinc-400"}`}>
                        {type}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "description",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    className="p-0 hover:bg-transparent text-zinc-400 hover:text-white"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Description
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="max-w-[300px] truncate font-medium">{row.getValue("description")}</div>,
    },
    {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ row }) => {
            const date = new Date(row.getValue("created_at"))
            return (
                <div className="text-zinc-500 text-xs">
                    {date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </div>
            )
        },
    },
    {
        accessorKey: "amount",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"))
            const type = row.original.type
            return (
                <div className={`text-right font-bold ${type === "addition" ? "text-emerald-400" : "text-white"}`}>
                    {type === "addition" ? "+" : "-"}{amount}
                </div>
            )
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const transaction = row.original

            const handleDelete = async () => {
                const res = await deleteTransactions([transaction.id])
                if (res.success) {
                    toast.success("Transaction deleted")
                } else {
                    toast.error("Failed to delete")
                }
            }

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(transaction.id)}
                            className="cursor-pointer"
                        >
                            Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/5" />
                        <DropdownMenuItem
                            onClick={handleDelete}
                            className="text-red-400 focus:text-red-400 cursor-pointer"
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
