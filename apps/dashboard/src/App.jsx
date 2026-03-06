import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Overview from './pages/Overview';
import UserManagement from './pages/UserManagement';
import SupportTickets from './pages/SupportTickets';
import Analytics from './pages/Analytics';
import Billing from './pages/Billing';
import SystemHealth from './pages/SystemHealth';
import AuditLogs from './pages/AuditLogs';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute allowedRoles={['admin', 'support']}><UserManagement /></ProtectedRoute>} />
      <Route path="/tickets" element={<ProtectedRoute allowedRoles={['admin', 'support']}><SupportTickets /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute allowedRoles={['admin', 'marketing']}><Analytics /></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute allowedRoles={['admin', 'accounting']}><Billing /></ProtectedRoute>} />
      <Route path="/system" element={<ProtectedRoute allowedRoles={['admin']}><SystemHealth /></ProtectedRoute>} />
      <Route path="/audit" element={<ProtectedRoute allowedRoles={['admin']}><AuditLogs /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
