import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';

function AddFriendModal({ onClose, onAdded }) {
  const [email, setEmail] = useState('');
  const [found, setFound] = useState(null);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    setSearching(true);
    setFound(null);
    setError(null);
    try {
      const user = await apiFetch(`/api/users/search?email=${encodeURIComponent(email)}`);
      setFound(user);
    } catch {
      setError('找不到此 email 的用戶');
    } finally {
      setSearching(false);
    }
  }

  async function handleAdd() {
    setAdding(true);
    try {
      await apiFetch('/api/friends', { method: 'POST', body: JSON.stringify({ friendId: found.id }) });
      onAdded();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center">
        <div className="w-full max-w-lg bg-white rounded-t-3xl shadow-2xl px-5 pt-4 pb-10">
          <div className="flex justify-center mb-4">
            <div className="w-10 h-1 rounded-full bg-slate-200" />
          </div>
          <h2 className="text-base font-semibold text-slate-700 mb-4">新增朋友</h2>

          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="輸入對方的 email"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              required
            />
            <button
              type="submit"
              disabled={searching}
              className="px-4 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-medium disabled:opacity-50"
            >
              搜尋
            </button>
          </form>

          {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

          {found && (
            <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                  {found.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{found.name}</p>
                  <p className="text-xs text-slate-400">{found.email}</p>
                </div>
              </div>
              <button
                onClick={handleAdd}
                disabled={adding}
                className="px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-medium disabled:opacity-50"
              >
                {adding ? '新增中…' : '新增'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function Friends() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch('/api/friends')
      .then(setFriends)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-100 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-800">朋友</h1>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500 text-white text-sm font-medium active:scale-95 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            新增朋友
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl h-16 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : friends.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-400">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <p className="text-slate-500 text-sm">還沒有朋友</p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-4 text-indigo-500 text-sm font-medium"
            >
              新增第一個朋友 →
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {friends.map((f, i) => {
              const bal = Number(f.balance);
              const settled = bal === 0;
              const positive = bal > 0;
              return (
                <button
                  key={f.friendId}
                  onClick={() => navigate(`/friends/${f.friendId}`)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 active:bg-slate-50 transition-colors
                    ${i < friends.length - 1 ? 'border-b border-slate-50' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                      {f.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-800">{f.name}</p>
                      {settled ? (
                        <p className="text-xs text-slate-400">已結清</p>
                      ) : (
                        <p className={`text-xs ${positive ? 'text-green-600' : 'text-red-500'}`}>
                          {positive ? '對方欠你' : '你欠對方'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!settled && (
                      <span className={`text-sm font-semibold ${positive ? 'text-green-600' : 'text-red-500'}`}>
                        {positive ? '+' : '-'}NT${Math.abs(bal).toLocaleString()}
                      </span>
                    )}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                      strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-slate-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {showAdd && (
        <AddFriendModal onClose={() => setShowAdd(false)} onAdded={load} />
      )}
    </div>
  );
}
