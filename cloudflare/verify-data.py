#!/usr/bin/env python3
"""Compare source snapshot rows against a private D1 SQL export without printing data."""
import argparse,json,pathlib,sqlite3
p=argparse.ArgumentParser();p.add_argument('--backup',required=True);p.add_argument('--export',dest='export_file',required=True);args=p.parse_args()
root=pathlib.Path(args.backup);export=pathlib.Path(args.export_file);export.chmod(0o600)
remote=sqlite3.connect(':memory:');remote.executescript(export.read_text());summary=[]
for name in ['pawtheon','site-analytics']:
 db=sqlite3.connect(root/(name+'.sqlite'))
 for table, in db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"):
  rows=lambda c:sorted(json.dumps(row,separators=(',',':')) for row in c.execute('SELECT * FROM "'+table+'"'))
  a,b=rows(db),rows(remote)
  if a!=b:raise SystemExit('Data mismatch in '+table)
  summary.append({'table':table,'rows':len(a),'match':True})
print(json.dumps(summary,indent=2))
