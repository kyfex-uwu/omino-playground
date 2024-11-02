import {Element, ApplyData} from "/assets/omino/pathfinding/Element.js";
import Node from "/assets/omino/pathfinding/Node.js";
import RectOrientation from "/assets/omino/pathfinding/orientation/RectOrientation.js";
import Vector from "/assets/omino/Vector.js";

//  0
// 3 1
//  2

export default class RectBoardEl extends Element{
	constructor(width, height){
		super();
		this.width=width;
		this.height=height;
	}
	apply(nodes){
		const toReturn=new ApplyData();

		let currRowNode;
		for(let y=0;y<this.height;y++){
			let leftNode;
			for(let x=0;x<this.width;x++){
				let node = new Node(RectOrientation.default.clone());
				node.custom.pos=new Vector(x,y);
				toReturn.add(node);

				if(x!=0){
					node.connect(3,1,leftNode);

					if(y!=0){
						let upNode = leftNode.getNode(0).getNode(1);
						node.connect(0,2,upNode);
					}
				}else if(y!=0){
					node.connect(0,2,currRowNode);
				}
				if(x==0) currRowNode=node;
				leftNode=node;
			}
		}

		return toReturn;
	}
}