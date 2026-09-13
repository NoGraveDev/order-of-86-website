import {chooseChessMove} from './chess-ai.js';
onmessage=({data})=>{try{postMessage({move:chooseChessMove(data.fen,data.depth)});}catch{postMessage({error:'The AI could not choose a move. Start a new game to retry.'});}};
