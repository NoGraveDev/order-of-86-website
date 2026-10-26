import {openAnalytics} from './store.mjs';
import {dirname,join} from 'node:path';
export function createMetricsHandler(){
 const store=openAnalytics(process.env.ANALYTICS_DB_PATH||join(dirname(process.env.PLAY_DB_PATH),'site-analytics.sqlite')),rates=new Map();
 return async function(req,res){
  const reply=status=>{res.writeHead(status,{'Cache-Control':'no-store'});res.end();};
  if(req.method!=='POST')return reply(405);
  const proto=(req.headers['x-forwarded-proto']||'').split(',')[0].trim()==='https'?'https':'http';
  if(req.headers.origin!==proto+'://'+req.headers.host)return reply(403);
  const now=Date.now(),ip=req.headers['x-forwarded-for']?.split(',')[0]||req.socket.remoteAddress;
  if(rates.size>10000)rates.clear();const r=rates.get(ip);if(!r||now-r.start>60000)rates.set(ip,{start:now,count:1});else if(++r.count>120)return reply(429);
  try{let body='';for await(const chunk of req){body+=chunk;if(body.length>1024)return reply(413);}return reply(store.record(JSON.parse(body))?204:400);}catch{return reply(400);}
 };
}
