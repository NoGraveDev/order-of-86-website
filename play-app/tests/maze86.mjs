import assert from 'node:assert/strict';import {makeMaze,moveMaze,mazeViewport} from '../public/sunward-maze-model.js';
for(const cells of [9,13,86])for(const seed of [1,86,2026]){
 const s=makeMaze(seed,cells);assert.equal(s.size,cells*2+1);assert.deepEqual(s.grid,makeMaze(seed,cells).grid);const queue=[[1,1]],parent=new Map([['1,1',null]]);let edges=0;
 for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(s.grid[ny]?.[nx]!==0)continue;edges++;const key=nx+','+ny;if(!parent.has(key)){parent.set(key,[x,y]);queue.push([nx,ny]);}}}
 assert.equal(parent.size,cells*cells*2);assert.equal(edges/2,parent.size-1,'Perfect connected maze has no cycles');const path=[];let at=[s.exit.x,s.exit.y];while(at){path.push(at);at=parent.get(at.join(','));}path.reverse();
 for(let i=1;i<path.length;i++){assert(moveMaze(s,path[i][0]-s.x,path[i][1]-s.y));const v=mazeViewport(s,23);assert(s.x>=v.x&&s.x<v.x+v.span&&s.y>=v.y&&s.y<v.y+v.span);assert(v.x>=0&&v.y>=0&&v.x+v.span<=s.size&&v.y+v.span<=s.size);}
 assert(s.won);assert.equal(s.moves,path.length-1);assert.equal(moveMaze(s,-1,0),false);if(cells===86)assert.equal(s.grid.length,173);
}
assert.throws(()=>makeMaze(1,87),RangeError);console.log('PASS true86×86cells/173grid, seeded determinism, connected perfect maze, legal complete solutions, old9/13, bounded follow viewport through exit');
