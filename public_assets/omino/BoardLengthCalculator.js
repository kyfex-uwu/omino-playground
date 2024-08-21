import Vector from "/assets/omino/Vector.js";

let safePostMessage = postMessage;
function fake(newPostMessage){
	safePostMessage=newPostMessage;
}

//--

function getConnected(tile, tiles=[]){
	if(tiles.includes(tile)) return tiles;
	tiles.push(tile);

	if(tile.left) getConnected(tile.left, tiles);
	if(tile.right) getConnected(tile.right, tiles);
	if(tile.up) getConnected(tile.up, tiles);
	if(tile.down) getConnected(tile.down, tiles);

	return tiles;
}

function propagateDist(point, dist=0){
	if(point.dist!==undefined&&point.dist<dist) return;
	point.dist = dist;
	if(point.left) propagateDist(point.left, dist+1);
	if(point.right) propagateDist(point.right, dist+1);
	if(point.up) propagateDist(point.up, dist+1);
	if(point.down) propagateDist(point.down, dist+1);
}

function findLongestShortest(currPoint, pool, maybePaths){
	//let startTime=Date.now();
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
  //console.log(Date.now()-startTime);

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

	//it takes very little time to get here
	let startTime=Date.now();

	let maybePaths=[];
	for(let pool of pools){
		findLongestShortest(pool[0], pool, maybePaths);
		for(const tile of pool){
			let map=[
        [-1,-1],[0,-1],[1,-1],
        [-1,0],        [1,0],
        [-1,1], [0,1], [1,1],
      ].map(p=>{
        let offs=new Vector(p[0],p[1]);
        return pool.some(p=>p.pos.equals(tile.pos.add(offs)));
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

		break;
	  for(let y=0;y<board.length;y++){
	  	break;
	    for(let x=0;x<board[y].length;x++){
	      let pos = new Vector(x,y);
	      if(!pool.some(p=>p.pos.equals(pos))) continue;

	      let map=[
	        [[-1,-1],[0,-1],[1,-1]],
	        [[-1,0],[1,0]],
	        [[-1,1],[0,1],[1,1]],
	      ].map(r=>r.map(p=>{
	        let offs=new Vector(p[0],p[1]);
	        return !!pool.find(p=>p.pos.equals(pos.add(offs)));
	      })).flat().reduce((a,c)=>a*2+(c?0:1),0);

	      if(map==0b0010_1111||
	          map==0b1001_0111||
	          map==0b1110_1001||
	          map==0b1111_0100||

	          (map|0b1010_0101)==0b1111_1101||
	          (map|0b1010_0101)==0b1011_1111||
	          (map|0b1010_0101)==0b1110_1111||
	          (map|0b1010_0101)==0b1111_0111){
	        //valid start
	        findLongestShortest(pool.find(p=>p.pos.equals(pos)), pool, maybePaths);
	      }
	    }
	  }
	}

	if(maybePaths.length==0) return [];
	else return maybePaths.sort((p1,p2)=>p2.length-p1.length)[0].map(p=>p.pos);
}

function send(type, data){
	safePostMessage({type,data});
}
function reply(data, id){
	safePostMessage({data, id});
}
function onMessage(e){
	let message = e.data;

	switch(message.type){
	case "length":
		reply(calcLength(message.data), message.id);
		break;

  default:
    console.log(message.type+" message received from parent, no handler");
    break;
	}
}
onmessage = onMessage;

export {onMessage, fake};