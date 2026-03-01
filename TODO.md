# Fenpai - TODO

## 目前已有 API

### Auth `/api/auth`
- [x] POST `/api/auth/register`
- [x] POST `/api/auth/login`

### Groups `/api/groups`
- [x] POST `/api/groups` — 建立群組
- [x] GET `/api/groups` — 取得目前登入用戶的群組列表
- [x] GET `/api/groups/{groupId}` — 取得群組詳情
- [x] GET `/api/groups/{groupId}/members` — 取得群組成員列表
- [x] POST `/api/groups/{groupId}/invite` — 邀請成員（已註冊直接加入 / 未註冊寄信）

### Invitations `/api/invite`
- [x] GET `/api/invite/{token}` — 取得邀請資訊（公開）
- [x] POST `/api/invite/{token}/accept` — 接受邀請（需登入）

### Expenses `/api/expenses`
- [x] POST `/api/expenses` — 新增支出（EQUAL / CUSTOM 分帳）
- [x] GET `/api/expenses/group/{groupId}` — 取得群組支出列表

### 結算 `/api/balances`
- [x] GET `/api/balances/group/{groupId}` — 計算群組內誰欠誰多少錢（最少轉帳演算法）
- [x] POST `/api/balances/settle` — 記錄一筆還款（fromUserId, toUserId, amount, groupId）
- [ ] GET `/api/balances/group/{groupId}/history` — 查看群組還款紀錄

---

## 待實作

### 群組管理
- [ ] PUT `/api/groups/{groupId}` — 更新群組名稱
- [ ] DELETE `/api/groups/{groupId}` — 刪除群組（需確認權限，只有建立者可刪）
- [ ] DELETE `/api/groups/{groupId}/members/{userId}` — 移除群組成員

### 支出管理
- [ ] PUT `/api/expenses/{expenseId}` — 編輯支出（金額、描述、分帳方式）
- [ ] DELETE `/api/expenses/{expenseId}` — 刪除支出

### 結算
- [ ] GET `/api/balances/group/{groupId}/history` — 查看群組還款紀錄

### 用戶管理 `/api/users`
- [ ] GET `/api/users/me` — 取得目前登入用戶資料
- [ ] PUT `/api/users/me` — 更新個人資料（name、password）

---

## 其他待討論
- [ ] 通知機制：有人新增支出時要不要透過 WebSocket 推播？
- [ ] 支出分類（食物、交通、住宿等）
- [x] 群組邀請連結（email + 連結 + 自動接受）
- [ ] QR code 邀請
- [ ] 匯出功能（CSV / PDF）
