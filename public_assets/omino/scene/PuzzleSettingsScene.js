import {ScrollableScene, DimsScene, OneTimeButtonScene, isKindaMobile} from "/assets/omino/scene/Scene.js";
import {Counter, CustomTextInputScene} from "/assets/omino/scene/OptionsScene.js";
import TickboxScene from "/assets/omino/scene/TickboxScene.js";
import Vector from "/assets/omino/Vector.js";
import Data from "/assets/omino/Main.js";
import {fill} from "/assets/omino/Colors.js";
import {OptionsElement} from "/assets/omino/scene/OptionsHolder.js";
import {CustomOptionsHolder, withLabel} from "/assets/omino/scene/OptionsScene.js";

class PuzzleSettingsScene extends DimsScene{
	constructor(){
		super();

		this.options = this.addScene(new CustomOptionsHolder());

		this.hasStart = new TickboxScene(Data.mainBoard.startPoint!==undefined, s=>{
			Data.mainBoard.startPoint = s.value?new Vector(0,0):undefined;
		});
		this.hasEnd = new TickboxScene(Data.mainBoard.endPoint!==undefined, s=>{
			Data.mainBoard.endPoint = s.value?new Vector(Data.mainBoard.width-1, Data.mainBoard.height-1):undefined;
		});
		this.options.addScene(withLabel("Has start:", this.hasStart, (s,w,h)=>s.element.dims = new Vector(h,h)));
		this.options.addScene(withLabel("Has end:", this.hasEnd, (s,w,h)=>s.element.dims = new Vector(h,h)));

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
	}
	getScale(){
		let scale = this.dims.x/100;
		if(isKindaMobile) scale*=1.5;
		return scale;
	}

	render(){
	    fill("scenes.sidebar.bg");
	    p5.rect(0,0,this.dims.x,p5.height);
	    // p5.text("If you need/want the ability to make puzzles with "+
	    // 	"a limited/custom palette, pls dm me because otherwise "+
	    // 	"i have lost the motivation to work on it lol "+
	    // 	"(if you dm me i will make it)", 2, this.hasEnd.getAbsolutePos().y*1.8, this.dims.x);
	    //p5.text("Has limited pieces: ", 2, this.hasLimitedPieces.getAbsolutePos().y);

	    super.render();
	}
	resized(old,n){
		this.dims.y=n.y;
		this.dims.x=n.x/4;
		this.pos.x=n.x*3/4;

		this.options.pos = new Vector(0,n.x*0.01);
		this.options.dims = this.dims.sub(this.options.pos.scale(2));

		super.resized(old,n);
	}
}

export default PuzzleSettingsScene;