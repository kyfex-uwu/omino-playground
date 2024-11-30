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

	    let currNodeId=0;
	    for(const node of toReturn.added) node.id=currNodeId++;

		return toReturn;
	}

	prerender(nodes, env){

	}
	render(nodes, env){
		p5.fill(255);
		let scale = Math.min(env.container.dims.x/this.width,env.container.dims.y/this.height);
		for(let y=0;y<this.width;y++){
			for(let x=0;x<this.width;x++){
				p5.rect((x+0.1)*scale, (y+0.1)*scale, scale*0.8, scale*0.8);
			}
		}
	}
}