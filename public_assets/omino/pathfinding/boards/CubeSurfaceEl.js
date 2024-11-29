import {Element, ApplyData} from "/assets/omino/pathfinding/Element.js";
import Node from "/assets/omino/pathfinding/Node.js";
import RectOrientation from "/assets/omino/pathfinding/orientation/RectOrientation.js";
import Vector from "/assets/omino/Vector.js";

export default class CubeSurfaceEl extends Element{
	constructor(size){
		super();
		this.size=size;
	}
	apply(nodes){
		const toReturn=new ApplyData();

		let faces=[];

		for(let i=0;i<6;i++){
			let currRowView;
			faces[i]=[];
			for(let y=0;y<this.size;y++){
				faces[i][y]=[];
				let leftView;
				for(let x=0;x<this.size;x++){
					let node = new Node(RectOrientation.default);
					const view = node.getView();
					toReturn.add(node);
					faces[i][y][x]=view;
					node.custom.pos=new Vector(x,y);
					node.custom.face=i;

					if(x!=0){
						view.connectNode(3,1,leftView.node);

						if(y!=0){
							view.connectNode(0,2,leftView.get(0).getNode(1));
						}
					}else if(y!=0){
						view.connectNode(0,2,currRowView.node);
					}
					if(x==0) currRowView=view;
					leftView=view;
				}
			}
		}

		for(let i=0;i<this.size;i++){
			faces[4][0][i].connectNodeFromView(0,3,faces[1][i][0]);
			faces[4][i][0].connectNodeFromView(3,3,faces[0][this.size-1-i][0]);
			faces[4][this.size-1][this.size-1-i].connectNodeFromView(2,3,faces[3][i][0]);
			faces[4][i][this.size-1].connectNodeFromView(1,3,faces[2][i][0]);

			faces[5][0][i].connectNodeFromView(0,1,faces[1][this.size-1-i][this.size-1]);
			faces[5][i][this.size-1].connectNodeFromView(1,1,faces[0][this.size-1-i][this.size-1]);
			faces[5][this.size-1][this.size-1-i].connectNodeFromView(2,1,faces[3][i][this.size-1]);
			faces[5][i][0].connectNodeFromView(3,1,faces[2][i][this.size-1]);

			faces[0][0][i].connectNodeFromView(0,2,faces[3][this.size-1][i]);
			faces[1][0][i].connectNodeFromView(0,2,faces[0][this.size-1][i]);
			faces[2][0][i].connectNodeFromView(0,2,faces[1][this.size-1][i]);
			faces[3][0][i].connectNodeFromView(0,2,faces[2][this.size-1][i]);
		}

		return toReturn;
	}
}