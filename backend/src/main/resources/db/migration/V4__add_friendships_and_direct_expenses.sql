-- Allow expenses without a group (direct friend-to-friend expenses)
ALTER TABLE expenses ALTER COLUMN group_id DROP NOT NULL;

-- ============================================================

CREATE TABLE IF NOT EXISTS friendships (
    id        BIGSERIAL PRIMARY KEY,
    user_id   BIGINT    NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    friend_id BIGINT    NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, friend_id)
);

CREATE INDEX idx_friendships_user_id   ON friendships (user_id);
CREATE INDEX idx_friendships_friend_id ON friendships (friend_id);
