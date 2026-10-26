export function collisionIndex(obstacles,cellSize=32){
 const cells=new Map();let maxRadius=0;for(const c of obstacles){const key=Math.floor(c.x/cellSize)+','+Math.floor(c.z/cellSize);if(!cells.has(key))cells.set(key,[]);cells.get(key).push(c);maxRadius=Math.max(maxRadius,c.r||0)}
 return (x,z,padding=0)=>{const radius=maxRadius+padding,found=[];for(let ix=Math.floor((x-radius)/cellSize);ix<=Math.floor((x+radius)/cellSize);ix++)for(let iz=Math.floor((z-radius)/cellSize);iz<=Math.floor((z+radius)/cellSize);iz++)found.push(...(cells.get(ix+','+iz)||[]));return found};
}
