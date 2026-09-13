import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzip} from 'node:zlib';
import {promisify} from 'node:util';
import {createHash} from 'node:crypto';
import worker from './worker/index.js';
import {openRoomDatabase} from './scripts/preview-database.mjs';
const directory=dirname(fileURLToPath(import.meta.url));
const zip=promisify(gzip);
const types={'.svg':'image/svg+xml','.woff2':'font/woff2','.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.glb':'model/gltf-binary','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.md':'text/plain; charset=utf-8','.blend':'application/octet-stream'};
export async function initializePlay({databasePath=process.env.PLAY_DB_PATH,assetRoot=resolve(directory,'dist/client')}={}){
 if(!databasePath)throw Error('PLAY_DB_PATH is required: use a persistent mounted database path in production.');
 if(!databasePath.startsWith('/'))throw Error('PLAY_DB_PATH must be absolute.');
 if(process.env.NODE_ENV==='production'){
  const parent=await stat(dirname(databasePath)).catch(()=>null);
  if(!parent?.isDirectory())throw Error('Production PLAY_DB_PATH parent must already exist: mount the persistent volume before startup.');
 }
 await stat(resolve(assetRoot,'multiplayer.html'));
 const rooms=openRoomDatabase(databasePath),root=resolve(assetRoot),cache=new Map();
 async function handle(req,res){
  const path=req.url.split('?')[0];if(path!=='/play'&&!path.startsWith('/play/'))return false;
  try{
   if(path==='/play'){res.writeHead(308,{Location:'/play/'+(req.url.includes('?')?'?'+req.url.split('?').slice(1).join('?'):''),'Cache-Control':'no-cache'});res.end();return true;}
   if(path.startsWith('/play/api/')){
    if(!/^\/play\/api\/(accounts|multiplayer)\//.test(path)){res.writeHead(404,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end('{"error":"Not found."}');return true;}
    let size=0;const chunks=[];const max=path.startsWith('/play/api/accounts/')?65536:4096;
    for await(const chunk of req){size+=chunk.length;if(size>max){res.writeHead(413,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end('{"error":"Request too large."}');return true;}chunks.push(chunk);}
    // Railway terminates TLS. Only the trusted hosting proxy supplies this header.
    const proto=(req.headers['x-forwarded-proto']||'').split(',')[0].trim()==='https'?'https':'http';
    const headers=new Headers();for(const [key,value] of Object.entries(req.headers)){if(value!==undefined)headers.set(key,Array.isArray(value)?value.join(','):value);}
    const request=new Request(proto+'://'+req.headers.host+req.url.slice(5),{method:req.method,headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});
    const response=await worker.fetch(request,{DB:rooms.DB});res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return true;
   }
   if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return true;}
   const pathname=decodeURIComponent(path.slice(5));
   const relative=pathname==='/'?'index.html':/^\/multiplayer(?:\.html)?\/?$/.test(pathname)?'multiplayer.html':'.'+pathname;
   const file=resolve(root,relative);if(!file.startsWith(root+sep)){res.writeHead(403);res.end();return true;}
   const info=await stat(file);if(!info.isFile()){res.writeHead(404);res.end('Not found');return true;}
   let entry=cache.get(file);if(!entry||entry.mtime!==info.mtimeMs){const body=await readFile(file);entry={mtime:info.mtimeMs,body,etag:'"'+createHash('sha256').update(body).digest('hex').slice(0,20)+'"'};if(/\.(?:html|js|css|json|svg)$/.test(file))entry.gzip=await zip(body,{level:6});cache.set(file,entry);}
   const headers={'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache',ETag:entry.etag,Vary:'Accept-Encoding','X-Content-Type-Options':'nosniff'};
   if(req.headers['if-none-match']===entry.etag){res.writeHead(304,headers);res.end();return true;}
   const compressed=entry.gzip&&/\bgzip\b/.test(req.headers['accept-encoding']||''),body=compressed?entry.gzip:entry.body;if(compressed)headers['Content-Encoding']='gzip';headers['Content-Length']=body.length;res.writeHead(200,headers);res.end(req.method==='HEAD'?undefined:body);return true;
  }catch(error){const missing=error.code==='ENOENT'||error.code==='ENOTDIR';res.writeHead(missing?404:500,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});res.end(missing?'Not found':'Game service unavailable');return true;}
 }
 return {handle,close:()=>rooms.close()};
}
export async function createPlayHandler(options){const app=await initializePlay(options);app.handle.close=app.close;return app.handle;}
