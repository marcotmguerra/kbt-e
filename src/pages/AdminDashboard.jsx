import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { linkWhatsApp } from '../utils/formatters';
// Adicionei o ícone Snowflake para o Lead Frio
import { Check, X, Smartphone, ClipboardList, Snowflake } from 'lucide-react';

export default function AdminDashboard() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [coaches, setCoaches] = useState([]);

  const TIPOS_AULA = [
    "Experimental",
    "Crossfit",
    "Strong",
    "Kids",
    "Cardio & Burn",
    "Hyrox"
  ];

  useEffect(() => {
    fetchDados();
  }, []);

  async function fetchDados() {
    const { data: ag } = await supabase
      .from("agendamentos")
      .select("*")
      .order("data_aula", { ascending: false });

    const { data: co } = await supabase
      .from("profiles")
      .select("id, nome")
      .eq("role", "professor");

    if (ag) setAgendamentos(ag);
    if (co) setCoaches(co);
  }

  async function updateField(id, field, value) {
    const { error } = await supabase
      .from("agendamentos")
      .update({ [field]: value })
      .eq("id", id);

    if (!error) {
      setAgendamentos(prev =>
        prev.map(a => a.id === id ? { ...a, [field]: value } : a)
      );
    }
  }

  const labelStyle = {
    fontSize: "11px",
    color: "#6b7280",
    marginBottom: "3px",
    textAlign: "center", // Centraliza o texto da label
    width: "100%"        // Garante que ocupe toda a largura para o alinhamento funcionar
  };

  const fieldStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center" // Isso centraliza os itens (botões/selects) horizontalmente
  };

  return (
    <section className="conteudo">
      <header className="topbar">
        <h2 className="topbar__titulo">Painel de Controle Rápido</h2>
      </header>

      <section className="tabela-card">
        <div className="tabela-scroll">
          <table className="tabela">
            <tbody>
              {agendamentos.map(ag => (
                <tr key={ag.id}>
                  <td colSpan="8">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                        padding: "20px",
                        background: "#fff",
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb"
                      }}
                    >
                      {/* LINHA 1 - ALUNO, TIPO, DATA */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                          gap: "16px",
                          alignItems: "center",
                          justifyItems: "stretch",
                        }}
                      >
                        <div style={fieldStyle}>
                          <span style={labelStyle}>Aluno</span>
                          <strong style={{ fontSize: "16px", fontWeight:600 }}>
                            {ag.aluno_nome}
                          </strong>
                          <a
                            href={linkWhatsApp(ag.aluno_whatsapp)}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: "flex",
                              gap: "6px",
                              fontSize: "12px",
                              color: "#25d366",
                              textDecoration: "none"
                            }}
                          >
                            <Smartphone size={14} />
                            {ag.aluno_whatsapp}
                          </a>
                        </div>

                        <div style={fieldStyle}>
                          <span style={labelStyle}>Tipo de aula</span>
                          <select
                            className="filtro__select"
                            value={ag.tipo_aula || ""}
                            onChange={(e) => updateField(ag.id, "tipo_aula", e.target.value)}
                          >
                            <option value="">Tipo...</option>
                            {TIPOS_AULA.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>

                        <div style={fieldStyle}>
                          <span style={labelStyle}>Data / Hora</span>
                          <input
                            type="datetime-local"
                            className="filtro__select"
                            value={ag.data_aula ? ag.data_aula.substring(0, 16) : ""}
                            onChange={(e) => updateField(ag.id, "data_aula", e.target.value)}
                          />
                        </div>
                      </div>

                      {/* LINHA 2 - COACH, STATUS, CHECKBOXES */}
                      <div
                        style={{
                          display: "grid",
                          // Ajustei o grid para acomodar o novo botão
                          gridTemplateColumns: "1.2fr 1.8fr 0.8fr 0.8fr auto",
                          justifyItems: "stretch",
                          gap: "16px",
                          alignItems: "center"
                        }}
                      >
                        <div style={fieldStyle}>
                          <span style={labelStyle}>Coach</span>
                          <select
                            className="select-prof"
                            value={ag.professor_id || ""}
                            onChange={(e) => updateField(ag.id, "professor_id", e.target.value)}
                          >
                            <option value="">Selecionar</option>
                            {coaches.map(c => (
                              <option key={c.id} value={c.id}>{c.nome}</option>
                            ))}
                          </select>
                        </div>

                        {/* STATUS: PRESENÇA / LEAD FRIO */}
                        <div style={fieldStyle}>
                          <span style={labelStyle}>Status do Atendimento</span>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              title="Confirmado"
                              onClick={() => updateField(ag.id, "status", "confirmado")}
                              style={{
                                background: ag.status === "confirmado" ? "#16a34a" : "#f1f5f9",
                                color: ag.status === "confirmado" ? "#fff" : "#000",
                                padding: "10px",
                                borderRadius: "8px",
                                border: "none",
                                cursor: "pointer"
                              }}
                            >
                              <Check size={16} />
                            </button>

                            <button
                              title="Faltou"
                              onClick={() => updateField(ag.id, "status", "faltou")}
                              style={{
                                background: ag.status === "faltou" ? "#ef4444" : "#f1f5f9",
                                color: ag.status === "faltou" ? "#fff" : "#000",
                                padding: "10px",
                                borderRadius: "8px",
                                border: "none",
                                cursor: "pointer"
                              }}
                            >
                              <X size={16} />
                            </button>

                            {/* NOVO BOTÃO: LEAD FRIO */}
                            <button
                              onClick={() => updateField(ag.id, "status", "lead_frio")}
                              style={{
                                background: ag.status === "lead_frio" ? "#3b82f6" : "#f1f5f9",
                                color: ag.status === "lead_frio" ? "#fff" : "#000",
                                padding: "10px 14px",
                                borderRadius: "8px",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "12px",
                                fontWeight: "600"
                              }}
                            >
                              <Snowflake size={14} />
                              Lead Frio
                            </button>
                          </div>
                        </div>

                        <div style={fieldStyle}>
                          <span style={labelStyle}>Recepção?</span>
                          <input
                            type="checkbox"
                            checked={ag.levou_recepcao || false}
                            onChange={(e) => updateField(ag.id, "levou_recepcao", e.target.checked)}
                            style={{ width: "20px", height: "20px" }}
                          />
                        </div>

                        <div style={fieldStyle}>
                          <span style={labelStyle}>Matrícula</span>
                          <input
                            type="checkbox"
                            checked={ag.matriculado || false}
                            onChange={(e) => updateField(ag.id, "matriculado", e.target.checked)}
                            style={{ width: "20px", height: "20px", accentColor: "#400c88" }}
                          />
                        </div>

                        <div style={fieldStyle}>
                          <span style={labelStyle}>Ficha</span>
                          <a
                            href={`/admin/detalhe/${ag.id}`}
                            className="icon-btn"
                            style={{
                              background: "#400c88",
                              color: "#fff",
                              padding: "10px",
                              borderRadius: "8px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <ClipboardList size={18} />
                          </a>
                        </div>
                      </div>
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