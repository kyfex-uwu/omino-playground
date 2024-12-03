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

function getNodes(currNodeView, connTree, nodes, toReturn=new Set()){
	toReturn.add(currNodeView.node);

	for(const [key,val] of Object.entries(connTree)){
		//TODO: this just assumes the next node is the same type as this one
		getNodes(currNodeView.get(parseInt(key)), val, nodes, toReturn);
	}

	return toReturn;
}

class OminoEl extends Element{
	constructor(connTree, root, orientation){
		super();
		this.connTree=connTree;
		this.root=root;
		this.orientation=orientation;

		this.positions=[];

		//note: this assumes the omino is in a valid spot!! it will not check if it can it just does
	}
	getRoot(nodes){
		return [...nodes].find(n=>n.id==this.root);
	}
	apply(nodes, env){
		let allNodes=getNodes(this.getRoot(nodes).getView(this.orientation),this.connTree,nodes);
		this.positions=[];
		for(const node of allNodes){
			this.positions.push(env.drawData.getNodePos(node));
			node.detach();
		}
		return new ApplyData({removed:allNodes});
	}
	prerender(nodes, env){}
	render(nodes,env){
		for(const pos of this.positions){
			env.drawData.canvas.fill(255,0,0);
			env.drawData.canvas.rect(pos.x,pos.y,env.drawData.scale,env.drawData.scale);
		}
		env.drawData.notifyTexture();
	}
	
}
OminoEl.factory = connTree=>(root, orientation)=>new OminoEl(connTree, root, orientation);

export default OminoEl;