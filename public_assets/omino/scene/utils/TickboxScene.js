import {DimsScene, focus} from "/assets/omino/scene/Scene.js";
import {fill, stroke} from "/assets/omino/Colors.js";

class TickboxScene extends DimsScene{
	constructor({value=false, requiresApply=false}={}){
		super();
		this.value=value;
		this.newValue=value;
		this.requiresApply=requiresApply;

		this.listeners=[];
	}
	addListener(listener){ this.listeners.push(listener); return this; }
	apply(){
		this.value=this.newValue;

		for(const listener of this.listeners) listener(this.value);
		return true;
	}
	mouseUp(x,y){
		if(this.isIn()){
			focus(this);
			this.newValue=!this.newValue;
			if(!this.requiresApply) this.apply();
			return true;
		}

		return super.mouseUp(x,y);
	}

	render(){
		fill(this.value==this.newValue?"scenes.util.tickbox.bg":"scenes.util.tickbox.bgUnsaved");
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