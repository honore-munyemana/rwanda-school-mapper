CREATE TABLE IF NOT EXISTS verification_logs (
  id SERIAL PRIMARY KEY,
  school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  verifier_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verifier_latitude DECIMAL(10,8) NOT NULL,
  verifier_longitude DECIMAL(11,8) NOT NULL,
  distance_meters DECIMAL(10,2) NOT NULL,
  result VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
