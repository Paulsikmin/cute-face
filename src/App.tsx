/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, ChangeEvent } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  Download, 
  RefreshCw, 
  AlertCircle,
  ArrowRight,
  Smile,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResultImage(null);
      setError(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const generateCuteCharacter = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const base64Data = await fileToBase64(selectedFile);
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: selectedFile.type,
              },
            },
            {
              text: 'Transform the subject of this photo into an adorable, high-quality 3D character in the style of a modern animated movie (like Disney/Pixar). Give them large expressive eyes, glowing soft skin, and vibrant colors. Maintain the hair color and general features of the person but make it a stylized 3D render. Background should be simple and clean.',
            },
          ],
        },
      });

      // Find the image part in response
      let foundImage = false;
      const candidates = (response as any).candidates;
      if (candidates && candidates.length > 0) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData) {
            const imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            setResultImage(imageUrl);
            foundImage = true;
            break;
          }
        }
      }

      if (!foundImage) {
        throw new Error('Failed to generate image. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResultImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2D2D] font-sans selection:bg-[#FFD6E0] relative overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-100px] right-[-50px] w-[400px] h-[400px] bg-[#FFD6E0] rounded-full blur-[100px] opacity-40 animate-pulse" />
        <div className="absolute bottom-[-50px] left-[-50px] w-[350px] h-[350px] bg-[#D6EFFF] rounded-full blur-[100px] opacity-50" />
      </div>

      {/* Navigation / Logo Area */}
      <nav className="relative z-10 flex justify-between items-center px-6 md:px-12 py-8">
        <div className="text-2xl font-black tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF6B6B] rounded-lg rotate-12 flex items-center justify-center text-white text-sm">3</div>
          <span className="hidden sm:inline">MORPH.AI</span>
        </div>
        <div className="flex items-center gap-4 md:gap-8 font-bold text-xs uppercase tracking-widest">
          <span className="hidden md:block text-[#2D2D2D]/40">v2.0 Beta</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
            <span className="text-gray-400">AI ENGINE READY</span>
          </div>
        </div>
      </nav>

      <header className="relative z-10 py-12 px-6 md:px-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-6">
            Turn Photos <br/>
            <span className="text-[#FF6B6B]">into 3D</span> <br/>
            Cuties.
          </h1>
          <p className="text-lg text-gray-500 max-w-sm leading-relaxed mb-8">
            Upload any portrait and watch our AI sculpt a lovable 3D character in seconds. No modeling skills required. ✨
          </p>
        </motion.div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Upload Section */}
          <motion.div 
            className="lg:col-span-5 flex flex-col gap-8"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div 
              className={`
                relative aspect-square rounded-[40px] border-2 border-[#2D2D2D] transition-all duration-300 overflow-hidden shadow-[8px_8px_0px_0px_#2D2D2D] hover:shadow-none hover:translate-x-1 hover:translate-y-1 rotate-[-2deg]
                ${previewUrl ? 'bg-white' : 'bg-white/80'}
              `}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  const input = fileInputRef.current;
                  if (input) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    input.files = dataTransfer.files;
                    handleFileChange({ target: { files: input.files } } as any);
                  }
                }
              }}
            >
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              
              {previewUrl ? (
                <div className="w-full h-full relative group">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-[#2D2D2D]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-white border-2 border-[#2D2D2D] font-bold rounded-xl shadow-[4px_4px_0px_0px_#2D2D2D] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                    >
                      Change Image
                    </button>
                  </div>
                  <div className="absolute top-6 left-6 bg-yellow-400 border-2 border-[#2D2D2D] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                    Original Frame
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full flex flex-col items-center justify-center gap-6 p-12 text-center group"
                >
                  <div className="w-20 h-20 bg-[#FFD6E0] border-2 border-[#2D2D2D] rounded-2xl flex items-center justify-center rotate-12 transition-transform group-hover:rotate-0 duration-500 shadow-[4px_4px_0px_0px_#2D2D2D]">
                    <Upload className="w-10 h-10 text-[#2D2D2D]" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-[#2D2D2D]">Drop Image Here</p>
                    <p className="text-sm text-gray-400 mt-2 font-medium">JPG, PNG or WEBP (Max 5MB)</p>
                  </div>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                disabled={!selectedFile || isProcessing}
                onClick={generateCuteCharacter}
                className={`
                  flex-1 py-5 px-10 rounded-2xl font-black text-xl shadow-[8px_8px_0px_0px_#2D2D2D] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-3 border-2 border-[#2D2D2D]
                  ${!selectedFile || isProcessing 
                    ? 'bg-gray-200 text-gray-400 shadow-none translate-x-1 translate-y-1 cursor-not-allowed' 
                    : 'bg-[#FF6B6B] text-white'
                  }
                `}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    Transforming...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    Sculpt 3D Character
                  </>
                )}
              </button>
              {selectedFile && !isProcessing && (
                <button
                  onClick={reset}
                  className="py-5 px-8 rounded-2xl bg-white border-2 border-[#2D2D2D] font-bold text-[#2D2D2D] shadow-[4px_4px_0px_0px_#2D2D2D] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  Reset
                </button>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-100 border-2 border-[#2D2D2D] rounded-2xl flex items-start gap-4 text-[#2D2D2D] font-bold shadow-[4px_4px_0px_0px_#2D2D2D]">
                <AlertCircle className="w-6 h-6 shrink-0 text-red-600" />
                <p>{error}</p>
              </div>
            )}
          </motion.div>

          {/* Result Section */}
          <motion.div 
            className="lg:col-span-7 relative flex flex-col gap-8 lg:pl-12"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="relative aspect-square w-full max-w-[540px] mx-auto bg-white border-2 border-[#2D2D2D] rounded-[40px] shadow-[16px_16px_0px_0px_#2D2D2D] overflow-hidden rotate-1 mt-6">
              <AnimatePresence mode="wait">
                {isProcessing ? (
                  <motion.div 
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-[#FDFCFB]/90 z-20"
                  >
                    <div className="relative mb-12">
                       <motion.div 
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 90, 180, 270, 360]
                        }}
                        transition={{ 
                          repeat: Infinity,
                          duration: 4,
                          ease: "linear"
                        }}
                        className="w-32 h-32 border-[12px] border-t-[#FF6B6B] border-r-[#70D6FF] border-b-[#BDB2FF] border-l-[#FFD1BA] rounded-full"
                      />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#2D2D2D] rounded-xl flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <p className="text-3xl font-black tracking-tighter uppercase mb-2">Sculpting Magic</p>
                    <div className="flex gap-1">
                      {[1, 2, 3].map(i => (
                        <motion.div 
                          key={i}
                          animate={{ y: [0, -10, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.2 }}
                          className="w-2 h-2 bg-[#2D2D2D] rounded-full"
                        />
                      ))}
                    </div>
                  </motion.div>
                ) : resultImage ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full h-full relative"
                  >
                    <img src={resultImage} alt="Generated 3D Character" className="w-full h-full object-cover" />
                    
                    {/* Floating Original Preview from Design */}
                    {previewUrl && (
                      <div className="absolute top-4 right-4 w-24 h-24 bg-white p-1 rounded-xl border-2 border-[#2D2D2D] shadow-lg rotate-[-12deg] z-10 overflow-hidden hidden sm:block">
                        <img src={previewUrl} className="w-full h-full object-cover rounded-lg" alt="Original" />
                        <div className="absolute -top-1 -left-1 bg-yellow-400 border border-[#2D2D2D] text-[8px] font-black px-1.5 py-0.5 whitespace-nowrap">ORIGINAL</div>
                      </div>
                    )}

                    <div className="absolute top-8 left-8 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border-2 border-[#2D2D2D] text-xs font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_#2D2D2D]">
                      RESULT #{Math.floor(Math.random() * 9000) + 1000}
                    </div>
                    <div className="absolute bottom-8 right-8 bg-[#2D2D2D] text-white p-4 rounded-2xl rotate-[-5deg] text-base font-black shadow-xl">
                       <Heart className="w-6 h-6 inline-block mr-2 text-[#FF6B6B] fill-[#FF6B6B]" />
                       Stylized v2.0
                    </div>
                  </motion.div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-12 text-center bg-[#E0F2F1]/30">
                    <div className="w-40 h-40 bg-white border-2 border-[#2D2D2D] rounded-[40px] flex items-center justify-center shadow-[8px_8px_0px_0px_#2D2D2D] rotate-2">
                      <ImageIcon className="w-16 h-16 text-gray-300" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-[#2D2D2D] tracking-tight">Your 3D Avatar Area</p>
                      <p className="text-gray-400 mt-2 font-medium max-w-[240px] mx-auto">Upload an image and hit the button to see your 3D transformation here.</p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Feature Labels for result area */}
            {!isProcessing && !resultImage && (
              <div className="absolute -bottom-8 left-0 lg:left-12 flex flex-col gap-3 z-30 pointer-events-none">
                <div className="bg-[#70D6FF] border-2 border-[#2D2D2D] px-5 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_#2D2D2D] w-fit">
                  Subsurface Scattering
                </div>
                <div className="bg-[#BDB2FF] border-2 border-[#2D2D2D] px-5 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_#2D2D2D] w-fit -rotate-2">
                  Auto-Stylized Features
                </div>
              </div>
            )}

            {resultImage && !isProcessing && (
              <div className="mt-8">
                <a
                  href={resultImage}
                  download="cute-3d-character.png"
                  className="w-full py-5 px-10 bg-[#70D6FF] border-2 border-[#2D2D2D] rounded-2xl font-black text-xl text-[#2D2D2D] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-3 shadow-[8px_8px_0px_0px_#2D2D2D]"
                >
                  <Download className="w-6 h-6" />
                  Save Character
                </a>
              </div>
            )}
          </motion.div>
        </div>

        {/* Info Grid */}
        <section className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { tag: "01", title: "Upload", color: "#FFD6E0", desc: "Select a clear portrait photo from your device." },
            { tag: "02", title: "Analyze", color: "#D6EFFF", desc: "Our AI maps your features to a 3D character mesh." },
            { tag: "03", title: "Morph", color: "#BDB2FF", desc: "Get your high-quality 3D rendered avatar in seconds." }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl border-2 border-[#2D2D2D] shadow-[8px_8px_0px_0px_#2D2D2D] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              <div 
                className="w-12 h-12 border-2 border-[#2D2D2D] rounded-xl flex items-center justify-center font-black text-sm mb-6 shadow-[4px_4px_0px_0px_#2D2D2D]"
                style={{ backgroundColor: item.color }}
              >
                {item.tag}
              </div>
              <h3 className="text-2xl font-black mb-3">{item.title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="relative z-10 py-10 px-6 md:px-12 border-t border-[#2D2D2D]/10 flex flex-col md:flex-row justify-between items-center gap-8 bg-white/50 backdrop-blur-sm">
        <div className="flex gap-8 text-[11px] font-black text-gray-400 uppercase tracking-widest">
          <div>LATENCY: 1.2s</div>
          <div>POWERED BY GEMINI 2.5</div>
          <div>EST. CREATIONS: 1.2M+</div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-[#2D2D2D] bg-gray-200" />
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-[#2D2D2D] bg-[#2D2D2D] text-white text-[10px] flex items-center justify-center font-bold">+24k</div>
          </div>
          <p className="font-black text-xs uppercase">Join the Morph.ai community</p>
        </div>
      </footer>
    </div>
  );

}
