import { useEffect, useRef, useState } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

export default function GoogleSignInButton({ onCredential, onError, disabled = false, text = 'continue_with' }) {
  const buttonRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !buttonRef.current) {
      return;
    }

    let cancelled = false;
    let intervalId;

    const renderButton = () => {
      if (cancelled || !buttonRef.current || !window.google?.accounts?.id) {
        return false;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: ({ credential }) => {
          if (credential) {
            onCredential(credential);
            return;
          }
          onError?.(new Error('Missing Google credential'));
        },
      });

      buttonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        text,
        shape: 'pill',
        size: 'large',
        width: 320,
      });

      setReady(true);
      return true;
    };

    if (!renderButton()) {
      intervalId = window.setInterval(() => {
        if (renderButton()) {
          window.clearInterval(intervalId);
        }
      }, 250);
    }

    return () => {
      cancelled = true;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [onCredential, onError, text]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
        尚未設定 Google 登入，請配置 `VITE_GOOGLE_CLIENT_ID`。
      </p>
    );
  }

  return (
    <div className={disabled ? 'pointer-events-none opacity-60' : ''}>
      <div ref={buttonRef} className="min-h-11 flex justify-center" />
      {!ready && (
        <p className="text-xs text-slate-400 text-center mt-2">載入 Google 登入中…</p>
      )}
    </div>
  );
}
