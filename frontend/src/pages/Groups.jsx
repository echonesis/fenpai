import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('/api/groups')
      .then(setGroups)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const group = await apiFetch('/api/groups', {
        method: 'POST',
        body: JSON.stringify({ name: newName.trim() }),
      });
      setGroups(prev => [...prev, group]);
      setNewName('');
      setShowCreate(false);
    } catch (err) {
      alert('建立失敗：' + err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-700">群組</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1.5 rounded-xl transition"
        >
          + 新增
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-slate-100 p-4 mb-4 shadow-sm">
          <p className="text-sm font-medium text-slate-600 mb-2">群組名稱</p>
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="例：2025 墾丁之旅"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 mb-3"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm py-2 rounded-xl transition"
            >
              {creating ? '建立中…' : '建立'}
            </button>
            <button
              type="button"
              onClick={() => { setShowCreate(false); setNewName(''); }}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm py-2 rounded-xl transition"
            >
              取消
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center text-slate-400 text-sm py-12">載入中…</div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
          <p className="text-slate-400 text-sm">還沒有群組，建立第一個吧！</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {groups.map(g => (
            <li key={g.id}>
              <button
                onClick={() => navigate(`/groups/${g.id}`)}
                className="w-full text-left bg-white rounded-2xl border border-slate-100 px-5 py-4 shadow-sm hover:shadow-md transition flex items-center justify-between"
              >
                <span className="font-medium text-slate-700">{g.name}</span>
                <span className="text-slate-300 text-lg">›</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
