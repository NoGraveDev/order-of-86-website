import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readFileSync,chmodSync} from 'node:fs';
import {dirname} from 'node:path';
// Adapt the existing Worker/D1 contract; keep one authoritative room implementation.
export function openRoomDatabase(file){
 mkdirSync(dirname(file),{recursive:true,mode:0o700});
 const sqlite=new DatabaseSync(file);chmodSync(file,0o600);
 sqlite.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
 const migrated=sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='multiplayer_rooms'").get();
 if(!migrated)sqlite.exec(readFileSync(new URL('../drizzle/0000_clever_hitman.sql',import.meta.url),'utf8'));
 sqlite.exec(readFileSync(new URL('../drizzle/0001_room_messages.sql',import.meta.url),'utf8'));
 sqlite.exec(readFileSync(new URL('../drizzle/0002_frosthollow_chess.sql',import.meta.url),'utf8'));
 sqlite.exec(readFileSync(new URL('../drizzle/0003_chess_records.sql',import.meta.url),'utf8'));
 sqlite.exec(readFileSync(new URL('../drizzle/0004_boat_races.sql',import.meta.url),'utf8'));
 sqlite.exec(readFileSync(new URL('../drizzle/0005_player_accounts.sql',import.meta.url),'utf8'));
 sqlite.exec(readFileSync(new URL('../drizzle/0006_player_trades.sql',import.meta.url),'utf8'));
 sqlite.exec(readFileSync(new URL('../drizzle/0007_lava_arena.sql',import.meta.url),'utf8'));
 sqlite.exec(readFileSync(new URL('../drizzle/0008_public_lobbies.sql',import.meta.url),'utf8'));
 sqlite.exec(readFileSync(new URL('../drizzle/0009_minigame_results.sql',import.meta.url),'utf8'));
 let batchTail=Promise.resolve();
 const serial=fn=>{const result=batchTail.then(fn);batchTail=result.catch(()=>{});return result;};
 const DB={prepare(sql){let args=[];const run=()=>({meta:sqlite.prepare(sql).run(...args)});return {bind(...values){args=values;return this},_run:run,run:()=>serial(run),first:()=>serial(()=>sqlite.prepare(sql).get(...args)),all:()=>serial(()=>({results:sqlite.prepare(sql).all(...args)}))}},batch(items){return serial(()=>{sqlite.exec('BEGIN');try{const results=items.map(item=>item._run());sqlite.exec('COMMIT');return results}catch(error){sqlite.exec('ROLLBACK');throw error}});}};

 return {DB,close:()=>sqlite.close()};
}
