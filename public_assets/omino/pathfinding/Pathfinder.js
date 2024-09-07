/** Board Length Calculator
 * This file calculates the longest optimal length for any board,
 * hopefully it's commented well enough 
 */

import Vector from "/assets/omino/Vector.js";

import SquareEuclidean from "/assets/omino/pathfinding/SquareEuclidean.js";
import SquareTorus from "/assets/omino/pathfinding/SquareTorus.js";
import TriangleEuclidean from "/assets/omino/pathfinding/TriangleEuclidean.js";
const methods={
	SquareEuclidean,
	SquareTorus,
	TriangleEuclidean
};

//recursive function that returns all tiles that are all connected
//to this one orthoganally
function getConnected(tile, tiles=[]){
	if(tiles.includes(tile)) return tiles;
	tiles.push(tile);

	for(const connectedTile of tile.connections)
		getConnected(connectedTile, tiles);

	return tiles;
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
		let counter=500;
		do{
			for(const subTile of tilesToProcess){
				subTile.dist = Math.min.apply(null, subTile.connections.map(t=>t.dist).filter(d=>d!==undefined))+1;
				propagateDist(subTile, subTile.dist, tilesToProcess);
				tilesToProcess.delete(subTile);
			}
		}while(tilesToProcess.size>0&&counter-->0);
	}else{
		for(const connectedTile of tile.connections)
			if(connectedTile.dist===undefined) tilesToProcess.add(connectedTile);
	}
}

/** back and forth algorithm
 * 
 * 1. pick any tile in a group of connected tiles, this is the current tile
 * 2. define some tile that DOES NOT EXIST (for now, you'll see why later), this is the previous tile
 * 3. get the farthest points away from the current tile, this is list F (farthest)
 * 4. if the previous tile is in this list F, we have our longest shortest path: the path from previous to current.
 *		otherwise, set the previous tile to the current tile, and set the current tile to the first tile in list C.
 * 5. repeat from step 3
 */

//finds and returns the longest path in the given pool, starting from currPoint
function findLongestShortest(currPoint, pool, maybePaths, data={}){
  let orig=currPoint;

  //gets the longest path, starting from currPoint
  //using the back and forth algorithm
  //(there's also stuff in here if you have a fixed start or end)
  let prevPoint;
  for(;;){
    for(const point of pool) point.dist=undefined;
    propagateDist(currPoint);

  	let farthestPoints;
  	if(!data.end){
	    farthestPoints = pool.sort((p1,p2)=>p2.dist-p1.dist);
	    farthestPoints = farthestPoints.filter(p=>p.dist==farthestPoints[0].dist);
	  }else{
	  	farthestPoints=[data.end];
	  }

    if(farthestPoints.includes(prevPoint)){
      prevPoint=currPoint;
      currPoint=farthestPoints[0];
      break;
    }

    prevPoint=currPoint;
    currPoint=farthestPoints[0];

    if(data.startFixed) break;
  }

  let maybePath=[currPoint];
  for(;;){
    let last=maybePath[maybePath.length-1];
    if(last.dist==0) break;

    for(const connection of last.connections){
    	if(connection.dist!=last.dist-1) continue;
    	maybePath.push(connection);
    	break;
    }
  }
  maybePaths.push(maybePath);
  return maybePath;
}

async function calcLength(data){
	if(data.startPoint) data.startPoint=new Vector(...data.startPoint._pos);
	if(data.endPoint) data.endPoint=new Vector(...data.endPoint._pos);
	const method=methods[data.method];

	//split tiles into pools
	//a pool is just an area of connected tiles. on most boards there is only 1 pool but
	//we need to run the pathfinding algorithm on each pool just in case
	let remainingTiles=new Set(Object.values(method.getAllTiles(data.board)));
	let pools=[];
	for(;;){
		if(remainingTiles.size==0) break;

		let pool = getConnected(remainingTiles.values().next().value);
		for(const tile of pool) remainingTiles.delete(tile);
		pools.push(pool);
	}

	//removing pools that dont have the start or end point (if there is one)
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

	//iterate through the pools
	let maybePaths=[];
	for(const pool of pools){
		if(pool.length==0) continue;

		//if only start or end are specified
		if((data.startPoint||data.endPoint)&&!(data.startPoint&&data.endPoint)){
			let start=data.startPoint||data.endPoint;
			start=pool.find(p=>p.pos.equals(start));
			findLongestShortest(start, pool, maybePaths, {startFixed:true});

		//if both are specified
		}else if(data.startPoint&&data.endPoint){
			findLongestShortest(pool.find(p=>p.pos.equals(data.startPoint)), 
				pool, maybePaths, {startFixed:true, end:pool.find(p=>p.pos.equals(data.endPoint))});

		//if neither are specified (raagh)
		}else{
			let didCheck=false;
			for(const tile of pool){
				//do some checking, more can be done

				//check if tile is on a wall
				if(!method.isTileOnWall(tile)) continue;

				didCheck=true;
				findLongestShortest(pool.find(p=>p.pos.equals(tile.pos)), pool, maybePaths, {startFixed:true});
			}

			if(!didCheck) findLongestShortest(pool[0], pool, maybePaths);
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
	calcLength(e.data).then(response=>safePostMessage(response));
}
onmessage = onMessage;

export {onMessage, fake};
