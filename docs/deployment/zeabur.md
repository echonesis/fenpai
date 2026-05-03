# 部署指南：Zeabur

```
Zeabur Project: fenpai
├── Service: PostgreSQL  （Zeabur 內建 addon）
├── Service: fenpai-backend（Spring Boot，偵測 pom.xml 自動建置）
└── Service: fenpai-frontend（Vite，偵測 package.json 自動建置）
```

---

## 前置準備

- GitHub 帳號
- [Zeabur 帳號](https://zeabur.com)

---

## 第一步：建立 Project

1. 登入 Zeabur → **New Project**
2. 選擇部署區域（建議 `Asia East - Tokyo`）

---

## 第二步：新增 PostgreSQL

1. Project 內點選 **Add Service** → **Marketplace**
2. 搜尋 `PostgreSQL` → 點選建立
3. Zeabur 自動產生資料庫連線資訊，稍後後端服務會自動注入

---

## 第三步：部署後端

1. **Add Service** → **GitHub**，選擇 `fenpai` repo
2. Zeabur 偵測到 `pom.xml`，自動選擇 Java 建置方式
3. 設定 **Root Directory** 為 `backend`
4. 進入服務的 **Variables** 頁，新增以下環境變數：

   > PostgreSQL 連線資訊（`POSTGRES_HOST` / `POSTGRES_PORT` / `POSTGRES_DATABASE` / `POSTGRES_USERNAME` / `POSTGRES_PASSWORD`）由 Zeabur 在同一個 Project 內**自動注入**，不需要手動設定。

   | Key | Value |
   |-----|-------|
   | `SPRING_PROFILES_ACTIVE` | `prod` |
   | `JWT_SECRET` | 本地執行 `openssl rand -hex 64` 後貼入 |
   | `CORS_ORIGINS` | 暫填 `http://localhost:5173`，前端部署後再更新 |
   | `FRONTEND_BASE_URL` | 同上 |
   | `RESEND_API_KEY` | [Resend](https://resend.com) API Key（選填，格式：`re_xxxxxxxxxx`），不設則邀請連結只印在後端 log |

5. **Deploy**，等待建置完成

---

## 第四步：部署前端

1. **Add Service** → **GitHub**，同一個 `fenpai` repo
2. 設定 **Root Directory** 為 `frontend`
3. Zeabur 偵測到 `package.json`，自動以 Vite 建置
4. 進入 **Variables**，新增：

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | Zeabur backend 服務的 URL（如 `https://fenpai-backend.zeabur.app`） |

5. **Deploy**

---

## 第五步：回填前端相關變數

1. 取得前端部署完成的 URL，例如 `https://fenpai-frontend.zeabur.app`
2. 回到後端服務 → **Variables**
3. 填入以下兩個變數（值相同，都是前端 URL）：

   | 變數 | 值 |
   |------|----|
   | `CORS_ORIGINS` | `https://fenpai-frontend.zeabur.app` |
   | `FRONTEND_BASE_URL` | `https://fenpai-frontend.zeabur.app` |

4. 重新部署後端

### 設定 Resend API Key（寄送邀請信）

若要讓系統實際寄出邀請信，需要設定 Resend API Key。不設定也不會報錯，但邀請連結只會印在後端 log 中，使用者收不到信。

1. 前往 [resend.com](https://resend.com) → 註冊／登入
2. 左側選單 → **API Keys** → **Create API Key**
3. 名稱填 `fenpai-production`，權限選 **Full Access**，點 **Add**
4. **複製 API Key**（只會顯示一次，請立即儲存）
5. 回到後端服務 → **Variables** → 新增：
   - Key：`RESEND_API_KEY`
   - Value：貼上 API Key（格式為 `re_xxxxxxxxxx`）
6. 重新部署後端

> **注意：** Resend 免費方案每月可寄 3,000 封信，每天上限 100 封。免費方案只能從 `onboarding@resend.dev` 寄信，收件人必須是你自己的帳號。若要寄給任意使用者，需在 Resend 後台驗證自己的網域（**Domains** → Add Domain）。

---

## 環境變數一覽

### 後端

| 變數 | 來源 | 說明 |
|------|------|------|
| `POSTGRES_HOST` | Zeabur 自動注入 | |
| `POSTGRES_PORT` | Zeabur 自動注入 | |
| `POSTGRES_DATABASE` | Zeabur 自動注入 | |
| `POSTGRES_USERNAME` | Zeabur 自動注入 | |
| `POSTGRES_PASSWORD` | Zeabur 自動注入 | |
| `SPRING_PROFILES_ACTIVE` | **手動填入** | 固定填 `prod` |
| `JWT_SECRET` | **手動填入** | 隨機長字串 |
| `CORS_ORIGINS` | **手動填入** | Zeabur frontend URL |
| `FRONTEND_BASE_URL` | **手動填入** | 同上，用於邀請信連結 |
| `RESEND_API_KEY` | **手動填入**（選填） | Resend API Key（格式：`re_xxxxxxxxxx`），不設則邀請連結只印在後端 log |

### 前端

| 變數 | 說明 |
|------|------|
| `VITE_API_URL` | Zeabur backend URL（含 `https://`，無尾端 `/`） |

---

## 疑難排解

**後端 API 回傳 CORS 錯誤**
→ 確認 `CORS_ORIGINS` 與前端實際 URL 完全一致，無尾端斜線。

**前端 API 無回應**
→ 確認 `VITE_API_URL` 填入的是後端 URL，且**不含**尾端斜線。
