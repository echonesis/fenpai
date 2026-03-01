import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiFetch } from "../../lib/api";

const BANKS = [
  { code: "004", name: "臺灣銀行" },
  { code: "005", name: "土地銀行" },
  { code: "006", name: "合作金庫" },
  { code: "007", name: "第一銀行" },
  { code: "008", name: "華南銀行" },
  { code: "009", name: "彰化銀行" },
  { code: "011", name: "上海商銀" },
  { code: "012", name: "台北富邦" },
  { code: "013", name: "國泰世華" },
  { code: "017", name: "兆豐銀行" },
  { code: "021", name: "花旗銀行" },
  { code: "037", name: "台灣企銀" },
  { code: "048", name: "王道銀行" },
  { code: "050", name: "台灣中小企業銀行" },
  { code: "052", name: "渣打銀行" },
  { code: "053", name: "台中銀行" },
  { code: "054", name: "京城銀行" },
  { code: "081", name: "滙豐銀行" },
  { code: "101", name: "瑞興銀行" },
  { code: "102", name: "華泰銀行" },
  { code: "103", name: "台灣新光銀行" },
  { code: "108", name: "陽信銀行" },
  { code: "118", name: "板信銀行" },
  { code: "147", name: "三信銀行" },
  { code: "700", name: "中華郵政" },
  { code: "803", name: "聯邦銀行" },
  { code: "806", name: "元大銀行" },
  { code: "807", name: "永豐銀行" },
  { code: "808", name: "玉山銀行" },
  { code: "809", name: "凱基銀行" },
  { code: "810", name: "星展銀行" },
  { code: "812", name: "台新銀行" },
  { code: "816", name: "安泰銀行" },
  { code: "822", name: "中國信託" },
  { code: "823", name: "樂天銀行" },
  { code: "824", name: "將來銀行" },
  { code: "826", name: "遠東銀行" },
  { code: "828", name: "陽光銀行" },
  { code: "830", name: "國際合併銀行" },
  { code: "832", name: "法國巴黎銀行" },
  { code: "834", name: "摩根大通銀行" },
  { code: "836", name: "美國銀行" },
  { code: "838", name: "東亞銀行" },
  { code: "840", name: "瑞士信貸銀行" },
  { code: "842", name: "荷蘭銀行" },
  { code: "844", name: "有限責任高雄第三信用合作社" },
  { code: "846", name: "美商道富銀行" },
  { code: "848", name: "德意志銀行" },
  { code: "850", name: "農業信用" },
];

function buildTWQRString(bankCode, account, amount) {
  const d1 = amount ? Math.round(parseFloat(amount) * 100) : null;
  const d6 = account.padStart(16, '0');
  let str = `TWQRP://個人轉帳/158/02/V1?D5=${bankCode}&D6=${d6}&D10=901`;
  if (d1) str += `&D1=${d1}`;
  return str;
}

