import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title 
} from 'chart.js';
import { Doughnut, Bar, Pie } from 'react-chartjs-2';
import { ChartLine, FileDown, Calendar, Users, Activity } from 'lucide-react';

// Registrar componentes do ChartJS
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function AdminReports() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [mesRelatorio, setMesRelatorio] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDados();
  }, []);

  async function fetchDados() {
    setLoading(true);
    const { data, error } = await supabase.from("agendamentos").select("*");
    if (!error) setAgendamentos(data);
    setLoading(false);
  }

  // --- HELPER: BUSCA NO FORM_RAW (Sua lógica original portadora) ---
  const buscarNoForm = (formRaw, termos) => {
    if (!formRaw) return null;
    const obj = typeof formRaw === 'string' ? JSON.parse(formRaw) : formRaw;
    const chaveEncontrada = Object.keys(obj).find(k => 
      termos.some(t => k.toLowerCase().includes(t.toLowerCase()))
    );
    return chaveEncontrada ? obj[chaveEncontrada] : null;
  };

  // --- PROCESSAMENTO DE DADOS (REATIVO) ---
  const stats = useMemo(() => {
    const filtrados = agendamentos.filter(a => a.data_aula?.split('-')[1] === mesRelatorio);
    const confirmados = filtrados.filter(a => a.status === 'confirmado').length;

    const dados = {
      totalMes: filtrados.length,
      taxaPresenca: filtrados.length > 0 ? Math.round((confirmados / filtrados.length) * 100) : 0,
      programas: {},
      sexo: { Masculino: 0, Feminino: 0, Outros: 0 },
      idades: { "0-3a": 0, "4-6a": 0, "7-10a": 0, "11-13a": 0, "14-17a": 0, "18-35a": 0, "36a+": 0 },
      origem: {}
    };

    filtrados.forEach(a => {
      // Programas
      const prog = a.tipo_aula || "Experimental";
      dados.programas[prog] = (dados.programas[prog] || 0) + 1;

      if (a.form_raw) {
        // Gênero
        const gen = buscarNoForm(a.form_raw, ['sexo', 'gênero', 'genero'])?.toString().toLowerCase();
        if (gen?.startsWith('m')) dados.sexo.Masculino++;
        else if (gen?.startsWith('f')) dados.sexo.Feminino++;
        else dados.sexo.Outros++;

        // Idade
        const idade = parseInt(buscarNoForm(a.form_raw, ['idade', 'nascimento', 'anos']));
        if (idade <= 3) dados.idades["0-3a"]++;
        else if (idade <= 6) dados.idades["4-6a"]++;
        else if (idade <= 10) dados.idades["7-10a"]++;
        else if (idade <= 13) dados.idades["11-13a"]++;
        else if (idade <= 17) dados.idades["14-17a"]++;
        else if (idade <= 35) dados.idades["18-35a"]++;
        else if (idade > 35) dados.idades["36a+"]++;

        // Origem
        const ori = buscarNoForm(a.form_raw, ['conheceu'])?.toString().trim();
        if (ori) dados.origem[ori] = (dados.origem[ori] || 0) + 1;
      }
    });

    return dados;
  }, [agendamentos, mesRelatorio]);

  // --- CONFIGURAÇÃO DOS GRÁFICOS ---
  const cores = ['#400c88', '#16a34a', '#ef4444', '#f59e0b', '#137fec', '#8b5cf6'];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }
  };

  return (
    <section className="conteudo">
      <header className="topbar">
        <h2 className="topbar__titulo">Relatórios Estratégicos</h2>
        <div className="topbar__direita">
          <button className="btn btn--primario" onClick={() => window.print()}>
            <FileDown size={18} /> Exportar PDF
          </button>
        </div>
      </header>

      {/* Cards de Resumo */}
      <div className="stats">
        <article className="stat-card">
          <div className="stat-card__topo">
            <p className="stat-card__label">Aulas no Mês</p>
            <Calendar size={20} className="stat-card__icone" />
          </div>
          <div className="stat-card__valor">
            <span className="stat-card__numero">{stats.totalMes}</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-card__topo">
            <p className="stat-card__label">Taxa de Presença</p>
            <Activity size={20} className="stat-card__icone" />
          </div>
          <div className="stat-card__valor">
            <span className="stat-card__numero">{stats.taxaPresenca}%</span>
          </div>
        </article>
      </div>

      {/* Filtro de Mês */}
      <div className="secao-topo">
        <label className="filtro">
          <span>Mês de Análise</span>
          <select 
            className="filtro__select" 
            value={mesRelatorio} 
            onChange={e => setMesRelatorio(e.target.value)}
          >
            {["01","02","03","04","05","06","07","08","09","10","11","12"].map((m, i) => (
              <option key={m} value={m}>
                {["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][i]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Grid de Gráficos */}
      <div className="grid-relatorios" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        
        <div className="chart-container" style={{ background: '#fff', padding: '20px', borderRadius: '16px', height: '350px' }}>
          <p className="stat-card__label">Aulas por Programa</p>
          <Bar 
            options={chartOptions} 
            data={{
              labels: Object.keys(stats.programas),
              datasets: [{ label: 'Aulas', data: Object.values(stats.programas), backgroundColor: '#400c88' }]
            }} 
          />
        </div>

        <div className="chart-container" style={{ background: '#fff', padding: '20px', borderRadius: '16px', height: '350px' }}>
          <p className="stat-card__label">Distribuição por Sexo</p>
          <Doughnut 
            options={chartOptions} 
            data={{
              labels: Object.keys(stats.sexo),
              datasets: [{ data: Object.values(stats.sexo), backgroundColor: cores }]
            }} 
          />
        </div>

        <div className="chart-container" style={{ background: '#fff', padding: '20px', borderRadius: '16px', height: '350px' }}>
          <p className="stat-card__label">Faixa Etária</p>
          <Pie 
            options={chartOptions} 
            data={{
              labels: Object.keys(stats.idades),
              datasets: [{ data: Object.values(stats.idades), backgroundColor: cores }]
            }} 
          />
        </div>

        <div className="chart-container" style={{ background: '#fff', padding: '20px', borderRadius: '16px', height: '350px' }}>
          <p className="stat-card__label">Como nos conheceu?</p>
          <Bar 
            options={{ ...chartOptions, indexAxis: 'y' }} 
            data={{
              labels: Object.keys(stats.origem),
              datasets: [{ label: 'Indicações', data: Object.values(stats.origem), backgroundColor: '#16a34a' }]
            }} 
          />
        </div>

      </div>
    </section>
  );
}