import {Element, ApplyData} from "/assets/omino/pathfinding/Element.js";
import Node from "/assets/omino/pathfinding/Node.js";

/**
 *  ##
 * ##
 *  #
 * 
 * starting at bottom:
 * {
 * 	 0:{
 *     0:{
 * 		 1:{}
 * 	   }, 
 * 	   3:{}
 *   }
 * }
 * 
 * start at some root
 * 
 */

class OminoEl extends Element{
	constructor(connTree, root, orientation){
		super();
		this.connTree=connTree;
		this.root=root;
		this.orientation=orientation;

		//note: this assumes the omino is in a valid spot!! it will not check if it can it just does
	}
	apply(nodes){
		let removed = new Set();
		this.disableNodes(this.root, this.connTree, removed,nodes);
		return new ApplyData({removed});
	}
	disableNodes(currNode, connTree, removedSet,nodes){
		removedSet.add(currNode);

		for(const [key,val] of Object.entries(connTree)){
			this.disableNodes(
				currNode.getNode(this.orientation.apply(currNode.orientation, parseInt(key))),
				val, removedSet,nodes);
		}

		currNode.detach();
	}
}
OminoEl.factory = connTree=>(root, orientation)=>new OminoEl(connTree, root, orientation);

export default OminoEl;