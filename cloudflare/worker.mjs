import {hashPassword} from './password.mjs';
import game from '../play-app/worker/index.js';
import {denyPrivateRequest} from './guard.mjs';
import {metrics} from './metrics.mjs';
const basic=(body,status=404,extra={})=>new Response(body,{status,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}});
export default {
 async fetch(request,env){
  // Temporary site-wide pause; leave all original assets and data intact.
  if(env.SITE_OFFLINE==='true')return basic(request.method==='HEAD'?null:'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>the end</title><style>html,body{margin:0;min-height:100%;background:#000;color:#fff}body{min-height:100vh;min-height:100dvh;display:grid;place-items:center;font:24px Georgia,serif}h1{font:inherit;margin:0}</style></head><body><h1>the end</h1></body></html>',503,{'Content-Type':'text/html; charset=utf-8','Retry-After':'3600','X-Robots-Tag':'noindex','X-Order86-Hosting':'cloudflare'});
  const url=new URL(request.url),p=url.pathname;
  if(denyPrivateRequest(p))return basic('Not found');
  // Reversible public takedown; preserve all lore source and chapter files.
  const lorePath=decodeURIComponent(p).replace(/\/+/g,'/');
  if(env.LORE_OFFLINE==='true'&&/^\/lore(?:\.html)?(?:\/|$)/i.test(lorePath))return basic('Lore is temporarily unavailable. Please check back later.',503,{'Retry-After':'3600','X-Robots-Tag':'noindex'});
  if(env.MAINTENANCE==='true'&&(p.startsWith('/play/api/')||p==='/metrics/event'))return basic('Brief maintenance: please try again shortly.',503,{'Retry-After':'60'});
  try{
   if(p==='/metrics/event')return await metrics(request,env.DB);
   if(p.startsWith('/play/api/')){
    if(!/^\/play\/api\/(accounts|multiplayer)\//.test(p))return basic('Not found');
    const max=p.startsWith('/play/api/accounts/')?65536:4096;
    let body;if(!['GET','HEAD'].includes(request.method)){const reader=request.body?.getReader();let total=0;const chunks=[];if(reader)while(true){const {value,done}=await reader.read();if(done)break;total+=value.length;if(total>max){await reader.cancel();return basic('Request too large',413)}chunks.push(value)}body=new Uint8Array(total);let i=0;for(const c of chunks){body.set(c,i);i+=c.length}}
    const gameURL=new URL(url);gameURL.pathname=p.slice(5);
    return await game.fetch(new Request(gameURL,{method:request.method,headers:request.headers,...(body?{body}:{})}),{DB:env.DB,ASSETS:env.ASSETS,hashPassword});
   }
   if(!['GET','HEAD'].includes(request.method))return basic('Method not allowed',405,{Allow:'GET, HEAD'});
   if(p==='/play'||p==='/studio')return new Response(null,{status:308,headers:{Location:p+'/'+url.search}});
   if(p==='/'||p==='/play/'||p==='/studio/')url.pathname=p+'index.html';
   else if(/^\/play\/multiplayer(?:\.html)?\/?$/.test(p))url.pathname='/play/multiplayer.html';
   else if(/^\/wizard\/\d+$/.test(p))url.pathname=p+'.html';
   else if(!p.split('/').at(-1).includes('.')&&!p.startsWith('/play/'))url.pathname=p+'.html';
   const response=await env.ASSETS.fetch(new Request(url,request));
   const headers=new Headers(response.headers);headers.set('X-Content-Type-Options','nosniff');headers.set('X-Frame-Options','SAMEORIGIN');headers.set('Referrer-Policy','strict-origin-when-cross-origin');headers.set('Strict-Transport-Security','max-age=31536000; includeSubDomains');
   headers.set('Cache-Control',p.startsWith('/play/')||url.pathname.endsWith('.html')?'no-cache':'public, max-age=3600');
   headers.set('X-Order86-Hosting','cloudflare');
   return new Response(response.body,{status:response.status,headers});
  }catch(error){console.error('Request failed',p,error.message);return basic('Service temporarily unavailable',503)}
 }
};
