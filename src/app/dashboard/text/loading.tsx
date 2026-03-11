import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="relative w-full h-full overflow-hidden flex flex-row bg-black -m-10 min-h-[calc(100vh-4rem)]">
            {/* Main Chat Area */}
            <div className="relative flex-1 h-full flex flex-col items-center">
                {/* Messages Area */}
                <div className="w-full max-w-3xl mx-auto flex flex-col px-4 pt-10 pb-64 space-y-10">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className={`flex w-full gap-5 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse text-right"}`}>
                            <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                            <div className={`flex-1 space-y-3 pt-1 ${i % 2 === 0 ? "" : "flex flex-col items-end"}`}>
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-4 w-[85%]" />
                                <Skeleton className="h-4 w-[60%]" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Fixed Input Bottom Section */}
                <div className="absolute bottom-0 inset-x-0 w-full flex flex-col items-center p-10 pt-0">
                    <div className="w-full max-w-3xl space-y-6">
                        <div className="relative bg-white/5 rounded-2xl border border-white/10 h-32 p-4 flex flex-col justify-between">
                            <Skeleton className="h-5 w-1/2" />
                            <div className="flex justify-between items-center border-t border-white/5 pt-4">
                                <div className="flex gap-4">
                                    <Skeleton className="h-8 w-8 rounded-lg" />
                                    <Skeleton className="h-4 w-20 self-center" />
                                </div>
                                <Skeleton className="h-9 w-24 rounded-xl" />
                            </div>
                        </div>

                        <div className="flex justify-center gap-2 flex-wrap">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-8 w-28 rounded-full" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
