// Perfect mazes: randomized depth-first spanning tree, with one reachable exit.
export function makeMaze(seed=Date.now(),cells=9){
 if(![9,13,86].includes(cells))throw new RangeError('Unsupported maze size');
 let random=seed>>>0;const rand=()=>{random=(Math.imul(random,1664525)+1013904223)>>>0;return random/4294967296};
 const size=cells*2+1,grid=Array.from({length:size},()=>Array(size).fill(1)),stack=[[1,1]];grid[1][1]=0;
 while(stack.length){const [x,y]=stack.at(-1),next=[[2,0],[-2,0],[0,2],[0,-2]].map(([dx,dy])=>[x+dx,y+dy,dx,dy]).filter(([a,b])=>a>0&&b>0&&a<size-1&&b<size-1&&grid[b][a]);if(!next.length){stack.pop();continue}const [a,b,dx,dy]=next[Math.floor(rand()*next.length)];grid[y+dy/2][x+dx/2]=grid[b][a]=0;stack.push([a,b]);}
 grid[size-2][size-1]=0;
 return{seed:seed>>>0,cells,size,grid,x:1,y:1,exit:{x:size-1,y:size-2},moves:0,won:false};
}
export function moveMaze(state,dx,dy){
 if(state.won||Math.abs(dx)+Math.abs(dy)!==1||state.grid[state.y+dy]?.[state.x+dx]!==0)return false;
 state.x+=dx;state.y+=dy;state.moves++;state.won=state.x===state.exit.x&&state.y===state.exit.y;return true;
}

// Clamp a readable follow window inside the maze, including boundary exit tiles.
export function mazeViewport(state,tiles=23){const span=Math.min(state.size,Math.max(7,Math.floor(tiles))),half=Math.floor(span/2);return {x:Math.max(0,Math.min(state.size-span,state.x-half)),y:Math.max(0,Math.min(state.size-span,state.y-half)),span};}
