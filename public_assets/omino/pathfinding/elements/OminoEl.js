import {SelectableElement, ApplyData, Pass} from "/assets/omino/pathfinding/elements/Element.js";
import Node from "/assets/omino/pathfinding/Node.js";
import {stroke} from "/assets/omino/Colors.js";

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
	if(!currNodeView) return false;

	toReturn.add(currNodeView.node);

	for(const [key,val] of Object.entries(connTree)){
		//TODO: this just assumes the next node is the same type as this one
		if(!getNodes(currNodeView.get(parseInt(key)), val, nodes, toReturn)) return false;
	}

	return toReturn;
}

class OminoEl extends SelectableElement{
	constructor(connTree, root, orientation){
		super();
		this.connTree=connTree;
		this.root=root;
		this.orientation=orientation;

		this.nodes=[];

		//note: this assumes the omino is in a valid spot!! it will not check if it can it just does

		this.applyPasses=[new Pass(0,(nodes,env)=>{
			let allNodes=getNodes(this.getRoot(nodes).getView(this.orientation),this.connTree,nodes);

			this.nodes=[];
			for(const node of allNodes){
				this.nodes.push(node);
				node.detach();
			}
			return new ApplyData({removed:allNodes});
		})];
		this.renderPasses=[new Pass(0,(nodes,env)=>{
			let size=env.drawData.nodeSize;

			env.drawData.context.push();
			stroke("ominoColors.I", env.drawData.context);
			env.drawData.context.strokeWeight(size*0.8);
			for(const node of this.nodes){
				let pos = env.drawData.nodeToTexPos(node);

				for(const connected of Object.values(node.historicalConnections)){
					if(this.nodes.some(n=>n.id==connected.node.id) && connected.node.id>node.id){
						let otherPos=env.drawData.nodeToTexPos(connected.node);
						env.drawData.context.line(
							(pos.x/size+0.5)*size, (pos.y/size+0.5)*size,
							(otherPos.x/size+0.5)*size, (otherPos.y/size+0.5)*size);
					}
				}
			}
			env.drawData.context.pop();
			env.drawData.notifyTexture();
		})]
	}
	getRoot(nodes){
		return nodes[this.root];
	}
	
	isMyNode(id){
		return this.nodes.includes(id);
	}
	checkValid(root, nodes){
		if(!Object.values(nodes).find(n=>n.id==root)) return false;
		return !!getNodes(Object.values(nodes).find(n=>n.id==root).getView(this.orientation), 
			this.connTree, nodes);
	}

	isSelected(nodes,env,historicalNodes){
		if(env.mouse.clicked){
			let cellPos = env.mouse.pos.sub(env.container.getAbsolutePos())
				.scale(1/env.drawData.nodeSize)

			let node = Object.values(historicalNodes).find(n=>n.custom.pos.equals(cellPos.floor()));
	    	if(node&&this.nodes.some(n=>n.id==node.id)) return true;
	    }
	    return false;
	}
	tryPlace(nodes,env){
		if(env.mouse.clicked){
			let cellPos = env.mouse.pos.sub(env.container.getAbsolutePos())
				.scale(1/env.drawData.nodeSize).floor();

			this.root = Object.values(nodes).find(n=>n.custom.pos.equals(cellPos)).id;

			if(this.root!=undefined&&this.checkValid(this.root,nodes)) return true;
		}
		return false;
	}
}
OminoEl.factory = connTree=>(root, orientation)=>new OminoEl(connTree, root, orientation);

export default OminoEl;