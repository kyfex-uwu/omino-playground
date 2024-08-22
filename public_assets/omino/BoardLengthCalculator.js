/** Board Length Calculator
 * This file calculates the longest optimal length for any board,
 * hopefully it's commented well enough 
 */

//just a datatype with an X and a Y property
import Vector from "/assets/omino/Vector.js";

const aroundMap = [
  [-1,-1],[0,-1],[1,-1],
  [-1,0],        [1,0],
  [-1,1], [0,1], [1,1],
];

//takes in a vector, and returns the 8 positions around it
function getAroundPositions(pos){
	return aroundMap.map(p=>pos.add(new Vector(p[0],p[1])));
}

//recursive function that returns all tiles that are all connected
//to this one orthoganally
function getConnected(tile, tiles=[]){
	if(tiles.includes(tile)) return tiles;
	tiles.push(tile);

	if(tile.left) getConnected(tile.left, tiles);
	if(tile.right) getConnected(tile.right, tiles);
	if(tile.up) getConnected(tile.up, tiles);
	if(tile.down) getConnected(tile.down, tiles);

	return tiles;
}

//takes a starting tile and calculates every other tile's distance away from it,
//and stores that distance in the tile
function propagateDist(tile, dist=0){
	if(tile.dist!==undefined&&tile.dist<dist) return;
	tile.dist = dist;
	if(tile.left) propagateDist(tile.left, dist+1);
	if(tile.right) propagateDist(tile.right, dist+1);
	if(tile.up) propagateDist(tile.up, dist+1);
	if(tile.down) propagateDist(tile.down, dist+1);
}

//todo: comment these
function findLongestShortest(currPoint, pool, maybePaths){
  let prevPoint;
  for(;;){
    for(const point of pool) point.dist=undefined;
    propagateDist(currPoint);

  	let toPrint=[];
  	for(const point of pool){
  		while(!toPrint[point.pos.y]) toPrint.push([]);
  		while(toPrint[point.pos.y][point.pos.x]==undefined) toPrint[point.pos.y].push(" ");

  		toPrint[point.pos.y][point.pos.x]=point.dist.toString(36);
  	}

    let furthestPoints = pool.sort((p1,p2)=>p2.dist-p1.dist);
    furthestPoints = furthestPoints.filter(p=>p.dist==furthestPoints[0].dist);

    if(furthestPoints.includes(prevPoint)){
      prevPoint=currPoint;
      currPoint=furthestPoints[0];
      break;
    }

    prevPoint=currPoint;
    currPoint=furthestPoints[0];
  }

  let maybePath=[currPoint];
  for(;;){
    let last=maybePath[maybePath.length-1];
    if(last.dist==0) break;

    if(last.left&&last.left.dist==last.dist-1) maybePath.push(last.left);
    else if(last.right&&last.right.dist==last.dist-1) maybePath.push(last.right);
    else if(last.up&&last.up.dist==last.dist-1) maybePath.push(last.up);
    else if(last.down&&last.down.dist==last.dist-1) maybePath.push(last.down);
  }
  maybePaths.push(maybePath);
  return maybePath;
}

function calcLength(data){
	let board=data.board;
	let height=data.board.length;
	let width=data.board[0].length;

	let namedTiles={};
	for(let y=0;y<height;y++){
		for(let x=0;x<width;x++){
			if(!board[y][x]){
				var pos = new Vector(x,y);
				namedTiles[pos.toURLStr()]={pos};
			}
		}
	}
	for(const tile of Object.values(namedTiles)){
		let hasWall=false;
		for(let y=-1;y<=1;y++){
			for(let x=-1;x<=1;x++){
				if(!namedTiles[tile.pos.add(new Vector(x,y)).toURLStr()]){
					hasWall=true;
					break;
				}
			}
			if(hasWall) break;
		}

		if(!hasWall) tile.isolated=true;
	}
	let filteredTiles={};
	for(const [k,v] of Object.entries(namedTiles)){
		if(!v.isolated) filteredTiles[k]=v;
	}
	filteredTiles=namedTiles;//debug
	for(const tile of Object.values(filteredTiles)){
    tile.left=filteredTiles[tile.pos.left().toURLStr()];
    tile.right=filteredTiles[tile.pos.right().toURLStr()];
    tile.up=filteredTiles[tile.pos.up().toURLStr()];
    tile.down=filteredTiles[tile.pos.down().toURLStr()];

    if(data.torusMode){
    	if(tile.pos.x==0) tile.left = filteredTiles[new Vector(width-1, tile.pos.y).toURLStr()];
    	else if(tile.pos.x==width-1) tile.right = filteredTiles[new Vector(0, tile.pos.y).toURLStr()];
    	if(tile.pos.y==0) tile.up = filteredTiles[new Vector(tile.pos.x, height-1).toURLStr()];
    	else if(tile.pos.y==height-1) tile.down = filteredTiles[new Vector(tile.pos.x, 0).toURLStr()];
    }
	}

	let remainingTiles=new Set(Object.values(filteredTiles));
	let pools=[];
	for(;;){
		if(remainingTiles.size==0) break;

		let pool = getConnected(remainingTiles.values().next().value);
		for(const tile of pool) remainingTiles.delete(tile);
		pools.push(pool);
	}

	//it takes very little time to get here
	let startTime=Date.now();

	let maybePaths=[];
	for(let pool of pools){
		findLongestShortest(pool[0], pool, maybePaths);

		for(const tile of pool){
			let map=getAroundPositions(tile.pos).map(offs=>{
        return pool.some(p=>p.pos.equals(offs));
      }).reduce((a,c)=>a*2+(c?0:1),0);

      if(map==0b0010_1111||
          map==0b1001_0111||
          map==0b1110_1001||
          map==0b1111_0100||

          (map|0b1010_0101)==0b1111_1101||
          (map|0b1010_0101)==0b1011_1111||
          (map|0b1010_0101)==0b1110_1111||
          (map|0b1010_0101)==0b1111_0111){
        //valid start
        findLongestShortest(pool.find(p=>p.pos.equals(tile.pos)), pool, maybePaths);
      }
		}
	}

	if(maybePaths.length==0) return [];
	else return maybePaths.sort((p1,p2)=>p2.length-p1.length)[0].map(p=>p.pos);
}

//-- unnecessary communication stuff below here

let safePostMessage = postMessage;
function fake(newPostMessage){
	safePostMessage=newPostMessage;
}

function onMessage(e){
	if(e.data=="_grecaptcha_ready") return;//what
	safePostMessage(calcLength(e.data));
}
onmessage = onMessage;

export {onMessage, fake};
