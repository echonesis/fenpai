import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import Records from './pages/Records';
import Profile from './pages/Profile';
import AddExpense from './pages/AddExpense';
import QRGenerator from './components/qr/QRGenerator';
import GroupDetail from './pages/GroupDetail';
import InviteAccept from './pages/InviteAccept';

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/groups" element={<ProtectedLayout><Groups /></ProtectedLayout>} />
          <Route path="/add-expense" element={<ProtectedLayout><AddExpense /></ProtectedLayout>} />
          <Route path="/records" element={<ProtectedLayout><Records /></ProtectedLayout>} />
          <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />
          <Route path="/qr" element={<ProtectedRoute><QRGenerator /></ProtectedRoute>} />
          <Route path="/groups/:groupId" element={<ProtectedLayout><GroupDetail /></ProtectedLayout>} />
          <Route path="/invite/:token" element={<InviteAccept />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
