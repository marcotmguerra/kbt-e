import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Repeat2, Users, ChartLine } from 'lucide-react';

export default function MobileNav() {
  return (
    <nav className="nav-mobile">
      <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-mobile__item nav-mobile__item--ativo" : "nav-mobile__item"}>
        <LayoutDashboard size={20} />
        <span>Painel</span>
      </NavLink>

      <NavLink to="/admin/pos-aula" className={({ isActive }) => isActive ? "nav-mobile__item nav-mobile__item--ativo" : "nav-mobile__item"}>
        <Repeat2 size={20} />
        <span>Pós-aula</span>
      </NavLink>

      <NavLink to="/admin/coaches" className={({ isActive }) => isActive ? "nav-mobile__item nav-mobile__item--ativo" : "nav-mobile__item"}>
        <Users size={20} />
        <span>Coaches</span>
      </NavLink>

      <NavLink to="/admin/relatorios" className={({ isActive }) => isActive ? "nav-mobile__item nav-mobile__item--ativo" : "nav-mobile__item"}>
        <ChartLine size={20} />
        <span>Relatórios</span>
      </NavLink>
    </nav>
  );
}