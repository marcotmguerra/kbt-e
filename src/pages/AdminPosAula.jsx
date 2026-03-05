import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { formatarDataBR, linkWhatsApp } from '../utils/formatters';
import { 
  Search, 
  RefreshCw, 
  MessageCircle, 
  Star, 
  Archive, 
  Eye, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function AdminPosAula() {
  const [alunos, setAlunos] = useState([]);
  const [busca, setBusca] = useState('');
  const [filtroMes, setFiltroMes] = useState('todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlunos();
  }, []);

  async function fetchAlunos() {
    setLoading(true);
    // Busca alunos confirmados, que faltaram ou atribuídos (que já passaram da data)
    const { data, error } = await supabase
      .from("agendamentos")
      .select("*")
      .in("status", ["confirmado", "faltou", "atribuido"])
      .eq("arquivado", false)
      .order("data_aula", { ascending: false });

    if (!error) setAlunos(data);
    setLoading(false);
  }

  // Ação: Arquivar Aluno (Concluir processo)
  async function handleArquivar(id) {
    if (!confirm("Concluir e arquivar este aluno?")) return;
    
    const { error } = await supabase
      .from("agendamentos")
      .update({ arquivado: true })
      .eq("id", id);

    if (!error) {
      setAlunos(prev => prev.filter(a => a.id !== id));
    }
  }

  // Ação: Enviar WhatsApp e marcar como enviado
  async function handleEnviarMensagem(aluno, tipo) {
    const msg = tipo === 'avaliacao' 
      ? `Olá, ${aluno.aluno_nome}! O que achou da sua aula experimental na Kabuto?` 
      : `Olá, ${aluno.aluno_nome}! Segue o link do nosso questionário pós-aula: https://docs.google.com/forms/...`;
    
    // Abre o WhatsApp
    window.open(linkWhatsApp(aluno.aluno_whatsapp, msg), '_blank');
    
    // Atualiza o banco de dados
    const update = tipo === 'avaliacao' ? { avaliacao_enviada: true } : { feedback_enviado: true };
    const { error } = await supabase.from("agendamentos").update(update).eq("id", aluno.id);

    if (!error) {
      // Atualiza o estado local para mudar a cor do botão na hora
      setAlunos(prev => prev.map(a => a.id === aluno.id ? { ...a, ...update } : a));
    }
  }

  // Filtragem
  const alunosFiltrados = alunos.filter(a => {
    const matchesBusca = a.aluno_nome.toLowerCase().includes(busca.toLowerCase());
    const mesAula = a.data_aula.split('-')[1];
    const matchesMes = filtroMes === 'todos' || mesAula === filtroMes;
    return matchesBusca && matchesMes;
  });

  // Cálculos de Stats
  const pendentes = alunosFiltrados.filter(a => !a.avaliacao_enviada || !a.feedback_enviado).length;
  const matriculados = alunosFiltrados.filter(a => a.matriculado).length;
  const taxaConversao = alunosFiltrados.length > 0 
    ? Math.round((matriculados / alunosFiltrados.length) * 100) 
    : 0;

  return (
    <section className="conteudo">
      <header className="topbar">
        <div className="topbar__esquerda">
          <h2 className="topbar__titulo">Gestão Pós-Aula</h2>
          <div className="busca">
            <Search className="busca__icone" size={18} />
            <input 
              className="busca__input" 
              type="search" 
              placeholder="Buscar aluno..." 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Cards de Resumo */}
      <div className="stats">
        <article className="stat-card">
          <div className="stat-card__topo">
            <p className="stat-card__label">Aguardando Contato</p>
            <AlertCircle className="stat-card__icone" style={{ color: '#ef4444' }} />
          </div>
          <div className="stat-card__valor">
            <span className="stat-card__numero">{pendentes}</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-card__topo">
            <p className="stat-card__label">Conversão de Vendas</p>
            <CheckCircle2 className="stat-card__icone" style={{ color: '#16a34a' }} />
          </div>
          <div className="stat-card__valor">
            <span className="stat-card__numero">{taxaConversao}%</span>
          </div>
        </article>
      </div>

      <div className="secao-topo">
        <h3 className="secao-titulo">Alunos que finalizaram a aula</h3>
        <div className="secao-acoes">
          <select 
            className="filtro__select" 
            value={filtroMes} 
            onChange={e => setFiltroMes(e.target.value)}
          >
            <option value="todos">Todos os meses</option>
            <option value="01">Janeiro</option>
            <option value="02">Fevereiro</option>
            {/* ... adicionar outros meses ... */}
            <option value="12">Dezembro</option>
          </select>
          <button className="btn btn--primario" onClick={fetchAlunos}>
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <section className="tabela-card">
        <div className="tabela-scroll">
          <table className="tabela">
            <thead>
              <tr>
                <th>Aluno / Data</th>
                <th>Presença</th>
                <th>Ações de Contato</th>
                <th>Concluir</th>
                <th className="tabela__acao">Ficha</th>
              </tr>
            </thead>
            <tbody>
              {alunosFiltrados.map(aluno => (
                <tr key={aluno.id}>
                  <td>
                    <div className="aluno">
                      <span className="aluno__nome">{aluno.aluno_nome}</span>
                      <span className="aluno__sub">{formatarDataBR(aluno.data_aula)}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill status-${aluno.status}`}>{aluno.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className={`btn-wpp ${aluno.avaliacao_enviada ? 'btn-wpp--enviado' : ''}`}
                        onClick={() => handleEnviarMensagem(aluno, 'avaliacao')}
                        title="Enviar Avaliação"
                      >
                        <Star size={16} />
                      </button>
                      <button 
                        className={`btn-wpp ${aluno.feedback_enviado ? 'btn-wpp--enviado' : ''}`}
                        onClick={() => handleEnviarMensagem(aluno, 'feedback')}
                        title="Enviar Questionário"
                      >
                        <MessageCircle size={16} />
                      </button>
                    </div>
                  </td>
                  <td>
                    <button className="icon-btn" onClick={() => handleArquivar(aluno.id)}>
                      <Archive size={18} />
                    </button>
                  </td>
                  <td className="tabela__acao">
                    <a href={`/admin/detalhe/${aluno.id}`} className="icon-btn" style={{ background: '#400c88', color: 'white' }}>
                      <Eye size={18} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}