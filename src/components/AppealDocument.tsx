import React, { useState } from 'react';
import { Copy, Download, Check, FileText } from 'lucide-react';
import { motion } from 'motion/react';

interface AppealDocumentProps {
  text: string;
}

export const AppealDocument: React.FC<AppealDocumentProps> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "recurso_multa.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <FileText size={20} />
          </div>
          <h2 className="text-xl font-bold">Recurso Gerado</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copiado' : 'Copiar Texto'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Download size={16} />
            Baixar .txt
          </button>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-card border rounded-3xl p-8 md:p-12 shadow-sm">
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
              {text}
            </pre>
          </div>
        </div>
      </div>

      <div className="p-6 bg-muted/50 rounded-2xl border border-dashed border-muted-foreground/20">
        <p className="text-xs text-muted-foreground text-center">
          Este recurso foi gerado por inteligência artificial com base nos dados fornecidos. 
          Recomendamos a revisão por um profissional jurídico antes da submissão oficial.
        </p>
      </div>
    </div>
  );
};
