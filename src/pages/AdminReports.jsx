```javascript
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
import { FileDown, Calendar, Activity } from 'lucide-react';

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

    const { data, error } = await supabase
      .from("agendamentos")
      .select("*");

    if (!error) setAgendamentos(data);

    setLoading(false);
  }

  const buscarNoForm = (formRaw, termos) => {
    if (!formRaw) return null;

    const obj = typeof formRaw === 'string'
      ? JSON.parse(formRaw)
      : formRaw;

    const chaveEncontrada = Object.keys(obj).find(k =>
      termos.some(t => k.toLowerCase().includes(t.toLowerCase()))
    );

    return chaveEncontrada ? obj[chaveEncontrada] : null;
  };

  const stats = useMemo(() => {

    const hoje = new Date();

    function getSemana(d) {
      const data = new Date(d);
      const primeiroDia = new Date(data.getFullYear(), 0, 1);
      const dias = Math.floor((data - primeiroDia) / 86400000);
      return Math.ceil((dias + primeiroDia.getDay() + 1) / 7);
    }

    const semanaAtual = getSemana(hoje);

    const filtrados = agendamentos.filter(
      a => a.data_aula?.split('-')[1] === mesRelatorio
    );

    const confirmados = filtrados.filter(
      a => a.status === 'confirmado'
    ).length;

    const dados = {

      totalMes: filtrados.length,

      taxaPresenca:
        filtrados.length > 0
          ? Math.round((confirmados / filtrados.length) * 100)
          : 0,

      experimentais: {
        adultoMes: 0,
        kidsMes: 0,
        adultoSemana: 0,
        kidsSemana: 0
      },

      programas: {},

      sexo: {
        Masculino: 0,
        Feminino: 0,
        Outros: 0
      },

      idades: {
        "0-3a": 0,
        "4-6a": 0,
        "7-10a": 0,
        "11-13a": 0,
        "14-17a": 0,
        "18-35a": 0,
        "36a+": 0
      },

      origem: {}
    };

    filtrados.forEach(a => {

      const prog = a.tipo_aula || "Experimental";
      dados.programas[prog] = (dados.programas[prog] || 0) + 1;

      if (a.status === 'confirmado' && a.tipo_aula === 'Experimental') {

        const dataAula = new Date(a.data_aula);
        const semanaAula = getSemana(dataAula);

        const idade = parseInt(
          buscarNoForm(a.form_raw, ['idade', 'nascimento', 'anos'])
        );

        const isKids = idade <= 13;

        if (isKids) dados.experimentais.kidsMes++;
        else dados.experimentais.adultoMes++;

        if (semanaAula === semanaAtual) {

          if (isKids) dados.experimentais.kidsSemana++;
          else dados.experimentais.adultoSemana++;

        }
      }

      if (a.form_raw) {

        const gen = buscarNoForm(a.form_raw, ['sexo','gênero','genero'])
          ?.toString()
          .toLowerCase();

        if (gen?.startsWith('m')) dados.sexo.Masculino++;
        else if (gen?.startsWith('f')) dados.sexo.Feminino++;
        else dados.sexo.Outros++;

        const idade = parseInt(
          buscarNoForm(a.form_raw, ['idade','nascimento','anos'])
        );

        if (idade <= 3) dados.idades["0-3a"]++;
        else if (idade <= 6) dados.idades["4-6a"]++;
        else if (idade <= 10) dados.idades["7-10a"]++;
        else if (idade <= 13) dados.idades["11-13a"]++;
        else if (idade <= 17) dados.idades["14-17a"]++;
        else if (idade <= 35) dados.idades["18-35a"]++;
        else if (idade > 35) dados.idades["36a+"]++;

        const ori = buscarNoForm(a.form_raw, ['conheceu'])
          ?.toString()
          .trim();

        if (ori)
          dados.origem[ori] = (dados.origem[ori] || 0) + 1;
      }

    });

    return dados;

  }, [agendamentos, mesRelatorio]);

  const cores = ['#400c88','#16a34a','#ef4444','#f59e0b','#137fec','#8b5cf6'];

  const chartOptions = {
    responsive:true,
    maintainAspectRatio:false,
    plugins:{
      legend:{
        position:'bottom',
        labels:{ boxWidth:12, font:{ size:11 }}
      }
    }
  };

  return (

    <section className="conteudo">

      <header className="topbar">

        <h2 className="topbar__titulo">
          Relatórios Estratégicos
        </h2>

        <div className="topbar__direita">

          <button
            className="btn btn--primario"
            onClick={() => window.print()}
          >
            <FileDown size={18}/> Exportar PDF
          </button>

        </div>

      </header>


      <div className="stats">

        <article className="stat-card">
          <div className="stat-card__topo">
            <p className="stat-card__label">
              Aulas no Mês
            </p>
            <Calendar size={20} className="stat-card__icone"/>
          </div>

          <div className="stat-card__valor">
            <span className="stat-card__numero">
              {stats.totalMes}
            </span>
          </div>
        </article>


        <article className="stat-card">
          <div className="stat-card__topo">
            <p className="stat-card__label">
              Taxa de Presença
            </p>
            <Activity size={20} className="stat-card__icone"/>
          </div>

          <div className="stat-card__valor">
            <span className="stat-card__numero">
              {stats.taxaPresenca}%
            </span>
          </div>
        </article>


        <article className="stat-card">
          <p className="stat-card__label">
            Experimental Adulto (Mês)
          </p>
          <span className="stat-card__numero">
            {stats.experimentais.adultoMes}
          </span>
        </article>


        <article className="stat-card">
          <p className="stat-card__label">
            Experimental Kids (Mês)
          </p>
          <span className="stat-card__numero">
            {stats.experimentais.kidsMes}
          </span>
        </article>


        <article className="stat-card">
          <p className="stat-card__label">
            Experimental Adulto (Semana)
          </p>
          <span className="stat-card__numero">
            {stats.experimentais.adultoSemana}
          </span>
        </article>


        <article className="stat-card">
          <p className="stat-card__label">
            Experimental Kids (Semana)
          </p>
          <span className="stat-card__numero">
            {stats.experimentais.kidsSemana}
          </span>
        </article>

      </div>

    </section>

  );
}
```
