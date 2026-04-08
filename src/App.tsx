import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { AnalysisDisplay } from './components/AnalysisResult';
import { AppealDocument } from './components/AppealDocument';
import { analyzeTicket, AnalysisResult } from './services/gemini';
import { Shield, Scale, Zap, AlertCircle, Loader2, ArrowRight, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type AppState = 'idle' | 'analyzing' | 'result' | 'error';

export default function App() {
  const [state, setState] = useState<AppState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
  };

  const handleClear = () => {
    setFile(null);
    setResult(null);
    setState('idle');
    setError(null);
  };

  const startAnalysis = async () => {
    if (!file) return;

    setState('analyzing');
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(file);
      const base64 = await base64Promise;

      const analysisResult = await analyzeTicket(base64, file.type);
      setResult(analysisResult);
      setState('result');
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao analisar sua multa. Por favor, tente novamente com um arquivo mais legível.');
      setState('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-primary/10">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Scale size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">Multa<span className="text-primary">IA</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Como funciona</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Legislação</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Privacidade</a>
          </nav>
          <button className="px-5 py-2.5 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-all">
            Falar com Especialista
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        <AnimatePresence mode="wait">
          {state === 'idle' || state === 'error' ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Hero Section */}
              <div className="text-center space-y-6 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-full text-xs font-bold uppercase tracking-widest">
                  <Zap size={14} />
                  Análise Jurídica Instantânea
                </div>
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
                  Transforme sua multa em um <span className="text-primary">recurso vencedor</span>.
                </h1>
                <p className="text-lg text-slate-500 leading-relaxed">
                  Nossa IA analisa inconsistências legais, técnicas e formais em segundos. 
                  Faça o upload e descubra suas chances de anular a infração.
                </p>
              </div>

              {/* Upload Area */}
              <div className="max-w-2xl mx-auto">
                <FileUpload 
                  onFileSelect={handleFileSelect} 
                  selectedFile={file} 
                  onClear={handleClear}
                  isLoading={false}
                />
                
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600"
                  >
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{error}</p>
                  </motion.div>
                )}

                <div className="mt-8 flex justify-center">
                  <button
                    onClick={startAnalysis}
                    disabled={!file}
                    className="group relative px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Analisar Multa Agora
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </button>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-slate-100">
                <FeatureCard 
                  icon={<Shield className="text-primary" />}
                  title="Análise de Provas"
                  description="Verificamos a presença de fotos e a validade de radares conforme normas do INMETRO."
                />
                <FeatureCard 
                  icon={<Scale className="text-primary" />}
                  title="Base Legal"
                  description="Argumentos fundamentados no CTB e resoluções do CONTRAN atualizadas."
                />
                <FeatureCard 
                  icon={<Zap className="text-primary" />}
                  title="Geração Instantânea"
                  description="Recurso completo e personalizado pronto para ser enviado ao órgão autuador."
                />
              </div>
            </motion.div>
          ) : state === 'analyzing' ? (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center justify-center py-20 space-y-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
                <div className="relative w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Scale size={32} className="text-primary animate-bounce" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Nossa IA está trabalhando...</h2>
                <p className="text-slate-500">Analisando leis, radares e inconsistências formais.</p>
              </div>
              <div className="w-full max-w-xs bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 15, ease: "linear" }}
                  className="h-full bg-primary"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-16"
            >
              <div className="flex items-center justify-between">
                <button 
                  onClick={handleClear}
                  className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors"
                >
                  <RefreshCw size={16} />
                  Nova Análise
                </button>
                <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-100">
                  Análise Concluída
                </div>
              </div>

              {result && (
                <>
                  <AnalysisDisplay result={result} />
                  <div className="h-px bg-slate-100" />
                  <AppealDocument text={result.appealText} />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 text-white">
            <Scale size={20} />
            <span className="font-bold tracking-tight">MultaIA</span>
          </div>
          <p className="text-sm">© 2026 MultaIA. Todos os direitos reservados. Inteligência Artificial para Justiça no Trânsito.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Termos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 bg-white border border-slate-100 rounded-3xl hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-3">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}
