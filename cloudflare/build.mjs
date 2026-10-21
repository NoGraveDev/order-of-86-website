import {mkdir,cp,readdir,stat,writeFile,rm} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve,dirname,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
process.chdir(root);
const require=createRequire(import.meta.url);
// Build outside the release checkout: no shared build-directory symlinks.
const dist=await stat('play-app/dist').catch(()=>null);
const {lstat,unlink}=await import('node:fs/promises');
if((await lstat('play-app/dist').catch(()=>null))?.isSymbolicLink())await unlink('play-app/dist');
const result=spawnSync(process.execPath,['scripts/build.mjs'],{stdio:'inherit',cwd:resolve(root,'play-app')});if(result.status)process.exit(result.status);
const out=resolve('cloudflare/public');await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
const rootFiles=['404.html','content.html','game.html','index.html','lore.html','map.html','moons.html','gif.worker.js','hat-flame.png','header-hat.jpeg','header-hat.png','IMG_4071.jpeg','nav.js','og-image.jpg','orb-cursor.js','robots.txt','shared.css','site-metrics.js','sitemap.xml','sparkle.js','starfield.js','wizard-dogs-data.js','wizard-dogs-map.js','wizard-stories.json','wizards-data.js','deploy-version.txt'];
for(const name of rootFiles)await cp(name,resolve(out,name));
const publicExtensions=new Set(['.html','.js','.css','.png','.jpg','.jpeg','.gif','.webp','.svg','.ico','.json','.woff','.woff2','.ttf','.glb','.gltf','.bin','.mp3','.mp4','.ogg','.wav']);
async function copyPublic(src,dst){await mkdir(dst,{recursive:true});for(const e of await readdir(src,{withFileTypes:true})){if(e.name.startsWith('.'))continue;const a=resolve(src,e.name),b=resolve(dst,e.name);if(e.isDirectory())await copyPublic(a,b);else if(publicExtensions.has(extname(e.name)))await cp(a,b);}}
for(const name of ['images','wizard-images','wizard-images-transparent','studio','lore'])await copyPublic(name,resolve(out,name));
await copyPublic('play-app/dist/client',resolve(out,'play'));
const wizards=require('../wizards-data.js'),{renderWizardPage}=require('../wizard-page.js'),{generateOGCard}=require('../og-card.js');
await mkdir(resolve(out,'wizard'),{recursive:true});
for(const [id,dog] of Object.entries(wizards)){await mkdir(resolve(out,'wizard',id),{recursive:true});await writeFile(resolve(out,'wizard',id+'.html'),renderWizardPage(dog,'https://theorderof86.com').replace('</body>','<script src="/site-metrics.js" defer></script></body>'));await writeFile(resolve(out,'wizard',id,'og.png'),await generateOGCard(dog));}
let count=0,bytes=0;async function audit(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);if(e.isDirectory())await audit(p);else{const s=await stat(p);if(s.size>25*1024*1024)throw Error('Asset exceeds Cloudflare limit: '+p);count++;bytes+=s.size;}}}await audit(out);
console.log(JSON.stringify({assets:count,bytes,wizards:Object.keys(wizards).length}));
