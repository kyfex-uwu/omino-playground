import {Element, Pass, ApplyData} from "/assets/omino/pathfinding/elements/Element.js";
import Node from "/assets/omino/pathfinding/Node.js";
import RectOrientation from "/assets/omino/pathfinding/orientation/RectOrientation.js";
import Vector from "/assets/omino/Vector.js";
import {fill} from "/assets/omino/Colors.js";

//  0
// 3 1
//  2

export default class RectBoardEl extends Element{
	constructor(width, height){
		super();
		this.width=width;
		this.height=height;

		this.applyPasses = [
			new Pass(-1000,(nodes,env)=>{
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
			}),
		];

		this.renderPasses = [
			new Pass(-1000,(nodes,env)=>{//initializes the board area
				this.renderScale = Math.min(env.container.dims.x/this.width,env.container.dims.y/this.height);

				Object.assign(env.drawData,{
					nodeToTexPos: n=>this.getNodePos(n,this.renderScale),
					nodeSize: this.renderScale,
				});
			}),

			new Pass(1000,(nodes,env)=>{
				fill("board.grid");
				let size=env.drawData.nodeSize;
				for(const node of nodes.values()){
					let pos = env.drawData.nodeToTexPos(node);
					p5.rect((pos.x/size+0.1)*size, (pos.y/size+0.1)*size, 
						size*0.8, size*0.8,size*0.1);
				}
			})
		];
	}

	getNodePos(n,scale){ return n.custom.pos.scale(scale); }
}