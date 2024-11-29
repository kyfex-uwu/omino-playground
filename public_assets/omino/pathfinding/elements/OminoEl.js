import {Element, ApplyData} from "/assets/omino/pathfinding/elements/Element.js";
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
		this.disableNodes(this.root.getView(), this.connTree, removed, nodes);
		return new ApplyData({removed});
	}
	disableNodes(currNodeView, connTree, removedSet, nodes){
		removedSet.add(currNodeView.node);

		for(const [key,val] of Object.entries(connTree)){
			//TODO: this just assumes the next node is the same type as this one
			this.disableNodes(currNodeView.get(parseInt(key)), val, removedSet, nodes);
		}

		currNodeView.detach();
	}
}
OminoEl.factory = connTree=>(root, orientation)=>new OminoEl(connTree, root, orientation);

export default OminoEl;