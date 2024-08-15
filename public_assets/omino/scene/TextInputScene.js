import {DimsScene, focus} from "/assets/omino/scene/Scene.js";

class TextInputScene extends DimsScene{
	constructor(pos, dims, validator=/./){
		super();
		this.pos=pos;
		this.dims=dims;
		this.validator=validator;
		this.value="";
	}
	mouseDown(x,y){
		if(this.isIn()){
			focus(this);
			return true;
		}

		return super.mouseDown(x,y);
	}

  	keyPressed(key){
  		if(!this.focused) return super.keyPressed(key);

  		switch(key){
  		case "Backspace":
  			this.value=this.value.slice(0,-1);
  			break;
  		default:
  			if(key.length>1) break;

  			if(this.validator.test(key)) this.value+=key;
  			break;
  		}
    
    	return true;
	}

	render(){
		p5.fill(255);
		p5.rect(0,0,this.dims.x,this.dims.y);
		p5.fill(0);
		p5.textSize(this.dims.y*0.8);
		p5.textAlign(p5.LEFT, p5.TOP);
		p5.text(this.value, 2, 2);
		if(this.focused&&p5.frameCount*0.015%1>0.5) p5.rect(p5.textWidth(this.value)+2, 2, 2, this.dims.y-4);

		super.render();
	}
}

export default TextInputScene;