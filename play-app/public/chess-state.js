import {Chess} from './vendor/chess.js';
export function newTable(){return {gameId:crypto.randomUUID(),outcome:null,moves:[],seats:{w:null,b:null},result:null,rematch:[]};}
export function engineOf(table){const game=new Chess();for(const move of table.moves)game.move(move);return game;}
export function chessAction(table,id,name,action,body={}){
 const next=structuredClone(table),color=['w','b'].find(c=>next.seats[c]?.id===id),game=engineOf(next);
 const finish=winner=>{next.outcome={winner,seats:structuredClone(next.seats)};};
 if(action==='sit'){
  if(color)throw Error('You already have a seat.');
  if(!['w','b'].includes(body.color)||next.seats[body.color])throw Error('That seat is taken.');
  if(next.result||next.moves.length)throw Error('Wait for the next game.');
  next.seats[body.color]={id,name};
 }else if(action==='stand'){
  if(!color)throw Error('You are watching.');
  if(!next.result&&next.seats.w&&next.seats.b){next.result=(color==='w'?'Black':'White')+' wins — opponent left the table.';finish(color==='w'?'b':'w');}
  next.seats[color]=null;next.rematch=[];
  if(!next.seats.w&&!next.seats.b)return newTable();
 }else if(action==='move'){
  if(next.result||!next.seats.w||!next.seats.b)throw Error('Wait for both players to be seated.');
  if(color!==game.turn())throw Error('It is not your turn.');
  let move;try{move=game.move({from:body.from,to:body.to,promotion:body.promotion||'q'});}catch{throw Error('That move is not legal.');}
  next.moves.push(move.san);
  if(game.isCheckmate())next.result=(color==='w'?'White':'Black')+' wins by checkmate.';
  else if(game.isDraw())next.result=game.isStalemate()?'Draw by stalemate.':game.isThreefoldRepetition()?'Draw by repetition.':game.isInsufficientMaterial()?'Draw — insufficient material.':'Draw — fifty-move rule.';
  if(next.result)finish(game.isCheckmate()?color:null);
 }else if(action==='resign'){
  if(!color||next.result||!next.seats.w||!next.seats.b)throw Error('No active game to resign.');
  next.result=(color==='w'?'Black':'White')+' wins by resignation.';finish(color==='w'?'b':'w');
 }else if(action==='rematch'){
  if(!color||!next.result)throw Error('Finish this game first.');
  if(!next.rematch.includes(id))next.rematch.push(id);
  const seated=Object.values(next.seats).filter(Boolean);
  if(seated.every(s=>next.rematch.includes(s.id))){next.gameId=crypto.randomUUID();next.outcome=null;next.moves=[];next.result=null;next.rematch=[];next.seats={w:next.seats.b,b:next.seats.w};}
 }else throw Error('Unknown chess action.');
 return next;
}
