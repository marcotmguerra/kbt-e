import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { formatarDataBR } from '../utils/formatters';
import { 
  Search, 
  Calendar, 
  TrendingUp, 
  Download, 
  RotateCcw, 
  Eye, 
  CalendarDays,
  CalendarCheck
} from 'lucide-react';

export default function AdminAgenda() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados dos Filtros
  const [busca, setBusca] = useState('');
  const [filtroMes, setFiltroMes] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [filtroCoach, setFiltroCoach] = useState('todos');
  const [filtroMatricula, setFiltroMatricula] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('ativos');

  useEffect(() => {
    fetchDados();
  }, []);

  async function fetchDados() {
    setLoading(true);
    const [resAg, resCo] = await Promise.all([
      supabase.from("agendamentos").select("*, profiles(nome)").order("data_aula", { ascending: false }),
      supabase.from("profiles").select("id, nome").eq("role", "professor")
    ]);

    if (!resAg.error) setAgendamentos(resAg.data);
    if (!resCo.error) setCoaches(resCo.data);
    setLoading(false);
  }

  // --- LÓGICA DE FILTRAGEM (REATIVA) ---
  const dadosFiltrados = useMemo(() => {
    return agendamentos.filter(item => {
      const matchesBusca = item.aluno_nome?.toLowerCase().includes(busca.toLowerCase());
      const mesAula = item.data_aula.split('-')[1]; 
      const matchesMes = filtroMes === "todos" || mesAula === filtroMes;
      const matchesCoach = filtroCoach === "todos" || item.professor_id === filtroCoach;
      
      let matchesStatus = true;
      if (filtroStatus === "ativos") matchesStatus = item.status !== "lead_frio";
      else if (filtroStatus === "lead_frio") matchesStatus = item.status === "lead_frio";

      let matchesMatricula = true;
      if (filtroMatricula === "sim") matchesMatricula = item.matriculado === true;
      if (filtroMatricula === "nao") matchesMatricula = item.matriculado === false;

      return matchesBusca && matchesMes && matchesCoach && matchesMatricula && matchesStatus;
    });
  }, [agendamentos, busca, filtroMes, filtroCoach, filtroMatricula, filtroStatus]);

  // --- CÁLCULO DE ESTATÍSTICAS (CARDS) ---
  const stats = useMemo(() => {
    const hoje = new Date();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay()); // Domingo
    
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 7);

    const totalMes = agendamentos.filter(ag => ag.data_aula.split('-')[1] === filtroMes).length;
    const totalSemana = agendamentos.filter(ag => {
      const d = new Date(ag.data_aula);
      return d >= inicioSemana && d <= fimSemana;
    }).length;

    return { totalMes, totalSemana };
  }, [agendamentos, filtroMes]);

  // --- AÇÕES ---
  async function reativarAluno(id) {
    if (!confirm("Reativar este aluno?")) return;
    const { error } = await supabase.from("agendamentos").update({ status: "pendente" }).eq("id", id);
    if (!error) fetchDados();
  }

  function exportarCSV() {
    let csv = "Data;Aluno;Coach;Status;Matriculado\n";
    dadosFiltrados.forEach(item => {
      csv += `${formatarDataBR(item.data_aula)};${item.aluno_nome};${item.profiles?.nome || 'N/A'};${item.status};${item.matriculado ? 'Sim' : 'Não'}\n`;
    });
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `agenda_sae_${filtroMes}.csv`);
    link.click();
  }

  const mesesNomes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  return (
    <section className="conteudo">
      <header className="topbar">
        <div className="topbar__esquerda">
          <h2 className="topbar__titulo">Agenda e Histórico</h2>
          <div className="busca">
            <Search className="busca__icone" size={18} />
            <input 
              className="busca__input" 
              type="search" 
              placeholder="Buscar aluno..." 
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
        </div>
        <button className="btn btn--secundario" onClick={exportarCSV}>
          <Download size={18} /> Exportar
        </button>
      </header>

      {/* Cards de Resumo */}
      <div className="stats">
        <article className="stat-card">
          <div className="stat-card__topo">
            <p className="stat-card__label">Total do Mês</p>
            <CalendarDays className="stat-card__icone" />
          </div>
          <div className="stat-card__valor">
            <span className="stat-card__numero">{stats.totalMes}</span>
            <span className="stat-card__chip">{filtroMes !== 'todos' ? mesesNomes[parseInt(filtroMes)-1] : 'Total'}</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-card__topo">
            <p className="stat-card__label">Nesta Semana</p>
            <CalendarCheck className="stat-card__icone" />
          </div>
          <div className="stat-card__valor">
            <span className="stat-card__numero">{stats.totalSemana}</span>
            <span className="stat-card__chip stat-card__chip--ok">Próximos 7 dias</span>
          </div>
        </article>
      </div>

      {/* Filtros */}
      <div className="secao-topo">
        <div className="secao-acoes">
          <label className="filtro">
            <span>Mês</span>
            <select className="filtro__select" value={filtroMes} onChange={e => setFiltroMes(e.target.value)}>
              <option value="todos">Todos</option>
              {mesesNomes.map((n, i) => (
                <option key={i} value={String(i + 1).padStart(2, '0')}>{n}</option>
              ))}
            </select>
          </label>

          <label className="filtro">
            <span>Coach</span>
            <select className="filtro__select" value={filtroCoach} onChange={e => setFiltroCoach(e.target.value)}>
              <option value="todos">Todos</option>
              {coaches.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </label>

          <label className="filtro">
            <span>Venda</span>
            <select className="filtro__select" value={filtroMatricula} onChange={e => setFiltroMatricula(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="sim">Matriculados</option>
              <option value="nao">Não Matriculados</option>
            </select>
          </label>

          <label className="filtro">
            <span>Status</span>
            <select className="filtro__select" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
              <option value="ativos">Ativos</option>
              <option value="lead_frio">Leads Frios</option>
              <option value="todos">Todos</option>
            </select>
          </label>
        </div>
      </div>

      {/* Tabela de Resultados */}
      <section className="tabela-card">
        <div className="tabela-scroll">
          <table className="tabela">
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Aluno</th>
                <th>Coach</th>
                <th>Status</th>
                <th>Matrícula</th>
                <th className="tabela__acao">Ações</th>
              </tr>
            </thead>
            <tbody>
              {dadosFiltrados.map(ag => (
                <tr key={ag.id}>
                  <td>{formatarDataBR(ag.data_aula)}</td>
                  <td>
                    <div className="aluno">
                      <strong>{ag.aluno_nome}</strong>
                      {ag.responsavel_nome && <small>RESP: {ag.responsavel_nome}</small>}
                    </div>
                  </td>
                  <td>{ag.profiles?.nome || <em style={{color: '#999'}}>Não atribuído</em>}</td>
                  <td>
                    <span className={`status-pill status-${ag.status}`}>{ag.status}</span>
                  </td>
                  <td>{ag.matriculado ? '✅ Sim' : '❌ Não'}</td>
                  <td className="tabela__acao">
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <a href={`/admin/detalhe/${ag.id}`} className="icon-btn">
                        <Eye size={18} />
                      </a>
                      {ag.status === 'lead_frio' && (
                        <button onClick={() => reativarAluno(ag.id)} className="icon-btn" title="Reativar">
                          <RotateCcw size={18} color="#16a34a" />
                        </button>
                      )}
                    </div>
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