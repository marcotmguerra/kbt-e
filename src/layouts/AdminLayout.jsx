import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';

export default function AdminLayout() {
  return (
    <div className="app">
      <Sidebar />
      
      <main className="main">
        {/* O Outlet é onde as páginas (Dashboard, Coaches, etc) serão renderizadas */}
        <Outlet />
      </main>

      <MobileNav />
    </div>
  );
}