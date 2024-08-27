import {ScrollableScene, OneTimeButtonScene} from "/assets/omino/scene/Scene.js";
import {Counter, CustomTextInputScene} from "/assets/omino/scene/OptionsScene.js";
import TickboxScene from "/assets/omino/scene/TickboxScene.js";
import Vector from "/assets/omino/Vector.js";
import Data from "/assets/omino-playground.js";

class PuzzleSettingsScene extends ScrollableScene{
	constructor(){
		super();

		this.hasStart = this.addScene(new TickboxScene(Data.mainBoard.startPoint!==undefined, s=>{
			Data.mainBoard.startPoint = s.value?new Vector(0,0):undefined;
		}));
		this.hasEnd = this.addScene(new TickboxScene(Data.mainBoard.endPoint!==undefined, s=>{
			Data.mainBoard.endPoint = s.value?new Vector(Data.mainBoard.width-1, Data.mainBoard.height-1):undefined;
		}));

		// this.hasLimitedPieces = this.addScene(new TickboxScene(false,s=>{
		// 	this.pieceEditor.isActive=s.value;
		// }));
		// this.pieceEditor = this.addScene(new OneTimeButtonScene(s=>{
		// 	if(!s.isActive) return;
		// 	return;

		// 	p5.fill(s.isIn()?255:200);
		// 	p5.rect(0,0,s.dims.x,s.dims.y);
		// 	p5.textSize(this.dims.x/100*6);
		// 	p5.fill(0);
		// 	p5.textAlign(p5.CENTER, p5.CENTER);
		// 	p5.text("Edit Pieces", s.dims.x/2,s.dims.y/2);
		// },s=>{
		// 	if(!s.isActive) return;
		// 	//change scene
		// },s=>{
		// 	s.isActive=this.hasLimitedPieces.value;
		// }));

		this.dontScroll=[];
	}
	render(){
	    p5.fill(50);
	    p5.rect(0,0,this.dims.x,p5.height);

	    let sc = this.dims.x/100;

	    p5.fill(255);
	    p5.textSize(6*sc);
	    p5.textAlign(p5.LEFT, p5.TOP);
	    p5.text("Has start: ", 2, this.hasStart.getAbsolutePos().y);
	    p5.text("Has end: ", 2, this.hasEnd.getAbsolutePos().y);
	    //p5.text("Has limited pieces: ", 2, this.hasLimitedPieces.getAbsolutePos().y);

	    super.render();
	}
	scrolled(x,y,delta){
		delta*=this.dims.x/100*0.3;

		let oldOffs=this.offs;
		if(!super.scrolled(x,y,delta)) return false;
		if(this.offs<0){
		for(const child of this.subScenes) if(!this.dontScroll.includes(child)) child.pos.y+=oldOffs;
			this.offs=0;
			return true;
		}

		for(const child of this.subScenes) if(!this.dontScroll.includes(child)) child.pos.y-=delta;

		return true;
	}
	setXAndWidth(x,width){
		this.pos.x=x;
		this.dims.y=p5.height;
		this.dims.x=width;
	}
	resized(old,n){
		this.dims.y=p5.height;
		this.dims.x=p5.width/4;

		let scale = this.dims.x/100;
    	const padding=scale*3;
		let currY=padding;

		this.hasStart.dims = new Vector(p5.textSize()*1.3, p5.textSize()*1.3);
	    this.hasStart.pos = new Vector(p5.textWidth("nHas start:")+padding, 2*scale+currY-this.offs);
	    currY+=2*scale+this.hasStart.dims.y;

		this.hasEnd.dims = new Vector(p5.textSize()*1.3, p5.textSize()*1.3);
	    this.hasEnd.pos = new Vector(p5.textWidth("nHas end:")+padding, 2*scale+currY-this.offs);
	    currY+=2*scale+this.hasEnd.dims.y;

		// this.hasLimitedPieces.dims = new Vector(p5.textSize()*1.3, p5.textSize()*1.3);
	    // this.hasLimitedPieces.pos = new Vector(p5.textWidth("nHas limited pieces:")+padding, 2*scale+currY-this.offs);
	    // currY+=2*scale+this.hasLimitedPieces.dims.y;

	    // this.pieceEditor.dims = new Vector(p5.textWidth("mmEdit Pieces"), p5.textSize()*1.3);
	    // this.pieceEditor.pos = new Vector(padding, 2*scale+currY-this.offs);
	    // currY+=2*scale+this.pieceEditor.dims.y;

		super.resized(old,n);
	}
}

export default PuzzleSettingsScene;