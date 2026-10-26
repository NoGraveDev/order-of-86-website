import {DatabaseSync} from 'node:sqlite';
export function openAnalytics(file){
 const db=new DatabaseSync(file);db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS visits (id TEXT PRIMARY KEY, visitor TEXT NOT NULL, path TEXT NOT NULL, started INTEGER NOT NULL, updated INTEGER NOT NULL, seq INTEGER NOT NULL, active_ms INTEGER NOT NULL DEFAULT 0); CREATE INDEX IF NOT EXISTS visits_started ON visits(started);');
 const id=/^[a-f0-9-]{36}$/;
 function record(e,now=Date.now()){
  if(!e||!id.test(e.session)||!id.test(e.visitor)||!/^\/(?:[a-zA-Z0-9_./-]{0,160})$/.test(e.path)||!Number.isSafeInteger(e.seq)||e.seq<0||!Number.isSafeInteger(e.active)||e.active<0)return false;
  const old=db.prepare('SELECT * FROM visits WHERE id=?').get(e.session);
  if(!old){db.prepare('INSERT INTO visits VALUES (?,?,?,?,?,?,0)').run(e.session,e.visitor,e.path,now,now,e.seq);return true;}
  if(old.visitor!==e.visitor||old.path!==e.path)return false;
  if(e.seq<=old.seq)return true;
  const game=old.path==='/play'||old.path.startsWith('/play/');
  const delta=game?Math.min(Math.max(0,e.active-old.active_ms),Math.max(0,now-old.updated),30000):0;
  db.prepare('UPDATE visits SET seq=?,updated=?,active_ms=active_ms+? WHERE id=?').run(e.seq,now,delta,e.session);return true;
 }
 function report(days=30){
  const since=Date.now()-days*86400000;
  const row=db.prepare("SELECT COUNT(*) pageViews,COUNT(DISTINCT visitor) browserVisitors,SUM(CASE WHEN path='/play' OR path LIKE '/play/%' THEN 1 ELSE 0 END) gameVisits,COUNT(DISTINCT CASE WHEN active_ms>0 THEN visitor END) activePlayers,COALESCE(SUM(active_ms),0)/60000.0 activePlayMinutes,COALESCE(AVG(CASE WHEN active_ms>0 THEN active_ms END),0)/60000.0 averageActiveMinutesPerPlayedVisit FROM visits WHERE started>=?").get(since);
  const daily=db.prepare("SELECT date(started/1000,'unixepoch') day,COUNT(*) pageViews,COUNT(DISTINCT visitor) browserVisitors,ROUND(SUM(active_ms)/60000.0,2) activePlayMinutes FROM visits WHERE started>=? GROUP BY day ORDER BY day").all(since);
  return {days,definition:'Browser/device estimates, not verified people. Active time excludes unfocused, loading and idle >60s. Days UTC; visits attributed to start date.',...row,daily};
 }
 return {record,report,close:()=>db.close()};
}
