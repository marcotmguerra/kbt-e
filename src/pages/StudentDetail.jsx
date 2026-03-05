import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { formatarDataBR, linkWhatsApp } from '../utils/formatters';
import { 
  ArrowLeft, MessageCircle, Save, FileText, 
  CheckCircle, XCircle, Calendar, Dumbbell, Smartphone 
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
        fetchDados();
    }, [id]);

    async function fetchDados() {
        const { data, error } = await supabase.from("agendamentos").select("*, profiles(nome)").eq("id", id).single();
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
    }

    const handleNotaChange = (pergunta, valor) => {
        const novasNotas = { ...notas, [pergunta]: Number(valor) };
        setNotas(novasNotas);
        
        // Insight Automático
        const texto = INSIGHTS_RELATORIO[categoria][pergunta];
        let feedback = valor <= 2 ? texto.baixo : valor <= 4 ? texto.medio : texto.alto;
        setAnalise(feedback);

        // Lógica de Recomendação Automática
        const valores = Object.values(novasNotas);
        const media = valores.reduce((a, b) => a + b, 0) / valores.length;
        setRecomendacaoAuto(media > 3.5 ? "Programa Crossfit" : "Programa Strong + Cardio");
    };

    async function salvarRelatorio() {
        const payload = { 
            categoria, 
            notas, 
            traducao: analise, 
            recomendacao_auto: recomendacaoAuto,
            recomendacao_manual: progManual 
        };
        const { error } = await supabase.from("agendamentos").update({ relatorio_vivencia: payload }).eq("id", id);
        if (!error) alert("Relatório salvo com sucesso!");
    }

    async function alterarStatus(novoStatus) {
        await supabase.from("agendamentos").update({ status: novoStatus }).eq("id", id);
        fetchDados();
    }

    const enviarRelatorioWhats = () => {
        let texto = `*RELATÓRIO TÉCNICO - KABUTO*%0A%0A`;
        texto += `*Aluno:* ${ag.aluno_nome}%0A`;
        texto += `*Avaliação:* ${categoria.toUpperCase()}%0A%0A`;
        
        // Adiciona notas que foram preenchidas
        Object.keys(notas).forEach(k => {
            if (notas[k] > 0) {
                const label = INSIGHTS_RELATORIO[categoria][k]?.label;
                texto += `- ${label}: ${notas[k]}/5%0A`;
            }
        });

        texto += `%0A*Análise do Coach:*%0A_${analise}_%0A%0A`;
        texto += `*PROGRAMA SUGERIDO:*%0A🚀 *${progManual || recomendacaoAuto}*`;

        window.open(linkWhatsApp(ag.aluno_whatsapp, texto), '_blank');
    };

    if (!ag) return <div className="p-20">Carregando ficha...</div>;

    const formRaw = ag.form_raw ? (typeof ag.form_raw === 'string' ? JSON.parse(ag.form_raw) : ag.form_raw) : {};

    return (
        <div className="dashboard-container">
            <header className="topbar-dashboard">
                <button onClick={() => navigate(-1)} className="link-voltar" style={{background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px'}}>
                    <ArrowLeft size={18} /> Voltar
                </button>
            </header>

            <section className="profile-header-card">
                <div className="profile-info">
                    <div>
                        <h1>{ag.aluno_nome}</h1>
                        <div className="profile-meta">
                            <Calendar size={14} /> {formatarDataBR(ag.data_aula)}
                            <span className="dot-separator">•</span>
                            <MessageCircle size={14} /> {ag.aluno_whatsapp}
                        </div>
                    </div>
                </div>
                <div className="profile-status">
                    <span className={`status-pill status-${ag.status}`}>{ag.status?.toUpperCase()}</span>
                </div>
            </section>

            <div className="dashboard-grid">
                {/* Coluna Esquerda: Questionário */}
                <div className="col-left">
                    <div className="card">
                        <h3><FileText size={18} /> Questionário Inicial</h3>
                        <div className="lista-detalhes-vertical">
                            {Object.entries(formRaw).map(([key, val]) => (
                                <div key={key} style={{marginBottom: '10px', padding: '8px', background: '#f8fafc', borderRadius: '8px'}}>
                                    <small style={{color: 'var(--primario)', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase'}}>{key}</small>
                                    <p style={{margin: 0, fontSize: '14px', fontWeight: '500'}}>{Array.isArray(val) ? val.join(', ') : val}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Coluna Central: Avaliação do Coach */}
                <div className="col-center">
                    <div className="card card-main-display">
                        <div className="card-header">
                            <h3><Dumbbell size={18} /> Avaliação Técnica</h3>
                            <div className="toggle-buttons">
                                <button className={`btn-toggle ${categoria === 'adulto' ? 'active' : ''}`} onClick={() => setCategoria('adulto')}>Adulto</button>
                                <button className={`btn-toggle ${categoria === 'kids' ? 'active' : ''}`} onClick={() => setCategoria('kids')}>Kids</button>
                            </div>
                        </div>

                        <div className="grid-notas">
                            {Object.keys(INSIGHTS_RELATORIO[categoria]).map(key => (
                                <div key={key} style={{marginBottom: '10px'}}>
                                    <label style={{fontSize: '12px', fontWeight: 'bold'}}>{INSIGHTS_RELATORIO[categoria][key].label}</label>
                                    <select 
                                        className="filtro__select"
                                        value={notas[key] || 0}
                                        onChange={(e) => handleNotaChange(key, e.target.value)}
                                    >
                                        {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}/5</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>

                        <textarea 
                            value={analise}
                            onChange={(e) => setAnalise(e.target.value)}
                            placeholder="Descreva a análise técnica do aluno..."
                            rows={4}
                            style={{width: '100%', borderRadius: '12px', padding: '12px', border: '1px solid #e2e8f0', fontFamily: 'inherit'}}
                        />

                        <div className="rec-box" style={{background: '#fffbeb', border: '1px solid #fef3c7', padding: '15px', borderRadius: '12px', marginTop: '15px'}}>
                            <p style={{margin: 0, fontSize: '11px', fontWeight: '800', color: '#92400e'}}>PROGRAMA SUGERIDO (MANUAL)</p>
                            <select 
                                className="filtro__select" 
                                style={{width: '100%', marginTop: '8px', fontWeight: 'bold', border: '1px solid #fde68a'}}
                                value={progManual || recomendacaoAuto}
                                onChange={(e) => setProgManual(e.target.value)}
                            >
                                <option value="">Selecione o programa...</option>
                                {PROGRAMAS_KABUTO.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <small style={{display:'block', marginTop:'5px', color:'#b45309'}}>Sugestão automática: {recomendacaoAuto}</small>
                        </div>

                        <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                            <button className="btn btn--primario" style={{flex: 1}} onClick={salvarRelatorio}>
                                <Save size={18} /> Salvar Ficha
                            </button>
                            <button className="btn btn--whatsapp" style={{flex: 1, backgroundColor: '#25d366', color: 'white'}} onClick={enviarRelatorioWhats}>
                                <Smartphone size={18} /> Enviar Relatório
                            </button>
                        </div>
                    </div>
                </div>

                {/* Coluna Direita: Gestão Admin */}
                <div className="col-right">
                    <div className="card highlight-card" style={{background: '#400c88', color: 'white'}}>
                        <h3>Gestão Admin</h3>
                        <div className="acoes-buttons-stack" style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                            <a href={linkWhatsApp(ag.aluno_whatsapp)} target="_blank" className="btn btn--whatsapp" style={{backgroundColor: '#25d366', color: 'white', textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: '10px'}}>
                                <MessageCircle size={18} /> WhatsApp Aluno
                            </a>
                            <div className="row-buttons" style={{display: 'flex', gap: '8px'}}>
                                <button className="btn btn--ok" style={{flex: 1, backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px', borderRadius: '10px'}} onClick={() => alterarStatus('confirmado')}>
                                    <CheckCircle size={16} /> Confirmar
                                </button>
                                <button className="btn btn--erro" style={{flex: 1, backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '10px', borderRadius: '10px'}} onClick={() => alterarStatus('faltou')}>
                                    <XCircle size={16} /> Faltou
                                </button>
                            </div>
                            
                            <label className="check-recepcao-styled" style={{display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '10px', cursor: 'pointer'}}>
                                <input 
                                    type="checkbox" 
                                    checked={ag.matriculado} 
                                    onChange={async (e) => {
                                        const val = e.target.checked;
                                        await supabase.from("agendamentos").update({ matriculado: val }).eq("id", id);
                                        fetchDados();
                                    }}
                                /> 
                                <span style={{fontSize: '13px', fontWeight: 'bold'}}>Aluno Matriculado?</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}