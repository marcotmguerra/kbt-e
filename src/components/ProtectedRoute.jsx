import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;

  if (!user) return <Navigate to="/login" />;

  if (allowedRole && profile?.role !== allowedRole) {
    return <Navigate to={profile?.role === 'admin' ? '/admin' : '/professor'} />;
  }

  return children;
};