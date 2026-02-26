import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <h2 className="text-xl font-bold text-slate-700 mb-6">用戶</h2>

      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl">
          {auth.user.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-slate-700">{auth.user.name}</p>
          <p className="text-sm text-slate-400">{auth.user.email}</p>
        </div>
      </div>

      {/* 催繳 QR Code */}
      <button
        onClick={() => navigate('/qr')}
        className="w-full bg-white rounded-2xl border border-slate-100 px-5 py-4 mb-4 flex items-center justify-between hover:border-indigo-200 hover:bg-indigo-50 transition-colors active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-lg">
            💸
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-700">催繳 QR Code</p>
            <p className="text-xs text-slate-400">TWQR 轉帳條碼產生器</p>
          </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-300">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4">
        <button className="w-full px-5 py-4 text-left text-sm text-slate-500 border-b border-slate-50 hover:bg-slate-50 transition-colors">
          編輯個人資料（開發中）
        </button>
        <button className="w-full px-5 py-4 text-left text-sm text-slate-500 hover:bg-slate-50 transition-colors">
          修改密碼（開發中）
        </button>
      </div>

      <button
        onClick={handleLogout}
        className="w-full bg-white rounded-2xl border border-slate-100 px-5 py-4 text-left text-sm text-red-500 hover:bg-red-50 transition-colors"
      >
        登出
      </button>
    </div>
  );
}
