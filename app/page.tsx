'use client';

import { useState, useEffect } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { ArrowRight, ShieldCheck, Scale, FileText, FileUp, Loader2, AlertCircle, CheckCircle2, Download, Info } from 'lucide-react';
import Link from 'next/link';
import { downloadAppealAsDocx } from '@/lib/docx-utils';

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3-flash-preview");

  useEffect(() => {
    fetch('/api/models')
      .then((res) => res.json())
      .then((data) => {
        setAvailableModels(data);
        const activeModel = data.find((m: any) => m.available);
        if (activeModel) {
          setSelectedModel(activeModel.name);
        }
      })
      .catch((err) => console.error("Erro ao buscar modelos:", err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const startAnalysis = async () => {
    if (!file) return;

    setStatus('analyzing');
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', selectedModel);

    try {
      const resp = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(errorText || "Nao foi possivel analisar o documento. Verifique o arquivo.");
      }

      const data = await resp.json();
      setResult(data);
      setStatus('done');
    } catch (err: any) {
      console.error("Erro na analise:", err);
      setError(err.message || "Ocorreu um erro ao processar o seu arquivo. Tente novamente.");
      setStatus('error');
    }
  };

  return (
    <div>
      <section className="hero-section">
        <h1>Gerador de Defesa de Multas</h1>
        <p className="text-muted mb-8" style={{ fontSize: '1.1rem' }}>
          Suba a foto ou PDF do auto de infração para criar um recurso administrativo simples e fundamentado.
        </p>

        {availableModels.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '24px',
            fontSize: '0.8rem'
          }}>
            {availableModels.map((m: any) => (
              <span key={m.name} style={{
                padding: '4px 10px',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
                backgroundColor: '#ffffff',
                color: m.available ? '#16a34a' : '#dc2626',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '500'
              }}>
                <span style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  backgroundColor: m.available ? '#16a34a' : '#dc2626',
                  display: 'inline-block'
                }}></span>
                {m.name}: {m.available ? 'Ativo' : 'Indisponível'}
              </span>
            ))}
          </div>
        )}

        {status === 'idle' || status === 'error' ? (
          <div style={{ maxWidth: '550px', margin: '0 auto', textAlign: 'left' }}>
            
            {isLoaded && !isSignedIn && (
              <div style={{ 
                backgroundColor: '#fffbeb', 
                border: '1px solid #fef3c7', 
                borderRadius: '6px', 
                padding: '12px', 
                marginBottom: '16px', 
                color: '#b45309', 
                fontSize: '0.85rem',
                textAlign: 'center' 
              }}>
                Atenção: Você está usando o gerador no modo de testes. A sua defesa NÃO ficará salva no histórico.
              </div>
            )}

            <label 
              className="file-dropzone" 
              onDrop={handleDrop} 
              onDragOver={handleDragOver}
            >
              <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
              <FileUp size={40} className="mb-4 text-primary" />
              <h3 className="mb-2" style={{ color: 'var(--text-primary)' }}>
                {file ? file.name : 'Selecione o arquivo da multa (PDF ou Imagem)'}
              </h3>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Arraste e solte ou clique para navegar (máx. 10MB)</p>
            </label>

            {error && (
              <div className="error-box">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ marginTop: '20px' }}>
              <button
                onClick={startAnalysis}
                disabled={!file}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1.05rem' }}
              >
                <ArrowRight size={18} /> Gerar Recurso Administrativo
              </button>
            </div>
          </div>
        ) : status === 'analyzing' ? (
          <div className="text-center" style={{ padding: '50px 0' }}>
            <Loader2 className="text-primary" size={48} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
            <h2>Analisando multa...</h2>
            <p className="text-muted">Aguarde alguns segundos enquanto processamos o arquivo e redigimos a petição.</p>
          </div>
        ) : (
          <div style={{ textAlign: 'left' }}>
            <div className="analyze-grid">
               <div className="card">
                 <h3>Probabilidade de Sucesso</h3>
                 <div className="text-primary" style={{ fontSize: '3.5rem', fontWeight: 'bold', margin: '10px 0' }}>
                   {result.successProbability}%
                 </div>
                 <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                   <strong>Fase do Recurso:</strong> {(result.defenseStage || 'defesa_previa').replace('_', ' ').toUpperCase()}
                 </p>
                 <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                   {result.explanation}
                 </p>
              </div>
              
              <div className="card">
                <h3>Dados da Multa</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem', marginTop: '15px' }}>
                    <div>
                        <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem' }}>PLACA</span>
                        <div className="font-bold">{result.extractedData.vehiclePlate || 'N/A'}</div>
                    </div>
                    <div>
                        <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem' }}>MODELO DO VEÍCULO</span>
                        <div className="font-bold">{result.extractedData.vehicleModel || 'N/A'}</div>
                    </div>
                    <div>
                        <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem' }}>DATA E HORA</span>
                        <div className="font-bold">{result.extractedData.date || 'N/A'} {result.extractedData.time || ''}</div>
                    </div>
                    <div>
                        <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem' }}>VELOCIDADE / LIMITE</span>
                        <div className="font-bold">{result.extractedData.measuredSpeed || 'N/A'} / {result.extractedData.roadLimit || 'N/A'}</div>
                    </div>
                    <div>
                        <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem' }}>GRAVIDADE</span>
                        <div className="font-bold">{result.severity?.toUpperCase() || 'N/A'} ({result.points || 0} pontos)</div>
                    </div>
                    <div>
                        <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem' }}>AFERIÇÃO RADAR</span>
                        <div className="font-bold">{result.extractedData.lastCalibration || 'Não informado'}</div>
                    </div>
                </div>
              </div>
            </div>

            <div className="card mb-4" style={{ borderLeft: '4px solid var(--error)' }}>
              <h3 className="text-error" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <AlertCircle size={20} /> Inconsistências Jurídicas Encontradas
              </h3>
              <ul style={{ paddingLeft: '20px', listStyleType: 'disc', fontSize: '0.9rem' }}>
                {result.inconsistencies.map((inc: string, i: number) => (
                  <li key={i} style={{ marginBottom: '6px' }}>
                    {inc}
                  </li>
                ))}
              </ul>
              {result.inconsistencies.length === 0 && (
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>Nenhuma inconsistência grave encontrada.</p>
              )}
            </div>

            <div className="card mb-4">
              <div className="header-flex">
                <h3>Minuta do Recurso</h3>
                <button 
                  onClick={() => downloadAppealAsDocx(result)} 
                  className="btn-primary" 
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                    <Download size={14} /> Baixar Defesa em Word (.docx)
                </button>
              </div>
              <div className="code-block">
                {result.appealText}
              </div>
            </div>

            {!isSignedIn && (
              <div className="card mb-4" style={{ backgroundColor: '#f1f5f9', textAlign: 'center' }}>
                <h4 style={{ marginBottom: '6px' }}>Deseja salvar essa petição no histórico?</h4>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '12px' }}>
                  Crie uma conta para poder acessar e baixar essa e outras defesas em qualquer lugar pelo seu Painel.
                </p>
                <SignInButton mode="modal">
                  <button className="btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
                    Fazer Cadastro / Login
                  </button>
                </SignInButton>
              </div>
            )}

            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
              <button onClick={() => { setStatus('idle'); setFile(null); }} className="btn-secondary">
                Analisar Outra Multa
              </button>
              <Link href="/dashboard" className="btn-primary" style={{ marginLeft: 'auto' }}>
                Acessar Painel Geral
              </Link>
            </div>
          </div>
        )}
      </section>

      {status === 'idle' && (
        <section className="features-grid" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '40px' }}>
          <FeatureCard 
            icon={<ShieldCheck size={28} />}
            title="Validação do Radar"
            description="Verifica se o aparelho medidor de velocidade está calibrado e homologado pelo INMETRO."
          />
          <FeatureCard 
            icon={<Scale size={28} />}
            title="Prazos Legais"
            description="Confere se o órgão de trânsito emitiu a notificação dentro do prazo previsto por lei."
          />
          <FeatureCard 
            icon={<FileText size={28} />}
            title="Defesa Formalizada"
            description="Escreve o texto com cabeçalho oficial e argumentos jurídicos prontos para assinatura."
          />
        </section>
      )}
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="text-primary mb-3">{icon}</div>
      <h3>{title}</h3>
      <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '5px' }}>{description}</p>
    </div>
  );
}
