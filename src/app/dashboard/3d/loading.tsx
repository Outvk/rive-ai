import { CubeIcon } from "@radix-ui/react-icons";

export default function Loading() {
    return (
        <div className="max-w-4xl mx-auto space-y-6 fade-in h-full flex flex-col">
            <div>
                <h1 className="text-2xl font-semibold text-zinc-100 mb-1 flex items-center gap-2">
                    <CubeIcon className="w-6 h-6 text-pink-500 animate-pulse" />
                    3D Generator
                </h1>
                <div className="h-4 w-64 bg-zinc-800/50 rounded animate-pulse" />
            </div>

            <div className="flex-1 min-h-[500px] border border-zinc-800/80 bg-black/50 rounded-2xl animate-pulse" />
        </div>
    )
}
