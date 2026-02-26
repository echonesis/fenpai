import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';

export default function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState(null); // { type: 'success'|'warning'|'error', text }

  useEffect(() => {
    Promise.all([
      apiFetch(`/api/groups/${groupId}`),
      apiFetch(`/api/groups/${groupId}/members`),
    ])
      .then(([g, m]) => { setGroup(g); setMembers(m); })
      .catch(err => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [groupId]);

  async function handleInvite(e) {
    e.preventDefault();
    const email = inviteEmail.trim();
    if (!email) return;
    setInviting(true);
    setInviteMsg(null);
    try {
      const { result } = await apiFetch(`/api/groups/${groupId}/invite`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      if (result === 'added') {
        setInviteMsg({ type: 'success', text: `${email} 已加入群組。` });
        const updated = await apiFetch(`/api/groups/${groupId}/members`);
        setMembers(updated);
      } else {
        setInviteMsg({ type: 'warning', text: `${email} 尚未註冊，已寄出邀請信。` });
      }
      setInviteEmail('');
    } catch (err) {
      setInviteMsg({ type: 'error', text: err.message });
    } finally {
      setInviting(false);
    }
  }

  if (loading) return <div className="text-center text-slate-400 text-sm py-12">載入中…</div>;
  if (loadError) return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <button onClick={() => navigate('/groups')} className="text-indigo-500 text-sm mb-4">← 群組</button>
      <div className="bg-red-50 text-red-600 rounded-2xl p-4 text-sm">{loadError}</div>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <button onClick={() => navigate('/groups')} className="text-indigo-500 text-sm mb-4 flex items-center gap-1">
        ← 群組
      </button>

      <h2 className="text-xl font-bold text-slate-700 mb-6">{group?.name}</h2>

      {/* Members */}
      <section className="bg-white rounded-2xl border border-slate-100 p-4 mb-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 mb-3">成員（{members.length}）</p>
        <ul className="space-y-2">
          {members.map(m => (
            <li key={m.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                {m.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">{m.name}</p>
                <p className="text-xs text-slate-400">{m.email}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Invite */}
      <section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 mb-3">邀請成員</p>
        <form onSubmit={handleInvite} className="flex gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="輸入 Email"
            className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button
            type="submit"
            disabled={inviting || !inviteEmail.trim()}
            className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-xl transition"
          >
            {inviting ? '…' : '邀請'}
          </button>
        </form>

        {inviteMsg && (
          <p className={`mt-3 text-sm px-3 py-2 rounded-xl ${
            inviteMsg.type === 'success' ? 'bg-green-50 text-green-700' :
            inviteMsg.type === 'warning' ? 'bg-amber-50 text-amber-700' :
            'bg-red-50 text-red-600'
          }`}>
            {inviteMsg.type === 'warning' && '⚠ '}
            {inviteMsg.text}
          </p>
        )}
      </section>
    </div>
  );
}
