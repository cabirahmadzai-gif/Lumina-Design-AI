import React, { useState, useEffect, useCallback } from 'react';
import { Upload, AlertCircle, Save, FolderHeart, X, Trash2, ExternalLink, Gem, Sparkles, Scale, Search, ShieldCheck, Droplets, Palette, DollarSign, Activity, Image as ImageIcon, Fingerprint, Hammer, Eye, Target, Layers } from 'lucide-react';
import { analyzeItem, sendChatMessage } from './services/geminiService';
import { AppState, ChatMessage, MessageRole, SavedAnalysis, AnalysisResult, AnalysisMode, GemstoneAnalysis, AntiqueAnalysis, CoinAnalysis } from './types';
import { GEMSTONE_TYPES, ANTIQUE_TYPES, COIN_TYPES, INITIAL_CHAT_MESSAGE } from './constants';
import ChatInterface from './components/ChatInterface';

// Extend Window interface for AI Studio helpers
declare global {
  interface AIStudio {
    hasSelectedApiKey(): Promise<boolean>;
    openSelectKey(): Promise<void>;
  }
}

const App: React.FC = () => {
  // --- Access State ---
  const [hasAccess, setHasAccess] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(false);

  // --- App State ---
  const [state, setState] = useState<AppState>({
    originalImage: null,
    analysisResult: null,
    isAnalyzing: false,
    activeItemType: null,
    mode: AnalysisMode.GEMSTONE,
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: MessageRole.MODEL,
      text: INITIAL_CHAT_MESSAGE,
      timestamp: Date.now(),
    },
  ]);
  const [isChatTyping, setIsChatTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Saved Designs State ---
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSavedList, setShowSavedList] = useState(false);
  const [analysisName, setAnalysisName] = useState('');

  // Load saved designs on mount
  useEffect(() => {
    const saved = localStorage.getItem('gemstone_saved_analyses');
    if (saved) {
      try {
        setSavedAnalyses(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved analyses", e);
      }
    }
  }, []);

  // --- Handlers ---

  // Handle Image Upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setState((prev) => ({
          ...prev,
          originalImage: reader.result as string,
          analysisResult: null,
          activeItemType: null,
        }));
        setError(null);
        
        // Add a system message to chat
        const newMsg: ChatMessage = {
            id: Date.now().toString(),
            role: MessageRole.MODEL,
            text: "عکس دریافت شد! می‌توانید نوع مورد نظر را از لیست بالا انتخاب کنید تا به تشخیص بهتر کمک کند، یا مستقیماً روی دکمه «تحلیل تصویر» کلیک کنید.",
            timestamp: Date.now()
        };
        setChatHistory(prev => [...prev, newMsg]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!state.originalImage) return;

    setState((prev) => ({ ...prev, isAnalyzing: true }));
    setError(null);

    try {
      let activeTypes = GEMSTONE_TYPES;
      if (state.mode === AnalysisMode.ANTIQUE) activeTypes = ANTIQUE_TYPES;
      if (state.mode === AnalysisMode.COIN) activeTypes = COIN_TYPES;

      const hint = state.activeItemType 
        ? activeTypes.find(g => g.id === state.activeItemType)?.name 
        : null;
        
      const result = await analyzeItem(state.originalImage, state.mode, hint);
      
      setState((prev) => ({
        ...prev,
        analysisResult: result,
        isAnalyzing: false,
      }));
      
      const newMsg: ChatMessage = {
          id: Date.now().toString(),
          role: MessageRole.MODEL,
          text: "تحلیل تصویر با موفقیت انجام شد. نتایج را در پنل سمت راست مشاهده کنید. آیا سوال دیگری درباره این تصویر دارید؟",
          timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, newMsg]);
      
    } catch (err: any) {
      console.error(err);
      setError("خطا در تحلیل تصویر. لطفاً دوباره تلاش کنید.");
      setState((prev) => ({ ...prev, isAnalyzing: false }));
    }
  }, [state.originalImage, state.activeItemType, state.mode]);

  // Handle Chat Message
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text: text,
      timestamp: Date.now(),
    };
    setChatHistory((prev) => [...prev, userMsg]);
    setIsChatTyping(true);

    const onAnalyzeRequest = async () => {
        if (!state.originalImage) {
            setError("لطفاً ابتدا یک عکس آپلود کنید.");
            return;
        }
        await handleAnalyze();
    };

    const responseMsg = await sendChatMessage([...chatHistory, userMsg], text, onAnalyzeRequest, state.originalImage, state.mode);
    
    setChatHistory((prev) => [...prev, responseMsg]);
    setIsChatTyping(false);
  };

  // --- Saved Design Handlers ---

  const handleOpenSaveModal = () => {
    setAnalysisName(`مورد بررسی شده ${savedAnalyses.length + 1}`);
    setShowSaveModal(true);
  };

  const confirmSaveAnalysis = () => {
    if (!state.originalImage || !state.analysisResult) return;

    const newAnalysis: SavedAnalysis = {
      id: Date.now().toString(),
      name: analysisName,
      timestamp: Date.now(),
      image: state.originalImage,
      itemType: state.activeItemType,
      mode: state.mode,
      analysis: state.analysisResult
    };

    const updatedAnalyses = [newAnalysis, ...savedAnalyses];
    
    try {
      localStorage.setItem('gemstone_saved_analyses', JSON.stringify(updatedAnalyses));
      setSavedAnalyses(updatedAnalyses);
      setShowSaveModal(false);
    } catch (e) {
      alert("حافظه پر شده است. لطفاً برخی از موارد قدیمی را پاک کنید.");
    }
  };

  const deleteAnalysis = (id: string) => {
    const updatedAnalyses = savedAnalyses.filter(d => d.id !== id);
    localStorage.setItem('gemstone_saved_analyses', JSON.stringify(updatedAnalyses));
    setSavedAnalyses(updatedAnalyses);
  };

  const loadAnalysis = (saved: SavedAnalysis) => {
    setState(prev => ({
      ...prev,
      originalImage: saved.image,
      analysisResult: saved.analysis,
      activeItemType: saved.itemType,
      mode: saved.mode,
      isAnalyzing: false,
    }));
    
    setShowSavedList(false);
    
    const newMsg: ChatMessage = {
        id: Date.now().toString(),
        role: MessageRole.SYSTEM,
        text: `سابقه بررسی بارگذاری شد: "${saved.name}"`,
        timestamp: Date.now()
    };
    setChatHistory(prev => [...prev, newMsg]);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 font-sans" dir="rtl">
      
      {/* --- Header --- */}
      <header className="flex-none h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-brand-600 p-2 rounded-lg text-white shadow-md shadow-brand-200">
            <Gem size={20} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Smart <span className="text-brand-600">Authenticator</span></h1>
        </div>
        <div className="flex items-center gap-4">
             {state.originalImage && (
              <div className="flex items-center gap-2">
                 <button 
                   onClick={() => {
                      setState(prev => ({...prev, originalImage: null, analysisResult: null, activeItemType: null}))
                   }}
                   className="text-sm font-medium text-slate-500 hover:text-red-500 transition-colors"
                 >
                   شروع مجدد
                 </button>
              </div>
             )}

             <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

             {/* My Designs Button */}
             <button
               onClick={() => setShowSavedList(true)}
               className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
             >
               <FolderHeart size={18} />
               <span className="hidden sm:inline">سوابق من</span>
             </button>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* --- Right / Bottom: Chat --- */}
        <div className="w-full md:w-[350px] flex-none z-20 order-2 md:order-1">
            <ChatInterface 
              messages={chatHistory} 
              onSendMessage={handleSendMessage}
              isTyping={isChatTyping}
              onReorderMessages={setChatHistory}
            />
        </div>

        {/* --- Left / Top: Visualizer --- */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-100 relative order-1 md:order-2 overflow-y-auto">
          
          {/* Style Carousel (Overlay or Top Bar) */}
          {state.originalImage && (
            <div className="flex-none h-28 bg-white/80 backdrop-blur-md border-b border-white/50 flex flex-col justify-center px-4 z-10 shadow-sm">
               <p className="text-xs font-semibold text-slate-500 mb-2">نوع را انتخاب کنید (اختیاری):</p>
               <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2">
                 {(state.mode === AnalysisMode.GEMSTONE ? GEMSTONE_TYPES : state.mode === AnalysisMode.ANTIQUE ? ANTIQUE_TYPES : COIN_TYPES).map((item) => (
                   <button
                      key={item.id}
                      onClick={() => setState(prev => ({...prev, activeItemType: item.id}))}
                      className={`flex-none group relative rounded-xl overflow-hidden w-32 h-14 transition-all transform hover:scale-105 ${state.activeItemType === item.id ? 'ring-2 ring-brand-500 scale-105 shadow-md shadow-brand-200' : 'opacity-80 hover:opacity-100'}`}
                   >
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-colors duration-300 flex flex-col items-center justify-center p-1">
                         <span className="text-white text-xs font-bold shadow-sm text-center">{item.name}</span>
                      </div>
                   </button>
                 ))}
               </div>
            </div>
          )}

          {/* Visualizer Area */}
          <div className="flex-1 relative flex flex-col items-center p-4 md:p-8">
             
             {!state.originalImage ? (
                // Upload State
                <div className="w-full max-w-md flex flex-col items-center mt-10">
                   <div className="flex bg-slate-200 p-1 rounded-xl mb-8 w-full">
                     <button 
                       onClick={() => setState(prev => ({...prev, mode: AnalysisMode.GEMSTONE}))}
                       className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${state.mode === AnalysisMode.GEMSTONE ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                     >
                       سنگ قیمتی
                     </button>
                     <button 
                       onClick={() => setState(prev => ({...prev, mode: AnalysisMode.ANTIQUE}))}
                       className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${state.mode === AnalysisMode.ANTIQUE ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                     >
                       اشیای آنتیک
                     </button>
                     <button 
                       onClick={() => setState(prev => ({...prev, mode: AnalysisMode.COIN}))}
                       className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${state.mode === AnalysisMode.COIN ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                     >
                       سکه
                     </button>
                   </div>
                   
                   <div className="w-full bg-white rounded-3xl border-2 border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center hover:border-brand-400 transition-colors group cursor-pointer relative shadow-sm">
                       <input 
                         type="file" 
                         accept="image/jpeg, image/png" 
                         onChange={handleFileUpload} 
                         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                       />
                       <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-brand-100 transition-colors">
                         <Upload className="text-brand-500" size={32} />
                       </div>
                       <h3 className="text-xl font-bold text-slate-800 mb-2">عکس خود را آپلود کنید</h3>
                       <p className="text-slate-500 text-sm mb-6" dir="ltr">jpg, png - Max 10MB</p>
                       <button className="bg-brand-600 text-white px-6 py-2 rounded-full font-medium shadow-lg shadow-brand-200 group-hover:shadow-brand-300 transition-all flex items-center gap-2 shimmer-btn">
                           <ImageIcon size={16} /> انتخاب تصویر
                       </button>
                   </div>
                </div>
             ) : (
                // Analysis State
                <div className="w-full max-w-4xl flex flex-col gap-6">
                   
                   {/* Top Row: Image & Primary Action */}
                   <div className="flex flex-col md:flex-row gap-6">
                      <div 
                        key={state.originalImage}
                        className="w-full md:w-1/2 relative bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden aspect-square flex items-center justify-center"
                      >
                        <img src={state.originalImage} alt="Uploaded Item" className="max-w-full max-h-full object-contain animate-blur-reveal" referrerPolicy="no-referrer" />
                        
                        {state.isAnalyzing && (
                          <div className="absolute inset-0 z-30 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                             <Loader size="normal" />
                             <p className="mt-4 font-medium animate-pulse">در حال بررسی دقیق...</p>
                          </div>
                        )}
                      </div>

                      <div className="w-full md:w-1/2 flex flex-col justify-center gap-4">
                         {!state.analysisResult && !state.isAnalyzing && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
                               <Sparkles className="mx-auto text-gold-500 mb-4" size={48} />
                               <h3 className="text-lg font-bold text-slate-800 mb-2">آماده تحلیل</h3>
                               <p className="text-sm text-slate-600 mb-6">هوش مصنوعی آماده است تا اصالت، کیفیت و ارزش تقریبی این تصویر را بررسی کند.</p>
                               <button 
                                 onClick={handleAnalyze}
                                 className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all flex items-center justify-center gap-2 shimmer-btn"
                               >
                                 <Search size={20} /> تحلیل تصویر
                               </button>
                            </div>
                         )}

                         {state.analysisResult && (
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 flex flex-col h-full">
                               <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                                  <div className="flex flex-col">
                                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                       <ShieldCheck className="text-brand-600" /> 
                                       {'stoneName' in state.analysisResult ? state.analysisResult.stoneName : 'itemName' in state.analysisResult ? state.analysisResult.itemName : (state.analysisResult as CoinAnalysis).coinName}
                                    </h3>
                                    <span className="text-xs text-slate-500 mt-1">
                                      {'mineralFamily' in state.analysisResult ? `خانواده کانی: ${state.analysisResult.mineralFamily}` : 'era' in state.analysisResult ? `دوره: ${state.analysisResult.era}` : `سال ضرب: ${(state.analysisResult as CoinAnalysis).mintYear}`}
                                    </span>
                                  </div>
                                  <button 
                                    onClick={handleOpenSaveModal}
                                    className="text-brand-600 hover:bg-brand-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                                  >
                                    <Save size={16} /> ذخیره
                                  </button>
                               </div>
                               
                               <div className="flex items-center gap-3 mb-6 bg-brand-50 p-4 rounded-xl border border-brand-100">
                                  <div className={`w-3 h-3 rounded-full ${state.analysisResult.authenticity.includes('اصل') || state.analysisResult.authenticity.includes('طبیعی') ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`}></div>
                                  <div className="flex flex-col flex-1">
                                    <p className="font-bold text-brand-900 text-lg">{state.analysisResult.authenticity}</p>
                                    <div className="w-full bg-brand-200 rounded-full h-1.5 mt-2">
                                      <div className="bg-brand-600 h-1.5 rounded-full" style={{ width: `${state.analysisResult.confidenceScore}%` }}></div>
                                    </div>
                                    <p className="text-xs text-brand-700 mt-1">درصد اطمینان هوش مصنوعی: {state.analysisResult.confidenceScore}٪</p>
                                  </div>
                               </div>

                               <div className="grid grid-cols-2 gap-4">
                                  {'stoneName' in state.analysisResult && (
                                    <>
                                      <div className="flex flex-col gap-1"><span className="text-xs text-slate-500 flex items-center gap-1"><Hammer size={12}/> سختی موس</span><span className="font-medium text-slate-800 text-sm">{state.analysisResult.hardness}</span></div>
                                      <div className="flex flex-col gap-1"><span className="text-xs text-slate-500 flex items-center gap-1"><Eye size={12}/> ضریب شکست</span><span className="font-medium text-slate-800 text-sm">{state.analysisResult.refractiveIndex}</span></div>
                                      <div className="flex flex-col gap-1"><span className="text-xs text-slate-500 flex items-center gap-1"><Layers size={12}/> سیستم تبلور</span><span className="font-medium text-slate-800 text-sm">{state.analysisResult.crystalSystem}</span></div>
                                      <div className="flex flex-col gap-1"><span className="text-xs text-slate-500 flex items-center gap-1"><Gem size={12}/> نوع تراش</span><span className="font-medium text-slate-800 text-sm">{state.analysisResult.cutType}</span></div>
                                      <div className="flex flex-col gap-1"><span className="text-xs text-slate-500 flex items-center gap-1"><Palette size={12}/> کیفیت رنگ</span><span className="font-medium text-slate-800 text-sm">{state.analysisResult.colorGrade}</span></div>
                                      <div className="flex flex-col gap-1"><span className="text-xs text-slate-500 flex items-center gap-1"><Droplets size={12}/> شفافیت</span><span className="font-medium text-slate-800 text-sm">{state.analysisResult.clarity}</span></div>
                                      <div className="flex flex-col gap-1"><span className="text-xs text-slate-500 flex items-center gap-1"><Scale size={12}/> وزن تقریبی</span><span className="font-medium text-slate-800 text-sm">{state.analysisResult.estimatedCarat}</span></div>
                                    </>
                                  )}
                                  {'itemName' in state.analysisResult && (
                                    <>
                                      <div className="flex flex-col gap-1"><span className="text-xs text-slate-500 flex items-center gap-1"><Hammer size={12}/> کشور سازنده</span><span className="font-medium text-slate-800 text-sm">{state.analysisResult.originCountry}</span></div>
                                      <div className="flex flex-col gap-1"><span className="text-xs text-slate-500 flex items-center gap-1"><Eye size={12}/> قدمت تقریبی</span><span className="font-medium text-slate-800 text-sm">{state.analysisResult.estimatedAge}</span></div>
                                      <div className="flex flex-col gap-1"><span className="text-xs text-slate-500 flex items-center gap-1"><Layers size={12}/> دوره تاریخی</span><span className="font-medium text-slate-800 text-sm">{state.analysisResult.era}</span></div>
                                      <div className="flex flex-col gap-1"><span className="text-xs text-slate-500 flex items-center gap-1"><Gem size={12}/> جنس مواد</span><span className="font-medium text-slate-800 text-sm">{state.analysisResult.material}</span></div>
                                      <div className="flex flex-col gap-1"><span className="text-xs text-slate-500 flex items-center gap-1"><Palette size={12}/> وضعیت نگهداری</span><span className="font-medium text-slate-800 text-sm">{state.analysisResult.condition}</span></div>
                                      <div className="flex flex-col gap-1 col-span-2"><span className="text-xs text-slate-500 flex items-center gap-1"><Droplets size={12}/> اهمیت تاریخی</span><span className="font-medium text-slate-800 text-sm">{state.analysisResult.historicalSignificance}</span></div>
                                    </>
                                  )}
                                  {'coinName' in state.analysisResult && (
                                    <>
                                      <div className="flex flex-col gap-1"><span className="text-xs text-slate-500 flex items-center gap-1"><Hammer size={12}/> کشور/امپراتوری</span><span className="font-medium text-slate-800 text-sm">{(state.analysisResult as CoinAnalysis).originCountry}</span></div>
                                      <div className="flex flex-col gap-1"><span className="text-xs text-slate-500 flex items-center gap-1"><Eye size={12}/> سال ضرب</span><span className="font-medium text-slate-800 text-sm">{(state.analysisResult as CoinAnalysis).mintYear}</span></div>
                                      <div className="flex flex-col gap-1"><span className="text-xs text-slate-500 flex items-center gap-1"><Layers size={12}/> حاکم/دوره</span><span className="font-medium text-slate-800 text-sm">{(state.analysisResult as CoinAnalysis).rulerOrEra}</span></div>
                                      <div className="flex flex-col gap-1"><span className="text-xs text-slate-500 flex items-center gap-1"><Gem size={12}/> جنس سکه</span><span className="font-medium text-slate-800 text-sm">{(state.analysisResult as CoinAnalysis).composition}</span></div>
                                      <div className="flex flex-col gap-1"><span className="text-xs text-slate-500 flex items-center gap-1"><Palette size={12}/> وزن و ابعاد</span><span className="font-medium text-slate-800 text-sm">{(state.analysisResult as CoinAnalysis).weightAndSize}</span></div>
                                      <div className="flex flex-col gap-1"><span className="text-xs text-slate-500 flex items-center gap-1"><Droplets size={12}/> درجه کیفیت</span><span className="font-medium text-slate-800 text-sm">{(state.analysisResult as CoinAnalysis).grade}</span></div>
                                      <div className="flex flex-col gap-1 col-span-2"><span className="text-xs text-slate-500 flex items-center gap-1"><Scale size={12}/> روی سکه</span><span className="font-medium text-slate-800 text-sm">{(state.analysisResult as CoinAnalysis).obverseDescription}</span></div>
                                      <div className="flex flex-col gap-1 col-span-2"><span className="text-xs text-slate-500 flex items-center gap-1"><Scale size={12}/> پشت سکه</span><span className="font-medium text-slate-800 text-sm">{(state.analysisResult as CoinAnalysis).reverseDescription}</span></div>
                                    </>
                                  )}
                               </div>

                               <div className="mt-auto pt-6">
                                  <div className="bg-gold-50 border border-gold-200 p-4 rounded-xl flex items-center justify-between">
                                     <span className="text-gold-700 font-semibold flex items-center gap-1"><DollarSign size={16}/> ارزش تقریبی:</span>
                                     <span className="text-gold-800 font-bold" dir="ltr">{state.analysisResult.estimatedValue}</span>
                                  </div>
                               </div>
                            </div>
                         )}
                      </div>
                   </div>

                   {/* Bottom Row: Tips & Tests */}
                   {state.analysisResult && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                           <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                              <Activity className="text-brand-500" size={18} /> روش‌های تست پیشنهادی
                           </h4>
                           <ul className="space-y-2">
                              {state.analysisResult.furtherTests.map((test, idx) => (
                                 <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                    <span className="text-brand-400 mt-0.5">•</span> {test}
                                 </li>
                              ))}
                           </ul>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                           <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                              <Sparkles className="text-gold-500" size={18} /> نکات کلیدی تشخیص
                           </h4>
                           <ul className="space-y-2">
                              {state.analysisResult.detectionTips.map((tip, idx) => (
                                 <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                    <span className="text-gold-400 mt-0.5">★</span> {tip}
                                 </li>
                              ))}
                           </ul>
                        </div>
                     </div>
                   )}

                </div>
             )}
             
             {error && (
                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 px-4 py-2 rounded-lg shadow-lg border border-red-100 flex items-center gap-2 text-sm z-50">
                    <AlertCircle size={16} /> {error}
                 </div>
             )}

          </div>
        </div>
      </main>

      {/* --- Modals --- */}
      
      {/* Save Design Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all">
            <h3 className="text-lg font-bold text-slate-800 mb-4">ذخیره نتیجه بررسی</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-1">نام مورد / بررسی</label>
              <input 
                type="text" 
                value={analysisName} 
                onChange={(e) => setAnalysisName(e.target.value)} 
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder="مثال: انگشتر زمرد مادربزرگ"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button 
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                انصراف
              </button>
              <button 
                onClick={confirmSaveAnalysis}
                disabled={!analysisName.trim()}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                ذخیره
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Designs List Modal */}
      {showSavedList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FolderHeart className="text-brand-600" /> سوابق بررسی‌های من
              </h3>
              <button 
                onClick={() => setShowSavedList(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
              {savedAnalyses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <FolderHeart size={48} className="mb-2 opacity-50" />
                  <p>هیچ سابقه‌ای یافت نشد.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedAnalyses.map(saved => (
                    <div key={saved.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                      <div className="aspect-[4/3] relative bg-slate-100">
                        <img src={saved.image} alt={saved.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                           <span className="text-white text-xs font-medium">{saved.analysis.authenticity}</span>
                        </div>
                      </div>
                      <div className="p-3 flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-slate-800 text-sm">{saved.name}</h4>
                            <p className="text-xs text-slate-500">{new Date(saved.timestamp).toLocaleDateString('fa-IR')}</p>
                          </div>
                          <button 
                            onClick={() => deleteAnalysis(saved.id)}
                            className="text-slate-400 hover:text-red-500 p-1"
                            title="حذف"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-3 flex-1">
                          {'stoneName' in saved.analysis ? `تراش: ${saved.analysis.cutType}` : 'itemName' in saved.analysis ? `قدمت: ${saved.analysis.estimatedAge}` : `سال ضرب: ${(saved.analysis as CoinAnalysis).mintYear}`} | ارزش: {saved.analysis.estimatedValue}
                        </p>
                        <button 
                           onClick={() => loadAnalysis(saved)}
                           className="w-full py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
                        >
                           <ExternalLink size={12} /> مشاهده جزئیات
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Simple Loading Spinner Component
const Loader: React.FC<{ size?: 'small' | 'normal' }> = ({ size = 'normal' }) => (
    <div className={`rounded-full border-2 border-current border-t-transparent animate-spin ${size === 'small' ? 'w-4 h-4' : 'w-10 h-10'}`}></div>
);

export default App;