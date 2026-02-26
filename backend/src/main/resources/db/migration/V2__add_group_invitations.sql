CREATE TABLE IF NOT EXISTS group_invitations (
    id         BIGSERIAL    PRIMARY KEY,
    group_id   BIGINT       NOT NULL REFERENCES groups (id) ON DELETE CASCADE,
    email      VARCHAR(255) NOT NULL,
    token      VARCHAR(100) NOT NULL UNIQUE,
    invited_by BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    accepted   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP    NOT NULL,
    UNIQUE (group_id, email)
);

CREATE INDEX idx_group_invitations_token    ON group_invitations (token);
CREATE INDEX idx_group_invitations_email    ON group_invitations (email);
CREATE INDEX idx_group_invitations_group_id ON group_invitations (group_id);
