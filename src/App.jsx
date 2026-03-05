import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';

// Importação das Páginas Reais
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminCoaches from './pages/AdminCoaches';
import AdminAgenda from './pages/AdminAgenda';
import AdminPosAula from './pages/AdminPosAula';
import AdminReports from './pages/AdminReports';
import StudentDetail from './pages/StudentDetail';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rota Pública */}
          <Route path="/login" element={<Login />} />
          
          {/* Rotas Protegidas do Admin usando o Layout (Sidebar + MobileNav) */}
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
            
            {/* Rota da Ficha do Aluno (com ID dinâmico) */}
            <Route path="/admin/detalhe/:id" element={<StudentDetail />} />
          </Route>

          {/* Redirecionamento padrão para login se a rota não existir */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App; // Importante para o main.jsx conseguir ler