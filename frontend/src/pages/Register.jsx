import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      const loginPath = redirect !== '/' ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login';
      navigate(loginPath);
    } catch (err) {
      if (err.status === 409) {
        setError('此 Email 已被註冊');
      } else {
        setError('註冊失敗，請稍後再試');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleRegister(credential) {
    setError('');
    setLoading(true);
    try {
      const data = await apiFetch('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential }),
      });
      login(data.token, {
        id: data.id,
        name: data.name,
        email: data.email,
        hasPassword: data.hasPassword,
        providers: data.providers,
      });
      navigate(redirect);
    } catch (err) {
      setError(err.message || 'Google 註冊失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-indigo-700 mb-1">分派 Fenpai</h1>
        <p className="text-slate-500 text-sm mb-6">建立新帳號</p>

        {error && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">名稱</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="你的名字"
            />
          </div>
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
              minLength={8}
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
            {loading ? '註冊中...' : '註冊'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
          <div className="h-px flex-1 bg-slate-200" />
          <span>或</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <GoogleSignInButton
          disabled={loading}
          onCredential={handleGoogleRegister}
          onError={() => setError('Google 註冊初始化失敗')}
          text="signup_with"
        />

        <p className="text-center text-sm text-slate-500 mt-5">
          已有帳號？{' '}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">
            登入
          </Link>
        </p>
      </div>
    </div>
  );
}
