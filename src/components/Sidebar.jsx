import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Repeat2, 
  ChartLine, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const { profile, signOut } = useAuth();

  // Definição dos links para facilitar a manutenção
  const menuItems = [
    { path: '/admin', label: 'Painel', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/coaches', label: 'Coaches', icon: <Users size={20} /> },
    { path: '/admin/agendamentos', label: 'Agendamentos', icon: <Calendar size={20} /> },
    { path: '/admin/pos-aula', label: 'Pós-aula', icon: <Repeat2 size={20} /> },
    { path: '/admin/relatorios', label: 'Relatórios', icon: <ChartLine size={20} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar__conteudo">
        {/* Brand / Logo */}
        <div className="brand">
          <div className="brand__icone">
            <img src="/img/KBT_logo2.png" alt="Logo KBT" className="logo-icon" />
          </div>
          <div className="brand__texto">
            <h1 className="brand__titulo">SAE</h1>
            <p className="brand__subtitulo">Sistema de aula experimental</p>
          </div>
        </div>

        {/* Menu de Navegação */}
        <nav className="menu">
          {menuItems.map((item) => (
            <NavLink 
              key={item.path}
              to={item.path} 
              className={({ isActive }) => 
                isActive ? "menu__item menu__item--ativo" : "menu__item"
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Rodapé do Menu */}
          <div className="menu__rodape">
            <button 
              onClick={signOut} 
              className="menu__item menu__item--botao"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
            <p className="sidebar__usuario">
              Usuário: {profile?.nome || '—'}
            </p>
          </div>
        </nav>
      </div>
    </aside>
  );
}