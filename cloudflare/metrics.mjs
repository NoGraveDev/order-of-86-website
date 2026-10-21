const id=/^[a-f0-9-]{36}$/;
export async function metrics(request,db){
 const reply=status=>new Response(null,{status,headers:{'Cache-Control':'no-store'}});
 if(request.method!=='POST')return reply(405);
 if(request.headers.get('Origin')!==new URL(request.url).origin)return reply(403);
 const address=request.headers.get('CF-Connecting-IP')||'unknown';
 const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(address));
 const key='metrics:'+Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
 const window=Math.floor(Date.now()/60000);
 const rate=await db.prepare('INSERT INTO account_rate_limits(key,window,count) VALUES (?,?,1) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN window=excluded.window THEN count+1 ELSE 1 END,window=excluded.window RETURNING count').bind(key,window).first();
 if(rate.count>120)return reply(429);
 if(Number(request.headers.get('Content-Length'))>1024)return reply(413);
 const raw=await request.text();if(raw.length>1024)return reply(413);
 let e;try{e=JSON.parse(raw)}catch{return reply(400)}
 if(!e||!id.test(e.session)||!id.test(e.visitor)||!/^\/(?:[a-zA-Z0-9_./-]{0,160})$/.test(e.path)||!Number.isSafeInteger(e.seq)||e.seq<0||!Number.isSafeInteger(e.active)||e.active<0)return reply(400);
 const now=Date.now(),old=await db.prepare('SELECT visitor,path FROM visits WHERE id=?').bind(e.session).first();
 if(old&&(old.visitor!==e.visitor||old.path!==e.path))return reply(400);
 await db.prepare(`INSERT INTO visits(id,visitor,path,started,updated,seq,active_ms) VALUES(?,?,?,?,?,?,0)
 ON CONFLICT(id) DO UPDATE SET seq=excluded.seq,updated=excluded.updated,
 active_ms=visits.active_ms+CASE WHEN visits.path='/play' OR visits.path LIKE '/play/%' THEN MIN(MAX(0,?-visits.active_ms),MAX(0,excluded.updated-visits.updated),30000) ELSE 0 END
 WHERE excluded.seq>visits.seq AND excluded.visitor=visits.visitor AND excluded.path=visits.path`).bind(e.session,e.visitor,e.path,now,now,e.seq,e.active).run();
 return reply(204);
}
