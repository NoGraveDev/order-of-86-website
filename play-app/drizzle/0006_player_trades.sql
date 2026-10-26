CREATE TABLE IF NOT EXISTS player_trades (
 id TEXT PRIMARY KEY, room TEXT NOT NULL, account_a TEXT NOT NULL, account_b TEXT NOT NULL,
 token_a TEXT NOT NULL, token_b TEXT NOT NULL, offer_a TEXT NOT NULL, offer_b TEXT NOT NULL,
 revision_a INTEGER NOT NULL, revision_b INTEGER NOT NULL, version INTEGER NOT NULL DEFAULT 0,
 accepted_a INTEGER NOT NULL DEFAULT 0, accepted_b INTEGER NOT NULL DEFAULT 0,
 status TEXT NOT NULL DEFAULT 'pending', created INTEGER NOT NULL, expires INTEGER NOT NULL,
 result_a TEXT, result_b TEXT
);
CREATE INDEX IF NOT EXISTS player_trades_parties ON player_trades(room,account_a,account_b,status);
-- Single guarded statement commits the trade and both inventory saves atomically.
CREATE TRIGGER IF NOT EXISTS player_trade_commit BEFORE UPDATE OF status ON player_trades
WHEN NEW.status='completed' AND OLD.status='pending'
BEGIN
 SELECT CASE WHEN NEW.result_a IS NULL OR NEW.result_b IS NULL
  OR (SELECT revision FROM player_accounts WHERE id=NEW.account_a) IS NOT NEW.revision_a
  OR (SELECT revision FROM player_accounts WHERE id=NEW.account_b) IS NOT NEW.revision_b
  THEN RAISE(ABORT,'Trade inventory changed') END;
 UPDATE player_accounts SET save=NEW.result_a,revision=revision+1 WHERE id=NEW.account_a;
 UPDATE player_accounts SET save=NEW.result_b,revision=revision+1 WHERE id=NEW.account_b;
END;
