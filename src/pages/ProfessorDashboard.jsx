import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Search, LogOut, RefreshCw, LayoutDashboard, Repeat2, Users, Settings, Clock, ChevronRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function ProfessorDashboard() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [professor, setProfessor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    // 1. Pega usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setProfessor(user.user_metadata?.nome || 'Coach');
      fetchAulas(user.id);
    }
  }

  async function fetchAulas(profId) {
    setLoading(true);
    const { data, error } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('professor_id', profId) // Filtra apenas as aulas DESTE coach
      .order('data_aula', { ascending: true });

    if (!error) setAgendamentos(data || []);
    setLoading(false);
  }

  const handleSair = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Lógica de filtro (computada em tempo real)
  const filtrados = agendamentos.filter(ag => {
    const matchBusca = ag.aluno_nome.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'todos' || ag.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  return (
    <div className="professor-layout" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '80px' }}>
      <header className="topbar-prof">
        <div className="topbar-prof__esquerda">
          <div className="marca">
            <div className="marca__icone">
              <img src="/img/KBT_logo2.png" alt="Logo KBT" className="logo-icon" />
            </div>
            <h2 className="marca__titulo">Painel do Coach</h2>
          </div>

          <div className="busca busca--desktop">
            <Search size={18} className="busca__icone" />
            <input 
              className="busca__input" 
              type="search" 
              placeholder="Buscar alunos..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>

        <div className="topbar-prof__direita">
          <button onClick={handleSair} className="btn-sair" type="button">
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </header>

      <main className="pagina-prof">
        <div className="pagina-prof__conteudo">
          <section className="cabecalho-prof">
            <div className="cabecalho-prof__texto">
              <h5 className="cabecalho-prof__titulo" style={{ fontSize: '20px', margin: 0 }}>Olá, {professor}</h5>
              <p className="cabecalho-prof__subtitulo">
                Você tem <strong>{filtrados.length}</strong> aulas experimentais.
              </p>
            </div>

            <div className="cabecalho-prof__acoes">
              <label className="filtro">
                <span>Status</span>
                <select 
                  className="filtro__select"
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="atribuido">Atribuído</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="faltou">Faltou</option>
                </select>
              </label>

              <button className="btn btn--primario" onClick={() => fetchUserData()}>
                <RefreshCw size={18} />
              </button>
            </div>
          </section>

          <section className="grade-cards" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
            {loading ? (
              <p className="vazio">Carregando sua agenda...</p>
            ) : filtrados.length === 0 ? (
              <p className="vazio">Nenhuma aula encontrada.</p>
            ) : (
              filtrados.map(ag => (
                <div 
                  key={ag.id} 
                  className="card-aluno" 
                  onClick={() => navigate(`/professor/detalhe/${ag.id}`)}
                  style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    borderLeft: ag.status === 'confirmado' ? '5px solid #16a34a' : '5px solid #400c88',
                    transition: 'transform 0.2s'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '16px', color: '#1e293b', display: 'block', marginBottom: '4px' }}>
                      {ag.aluno_nome}
                    </strong>
                    <div style={{ display: 'flex', gap: '12px', color: '#64748b', fontSize: '13px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} /> 
                        {new Date(ag.data_aula).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>•</span>
                      <span>{ag.tipo_aula}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ 
                        fontSize: '11px', 
                        fontWeight: '800', 
                        padding: '4px 10px', 
                        borderRadius: '20px',
                        background: ag.status === 'confirmado' ? '#dcfce7' : '#f1f5f9',
                        color: ag.status === 'confirmado' ? '#166534' : '#475569'
                    }}>
                      {ag.status?.toUpperCase()}
                    </span>
                    <ChevronRight size={18} color="#cbd5e1" />
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      </main>

      {/* Barra de Navegação Mobile */}
      <nav className="nav-mobile">
        <Link className="nav-mobile__item nav-mobile__item--ativo" to="/professor">
          <LayoutDashboard size={22} /><span>Agenda</span>
        </Link>
        <Link className="nav-mobile__item" to="/professor/relatorios">
          <Repeat2 size={22} /><span>Fichas</span>
        </Link>
        <Link className="nav-mobile__item" to="/professor/alunos">
          <Users size={22} /><span>Alunos</span>
        </Link>
        <Link className="nav-mobile__item" to="/professor/config">
          <Settings size={22} /><span>Perfil</span>
        </Link>
      </nav>
    </div>
  );
}