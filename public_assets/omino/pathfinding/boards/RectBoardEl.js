import {Element, ApplyData} from "/assets/omino/pathfinding/elements/Element.js";
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
			let leftView;
			for(let x=0;x<this.width;x++){
				let node = new Node(RectOrientation.default);
				node.custom.pos=new Vector(x,y);
				toReturn.add(node);

				let nodeView = node.getView(RectOrientation.default);
				if(x!=0){
					nodeView.connectNode(3,1,leftView.node);

					if(y!=0){
						nodeView.connectNode(0,2,leftView.get(0).getNode(1));
					}
				}else if(y!=0){
					nodeView.connectNode(0,2,currRowNode);
				}
				if(x==0) currRowNode=node;
				leftView=nodeView;
			}
		}

		return toReturn;
	}
}