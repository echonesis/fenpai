# 部署指南：Vercel + Render

免費方案部署前後端分離架構。

```
Vercel  → frontend（靜態網站 + CDN）
Render  → fenpai-backend（Spring Boot Web Service）
Render  → fenpai-db（PostgreSQL）
```

---

## 前置準備

- GitHub 帳號（repo 需為 public，或升級方案）
- [Vercel 帳號](https://vercel.com)
- [Render 帳號](https://render.com)

---

## 第一步：部署 Render（後端 + 資料庫）

Render 會讀取 repo 根目錄的 `render.yaml` 自動建立所有服務。

1. 登入 Render → 點選右上角 **New** → **Blueprint**
2. 連結 GitHub，選擇 `fenpai` repo
3. Render 自動偵測 `render.yaml`，預覽將建立：
   - `fenpai-db`（PostgreSQL，free plan）
   - `fenpai-backend`（Java Web Service，free plan）
4. 點選 **Apply** 開始部署

> 首次建置約需 5～10 分鐘（Maven 下載依賴）。

### 部署完成後：設定 CORS_ORIGINS

後端需要知道前端的 URL 才能允許跨域請求。待 Vercel 部署完成後回來填入。

1. Render Dashboard → `fenpai-backend` → **Environment**
2. 找到 `CORS_ORIGINS`，填入 Vercel 前端網址：
   ```
   https://your-app.vercel.app
   ```
3. 點選 **Save Changes**，服務自動重啟

---

## 第二步：部署 Vercel（前端）

1. 登入 Vercel → 點選 **Add New Project**
2. Import GitHub repo `fenpai`
3. 設定以下選項：

   | 選項 | 值 |
   |------|----|
   | **Root Directory** | `frontend` |
   | **Framework Preset** | Vite |
   | **Build Command** | `npm run build`（預設） |
   | **Output Directory** | `dist`（預設） |

4. 展開 **Environment Variables**，新增：

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://fenpai-backend.onrender.com` |

   > Render backend URL 可在 Render Dashboard → `fenpai-backend` → **Settings** → **URL** 找到。

5. 點選 **Deploy**

### SPA 路由

`frontend/vercel.json` 已設定所有路由導向 `index.html`，重新整理子頁面（如 `/qr`）不會 404。

---

## 第三步：回填 CORS_ORIGINS

1. 取得 Vercel 部署完成的網址，例如 `https://fenpai.vercel.app`
2. 回到 Render → `fenpai-backend` → **Environment**
3. 將 `CORS_ORIGINS` 更新為正確的 Vercel URL
4. **Save Changes**

---

## 環境變數一覽

### Render（後端）

| 變數 | 來源 | 說明 |
|------|------|------|
| `DB_HOST` | 自動（fromDatabase） | PostgreSQL 主機 |
| `DB_PORT` | 自動（fromDatabase） | PostgreSQL 埠號 |
| `DB_NAME` | 自動（fromDatabase） | 資料庫名稱 |
| `DB_USER` | 自動（fromDatabase） | 資料庫使用者 |
| `DB_PASSWORD` | 自動（fromDatabase） | 資料庫密碼 |
| `JWT_SECRET` | 自動（`generateValue: true`）| JWT 簽章密鑰，Render 自動生成，無需手動填寫 |
| `CORS_ORIGINS` | **手動填入** | Vercel 前端 URL |

### Vercel（前端）

| 變數 | 值 | 說明 |
|------|-----|------|
| `VITE_API_URL` | **手動填入** | Render backend URL |

---

## 免費方案限制

| 服務 | 限制 |
|------|------|
| Render Web Service（free） | 閒置 15 分鐘後休眠，首次請求需等待 ~30 秒冷啟動 |
| Render PostgreSQL（free） | 90 天後自動刪除，需定期備份或升級 |
| Vercel（free） | 每月 100GB 頻寬，個人專案足夠 |

> 若不想要冷啟動延遲，可升級 Render 為 **Starter（$7/月）** 或改用 Zeabur。

---

## 疑難排解

**後端 API 回傳 CORS 錯誤**
→ 確認 `CORS_ORIGINS` 填入的 URL 沒有尾端斜線（`/`），且與 Vercel 實際 URL 完全一致。

**前端顯示空白或 API 無回應**
→ 確認 Vercel 的 `VITE_API_URL` 是 Render backend 的完整 URL（含 `https://`，無尾端斜線）。

**Render 建置失敗**
→ 檢查 Render build log，常見原因為 Java 版本不符。確認 Render 使用 Java 17：
在 `fenpai-backend` → **Settings** → **Environment** 加入 `JAVA_HOME` 或在 `render.yaml` 加上：
```yaml
envVars:
  - key: JAVA_VERSION
    value: "17"
```
