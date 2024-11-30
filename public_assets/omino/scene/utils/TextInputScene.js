import {DimsScene, focus} from "/assets/omino/scene/Scene.js";
import {fill} from "/assets/omino/Colors.js";
import MobileKeyboard from "/assets/omino/scene/utils/MobileKeyboard.js";

const defaultValidator=/^.*$/;
class TextInputScene extends DimsScene{
	constructor({validator=defaultValidator, requiresApply=false, value=""}={}){
		super();
		this.validator=validator;
		this.requiresApply=requiresApply;
		this.value=value;
		this.newValue=value;

		this.listeners=[];
	}
	addListener(listener){ this.listeners.push(listener); return this; }
	mouseUp(x,y){
		if(super.mouseUp(x,y)) return true;
		if(this.isIn()){
			focus(this);

			if(isKindaMobile&&!this.keyboard){
				this.keyboard=this.addScene(new MobileKeyboard([
					[1,2,3],[4,5,6],[7,8,9],[",",0,"Backspace"]
				])).addListener(key=>this.keyPressed(key));
			}

			return true;
		}else if(this.keyboard){
			if(this.keyboard) this.keyboard.remove();
			this.keyboard=undefined;
			return true;
	    }

		return super.mouseUp(x,y);
	}

	apply(){
		if(this.validator.test(this.newValue))
			this.value=this.newValue;

			for(const listener of this.listeners) listener(this.value);
			return true;
		return false;
	}
  	keyPressed(key){
  		if(!this.focused) return super.keyPressed(key);

  		switch(key){
  		case "Backspace":
  			this.newValue=this.newValue.slice(0,-1);
  			break;
  		default:
  			if(key.length>1) break;

  			this.newValue+=key;
  			break;
  		}
    
    	if(!this.requiresApply) this.apply();
    	return true;
	}

	render(){
		if(this.isIn()) p5.cursor(p5.TEXT);

		fill("scenes.util.textInput.bg");
		if(this.newValue!=this.value) fill("scenes.util.textInput.bgUnsaved");
		if(this.validator.test(this.newValue)) fill("scenes.util.textInput.invalid");
		p5.rect(0,0,this.dims.x,this.dims.y);
		fill("scenes.util.textbox.color");
		p5.textSize(this.dims.y*0.8);
		p5.textAlign(p5.LEFT, p5.TOP);
		p5.text(this.newValue, 2, 2);
		if(this.focused&&p5.frameCount*0.015%1>0.5) p5.rect(p5.textWidth(this.newValue)+2, 2, 2, this.dims.y-4);

		super.render();
	}
}

export default TextInputScene;