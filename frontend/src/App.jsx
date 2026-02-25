import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import QRGenerator from './components/qr/QRGenerator';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider, useAuth } from './context/AuthContext';

function Home() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-indigo-700 mb-2">分派 Fenpai</h1>
      <p className="text-slate-500 mb-1">台灣分帳神器</p>
      <p className="text-slate-400 text-sm mb-8">你好，{auth.user.name}</p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <a
          href="/qr"
          className="block text-center bg-indigo-600 text-white rounded-xl py-3 font-semibold shadow-md hover:bg-indigo-700 transition-colors"
        >
          催繳 QR Code
        </a>
        <button
          onClick={handleLogout}
          className="text-slate-500 text-sm hover:text-slate-700 transition-colors"
        >
          登出
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/qr" element={<ProtectedRoute><QRGenerator /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
