import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';

export default function InviteAccept() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState(null);
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    apiFetch(`/api/invite/${token}`)
      .then(setInfo)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleAccept() {
    setAccepting(true);
    try {
      const { groupName } = await apiFetch(`/api/invite/${token}/accept`, { method: 'POST' });
      navigate('/groups', { state: { joined: groupName } });
    } catch (err) {
      setError(err.message);
    } finally {
      setAccepting(false);
    }
  }

  if (loading) return <div className="text-center text-slate-400 text-sm py-12">載入中…</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-sm w-full text-center">
        <div className="text-4xl mb-4">✉️</div>
        {error ? (
          <>
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <Link to="/" className="text-indigo-500 text-sm">回首頁</Link>
          </>
        ) : info?.expired ? (
          <>
            <p className="text-lg font-bold text-slate-700 mb-2">邀請已過期</p>
            <p className="text-slate-400 text-sm mb-4">請聯絡群組管理員重新發送邀請。</p>
            <Link to="/" className="text-indigo-500 text-sm">回首頁</Link>
          </>
        ) : (
          <>
            <p className="text-lg font-bold text-slate-700 mb-1">{info?.inviterName} 邀請你加入</p>
            <p className="text-2xl font-bold text-indigo-600 mb-6">{info?.groupName}</p>
            {isLoggedIn ? (
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition"
              >
                {accepting ? '加入中…' : '接受邀請'}
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-slate-500 text-sm mb-3">請先登入或註冊以接受邀請</p>
                <Link
                  to={`/login?redirect=/invite/${token}`}
                  className="block w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-xl transition"
                >
                  登入
                </Link>
                <Link
                  to={`/register?redirect=/invite/${token}`}
                  className="block w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-3 rounded-xl transition"
                >
                  註冊
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
