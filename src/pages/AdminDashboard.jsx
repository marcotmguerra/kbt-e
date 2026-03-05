import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { formatarDataBR, linkWhatsApp } from '../utils/formatters';
import { Check, X, UserCheck, Smartphone, GraduationCap, ClipboardList, Save } from 'lucide-react';

export default function AdminDashboard() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const TIPOS_AULA = ["Experimental", "Crossfit", "Strong", "Kids", "Cardio & Burn", "Hyrox"];

  useEffect(() => { fetchDados(); }, []);

  async function fetchDados() {
    const { data: ag } = await supabase.from("agendamentos").select("*").order("data_aula", { ascending: false });
    const { data: co } = await supabase.from("profiles").select("id, nome").eq("role", "professor");
    if (ag) setAgendamentos(ag);
    if (co) setCoaches(co);
  }

  // FUNÇÃO MÁGICA: Atualiza qualquer campo instantaneamente
  async function updateField(id, field, value) {
    const { error } = await supabase.from("agendamentos").update({ [field]: value }).eq("id", id);
    if (!error) {
      setAgendamentos(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
    }
  }

  return (
    <section className="conteudo">
      <header className="topbar">
        <h2 className="topbar__titulo">Painel de Controle Rápido</h2>
      </header>

      <section className="tabela-card">
        <div className="tabela-scroll">
          <table className="tabela">
            <thead>
              <tr>
                <th>Aluno / WhatsApp</th>
                <th>Tipo de Aula</th>
                <th>Data / Hora</th>
                <th>Professor</th>
                <th>Presença</th>
                <th>Recepção</th>
                <th>Matriculado</th>
                <th>Ficha</th>
              </tr>
            </thead>
            <tbody>
              {agendamentos.map(ag => (
                <tr key={ag.id}>
                  {/* ALUNO E WHATSAPP */}
                  <td>
                    <strong>{ag.aluno_nome}</strong>
                    <a href={linkWhatsApp(ag.aluno_whatsapp)} target="_blank" style={{display:'flex', gap:'5px', fontSize:'11px', color:'#25d366', textDecoration:'none'}}>
                       <Smartphone size={12}/> {ag.aluno_whatsapp}
                    </a>
                  </td>

                  {/* SELECIONAR TIPO DE AULA */}
                  <td>
                    <select 
                      className="filtro__select" 
                      value={ag.tipo_aula || ''} 
                      onChange={(e) => updateField(ag.id, 'tipo_aula', e.target.value)}
                    >
                      <option value="">Tipo...</option>
                      {TIPOS_AULA.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>

                  {/* ALTERAR DATA DIRETAMENTE */}
                  <td>
                    <input 
                      type="datetime-local" 
                      className="filtro__select"
                      value={ag.data_aula ? ag.data_aula.substring(0, 16) : ''}
                      onChange={(e) => updateField(ag.id, 'data_aula', e.target.value)}
                    />
                  </td>

                  {/* ATRIBUIR PROFESSOR */}
                  <td>
                    <select 
                      className="select-prof" 
                      value={ag.professor_id || ''} 
                      onChange={(e) => updateField(ag.id, 'professor_id', e.target.value)}
                    >
                      <option value="">Coach...</option>
                      {coaches.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </td>

                  {/* PRESENÇA (BOTOES RAPIDOS) */}
                  <td>
                    <div style={{display:'flex', gap:'5px'}}>
                      <button 
                        onClick={() => updateField(ag.id, 'status', 'confirmado')}
                        style={{background: ag.status === 'confirmado' ? '#16a34a' : '#f0f2f4', color: ag.status === 'confirmado' ? '#fff' : '#000', padding:'5px', borderRadius:'8px', border:'none', cursor:'pointer'}}
                      > <Check size={16}/> </button>
                      
                      <button 
                        onClick={() => updateField(ag.id, 'status', 'faltou')}
                        style={{background: ag.status === 'faltou' ? '#ef4444' : '#f0f2f4', color: ag.status === 'faltou' ? '#fff' : '#000', padding:'5px', borderRadius:'8px', border:'none', cursor:'pointer'}}
                      > <X size={16}/> </button>
                    </div>
                  </td>

                  {/* LEVOU NA RECEPÇÃO */}
                  <td style={{textAlign:'center'}}>
                    <input 
                      type="checkbox" 
                      checked={ag.levou_recepcao || false} 
                      onChange={(e) => updateField(ag.id, 'levou_recepcao', e.target.checked)}
                      style={{width:'20px', height:'20px'}}
                    />
                  </td>

                  {/* MATRICULADO */}
                  <td style={{textAlign:'center'}}>
                    <input 
                      type="checkbox" 
                      checked={ag.matriculado || false} 
                      onChange={(e) => updateField(ag.id, 'matriculado', e.target.checked)}
                      style={{width:'20px', height:'20px', accentColor:'#400c88'}}
                    />
                  </td>

                  {/* LINK FICHA */}
                  <td>
                    <a href={`/admin/detalhe/${ag.id}`} className="icon-btn" style={{background:'#400c88', color:'#fff'}}>
                      <ClipboardList size={18}/>
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