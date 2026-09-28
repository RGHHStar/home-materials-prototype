CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  request_id TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('suggestion','issue','correction','other')),
  section TEXT NOT NULL CHECK(section IN ('general','assessment','materials','design','learning')),
  message TEXT NOT NULL CHECK(length(message) BETWEEN 10 AND 2000),
  locale TEXT NOT NULL CHECK(locale IN ('en','fr')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(user_id, request_id)
);
CREATE INDEX IF NOT EXISTS feedback_user_created ON feedback(user_id, created_at);
