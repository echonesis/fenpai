# 部署指南：Docker Compose（本地 / 自架）

適用情境：本地整合測試、自架伺服器（VPS）。

```
Docker
├── fenpai-postgres   PostgreSQL 16
├── fenpai-backend    Spring Boot JAR
└── fenpai-frontend   Vite build + Nginx
```

---

## 前置準備

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)（macOS / Windows）
- 或 Docker + Docker Compose Plugin（Linux）

確認安裝：
```bash
docker --version
docker compose version
```

---

## 一鍵啟動

```bash
# 在專案根目錄執行
docker compose up --build

# 背景執行
docker compose up --build -d
```

| 服務 | URL |
|------|-----|
| 前端 | http://localhost:5173 |
| 後端 API | http://localhost:8080 |
| PostgreSQL | localhost:5432 |

---

## 常用指令

```bash
# 查看所有服務狀態
docker compose ps

# 查看後端 log
docker compose logs -f backend

# 查看前端 log
docker compose logs -f frontend

# 停止服務（保留資料）
docker compose down

# 停止並刪除資料（慎用）
docker compose down -v

# 只重建並重啟某個服務
docker compose up --build backend -d
```

---

## 本地開發模式（推薦）

完整 `docker compose up` 每次改程式碼都需要重建，開發時建議只用 Docker 跑 DB：

```bash
# 只啟動資料庫
docker compose up postgres -d

# 後端：支援熱重啟
cd backend && mvn spring-boot:run

# 前端：HMR 即時更新
cd frontend && npm run dev
```

| 服務 | URL |
|------|-----|
| 前端（Vite dev） | http://localhost:5173 |
| 後端 | http://localhost:8080 |
| PostgreSQL | localhost:5432 |

---

## 環境變數

`docker-compose.yml` 使用 `SPRING_PROFILES_ACTIVE=prod`，**所有敏感變數沒有預設值，缺少時會直接啟動失敗**。

啟動前必須在專案根目錄建立 `.env` 檔（已加入 `.gitignore`，不會被 commit）：

```bash
# 複製範本
cp .env.example .env
```

`.env` 必填欄位：

| 變數 | 說明 | 生成方式 |
|------|------|----------|
| `JWT_SECRET` | JWT 簽章密鑰 | `openssl rand -hex 64` |

若要啟用 Google SSO，還需要填入以下變數：

| 變數 | 說明 |
|------|------|
| `GOOGLE_CLIENT_ID` | 後端驗證 Google ID token 用的 OAuth Web Client ID |
| `VITE_GOOGLE_CLIENT_ID` | 前端 Vite build 時注入的 Google Identity Services Client ID |

> `GOOGLE_CLIENT_ID` 與 `VITE_GOOGLE_CLIENT_ID` 通常填同一個值。因為前端是先 build 成靜態檔再交給 Nginx，`VITE_GOOGLE_CLIENT_ID` 必須在 `docker compose up --build` 時就提供，不能等容器啟動後再補。

選填欄位（有預設值）：

| 變數 | 預設值 | 說明 |
|------|--------|------|
| `CORS_ORIGINS` | `http://localhost:5173` | 允許的前端 origin |

可直接參考以下 `.env` 範例：

```bash
# .env
JWT_SECRET=<openssl rand -hex 64 的輸出>
 
# 本機 Docker Compose 可維持 localhost；VPS / 自架請改成正式前端網址
CORS_ORIGINS=http://localhost:5173
FRONTEND_BASE_URL=http://localhost:5173

# Google SSO
GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com

# 選填：邀請信寄送
# RESEND_API_KEY=re_xxxxxxxxxx
```

若是 VPS / 自架正式環境，請把 `CORS_ORIGINS` 與 `FRONTEND_BASE_URL` 改成正式網域，例如 `https://your-domain.com`。

`docker-compose.yml` 會自動讀取同目錄的 `.env` 檔。

### Google SSO 設定

若你希望 Docker Compose 跑起來的前端也能顯示 Google 登入按鈕並正常登入，除了 `.env` 要有 `GOOGLE_CLIENT_ID` / `VITE_GOOGLE_CLIENT_ID`，還要在 Google Cloud Console 的同一個 OAuth Web Client 加入對應網址到 **Authorized JavaScript origins**：

- 本機 Docker Compose：`http://localhost:5173`
- 自架正式站：`https://your-domain.com`

如果改了 `VITE_GOOGLE_CLIENT_ID` 或前端網域，記得重新 build 前端映像：

```bash
docker compose up --build frontend -d
```

---

## 疑難排解

**後端無法連線到資料庫**
→ 確認 postgres 服務已啟動且通過 healthcheck：
```bash
docker compose ps
# fenpai-postgres 狀態應為 healthy
```

**Port 已被占用**
→ 修改 `docker-compose.yml` 的 ports 對應，例如 `"5433:5432"`。

**前端 build 失敗**
→ 確認 `frontend/node_modules` 不存在於 Docker context，或在 `frontend/` 新增 `.dockerignore`：
```
node_modules
dist
.env*
```

**Docker Compose 跑起來了，但看不到 Google 登入按鈕**
→ 確認根目錄 `.env` 已設定 `VITE_GOOGLE_CLIENT_ID`。
→ 確認是用 `docker compose up --build` 重建過前端，不是只重啟既有容器。
→ 確認 Google Cloud Console 的 **Authorized JavaScript origins** 已加入實際前端網址。
