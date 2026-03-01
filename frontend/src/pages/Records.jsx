import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function Records() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch('/api/groups')
      .then(groups => {
        if (groups.length === 0) return [];
        return Promise.all(
          groups.map(g =>
            apiFetch(`/api/expenses/group/${g.id}`)
              .then(exps => exps.map(e => ({ ...e, groupName: g.name })))
              .catch(() => [])
          )
        ).then(results => results.flat());
      })
      .then(all => {
        all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setExpenses(all);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <h2 className="text-xl font-bold text-slate-700 mb-6">帳單</h2>
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-2xl h-20 animate-pulse border border-slate-100" />
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <h2 className="text-xl font-bold text-slate-700 mb-6">帳單</h2>
      <div className="bg-red-50 text-red-600 rounded-2xl p-4 text-sm">{error}</div>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <h2 className="text-xl font-bold text-slate-700 mb-6">帳單</h2>

      {expenses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
          <p className="text-slate-400 text-sm mb-3">尚無支出紀錄</p>
          <button
            onClick={() => navigate('/add-expense')}
            className="text-indigo-500 text-sm"
          >
            新增第一筆支出 →
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {expenses.map(exp => {
            const paidByMe = exp.paidBy?.id === auth.user.id;
            return (
              <li key={exp.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{exp.description}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                        {exp.groupName}
                      </span>
                      <span className="text-xs text-slate-400">
                        {paidByMe ? '我' : (exp.paidBy?.name ?? '?')} 付款
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        exp.splitType === 'EQUAL'
                          ? 'bg-indigo-50 text-indigo-500'
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {exp.splitType === 'EQUAL' ? '均分' : '自訂'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-semibold text-slate-800">
                      ${Number(exp.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {exp.createdAt ? formatDate(exp.createdAt) : ''}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
