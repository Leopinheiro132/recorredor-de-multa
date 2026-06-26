'use client';

import { useEffect, useState } from 'react';
import { LayoutDashboard, TrendingUp, DollarSign, FileCheck, History, ArrowUpRight, Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/kpis')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) return <div className="text-center mt-20"><Loader2 className="text-primary" style={{ animation: 'spin 1s linear infinite' }} size={32} /></div>;

  return (
    <div>
      <div className="header-flex">
        <div>
          <h1>Painel de Controle</h1>
          <p className="text-muted">Resumo das suas análises de multas no sistema.</p>
        </div>
        <Link href="/" className="btn-primary">
          Analisar Nova Multa
        </Link>
      </div>

      <div className="kpi-grid">
        <div className="card">
          <div className="kpi-flex-icon">
            <div><FileCheck size={20} /></div>
            <span className="text-muted font-semibold">Total de Análises</span>
          </div>
          <div className="kpi-value">{stats?.totalAnalyses || 0}</div>
        </div>
        <div className="card">
          <div className="kpi-flex-icon">
            <div><TrendingUp size={20} /></div>
            <span className="text-muted font-semibold">Taxa de Sucesso Média</span>
          </div>
          <div className="kpi-value">{Math.round(stats?.avgProbability || 0)}%</div>
        </div>
        <div className="card">
          <div className="kpi-flex-icon">
            <div><DollarSign size={20} /></div>
            <span className="text-muted font-semibold">Economia Estimada</span>
          </div>
          <div className="kpi-value">R$ {(stats?.potentialSavings || 0).toFixed(2)}</div>
        </div>
        <div className="card" style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
          <div className="kpi-flex-icon">
            <div><ShieldCheck size={20} className="text-primary" /></div>
            <span className="text-muted font-semibold">Pontos Salvos</span>
          </div>
          <div className="kpi-value">{stats?.pointsSaved || 0}</div>
        </div>
      </div>

      <div className="dashboard-main-grid">
        <div className="card">
            <div className="header-flex" style={{ marginBottom: '16px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <History className="text-primary" size={18} /> Histórico Recente
                </h3>
                <Link href="/history" className="text-primary font-semibold" style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Ver todos <ArrowUpRight size={14} />
                </Link>
            </div>
            <div className="text-muted text-center" style={{ padding: '48px 0', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                Acesse a aba de histórico para visualizar suas multas anteriores em detalhes.
            </div>
        </div>

        <div>
            <div className="card" style={{ backgroundColor: 'rgba(34, 197, 94, 0.05)', borderColor: 'rgba(34, 197, 94, 0.2)' }}>
                <h4 className="mb-2">Dica do Detran</h4>
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                    Multas por excesso de velocidade frequentemente possuem falhas na aferição do radar pelo INMETRO. Nossa IA sempre analisa este cruzamento de dados.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
