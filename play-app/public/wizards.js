import {officialWizards} from './official-wizards.js';
// The directory lists 13 individual Arcane dogs; together with the Wanderer these total 86.
export const orderColors={Flame:'#f58220',Wild:'#388e45',Arcane:'#8746be',Deep:'#287ccc',Radiant:'#f4cd28',Dream:'#ff00ff',Wanderer:'#8746be'};
const groups={
Flame:`8728|Frostforge|Husky|Gray|Square Glasses|Scarf
5035|Blizzardflame|Husky|Black|Sleepy Eyes|Scarf
9758|Commonflame|Classic|Tan|Black Eyes|Classic Hoodie
3030|Pureflame|Classic|White|Black Eyes|None
986|Splitforge|Split|Gray|Square Glasses|None
165|Vanguard|Husky|Gray|Visor|None
5275|Tideforge|Split|Brown|Yellow Eyes|None
8667|Goldforge|Solid|Orange|Sleepy Eyes|None
7770|Stripesight|Tiger|Gray|Red Eyes|None
7710|Goldstrike|Solid|Yellow|Sleepy Eyes|None
1848|Lensfire|Tiger|Yellow|Round Glasses|None
4540|Blotforge|Blotted|White|Visor|None
8095|Rosestrike|Split|Gray|Magenta Eyes|None
5518|Voidstrike|Split|Black|Green Eyes|None
1714|Roseheart|Classic|Brown|Magenta Eyes|None
246|Goldburn|Solid|Orange|Black Eyes|None
4042|Roseflame|Classic|Gray|Magenta Eyes|None
1053|Deathforge|Zombie|Black|Black Eyes|None`,
Wild:`3449|Stripeheart|Tiger|Brown|Magenta Eyes|Poncho
8272|Spotforge|Spotted|White|Round Glasses|Lumberjack
8822|Chaosbloom|Blotted|White|Square Glasses|Sport Hoodie
6398|Tideseed|Split|Brown|Black Eyes|Shirt
2426|Blotbark|Blotted|White|Black Eyes|Turtleneck
1977|Greensight|Classic|Black|Green Eyes|Collar
1976|Frostbark|Husky|Gray|Black Eyes|Collar
3758|Deathbloom|Zombie|Purple|Red Eyes|None
8965|Brownthorn|Classic|Brown|Black Eyes|Scarf
6873|Goldleaf|Solid|Yellow|Mixed Eyes|None
2807|Voidbloom|Zombie|Green|Visor|None
9952|Grimbloom|Zombie|Black|Green Eyes|None
8284|Stripesight|Tiger|Black|Round Glasses|None
5374|Redsight|Spotted|Black|Red Eyes|None
3826|Orangeheart|Classic|Orange|Green Eyes|None
5177|Frostgrow|Husky|Gray|Black Eyes|None
5538|Graystorm|Solid|Gray|Sleepy Eyes|None
9713|Darkleaf|Classic|Black|Black Eyes|None`,
Arcane:`8518|Goldstripe|Tiger|Black|Yellow Eyes|None
3406|Blueshirt|Solid|Yellow|Blue Eyes|Shirt
9234|Shadowspot|Spotted|Black|Black Eyes|Scarf
8311|Goldvisor|Tiger|Yellow|Visor|None
9301|Rosegold|Solid|Yellow|Magenta Eyes|None
5056|Brownvisor|Tiger|Brown|Visor|None
5240|Graysleep|Solid|Gray|Sleepy Eyes|None
4994|Whitecoat|Collie|White|Red Eyes|None
8342|Whiteheart|Split|White|Red Eyes|None
9826|Greenbone|Zombie|Green|Black Eyes|None
6095|Dalmatianscript|Dalmatian|White|Square Glasses|None
9898|Orangeheart|Classic|Orange|Green Eyes|None
8154|Grayglasses|Classic|Gray|Square Glasses|None`,
Deep:`4165|Magentagaze|Collie|White|Magenta Eyes|Poncho
9530|Bernardguard|Bernard|White|Black Eyes|Shirt
3557|Goldstare|Tiger|Yellow|Yellow Eyes|None
2634|Mixedsight|Split|Black|Mixed Eyes|None
4742|Blottedmist|Blotted|White|Sleepy Eyes|None
6135|Bluevisor|Classic|Blue|Visor|None
5516|Whiteguard|Classic|White|Black Eyes|Collar
6232|Goldsolid|Solid|Yellow|Black Eyes|None
6597|Blackglasses|Classic|Black|Square Glasses|None
7257|Graydreamer|Classic|Gray|Sleepy Eyes|None
1841|Orangeclassic|Classic|Orange|Black Eyes|None
3417|Orangeshield|Classic|Orange|Black Eyes|None
7226|Tanwatcher|Classic|Tan|Black Eyes|None`,
Radiant:`9684|Goldblot|Blotted|White|Yellow Eyes|Shirt
9604|Beigelumber|Classic|Beige|Black Eyes|Lumberjack
9469|Whitemist|Blotted|White|Sleepy Eyes|None
7833|Bronzebeacon|Shiny|Bronze|Black Eyes|Sport Hoodie
9396|Tancollar|Husky|Tan|Black Eyes|Collar
5381|Roseclassic|Classic|Magenta|Black Eyes|Tracksuit
7731|Beigelight|Classic|Beige|Black Eyes|Shirt
9025|Grayheart|Split|Gray|Red Eyes|None
6203|Sleepytan|Husky|Tan|Sleepy Eyes|None
9183|Whiteheart|Split|White|Magenta Eyes|None
4458|Whiteglasses|Split|White|Square Glasses|None
3186|Brownheart|Classic|Brown|Black Eyes|None`,
Dream:`9089|The Warlock|Split|Black|Red Eyes|Tracksuit + Ball
2855|Glassesheart|Classic|Gray|Square Glasses|Collar
3735|Tancollar|Classic|Tan|Black Eyes|Collar
6502|Sleepyheart|Classic|Tan|Sleepy Eyes|None
4650|Brownheart|Classic|Brown|Black Eyes|None
7439|Sleepyhusky|Husky|Tan|Sleepy Eyes|None
6198|Blackhusky|Husky|Black|Sleepy Eyes|None
9624|Brownsteady|Classic|Brown|Black Eyes|None
3479|Grayheart|Classic|Gray|Black Eyes|None
1271|Tansteady|Classic|Tan|Black Eyes|None
9017|Sleepysteady|Classic|Gray|Sleepy Eyes|None`,
Wanderer:`6164|The Wanderer|Classic|Gray|Round Glasses|None`};
export const wizards=Object.entries(groups).flatMap(([order,rows])=>rows.split('\n').map(row=>{const [id,name,breed,fur,eyes,clothes]=row.split('|');const o=officialWizards[id];if(['Arcane','Dream'].includes(order))order=o?.hatColor==='Purple'?'Arcane':'Dream';return {id:Number(id),name,breed:o?.pattern||breed,fur:o?.fur||fur,eyes:o?.eyes||eyes,clothes:o?.clothes||clothes,realm:o?.realm,hatColor:o?.hatColor,displayName:o?.suggestedName,order,mouth:null,mouthSource:'Not specified in supplied bible'}}));
export const furColors={Gray:'#808080',Black:'#181818',White:'#f5f5f5',Tan:'#c89d69',Brown:'#794b2b',Orange:'#ee791b',Yellow:'#f4cf32',Purple:'#8544b5',Green:'#39864c',Blue:'#367dbb',Beige:'#dfcba9',Magenta:'#ed8bed',Bronze:'#b87936'};
