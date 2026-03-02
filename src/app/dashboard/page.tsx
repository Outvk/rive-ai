import { TextIcon, ImageIcon, TextAlignJustifyIcon, ArrowRightIcon } from '@radix-ui/react-icons'

export default async function DashboardPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-8 fade-in">
            <div>
                <h1 className="text-2xl font-semibold text-zinc-100 mb-1">Welcome back.</h1>
                <p className="text-sm text-zinc-400">Select a tool below to start generating content.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                {/* Card 1 */}
                <div className="group relative bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-zinc-800/50 transition-all duration-300 shadow-xl overflow-hidden flex flex-col justify-between h-[200px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div>
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                            <TextIcon className="w-5 h-5" />
                        </div>
                        <h3 className="font-medium text-base text-zinc-100 mb-1.5">Text Generator</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Craft custom prompts and let the AI write tailored content for you.
                        </p>
                    </div>

                    <div className="flex items-center text-sm font-medium text-indigo-400 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        Open tool <ArrowRightIcon className="ml-1 w-4 h-4" />
                    </div>
                </div>

                {/* Card 2 */}
                <div className="group relative bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-zinc-800/50 transition-all duration-300 shadow-xl overflow-hidden flex flex-col justify-between h-[200px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div>
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 text-purple-400 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
                            <ImageIcon className="w-5 h-5" />
                        </div>
                        <h3 className="font-medium text-base text-zinc-100 mb-1.5">Image to Prompt</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Upload an image and extract a highly detailed prompt definition.
                        </p>
                    </div>

                    <div className="flex items-center text-sm font-medium text-purple-400 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        Open tool <ArrowRightIcon className="ml-1 w-4 h-4" />
                    </div>
                </div>

                {/* Card 3 */}
                <div className="group relative bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-zinc-800/50 transition-all duration-300 shadow-xl overflow-hidden flex flex-col justify-between h-[200px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div>
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                            <TextAlignJustifyIcon className="w-5 h-5" />
                        </div>
                        <h3 className="font-medium text-base text-zinc-100 mb-1.5">Brief Summarizer</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Paste long content to get concise, easily readable summaries.
                        </p>
                    </div>

                    <div className="flex items-center text-sm font-medium text-emerald-400 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        Open tool <ArrowRightIcon className="ml-1 w-4 h-4" />
                    </div>
                </div>

            </div>
        </div>
    )
}
