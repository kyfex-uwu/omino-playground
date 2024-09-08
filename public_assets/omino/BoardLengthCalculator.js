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

function smartMin(...args){
	return Math.min.apply(null,args.filter(t=>t!==undefined).map(t=>t.dist===undefined?Infinity:t.dist));
}

//takes a starting tile and calculates every other tile's distance away from it,
//and stores that distance in the tile
//breadth first! otherwise itll lag so bad
function propagateDist(tile, dist=0, tilesToProcess){
	if(tilesToProcess===undefined){
		tilesToProcess=new Set();
		//controller
		tile.dist=0;
		propagateDist(tile, 0, tilesToProcess);
		do{
			for(const subTile of tilesToProcess){
				subTile.dist = smartMin(
					subTile.right,
					subTile.left,
					subTile.up,
					subTile.down)+1;
				propagateDist(subTile, subTile.dist, tilesToProcess);
				tilesToProcess.delete(subTile);
			}
		}while(tilesToProcess.size>0);
	}else{
		if(tile.left&&tile.left.dist===undefined) tilesToProcess.add(tile.left);
		if(tile.right&&tile.right.dist===undefined) tilesToProcess.add(tile.right);
		if(tile.up&&tile.up.dist===undefined) tilesToProcess.add(tile.up);
		if(tile.down&&tile.down.dist===undefined) tilesToProcess.add(tile.down);
	}
}

//todo: comment these
function findLongestShortest(currPoint, pool, maybePaths, data={}){
  let orig=currPoint;

  let prevPoint;
  for(;;){
    for(const point of pool) point.dist=undefined;
    propagateDist(currPoint);

  	// let toPrint=[];
  	// for(const point of pool){
  	// 	while(!toPrint[point.pos.y]) toPrint.push([]);
  	// 	while(toPrint[point.pos.y][point.pos.x]==undefined) toPrint[point.pos.y].push(" ");

  	// 	toPrint[point.pos.y][point.pos.x]=point.dist.toString(36);
  	// }

  	let furthestPoints;
  	if(!data.end){
	    furthestPoints = pool.sort((p1,p2)=>p2.dist-p1.dist);
	    furthestPoints = furthestPoints.filter(p=>p.dist==furthestPoints[0].dist);
	  }else{
	  	furthestPoints=[data.end];
	  }

    if(furthestPoints.includes(prevPoint)){
      prevPoint=currPoint;
      currPoint=furthestPoints[0];
      break;
    }

    prevPoint=currPoint;
    currPoint=furthestPoints[0];

    if(data.startFixed) break;
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

	if(data.startPoint) data.startPoint = new Vector(...data.startPoint._pos);
	if(data.endPoint) data.endPoint = new Vector(...data.endPoint._pos);

	let namedTiles={};
	for(let y=0;y<height;y++){
		for(let x=0;x<width;x++){
			if(!board[y][x]){
				let pos = new Vector(x,y);
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
	for(const tile of Object.values(namedTiles)){
    tile.left=namedTiles[tile.pos.left().toURLStr()];
    tile.right=namedTiles[tile.pos.right().toURLStr()];
    tile.up=namedTiles[tile.pos.up().toURLStr()];
    tile.down=namedTiles[tile.pos.down().toURLStr()];

    if(data.torusMode){
    	if(tile.pos.x==0) tile.left = namedTiles[new Vector(width-1, tile.pos.y).toURLStr()];
    	else if(tile.pos.x==width-1) tile.right = namedTiles[new Vector(0, tile.pos.y).toURLStr()];
    	if(tile.pos.y==0) tile.up = namedTiles[new Vector(tile.pos.x, height-1).toURLStr()];
    	else if(tile.pos.y==height-1) tile.down = namedTiles[new Vector(tile.pos.x, 0).toURLStr()];
    }
	}

	let remainingTiles=new Set(Object.values(namedTiles));
	let pools=[];
	for(;;){
		if(remainingTiles.size==0) break;

		let pool = getConnected(remainingTiles.values().next().value);
		for(const tile of pool) remainingTiles.delete(tile);
		pools.push(pool);
	}

	if(data.startPoint){
		for(const pool of pools){
			if(!pool.some(p=>p.pos.equals(data.startPoint)))
				pool.length=0;
		}
	}
	if(data.endPoint){
		for(const pool of pools){
			if(!pool.some(p=>p.pos.equals(data.endPoint)))
				pool.length=0;
		}
	}

	let maybePaths=[];
	for(const pool of pools){
		if(pool.length==0) continue;

		let end;
		if(data.startPoint){
			let start = pool.find(p=>p.pos.equals(data.startPoint));
			if(data.endPoint) findLongestShortest(start, pool, maybePaths,
				{startFixed:true, end:(end=pool.find(p=>p.pos.equals(data.endPoint)))});
			else findLongestShortest(start, pool, maybePaths, {startFixed:true});
		}else if(data.endPoint) findLongestShortest(pool[0], pool, maybePaths, 
			{end:(end=pool.find(p=>p.pos.equals(data.endPoint)))});
		else findLongestShortest(pool[0], pool, maybePaths);

		if(!data.startPoint){
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
	        findLongestShortest(pool.find(p=>p.pos.equals(tile.pos)), pool, maybePaths, {end, startFixed:true});
	      }
			}
		}
	}

	if(maybePaths.length==0) return [];
	else return maybePaths.sort((p1,p2)=>p2.length-p1.length)[0].map(p=>p.pos._pos);
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