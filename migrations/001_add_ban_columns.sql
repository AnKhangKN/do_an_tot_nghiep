-- Migration: Add ban management columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS ban_reason TEXT,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES users(user_id);

-- Update check constraint if exists (PostgreSQL doesn't have one on this column, but update comment)
COMMENT ON COLUMN users.status IS 'ACTIVE, INACTIVE, BANNED';
