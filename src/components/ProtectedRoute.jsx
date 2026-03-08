import { Navigate, Outlet } from 'react-router-dom'; // Importe o Outlet
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, profile, loading } = useAuth();

  // 1. Enquanto carrega o Supabase, mostra um aviso
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <h3>Carregando acesso...</h3>
    </div>
  );

  
  if (!user) return <Navigate to="/login" replace />;

 
  if (allowedRole && profile?.role !== allowedRole) {
    
    const destino = profile?.role === 'admin' ? '/admin' : '/professor';
    return <Navigate to={destino} replace />;
  }

  
  return children ? children : <Outlet />;
};