import {createHash} from 'node:crypto';
import {readdir,readFile} from 'node:fs/promises';
import {join} from 'node:path';
// A deployment gets one stable version across the complete module graph. Merely
// versioning entry.js leaves its relative imports exposed to a returning browser's cache.
export async function versionClient(page,root='public'){
 const files=[];async function walk(dir,prefix=''){for(const entry of await readdir(dir,{withFileTypes:true})){const name=prefix+entry.name;if(entry.isDirectory())await walk(join(dir,entry.name),name+'/');else if(/\.(?:js|css|html)$/.test(name))files.push(name);}}await walk(root);files.sort();
 const hash=createHash('sha256');for(const name of files){hash.update(name+'\0');hash.update(await readFile(join(root,name)));hash.update('\0');}const version=hash.digest('hex').slice(0,16),known=new Set(files);
 const versioned=name=>name+'?v='+version;
 page=page.replace(/<script type="importmap">([\s\S]*?)<\/script>/,(_,json)=>{const map=JSON.parse(json);map.imports??={};for(const [key,value]of Object.entries(map.imports))if(typeof value==='string'&&known.has(value.replace(/^\.\//,'')))map.imports[key]=versioned(value);for(const name of files.filter(f=>f.endsWith('.js')))map.imports['./'+name]=versioned('./'+name);return '<script type="importmap">'+JSON.stringify(map)+'</script>';});
 page=page.replace(/\b(src|href)="([^"?#]+\.(?:js|css))"/g,(match,attribute,url)=>known.has(url.replace(/^\.\//,''))?attribute+'="'+versioned(url)+'"':match);
 page=page.replace('</head>','<meta name="pawtheon-build" content="'+version+'"></head>');
 return {page,version,modules:files.filter(f=>f.endsWith('.js')).length};
}
