import {Element, ApplyData} from "/assets/omino/pathfinding/elements/Element.js";
import Node from "/assets/omino/pathfinding/Node.js";
import RectOrientation from "/assets/omino/pathfinding/orientation/RectOrientation.js";
import Vector from "/assets/omino/Vector.js";
import events from "/assets/omino/Events.js";
import {fill, background} from "/assets/omino/Colors.js";

import * as THREE from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";

import OminoEl from "/assets/omino/pathfinding/elements/OminoEl.js";

const raycaster = new THREE.Raycaster();

const dist=4;
const mouseSens=0.01;
const faceOffsets=[
	new Vector(1,0),
	new Vector(1,1),
	new Vector(1,2),
	new Vector(0,1),
	new Vector(0,2),
	new Vector(0,0)
];
function getOffs(normal,point){
	let toReturn;
	if(Math.round(normal.z)==-1){
		toReturn= [5,new Vector(point.y,-point.x)];
	}else if(Math.round(normal.z)==1){
		toReturn= [4,new Vector(-point.y,-point.x)];
	}else if(Math.round(normal.y)==-1){
		toReturn= [2,new Vector(-point.z,-point.x)];
	}else if(Math.round(normal.y)==1){
		toReturn= [0,new Vector(-point.z,point.x)];
	}else if(Math.round(normal.x)==-1){
		toReturn= [3,new Vector(-point.z,point.y)];
	}else{
		toReturn= [1,new Vector(-point.z,-point.y)];
	}

	toReturn[1]=toReturn[1].scale(0.5).add(new Vector(0.5,0.5));
	return toReturn;
}
export default class CubeSurfaceEl extends Element{
	constructor(size){
		super();
		this.size=size;

		this.renderOrder=9999;

		this.threeScene = new THREE.Scene();
		this.threeCamera = new THREE.PerspectiveCamera(60, 1/1, 0.1, 1000);
		this.threeRenderer = new THREE.WebGLRenderer({ alpha:true });
		this.threeRenderer.setSize( 600,600 );
		this.cubeNet=p5.createGraphics(400,600);
		this.cubeNet.textSize(200/this.size*0.7);
		this.cubeNet.textAlign(p5.CENTER,p5.CENTER);
		this.cubeNet.noStroke();
		this.material = new THREE.MeshBasicMaterial({
			map:new THREE.CanvasTexture(this.cubeNet.elt),
			transparent:true
		});
		new OBJLoader().load("/assets/omino/resources/cube.obj",
			scene=>{
				this.threeScene.add(new THREE.Mesh(scene.children[0].geometry, this.material));
			});
		this.canv3d=p5.createGraphics(600,600,p5.WEBGL, this.threeRenderer.domElement);

		this.pos = Math.PI/4;
		this.height=Math.PI/6;
		this.scale=this.cubeNet.width/this.size/2;

		this.drawData={
			getNodePos:n=>this.getNodePos(n),
			canvas:this.cubeNet,
			scale:this.scale,
			notifyTexture:_=>{
				this.material.map.needsUpdate=true;
			},
		};
	}
	apply(nodes,env){
		env.drawData=this.drawData;

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
			faces[5][this.size-1][i].connectNodeFromView(2,1,faces[3][i][this.size-1]);
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

	getNodePos(node){
		return faceOffsets[node.custom.face].scale(this.size).add(node.custom.pos).scale(this.scale);
	}
	clickPos(){}//todo

	prerender(nodes, env){
		if(env.dragging){
			this.pos=(this.pos-env.dragging.delta.x*mouseSens)%(Math.PI*2);
			this.height=Math.min(Math.PI,Math.max(0.001,this.height-env.dragging.delta.y*mouseSens));
		}

		let unit=Math.max(1,Math.min(env.container.dims.x,env.container.dims.y));
		//cubeNet = p5.createGraphics(unit*2,unit*3);

		env.drawData=this.drawData;

		this.cubeNet.clear();
		this.threeRenderer.setSize(unit,unit);
	}
	render(nodes, env){
		let height=Math.cos(this.height);
		let invHeight=Math.sin(this.height)
		this.threeCamera.position.fromArray([Math.sin(this.pos)*dist*invHeight,height*dist,Math.cos(this.pos)*dist*invHeight]);
		this.threeCamera.lookAt(0,0,0);

		this.material.map.needsUpdate=true;
		for(let i=0;i<faceOffsets.length;i++){
			this.cubeNet.push();
			this.cubeNet.translate(faceOffsets[i].x*this.scale*this.size,faceOffsets[i].y*this.scale*this.size);
			for(let y=0;y<this.size;y++){
				for(let x=0;x<this.size;x++){
					let node = [...nodes].find(n=>n.custom.face==i&&n.custom.pos.equals(new Vector(x,y)));
					if(!node) continue;

					this.cubeNet.fill(255);
					this.cubeNet.rect((x+0.1)*this.scale, (y+0.1)*this.scale, this.scale*0.8, this.scale*0.8);
					let index=env.board.path.indexOf(node.id);
					if(index!=-1){
						this.cubeNet.fill(0);
						this.cubeNet.text(index+1,(x+0.5)*this.scale,(y+0.5)*this.scale);
					}
				}
			}
			this.cubeNet.pop();
		}

		let absolutePos=env.container.getAbsolutePos();
		raycaster.setFromCamera(new THREE.Vector2(
				(p5.mouseX-absolutePos.x)/this.threeRenderer.domElement.width*2-1,
				-(p5.mouseY-absolutePos.y)/this.threeRenderer.domElement.height*2+1
			), this.threeCamera);
		const hit = raycaster.intersectObjects(this.threeScene.children)[0];
		if(env.clicked){
			if(hit){
				const posData=getOffs(hit.normal,hit.point);
				posData[1]=posData[1].scale(this.size).floor();
				let node = posData[0]*this.size*this.size+posData[1].y*this.size+posData[1].x;
				
				if(env.cursor.heldElement){
					if(env.cursor.heldElement instanceof OminoEl && env.cursor.heldElement.checkValid(node, nodes)){
						env.cursor.heldElement.root = node;
						env.board.add(env.cursor.heldElement);
						env.cursor.heldElement=undefined;
					}
				}else{
					for(const element of env.elements){
						if(element instanceof OminoEl && element.isMyNode(node)){
							env.cursor.heldElement = element;
							env.board.remove(element);
						}
					}
				}
			}
		}

		if(env.cursor.heldElement){

		}

		this.threeRenderer.render(this.threeScene, this.threeCamera);
		p5.image(this.canv3d, 0,0, this.threeRenderer.domElement.width, this.threeRenderer.domElement.height);
	}
}