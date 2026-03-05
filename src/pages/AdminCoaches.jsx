import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserMinus, 
  ShieldCheck, 
  Trash2,
  RefreshCw
} from 'lucide-react';

export default function AdminCoaches() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoaches();
  }, []);

  async function fetchCoaches() {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("nome", { ascending: true });

    if (!error) setCoaches(data);
    setLoading(false);
  }

  // FUNÇÃO: Autorizar o acesso (Tornar Ativo)
  async function handleAutorizar(id) {
    if (!confirm("Deseja aprovar este professor?")) return;

    const { error } = await supabase
      .from("profiles")
      .update({ ativo: true })
      .eq("id", id);

    if (error) alert("Erro ao autorizar");
    else fetchCoaches();
  }

  // FUNÇÃO: Mudar o cargo (Admin vs Professor)
  async function handleMudarRole(id, novaRole) {
    const { error } = await supabase
      .from("profiles")
      .update({ role: novaRole })
      .eq("id", id);

    if (error) alert("Erro ao mudar cargo");
    else fetchCoaches();
  }

  // FUNÇÃO: Remover Coach
  async function handleDeletar(id) {
    if (!confirm("Remover permanentemente este registro?")) return;

    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (error) alert("Erro ao deletar");
    else fetchCoaches();
  }

  return (
    <section className="conteudo">
      <header className="topbar">
        <h2 className="topbar__titulo">Gestão da Equipe</h2>
        <div className="topbar__direita">
          <button className="btn btn--primario" onClick={() => alert("Envie o link de cadastro ao professor")}>
            <UserPlus size={18} /> Convidar Coach
          </button>
        </div>
      </header>

      {/* Stats Card */}
      <div className="stats">
        <article className="stat-card">
          <div className="stat-card__topo">
            <p className="stat-card__label">Total de Coaches</p>
            <Users className="stat-card__icone" />
          </div>
          <div className="stat-card__valor">
            <span className="stat-card__numero">{coaches.length}</span>
          </div>
        </article>
      </div>

      <div className="secao-topo">
        <h3 className="secao-titulo">Coaches Ativos e Pendentes</h3>
        <button className="btn btn--secundario" onClick={fetchCoaches}>
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="tabela-card">
        <div className="tabela-scroll">
          <table className="tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Status / Cargo</th>
                <th className="tabela__acao">Ações</th>
              </tr>
            </thead>
            <tbody>
              {coaches.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="aluno">
                      <span className="aluno__nome">{p.nome}</span>
                      <span className="aluno__sub">{p.email}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {/* Badge de Ativo/Pendente */}
                      <span className={`pill ${p.ativo ? 'badge--ok' : 'badge--erro'}`} 
                            style={{ width: 'fit-content' }}>
                        {p.ativo ? 'ATIVO' : 'PENDENTE'}
                      </span>
                      
                      {/* Select de Cargo */}
                      <select 
                        className="filtro__select" 
                        style={{ padding: '4px', fontSize: '12px', minWidth: '120px' }}
                        value={p.role} 
                        onChange={(e) => handleMudarRole(p.id, e.target.value)}
                      >
                        <option value="professor">Professor</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                  </td>
                  <td className="tabela__acao">
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      {!p.ativo && (
                        <button 
                          onClick={() => handleAutorizar(p.id)}
                          className="btn btn--primario"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          title="Autorizar Acesso"
                        >
                          <UserCheck size={16} /> Aprovar
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleDeletar(p.id)}
                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                        title="Remover Coach"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {coaches.length === 0 && !loading && (
                <tr><td colSpan="3" className="tabela__vazio">Nenhum coach cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}