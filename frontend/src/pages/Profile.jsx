import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';

export default function Profile() {
  const { auth, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  // Edit name
  const [showEditName, setShowEditName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState(null);

  // Change password
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState(null);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  async function handleEditName(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setSavingName(true);
    setNameMsg(null);
    try {
      const updated = await apiFetch('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify({ name: newName.trim() }),
      });
      updateUser(updated);
      setNameMsg({ type: 'success', text: '名稱已更新。' });
      setNewName('');
      setShowEditName(false);
    } catch (err) {
      setNameMsg({ type: 'error', text: err.message });
    } finally {
      setSavingName(false);
    }
  }

  async function handleChangePwd(e) {
    e.preventDefault();
    if (!currentPwd || !newPwd) return;
    setSavingPwd(true);
    setPwdMsg(null);
    try {
      await apiFetch('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword: currentPwd, password: newPwd }),
      });
      setPwdMsg({ type: 'success', text: '密碼已更新。' });
      setCurrentPwd('');
      setNewPwd('');
      setShowChangePwd(false);
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.message });
    } finally {
      setSavingPwd(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <h2 className="text-xl font-bold text-slate-700 mb-6">用戶</h2>

      {/* Avatar + info */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl">
          {auth.user.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-slate-700">{auth.user.name}</p>
          <p className="text-sm text-slate-400">{auth.user.email}</p>
          <p className="text-xs text-slate-400 mt-1">
            登入方式：
            {[
              ...(auth.user.hasPassword ? ['PASSWORD'] : []),
              ...((auth.user.providers ?? []).filter(Boolean)),
            ].join(' / ') || '未知'}
          </p>
        </div>
      </div>

      {/* QR Code */}
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

      {/* Edit name */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4">
        <button
          onClick={() => { setShowEditName(v => !v); setNameMsg(null); setNewName(auth.user.name); }}
          className="w-full px-5 py-4 text-left text-sm text-slate-700 border-b border-slate-50 hover:bg-slate-50 transition-colors flex items-center justify-between"
        >
          編輯顯示名稱
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            strokeWidth={2} stroke="currentColor"
            className={`w-4 h-4 text-slate-300 transition-transform ${showEditName ? 'rotate-90' : ''}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        {showEditName && (
          <form onSubmit={handleEditName} className="px-5 py-4 border-b border-slate-50">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="新名稱"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 mb-3"
              autoFocus
            />
            {nameMsg && (
              <p className={`text-xs mb-3 ${nameMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                {nameMsg.text}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={savingName || !newName.trim()}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm py-2 rounded-xl transition"
              >
                {savingName ? '儲存中…' : '儲存'}
              </button>
              <button
                type="button"
                onClick={() => setShowEditName(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm py-2 rounded-xl transition"
              >
                取消
              </button>
            </div>
          </form>
        )}

        {/* Change password */}
        {auth.user.hasPassword ? (
          <>
            <button
              onClick={() => { setShowChangePwd(v => !v); setPwdMsg(null); }}
              className="w-full px-5 py-4 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-between"
            >
              修改密碼
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                strokeWidth={2} stroke="currentColor"
                className={`w-4 h-4 text-slate-300 transition-transform ${showChangePwd ? 'rotate-90' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            {showChangePwd && (
              <form onSubmit={handleChangePwd} className="px-5 py-4">
                <input
                  type="password"
                  value={currentPwd}
                  onChange={e => setCurrentPwd(e.target.value)}
                  placeholder="目前密碼"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 mb-2"
                  autoFocus
                />
                <input
                  type="password"
                  value={newPwd}
                  onChange={e => setNewPwd(e.target.value)}
                  placeholder="新密碼"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 mb-3"
                />
                {pwdMsg && (
                  <p className={`text-xs mb-3 ${pwdMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    {pwdMsg.text}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={savingPwd || !currentPwd || !newPwd}
                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm py-2 rounded-xl transition"
                  >
                    {savingPwd ? '更新中…' : '更新密碼'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowChangePwd(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm py-2 rounded-xl transition"
                  >
                    取消
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div className="px-5 py-4 text-sm text-slate-500 border-t border-slate-50">
            這個帳號目前使用社群登入，尚未設定本地密碼。
          </div>
        )}
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
