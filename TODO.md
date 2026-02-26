# Fenpai - TODO

## 目前已有 API

### Auth `/api/auth`
- [x] POST `/api/auth/register`
- [x] POST `/api/auth/login`

### Groups `/api/groups`
- [x] POST `/api/groups`
- [x] GET `/api/groups/user/{userId}`
- [x] GET `/api/groups/{groupId}`
- [x] POST `/api/groups/{groupId}/members`

### Expenses `/api/expenses`
- [x] POST `/api/expenses`
- [x] GET `/api/expenses/group/{groupId}`

---

## 待實作

### 群組管理
- [ ] PUT `/api/groups/{groupId}` — 更新群組名稱
- [ ] DELETE `/api/groups/{groupId}` — 刪除群組（需確認權限，只有建立者可刪）
- [ ] DELETE `/api/groups/{groupId}/members/{userId}` — 移除群組成員

### 支出管理
- [ ] PUT `/api/expenses/{expenseId}` — 編輯支出（金額、描述、分帳方式）
- [ ] DELETE `/api/expenses/{expenseId}` — 刪除支出

### 結算 `/api/balances`
- [ ] GET `/api/balances/group/{groupId}` — 計算群組內誰欠誰多少錢（簡化後的結算清單）
- [ ] POST `/api/balances/settle` — 記錄一筆還款（paidBy, paidTo, amount, groupId）
- [ ] GET `/api/balances/group/{groupId}/history` — 查看群組還款紀錄

### 用戶管理 `/api/users`
- [ ] GET `/api/users/me` — 取得目前登入用戶資料
- [ ] PUT `/api/users/me` — 更新個人資料（name、password）

---

## 其他待討論
- [ ] 通知機制：有人新增支出時要不要透過 WebSocket 推播？
- [ ] 支出分類（食物、交通、住宿等）
- [ ] 群組邀請連結 / QR code
- [ ] 匯出功能（CSV / PDF）
