# Fenpai - TODO

## 目前已有 API

### Auth `/api/auth`
- [x] POST `/api/auth/register`
- [x] POST `/api/auth/login`

### Groups `/api/groups`
- [x] POST `/api/groups` — 建立群組
- [x] GET `/api/groups` — 取得目前登入用戶的群組列表
- [x] GET `/api/groups/{groupId}` — 取得群組詳情
- [x] PUT `/api/groups/{groupId}` — 更新群組名稱（只有建立者）
- [x] DELETE `/api/groups/{groupId}` — 刪除群組（只有建立者）
- [x] GET `/api/groups/{groupId}/members` — 取得群組成員列表
- [x] DELETE `/api/groups/{groupId}/members/{userId}` — 移除群組成員（只有建立者）
- [x] POST `/api/groups/{groupId}/invite` — 邀請成員（已註冊直接加入 / 未註冊寄信）

### Invitations `/api/invite`
- [x] GET `/api/invite/{token}` — 取得邀請資訊（公開）
- [x] POST `/api/invite/{token}/accept` — 接受邀請（需登入）

### Expenses `/api/expenses`

- [x] POST `/api/expenses` — 新增支出（EQUAL / CUSTOM 分帳；groupId 可為 null 表示直接支出）
- [x] GET `/api/expenses/group/{groupId}` — 取得群組支出列表
- [x] GET `/api/expenses/direct` — 取得當前用戶的直接支出（無群組）
- [x] GET `/api/expenses/{expenseId}` — 取得單筆支出（含 splits）
- [x] PUT `/api/expenses/{expenseId}` — 編輯支出（金額、描述、分帳方式）
- [x] DELETE `/api/expenses/{expenseId}` — 刪除支出

### 結算 `/api/balances`
- [x] GET `/api/balances/group/{groupId}` — 計算群組內誰欠誰多少錢（最少轉帳演算法）
- [x] POST `/api/balances/settle` — 記錄一筆還款（fromUserId, toUserId, amount, groupId 可為 null, note）
- [x] GET `/api/balances/group/{groupId}/history` — 查看群組還款紀錄
- [x] GET `/api/balances/summary` — 當前用戶跨所有朋友的總欠/被欠金額

### 朋友 `/api/friends`
- [x] GET `/api/friends` — 取得朋友列表（含各自淨餘額）
- [x] POST `/api/friends` — 新增朋友（雙向）
- [x] DELETE `/api/friends/{friendId}` — 移除朋友（雙向）
- [x] GET `/api/friends/{friendId}/history` — 查看與特定朋友的往來紀錄（支出 + 還款）

### 用戶管理 `/api/users`
- [x] GET `/api/users/me` — 取得目前登入用戶資料
- [x] PUT `/api/users/me` — 更新個人資料（name、password，改密碼需驗舊密碼）
- [x] GET `/api/users/search?email=` — 以 email 搜尋用戶

---

## UI 重構：導覽列改版

- [x] Bottom nav 改為：朋友 | 群組 | 💰(Bottom Sheet) | 活動 | 用戶
- [x] 首頁改為朋友視角（以人為單位的欠還關係）
- [x] 中間按鈕改為 Balance Bottom Sheet（原首頁清單 + 拉扯 Bar）
  - Balance Bar：綠色（別人欠我）vs 紅色（我欠別人），以金額比例顯示
  - 顯示兩側總金額與朋友列表
- [x] 朋友頁：可直接新增朋友（獨立於群組，以 email 搜尋）
- [x] 群組建立時可從朋友列表選成員
- [x] 群組詳細頁邀請成員支援朋友快選
- [x] 新增支出入口移至朋友詳細頁 / 群組詳細頁內部
- [x] 群組支出自動反映在朋友餘額（朋友支出不進群組）
- [x] 朋友詳細頁：往來紀錄（支出 + 還款）
- [x] 朋友詳細頁：記錄還款（還款方向依餘額鎖定）
- [x] 帳單頁顯示直接支出（紫色 tag 標示）
- [x] 後端：新增 friendships 表 + 朋友層級的 expense（group_id = null）
- [x] 後端：朋友餘額聚合查詢（所有共同群組 + 直接支出）

## 未來待辦

- [ ] Balance Bar 顏色深淺警示：超過一定時間未結清顯示更深的紅/綠，提示該催款或還錢

## 其他待討論

- [ ] 通知機制：有人新增支出時要不要透過 WebSocket 推播？
- [ ] 支出分類（食物、交通、住宿等）
- [x] 群組邀請連結（email + 連結 + 自動接受）
- [ ] QR code 邀請
- [ ] 匯出功能（CSV / PDF）
