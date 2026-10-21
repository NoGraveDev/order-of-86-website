#!/usr/bin/env python3
"""Consistent Railway snapshots and D1 import file; never prints account records.
Run from repository root. The final cutover must pause source writes first.
Backups are deliberately kept OUTSIDE the repository and public assets.
"""
import argparse,base64,hashlib,json,pathlib,shlex,sqlite3,subprocess
parser=argparse.ArgumentParser()
parser.add_argument('--label',required=True)
args=parser.parse_args()
if not args.label.replace('-','').replace('_','').isalnum():raise SystemExit('Use a simple unique backup label')
out=pathlib.Path.home()/'.openclaw/private-backups'/('order86-'+args.label)
out.mkdir(mode=0o700,parents=True,exist_ok=False)
statements=[];summary=[]
for name in ['pawtheon','site-analytics']:
 destination='/data/backups/cloudflare-'+args.label+'-'+name+'.sqlite'
 script="const {DatabaseSync}=require('node:sqlite');const fs=require('node:fs');const db=new DatabaseSync("+json.dumps('/data/'+name+'.sqlite')+");db.exec(\"VACUUM INTO '\"+"+json.dumps(destination)+"+\"'\");db.close();process.stdout.write('BACKUP_START'+fs.readFileSync("+json.dumps(destination)+").toString('base64')+'BACKUP_END');"
 response=subprocess.run(['railway','ssh','--','node -e '+shlex.quote(script)],stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=True)
 data=base64.b64decode(response.stdout.split(b'BACKUP_START')[1].split(b'BACKUP_END')[0])
 target=out/(name+'.sqlite');target.write_bytes(data);target.chmod(0o600)
 db=sqlite3.connect(target);assert db.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
 statements.extend(s for s in db.iterdump() if s not in ['BEGIN TRANSACTION;','COMMIT;'])
 tables={table:db.execute('SELECT count(*) FROM "'+table+'"').fetchone()[0] for table, in db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")}
 summary.append({'database':name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'tables':tables});db.close()
target=out/'import-d1.sql';target.write_text('\n'.join(statements));target.chmod(0o600)
(out/'manifest.json').write_text(json.dumps(summary,indent=2));(out/'manifest.json').chmod(0o600)
print('Verified snapshots and SQL import prepared at '+str(out))
