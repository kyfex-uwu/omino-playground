import SquareTorus from "/assets/omino/pathfinding/SquareTorus.js";

export default {
	getAllTiles:board=>{
		let toReturn = SquareTorus.getAllTiles(board);

		let width=board[0].length;
		let height=board.length;
		for(const tile of Object.values(toReturn)){
			tile.connections=tile.connections.concat([
				tile.pos.x!=0?undefined:toReturn[new Vector(width-1, tile.pos.y).toURLStr()],
				(tile.pos.x!=width-1)?undefined:toReturn[new Vector(0, tile.pos.y).toURLStr()],
				tile.pos.y!=0?undefined:toReturn[new Vector(tile.pos.x, height-1).toURLStr()],
				(tile.pos.y!=height-1)?undefined:toReturn[new Vector(tile.pos.x, 0).toURLStr()],
			].filter(p=>p!==undefined));
		}

		return toReturn;
	}
}