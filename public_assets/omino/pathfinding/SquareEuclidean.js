import Vector from "/assets/omino/Vector.js";

export default {
	getAllTiles:board=>{
		let namedTiles={};
		for(let y=0;y<board.length;y++){
			for(let x=0;x<board[0].length;x++){
				if(!board[y][x]){
					let pos=new Vector(x,y);
					namedTiles[pos.toURLStr()]={pos};
				}
			}
		}

		for(const tile of Object.values(namedTiles)){
			tile.connections = [
				namedTiles[tile.pos.left().toURLStr()],
				namedTiles[tile.pos.right().toURLStr()],
				namedTiles[tile.pos.up().toURLStr()],
				namedTiles[tile.pos.down().toURLStr()],
			].filter(p=>p!==undefined);
		}

		return namedTiles;
	},
	isTileOnWall:tile=>tile.connections.length<4,
};