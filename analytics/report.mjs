import {openAnalytics} from './store.mjs';
import {dirname,join} from 'node:path';
const days=Number(process.argv[2]||30);if(!Number.isInteger(days)||days<1||days>3650)throw Error('Days must be 1..3650');
const store=openAnalytics(process.env.ANALYTICS_DB_PATH||join(dirname(process.env.PLAY_DB_PATH||'/data/pawtheon.sqlite'),'site-analytics.sqlite'));
try{console.log(JSON.stringify(store.report(days),null,2));}finally{store.close();}
