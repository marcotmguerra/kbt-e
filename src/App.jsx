import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
// Importe suas futuras páginas aqui
// import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Rotas Protegidas do Admin usando o Layout */}
          <Route element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="/admin" element={<div>Página Inicial Admin</div>} />
            <Route path="/admin/coaches" element={<div>Gestão de Coaches</div>} />
            <Route path="/admin/agendamentos" element={<div>Agenda</div>} />
            <Route path="/admin/pos-aula" element={<div>Pós Aula</div>} />
            <Route path="/admin/relatorios" element={<div>Relatórios</div>} />
          </Route>

          {/* Redirecionamento padrão */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;