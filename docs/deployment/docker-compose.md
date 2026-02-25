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

選填欄位（有預設值）：

| 變數 | 預設值 | 說明 |
|------|--------|------|
| `CORS_ORIGINS` | `http://localhost:5173` | 允許的前端 origin |

VPS 部署時 `CORS_ORIGINS` 須改為正式網域：

```bash
# .env
JWT_SECRET=<openssl rand -hex 64 的輸出>
CORS_ORIGINS=https://your-domain.com
```

`docker-compose.yml` 會自動讀取同目錄的 `.env` 檔。

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