function QRDisplay({ value, size = 240 }) {
  const encoded = encodeURIComponent(value);
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&margin=10&color=1a1a2e&bgcolor=f0f4ff`;
  return (
    <img
      src={url}
      alt="TWQR QR Code"
      width={size}
      height={size}
      style={{ borderRadius: 12, display: "block" }}
    />
  );
}

function Step({ num, label, active, done }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: active || done ? 1 : 0.4 }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: done ? "#22c55e" : active ? "#6366f1" : "#e2e8f0",
        color: done || active ? "#fff" : "#94a3b8",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 700, flexShrink: 0,
        transition: "all 0.3s"
      }}>
        {done ? "✓" : num}
      </div>
      <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "#312e81" : "#64748b" }}>
        {label}
      </span>
    </div>
  );
}

export default function QRGenerator() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [form, setForm] = useState({ label: "", bankCode: "004", account: "" });
  const [savingAccount, setSavingAccount] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [payerName, setPayerName] = useState(searchParams.get("payerName") ?? "");
  const [amount, setAmount] = useState(searchParams.get("amount") ?? "");
  const [memo, setMemo] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiFetch("/api/accounts")
      .then(setAccounts)
      .catch(() => setAccounts([]))
      .finally(() => setLoadingAccounts(false));
  }, []);

  const addAccount = async () => {
    if (!form.label || !form.bankCode || !form.account) return;
    setSavingAccount(true);
    try {
      const newAcc = await apiFetch("/api/accounts", {
        method: "POST",
        body: JSON.stringify({ label: form.label, bankCode: form.bankCode, accountNumber: form.account }),
      });
      setAccounts(prev => [...prev, newAcc]);
      setForm({ label: "", bankCode: "004", account: "" });
    } catch {
      // ignore
    } finally {
      setSavingAccount(false);
    }
  };

  const removeAccount = async (id) => {
    try {
      await apiFetch(`/api/accounts/${id}`, { method: "DELETE" });
      setAccounts(prev => prev.filter(a => a.id !== id));
      if (selectedAccount?.id === id) setSelectedAccount(null);
    } catch {
      // ignore
    }
  };

  const getBankName = (code) => BANKS.find(b => b.code === code)?.name || code;

  const qrValue = selectedAccount
    ? buildTWQRString(selectedAccount.bankCode, selectedAccount.accountNumber, amount)
    : "";

  const copyQRString = () => {
    navigator.clipboard.writeText(qrValue).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadQR = () => {
    const encoded = encodeURIComponent(qrValue);
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encoded}&margin=10&color=1a1a2e&bgcolor=f0f4ff`;
    const a = document.createElement("a");
    a.href = url;
    a.download = `twqr-${payerName || "payment"}.png`;
    a.click();
  };

  const card = {
    background: "#fff",
    borderRadius: 16,
    padding: "24px 28px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(99,102,241,0.06)",
    marginBottom: 20,
  };

  const input = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1.5px solid #e2e8f0",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    color: "#1e293b",
    background: "#f8fafc",
    transition: "border 0.2s",
  };

  const btn = (variant = "primary") => ({
    padding: "10px 20px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    transition: "all 0.2s",
    ...(variant === "primary" ? {
      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      color: "#fff",
      boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
    } : variant === "success" ? {
      background: "linear-gradient(135deg, #22c55e, #16a34a)",
      color: "#fff",
      boxShadow: "0 2px 8px rgba(34,197,94,0.3)",
    } : variant === "ghost" ? {
      background: "#f1f5f9",
      color: "#64748b",
    } : {
      background: "#fee2e2",
      color: "#dc2626",
    })
  });

  const labelStyle = { fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6, display: "block" };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)",
      fontFamily: "'Noto Sans TC', 'PingFang TC', sans-serif",
      padding: "20px 16px 40px",
    }}>
      {/* Header */}
      <div style={{ maxWidth: 520, margin: "0 auto 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, boxShadow: "0 4px 12px rgba(99,102,241,0.3)"
          }}>💸</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1e1b4b", letterSpacing: -0.5 }}>
              催繳 QR Code
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: "#7c3aed" }}>TWQR 轉帳條碼產生器</p>
          </div>
          <Link to="/profile" style={{ fontSize: 13, color: "#6366f1", textDecoration: "none", fontWeight: 500 }}>
            ← 用戶
          </Link>
        </div>

        {/* Step bar */}
        <div style={{ display: "flex", gap: 20, marginTop: 20, paddingLeft: 4 }}>
          <Step num={1} label="設定帳戶" active={step === 1} done={step > 1} />
          <div style={{ width: 24, height: 1, background: "#cbd5e1", alignSelf: "center", marginTop: -2 }} />
          <Step num={2} label="催繳金額" active={step === 2} done={step > 2} />
          <div style={{ width: 24, height: 1, background: "#cbd5e1", alignSelf: "center", marginTop: -2 }} />
          <Step num={3} label="產生 QR Code" active={step === 3} done={false} />
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto" }}>

        {/* ── Step 1: 帳戶管理 ── */}
        {step === 1 && (
          <>
            <div style={card}>
              <h2 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700, color: "#1e1b4b" }}>
                新增收款帳戶
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={labelStyle}>帳戶名稱（顯示用）</label>
                  <input style={input} placeholder="例：玉山數位帳戶、郵局帳戶" value={form.label}
                    onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>銀行</label>
                  <select style={{ ...input }} value={form.bankCode}
                    onChange={e => setForm(f => ({ ...f, bankCode: e.target.value }))}>
                    {BANKS.map(b => (
                      <option key={b.code} value={b.code}>{b.code} {b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>帳號</label>
                  <input style={input} placeholder="輸入帳號（不含空格）" value={form.account}
                    onChange={e => setForm(f => ({ ...f, account: e.target.value.replace(/\s/g, "") }))} />
                </div>
                <button
                  style={{ ...btn("primary"), marginTop: 4, opacity: savingAccount ? 0.6 : 1 }}
                  onClick={addAccount}
                  disabled={!form.label || !form.account || savingAccount}>
                  {savingAccount ? "儲存中..." : "＋ 新增帳戶"}
                </button>
              </div>
            </div>

            {loadingAccounts ? (
              <div style={{ ...card, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                載入帳戶中...
              </div>
            ) : accounts.length > 0 && (
              <div style={card}>
                <h2 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: "#1e1b4b" }}>
                  已儲存帳戶
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {accounts.map(acc => (
                    <div key={acc.id} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 14px", borderRadius: 10, background: "#f8fafc",
                      border: "1.5px solid #e2e8f0"
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>{acc.label}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                          {getBankName(acc.bankCode)} · {acc.accountNumber}
                        </div>
                      </div>
                      <button style={{ ...btn("danger"), padding: "6px 12px", fontSize: 12 }}
                        onClick={() => removeAccount(acc.id)}>刪除</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              style={{ ...btn("primary"), width: "100%", padding: "13px 20px", fontSize: 15, opacity: accounts.length === 0 ? 0.5 : 1 }}
              disabled={accounts.length === 0}
              onClick={() => setStep(2)}>
              下一步：設定催繳金額 →
            </button>
          </>
        )}

        {/* ── Step 2: 催繳設定 ── */}
        {step === 2 && (
          <>
            <div style={card}>
              <h2 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700, color: "#1e1b4b" }}>
                選擇收款帳戶
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {accounts.map(acc => (
                  <div key={acc.id}
                    onClick={() => setSelectedAccount(acc)}
                    style={{
                      padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                      border: `2px solid ${selectedAccount?.id === acc.id ? "#6366f1" : "#e2e8f0"}`,
                      background: selectedAccount?.id === acc.id ? "#eef2ff" : "#f8fafc",
                      transition: "all 0.2s"
                    }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: "50%",
                        border: `2px solid ${selectedAccount?.id === acc.id ? "#6366f1" : "#cbd5e1"}`,
                        background: selectedAccount?.id === acc.id ? "#6366f1" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                      }}>
                        {selectedAccount?.id === acc.id && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>{acc.label}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>{getBankName(acc.bankCode)} · {acc.accountNumber}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={card}>
              <h2 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700, color: "#1e1b4b" }}>
                催繳資訊
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={labelStyle}>付款人姓名（選填）</label>
                  <input style={input} placeholder="例：小明、阿強" value={payerName}
                    onChange={e => setPayerName(e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>金額（元）</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 14 }}>NT$</span>
                    <input style={{ ...input, paddingLeft: 44 }} type="number" placeholder="0" value={amount}
                      onChange={e => setAmount(e.target.value)} min="0" step="1" />
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: 11, color: "#94a3b8" }}>
                    ※ 部分銀行 App 會自動帶入金額供確認，實際以轉帳時顯示為準
                  </p>
                </div>
                <div>
                  <label style={labelStyle}>備註（選填，僅顯示用）</label>
                  <input style={input} placeholder="例：3月聚餐費、日本旅遊分帳" value={memo}
                    onChange={e => setMemo(e.target.value)} />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...btn("ghost"), flex: 1 }} onClick={() => setStep(1)}>← 上一步</button>
              <button
                style={{ ...btn("primary"), flex: 2, opacity: !selectedAccount || !amount ? 0.5 : 1 }}
                disabled={!selectedAccount || !amount}
                onClick={() => setStep(3)}>
                產生 QR Code →
              </button>
            </div>
          </>
        )}

        {/* ── Step 3: QR Code ── */}
        {step === 3 && selectedAccount && (
          <>
            <div style={{
              ...card,
              background: "linear-gradient(135deg, #1e1b4b, #312e81)",
              color: "#fff", textAlign: "center"
            }}>
              {payerName && (
                <p style={{ margin: "0 0 4px", fontSize: 13, opacity: 0.7 }}>催繳對象</p>
              )}
              {payerName && (
                <p style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700 }}>{payerName}</p>
              )}
              <p style={{ margin: "0 0 4px", fontSize: 13, opacity: 0.7 }}>請轉帳金額</p>
              <p style={{ margin: "0 0 8px", fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>
                NT$ {parseFloat(amount).toLocaleString()}
              </p>
              {memo && <p style={{ margin: 0, fontSize: 13, opacity: 0.7, background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "4px 12px", display: "inline-block" }}>{memo}</p>}
            </div>

            <div style={{ ...card, textAlign: "center" }}>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>
                用手機銀行 App 掃描以下 QR Code
              </p>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <div style={{
                  padding: 16, borderRadius: 16, background: "#f0f4ff",
                  border: "2px solid #c7d2fe",
                  boxShadow: "0 4px 20px rgba(99,102,241,0.15)"
                }}>
                  <QRDisplay value={qrValue} size={220} />
                </div>
              </div>

              <div style={{
                background: "#f8fafc", borderRadius: 10, padding: "12px 16px",
                border: "1px solid #e2e8f0", marginBottom: 16, textAlign: "left"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#64748b" }}>收款銀行</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                    {selectedAccount.bankCode} {getBankName(selectedAccount.bankCode)}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#64748b" }}>帳號</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", letterSpacing: 1 }}>
                    {selectedAccount.accountNumber}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#64748b" }}>帳戶標籤</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                    {selectedAccount.label}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ ...btn("ghost"), flex: 1, fontSize: 13 }} onClick={copyQRString}>
                  {copied ? "✓ 已複製" : "複製 QR 字串"}
                </button>
                <button style={{ ...btn("success"), flex: 1, fontSize: 13 }} onClick={downloadQR}>
                  ↓ 下載圖片
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...btn("ghost"), flex: 1 }} onClick={() => setStep(2)}>← 修改金額</button>
              <button style={{ ...btn("primary"), flex: 1 }} onClick={() => { setAmount(""); setPayerName(""); setMemo(""); setStep(2); }}>
                產生新的
              </button>
            </div>

            <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 12 }}>
              QR Code 格式符合 TWQR 台灣共通支付標準<br />
              支援多數銀行行動 App 掃碼轉帳
            </p>
          </>
        )}
      </div>
    </div>
  );
}
