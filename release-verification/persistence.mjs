import assert from 'node:assert/strict';
import {writeFile,readFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
const origin='https://theorderof86.com',file='/tmp/order86-play-persistence-witness.json';
if(process.argv[2]==='create'){
 const response=await fetch(origin+'/play/api/accounts/signup',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-Pawtheon-Request':'1'},body:JSON.stringify({username:'verify_'+randomBytes(6).toString('hex'),password:randomBytes(24).toString('base64url'),name:'Release Storage Check'})});
 assert.equal(response.status,200);const cookie=response.headers.get('set-cookie').split(';')[0];assert(response.headers.get('set-cookie').includes('Secure'));const {user}=await response.json();
 const save={'pawtheon-lizards-v1':'["common-0"]','pawtheon-dog':'5035'};
 const result=await fetch(origin+'/play/api/accounts/save',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-Pawtheon-Request':'1',Cookie:cookie},body:JSON.stringify({accountId:user.id,revision:0,save})});assert.equal(result.status,200);assert.equal((await result.json()).revision,1);
 await writeFile(file,JSON.stringify({cookie,id:user.id,save}),{mode:0o600});console.log('PASS production save created; private persistence witness stored locally');
}else{
 const witness=JSON.parse(await readFile(file,'utf8'));const response=await fetch(origin+'/play/api/accounts/session',{headers:{Cookie:witness.cookie}});assert.equal(response.status,200);const state=await response.json();assert.equal(state.user.id,witness.id);assert.equal(state.revision,1);assert.deepEqual(state.save,witness.save);console.log('PASS production account and saved progress survived deployment replacement');
}
