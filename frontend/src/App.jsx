import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import QRGenerator from './components/qr/QRGenerator';

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-indigo-700 mb-2">分派 Fenpai</h1>
      <p className="text-slate-500 mb-8">台灣分帳神器</p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <a
          href="/qr"
          className="block text-center bg-indigo-600 text-white rounded-xl py-3 font-semibold shadow-md hover:bg-indigo-700 transition-colors"
        >
          催繳 QR Code
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/qr" element={<QRGenerator />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
