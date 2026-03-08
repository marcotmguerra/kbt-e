import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { showToast } from '../utils/util'; // Assumindo que você tem essa util

export default function Signup() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Criar o usuário no Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { nome: nome } }
      });

      if (authError) throw authError;

      if (data.user) {
        // 2. Criar/Atualizar perfil
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            nome: nome,
            email: email,
            role: 'professor',
            ativo: false 
          }, { onConflict: 'id' });

        if (profileError) throw profileError;

        alert("Solicitação enviada! O administrador irá revisar seu acesso.");
        navigate('/login');
      }
    } catch (err) {
      alert("Erro: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="centralizado">
      <main className="card">
        <div className="card-header">
          <div className="logo-box">
            <img src="/img/KBT_logo2.png" alt="Logo KBT" className="logo2-icon" />
          </div>
          <h2 style={{ marginTop: '15px', fontWeight: 800 }}>Criar Conta</h2>
          <p className="subtitle">Solicite seu acesso como professor</p>
        </div>

        <form onSubmit={handleCadastro} autoComplete="off">
          <label htmlFor="nome">Nome Completo</label>
          <input 
            id="nome" 
            type="text" 
            required 
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <label htmlFor="email">E-mail</label>
          <input 
            id="email" 
            type="email" 
            required 
            placeholder="seuemail@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="senha">Senha</label>
          <input 
            id="senha" 
            type="password" 
            required 
            placeholder="Mínimo 6 caracteres" 
            minLength="6"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <button 
            className="btn btn--primario" 
            type="submit" 
            disabled={loading}
            style={{ marginTop: '20px', width: '100%' }}
          >
            {loading ? 'Enviando...' : 'Solicitar Acesso'}
          </button>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
            Já tem uma conta? <Link to="/login" style={{ color: 'var(--primario)', fontWeight: 800, textDecoration: 'none' }}>Entrar</Link>
          </p>
        </form>
      </main>
    </div>
  );
}