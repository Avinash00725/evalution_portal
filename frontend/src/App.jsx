import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import JudgeDashboard from './pages/JudgeDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const { user } = useAuth();

  return (
    <Router>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/judge"
          element={
            <ProtectedRoute requiredRole="judge">
              <JudgeDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
