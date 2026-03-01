import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function AddExpense() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { auth } = useAuth();

  const presetGroupId = searchParams.get('groupId');

  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(null);
  const [splitType, setSplitType] = useState('EQUAL');
  const [customSplits, setCustomSplits] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  function fetchGroupAndMembers(gid) {
    setLoadingMembers(true);
    Promise.all([
      apiFetch(`/api/groups/${gid}`),
      apiFetch(`/api/groups/${gid}/members`),
    ])
      .then(([g, m]) => {
        setSelectedGroup(g);
        setMembers(m);
        setPaidBy(auth.user.id);
        const init = {};
        m.forEach(mem => { init[mem.id] = ''; });
        setCustomSplits(init);
      })
      .catch(() => {})
      .finally(() => setLoadingMembers(false));
  }

  // Fetch groups list when no presetGroupId
  useEffect(() => {
    if (presetGroupId) return;
    setLoadingGroups(true);
    apiFetch('/api/groups')
      .then(setGroups)
      .catch(() => setGroups([]))
      .finally(() => setLoadingGroups(false));
  }, [presetGroupId]);

  // Fetch group info + members from URL param (runs once on mount)
  useEffect(() => {
    if (presetGroupId) fetchGroupAndMembers(presetGroupId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetGroupId]);

  function handleSelectGroup(group) {
    setDescription('');
    setAmount('');
    setSplitType('EQUAL');
    setCustomSplits({});
    setMessage(null);
    fetchGroupAndMembers(group.id);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const desc = description.trim();
    const amt = parseFloat(amount);

    if (!desc || isNaN(amt) || amt <= 0) {
      setMessage({ type: 'error', text: '請填寫完整的描述和金額。' });
      return;
    }
    if (!paidBy) {
      setMessage({ type: 'error', text: '請選擇付款人。' });
      return;
    }

    let splits = null;
    if (splitType === 'CUSTOM') {
      const total = Object.values(customSplits).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
      if (Math.abs(total - amt) > 0.01) {
        setMessage({ type: 'error', text: `自訂分帳加總（${total.toFixed(2)}）不等於總金額（${amt.toFixed(2)}）。` });
        return;
      }
      splits = {};
      Object.entries(customSplits).forEach(([uid, v]) => {
        splits[uid] = parseFloat(v) || 0;
      });
    }

    setSubmitting(true);
    setMessage(null);
    try {
      await apiFetch('/api/expenses', {
        method: 'POST',
        body: JSON.stringify({
          groupId: selectedGroup.id,
          paidByUserId: paidBy,
          description: desc,
          amount: amt,
          splitType,
          customSplits: splits,
        }),
      });
      navigate('/records');
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  const showForm = selectedGroup && !loadingMembers && members.length > 0;
  const amtNum = parseFloat(amount) || 0;
  const customTotal = Object.values(customSplits).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 pb-8">
      <button onClick={() => navigate(-1)} className="text-indigo-500 text-sm mb-4">← 返回</button>
      <h2 className="text-xl font-bold text-slate-700 mb-6">新增支出</h2>

      {/* Step 1: group selection */}
      {!presetGroupId && !selectedGroup && (
        <section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-3">選擇群組</p>
          {loadingGroups ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-slate-100 rounded-xl h-12 animate-pulse" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">尚無群組，請先建立群組。</p>
          ) : (
            <ul className="space-y-2">
              {groups.map(g => (
                <li key={g.id}>
                  <button
                    onClick={() => handleSelectGroup(g)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition text-sm font-medium text-slate-700"
                  >
                    {g.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Loading members */}
      {(presetGroupId || selectedGroup) && loadingMembers && (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="bg-white rounded-2xl h-16 animate-pulse border border-slate-100" />)}
        </div>
      )}

      {/* Step 2: expense form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              群組：<span className="font-medium text-slate-700">{selectedGroup.name}</span>
            </p>
            {!presetGroupId && (
              <button
                type="button"
                onClick={() => { setSelectedGroup(null); setMembers([]); setMessage(null); }}
                className="text-xs text-indigo-500"
              >
                更換
              </button>
            )}
          </div>

          {/* Description */}
          <section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <label className="text-sm font-medium text-slate-500 block mb-2">描述</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="例：晚餐、計程車…"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </section>

          {/* Amount */}
          <section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <label className="text-sm font-medium text-slate-500 block mb-2">金額</label>
            <input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </section>

          {/* Paid by */}
          <section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <label className="text-sm font-medium text-slate-500 block mb-2">誰付款</label>
            <select
              value={paidBy ?? ''}
              onChange={e => setPaidBy(parseInt(e.target.value))}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name}{Number(m.id) === Number(auth.user.id) ? '（我）' : ''}
                </option>
              ))}
            </select>
          </section>

          {/* Split type */}
          <section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500 mb-3">分帳方式</p>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setSplitType('EQUAL')}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                  splitType === 'EQUAL' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                均分
              </button>
              <button
                type="button"
                onClick={() => setSplitType('CUSTOM')}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                  splitType === 'CUSTOM' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                自訂
              </button>
            </div>

            {splitType === 'EQUAL' && (
              <p className="text-xs text-slate-400">將平均分配給全部 {members.length} 位成員。</p>
            )}

            {splitType === 'CUSTOM' && (
              <div className="space-y-2">
                {members.map(m => (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="flex-1 text-sm text-slate-700">
                      {m.name}{Number(m.id) === Number(auth.user.id) ? '（我）' : ''}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={customSplits[m.id] ?? ''}
                      onChange={e => setCustomSplits(prev => ({ ...prev, [m.id]: e.target.value }))}
                      placeholder="0"
                      className="w-24 border border-slate-200 rounded-xl px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                ))}
                {amtNum > 0 && (
                  <p className={`text-xs mt-1 ${Math.abs(customTotal - amtNum) < 0.01 ? 'text-green-600' : 'text-amber-600'}`}>
                    已分配：{customTotal.toFixed(2)} / {amtNum.toFixed(2)}
                  </p>
                )}
              </div>
            )}
          </section>

          {message && (
            <p className={`text-sm px-3 py-2 rounded-xl ${
              message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
            }`}>
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition"
          >
            {submitting ? '儲存中…' : '儲存支出'}
          </button>
        </form>
      )}
    </div>
  );
}
