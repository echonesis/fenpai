-- ============================================================
-- Fenpai Database Schema - V1 Initial Migration
-- All monetary values use NUMERIC(12,2) - never FLOAT
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id           BIGSERIAL PRIMARY KEY,
    name         VARCHAR(100)        NOT NULL,
    email        VARCHAR(255)        NOT NULL UNIQUE,
    password_hash VARCHAR(255)       NOT NULL,
    created_at   TIMESTAMP           NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);

-- ============================================================

CREATE TABLE IF NOT EXISTS accounts (
    id             BIGSERIAL PRIMARY KEY,
    user_id        BIGINT              NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    label          VARCHAR(100)        NOT NULL,
    bank_code      VARCHAR(10)         NOT NULL,
    account_number VARCHAR(50)         NOT NULL,
    created_at     TIMESTAMP           NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_accounts_user_id ON accounts (user_id);

-- ============================================================

CREATE TABLE IF NOT EXISTS groups (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100)  NOT NULL,
    created_by BIGINT        NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    created_at TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ============================================================

CREATE TABLE IF NOT EXISTS group_members (
    id        BIGSERIAL PRIMARY KEY,
    group_id  BIGINT    NOT NULL REFERENCES groups (id) ON DELETE CASCADE,
    user_id   BIGINT    NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (group_id, user_id)
);

CREATE INDEX idx_group_members_group_id ON group_members (group_id);
CREATE INDEX idx_group_members_user_id  ON group_members (user_id);

-- ============================================================

CREATE TABLE IF NOT EXISTS expenses (
    id          BIGSERIAL PRIMARY KEY,
    group_id    BIGINT          NOT NULL REFERENCES groups (id) ON DELETE CASCADE,
    paid_by     BIGINT          NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    description VARCHAR(255)    NOT NULL,
    amount      NUMERIC(12, 2)  NOT NULL CHECK (amount > 0),
    split_type  VARCHAR(20)     NOT NULL DEFAULT 'EQUAL',
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expenses_group_id ON expenses (group_id);
CREATE INDEX idx_expenses_paid_by  ON expenses (paid_by);

-- ============================================================

CREATE TABLE IF NOT EXISTS expense_splits (
    id         BIGSERIAL PRIMARY KEY,
    expense_id BIGINT         NOT NULL REFERENCES expenses (id) ON DELETE CASCADE,
    user_id    BIGINT         NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    amount     NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    UNIQUE (expense_id, user_id)
);

CREATE INDEX idx_expense_splits_expense_id ON expense_splits (expense_id);
CREATE INDEX idx_expense_splits_user_id    ON expense_splits (user_id);

-- ============================================================

CREATE TABLE IF NOT EXISTS payments (
    id           BIGSERIAL PRIMARY KEY,
    from_user_id BIGINT         NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    to_user_id   BIGINT         NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    amount       NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    group_id     BIGINT         REFERENCES groups (id) ON DELETE SET NULL,
    note         VARCHAR(255),
    created_at   TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_from_user_id ON payments (from_user_id);
CREATE INDEX idx_payments_to_user_id   ON payments (to_user_id);
CREATE INDEX idx_payments_group_id     ON payments (group_id);
