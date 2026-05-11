import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

function SettleModal({ friend, balance, currentUserId, onClose, onSettled }) {
  const positive = balance > 0; // friend owes me → I receive; negative → I pay
  const [amount, setAmount] = useState(balance !== 0 ? String(Math.abs(balance)) : '');
  const [iPayFriend, setIPayFriend] = useState(!positive); // who pays whom
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError('請輸入金額'); return; }
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch('/api/balances/settle', {
        method: 'POST',
        body: JSON.stringify({
          groupId: null,
          fromUserId: iPayFriend ? currentUserId : friend.friendId,
          toUserId:   iPayFriend ? friend.friendId : currentUserId,
          amount: amt,
          note: note.trim() || null,
        }),
      });
      onSettled();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
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
          <h2 className="text-base font-semibold text-slate-700 mb-4">記錄還款</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Direction toggle */}
            <div className="flex gap-2">
              <button type="button"
                onClick={() => setIPayFriend(true)}
                disabled={balance > 0}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
                  iPayFriend ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'
                } disabled:opacity-30 disabled:cursor-not-allowed`}>
                我還 {friend.name}
              </button>
              <button type="button"
                onClick={() => setIPayFriend(false)}
                disabled={balance < 0}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
                  !iPayFriend ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'
                } disabled:opacity-30 disabled:cursor-not-allowed`}>
                {friend.name} 還我
              </button>
            </div>

            {/* Amount */}
            <div>
              <label className="text-sm text-slate-500 block mb-1.5">金額</label>
              <input
                type="number" min="1" step="1"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                required
              />
            </div>

            {/* Note */}
            <div>
              <label className="text-sm text-slate-500 block mb-1.5">備註（選填）</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="例：轉帳、Line Pay…"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit" disabled={submitting}
              className="w-full bg-indigo-500 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-50"
            >
              {submitting ? '儲存中…' : '確認'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default function FriendDetail() {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();

  const [friend, setFriend] = useState(null);
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSettle, setShowSettle] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      apiFetch('/api/friends'),
      apiFetch(`/api/friends/${friendId}/history`).catch(() => []),
    ]).then(([friends, hist]) => {
        const f = friends.find(f => String(f.friendId) === String(friendId));
        if (!f) { navigate('/friends'); return; }
        setFriend(f);
        setBalance(Number(f.balance));
        setHistory(hist);
      }).catch(() => navigate('/friends'))
        .finally(() => setLoading(false));
  }, [friendId, navigate]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!friend) return null;

  const settled  = balance === 0;
  const positive = balance > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-100 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate('/friends')} className="text-slate-500 active:scale-90 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-semibold">
              {friend.name.charAt(0)}
            </div>
            <h1 className="text-base font-bold text-slate-800">{friend.name}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Balance card */}
        <div className={`rounded-2xl p-5 text-center shadow-sm ${
          settled ? 'bg-slate-100' : positive ? 'bg-green-50' : 'bg-red-50'
        }`}>
          {settled ? (
            <>
              <p className="text-sm text-slate-500 mb-1">目前帳款</p>
              <p className="text-2xl font-bold text-slate-600">已結清 ✓</p>
            </>
          ) : (
            <>
              <p className={`text-sm mb-1 ${positive ? 'text-green-600' : 'text-red-500'}`}>
                {positive ? `${friend.name} 欠你` : `你欠 ${friend.name}`}
              </p>
              <p className={`text-3xl font-bold ${positive ? 'text-green-600' : 'text-red-500'}`}>
                NT${Math.abs(balance).toLocaleString()}
              </p>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate(`/add-expense?friendId=${friendId}`)}
            className="flex flex-col items-center gap-1.5 bg-white rounded-2xl border border-slate-100 shadow-sm py-4 active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-indigo-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-700">新增支出</span>
          </button>

          <button
            onClick={() => setShowSettle(true)}
            className="flex flex-col items-center gap-1.5 bg-white rounded-2xl border border-slate-100 shadow-sm py-4 active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-green-600">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-700">記錄還款</span>
          </button>
        </div>

        {/* Friend info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <p className="text-sm font-medium text-slate-500 mb-3">朋友資訊</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-lg font-semibold">
              {friend.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{friend.name}</p>
              <p className="text-xs text-slate-400">{friend.email}</p>
            </div>
          </div>
        </div>

        {/* Transaction history */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <p className="text-sm font-medium text-slate-500 mb-3">往來紀錄</p>
          {history.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">還沒有往來紀錄</p>
          ) : (
            <div className="space-y-3">
              {history.map((item, i) => {
                const isExpense = item.type === 'EXPENSE';
                const iMyPaid = isExpense && item.paidById === auth.user.id;
                const date = new Date(item.createdAt);
                const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
                return (
                  <div key={`${item.type}-${item.id}-${i}`}
                    className="flex items-start justify-between gap-2 py-2 border-b border-slate-50 last:border-0">
                    <div className="flex items-start gap-2.5">
                      <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isExpense ? 'bg-indigo-50' : 'bg-green-50'
                      }`}>
                        {isExpense ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-indigo-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-green-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-slate-700">
                          {isExpense
                            ? item.description
                            : (item.description || '還款')}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {isExpense
                            ? `${iMyPaid ? '我' : friend.name} 付款${item.groupName ? ` · ${item.groupName}` : ''}`
                            : `${item.fromUserId === auth.user.id ? '我' : friend.name} → ${item.toUserId === auth.user.id ? '我' : friend.name}`
                          }
                          {' · '}{dateStr}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 flex-shrink-0">
                      NT${Number(item.amount).toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showSettle && (
        <SettleModal
          friend={friend}
          balance={balance}
          currentUserId={auth.user.id}
          onClose={() => setShowSettle(false)}
          onSettled={load}
        />
      )}
    </div>
  );
}
