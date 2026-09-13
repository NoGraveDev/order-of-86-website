CREATE TABLE IF NOT EXISTS player_accounts (
 id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
 password_hash TEXT NOT NULL, salt TEXT NOT NULL, recovery_hash TEXT NOT NULL,
 created INTEGER NOT NULL, auth_version INTEGER NOT NULL DEFAULT 0,
 save TEXT NOT NULL DEFAULT '{}', revision INTEGER NOT NULL DEFAULT 0,
 imported INTEGER NOT NULL DEFAULT 0, title TEXT NOT NULL DEFAULT 'wanderer', updated INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS player_sessions (
 hash TEXT PRIMARY KEY, account TEXT NOT NULL, version INTEGER NOT NULL, expires INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS player_sessions_account ON player_sessions(account);
CREATE TABLE IF NOT EXISTS account_rate_limits (key TEXT PRIMARY KEY, window INTEGER NOT NULL, count INTEGER NOT NULL);
