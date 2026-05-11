import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';

function BalanceSheet({ onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/balances/summary')
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalOwed = Number(data?.totalOwedToMe ?? 0);
  const totalIOwe = Number(data?.totalIOwe ?? 0);
  const total = totalOwed + totalIOwe;
  const greenPct = total === 0 ? 50 : (totalOwed / total) * 100;
  const redPct   = total === 0 ? 50 : (totalIOwe  / total) * 100;
  const settled  = total === 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
        <div className="w-full max-w-lg bg-white rounded-t-3xl shadow-2xl pb-10">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-slate-200" />
          </div>

          <div className="px-5 pt-2 pb-4">
            <h2 className="text-base font-semibold text-slate-700 mb-4">餘額總覽</h2>

            {loading ? (
              <div className="space-y-3">
                <div className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
                <div className="h-4 rounded-full bg-slate-100 animate-pulse" />
              </div>
            ) : (
              <>
                {/* Amounts */}
                <div className="flex justify-between mb-3">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">別人欠我</p>
                    <p className="text-xl font-bold text-green-600">
                      {settled ? '—' : `NT$${totalOwed.toLocaleString()}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 mb-0.5">我欠別人</p>
                    <p className="text-xl font-bold text-red-500">
                      {settled ? '—' : `NT$${totalIOwe.toLocaleString()}`}
                    </p>
                  </div>
                </div>

                {/* Tug-of-war bar */}
                {settled ? (
                  <div className="flex items-center justify-center gap-2 py-3">
                    <div className="w-full h-3 rounded-full bg-slate-100" />
                    <span className="absolute text-xs text-slate-400 font-medium">All settled ✓</span>
                  </div>
                ) : (
                  <div className="mb-1">
                    <div className="w-full h-3 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${greenPct}%` }}
                        className="bg-green-500 transition-all duration-500"
                      />
                      <div
                        style={{ width: `${redPct}%` }}
                        className="bg-red-400 transition-all duration-500"
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-green-500">{Math.round(greenPct)}%</span>
                      <span className="text-xs text-red-400">{Math.round(redPct)}%</span>
                    </div>
                  </div>
                )}

                {/* Friend list */}
                {data?.friends?.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {data.friends
                      .filter(f => Number(f.balance) !== 0)
                      .sort((a, b) => Math.abs(Number(b.balance)) - Math.abs(Number(a.balance)))
                      .map(f => {
                        const bal = Number(f.balance);
                        const positive = bal > 0;
                        return (
                          <div key={f.friendId}
                            className="flex items-center justify-between py-2 border-b border-slate-50">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-semibold">
                                {f.name.charAt(0)}
                              </div>
                              <span className="text-sm text-slate-700">{f.name}</span>
                            </div>
                            <span className={`text-sm font-semibold ${positive ? 'text-green-600' : 'text-red-500'}`}>
                              {positive ? '+' : ''}NT${Math.abs(bal).toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}

                {data?.friends?.length === 0 && (
                  <p className="text-center text-sm text-slate-400 mt-4">還沒有朋友紀錄</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const tabs = [
  {
    path: '/friends',
    label: '朋友',
    icon: (active) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
        strokeWidth={active ? 2.2 : 1.8} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
  },
  {
    path: '/groups',
    label: '群組',
    icon: (active) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
        strokeWidth={active ? 2.2 : 1.8} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
  },
  { path: null, label: null, icon: null }, // center balance button placeholder
  {
    path: '/records',
    label: '帳單',
    icon: (active) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
        strokeWidth={active ? 2.2 : 1.8} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
      </svg>
    ),
  },
  {
    path: '/profile',
    label: '用戶',
    icon: (active) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
        strokeWidth={active ? 2.2 : 1.8} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {sheetOpen && <BalanceSheet onClose={() => setSheetOpen(false)} />}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-lg">
        <div className="flex items-end justify-around max-w-lg mx-auto px-2 h-16">
          {tabs.map((tab) => {
            if (tab.path === null) {
              return (
                <button
                  key="balance"
                  onClick={() => setSheetOpen(true)}
                  className="relative -top-5 flex items-center justify-center w-14 h-14 rounded-full bg-indigo-600 text-white shadow-xl active:scale-95 transition-transform"
                  aria-label="餘額總覽"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </button>
              );
            }

            const active = isActive(tab.path);
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full pt-1 transition-colors
                  ${active ? 'text-indigo-600' : 'text-slate-400'}`}
              >
                {tab.icon(active)}
                <span className={`text-xs ${active ? 'font-semibold' : 'font-normal'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
