import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { 
  Chart as ChartJS, 
  ArcElement, Tooltip, Legend, CategoryScale, 
  LinearScale, BarElement, Title, PointElement, LineElement 
} from 'chart.js';
import { Doughnut, Bar, Pie } from 'react-chartjs-2';
import { FileDown, Calendar, Activity, Users, Target, TrendingUp, TrendingDown, PieChart as PieIcon } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement);

// Enum para Filtro de Público
const PUBLICO_ALVO = {
  TODOS: 'todos',
  ADULTO: 'adulto',
  KIDS: 'kids'
};

export default function AdminReports() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [mesRelatorio, setMesRelatorio] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [filtroPublico, setFiltroPublico] = useState(PUBLICO_ALVO.TODOS);
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

  const buscarNoForm = (formRaw, termos) => {
    if (!formRaw) return null;
    const obj = typeof formRaw === 'string' ? JSON.parse(formRaw) : formRaw;
    const chaveEncontrada = Object.keys(obj).find(k =>
      termos.some(t => k.toLowerCase().includes(t.toLowerCase()))
    );
    return chaveEncontrada ? obj[chaveEncontrada] : null;
  };

  const stats = useMemo(() => {
    const hoje = new Date();
    const getSemana = (d) => {
      const data = new Date(d);
      const primeiroDia = new Date(data.getFullYear(), 0, 1);
      const dias = Math.floor((data - primeiroDia) / 86400000);
      return Math.ceil((dias + primeiroDia.getDay() + 1) / 7);
    };
    const semanaAtual = getSemana(hoje);

    // Lógica de Meses para Comparativo
    const mesAnteriorNum = parseInt(mesRelatorio) === 1 ? 12 : parseInt(mesRelatorio) - 1;
    const mesAnteriorStr = String(mesAnteriorNum).padStart(2, '0');

    const dadosMesAtual = agendamentos.filter(a => a.data_aula?.split('-')[1] === mesRelatorio);
    const dadosMesAnterior = agendamentos.filter(a => a.data_aula?.split('-')[1] === mesAnteriorStr);

    const dados = {
      totalMes: dadosMesAtual.length,
      totalAnterior: dadosMesAnterior.length,
      crescimento: 0,
      sexo: { Masculino: 0, Feminino: 0, Outros: 0 },
      programas: {},
      origens: {},
      idades: { "0-10a": 0, "11-17a": 0, "18-35a": 0, "36a+": 0 },
      experimentais: { adultoMes: 0, kidsMes: 0, adultoSemana: 0, kidsSemana: 0 }
    };

    // Cálculo de Crescimento %
    if (dados.totalAnterior > 0) {
      dados.crescimento = ((dados.totalMes - dados.totalAnterior) / dados.totalAnterior) * 100;
    } else {
      dados.crescimento = dados.totalMes > 0 ? 100 : 0;
    }

    dadosMesAtual.forEach(a => {
      // 1. Programas (Todos)
      const prog = a.tipo_aula || "Experimental";
      dados.programas[prog] = (dados.programas[prog] || 0) + 1;

      if (a.form_raw) {
        // 2. Sexo (Todos)
        const gen = buscarNoForm(a.form_raw, ['sexo', 'gênero', 'genero'])?.toString().toLowerCase();
        if (gen?.startsWith('m')) dados.sexo.Masculino++;
        else if (gen?.startsWith('f')) dados.sexo.Feminino++;
        else dados.sexo.Outros++;

        // 3. Origem (Todos)
        let ori = buscarNoForm(a.form_raw, ['conheceu', 'onde', 'origem', 'indicacao'])?.toString().trim();
        if (!ori) ori = "Não Informado";
        dados.origens[ori] = (dados.origens[ori] || 0) + 1;

        // 4. Idade (Todos)
        const idade = parseInt(buscarNoForm(a.form_raw, ['idade', 'nascimento', 'anos']));
        if (idade <= 10) dados.idades["0-10a"]++;
        else if (idade <= 17) dados.idades["11-17a"]++;
        else if (idade <= 35) dados.idades["18-35a"]++;
        else if (idade > 35) dados.idades["36a+"]++;

        // 5. Experimentais CONFIRMADOS
        if (a.status === 'confirmado' ) {
          const isKids = idade <= 13;
          const semanaAula = getSemana(new Date(a.data_aula));
          if (isKids) {
            dados.experimentais.kidsMes++;
            if (semanaAula === semanaAtual) dados.experimentais.kidsSemana++;
          } else {
            dados.experimentais.adultoMes++;
            if (semanaAula === semanaAtual) dados.experimentais.adultoSemana++;
          }
        }
      }
    });

    return dados;
  }, [agendamentos, mesRelatorio]);

  // CORES E CONFIGS
  const cores = ['#400c88', '#16a34a', '#f59e0b', '#ef4444', '#137fec', '#8b5cf6'];
  const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };

  return (
    <section className="conteudo">
      <header className="topbar">
        <h2 className="topbar__titulo">Relatório Estratégico Completo</h2>
        
        <div className="topbar__direita" style={{ display: 'flex', gap: '10px' }}>
          <select className="select-filtro" value={mesRelatorio} onChange={(e) => setMesRelatorio(e.target.value)}>
            {["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"].map(m => (
              <option key={m} value={m}> {m}</option>
            ))}
          </select>

          <select className="select-filtro" value={filtroPublico} onChange={(e) => setFiltroPublico(e.target.value)}>
            <option value={PUBLICO_ALVO.TODOS}>Filtro: Todos</option>
            <option value={PUBLICO_ALVO.ADULTO}>Filtro: Adulto</option>
            <option value={PUBLICO_ALVO.KIDS}>Filtro: Kids</option>
          </select>
        </div>
      </header>

      {/* CARDS DE RESUMO */}
      <div className="stats-grid">
        <article className="stat-card main">
          <p className="stat-card__label">Total Cadastros (Mês)</p>
          <div className="flex-row">
            <span className="stat-card__numero">{stats.totalMes}</span>
            <div className={`badge ${stats.crescimento >= 0 ? 'up' : 'down'}`}>
              {stats.crescimento >= 0 ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
              {Math.abs(stats.crescimento).toFixed(1)}%
            </div>
          </div>
        </article>

        {(filtroPublico === PUBLICO_ALVO.TODOS || filtroPublico === PUBLICO_ALVO.ADULTO) && (
          <article className="stat-card card-adulto">
            <p className="stat-card__label">Exp. Adulto Confirmado (Mês/Semana)</p>
            <span className="stat-card__numero">{stats.experimentais.adultoMes} | {stats.experimentais.adultoSemana}</span>
          </article>
        )}

        {(filtroPublico === PUBLICO_ALVO.TODOS || filtroPublico === PUBLICO_ALVO.KIDS) && (
          <article className="stat-card card-kids">
            <p className="stat-card__label">Exp. Kids Confirmado (Mês/Semana)</p>
            <span className="stat-card__numero">{stats.experimentais.kidsMes} | {stats.experimentais.kidsSemana}</span>
          </article>
        )}
      </div>

      {/* GRID DE GRÁFICOS */}
      <div className="charts-container">
        
        {/* 1. Comparativo Mensal */}
        <div className="chart-box">
          <h3>Evolução: Mês Anterior vs Atual</h3>
          <div className="canvas-wrapper">
            <Bar 
              data={{
                labels: ['Mês Anterior', 'Mês Selecionado'],
                datasets: [{ label: 'Cadastros', data: [stats.totalAnterior, stats.totalMes], backgroundColor: ['#ccc', '#400c88'] }]
              }} 
              options={options} 
            />
          </div>
        </div>

        {/* 2. Origem do Lead */}
        <div className="chart-box">
          <h3>Como nos conheceu?</h3>
          <div className="canvas-wrapper">
            <Bar 
              data={{
                labels: Object.keys(stats.origens),
                datasets: [{ label: 'Leads', data: Object.values(stats.origens), backgroundColor: '#16a34a' }]
              }} 
              options={{...options, indexAxis: 'y'}} 
            />
          </div>
        </div>

        {/* 3. Programas */}
        <div className="chart-box">
          <h3>Volume por Modalidade</h3>
          <div className="canvas-wrapper">
            <Doughnut 
              data={{
                labels: Object.keys(stats.programas),
                datasets: [{ data: Object.values(stats.programas), backgroundColor: cores }]
              }} 
              options={options} 
            />
          </div>
        </div>

        {/* 4. Idade */}
        <div className="chart-box">
          <h3>Faixa Etária (Total)</h3>
          <div className="canvas-wrapper">
            <Bar 
              data={{
                labels: Object.keys(stats.idades),
                datasets: [{ label: 'Alunos', data: Object.values(stats.idades), backgroundColor: '#f59e0b' }]
              }} 
              options={options} 
            />
          </div>
        </div>

        {/* 5. Gênero */}
        <div className="chart-box">
          <h3>Distribuição por Gênero</h3>
          <div className="canvas-wrapper">
            <Pie 
              data={{
                labels: Object.keys(stats.sexo),
                datasets: [{ data: Object.values(stats.sexo), backgroundColor: ['#137fec', '#ef4444', '#ccc'] }]
              }} 
              options={options} 
            />
          </div>
        </div>

      </div>

      <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .flex-row { display: flex; align-items: center; gap: 10px; margin-top: 5px; }
        .badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: bold;
        }
        .up { background: #dcfce7; color: #166534; }
        .down { background: #fee2e2; color: #991b1b; }
        
        .card-adulto { border-top: 4px solid #400c88; }
        .card-kids { border-top: 4px solid #16a34a; }
        .stat-card__label { font-size: 12px; color: #666; font-weight: 500; }
        .stat-card__numero { font-size: 24px; font-weight: 800; color: #333; }

        .charts-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 20px;
        }
        .chart-box {
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .chart-box h3 { font-size: 15px; margin-bottom: 15px; color: #400c88; text-align: center; }
        .canvas-wrapper { height: 250px; }
        .select-filtro {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #ddd;
          background: white;
          font-size: 14px;
        }
      `}</style>
    </section>
  );
}