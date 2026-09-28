CREATE TABLE IF NOT EXISTS feedback_mail (
 id TEXT PRIMARY KEY,
 feedback_id INTEGER NOT NULL REFERENCES feedback(id),
 kind TEXT NOT NULL CHECK(kind IN ('ack','reply')),
 request_id TEXT NOT NULL,
 recipient TEXT NOT NULL,
 subject TEXT NOT NULL,
 body TEXT NOT NULL,
 created_by TEXT,
 status TEXT NOT NULL CHECK(status IN ('pending','sending','accepted','failed','unknown')),
 error_code TEXT,
 attempts INTEGER NOT NULL DEFAULT 0,
 created_at INTEGER NOT NULL DEFAULT (unixepoch()),
 updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
 UNIQUE(feedback_id,kind,request_id)
);
CREATE INDEX IF NOT EXISTS feedback_mail_feedback_created ON feedback_mail(feedback_id,created_at);
CREATE TRIGGER IF NOT EXISTS feedback_reply_accepted AFTER UPDATE OF status ON feedback_mail
WHEN NEW.kind='reply' AND NEW.status='accepted' AND OLD.status!='accepted'
BEGIN
 INSERT INTO feedback_admin_state(feedback_id,status,version,updated_by,updated_at)
 VALUES(NEW.feedback_id,'done',1,NEW.created_by,unixepoch())
 ON CONFLICT(feedback_id) DO UPDATE SET status='done',version=feedback_admin_state.version+1,updated_by=NEW.created_by,updated_at=unixepoch();
END;
