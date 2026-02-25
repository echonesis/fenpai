import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      login(data.token, { id: data.id, name: data.name, email: data.email });
      navigate('/');
    } catch (err) {
      setError(err.status === 401 ? '帳號或密碼錯誤' : '登入失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-indigo-700 mb-1">分派 Fenpai</h1>
        <p className="text-slate-500 text-sm mb-6">登入你的帳號</p>

        {error && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">密碼</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="至少 8 個字元"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white rounded-xl py-2.5 font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? '登入中...' : '登入'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-5">
          還沒有帳號？{' '}
          <Link to="/register" className="text-indigo-600 font-medium hover:underline">
            立即註冊
          </Link>
        </p>
      </div>
    </div>
  );
}
