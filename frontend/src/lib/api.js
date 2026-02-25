/**
 * API base URL:
 * - 本地開發 (npm run dev): 空字串 → Vite proxy 將 /api 轉發到 localhost:8080
 * - Docker Compose:         空字串 → nginx proxy 將 /api 轉發到 backend:8080
 * - Zeabur:                 設定 VITE_API_URL=https://your-backend.zeabur.app
 */
export const API_BASE = import.meta.env.VITE_API_URL ?? '';

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.message ?? res.statusText), { status: res.status, body });
  }
  return res.status === 204 ? null : res.json();
}
