import React from 'react';
import { CheckCircle2, AlertCircle, Info, Gauge, Calendar, MapPin, Car, ShieldAlert } from 'lucide-react';
import { AnalysisResult } from '@/src/services/gemini';
import { motion } from 'motion/react';

interface AnalysisDisplayProps {
  result: AnalysisResult;
}

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result }) => {
  const { extractedData, inconsistencies, successProbability, explanation } = result;

  const getProbabilityColor = (prob: number) => {
    if (prob >= 70) return 'text-emerald-500';
    if (prob >= 40) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Probability Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 p-8 bg-card border rounded-3xl flex flex-col justify-center">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Gauge size={18} />
            <span className="text-sm font-medium uppercase tracking-wider">Chance de Sucesso</span>
          </div>
          <div className="flex items-baseline gap-4">
            <span className={cn("text-6xl font-bold tracking-tighter", getProbabilityColor(successProbability))}>
              {successProbability}%
            </span>
            <p className="text-muted-foreground text-sm max-w-xs">
              {explanation}
            </p>
          </div>
        </div>

        <div className="p-8 bg-primary text-primary-foreground rounded-3xl flex flex-col justify-between">
          <ShieldAlert size={32} className="opacity-50" />
          <div>
            <p className="text-sm opacity-80 font-medium">Inconsistências</p>
            <p className="text-3xl font-bold">{inconsistencies.length}</p>
          </div>
        </div>
      </div>

      {/* Extracted Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DataCard icon={<Calendar size={20} />} label="Data e Hora" value={`${extractedData.date} às ${extractedData.time}`} />
        <DataCard icon={<MapPin size={20} />} label="Local" value={extractedData.location} />
        <DataCard icon={<Car size={20} />} label="Veículo" value={`${extractedData.vehicleModel} (${extractedData.vehiclePlate})`} />
        <DataCard icon={<Info size={20} />} label="Órgão" value={extractedData.authority} />
      </div>

      {extractedData.radarInfo && (
        <div className="p-6 bg-slate-50 border rounded-3xl space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Gauge size={16} />
            Informações do Radar
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-muted-foreground">Modelo</p>
              <p className="font-medium">{extractedData.radarInfo.model || 'Não identificado'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Última Aferição</p>
              <p className="font-medium">{extractedData.radarInfo.lastCalibration || 'Não identificado'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Homologação</p>
              <p className="font-medium">{extractedData.radarInfo.homologation || 'Não identificado'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Inconsistencies List */}
      <div className="bg-card border rounded-3xl overflow-hidden">
        <div className="p-6 border-b bg-muted/30">
          <h3 className="font-semibold flex items-center gap-2">
            <AlertCircle size={20} className="text-amber-500" />
            Pontos de Inconsistência Identificados
          </h3>
        </div>
        <div className="p-6 space-y-4">
          {inconsistencies.map((item, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={index} 
              className="flex gap-4 p-4 bg-muted/50 rounded-2xl border border-transparent hover:border-primary/20 transition-colors"
            >
              <div className="mt-1">
                <CheckCircle2 size={18} className="text-emerald-500" />
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">{item}</p>
            </motion.div>
          ))}
          {inconsistencies.length === 0 && (
            <p className="text-center py-8 text-muted-foreground italic">Nenhuma inconsistência óbvia detectada.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const DataCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="p-5 bg-card border rounded-2xl space-y-2">
    <div className="text-primary opacity-70">{icon}</div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground truncate" title={value}>{value}</p>
    </div>
  </div>
);

import { cn } from '@/src/lib/utils';
