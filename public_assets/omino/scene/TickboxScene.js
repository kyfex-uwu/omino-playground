import {DimsScene, focus} from "/assets/omino/scene/Scene.js";
import {fill, stroke} from "/assets/omino/Colors.js";

class TickboxScene extends DimsScene{
	constructor(value=false, callback=_=>0){
		super();
		this.value=value;
		this.callback=callback;
	}
	mouseUp(x,y){
		if(this.isIn()){
			focus(this);
			this.value=!this.value;
			this.callback(this);
			return true;
		}

		return super.mouseUp(x,y);
	}

	render(){
		fill("scenes.util.tickbox.bg");
		p5.rect(0,0,this.dims.x,this.dims.y);
		if(this.value){
			stroke("scenes.util.tickbox.color");
			p5.scale((this.dims.x+this.dims.y)*0.05);
			p5.strokeWeight(2);
			p5.line(2,2,8,8);
			p5.line(2,8,8,2);
			p5.noStroke();
		}

		super.render();
	}
}

export default TickboxScene;