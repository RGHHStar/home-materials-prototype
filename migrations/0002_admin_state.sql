-- Applied to everdwell-feedback. Additive: original feedback is unchanged.
CREATE TABLE IF NOT EXISTS feedback_admin_state (
 feedback_id INTEGER PRIMARY KEY REFERENCES feedback(id),
 status TEXT NOT NULL CHECK(status IN ('pending','done')),
 version INTEGER NOT NULL DEFAULT 1,
 updated_by TEXT NOT NULL,
 updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
