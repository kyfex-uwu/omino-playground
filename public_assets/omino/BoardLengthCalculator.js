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

	let tiles=[];
	for(let y=0;y<height;y++){
		for(let x=0;x<width;x++){
			if(!board[y][x]) tiles.push({pos:new Vector(x, y)});
		}
	}
	for(const tile of tiles){
    tile.left=tiles.find(t=>tile.pos.left().equals(t.pos));
    tile.right=tiles.find(t=>tile.pos.right().equals(t.pos));
    tile.up=tiles.find(t=>tile.pos.up().equals(t.pos));
    tile.down=tiles.find(t=>tile.pos.down().equals(t.pos));

    if(data.torusMode){
    	if(tile.pos.x==0) tile.left = tiles.find(d=>new Vector(width-1, tile.pos.y).equals(d.pos));
    	else if(tile.pos.x==width-1) tile.right = tiles.find(d=>new Vector(0, tile.pos.y).equals(d.pos));
    	if(tile.pos.y==0) tile.up = tiles.find(d=>new Vector(tile.pos.x, height-1).equals(d.pos));
    	else if(tile.pos.y==height-1) tile.down = tiles.find(d=>new Vector(tile.pos.x, 0).equals(d.pos));
    }
	}

	let remainingTiles=new Set(tiles);
	let pools=[];
	for(;;){
		if(remainingTiles.size==0) break;

		let pool = getConnected(remainingTiles.values().next().value);
		for(const tile of pool) remainingTiles.delete(tile);
		pools.push(pool);
	}

	let maybePaths=[];
	for(let pool of pools){
	  for(const tile of pool){
	    tile.left=pool.find(d=>tile.pos.left().equals(d.pos));
	    tile.right=pool.find(d=>tile.pos.right().equals(d.pos));
	    tile.up=pool.find(d=>tile.pos.up().equals(d.pos));
	    tile.down=pool.find(d=>tile.pos.down().equals(d.pos));

	    if(data.torusMode){
	    	if(tile.pos.x==0) tile.left = pool.find(d=>new Vector(width-1, tile.pos.y).equals(d.pos));
	    	else if(tile.pos.x==width-1) tile.right = pool.find(d=>new Vector(0, tile.pos.y).equals(d.pos));
	    	if(tile.pos.y==0) tile.up = pool.find(d=>new Vector(tile.pos.x, height-1).equals(d.pos));
	    	else if(tile.pos.y==height-1) tile.down = pool.find(d=>new Vector(tile.pos.x, 0).equals(d.pos));
	    }
	  }

	  let maybePath = findLongestShortest(pool[0], pool, maybePaths);

	  for(let y=0;y<board.length;y++){
	    for(let x=0;x<board[y].length;x++){
	      let pos = new Vector(x,y);
	      if(!pool.some(p=>p.pos.equals(pos))||
	        maybePath.some(p=>p.pos.equals(pos))) continue;

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