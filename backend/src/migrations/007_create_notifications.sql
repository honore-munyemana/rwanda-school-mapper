CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'INVITE', 'ACTIVATION', 'SUBMISSION', 'APPROVAL', 'REJECTION', 'VERIFICATION', 'SYSTEM'
  reference_id VARCHAR(50),  -- e.g. school_id or user_id
  action_url VARCHAR(255),   -- target routing path
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
