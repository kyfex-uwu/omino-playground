import Vector from "/assets/omino/Vector.js";

//visualise these as a grid of squares, where each square is split into 2 right triangles
export default {
	getAllTiles:board=>{
		let namedTiles={};
		for(let y=0;y<board.length;y++){
			for(let x=0;x<board[y].length;x++){
				if(!board[y][x]){
					let pos=new Vector(x,y);
					if(x%2==1) pos.upper=true;
					namedTiles[pos.toURLStr()+pos.upper?"b":"a"]={pos};
				}
			}
		}

		for(const tile of Object.values(namedTiles)){
			if(tile.pos.upper){
				tile.connections=[
					namedTiles[tile.pos.toURLStr()+"a"],
					namedTiles[tile.pos.right().toURLStr()+"a"],
					namedTiles[tile.pos.up().toURLStr()+"a"]
				];
			}else{
				tile.connections=[
					namedTiles[tile.pos.left().toURLStr()+"b"],
					namedTiles[tile.pos.toURLStr()+"b"],
					namedTiles[tile.pos.down().toURLStr()+"b"]
				];
			}
			tile.connections=tile.connections.filter(p=>p!==undefined);
		}

		return namedTiles;
	},
	isTileOnWall:tile=>tile.connections.length<3,
};