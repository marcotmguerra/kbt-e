import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { formatarDataBR, linkWhatsApp } from '../utils/formatters';
import { 
  ArrowLeft, MessageCircle, Save, FileText, 
  CheckCircle, XCircle, Calendar, Dumbbell, Smartphone, Star
} from 'lucide-react';

const INSIGHTS_RELATORIO = {
    kids: {
        coord: { label: "Coordenação Geral", baixo: "Dificuldade severa em organizar movimentos.", medio: "Coordenação em desenvolvimento.", alto: "Excelente domínio motor." },
        agil: { label: "Agilidade", baixo: "Resposta lenta a estímulos.", medio: "Boa velocidade, mas perde precisão.", alto: "Reação rápida e adaptativa." },
        atencao: { label: "Atenção", baixo: "Dificuldade em manter o foco.", medio: "Mantém atenção, mas oscila.", alto: "Foco excepcional." },
        forca: { label: "Força Funcional", baixo: "Baixa sustentação corporal.", medio: "Força adequada para a idade.", alto: "Força acima da média." },
        inter: { label: "Social", baixo: "Dificuldade de integração.", medio: "Interage bem, mas busca aprovação.", alto: "Liderança natural." }
    },
    adulto: {
        cardio: { label: "Cardio", baixo: "Capacidade aeróbica limitada.", medio: "Resistência razoável.", alto: "Excelente forma cardiovascular." },
        forca: { label: "Força", baixo: "Dificuldade em sustentar cargas.", medio: "Boa base de força.", alto: "Força sólida e eficiente." },
        core: { label: "Core", baixo: "Instabilidade central.", medio: "Core ativo, mas oscila.", alto: "Estabilidade de elite." },
        mobilidade: { label: "Mobilidade", baixo: "Corpo rígido/travado.", medio: "Satisfatória em alguns pontos.", alto: "Fluidez total de movimento." },
        resposta: { label: "Resposta ao Treino", baixo: "Sofre muito com o estímulo.", medio: "Resposta positiva.", alto: "Excelente recuperação." }
    }
};

const PROGRAMAS_KABUTO = ["Crossfit", "Strong", "Cardio & Burn", "Hyrox", "Kids", "Skill"];

