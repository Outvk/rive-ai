'use client'

import { useState } from 'react'
import { UpdateIcon, UploadIcon, DownloadIcon } from '@radix-ui/react-icons'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function EnhanceForm({ 
  initialCredits = 0,
  initialHistory = [] 
}: { 
  initialCredits?: number,
  initialHistory?: any[]
}) {
  const [activeTab, setActiveTab] = useState<'remove-background' | 'ai-backgrounds' | 'text-removal'>('remove-background');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [textMode, setTextMode] = useState<'ai.all' | 'ai.artificial' | 'ai.natural'>('ai.all');
  const [isLoading, setIsLoading] = useState(false);
  const [resultBase64, setResultBase64] = useState<string | null>(null);
  const [currentCredits, setCurrentCredits] = useState(initialCredits);
  const [history, setHistory] = useState<any[]>(initialHistory);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResultBase64(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCredits < 10) {
      toast.error('Insufficient credits. Cost is 10 credits.');
      return;
    }
    if (!file) {
      toast.error('Please upload an image first.');
      return;
    }
    if (activeTab === 'ai-backgrounds' && !prompt.trim()) {
      toast.error('Please enter a prompt for the AI background.');
      return;
    }

    setIsLoading(true);
    setResultBase64(null);

    try {
      const formData = new FormData();
      formData.append('action', activeTab);
      formData.append('imageFile', file);
      if (activeTab === 'ai-backgrounds') {
        formData.append('prompt', prompt);
      }
      if (activeTab === 'text-removal') {
        formData.append('textMode', textMode);
      }

      const res = await fetch('/api/enhance', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Enhancement failed');
      }

      if (data.image) {
        setResultBase64(data.image);
        setCurrentCredits(prev => Math.max(0, prev - 10));
        toast.success('Image enhanced successfully!');
        
        try {
            const saveRes = await fetch('/api/history/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: activeTab === 'ai-backgrounds' ? prompt.trim() : `Enhanced via ${activeTab}`,
                    imageUrl: `data:image/png;base64,${data.image}`,
                    settings: { mode: 'enhance', action: activeTab }
                })
            });

            const saveResult = await saveRes.json();

            if (!saveRes.ok) {
                console.error("Enhance Save Error:", saveResult.error);
            } else {
                console.log("Enhance Save Success: Added to ai_images dedicated table.");
                router.refresh();
            }
        } catch (saveErr) {
            console.error("Enhance Critical Save Error:", saveErr);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to enhance image');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadResult = () => {
    if (!resultBase64) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${resultBase64}`;
    link.download = `enhanced-${activeTab}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col min-h-[80vh] w-full max-w-5xl mx-auto relative px-4 sm:px-6">
      
      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 bg-zinc-900/50 p-1 rounded-xl w-fit mx-auto mt-6">
        {[
          { id: 'remove-background', label: 'Background Removal' },
          { id: 'ai-backgrounds', label: 'AI Backgrounds' },
          { id: 'text-removal', label: 'AI Text / Watermark Removal' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === tab.id ? 'bg-zinc-100 text-black shadow-lg scale-105' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10 w-full">
        {/* Left Column: Upload and Form */}
        <div className="flex flex-col space-y-6">
          <div className="bg-zinc-800/30 border border-zinc-700/40 p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] border-dashed hover:bg-zinc-800/60 transition-colors relative cursor-pointer group">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            />
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="max-w-full max-h-[250px] object-contain rounded-lg" />
            ) : (
              <div className="flex flex-col items-center space-y-3 text-zinc-400">
                <UploadIcon className="w-10 h-10 group-hover:-translate-y-2 transition-transform duration-300 text-zinc-500" />
                <p>Click or drag image to upload</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'ai-backgrounds' && (
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the new background (e.g., 'a pair of sneakers on a beach')..."
                className="w-full bg-zinc-800/40 backdrop-blur-xl border border-zinc-700/40 rounded-xl p-4 text-zinc-100 placeholder:zinc-500 resize-none min-h-[100px] focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-all"
              />
            )}

            {activeTab === 'text-removal' && (
              <div className="flex flex-col items-center justify-center p-8 bg-zinc-800/40 backdrop-blur-xl border border-zinc-700/40 rounded-xl space-y-4 text-center">
                 <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full py-1 px-3 text-xs font-bold uppercase tracking-wider text-white inline-block">
                     Coming Soon
                 </div>
                 <h2 className="text-xl font-bold text-white mt-4">AI Text / Watermark Removal</h2>
                 <p className="text-zinc-400 text-sm max-w-sm">
                     We are currently upgrading our AI models to provide you with the best text and watermark removal experience. This feature will be available shortly!
                 </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={isLoading || !file || (activeTab === 'ai-backgrounds' && !prompt.trim()) || activeTab === 'text-removal' || currentCredits < 10}
                className="bg-zinc-100 text-black hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-600 h-12 px-8 rounded-full flex items-center justify-center font-medium shadow-lg transition-all duration-300 active:scale-95"
              >
                {isLoading ? <UpdateIcon className="w-5 h-5 animate-spin" /> : <span>Enhance Image</span>}
              </button>
              <div className="px-4 py-2">
                <span className="text-sm text-zinc-400">Credits: <span className="font-bold text-white">{currentCredits}</span></span>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Result */}
        <div className="bg-zinc-800/20 border border-zinc-700/30 rounded-2xl flex flex-col items-center justify-center min-h-[400px] overflow-hidden relative">
          {isLoading ? (
            <div className="flex flex-col items-center space-y-4 text-zinc-400">
              <UpdateIcon className="w-10 h-10 animate-spin text-zinc-500" />
              <p className="animate-pulse">Processing image with AI...</p>
            </div>
          ) : resultBase64 ? (
            <div className="flex flex-col items-center p-4 h-full justify-center w-full relative group">
               <img 
                  src={`data:image/png;base64,${resultBase64}`} 
                  alt="Enhanced Result" 
                  className="max-w-full max-h-[500px] object-contain rounded-xl shadow-2xl"
               />
               <button 
                  onClick={downloadResult}
                  className="absolute bottom-6 right-6 bg-zinc-900/80 hover:bg-black backdrop-blur-md text-white p-3 rounded-full opacity-0 group-hover:opacity-100 shadow-lg transition-all active:scale-90"
                  title="Download Image"
               >
                 <DownloadIcon className="w-5 h-5" />
               </button>
            </div>
          ) : (
             <div className="text-zinc-600 flex flex-col items-center">
                <p>Enhanced image will appear here</p>
             </div>
          )}
        </div>
      </div>

      {/* History Section */}
      {history.length > 0 && (
        <div className="mt-16 w-full">
          <h2 className="text-2xl font-semibold mb-6 text-zinc-200">Recent Enhancements</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {history.map((item) => (
              <div key={item.id} className="group relative rounded-xl overflow-hidden bg-zinc-800/50 border border-zinc-700/50 aspect-square">
                <img 
                  src={item.url} 
                  alt={item.prompt} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                  <span className="text-xs text-zinc-300 line-clamp-2">{item.prompt}</span>
                  <button 
                    onClick={() => {
                        const link = document.createElement('a');
                        link.href = item.url;
                        link.download = `enhanced-${item.id}.png`;
                        link.target = "_blank";
                        link.click();
                    }}
                    className="bg-white/20 hover:bg-white/40 backdrop-blur-md text-white py-1.5 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <DownloadIcon className="w-4 h-4" /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
