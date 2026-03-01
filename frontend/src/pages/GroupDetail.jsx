import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [balances, setBalances] = useState(null); // null=未載入, []=結清, [...]有欠款
  const [settlingKey, setSettlingKey] = useState(null); // index of item being settled
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState(null); // { type: 'success'|'warning'|'error', text }

  useEffect(() => {
    Promise.all([
      apiFetch(`/api/groups/${groupId}`),
      apiFetch(`/api/groups/${groupId}/members`),
      apiFetch(`/api/balances/group/${groupId}`).catch(() => null),
    ])
      .then(([g, m, b]) => { setGroup(g); setMembers(m); setBalances(b); })
      .catch(err => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [groupId]);

  async function handleSettle(b, idx) {
    setSettlingKey(idx);
    try {
      await apiFetch('/api/balances/settle', {
        method: 'POST',
        body: JSON.stringify({
          groupId: Number(groupId),
          fromUserId: b.fromUserId,
          toUserId: b.toUserId,
          amount: b.amount,
        }),
      });
    } catch {
      // ignore settle response body parse errors
    }
    try {
      const updated = await apiFetch(`/api/balances/group/${groupId}`).catch(() => null);
      setBalances(updated);
    } finally {
      setSettlingKey(null);
    }
  }

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

      {/* Balances */}
      <section className="bg-white rounded-2xl border border-slate-100 p-4 mb-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 mb-3">結算</p>
        {balances === null ? (
          <p className="text-sm text-slate-400">載入失敗，請重新整理。</p>
        ) : balances.length === 0 ? (
          <p className="text-sm text-green-600">大家已結清！</p>
        ) : (
          <ul className="space-y-3">
            {balances.map((b, i) => {
              const isCreditor = Number(auth.user.id) === Number(b.toUserId);
              return (
                <li key={i} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-slate-700">
                      <span className="font-medium">{b.fromUserName}</span>
                      <span className="text-slate-400 mx-1">欠</span>
                      <span className="font-medium">{b.toUserName}</span>
                    </span>
                    <span className="text-sm font-bold text-red-500 ml-2">NT${b.amount}</span>
                  </div>
                  <button
                    onClick={() => navigate(`/qr?amount=${b.amount}&payerName=${encodeURIComponent(b.fromUserName)}`)}
                    disabled={!isCreditor}
                    title={isCreditor ? '產生催繳 QR Code' : '只有收款人才能使用'}
                    className={`flex-shrink-0 text-xs px-2.5 py-1.5 rounded-lg border transition ${
                      isCreditor
                        ? 'border-indigo-200 text-indigo-600 hover:bg-indigo-50'
                        : 'border-slate-100 text-slate-300 cursor-not-allowed'
                    }`}
                  >
                    QR
                  </button>
                  <button
                    onClick={() => handleSettle(b, i)}
                    disabled={!isCreditor || settlingKey === i}
                    title={isCreditor ? '標記已收款並結清' : '只有收款人才能結清'}
                    className={`flex-shrink-0 text-xs px-2.5 py-1.5 rounded-lg border transition ${
                      isCreditor
                        ? 'border-green-200 text-green-600 hover:bg-green-50'
                        : 'border-slate-100 text-slate-300 cursor-not-allowed'
                    }`}
                  >
                    {settlingKey === i ? '…' : '結清'}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

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

      {/* Add expense */}
      <button
        onClick={() => navigate(`/add-expense?groupId=${groupId}`)}
        className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium py-3 rounded-2xl transition mb-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        新增支出
      </button>

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
