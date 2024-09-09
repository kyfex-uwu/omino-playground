import {DimsScene, focus} from "/assets/omino/scene/Scene.js";
import {fill} from "/assets/omino/Colors.js";

class TextInputScene extends DimsScene{
	constructor(){
		super();
		this.value="";
	}
	mouseUp(x,y){
		if(this.isIn()){
			focus(this);
			return true;
		}

		return super.mouseUp(x,y);
	}

  	keyPressed(key){
  		if(!this.focused) return super.keyPressed(key);

  		switch(key){
  		case "Backspace":
  			this.value=this.value.slice(0,-1);
  			break;
  		default:
  			if(key.length>1) break;

  			this.value+=key;
  			break;
  		}
    
    	return true;
	}

	render(){
		if(this.isIn()) p5.cursor(p5.TEXT);

		fill("scenes.util.textbox.bg");
		p5.rect(0,0,this.dims.x,this.dims.y);
		fill("scenes.util.textbox.color");
		p5.textSize(this.dims.y*0.8);
		p5.textAlign(p5.LEFT, p5.TOP);
		p5.text(this.value, 2, 2);
		if(this.focused&&p5.frameCount*0.015%1>0.5) p5.rect(p5.textWidth(this.value)+2, 2, 2, this.dims.y-4);

		super.render();
	}
}

export default TextInputScene;