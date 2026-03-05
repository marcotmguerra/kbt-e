import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) throw error;

      // Buscar perfil para redirecionar
      const { data: perfil } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (perfil?.role === 'admin') navigate('/admin');
      else navigate('/professor');
      
    } catch (err) {
      setErro(err.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="centralizado">
      <main className="card">
        <div className="card-header">
          <div className="logo-box">
            <img src="/src/assets/KBT_logo2.png" alt="Logo KBT" className="logo2-icon" />
          </div>
          <p className="subtitle">Sistema de Aulas Experimentais</p>
        </div>

        <form onSubmit={handleLogin}>
          <label>E-mail</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="seuemail@exemplo.com" 
          />
          
          <label>Senha</label>
          <input 
            type="password" 
            value={senha} 
            onChange={(e) => setSenha(e.target.value)} 
            required 
            placeholder="••••••••" 
          />
          
          <button type="submit" disabled={loading} style={{ marginTop: '20px', width: '100%' }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          {erro && <p className="mensagem-erro" style={{ color: '#ef4444', textAlign: 'center', marginTop: '10px' }}>{erro}</p>}
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
          <p style={{ fontSize: '14px', color: '#404244' }}>
            É professor e não tem conta? <br />
            <a href="/cadastro" style={{ color: '#400c88', fontWeight: '800' }}>Solicite seu cadastro aqui</a>
          </p>
        </div>
      </main>
    </div>
  );
}