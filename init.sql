-- =============================================================
-- Overthinker Action Tracker - Database Schema
-- PostgreSQL 16
-- =============================================================

-- -------------------------------------------------------------
-- ENUMS
-- -------------------------------------------------------------

CREATE TYPE user_role AS ENUM ('user', 'admin');

CREATE TYPE user_status AS ENUM ('active', 'suspended');

CREATE TYPE category AS ENUM ('health', 'career', 'relationships', 'personal_growth');

CREATE TYPE challenge_status AS ENUM ('pending', 'in_progress', 'completed');

CREATE TYPE session_type AS ENUM ('thinking', 'executing');

-- -------------------------------------------------------------
-- TABLE: users
-- -------------------------------------------------------------

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       VARCHAR(255)        NOT NULL,
    email           VARCHAR(255)        NOT NULL UNIQUE,
    password_hash   TEXT                NOT NULL,
    role            user_role           NOT NULL DEFAULT 'user',
    status          user_status         NOT NULL DEFAULT 'active',
    last_login_at   TIMESTAMPTZ         NULL,
    created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email  ON users (email);
CREATE INDEX idx_users_role   ON users (role);
CREATE INDEX idx_users_status ON users (status);

-- -------------------------------------------------------------
-- TABLE: challenges
-- -------------------------------------------------------------

CREATE TABLE challenges (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID            NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name                    VARCHAR(255)    NOT NULL,
    category                category        NOT NULL,
    status                  challenge_status NOT NULL DEFAULT 'pending',
    total_thinking_minutes  INTEGER         NOT NULL DEFAULT 0 CHECK (total_thinking_minutes >= 0),
    total_executing_minutes INTEGER         NOT NULL DEFAULT 0 CHECK (total_executing_minutes >= 0),
    completed_at            TIMESTAMPTZ     NULL,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_challenges_user_id  ON challenges (user_id);
CREATE INDEX idx_challenges_category ON challenges (category);
CREATE INDEX idx_challenges_status   ON challenges (status);

-- -------------------------------------------------------------
-- TABLE: sessions
-- -------------------------------------------------------------

CREATE TABLE sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id    UUID            NOT NULL REFERENCES challenges (id) ON DELETE CASCADE,
    user_id         UUID            NOT NULL REFERENCES users (id)      ON DELETE CASCADE,
    category        category        NOT NULL,
    session_type    session_type    NOT NULL,
    session_date    DATE            NOT NULL,
    start_time      TIME            NULL,
    end_time        TIME            NULL,
    total_minutes   INTEGER         NOT NULL CHECK (total_minutes > 0),
    note            VARCHAR(100)    NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_challenge_id  ON sessions (challenge_id);
CREATE INDEX idx_sessions_user_id       ON sessions (user_id);
CREATE INDEX idx_sessions_session_type  ON sessions (session_type);
CREATE INDEX idx_sessions_session_date  ON sessions (session_date);

-- -------------------------------------------------------------
-- TABLE: audit_logs
-- -------------------------------------------------------------

CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id   UUID            NULL REFERENCES users (id) ON DELETE SET NULL,
    actor_role      user_role       NOT NULL,
    action          VARCHAR(100)    NOT NULL,
    entity_type     VARCHAR(100)    NOT NULL,
    entity_id       UUID            NULL,
    metadata        JSONB           NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor_user_id ON audit_logs (actor_user_id);
CREATE INDEX idx_audit_logs_entity_type   ON audit_logs (entity_type);
CREATE INDEX idx_audit_logs_action        ON audit_logs (action);
CREATE INDEX idx_audit_logs_created_at    ON audit_logs (created_at DESC);

-- -------------------------------------------------------------
-- TRIGGER: auto-update updated_at
-- -------------------------------------------------------------

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_users
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_challenges
    BEFORE UPDATE ON challenges
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_sessions
    BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- -------------------------------------------------------------
-- SEED: default admin account
-- password = "admin123" (bcrypt hash, thay trước khi production)
-- -------------------------------------------------------------

INSERT INTO users (full_name, email, password_hash, role, status)
VALUES (
    'Super Admin',
    'admin@overthinking.app',
    '$2b$12$placeholderHashReplaceBeforeProduction000000000000000',
    'admin',
    'active'
);
