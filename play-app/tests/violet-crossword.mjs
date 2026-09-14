import assert from 'node:assert/strict';
import {crosswordWords,wordCells,crosswordSolved,enterCrosswordWord,cleanAnswer} from '../public/violet-crossword-model.js';
const cells=new Map(),links=crosswordWords.map(()=>new Set());
for(const [i,w]of crosswordWords.entries())for(const [n,key]of wordCells(w).entries()){if(cells.has(key)){const prev=cells.get(key);assert.equal(prev.char,w.answer[n]);assert.notEqual(crosswordWords[prev.word].axis,w.axis);links[i].add(prev.word);links[prev.word].add(i);}else cells.set(key,{char:w.answer[n],word:i});}
const seen=new Set([0]),queue=[0];while(queue.length)for(const i of links[queue.pop()])if(!seen.has(i)){seen.add(i);queue.push(i);}assert.equal(seen.size,12,'All words connect');
const letters={};assert(!crosswordSolved(letters));for(const [i,w]of crosswordWords.entries())enterCrosswordWord(letters,i,w.answer.toLowerCase());assert(crosswordSolved(letters));enterCrosswordWord(letters,0,'wrong');assert(!crosswordSolved(letters));assert.equal(cleanAnswer('m-o o n!'),'MOON');
console.log('PASS 12 connected clues, matching crossings, case normalization, completion and incorrect answer rejection');
