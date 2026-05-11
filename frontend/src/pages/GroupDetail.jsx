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
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState(null); // { type: 'success'|'warning'|'error', text }

  // Rename state
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renameSaving, setRenameSaving] = useState(false);

  // Delete state
  const [deleting, setDeleting] = useState(false);

  // Kick state
  const [kickingUserId, setKickingUserId] = useState(null);

  // Friends quick-add
  const [friends, setFriends] = useState([]);
  const [invitingFriendId, setInvitingFriendId] = useState(null);

  useEffect(() => {
    Promise.all([
      apiFetch(`/api/groups/${groupId}`),
      apiFetch(`/api/groups/${groupId}/members`),
      apiFetch(`/api/balances/group/${groupId}`).catch(() => null),
      apiFetch(`/api/balances/group/${groupId}/history`).catch(() => []),
    ])
      .then(([g, m, b, h]) => {
        setGroup(g); setMembers(m); setBalances(b); setHistory(h);
      })
      .catch(err => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [groupId]);

  useEffect(() => {
    apiFetch('/api/friends').then(setFriends).catch(() => {});
  }, []);

  const isCreator = group && Number(auth.user.id) === Number(group.createdById);

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
      const [updated, updatedHistory] = await Promise.all([
        apiFetch(`/api/balances/group/${groupId}`).catch(() => null),
        apiFetch(`/api/balances/group/${groupId}/history`).catch(() => []),
      ]);
      setBalances(updated);
      setHistory(updatedHistory);
    } finally {
      setSettlingKey(null);
    }
  }

  async function handleRename(e) {
    e.preventDefault();
    if (!renameValue.trim()) return;
    setRenameSaving(true);
    try {
      const updated = await apiFetch(`/api/groups/${groupId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: renameValue.trim() }),
      });
      setGroup(updated);
      setIsRenaming(false);
    } catch (err) {
      alert('改名失敗：' + err.message);
    } finally {
      setRenameSaving(false);
    }
  }

  async function handleDeleteGroup() {
    if (!window.confirm(`確定要刪除群組「${group.name}」？此操作無法復原，所有支出紀錄都將一併刪除。`)) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/groups/${groupId}`, { method: 'DELETE' });
      navigate('/groups');
    } catch (err) {
      alert('刪除失敗：' + err.message);
      setDeleting(false);
    }
  }

  async function handleKick(memberId, memberName) {
    if (!window.confirm(`確定要移除成員「${memberName}」？`)) return;
    setKickingUserId(memberId);
    try {
      await apiFetch(`/api/groups/${groupId}/members/${memberId}`, { method: 'DELETE' });
      setMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (err) {
      alert('移除失敗：' + err.message);
    } finally {
      setKickingUserId(null);
    }
  }

  async function handleInviteFriend(friend) {
    setInvitingFriendId(friend.friendId);
    setInviteMsg(null);
    try {
      const { result } = await apiFetch(`/api/groups/${groupId}/invite`, {
        method: 'POST',
        body: JSON.stringify({ email: friend.email }),
      });
      if (result === 'added') {
        const updated = await apiFetch(`/api/groups/${groupId}/members`);
        setMembers(updated);
        setInviteMsg({ type: 'success', text: `${friend.name} 已加入群組。` });
      } else {
        setInviteMsg({ type: 'warning', text: `${friend.name} 尚未註冊，已寄出邀請信。` });
      }
    } catch (err) {
      setInviteMsg({ type: 'error', text: err.message });
    } finally {
      setInvitingFriendId(null);
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

      {/* Group name + rename */}
      <div className="flex items-center gap-2 mb-6">
        {isRenaming ? (
          <form onSubmit={handleRename} className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              className="flex-1 border border-indigo-300 rounded-xl px-3 py-1.5 text-lg font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              autoFocus
            />
            <button
              type="submit"
              disabled={renameSaving || !renameValue.trim()}
              className="text-xs bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition"
            >
              {renameSaving ? '…' : '儲存'}
            </button>
            <button
              type="button"
              onClick={() => setIsRenaming(false)}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition"
            >
              取消
            </button>
          </form>
        ) : (
          <>
            <h2 className="text-xl font-bold text-slate-700 flex-1">{group?.name}</h2>
            {isCreator && (
              <button
                onClick={() => { setRenameValue(group.name); setIsRenaming(true); }}
                title="改名"
                className="text-slate-400 hover:text-indigo-500 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                  strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
                </svg>
              </button>
            )}
          </>
        )}
      </div>

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
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700">{m.name}</p>
                <p className="text-xs text-slate-400">{m.email}</p>
              </div>
              {isCreator && Number(m.id) !== Number(auth.user.id) && (
                <button
                  onClick={() => handleKick(m.id, m.name)}
                  disabled={kickingUserId === m.id}
                  className="flex-shrink-0 text-xs px-2.5 py-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition disabled:opacity-50"
                >
                  {kickingUserId === m.id ? '…' : '踢出'}
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Settlement history */}
      <section className="bg-white rounded-2xl border border-slate-100 p-4 mb-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 mb-3">還款紀錄</p>
        {history.length === 0 ? (
          <p className="text-sm text-slate-400">尚無還款紀錄</p>
        ) : (
          <ul className="space-y-2">
            {history.map(h => (
              <li key={h.id} className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-slate-700">
                    <span className="font-medium">{h.fromUserName}</span>
                    <span className="text-slate-400 mx-1">還給</span>
                    <span className="font-medium">{h.toUserName}</span>
                  </span>
                  {h.note && (
                    <span className="text-xs text-slate-400 ml-2">{h.note}</span>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-semibold text-green-600">NT${h.amount}</span>
                  <p className="text-xs text-slate-400">
                    {new Date(h.createdAt).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
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
      <section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm mb-4">
        <p className="text-sm font-medium text-slate-500 mb-3">邀請成員</p>

        {/* Friends quick-add */}
        {friends.filter(f => !members.some(m => m.id === f.friendId)).length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-slate-400 mb-2">從朋友列表選擇</p>
            <div className="flex flex-wrap gap-2">
              {friends
                .filter(f => !members.some(m => m.id === f.friendId))
                .map(f => (
                  <button
                    key={f.friendId}
                    type="button"
                    onClick={() => handleInviteFriend(f)}
                    disabled={!!invitingFriendId}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium disabled:opacity-50 active:scale-95 transition-transform"
                  >
                    <span className="w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center text-xs font-bold">
                      {f.name.charAt(0)}
                    </span>
                    {invitingFriendId === f.friendId ? '…' : f.name}
                  </button>
                ))}
            </div>
          </div>
        )}

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

      {/* Delete group (creator only) */}
      {isCreator && (
        <button
          onClick={handleDeleteGroup}
          disabled={deleting}
          className="w-full text-sm text-red-400 hover:text-red-600 border border-red-100 hover:border-red-200 hover:bg-red-50 py-3 rounded-2xl transition disabled:opacity-50 mb-4"
        >
          {deleting ? '刪除中…' : '刪除群組'}
        </button>
      )}
    </div>
  );
}
