import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="space-y-8 min-h-full">
            <div className="flex items-center justify-between space-y-2">
                <div className="space-y-1">
                    <Skeleton className="h-8 w-[250px]" />
                    <Skeleton className="h-4 w-[400px]" />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-xl border border-white/5 bg-white/5 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </div>
                        <Skeleton className="h-8 w-[120px]" />
                        <Skeleton className="h-3 w-[180px]" />
                    </div>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border border-white/5 bg-white/5 p-6 space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-[140px]" />
                        <Skeleton className="h-4 w-[280px]" />
                    </div>
                    <Skeleton className="h-[300px] w-full" />
                </div>

                <div className="col-span-3 rounded-xl border border-white/5 bg-white/5 p-6 space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-[140px]" />
                        <Skeleton className="h-4 w-[220px]" />
                    </div>
                    <div className="space-y-4 pt-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-[60%]" />
                                    <Skeleton className="h-3 w-[40%]" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
