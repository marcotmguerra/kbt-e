import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import React from 'react';

// Importação das Páginas
import Login from './pages/Login';
import Cadastro from './pages/Signup'; 
import AdminDashboard from './pages/AdminDashboard';
import AdminCoaches from './pages/AdminCoaches';
import AdminAgenda from './pages/AdminAgenda';
import AdminPosAula from './pages/AdminPosAula';
import AdminReports from './pages/AdminReports';
import StudentDetail from './pages/StudentDetail';
import ProfessorDashboard from './pages/ProfessorDashboard'; 

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ROTAS PÚBLICAS */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          
          {/* ROTAS DO ADMIN */}
          <Route element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/coaches" element={<AdminCoaches />} />
            <Route path="/admin/agendamentos" element={<AdminAgenda />} />
            <Route path="/admin/pos-aula" element={<AdminPosAula />} />
            <Route path="/admin/relatorios" element={<AdminReports />} />
            <Route path="/admin/detalhe/:id" element={<StudentDetail />} />
          </Route>

          {/* ROTAS DO PROFESSOR */}
          <Route element={<ProtectedRoute allowedRole="professor" />}>
            <Route path="/professor" element={<ProfessorDashboard />} />
            <Route path="/professor/detalhe/:id" element={<StudentDetail />} />
          </Route>

          {/* REDIRECIONAMENTOS */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;