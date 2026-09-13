import {Chess} from './vendor/chess.js';
const value={p:100,n:320,b:330,r:500,q:900,k:0};
// Deterministic, bounded alpha-beta search; run in a worker, never on the render loop.
export function chooseChessMove(fen,depth=2){const game=new Chess(fen),side=game.turn();let nodes=0;
 function evaluate(){if(game.isCheckmate())return game.turn()===side?-100000:100000;if(game.isDraw())return 0;let score=0;for(const row of game.board())for(const p of row)if(p){const file=p.square.charCodeAt(0)-97,rank=Number(p.square[1])-1,center=7-Math.abs(file-3.5)-Math.abs(rank-3.5),advance=p.color==='w'?rank:7-rank;score+=(p.color===side?1:-1)*(value[p.type]+(p.type==='p'?advance*7:center*(p.type==='n'?8:3)));}return score;}
 const ordered=()=>game.moves({verbose:true}).sort((a,b)=>(value[b.captured]||0)+(value[b.promotion]||0)-(value[a.captured]||0)-(value[a.promotion]||0));
 function search(d,alpha,beta){nodes++;if(!d||game.isGameOver()||nodes>16000)return evaluate();const max=game.turn()===side;let best=max?-Infinity:Infinity;for(const m of ordered()){game.move(m);const score=search(d-1,alpha,beta);game.undo();best=max?Math.max(best,score):Math.min(best,score);if(max)alpha=Math.max(alpha,best);else beta=Math.min(beta,best);if(beta<=alpha)break;}return best;}
 let best=null,score=-Infinity;for(const m of ordered()){game.move(m);const v=search(Math.max(1,Math.min(3,depth))-1,-Infinity,Infinity);game.undo();if(v>score){score=v;best={from:m.from,to:m.to,promotion:m.promotion||'q'};}}return best;
}
