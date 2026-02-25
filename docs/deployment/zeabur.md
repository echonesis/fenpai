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

   | Key | Value |
   |-----|-------|
   | `DB_HOST` | 點選「從其他服務注入」→ 選 PostgreSQL → `host` |
   | `DB_PORT` | 同上 → `port` |
   | `DB_NAME` | 同上 → `database` |
   | `DB_USER` | 同上 → `user` |
   | `DB_PASSWORD` | 同上 → `password` |
   | `JWT_SECRET` | 填入隨機長字串（至少 32 字元） |
   | `CORS_ORIGINS` | 待前端部署完成後填入 Zeabur frontend URL |

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

## 第五步：回填 CORS_ORIGINS

1. 取得前端部署完成的 URL，例如 `https://fenpai-frontend.zeabur.app`
2. 回到後端服務 → **Variables**
3. 將 `CORS_ORIGINS` 填入前端 URL
4. 重新部署後端

---

## 環境變數一覽

### 後端

| 變數 | 來源 | 說明 |
|------|------|------|
| `DB_HOST` | 從 PostgreSQL 服務注入 | |
| `DB_PORT` | 從 PostgreSQL 服務注入 | |
| `DB_NAME` | 從 PostgreSQL 服務注入 | |
| `DB_USER` | 從 PostgreSQL 服務注入 | |
| `DB_PASSWORD` | 從 PostgreSQL 服務注入 | |
| `JWT_SECRET` | **手動填入** | 隨機長字串 |
| `CORS_ORIGINS` | **手動填入** | Zeabur frontend URL |

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
