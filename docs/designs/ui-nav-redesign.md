# UI Navigation Redesign

## Overview

Restructure the bottom navigation from a group-centric layout to a people-centric layout. The center FAB shifts from "add expense" to a personal balance overview (Bottom Sheet).

---

## Navigation Structure

### Before

| Home | Groups | ➕ Add | Records | Profile |
|------|--------|--------|---------|---------|
| Settlement list | Group list | Quick add expense | Activity | User |

### After

| Friends | Groups | 💰 Balance | Records | Profile |
|---------|--------|-----------|---------|---------|
| Person-centric debt view | Group-centric debt view | Bottom Sheet overview | Activity | User |

---

## Tab Definitions

### Friends (新首頁)
- Lists all friends (people you've added or shared a group with)
- Each row shows: avatar, name, net balance with that person (green = they owe you, red = you owe them)
- Tapping a friend opens their detail page
- Detail page: transaction history together, "Add Expense" button, "Settle Up" button

### Groups (不變)
- Lists all groups
- Each row shows: group name, your net balance within the group
- Detail page keeps existing functionality, adds "Add Expense" button (moved from FAB)

### 💰 Balance (Bottom Sheet)
- Triggered by tapping center button; slides up from bottom
- Does **not** have a full tab/route — overlay only
- Contents:
  1. **Tug-of-war Bar** (see below)
  2. Summary amounts: 別人欠我 NT$X / 我欠別人 NT$Y
  3. List: friends who owe you (green), friends you owe (red)

### Records (不變)
- Expense activity feed, unchanged

### Profile (不變)
- User settings, unchanged

---

## Balance Bottom Sheet — Tug-of-War Bar

```
┌────────────────────────────────────────┐
│                                        │
│  別人欠我         我欠別人             │
│  NT$3,400         NT$1,600             │
│                                        │
│  ██████████████████░░░░░░░░░░  68%    │
│  ←  綠 (收)              紅 (付)  →   │
│                                        │
│  ─────────────────────────────         │
│  王小明    +NT$1,200   →              │
│  李大華    +NT$2,200   →              │
│  陳美麗    -NT$800     →              │
│  林志明    -NT$800     →              │
│                                        │
└────────────────────────────────────────┘
```

**Bar calculation:**
```
total = abs(別人欠我) + abs(我欠別人)
green_pct = 別人欠我 / total   // right side of bar
red_pct   = 我欠別人 / total   // left side of bar
```

**Edge cases:**
- All settled (total = 0): centered bar, label "All settled ✓", both sides 50%
- Only owed (red_pct = 0): full green bar
- Only owing (green_pct = 0): full red bar

**Color:**
- Green (`#22c55e` / Tailwind `green-500`): others owe you
- Red (`#ef4444` / Tailwind `red-500`): you owe others

**Future (not in scope now):** Color intensity scales with overdue duration — deeper red/green = longer unsettled.

---

## Friends Concept & Data Model

### What is a "Friend"?
A user you have an explicit friendship with. Two ways to become friends:
1. Manually added via the Friends page (like adding a group member)
2. Automatically suggested when you share a group (but not auto-added)

### Friend vs Group Expense

| | Friend Expense | Group Expense |
|---|---|---|
| Scope | Bilateral (2 people) | Shared among group members |
| Affects friend balance | ✅ Yes | ✅ Yes (each member) |
| Affects group balance | ❌ No | ✅ Yes |
| Use case | "你借了我NT$500" | "這頓飯我們四個均分" |

### Friend Balance Aggregation
```
Friend balance with person X =
  Σ expense_splits (expenses in shared groups, between me and X)
  + Σ direct friend expenses (group_id IS NULL, between me and X)
  - Σ settlements (between me and X, across all contexts)
```

---

## Backend Changes Required

### New Table: `friendships`
```sql
CREATE TABLE friendships (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id),
  friend_id   BIGINT NOT NULL REFERENCES users(id),
  created_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, friend_id)
);
```
Bidirectional: adding A→B also inserts B→A.

### Modified Table: `expenses`
Add nullable `group_id` (already nullable? confirm). Direct friend expenses have `group_id = NULL` and exactly 2 splits.

### New API Endpoints
```
GET  /api/friends                    — list friends with net balances
POST /api/friends                    — add a friend by userId or email
DELETE /api/friends/{friendId}       — remove friend

GET  /api/friends/{friendId}/balance — net balance + transaction history
POST /api/expenses                   — already exists; allow group_id = null for direct expenses

GET  /api/balances/summary           — current user's total owed/owing for Balance Sheet
```

### Modified: Group Creation
`POST /api/groups` request body can include `memberIds: []` to pre-populate from friends list.

---

## Implementation Order

1. **Backend: friendships table + API** (`/api/friends`)
2. **Backend: direct expenses** (allow `group_id = null`)
3. **Backend: `/api/balances/summary`** (aggregate query for Balance Sheet)
4. **Frontend: Balance Bottom Sheet** (center button → sheet with tug-of-war bar)
5. **Frontend: Friends page** (list with net balances)
6. **Frontend: Friend detail page** (history + add expense + settle up)
7. **Frontend: Bottom nav restructure** (swap Home → Friends, wire center button)
8. **Frontend: Group detail** — move "Add Expense" button here (remove FAB)
9. **Frontend: Group creation** — friend picker for member selection
