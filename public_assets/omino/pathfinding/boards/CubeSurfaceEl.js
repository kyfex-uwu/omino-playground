import {Element, ApplyData} from "/assets/omino/pathfinding/elements/Element.js";
import Node from "/assets/omino/pathfinding/Node.js";
import RectOrientation from "/assets/omino/pathfinding/orientation/RectOrientation.js";
import Vector from "/assets/omino/Vector.js";
import events from "/assets/omino/Events.js";
import {background} from "/assets/omino/Colors.js";

let canv3d;
let cubeNet;
let cubeModel;
events.loaded.on(_=>{
	canv3d=p5.createGraphics(400,400, p5.WEBGL);
	canv3d.noStroke();
	cubeNet=p5.createGraphics(400,600);
	cubeNet.noStroke();
	cubeModel = p5.loadModel("/assets/omino/resources/cube.obj");
});

const faceOffsets=[
	[0,0],
	[0,1],
	[0,2],
	[1,0],
	[1,1],
	[1,2]
];
export default class CubeSurfaceEl extends Element{
	constructor(size){
		super();
		this.size=size;

		this.renderOrder=9999;
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

		let currNodeId=0;
	    for(const node of toReturn.added) node.id=currNodeId++;

		return toReturn;
	}

	prerender(nodes, env){
		canv3d.width=env.container.dims.x;
		canv3d.height=env.container.dims.y;

		let unit=Math.min(env.container.dims.x,env.container.dims.y);
		//cubeNet = p5.createGraphics(unit*2,unit*3);
	}
	render(nodes, env){
		let scale2=cubeNet.width/this.size/2;
		background("bg",cubeNet)
		for(let i=0;i<faceOffsets.length;i++){
			cubeNet.push();
			cubeNet.textSize(scale2*0.8/2);
			cubeNet.translate(faceOffsets[i][0]*scale2*this.size,faceOffsets[i][1]*scale2*this.size);
			for(let y=0;y<this.size;y++){
				for(let x=0;x<this.size;x++){
					let node = [...nodes].find(n=>n.custom.face==i&&n.custom.pos.equals(new Vector(x,y)));

					if(env.board.path.includes(node.id)) cubeNet.fill(255,0,0);
					else cubeNet.fill(255);
					cubeNet.rect((x+0.1)*scale2, (y+0.1)*scale2, scale2*0.8, scale2*0.8);
					cubeNet.fill(0);
					cubeNet.text(node.id, (x+0.1)*scale2, (y+0.5)*scale2);
				}
			}
			cubeNet.pop();
		}
		canv3d.texture(cubeNet);

		let scale = Math.sqrt(Math.min(env.container.dims.x/this.size,env.container.dims.y/this.size)**2/3);

		canv3d.clear();
		canv3d.push();
		canv3d.rotateX(p5.frameCount*0.01);
		canv3d.rotateZ(p5.frameCount*0.01);
		canv3d.scale(100)
		canv3d.model(cubeModel);
		canv3d.pop();

		p5.image(canv3d, 0,0);
	}
}