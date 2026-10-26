export async function profileId(key){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key));return [...new Uint8Array(bytes)].map(n=>n.toString(16).padStart(2,'0')).join('');}
export async function chessRecords(db,profile){
 const leaders=await db.prepare('SELECT s.profile,p.name,SUM(s.won) AS wins,COUNT(*) AS games FROM multiplayer_chess_scores s JOIN multiplayer_chess_profiles p ON p.id=s.profile GROUP BY s.profile HAVING SUM(s.won)>0 ORDER BY wins DESC,games ASC,s.profile LIMIT 20').all();
 const record=await db.prepare('SELECT COUNT(*) AS games,COALESCE(SUM(won),0) AS wins,COALESCE(SUM(drawn),0) AS draws FROM multiplayer_chess_scores WHERE profile=?').bind(profile).first();
 const recent=await db.prepare('SELECT game,won,drawn,reason,finished FROM multiplayer_chess_scores WHERE profile=? ORDER BY finished DESC,game LIMIT 12').bind(profile).all();
 return {leaders:leaders.results.map(p=>({...p,self:p.profile===profile})),record:{...record,losses:record.games-record.wins-record.draws},recent:recent.results};
}