export default function StudentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ag, setAg] = useState(null);
    const [categoria, setCategoria] = useState('adulto');
    const [notas, setNotas] = useState({ coord: 0, agil: 0, atencao: 0, forca: 0, inter: 0, cardio: 0, core: 0, mobilidade: 0, resposta: 0 });
    const [analise, setAnalise] = useState('');
    const [recomendacaoAuto, setRecomendacaoAuto] = useState('Pendente');
    const [progManual, setProgManual] = useState('');

    useEffect(() => {
        if (id) fetchDados();
    }, [id]);

    async function fetchDados() {
        try {
            const { data, error } = await supabase
                .from("agendamentos")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;
            if (data) {
                setAg(data);
                if (data.relatorio_vivencia) {
                    setCategoria(data.relatorio_vivencia.categoria || 'adulto');
                    setNotas(data.relatorio_vivencia.notas || {});
                    setAnalise(data.relatorio_vivencia.traducao || '');
                    setRecomendacaoAuto(data.relatorio_vivencia.recomendacao_auto || '');
                    setProgManual(data.relatorio_vivencia.recomendacao_manual || '');
                }
            }
        } catch (err) {
            console.error("Erro ao carregar ficha:", err);
        }
    }

    const handleNotaChange = (pergunta, valor) => {
        const novasNotas = { ...notas, [pergunta]: Number(valor) };
        setNotas(novasNotas);
        const texto = INSIGHTS_RELATORIO[categoria][pergunta];
        let feedback = valor <= 2 ? texto.baixo : valor <= 4 ? texto.medio : texto.alto;
        if (!analise.includes(feedback)) setAnalise(prev => prev + (prev ? " " : "") + feedback);
        const valores = Object.values(novasNotas).filter(v => v > 0);
        const media = valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;
        setRecomendacaoAuto(media > 3.8 ? "Programa Crossfit" : "Programa Strong + Cardio");
    };

    async function salvarRelatorio() {
        const { data: { user } } = await supabase.auth.getUser();
        const payload = { categoria, notas, traducao: analise, recomendacao_auto: recomendacaoAuto, recomendacao_manual: progManual, avaliado_por: user?.id, data_avaliacao: new Date().toISOString() };
        const { error } = await supabase.from("agendamentos").update({ relatorio_vivencia: payload }).eq("id", id);
        if (!error) alert("Relatório salvo com sucesso!");
    }

    const enviarRelatorioWhats = () => {
        const programaFinal = progManual || recomendacaoAuto;
        let texto = `*RELATÓRIO DE VIVÊNCIA - KABUTO*%0A-----------------------------------%0A*Aluno:* ${ag.aluno_nome}%0A*Avaliação:* ${categoria.toUpperCase()}%0A%0A*DESEMPENHO TÉCNICO:*%0A`;
        Object.keys(INSIGHTS_RELATORIO[categoria]).forEach(k => { if (notas[k] > 0) { texto += `• ${INSIGHTS_RELATORIO[categoria][k]?.label}: ${"⭐".repeat(notas[k])} (${notas[k]}/5)%0A`; } });
        texto += `%0A*ANÁLISE DO COACH:*%0A_${analise}_%0A%0A*PROGRAMA RECOMENDADO:*%0A🚀 *${programaFinal}*%0A%0A-----------------------------------%0A_Parabéns pelo treino! Vamos começar sua jornada?_`;
        window.open(linkWhatsApp(ag.aluno_whatsapp, texto), '_blank');
    };

    async function alterarStatus(novoStatus) {
        await supabase.from("agendamentos").update({ status: novoStatus }).eq("id", id);
        fetchDados();
    }

    if (!ag) return <div style={{padding: '50px', textAlign: 'center', background: '#f8fafc', height: '100vh'}}>Carregando ficha do aluno...</div>;

    const formRaw = ag.form_raw ? (typeof ag.form_raw === 'string' ? JSON.parse(ag.form_raw) : ag.form_raw) : {};

    return (
        <div className="detail-page-wrapper" style={{ background: '#f8fafc', minHeight: '100vh', width: '100%' }}>
            
            {/* Header Desktop/Mobile */}
            <header style={{ padding: '15px 25px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button onClick={() => navigate(-1)} style={{ background: '#f1f5f9', border: 'none', padding: '10px', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}>
                    <ArrowLeft size={20} color="#400c88" />
                </button>
                <h2 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>Ficha de Vivência Técnica</h2>
            </header>

            <main style={{ padding: '25px', maxWidth: '1400px', margin: '0 auto' }}>
                
                {/* Perfil do Aluno */}
                <section style={{ background: '#fff', padding: '25px', borderRadius: '16px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>{ag.aluno_nome}</h1>
                        <div style={{ display: 'flex', gap: '20px', marginTop: '8px', color: '#64748b' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {formatarDataBR(ag.data_aula)}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Smartphone size={16} /> {ag.aluno_whatsapp}</span>
                        </div>
                    </div>
                    <div style={{ padding: '8px 20px', borderRadius: '30px', fontWeight: '800', fontSize: '12px', background: ag.status === 'confirmado' ? '#dcfce7' : '#fee2e2', color: ag.status === 'confirmado' ? '#166534' : '#991b1b' }}>
                        {ag.status?.toUpperCase()}
                    </div>
                </section>

                {/* Grid de Conteúdo */}
                <div className="detail-grid">
                    
                    {/* Coluna 1: Questionário (Esquerda) */}
                    <div className="grid-col questionario-col">
                        <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', height: '100%', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '16px', marginBottom: '20px', color: '#400c88', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FileText size={18} /> Respostas do Cadastro
                            </h3>
                            {Object.entries(formRaw).map(([key, val]) => (
                                <div key={key} style={{ marginBottom: '15px', padding: '12px', background: '#f8fafc', borderRadius: '10px' }}>
                                    <label style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: '800', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>{key}</label>
                                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#334155' }}>{Array.isArray(val) ? val.join(', ') : val}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Coluna 2: Avaliação (Centro) */}
                    <div className="grid-col avaliacao-col">
                        <div style={{ background: '#fff', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                <h3 style={{ fontSize: '16px', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><Dumbbell size={20} /> Avaliação do Professor</h3>
                                <div style={{ background: '#f1f5f9', padding: '4px', borderRadius: '10px', display: 'flex' }}>
                                    <button onClick={() => setCategoria('adulto')} style={{ border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', background: categoria === 'adulto' ? '#400c88' : 'transparent', color: categoria === 'adulto' ? '#fff' : '#64748b' }}>Adulto</button>
                                    <button onClick={() => setCategoria('kids')} style={{ border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', background: categoria === 'kids' ? '#400c88' : 'transparent', color: categoria === 'kids' ? '#fff' : '#64748b' }}>Kids</button>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                {Object.keys(INSIGHTS_RELATORIO[categoria]).map(key => (
                                    <div key={key}>
                                        <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px', color: '#475569' }}>{INSIGHTS_RELATORIO[categoria][key].label}</label>
                                        <select value={notas[key] || 0} onChange={(e) => handleNotaChange(key, e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff' }}>
                                            {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}/5 Estrelas</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>

                            <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px', color: '#475569' }}>Observações Técnicas</label>
                            <textarea value={analise} onChange={(e) => setAnalise(e.target.value)} placeholder="Como foi o desempenho do aluno?" style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #cbd5e1', minHeight: '100px', marginBottom: '25px', resize: 'none', fontFamily: 'inherit' }} />

                            <div style={{ background: '#f0f9ff', padding: '20px', borderRadius: '12px', border: '1px solid #bae6fd', marginBottom: '25px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '800', color: '#0369a1', textTransform: 'uppercase', marginBottom: '10px' }}><Star size={16} fill="#0369a1" /> Prescrição de Treino</label>
                                <select value={progManual || recomendacaoAuto} onChange={(e) => setProgManual(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #0ea5e9', fontWeight: '700', color: '#0369a1' }}>
                                    <option value="">Selecione o programa...</option>
                                    {PROGRAMAS_KABUTO.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={salvarRelatorio} style={{ flex: 1, padding: '16px', borderRadius: '12px', border: 'none', background: '#400c88', color: '#fff', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}><Save size={20}/> Salvar Ficha</button>
                                <button onClick={enviarRelatorioWhats} style={{ flex: 1, padding: '16px', borderRadius: '12px', border: 'none', background: '#25d366', color: '#fff', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}><MessageCircle size={20}/> WhatsApp</button>
                            </div>
                        </div>
                    </div>

                    {/* Coluna 3: Ações Admin (Direita) */}
                    <div className="grid-col admin-col">
                        <div style={{ background: '#400c88', padding: '25px', borderRadius: '16px', color: '#fff' }}>
                            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>Ações Administrativas</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => alterarStatus('confirmado')} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#16a34a', color: '#fff', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><CheckCircle size={18}/> Presente</button>
                                    <button onClick={() => alterarStatus('faltou')} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><XCircle size={18}/> Faltou</button>
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '12px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={ag.matriculado} onChange={async (e) => { await supabase.from("agendamentos").update({ matriculado: e.target.checked }).eq("id", id); fetchDados(); }} style={{ width: '20px', height: '20px' }} />
                                    <span style={{ fontWeight: '700', fontSize: '14px' }}>Matrícula Efetuada</span>
                                </label>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            <style dangerouslySetInnerHTML={{ __html: `
                .detail-grid {
                    display: grid;
                    grid-template-columns: 1fr 1.5fr 1fr;
                    gap: 25px;
                    align-items: start;
                }

                @media (max-width: 1200px) {
                    .detail-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                    .admin-col { grid-column: span 2; }
                }

                @media (max-width: 800px) {
                    .detail-grid {
                        grid-template-columns: 1fr;
                    }
                    .admin-col, .questionario-col, .avaliacao-col { grid-column: span 1; }
                    .admin-col { order: -1; } /* Ações Admin aparecem primeiro no mobile */
                }
            `}} />
        </div>
    );
}