import {DimsScene, focus} from "/assets/omino/scene/Scene.js";

class TickboxScene extends DimsScene{
	constructor(value=false, callback=_=>0){
		super();
		this.value=value;
		this.callback=callback;
	}
	mouseDown(x,y){
		if(this.isIn()){
			focus(this);
			this.value=!this.value;
			this.callback(this);
			return true;
		}

		return super.mouseDown(x,y);
	}

	render(){
		p5.fill(255);
		p5.rect(0,0,this.dims.x,this.dims.y);
		if(this.value){
			p5.stroke(0);
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