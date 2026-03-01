import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';

export default function Dashboard() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [iOwe, setIOwe] = useState(null);
  const [owedToMe, setOwedToMe] = useState(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? '早安' : hour < 18 ? '午安' : '晚安';

  useEffect(() => {
    apiFetch('/api/groups')
      .then(gs => {
        setGroups(gs);
        return Promise.all(
          gs.map(g => apiFetch(`/api/balances/group/${g.id}`).catch(() => []))
        );
      })
      .then(allBalances => {
        const userId = Number(auth.user.id);
        let owe = 0, owed = 0;
        allBalances.flat().forEach(b => {
          if (Number(b.fromUserId) === userId) owe += Number(b.amount);
          if (Number(b.toUserId) === userId) owed += Number(b.amount);
        });
        setIOwe(owe);
        setOwedToMe(owed);
      })
      .catch(() => setGroups([]))
      .finally(() => setLoadingGroups(false));
  }, [auth.user.id]);

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-indigo-700">分派 Fenpai</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {greeting}，<span className="font-medium text-slate-700">{auth.user.name}</span>！
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
          {auth.user.name?.[0]?.toUpperCase()}
        </div>
      </div>

      {/* 待結清摘要 */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">待結清</p>
        <div className="flex gap-4">
          <div className="flex-1 bg-red-50 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">我欠別人</p>
            <p className="text-lg font-bold text-red-500">
              {iOwe === null ? '…' : iOwe === 0 ? '✓' : `NT$${iOwe}`}
            </p>
          </div>
          <div className="flex-1 bg-green-50 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">別人欠我</p>
            <p className="text-lg font-bold text-green-600">
              {owedToMe === null ? '…' : owedToMe === 0 ? '✓' : `NT$${owedToMe}`}
            </p>
          </div>
        </div>
      </div>

      {/* 群組列表 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-600">我的群組</p>
          <button
            onClick={() => navigate('/groups')}
            className="text-xs text-indigo-500 hover:text-indigo-700"
          >
            全部
          </button>
        </div>

        {loadingGroups ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-16 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
            <p className="text-slate-400 text-sm">還沒有群組</p>
            <button
              onClick={() => navigate('/groups')}
              className="mt-3 text-indigo-600 text-sm font-medium hover:text-indigo-700"
            >
              建立第一個群組 →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {groups.slice(0, 5).map((group) => (
              <button
                key={group.id}
                onClick={() => navigate(`/groups/${group.id}`)}
                className="w-full bg-white rounded-2xl border border-slate-100 px-4 py-3.5 flex items-center justify-between hover:border-indigo-200 transition-colors active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                    {group.name?.[0]}
                  </div>
                  <span className="font-medium text-slate-700 text-sm">{group.name}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                  strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
