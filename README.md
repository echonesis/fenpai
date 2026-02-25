# 分派 Fenpai

台灣分帳神器 - 輕鬆分帳、催繳、對帳的全端 PWA 應用程式。

## 技術架構

| 層次 | 技術 |
|------|------|
| 前端 | React 18 + Vite 6 + TailwindCSS 4 |
| PWA  | vite-plugin-pwa + Workbox |
| 路由 | React Router v6 |
| 後端 | Spring Boot 3.2 + Java 17 |
| 資料庫 | PostgreSQL 16（金額欄位皆使用 `NUMERIC(12,2)`） |
| ORM  | Spring Data JPA + Hibernate |
| 安全 | Spring Security + JWT |
| 即時 | WebSocket (STOMP) |
| 資料庫版本管理 | Flyway |
| 容器化 | Docker + Docker Compose |

---

## 目錄結構

```
fenpai/
├── frontend/                    # React + Vite 前端
│   ├── src/
│   │   ├── components/
│   │   │   └── qr/
│   │   │       └── QRGenerator.jsx   # TWQR 催繳 QR Code 產生器
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vite.config.js
├── backend/                     # Spring Boot 後端
│   ├── src/main/java/com/fenpai/
│   │   ├── controller/          # REST API 控制器
│   │   ├── service/             # 業務邏輯
│   │   ├── repository/          # 資料存取層
│   │   ├── model/               # JPA 實體
│   │   └── config/              # 設定（Security、WebSocket）
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── db/migration/
│   │       └── V1__init_schema.sql
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 快速開始

### 前置需求

- [Docker](https://www.docker.com/) & Docker Compose
- Node.js 20+（本機開發用）
- Java 17+（本機開發用）

---

### 使用 Docker Compose 啟動（推薦）

```bash
# 建立並啟動所有服務
docker compose up --build

# 背景執行
docker compose up --build -d
```

服務啟動後：
- 前端：http://localhost:5173
- 後端 API：http://localhost:8080
- PostgreSQL：localhost:5432

停止服務：

```bash
docker compose down

# 同時刪除資料庫 volume（慎用）
docker compose down -v
```

---

### 本機開發

#### 1. 啟動 PostgreSQL

```bash
docker compose up postgres -d
```

#### 2. 啟動後端

```bash
cd backend
./mvnw spring-boot:run
# 或
mvn spring-boot:run
```

#### 3. 啟動前端

```bash
cd frontend
npm install
npm run dev
```

前端開發伺服器：http://localhost:5173
已設定 `/api` 代理至後端 `http://localhost:8080`

---

## 資料庫 Schema

| 資料表 | 說明 |
|--------|------|
| `users` | 使用者帳號 |
| `accounts` | 使用者綁定銀行帳戶 |
| `groups` | 分帳群組 |
| `group_members` | 群組成員 |
| `expenses` | 費用記錄 |
| `expense_splits` | 費用分攤明細 |
| `payments` | 付款記錄 |

> 所有金額欄位均使用 `NUMERIC(12,2)`，禁止使用 `FLOAT` / `DOUBLE`。

---

## API 端點

| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/api/auth/register` | 註冊 |
| POST | `/api/auth/login` | 登入 |
| POST | `/api/groups` | 建立群組 |
| GET  | `/api/groups/user/{userId}` | 取得使用者群組列表 |
| GET  | `/api/groups/{groupId}` | 取得群組詳情 |
| POST | `/api/groups/{groupId}/members` | 加入群組成員 |
| POST | `/api/expenses` | 新增費用 |
| GET  | `/api/expenses/group/{groupId}` | 取得群組費用列表 |

WebSocket 端點：`ws://localhost:8080/ws`（使用 SockJS + STOMP）

---

## 功能特色

### 催繳 QR Code（TWQR）
- 符合台灣共通支付標準（TWQR）
- 支援 50+ 家台灣銀行
- 可帶入金額，讓對方確認後轉帳
- 本機儲存帳戶設定（LocalStorage）
- 可下載 QR Code 圖片

### PWA 支援
- 可加入 iPhone/Android 主畫面
- 離線瀏覽基本功能
- 支援 iOS Safari

---

## 環境變數

### 後端（`application.properties` / Docker）

| 變數 | 預設值 | 說明 |
|------|--------|------|
| `DB_HOST` | `localhost` | PostgreSQL 主機 |
| `DB_PORT` | `5432` | PostgreSQL 埠號 |
| `DB_NAME` | `fenpai` | 資料庫名稱 |
| `DB_USER` | `fenpai` | 資料庫使用者 |
| `DB_PASSWORD` | `fenpai` | 資料庫密碼 |
| `JWT_SECRET` | *(預設值)* | **正式環境請務必更換** |
| `CORS_ORIGINS` | `http://localhost:5173` | 允許的前端來源 |

---

## 開發注意事項

1. **金額計算**：所有金額運算使用 `BigDecimal`，禁止使用 `double` / `float`
2. **JWT**：正式部署前，請將 `JWT_SECRET` 替換為至少 256 bits 的隨機字串
3. **資料庫 Migration**：使用 Flyway 管理版本，新增變更請建立新的 `V{n}__xxx.sql` 檔案
4. **CORS**：正式環境請在 `CORS_ORIGINS` 填入正確的前端網址

---

## 貢獻指南

1. Fork 此專案
2. 建立 feature branch：`git checkout -b feature/my-feature`
3. 提交變更：`git commit -m 'feat: add my feature'`
4. 推送至 branch：`git push origin feature/my-feature`
5. 開啟 Pull Request
