'use client';

import { useEffect, useState } from 'react';
import { Loader2, History, Calendar, MapPin, ChevronRight, FileText } from 'lucide-react';
import Link from 'next/link';
import { downloadAppealAsDocx } from '@/lib/docx-utils';

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingItem, setViewingItem] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) return <div className="text-center mt-20"><Loader2 className="text-primary" style={{ animation: 'spin 1s linear infinite' }} size={32} /></div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ padding: '12px', backgroundColor: 'var(--color-card)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--color-primary)' }}>
            <History size={32} />
        </div>
        <div>
            <h1>Histórico de Infrações</h1>
            <p className="text-muted">Consulte as análises anteriores geradas para a sua conta.</p>
        </div>
      </div>

      <div>
        {history.length === 0 ? (
            <div className="card text-center" style={{ padding: '64px' }}>
                <FileText size={48} className="text-muted" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <h3>Nenhum registro encontrado</h3>
                <p className="text-muted my-4" style={{ maxWidth: '400px', margin: '16px auto' }}>
                    Você ainda não analisou nenhuma multa conosco. Envie o seu primeiro auto de infração para testarmos a ferramenta.
                </p>
                <Link href="/" className="btn-primary">
                    Fazer Primeira Análise
                </Link>
            </div>
        ) : (
            history.map((item) => (
                <div key={item.id} className="history-item">
                    <div className="history-item-score">
                        <span>{item.successProbability}%</span>
                        <small>Aprovação</small>
                    </div>

                    <div className="history-item-details">
                        <h3>{item.infractionType}</h3>
                        <div className="history-item-meta">
                            <span className="history-meta-item"><Calendar size={14} /> {item.date} {item.time ? `às ${item.time}` : ''}</span>
                            <span className="history-meta-item"><MapPin size={14} /> {item.location}</span>
                            <span className="history-meta-plate">{item.vehiclePlate}</span>
                        </div>
                    </div>

                    <div style={{ marginLeft: 'auto' }}>
                        <button 
                            onClick={() => setViewingItem(item)}
                            className="text-primary font-semibold" 
                            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            Ver Detalhes <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            ))
        )}
      </div>

      {viewingItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="card" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
                <div className="header-flex">
                    <h2>Recurso para {viewingItem.vehiclePlate}</h2>
                    <button onClick={() => setViewingItem(null)} className="text-muted font-bold">FECHAR</button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '24px 0', padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.875rem' }}>
                        <span className="text-muted">Infração:</span>
                        <div className="font-semibold">{viewingItem.infractionType}</div>
                    </div>
                    <div style={{ fontSize: '0.875rem' }}>
                        <span className="text-muted">Probabilidade:</span>
                        <div className="text-primary font-bold">{viewingItem.successProbability}%</div>
                    </div>
                </div>

                <div className="code-block" style={{ marginBottom: '24px' }}>
                    {viewingItem.appealText}
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <button 
                        onClick={() => downloadAppealAsDocx({ 
                            extractedData: { 
                                vehiclePlate: viewingItem.vehiclePlate,
                                authority: viewingItem.authority,
                                ownerName: viewingItem.ownerName,
                                ownerCpf: viewingItem.ownerCpf,
                                ownerAddress: viewingItem.ownerAddress
                            }, 
                            appealText: viewingItem.appealText 
                        })} 
                        className="btn-primary"
                    >
                        Baixar DOCX
                    </button>
                    <button onClick={() => setViewingItem(null)} className="btn-secondary">
                        Voltar
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
