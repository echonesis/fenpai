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
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Groups.jsx            # 群組列表 + 建立群組
│   │   │   ├── GroupDetail.jsx       # 群組成員 + 邀請成員
│   │   │   └── InviteAccept.jsx      # 接受邀請頁
│   │   ├── lib/
│   │   │   └── api.js                # apiFetch 封裝
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vercel.json
│   └── vite.config.js
├── backend/                     # Spring Boot 後端
│   ├── src/main/java/com/fenpai/
│   │   ├── controller/
│   │   │   ├── AuthController.java
│   │   │   ├── GroupController.java
│   │   │   ├── InvitationController.java
│   │   │   └── ExpenseController.java
│   │   ├── service/
│   │   │   ├── UserService.java
│   │   │   ├── GroupService.java
│   │   │   ├── InvitationService.java
│   │   │   ├── EmailService.java      # Resend SMTP 寄送邀請信
│   │   │   └── ExpenseService.java
│   │   ├── repository/
│   │   ├── model/
│   │   └── config/                   # Security、WebSocket、AppProperties
│   ├── src/main/resources/
│   │   ├── application.properties        # 本機開發預設值
│   │   ├── application-prod.properties   # 正式環境（缺變數即啟動失敗）
│   │   └── db/migration/
│   │       ├── V1__init_schema.sql
│   │       └── V2__add_group_invitations.sql
│   └── Dockerfile
├── docs/
│   └── deployment/
│       └── vercel-render.md     # Vercel + Render 部署指南
├── docker-compose.yml
├── .env.example                 # 環境變數範本
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
# 1. 複製環境變數範本並填入 JWT_SECRET
cp .env.example .env
# 編輯 .env，執行下列指令取得 JWT_SECRET 的值：
#   openssl rand -hex 64

# 2. 建立並啟動所有服務
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
| `group_invitations` | 群組邀請（含 token、有效期、寄件對象） |
| `expenses` | 費用記錄 |
| `expense_splits` | 費用分攤明細 |
| `payments` | 付款記錄 |

> 所有金額欄位均使用 `NUMERIC(12,2)`，禁止使用 `FLOAT` / `DOUBLE`。

---

## API 端點

| 方法 | 路徑 | 說明 | 需登入 |
|------|------|------|--------|
| POST | `/api/auth/register` | 註冊 | |
| POST | `/api/auth/login` | 登入 | |
| POST | `/api/groups` | 建立群組 | ✓ |
| GET  | `/api/groups` | 取得目前登入用戶的群組列表 | ✓ |
| GET  | `/api/groups/{groupId}` | 取得群組詳情 | ✓ |
| GET  | `/api/groups/{groupId}/members` | 取得群組成員列表 | ✓ |
| POST | `/api/groups/{groupId}/invite` | 邀請成員（已註冊直接加入，未註冊寄信） | ✓ |
| GET  | `/api/invite/{token}` | 取得邀請資訊（公開） | |
| POST | `/api/invite/{token}/accept` | 接受邀請 | ✓ |
| POST | `/api/expenses` | 新增費用 | ✓ |
| GET  | `/api/expenses/group/{groupId}` | 取得群組費用列表 | ✓ |

WebSocket 端點：`ws://localhost:8080/ws`（使用 SockJS + STOMP）

---

## 功能特色

### 群組邀請
- 輸入 Email 邀請成員：已註冊用戶直接加入，未註冊用戶寄送邀請信
- 邀請連結 7 天有效
- 新用戶註冊時自動接受待處理的邀請
- 需設定 `RESEND_API_KEY` 才會實際寄信；未設定時邀請連結印於後端 log

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

專案使用兩個 profile：

- **預設 profile**（本機 `mvn spring-boot:run`）：`application.properties`，敏感欄位有安全預設值供開發使用
- **prod profile**（Docker Compose / Render）：`application-prod.properties`，DB / JWT / CORS 無預設值，缺少時啟動失敗

### 後端

| 變數 | 必填 | 說明 |
|------|------|------|
| `JWT_SECRET` | ✓ | `openssl rand -hex 64` 生成 |
| `DB_HOST` | ✓（prod） | PostgreSQL 主機 |
| `DB_PORT` | ✓（prod） | PostgreSQL 埠號 |
| `DB_NAME` | ✓（prod） | 資料庫名稱 |
| `DB_USER` | ✓（prod） | 資料庫使用者 |
| `DB_PASSWORD` | ✓（prod） | 資料庫密碼 |
| `CORS_ORIGINS` | ✓（prod） | 允許的前端來源，例如 `https://your-app.vercel.app` |
| `FRONTEND_BASE_URL` | 選填 | 邀請信連結的前端網址，預設 `https://fenpai.onrender.com` |
| `RESEND_API_KEY` | 選填 | Resend API Key，未設定時跳過寄信 |

Docker Compose 透過根目錄 `.env` 注入變數，詳見 [.env.example](.env.example)。

### 前端

| 變數 | 說明 |
|------|------|
| `VITE_API_URL` | 後端 API URL（本機開發不需設定，走 Vite proxy） |

---

## 開發注意事項

1. **金額計算**：所有金額運算使用 `BigDecimal`，禁止使用 `double` / `float`
2. **JWT**：正式部署前，請將 `JWT_SECRET` 替換為至少 256 bits 的隨機字串
3. **資料庫 Migration**：使用 Flyway 管理版本，新增變更請建立新的 `V{n}__xxx.sql` 檔案
4. **CORS**：正式環境請在 `CORS_ORIGINS` 填入正確的前端網址
5. **Lazy Loading**：`spring.jpa.open-in-view=false`，Service 層需加 `@Transactional` 才能存取 lazy 關聯

---

## 部署

詳見 [docs/deployment/vercel-render.md](docs/deployment/vercel-render.md)。
